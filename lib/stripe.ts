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
