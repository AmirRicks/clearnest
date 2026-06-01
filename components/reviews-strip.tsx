import Link from "next/link";
import { Star, ArrowUpRight, ShieldCheck, Sparkles, Quote } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "./section";
import { BUSINESS } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/lib/supabase/types";

async function loadFeatured(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("reviews")
      .select("*")
      .eq("featured", true)
      .order("reviewed_at", { ascending: false })
      .limit(3);
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

export async function ReviewsStrip() {
  const reviews = await loadFeatured();
  // Brand-new business: until real reviews exist, show an honest trust/founding-customer angle.
  if (reviews.length === 0) return <FoundingCustomerStrip />;

  return (
    <Section id="reviews" className="bg-paper/40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Reviews</Eyebrow>
          <H2>What our customers say.</H2>
        </div>
        <a
          href={BUSINESS.yelpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
        >
          <Star className="h-4 w-4 fill-current text-[#d32323]" /> View on Yelp
        </a>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="glass-light glass-specular flex flex-col gap-4 rounded-3xl p-6"
          >
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={i < r.rating ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-25"} />
              ))}
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
  );
}

/** Honest "we just launched" trust section — no fabricated reviews. */
function FoundingCustomerStrip() {
  return (
    <Section id="reviews" className="bg-paper/40">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Eyebrow>Be one of our first</Eyebrow>
          <H2>New in Salt Lake County — and out to earn your trust.</H2>
          <Lead>
            ClearNest just launched, so we’re not going to show you reviews we don’t have yet.
            Instead, here’s our promise: book a founding clean, and if anything isn’t right, we
            make it right. Your honest review helps the next family find us.
          </Lead>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Become a founding customer <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={BUSINESS.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-5 py-3 text-sm font-medium text-charcoal transition hover:border-brand-300"
            >
              <Star className="h-4 w-4 fill-current text-[#d32323]" /> Our Yelp page
            </a>
          </div>
        </div>

        <div className="glass-light glass-specular rounded-3xl p-7">
          <Quote className="h-8 w-8 text-brand-300" />
          <p className="mt-4 text-lg font-medium leading-relaxed text-charcoal">
            “Our founding-customer promise: a detail-obsessed clean, an upfront price, and you
            only pay once you’re happy.”
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            {[
              { icon: ShieldCheck, t: "Insured & bonded — your home is protected" },
              { icon: Sparkles, t: "60-point checklist on every visit" },
              { icon: Star, t: "Satisfaction-first: we re-clean if it’s not right" },
            ].map((i) => (
              <div key={i.t} className="flex items-center gap-3 text-graphite">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <i.icon className="h-4 w-4" />
                </span>
                {i.t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
