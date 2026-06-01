import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { Eyebrow, H2, Section } from "./section";
import { BUSINESS } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/lib/supabase/types";

const FALLBACK: Pick<Review, "id" | "customer_name" | "location" | "rating" | "body" | "source">[] = [
  {
    id: "f1",
    customer_name: "Megan R.",
    location: "Sandy, UT",
    rating: 5,
    source: "yelp",
    body: "ClearNest turned our move-out into a stress-free afternoon. We got our full deposit back and the property manager actually said the kitchen looked brand new.",
  },
  {
    id: "f2",
    customer_name: "Tyler K.",
    location: "Salt Lake City, UT",
    rating: 5,
    source: "google",
    body: "I manage three Airbnb units and ClearNest is the only turnover crew I trust between same-day check-ins. Linens immaculate, restock on point.",
  },
  {
    id: "f3",
    customer_name: "Priya S.",
    location: "Holladay, UT",
    rating: 5,
    source: "yelp",
    body: "Booked a deep clean before hosting Diwali. They scrubbed grout I had given up on. Easy online booking, professional team, fair price.",
  },
];

export async function ReviewsStrip() {
  const reviews = await loadFeatured();

  return (
    <Section id="reviews" className="bg-paper/40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Reviews</Eyebrow>
          <H2>Trusted by local homeowners and Airbnb hosts.</H2>
          <div className="mt-5 flex items-center gap-3">
            <Stars rating={5} />
            <span className="text-sm text-graphite">5.0 rating across Yelp & Google</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={BUSINESS.yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
          >
            <Star className="h-4 w-4 fill-current text-[#d32323]" />
            View on Yelp
          </a>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
          >
            All reviews <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="flex flex-col gap-4 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft"
          >
            <Stars rating={r.rating} />
            <p className="text-pretty text-sm leading-relaxed text-charcoal">“{r.body}”</p>
            <div className="mt-auto flex items-center justify-between text-xs text-graphite">
              <span className="font-medium text-charcoal">
                {r.customer_name}
                {r.location ? ` · ${r.location}` : ""}
              </span>
              <span className="rounded-full bg-paper px-2 py-0.5 uppercase tracking-[0.14em]">
                {r.source}
              </span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

async function loadFeatured(): Promise<typeof FALLBACK> {
  if (!isSupabaseConfigured()) return FALLBACK;
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("reviews")
      .select("id, customer_name, location, rating, body, source")
      .eq("featured", true)
      .order("reviewed_at", { ascending: false })
      .limit(3);
    if (!data || data.length === 0) return FALLBACK;
    return data as typeof FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-500" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < rating ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-25"} />
      ))}
    </div>
  );
}
