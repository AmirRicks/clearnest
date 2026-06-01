"use client";

import { CalendarCheck, Sparkles, CreditCard } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "./section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { SpotlightCard } from "@/components/anim/spotlight-card";

const steps = [
  {
    icon: CalendarCheck,
    title: "Book in 60 seconds",
    body: "Pick a service, choose a time, sign the agreement. Reschedule any time from your dashboard or by text.",
  },
  {
    icon: Sparkles,
    title: "We clean — detail-first",
    body: "Insured & bonded local crew arrives on time, walks the property with you, and leaves it photo-ready.",
  },
  {
    icon: CreditCard,
    title: "Pay after the clean",
    body: "Final invoice is sent after we finish. Pay by card, Apple Pay, or Google Pay — no upfront deposit.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Eyebrow>How it works</Eyebrow>
      <H2>Three steps to a noticeably cleaner home.</H2>
      <Lead>
        ClearNest feels like a luxury concierge service — modern, clear, and respectful of your
        time. No phone tag, no upfront charges.
      </Lead>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <RevealItem key={s.title}>
            <SpotlightCard className="group h-full rounded-3xl border border-stone/70 bg-background p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:scale-110 group-hover:bg-brand-100">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">{s.body}</p>
            </SpotlightCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
