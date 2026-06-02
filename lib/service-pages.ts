import type { ServiceId } from "@/lib/pricing";

/**
 * Per-service SEO landing-page content. Pairs with SERVICES in lib/pricing.ts
 * (which holds pricing + the includes checklist). This file holds the unique,
 * conversion + SEO copy for each service's dedicated page at /services/[service].
 *
 * FAQ answers intentionally avoid hardcoded prices (the live estimator on the
 * page is the source of truth) so they never go stale.
 */
export interface ServicePage {
  slug: string;
  serviceId: ServiceId;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  whoFor: string[];
  faqs: { q: string; a: string }[];
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "standard-cleaning",
    serviceId: "standard",
    metaTitle: "Standard House Cleaning Service",
    metaDescription:
      "Recurring standard house cleaning in Salt Lake City and within 40 miles. Weekly, biweekly, or monthly upkeep that keeps your home consistently fresh. Book online, pay after the clean.",
    eyebrow: "Recurring maintenance clean",
    h1: "Standard House Cleaning",
    intro:
      "Our most popular service: a consistent, detail-first maintenance clean that keeps your home effortlessly fresh week after week. Set it weekly, biweekly, or monthly and stop thinking about cleaning — we follow the same 60-point checklist every visit, and you only pay once it's done.",
    whoFor: [
      "Busy households on a weekly, biweekly, or monthly rhythm",
      "Homes already in good shape that need consistent upkeep",
      "Anyone who wants to reclaim their weekends",
      "Pet- and kid-friendly homes (eco upgrade on request)",
    ],
    faqs: [
      {
        q: "How often should I schedule a standard clean?",
        a: "Most clients choose biweekly — it keeps a home consistently fresh without buildup. Weekly suits larger or higher-traffic homes; monthly works for tidy, low-traffic spaces. You can change your cadence anytime.",
      },
      {
        q: "What's the difference between a standard and a deep clean?",
        a: "A standard clean maintains an already-clean home — floors, surfaces, kitchen, and baths. A deep clean tackles built-up grime, baseboards, inside appliances, and detail areas. We usually recommend one deep clean to start, then maintaining with standard visits.",
      },
      {
        q: "Do I need to be home?",
        a: "No. Most clients leave a code or key. We text on arrival and at completion, with photos on request.",
      },
      {
        q: "How much does a standard clean cost?",
        a: "Pricing is based on your home's size and the service. Use the instant estimator on this page for an exact range — there's no deposit, and you pay after the clean.",
      },
    ],
  },
  {
    slug: "deep-cleaning",
    serviceId: "deep",
    metaTitle: "Deep Cleaning Service",
    metaDescription:
      "Top-to-bottom deep cleaning in Salt Lake City and within 40 miles. Baseboards, inside appliances, grout, and detail areas — the reset your home has been needing. Book online, pay after.",
    eyebrow: "Top-to-bottom reset",
    h1: "Deep Cleaning",
    intro:
      "A deep clean is the full reset — everything in a standard clean, plus the buildup that everyday cleaning misses: baseboards, door frames, vents, inside the microwave, cabinet exteriors, light fixtures, and detailed scrubbing of tile, grout, and tubs. It's the perfect starting point before recurring service, or a seasonal refresh.",
    whoFor: [
      "First-time ClearNest clients (the ideal baseline)",
      "Homes that haven't had a pro clean in a while",
      "Spring and seasonal resets",
      "Before guests, events, or a holiday",
    ],
    faqs: [
      {
        q: "Why start with a deep clean?",
        a: "A deep clean brings every surface to a consistent baseline so future standard visits can keep it there efficiently. Starting recurring service on a home with buildup means the first few cleans can't reach 'maintained' — a deep clean fixes that in one visit.",
      },
      {
        q: "How long does a deep clean take?",
        a: "Typically 4–7 hours depending on size and condition. We walk the home with you at the end to make sure every detail meets the standard.",
      },
      {
        q: "What's included that a standard clean isn't?",
        a: "Baseboards, door frames and vents, inside the microwave and the oven exterior, cabinet exteriors, light fixtures and switch plates, and detailed scrubbing of tile, grout, and tubs.",
      },
      {
        q: "How much does a deep clean cost?",
        a: "It depends on your home's size and condition. Use the instant estimator on this page for an exact range — no deposit, and you pay after the clean is complete.",
      },
    ],
  },
  {
    slug: "move-in-out-cleaning",
    serviceId: "moveinout",
    metaTitle: "Move-In / Move-Out Cleaning",
    metaDescription:
      "Move-in and move-out cleaning in Salt Lake City and within 40 miles. Inside cabinets, appliances, windows, and a full property reset for handover. Book online, pay after the clean.",
    eyebrow: "Full property reset",
    h1: "Move-In / Move-Out Cleaning",
    intro:
      "Moving is stressful enough. Our move-in/move-out service resets an empty property top to bottom for handover — inside cabinets, drawers, and closets, inside the oven, fridge, and freezer, all baseboards and trim, interior windows and tracks, and a full bathroom and kitchen deep clean. Ideal for tenants chasing a deposit, landlords turning a unit, or buyers starting fresh.",
    whoFor: [
      "Tenants who want their full deposit back",
      "Landlords and property managers turning units",
      "Home buyers wanting a clean slate",
      "Realtors prepping a listing",
    ],
    faqs: [
      {
        q: "Should the home be empty?",
        a: "Empty is strongly preferred — it lets us reach inside cabinets, closets, and behind where furniture used to be. We can work around minimal items, but a clear space gets the best result.",
      },
      {
        q: "Will this help me get my deposit back?",
        a: "That's exactly what it's built for. We hit the areas landlords inspect: inside appliances, cabinets, baseboards, window tracks, and bathrooms. We can't guarantee a landlord's decision, but a documented professional clean is your strongest case.",
      },
      {
        q: "Do you clean inside the oven and fridge?",
        a: "Yes — inside the oven, fridge, and freezer are all included, along with inside cabinets and drawers.",
      },
      {
        q: "How much does move-out cleaning cost?",
        a: "It's based on your home's size and condition. Use the instant estimator on this page for an exact range — no deposit, pay after the clean.",
      },
    ],
  },
  {
    slug: "airbnb-turnover",
    serviceId: "airbnb",
    metaTitle: "Airbnb & Short-Term Rental Turnover Cleaning",
    metaDescription:
      "Airbnb and short-term rental turnover cleaning in Salt Lake City, Park City, and within 40 miles. Linens, restock, staging, and an inspection report between every guest. Book online.",
    eyebrow: "Guest-ready turnovers",
    h1: "Airbnb & Short-Term Rental Turnover",
    intro:
      "Built for hosts: a fast, reliable turnover between every check-out and check-in. We strip, wash, and remake linens, restock from your essentials checklist, reset trash, recycling, and dishes, stage the space, and send a damage and inventory report so you're never surprised. We coordinate around your booking calendar — including same-day turns.",
    whoFor: [
      "Airbnb, VRBO, and short-term rental hosts",
      "Property managers running multiple units",
      "Hosts in high-turnover markets like Park City",
      "Anyone who needs reliable same-day turns",
    ],
    faqs: [
      {
        q: "Can you coordinate with my check-in and check-out times?",
        a: "Yes — that's the core of the service. Share your booking windows and we'll turn the unit between guests, including same-day turns when scheduled in advance.",
      },
      {
        q: "Do you restock supplies and handle linens?",
        a: "Yes. We strip, wash, and remake linens, and restock from your essentials checklist (we can use supplies you keep on-site). You're billed only for the turnover.",
      },
      {
        q: "What's in the inspection report?",
        a: "After each turn we note any damage, low or missing essentials, and maintenance issues — with photos on request — so you can address them before the next guest arrives.",
      },
      {
        q: "Do you serve Park City?",
        a: "Yes. Park City's short-term rental market is a core area for our turnover service, along with the wider Salt Lake area.",
      },
    ],
  },
];

export const SERVICE_PAGE_SLUGS = SERVICE_PAGES.map((s) => s.slug);

export function getServicePage(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((s) => s.slug === slug);
}

/** serviceId -> slug, for cross-linking from elsewhere (e.g. /services hub). */
export const SERVICE_SLUG_BY_ID: Record<ServiceId, string> = SERVICE_PAGES.reduce(
  (acc, s) => {
    acc[s.serviceId] = s.slug;
    return acc;
  },
  {} as Record<ServiceId, string>
);
