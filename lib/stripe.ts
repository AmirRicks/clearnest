import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (_stripe) return _stripe;
  // Let the SDK use its pinned API version (avoids coupling to a version literal).
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

export type CreateInvoiceArgs = {
  customerName: string;
  customerEmail: string;
  amount: number; // dollars
  description: string;
  metadata: Record<string, string>;
};

export async function createHostedInvoice(args: CreateInvoiceArgs) {
  const s = stripe();
  if (!s) return { ok: false as const, error: "Stripe not configured" };

  const customer = await s.customers.create({
    name: args.customerName,
    email: args.customerEmail,
    metadata: { bookingId: args.metadata.bookingId ?? "" },
  });

  await s.invoiceItems.create({
    customer: customer.id,
    amount: Math.round(args.amount * 100),
    currency: "usd",
    description: args.description,
  });

  const invoice = await s.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 7,
    auto_advance: true,
    metadata: args.metadata,
    description: args.description,
  });

  const finalized = await s.invoices.finalizeInvoice(invoice.id!);
  return {
    ok: true as const,
    id: finalized.id!,
    hostedUrl: finalized.hosted_invoice_url ?? "",
    amount: args.amount,
  };
}

export type GiftCheckoutArgs = {
  amount: number; // dollars
  code: string;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  successUrl: string;
  cancelUrl: string;
};

/**
 * Stripe Checkout (one-time payment) for a gift card. The card is only written
 * to our DB after the webhook confirms payment — we never store an "active"
 * card before the money lands.
 */
export async function createGiftCheckout(args: GiftCheckoutArgs) {
  const s = stripe();
  if (!s) return { ok: false as const, error: "Stripe not configured" };

  const session = await s.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: args.purchaserEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(args.amount * 100),
          product_data: {
            name: `ClearNest Gift Card — $${args.amount}`,
            description: `For ${args.recipientName}`,
          },
        },
      },
    ],
    metadata: {
      kind: "gift_card",
      code: args.code,
      amount: String(Math.round(args.amount * 100)),
      purchaserName: args.purchaserName.slice(0, 120),
      purchaserEmail: args.purchaserEmail,
      recipientName: args.recipientName.slice(0, 120),
      recipientEmail: args.recipientEmail,
      message: (args.message ?? "").slice(0, 480),
    },
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
  });

  return { ok: true as const, id: session.id, url: session.url ?? "" };
}
