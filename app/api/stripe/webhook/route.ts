import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Stripe webhook — flips a booking to "paid" when its invoice is paid.
 * Configure the endpoint + STRIPE_WEBHOOK_SECRET in the Stripe dashboard.
 */
export async function POST(request: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 400 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false }, { status: 400 });

  const body = await request.text(); // raw body required for signature verification

  let event;
  try {
    event = s.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[ClearNest stripe] bad signature", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  if (
    (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") &&
    isSupabaseConfigured()
  ) {
    const invoice = event.data.object as { metadata?: { bookingId?: string }; id?: string };
    const bookingId = invoice.metadata?.bookingId;
    if (bookingId) {
      const sb = await createClient();
      await sb.from("bookings").update({ status: "paid" }).eq("id", bookingId);
    }
  }

  return NextResponse.json({ received: true });
}
