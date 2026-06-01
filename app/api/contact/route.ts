import { NextResponse } from "next/server";

/**
 * Contact form receiver.
 * Phase 1: logs structured payload to server logs (visible in Vercel).
 * Phase 2: forwards to Resend / Twilio / Supabase contacts table.
 */
export async function POST(request: Request) {
  const data = await request.formData();
  const payload = {
    receivedAt: new Date().toISOString(),
    name: String(data.get("name") ?? ""),
    phone: String(data.get("phone") ?? ""),
    email: String(data.get("email") ?? ""),
    message: String(data.get("message") ?? ""),
  };

  if (!payload.name || !payload.message || !/.+@.+\..+/.test(payload.email)) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  console.info("[ClearNest contact]", payload);
  return NextResponse.json({ ok: true });
}
