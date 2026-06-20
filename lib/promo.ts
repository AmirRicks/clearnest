/**
 * Promo / discount codes.
 *
 * Codes live here as a small registry (single source of truth) — no DB table or
 * admin UI needed for the one founding code. Adding a code = one entry.
 *
 * The founding code FOUNDING20 is `firstCleanOnly`, so it ties into
 * `lib/first-clean.ts`: it only applies if the customer has never had a clean
 * delivered (matched by email or phone against past bookings). This is what
 * makes "20% off your FIRST clean" actually enforceable — a returning customer
 * who enters it is silently quoted standard pricing.
 */

import { getFirstCleanStatus, type BookingLite } from "@/lib/first-clean";

export type PromoCode = {
  code: string;
  label: string;
  percentOff: number;
  firstCleanOnly: boolean;
  active: boolean;
  description: string;
};

export const PROMO_CODES: Record<string, PromoCode> = {
  FOUNDING20: {
    code: "FOUNDING20",
    label: "Founding customer",
    percentOff: 20,
    firstCleanOnly: true,
    active: true,
    description: "20% off your first clean",
  },
};

export function normalizePromo(input: string | null | undefined): string {
  return (input ?? "").trim().toUpperCase();
}

/** A valid, active code — or null. Pure (no DB); safe on the client for display. */
export function getPromo(input: string | null | undefined): PromoCode | null {
  const p = PROMO_CODES[normalizePromo(input)];
  return p && p.active ? p : null;
}

/** Apply a percent discount to an estimate range. */
export function discountRange(low: number, high: number, percentOff: number) {
  const f = 1 - percentOff / 100;
  return { low: Math.round(low * f), high: Math.round(high * f) };
}

export type PromoValidation =
  | { ok: true; promo: PromoCode }
  | { ok: false; reason: "none" | "invalid" | "not_first_clean" };

/**
 * Full server-side validation: the code must exist and be active, and if it's
 * `firstCleanOnly` the customer must be a genuine first-timer (checked against
 * past bookings). Needs the bookings list, so this runs server-side only.
 */
export function validatePromo(
  input: string | null | undefined,
  customer: { email: string | null; phone: string | null },
  bookings: BookingLite[]
): PromoValidation {
  if (!normalizePromo(input)) return { ok: false, reason: "none" };
  const promo = getPromo(input);
  if (!promo) return { ok: false, reason: "invalid" };
  if (promo.firstCleanOnly && !getFirstCleanStatus(customer, bookings).eligible) {
    return { ok: false, reason: "not_first_clean" };
  }
  return { ok: true, promo };
}
