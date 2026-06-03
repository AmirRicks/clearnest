// Gift card helpers — amount presets + human-friendly code generation.

export const GIFT_PRESETS = [
  { amount: 75, label: "$75", blurb: "A refreshing standard clean." },
  { amount: 120, label: "$120", blurb: "Most popular — a thorough whole-home clean." },
  { amount: 200, label: "$200", blurb: "A deep clean or a couple of visits." },
  { amount: 300, label: "$300", blurb: "Move-in ready, or a season of tidy." },
] as const;

export const GIFT_MIN = 50;
export const GIFT_MAX = 1000;

/** Validate a dollar amount for a gift purchase. Returns a clamped integer or null. */
export function normalizeGiftAmount(input: unknown): number | null {
  const n = Math.round(Number(input));
  if (!Number.isFinite(n)) return null;
  if (n < GIFT_MIN || n > GIFT_MAX) return null;
  return n;
}

// Unambiguous alphabet — no 0/O, 1/I, etc.
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479";

/** Generate a code like CN-GIFT-7K4P-Q9XF (sortable-ish, easy to read aloud). */
export function generateGiftCode(): string {
  const block = (len: number) =>
    Array.from({ length: len }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
  return `CN-GIFT-${block(4)}-${block(4)}`;
}

export function formatGiftCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, "");
}
