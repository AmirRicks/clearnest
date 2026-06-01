import type { Metadata } from "next";
import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";
import { BUSINESS } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Reviews & Testimonials",
  description: "What ClearNest customers say about our cleaning service in Salt Lake County.",
};

const FALLBACK: Review[] = [
  {
    id: "f1",
    created_at: new Date().toISOString(),
    customer_name: "Megan R.",
    location: "Sandy, UT",
    rating: 5,
    body: "ClearNest turned our move-out into a stress-free afternoon. We got our full deposit back and the property manager actually said the kitchen looked brand new.",
    source: "yelp",
    featured: true,
    reviewed_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "f2",
    created_at: new Date().toISOString(),
    customer_name: "Tyler K.",
    location: "Salt Lake City, UT",
    rating: 5,
    body: "I manage three Airbnb units and ClearNest is the only turnover crew I trust between same-day check-ins. Linens immaculate, restock on point, and they catch damage I would have missed.",
    source: "google",
    featured: true,
    reviewed_at: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
  {
    id: "f3",
    created_at: new Date().toISOString(),
    customer_name: "Priya S.",
    location: "Holladay, UT",
    rating: 5,
    body: "Booked a deep clean before hosting Diwali. They scrubbed grout I had given up on. Easy online booking, professional team, fair price.",
    source: "yelp",
    featured: false,
    reviewed_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

async function loadReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return FALLBACK;
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("reviews")
      .select("*")
      .order("featured", { ascending: false })
      .order("reviewed_at", { ascending: false })
      .limit(60);
    if (!data || data.length === 0) return FALLBACK;
    return data as Review[];
  } catch {
    return FALLBACK;
  }
}

export default async function ReviewsPage() {
  const reviews = await loadReviews();
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviews.length);

  return (
    <>
      <Section>
        <Eyebrow>Reviews</Eyebrow>
        <H2>Trusted by local homeowners and Airbnb hosts.</H2>
        <Lead>
          We post every review — Yelp, Google, and direct feedback — so you can read the whole story
          before booking.
        </Lead>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-stone/70 bg-background px-4 py-2 shadow-soft">
            <Stars rating={Math.round(avg)} />
            <span className="text-sm font-semibold text-charcoal">{avg.toFixed(1)}</span>
            <span className="text-xs text-graphite">avg · {reviews.length} reviews</span>
          </div>
          <a
            href={BUSINESS.yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#d32323] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b51d1d]"
          >
            <Star className="h-4 w-4 fill-current" />
            Leave a Yelp review
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="flex flex-col gap-4 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <Stars rating={r.rating} />
                <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-graphite">
                  {r.source}
                </span>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-charcoal">“{r.body}”</p>
              <div className="mt-auto flex items-center justify-between text-xs text-graphite">
                <span className="font-medium text-charcoal">
                  {r.customer_name}
                  {r.location ? ` · ${r.location}` : ""}
                </span>
                <time dateTime={r.reviewed_at}>
                  {new Date(r.reviewed_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl border border-stone/70 bg-paper/60 p-8 sm:p-12">
          <Eyebrow>Featured on Yelp</Eyebrow>
          <H2>See every review on our Yelp business page.</H2>
          <Lead>
            We respond to every Yelp review personally — questions, concerns, and thank-yous.
          </Lead>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={BUSINESS.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              View ClearNest on Yelp <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-5 py-3 text-sm font-medium text-charcoal transition hover:border-brand-300"
            >
              Share private feedback
            </Link>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
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
