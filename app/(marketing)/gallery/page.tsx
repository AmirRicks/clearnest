"use client";

import { useMemo, useState } from "react";
import { BeforeAfter, type Category } from "@/components/before-after";
import { BEFORE_AFTER_PAIRS, HAS_REAL_PHOTOS, type BeforeAfterPair } from "@/lib/before-after";

type SyntheticPair = { id: string; label: string; category: Category };
type AnyPair = BeforeAfterPair | SyntheticPair;
function isRealPair(p: AnyPair): p is BeforeAfterPair {
  return "beforeSrc" in p;
}
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

/** Synthetic placeholder pairs — shown when there are no real photos yet. */
const SYNTHETIC_FALLBACK: { id: string; label: string; category: Category }[] = [
  { id: "kitchen-01", label: "Kitchen — deep clean", category: "Kitchen" },
  { id: "kitchen-02", label: "Kitchen — Airbnb reset", category: "Kitchen" },
  { id: "bath-01", label: "Master bath — restoration", category: "Bathroom" },
  { id: "bath-02", label: "Guest bath — standard", category: "Bathroom" },
  { id: "living-01", label: "Living room — recurring", category: "Living" },
  { id: "living-02", label: "Lounge — move-out", category: "Living" },
  { id: "airbnb-01", label: "Airbnb — same-day turnover", category: "Airbnb" },
  { id: "airbnb-02", label: "Airbnb — linens refresh", category: "Airbnb" },
];

type FilterKey = "All" | Category;

export default function GalleryPage() {
  const [filter, setFilter] = useState<FilterKey>("All");

  const pool: AnyPair[] = HAS_REAL_PHOTOS ? BEFORE_AFTER_PAIRS : SYNTHETIC_FALLBACK;

  // Live list of categories actually present (so we don't show empty filter chips).
  const filters: FilterKey[] = useMemo(() => {
    const set = new Set<Category>();
    for (const p of pool) set.add(p.category);
    return ["All", ...Array.from(set)];
  }, [pool]);

  const items = useMemo(() => {
    return filter === "All" ? pool : pool.filter((p) => p.category === filter);
  }, [filter, pool]);

  return (
    <>
      <Section>
        <Eyebrow>Before & After</Eyebrow>
        <H2>Drag the slider on any home to reveal the ClearNest difference.</H2>
        <Lead>
          {HAS_REAL_PHOTOS
            ? "Real cleanings, real homes — photographed straight from our jobs across the Salt Lake area."
            : "Real-feeling visuals built from our 60-point checklist — every category, hand-illustrated and interactive. Real customer photos coming soon."}
        </Lead>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                filter === f
                  ? "bg-charcoal text-white"
                  : "border border-stone/80 bg-background text-graphite hover:border-brand-300",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid items-start gap-5 md:grid-cols-2">
          {items.map((p) =>
            isRealPair(p) ? (
              <BeforeAfter
                key={p.id}
                label={p.label}
                category={p.category}
                beforeSrc={p.beforeSrc}
                afterSrc={p.afterSrc}
                width={p.width}
                height={p.height}
              />
            ) : (
              <BeforeAfter
                key={p.id}
                label={p.label}
                category={p.category}
              />
            )
          )}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
