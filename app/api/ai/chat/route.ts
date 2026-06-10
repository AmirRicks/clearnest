import { NextRequest } from "next/server";
import { streamAIResponse, getAIConfig, type ChatMessage } from "@/lib/ai/config";
import { buildSystemPrompt, classifyIntent } from "@/lib/ai/system-prompt";
import {
  createConversation,
  saveMessage,
  incrementMessageCount,
  updateConversation,
  createLeadFromAI,
  createBookingRequest,
  createSupportTicket,
  createRefundRequest,
  checkAvailability,
} from "@/lib/ai/actions";
import { sendLeadNotification, sendEscalationNotification } from "@/lib/email";
import { denverDateStr, dayOfWeekForDateStr, nextDateStr } from "@/lib/availability";

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

type ToolType =
  | "check_availability"
  | "create_lead"
  | "create_booking_request"
  | "create_ticket"
  | "create_refund_request";

type ToolCall = { type: ToolType; args: Record<string, unknown> };

const KNOWN_TOOLS: ToolType[] = [
  "check_availability",
  "create_lead",
  "create_booking_request",
  "create_ticket",
  "create_refund_request",
];

function parseToolCalls(text: string): ToolCall[] {
  const calls: ToolCall[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const m = trimmed.match(/^TOOL_CALL:\s*(\w+)\s*(.+)?$/);
    if (!m) continue;
    const type = m[1] as ToolType;
    if (!KNOWN_TOOLS.includes(type)) continue;
    calls.push({ type, args: m[2] ? extractJson(m[2]) || {} : {} });
  }
  return calls;
}

function stripToolLines(text: string): string {
  return text
    .split("\n")
    .filter((l) => !l.trim().startsWith("TOOL_CALL:"))
    .join("\n")
    .trim();
}

const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)) ? Number(v) : undefined;

/** Execute the tool calls the model emitted, enrich the conversation, and fire
 *  owner notifications for new leads and urgent escalations. */
