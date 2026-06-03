export const SERVICES = {
  standard: {
    id: "standard",
    name: "Standard Cleaning",
    blurb: "Recurring maintenance clean that keeps your home consistently fresh.",
    baseRate: 110,
    bedroomRate: 18,
    bathroomRate: 22,
    sqftRate: 0.04,
    multiplier: 1,
    durationHrs: [2, 4] as const,
    includes: [
      "Vacuum and mop all floors",
      "Dusting of accessible surfaces",
      "Kitchen counters, exterior of appliances, sink",
      "Bathroom sinks, toilets, mirrors, tubs",
      "Trash removal and bed-making",
    ],
  },
  deep: {
    id: "deep",
    name: "Deep Cleaning",
    blurb: "Top-to-bottom reset for buildup, baseboards, cabinets, and detail areas.",
    baseRate: 195,
    bedroomRate: 35,
    bathroomRate: 45,
    sqftRate: 0.07,
    multiplier: 1.55,
    durationHrs: [4, 7] as const,
    includes: [
      "Everything in Standard",
      "Baseboards, door frames, vents",
      "Inside of microwave and oven exterior",
      "Detailed scrubbing of tile, grout, and tubs",
      "Cabinet exteriors, light fixtures, switch plates",
    ],
  },
  moveinout: {
    id: "moveinout",
    name: "Move-In / Move-Out",
    blurb: "Full property reset for handover. Empty home preferred.",
    baseRate: 245,
    bedroomRate: 40,
    bathroomRate: 55,
    sqftRate: 0.09,
    multiplier: 1.75,
    durationHrs: [5, 9] as const,
    includes: [
      "Inside cabinets, drawers, closets",
      "Inside oven, fridge, and freezer",
      "All baseboards, doors, and trim",
      "Windows interior and tracks",
      "Full bathroom + kitchen deep clean",
    ],
  },
  airbnb: {
    id: "airbnb",
    name: "Airbnb Turnover",
    blurb: "Guest-ready turnover with linens, restock, and inspection.",
    baseRate: 125,
    bedroomRate: 22,
    bathroomRate: 28,
    sqftRate: 0.05,
    multiplier: 1.1,
    durationHrs: [2, 4] as const,
    includes: [
      "Linens stripped, washed, and remade",
      "Restock essentials checklist",
      "Trash, recycling, and dishes reset",
      "Stage and inspect for next guest",
      "Damage and inventory report",
    ],
  },
} as const;

export type ServiceId = keyof typeof SERVICES;

/**
 * Optional checkout add-ons — fixed-price extras that raise the average order.
 * Customers toggle these in the booking flow.
 */
export const ADDONS = {
  fridge: { id: "fridge", name: "Inside fridge", price: 35, blurb: "Shelves, drawers, and walls wiped + sanitized." },
  oven: { id: "oven", name: "Inside oven", price: 40, blurb: "Degreased racks, door glass, and interior." },
  windows: { id: "windows", name: "Interior windows", price: 45, blurb: "Interior glass, sills, and tracks." },
  cabinets: { id: "cabinets", name: "Inside cabinets", price: 40, blurb: "Empty-cabinet interiors wiped down." },
  laundry: { id: "laundry", name: "Wash & fold (1 load)", price: 25, blurb: "One load washed, dried, and folded." },
  garage: { id: "garage", name: "Garage sweep-out", price: 50, blurb: "Sweep, de-cobweb, and tidy (2-car)." },
} as const;

export type AddonId = keyof typeof ADDONS;

/**
 * Recurring plans — the lifetime-value lever. Standing discount per visit,
 * still pay-after-the-clean each time (on-brand: no deposit, no card on file).
 */
export const FREQUENCIES = {
  one_time: { id: "one_time", label: "One-time", short: "Just once", discountPct: 0, blurb: "A single visit." },
  monthly: { id: "monthly", label: "Monthly", short: "Every 4 weeks", discountPct: 10, blurb: "10% off every clean." },
  biweekly: { id: "biweekly", label: "Every 2 weeks", short: "Biweekly", discountPct: 15, blurb: "Most popular — 15% off every clean." },
  weekly: { id: "weekly", label: "Weekly", short: "Weekly", discountPct: 20, blurb: "Always guest-ready — 20% off every clean." },
} as const;

export type FrequencyId = keyof typeof FREQUENCIES;

export interface EstimateInput {
  serviceId: ServiceId;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  addonIds?: AddonId[];
  frequency?: FrequencyId;
}

export interface EstimateResult {
  low: number;
  high: number;
  mid: number;
  hours: readonly [number, number];
  addonsTotal: number;
  discountPct: number;
}

export function addonsTotal(ids: AddonId[] | undefined): number {
  return (ids ?? []).reduce((sum, id) => sum + (ADDONS[id]?.price ?? 0), 0);
}

export function estimatePrice(input: EstimateInput): EstimateResult {
  const s = SERVICES[input.serviceId];
  const bedrooms = clamp(input.bedrooms, 0, 8);
  const bathrooms = clamp(input.bathrooms, 0, 8);
  const sqft = clamp(input.sqft, 200, 12000);

  const subtotal =
    s.baseRate +
    bedrooms * s.bedroomRate +
    bathrooms * s.bathroomRate +
    sqft * s.sqftRate;

  const mid = Math.round(subtotal);
  const baseLow = mid * 0.92;
  const baseHigh = mid * 1.18;

  const extras = addonsTotal(input.addonIds);
  const discountPct = FREQUENCIES[input.frequency ?? "one_time"]?.discountPct ?? 0;
  const factor = 1 - discountPct / 100;

  return {
    low: Math.round((baseLow + extras) * factor),
    high: Math.round((baseHigh + extras) * factor),
    mid: Math.round((mid + extras) * factor),
    hours: s.durationHrs,
    addonsTotal: extras,
    discountPct,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, isFinite(n) ? n : min));
}
