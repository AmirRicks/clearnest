"use client";

import { useState } from "react";
import { BeforeAfter } from "@/components/before-after";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

const ITEMS = [
  { id: "kitchen-01", label: "Kitchen — deep clean", category: "Kitchen" },
  { id: "kitchen-02", label: "Kitchen — Airbnb reset", category: "Kitchen" },
  { id: "bath-01", label: "Master bath — restoration", category: "Bathroom" },
  { id: "bath-02", label: "Guest bath — standard", category: "Bathroom" },
  { id: "living-01", label: "Living room — recurring", category: "Living" },
  { id: "living-02", label: "Lounge — move-out", category: "Living" },
  { id: "airbnb-01", label: "Airbnb — same-day turnover", category: "Airbnb" },
  { id: "airbnb-02", label: "Airbnb — linens refresh", category: "Airbnb" },
];

const FILTERS = ["All", "Kitchen", "Bathroom", "Living", "Airbnb"] as const;

export default function GalleryPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const items = filter === "All" ? ITEMS : ITEMS.filter((i) => i.category === filter);

  return (
    <>
      <Section>
        <Eyebrow>Before & After</Eyebrow>
        <H2>Drag the slider on any home to reveal the ClearNest difference.</H2>
        <Lead>
          Real-feeling visuals built from our 60-point checklist — every category, hand-illustrated
          and interactive.
        </Lead>

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
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
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((p) => (
            <BeforeAfter key={p.id} pair={p} />
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