async function runTools(
  toolCalls: ToolCall[],
  convId: string,
  intentCategory: string,
): Promise<{ tool: string; result: unknown }[]> {
  const results: { tool: string; result: unknown }[] = [];

  for (const tool of toolCalls) {
    let result: unknown = { error: "Unknown tool" };
    const a = tool.args;

    try {
      switch (tool.type) {
        case "check_availability": {
          result = await checkAvailability(str(a.date || a.dateStr));
          break;
        }

        case "create_lead": {
          const name = str(a.name);
          const email = str(a.email);
          const phone = str(a.phone);
          const r = await createLeadFromAI({
            name,
            email,
            phone,
            serviceId: str(a.serviceId) || undefined,
            bedrooms: num(a.bedrooms),
            bathrooms: num(a.bathrooms),
            sqft: num(a.sqft),
            message: str(a.message) || undefined,
            conversationId: convId,
          });
          result = r;
          if (r.ok) {
            await updateConversation(convId, {
              user_name: name || undefined,
              user_email: email || undefined,
              user_phone: phone || undefined,
              category: "booking",
            });
            // Speed-to-lead: ping the owner immediately.
            void sendLeadNotification({ name, email, phone, source: "ai_receptionist", message: str(a.message) || null });
          }
          break;
        }

        case "create_booking_request": {
          const name = str(a.name);
          const email = str(a.email);
          const phone = str(a.phone);
          const r = await createBookingRequest({
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            address: str(a.address) || undefined,
            bedrooms: num(a.bedrooms),
            bathrooms: num(a.bathrooms),
            propertyType: str(a.propertyType) || undefined,
            cleaningType: str(a.serviceId || a.cleaningType) || undefined,
            preferredDate: str(a.date || a.preferredDate) || undefined,
            preferredTime: str(a.time || a.preferredTime) || undefined,
            notes: str(a.notes) || undefined,
            conversationId: convId,
          });
          result = r;
          if (r.ok) {
            await updateConversation(convId, {
              user_name: name || undefined,
              user_email: email || undefined,
              user_phone: phone || undefined,
              category: "booking",
            });
          }
          break;
        }

        case "create_ticket": {
          const priority = (str(a.priority) as "low" | "medium" | "high") || "low";
          const r = await createSupportTicket({
            customerName: str(a.name) || undefined,
            customerEmail: str(a.email) || undefined,
            customerPhone: str(a.phone) || undefined,
            issueType: str(a.issueType) || intentCategory,
            priority: ["low", "medium", "high"].includes(priority) ? priority : "low",
            description: str(a.description) || str(a.message),
            conversationId: convId,
          });
          result = r;
          if (r.ok && priority === "high") {
            await updateConversation(convId, { category: "complaint" });
            void sendEscalationNotification({
              kind: "complaint",
              priority: "high",
              name: str(a.name) || null,
              email: str(a.email) || null,
              phone: str(a.phone) || null,
              details: str(a.description) || str(a.message),
            });
          }
          break;
        }

        case "create_refund_request": {
          const r = await createRefundRequest({
            customerName: str(a.name),
            customerEmail: str(a.email),
            customerPhone: str(a.phone) || undefined,
            serviceDate: str(a.serviceDate || a.date) || undefined,
            address: str(a.address) || undefined,
            reason: str(a.reason) || str(a.description),
            conversationId: convId,
          });
          result = r;
          if (r.ok) {
            await updateConversation(convId, { category: "refund" });
            void sendEscalationNotification({
              kind: "refund",
              name: str(a.name) || null,
              email: str(a.email) || null,
              phone: str(a.phone) || null,
              serviceDate: str(a.serviceDate || a.date) || null,
              address: str(a.address) || null,
              details: str(a.reason) || str(a.description),
            });
          }
          break;
        }
      }
    } catch (err) {
      result = { error: (err as Error)?.message || "tool failed" };
    }

    results.push({ tool: tool.type, result });
  }

  return results;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** Best-effort: pull a concrete future date (YYYY-MM-DD, Denver) out of free text.
 *  Handles today/tomorrow, ISO, "June 19", and weekday names (next occurrence). */
function extractDate(text: string): string | null {
  const t = text.toLowerCase();
  const today = denverDateStr();
  if (/\btoday\b/.test(t)) return today;
  if (/\btomorrow\b/.test(t)) return nextDateStr(today);

  const iso = t.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const md = t.match(/\b([a-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (md) {
    const mi = MONTHS.findIndex((m) => m.startsWith(md[1]));
    const day = parseInt(md[2], 10);
    if (mi >= 0 && day >= 1 && day <= 31) {
      const [y] = today.split("-").map(Number);
      const mk = (yr: number) => `${yr}-${String(mi + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      let cand = mk(y);
      if (cand < today) cand = mk(y + 1);
      return cand;
    }
  }

  for (let i = 0; i < 7; i++) {
    if (new RegExp(`\\b${WEEKDAYS[i]}\\b`).test(t)) {
      let d = nextDateStr(today);
      for (let k = 0; k < 7; k++) {
        if (dayOfWeekForDateStr(d) === i) return d;
        d = nextDateStr(d);
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  if (!getAIConfig()) {
    return Response.json({ error: "AI system not configured" }, { status: 503 });
  }

  let convId = "unlogged";

  try {
    const body = await req.json();
    const { message, sessionId, conversationId, history } = body as {
      message: string;
      sessionId: string;
      conversationId?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    if (!message || !sessionId) {
      return Response.json({ error: "Missing message or sessionId" }, { status: 400 });
    }
    if (message.length > 4000) {
      return Response.json({ error: "Message too long (max 4000 characters)" }, { status: 400 });
    }

    // Conversation logging is best-effort — never let a logging failure (e.g. a
    // missing table in a not-yet-migrated DB) take down the chat.
    try {
      convId = conversationId || (await createConversation(sessionId));
      await saveMessage(convId, "user", message);
      await incrementMessageCount(convId);
    } catch (err) {
      console.warn("[AI Chat] conversation logging unavailable:", (err as Error)?.message);
    }

    const intent = classifyIntent(message);
    if (convId !== "unlogged" && intent.category !== "general") {
      try { await updateConversation(convId, { category: intent.category }); } catch {}
    }

    // Deterministic availability: for the most important question, don't depend
    // on a free model emitting a perfect tool call. If they ask about
    // availability/booking and we can read a date, fetch the real slots ourselves
    // and hand them to the model so it just relays accurate info.
    let availabilityNote = "";
    if (intent.category === "availability" || intent.category === "booking") {
      const date = extractDate(message);
      if (date) {
        try {
          const avail = await checkAvailability(date);
          availabilityNote =
            "LIVE AVAILABILITY (already checked for the customer — relay this, do not call check_availability again): " +
            avail.message;
        } catch {}
      }
    }

    const trimmedHistory: ChatMessage[] = (history || []).slice(-10).map((m) => ({ role: m.role, content: m.content }));
    const baseMessages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt() },
      ...(availabilityNote ? [{ role: "system", content: availabilityNote } as ChatMessage] : []),
      ...trimmedHistory,
      { role: "user", content: message },
    ];

    const encoder = new TextEncoder();
    const loggedConvId = convId;

    const stream = new ReadableStream({
      async start(controller) {
        const emit = (o: unknown) => controller.enqueue(encoder.encode(JSON.stringify(o) + "\n"));
        let streamedAnyVisible = false;
        const emitToken = (content: string) => {
          streamedAnyVisible = true;
          emit({ type: "token", content });
        };

        // Emits visible tokens to the client while hiding any TOOL_CALL line.
        function makeVisible() {
          let pending = "";
          return {
            push(token: string) {
              pending += token;
              let nl: number;
              while ((nl = pending.indexOf("\n")) !== -1) {
                const line = pending.slice(0, nl + 1);
                pending = pending.slice(nl + 1);
                if (!line.trim().startsWith("TOOL_CALL:")) emitToken(line);
              }
            },
            flush() {
              if (pending && !pending.trim().startsWith("TOOL_CALL:")) emitToken(pending);
              pending = "";
            },
          };
        }

        // ---- Phase 1: draft (may contain hidden TOOL_CALL lines) ----
        let raw1 = "";
        const vis1 = makeVisible();
        try {
          raw1 = await streamAIResponse(baseMessages, (t) => vis1.push(t));
        } catch (err) {
          console.error("[AI Chat] phase 1 stream error:", (err as Error)?.message);
          emit({ type: "error", content: "I'm having trouble right now. Please try again or call (801) 441-0726." });
          emit({ type: "done", conversationId: loggedConvId });
          controller.close();
          return;
        }
        vis1.flush();

        // ---- Tool calls + Phase 2: answer using the results ----
        const toolCalls = parseToolCalls(raw1);
        let finalAssistant = stripToolLines(raw1);

        if (toolCalls.length) {
          const toolResults = await runTools(toolCalls, loggedConvId, intent.category);
          emit({ type: "tool_results", results: toolResults });

          const followup: ChatMessage[] = [
            { role: "system", content: buildSystemPrompt() },
            ...trimmedHistory,
            { role: "user", content: message },
            { role: "assistant", content: raw1 },
            {
              role: "user",
              content:
                "TOOL RESULTS (JSON) — use these to answer the customer now, in plain friendly language. " +
                "Do NOT output TOOL_CALL or JSON.\n" +
                JSON.stringify(toolResults),
            },
          ];

          if (finalAssistant) emit({ type: "token", content: "\n\n" });

          const vis2 = makeVisible();
          let raw2 = "";
          try {
            raw2 = await streamAIResponse(followup, (t) => vis2.push(t));
          } catch (err) {
            console.warn("[AI Chat] phase 2 stream error:", (err as Error)?.message);
          }
          vis2.flush();

          finalAssistant = [finalAssistant, stripToolLines(raw2)].filter(Boolean).join("\n\n").trim();
        }

        if (!finalAssistant) finalAssistant = "Thanks! Is there anything else I can help you with?";

        // Never leave the customer with a blank bubble: if nothing visible was
        // streamed (e.g. the model emitted only a tool call, or returned empty),
        // send the final text now.
        if (!streamedAnyVisible) emit({ type: "token", content: finalAssistant });

        if (loggedConvId && loggedConvId !== "unlogged") {
          try {
            await saveMessage(loggedConvId, "assistant", finalAssistant);
            const s = finalAssistant.slice(0, 120).trim();
            await updateConversation(loggedConvId, { summary: s.length < finalAssistant.length ? s + "..." : s });
          } catch {}
        }

        emit({ type: "done", conversationId: loggedConvId });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
