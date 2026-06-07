import { NextResponse } from "next/server";
import { Twilio } from "twilio";
import { z } from "zod";
import { BUSINESS } from "@/lib/utils";
import { sendLeadNotification, sendLeadAutoReply } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(1, "Message is required"),
  source: z.string().optional(),
});

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
  const rl = checkRateLimit(rateLimitKey(request), { maxRequests: 3, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const data = await request.formData();
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
  await sendSms(phone, customerMessage);

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
  const admin = createAdminClient();
  if (admin) {
    const { error: dbError } = await admin.from("leads").insert({
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
