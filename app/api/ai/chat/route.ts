import { NextRequest } from "next/server";
import { getAIConfig, streamAIResponse, type ChatMessage } from "@/lib/ai/config";
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

type ToolCall = {
  type: "check_availability" | "create_lead" | "create_booking_request" | "create_ticket" | "create_refund_request";
  args: Record<string, unknown>;
};

function parseToolCalls(text: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    const toolMatch = trimmed.match(/^TOOL_CALL:\s*(\w+)\s*(.+)?$/);
    if (toolMatch) {
      const type = toolMatch[1] as ToolCall["type"];
      const args = toolMatch[2] ? (extractJson(toolMatch[2]) || {}) : {};
      if (["check_availability", "create_lead", "create_booking_request", "create_ticket", "create_refund_request"].includes(type)) {
        calls.push({ type, args });
      }
    }
  }
  return calls;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const aiConfig = getAIConfig();
  if (!aiConfig) {
    return Response.json({ error: "AI system not configured" }, { status: 503 });
  }

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

    // Create or get conversation
    const convId = conversationId || await createConversation(sessionId);

    // Save user message
    await saveMessage(convId, "user", message);
    await incrementMessageCount(convId);

    // Classify intent
    const intent = classifyIntent(message);

    // Update conversation category
    if (intent.category !== "general") {
      await updateConversation(convId, { category: intent.category });
    }

    // Build message history
    const aiMessages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt() },
    ];

    if (history) {
      for (const msg of history.slice(-10)) {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    aiMessages.push({ role: "user", content: message });

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          await streamAIResponse(aiMessages, (token) => {
            fullResponse += token;
            controller.enqueue(encoder.encode(JSON.stringify({ type: "token", content: token }) + "\n"));
          });
        } catch (err: any) {
          const errMsg = err?.message || "AI request failed";
          console.error("[AI Chat] Stream error:", errMsg);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                content: "I'm having trouble right now. Please try again or call (801) 441-0726.",
              }) + "\n",
            ),
          );
          return;
        }

        // Parse and execute tool calls from the response
        const toolCalls = parseToolCalls(fullResponse);
        const toolResults: { tool: string; result: any }[] = [];

        for (const tool of toolCalls) {
          let result: any = { error: "Unknown tool" };

          try {
            switch (tool.type) {
              case "check_availability": {
                const dateStr = (tool.args.date || tool.args.dateStr || "") as string;
                result = await checkAvailability(dateStr);
                break;
              }
              case "create_lead": {
                result = await createLeadFromAI({
                  name: tool.args.name as string,
                  email: tool.args.email as string,
                  phone: tool.args.phone as string,
                  serviceId: tool.args.serviceId as string,
                  bedrooms: tool.args.bedrooms as number,
                  bathrooms: tool.args.bathrooms as number,
                  message: tool.args.message as string,
                  conversationId: convId,
                });
                break;
              }
              case "create_booking_request": {
                result = await createBookingRequest({
                  customerName: tool.args.name as string,
                  customerEmail: tool.args.email as string,
                  customerPhone: tool.args.phone as string,
                  address: tool.args.address as string,
                  bedrooms: tool.args.bedrooms as number,
                  bathrooms: tool.args.bathrooms as number,
                  cleaningType: tool.args.serviceId as string,
                  preferredDate: tool.args.date as string,
                  preferredTime: tool.args.time as string,
                  conversationId: convId,
                });
                break;
              }
              case "create_ticket": {
                result = await createSupportTicket({
                  customerName: tool.args.name as string,
                  customerEmail: tool.args.email as string,
                  customerPhone: tool.args.phone as string,
                  issueType: (tool.args.issueType as string) || intent.category,
                  priority: (tool.args.priority as "low" | "medium" | "high") || "low",
                  description: tool.args.description as string,
                  conversationId: convId,
                });
                break;
              }
              case "create_refund_request": {
                result = await createRefundRequest({
                  customerName: tool.args.name as string,
                  customerEmail: tool.args.email as string,
                  customerPhone: tool.args.phone as string,
                  serviceDate: tool.args.serviceDate as string,
                  address: tool.args.address as string,
                  reason: tool.args.reason as string,
                  conversationId: convId,
                });
                break;
              }
            }
          } catch (err: any) {
            result = { error: err.message };
          }

          toolResults.push({ tool: tool.type, result });
        }

        // Send tool results back to client
        if (toolResults.length > 0) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "tool_results", results: toolResults }) + "\n",
            ),
          );
        }

        // Save AI response
        await saveMessage(convId, "assistant", fullResponse);

        // Update conversation summary (first few words)
        const summary = fullResponse.slice(0, 120).trim();
        await updateConversation(convId, {
          summary: summary.length < fullResponse.length ? summary + "..." : summary,
        });

        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "done", conversationId: convId }) + "\n"),
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("[AI Chat] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
