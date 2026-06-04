import type { Metadata } from "next";
import Link from "next/link";
import { Star, ArrowUpRight, ShieldCheck, Sparkles, CreditCard, Leaf } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";
import { ReviewSchemaJsonLd } from "@/components/review-schema";
import { BUSINESS } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Manual type definition to bypass broken type generation
export interface Review {
  id: string;
  created_at: string;
  customer_name: string;
  location: string | null;
  rating: number;
  body: string;
  source: "yelp" | "google" | "direct" | "facebook";
  featured: boolean;
  reviewed_at: string;
}

export const metadata: Metadata = {
  title: "Reviews & Testimonials",
  description:
    "ClearNest Cleaning Services reviews. A new, insured, locally owned cleaning company in Salt Lake County — book a founding clean and share your honest feedback.",
};

async function loadReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("reviews")
      .select("*")
      .order("featured", { ascending: false })
      .order("reviewed_at", { ascending: false })
      .limit(60);
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await loadReviews();
  const hasReviews = reviews.length > 0;
  const avg = hasReviews
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <ReviewSchemaJsonLd />
      <Section>
        <Eyebrow>Reviews</Eyebrow>
        {hasReviews ? (
          <>
            <H2>What our customers say.</H2>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-stone/70 bg-background px-4 py-2 shadow-soft">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < Math.round(avg) ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-25"} />
                ))}
              </div>
              <span className="text-sm font-semibold text-charcoal">{avg.toFixed(1)}</span>
              <span className="text-xs text-graphite">· {reviews.length} reviews</span>
            </div>
          </>
        ) : (
          <>
            <H2>New in town — out to earn your trust.</H2>
            <Lead>
              ClearNest recently launched in Salt Lake County. Rather than show reviews we haven’t
              earned yet, we’d rather earn yours. Book a founding clean — we’ll make it exceptional,
              and your honest review helps the next family find us.
            </Lead>
          </>
        )}
      </Section>

      {hasReviews ? (
        <Section className="pt-0">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article key={r.id} className="glass-light glass-specular flex flex-col gap-4 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={i < r.rating ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-25"} />
                    ))}
                  </div>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-graphite">
                    {r.source}
                  </span>
                </div>
                <p className="text-pretty text-sm leading-relaxed text-charcoal">“{r.body}”</p>
                <div className="mt-auto text-xs text-graphite">
                  <span className="font-medium text-charcoal">{r.customer_name}</span>
                  {r.location ? ` · ${r.location}` : ""}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : (
        <Section className="pt-0">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CreditCard, t: "Pay after the clean", s: "No deposit, ever." },
              { icon: ShieldCheck, t: "Insured & bonded", s: "Your home is protected." },
              { icon: Leaf, t: "Eco & pet-safe", s: "Family-friendly products." },
              { icon: Sparkles, t: "60-point checklist", s: "Nothing missed." },
            ].map((p) => (
              <div key={p.t} className="glass-light glass-specular rounded-3xl p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-charcoal">{p.t}</h3>
                <p className="mt-1 text-sm text-graphite">{p.s}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section className={hasReviews ? "" : "pt-0"}>
        <div className="glass-light glass-specular rounded-3xl p-8 sm:p-12">
          <Eyebrow>{hasReviews ? "Share your experience" : "Be our first review"}</Eyebrow>
          <H2>
            {hasReviews
              ? "Loved your clean? Tell the world."
              : "Booked with us? Your review means everything."}
          </H2>
          <Lead>
            We read and respond to every review personally. It’s the single biggest way you can
            help a new local business grow.
          </Lead>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={BUSINESS.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#d32323] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b51d1d]"
            >
              <Star className="h-4 w-4 fill-current" /> Review us on Yelp <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Book a cleaning
            </Link>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
