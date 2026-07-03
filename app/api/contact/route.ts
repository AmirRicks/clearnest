import { NextResponse } from "next/server";
import { Twilio } from "twilio";
import { z } from "zod";
import { BUSINESS } from "@/lib/utils";
import { sendLeadNotification, sendLeadAutoReply } from "@/lib/email";
import supabaseAdmin from "@/lib/supabase-admin";

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  phone: z.string().min(1, "Phone is required").max(30),
  email: z.string().email("Invalid email").max(160),
  message: z.string().min(1, "Message is required").max(2000),
  source: z.string().max(60).optional(),
});

// --- Abuse protection -------------------------------------------------------
// This endpoint sends outbound Twilio SMS to the phone number in the request,
// so an unauthenticated caller could use it to (a) run up SMS charges and
// (b) relay texts to arbitrary numbers. Rate-limit per IP + a honeypot keep it
// from being an open SMS relay. In-memory is per-instance (Vercel Fluid) — a
// coarse but effective ceiling; upgrade to a shared store if abuse appears.
const RATE_LIMIT_WINDOW = 10 * 60_000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_SUBMISSIONS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

/** US/Canada phone sanity: reduce to digits and require 10 (or 11 with a
 *  leading 1). Blocks using the auto-reply SMS to blast arbitrary/intl numbers
 *  and drops obvious junk before any Twilio call. Returns null if implausible. */
function normalizeUsPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const twilio =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const notifyPhone = process.env.LEAD_NOTIFY_PHONE;
const twilioFrom = process.env.TWILIO_FROM;

async function sendSms(to: string, body: string) {
  if (!twilio || !twilioFrom) {
    console.warn("Twilio not configured, skipping SMS.");
    return;
  }
  try {
    await twilio.messages.create({ to, from: twilioFrom, body });
    console.log(`[Twilio] SMS sent to ${to}`);
  } catch (e) {
    console.error(`[Twilio] Failed to send SMS to ${to}`, e);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please call or text (801) 441-0726." },
      { status: 429 },
    );
  }

  const data = await request.formData();

  // Honeypot: a hidden "company" field no human sees. If it's filled, this is a
  // bot — accept silently (return ok so the bot doesn't learn it was caught) and
  // send nothing.
  if (String(data.get("company") || "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const raw = {
    name: data.get("name"),
    phone: data.get("phone"),
    email: data.get("email"),
    message: data.get("message"),
    source: data.get("source"),
  };

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, phone, email, message, source } = parsed.data;

  // Reject implausible phone numbers before we ever send an SMS to them — this
  // is what stops the endpoint being used as an SMS relay to arbitrary numbers.
  const smsPhone = normalizeUsPhone(phone);
  if (!smsPhone) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid US phone number." },
      { status: 400 },
    );
  }

  // Log to server (Vercel)
  console.info("[ClearNest Lead]", parsed.data);

  // --- Start SMS Speed-to-Lead Flow ---

  // 1. Instant SMS to owner
  if (notifyPhone) {
    const ownerMessage = `New ClearNest Lead (${source || "contact"}):
Name: ${name}
Phone: ${phone}
Email: ${email}
Message: ${message}`;
    await sendSms(notifyPhone, ownerMessage);
  } else {
    console.warn("LEAD_NOTIFY_PHONE not set, skipping owner SMS.");
  }

  // 2. Instant SMS auto-reply to customer
  const customerMessage = `Hi ${
    name.split(" ")[0]
  }, this is Amirali from ClearNest! I received your cleaning quote request. I'll review it and get back to you shortly from this number. Thank you!`;
  await sendSms(smsPhone, customerMessage);

  // --- End SMS Flow ---

  // --- Start Email Fallback Flow ---
  await Promise.allSettled([
    // 1. Email to owner
    sendLeadNotification(parsed.data),
    // 2. Email auto-reply to customer
    sendLeadAutoReply({ to: email, customerName: name }),
  ]);
  // --- End Email Flow ---
  
  // --- Start Supabase Lead Logging ---
  if (supabaseAdmin) {
    const { error: dbError } = await supabaseAdmin.from("leads").insert({
      name,
      phone,
      email,
      message,
      source,
    });

    if (dbError) {
      console.error("[Supabase] Failed to insert lead:", dbError);
      // Optional: could add extra error handling here, but we don't want to block
      // the response to the user just because our DB failed. The SMS/email is more critical.
    }
  } else {
    console.warn("[Supabase] Admin client not configured, skipping lead insert.");
  }
  // --- End Supabase Flow ---

  return NextResponse.json({ ok: true });
}
