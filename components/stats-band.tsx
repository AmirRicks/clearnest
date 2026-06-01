"use client";

import { CreditCard, ShieldCheck, Leaf, BadgeCheck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { SpotlightCard } from "@/components/anim/spotlight-card";

/**
 * Trust pillars — honest, structural differentiators for a brand-new business.
 * No fabricated numbers/ratings. Every claim here is true for ClearNest.
 */
const PILLARS = [
  {
    icon: CreditCard,
    title: "Pay after the clean",
    body: "No upfront deposit. You only pay once the work is done and you’re happy.",
  },
  {
    icon: ShieldCheck,
    title: "Insured & bonded",
    body: "Fully covered for every visit, so your home and belongings are protected.",
  },
  {
    icon: Leaf,
    title: "Eco & pet-safe",
    body: "Low-VOC, family- and pet-friendly products by default — eco upgrade on request.",
  },
  {
    icon: BadgeCheck,
    title: "Background-checked team",
    body: "Every cleaner is vetted and W-2 employed — never anonymous gig contractors.",
  },
];

export function StatsBand() {
  return (
    <section className="relative py-16">
      <div className="container-tight">
        <Reveal className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
            Why homeowners choose ClearNest
          </span>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <RevealItem key={p.title}>
              <SpotlightCard className="glass-light glass-specular h-full rounded-3xl p-6 text-center transition hover:-translate-y-1 hover:shadow-card">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-charcoal">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">{p.body}</p>
              </SpotlightCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
