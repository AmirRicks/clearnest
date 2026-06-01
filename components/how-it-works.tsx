"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Sparkles, CreditCard } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "./section";

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

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-3xl border border-stone/70 bg-background p-7 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
                Step {i + 1}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-graphite">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
