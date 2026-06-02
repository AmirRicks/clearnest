import { BUSINESS } from "@/lib/utils";
import { SERVICES } from "@/lib/pricing";

const BASE = "https://clearnest.services";

// Cities within ~40 miles of Salt Lake City (used for areaServed + local SEO signals)
export const SERVICE_CITIES = [
  "Salt Lake City",
  "Sandy",
  "West Jordan",
  "South Jordan",
  "Murray",
  "Draper",
  "Holladay",
  "Cottonwood Heights",
  "Millcreek",
  "West Valley City",
  "Riverton",
  "Herriman",
  "Lehi",
  "Bluffdale",
  "Midvale",
  "Taylorsville",
  "Park City",
] as const;

/** LocalBusiness / HouseCleaningService structured data — sitewide (in root layout). */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HouseCleaningService",
    "@id": `${BASE}/#business`,
    name: BUSINESS.name,
    image: `${BASE}/video/home-tour-poster.jpg`,
    url: BASE,
    telephone: "+18014410726",
    email: BUSINESS.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Salt Lake City",
      addressRegion: "UT",
      addressCountry: "US",
    },
    areaServed: SERVICE_CITIES.map((c) => ({
      "@type": "City",
      name: `${c}, UT`,
    })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:00",
      closes: "19:00",
    },
    makesOffer: Object.values(SERVICES).map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, description: s.blurb },
    })),
    sameAs: [BUSINESS.yelpUrl],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** FAQPage structured data — on /faq. */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
