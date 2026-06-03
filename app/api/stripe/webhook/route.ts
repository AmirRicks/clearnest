import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGiftCardToRecipient, sendGiftReceipt } from "@/lib/email";

/**
 * Stripe webhook.
 *  - invoice.paid / invoice.payment_succeeded → flip a booking to "paid".
 *  - checkout.session.completed (kind=gift_card) → mint the gift card + email it.
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

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[ClearNest stripe] bad signature", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  // 1) Booking invoice paid -------------------------------------------------
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

  // 2) Gift card purchased --------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata ?? {};
    if (m.kind === "gift_card" && session.payment_status === "paid") {
      await fulfillGiftCard(session, m);
    }
  }

  return NextResponse.json({ received: true });
}

async function fulfillGiftCard(
  session: Stripe.Checkout.Session,
  m: Record<string, string>
) {
  const admin = createAdminClient();
  if (!admin) {
    // Without the service-role key we can't write past RLS. Log loudly so the
    // owner can reconcile manually — the payment still succeeded in Stripe.
    console.error("[ClearNest gift] SUPABASE_SERVICE_ROLE_KEY missing — gift card not recorded", {
      session: session.id,
      code: m.code,
    });
    return;
  }

  const amountCents = Number(m.amount) || session.amount_total || 0;
  const amountDollars = Math.round(amountCents / 100);
  const code = m.code;

  // Idempotency — Stripe may retry. Skip if this session was already fulfilled.
  const { data: existing } = await admin
    .from("gift_cards")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const { error } = await admin.from("gift_cards").insert({
    code,
    amount: amountCents,
    balance: amountCents,
    status: "active",
    purchaser_name: m.purchaserName ?? null,
    purchaser_email: m.purchaserEmail ?? session.customer_email ?? null,
    recipient_name: m.recipientName ?? null,
    recipient_email: m.recipientEmail ?? null,
    message: m.message || null,
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
  });

  if (error) {
    console.error("[ClearNest gift] failed to record gift card", error, { session: session.id });
    return;
  }

  // Deliver the gift + receipt. Failures here are logged, not fatal.
  try {
    if (m.recipientEmail) {
      await sendGiftCardToRecipient({
        to: m.recipientEmail,
        recipientName: m.recipientName || "there",
        purchaserName: m.purchaserName || "A friend",
        amount: amountDollars,
        code,
        message: m.message || undefined,
      });
    }
    const buyerEmail = m.purchaserEmail || session.customer_email || "";
    if (buyerEmail) {
      await sendGiftReceipt({
        to: buyerEmail,
        purchaserName: m.purchaserName || "there",
        recipientName: m.recipientName || "your recipient",
        recipientEmail: m.recipientEmail || "",
        amount: amountDollars,
        code,
      });
    }
  } catch (err) {
    console.error("[ClearNest gift] email delivery failed", err, { session: session.id });
  }
}
