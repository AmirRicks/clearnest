import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BUSINESS } from "@/lib/utils";
import type { Review } from "@/lib/supabase/types";

const BASE = "https://clearnest.services";

/**
 * AggregateRating + Review structured data for the business node.
 *
 * Emits **only when real reviews exist** in the database — never a fabricated
 * rating (truth-in-advertising, and Google penalizes fake review markup).
 * Once real reviews land, this produces ⭐ star-rating rich snippets in Google.
 *
 * Server component — render on the homepage and /reviews.
 */
export async function ReviewSchemaJsonLd() {
  if (!isSupabaseConfigured()) return null;

  let reviews: Review[] = [];
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("reviews")
      .select("*")
      .order("featured", { ascending: false })
      .order("reviewed_at", { ascending: false })
      .limit(20);
    reviews = (data as Review[]) ?? [];
  } catch {
    return null;
  }

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const data = {
    "@context": "https://schema.org",
    "@type": "HouseCleaningService",
    "@id": `${BASE}/#business`,
    name: BUSINESS.name,
    url: BASE,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: r.customer_name },
      reviewBody: r.body,
      datePublished: r.reviewed_at,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
