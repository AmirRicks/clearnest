"use server";

import { z } from "zod";
import { createGiftCheckout } from "@/lib/stripe";
import { generateGiftCode, normalizeGiftAmount } from "@/lib/gift";

const giftSchema = z.object({
  amount: z.coerce.number(),
  purchaserName: z.string().trim().min(1, "Your name is required").max(120),
  purchaserEmail: z.string().trim().email("Enter a valid email").max(160),
  recipientName: z.string().trim().min(1, "Recipient name is required").max(120),
  recipientEmail: z.string().trim().email("Enter a valid recipient email").max(160),
  message: z.string().trim().max(480).optional().default(""),
});

export type GiftFormState =
  | { ok: true; url: string }
  | { ok: false; error: string; field?: string }
  | null;

export async function startGiftCheckout(
  _prev: GiftFormState,
  formData: FormData
): Promise<GiftFormState> {
  const parsed = giftSchema.safeParse({
    amount: formData.get("amount"),
    purchaserName: formData.get("purchaserName"),
    purchaserEmail: formData.get("purchaserEmail"),
    recipientName: formData.get("recipientName"),
    recipientEmail: formData.get("recipientEmail"),
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Please check your details.",
      field: String(first?.path?.[0] ?? ""),
    };
  }

  const amount = normalizeGiftAmount(parsed.data.amount);
  if (amount === null) {
    return { ok: false, error: "Choose a gift amount between $50 and $1,000.", field: "amount" };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clearnest.services";

  const code = generateGiftCode();

  const res = await createGiftCheckout({
    amount,
    code,
    purchaserName: parsed.data.purchaserName,
    purchaserEmail: parsed.data.purchaserEmail,
    recipientName: parsed.data.recipientName,
    recipientEmail: parsed.data.recipientEmail,
    message: parsed.data.message,
    successUrl: `${origin}/gift-cards/success`,
    cancelUrl: `${origin}/gift-cards?canceled=1`,
  });

  if (!res.ok || !res.url) {
    return {
      ok: false,
      error:
        "Online gift-card checkout isn't available right now — please call or text us at (801) 441-0726 and we'll set one up for you.",
    };
  }

  return { ok: true, url: res.url };
}
