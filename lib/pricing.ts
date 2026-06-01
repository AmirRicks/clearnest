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

export interface EstimateInput {
  serviceId: ServiceId;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
}

export interface EstimateResult {
  low: number;
  high: number;
  mid: number;
  hours: readonly [number, number];
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
  const low = Math.round(mid * 0.92);
  const high = Math.round(mid * 1.18);

  return { low, high, mid, hours: s.durationHrs };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, isFinite(n) ? n : min));
}
