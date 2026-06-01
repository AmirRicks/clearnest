"use client";

import { CountUp } from "@/components/anim/count-up";
import { Reveal } from "@/components/anim/reveal";

const STATS = [
  { value: 1200, suffix: "+", label: "Cleanings completed" },
  { value: 4.9, decimals: 1, label: "Average rating", suffix: "★" },
  { value: 98, suffix: "%", label: "Rebook rate" },
  { value: 60, suffix: "-pt", label: "Quality checklist" },
];

export function StatsBand() {
  return (
    <section className="relative py-16">
      <div className="container-tight">
        <div className="glass-light glass-specular grid grid-cols-2 gap-6 rounded-3xl p-8 md:grid-cols-4 md:p-10">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <div className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                <CountUp
                  value={s.value}
                  decimals={s.decimals ?? 0}
                  suffix={s.suffix ?? ""}
                />
              </div>
              <div className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-graphite">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
