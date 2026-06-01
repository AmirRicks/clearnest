"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

const QUESTIONS = [
  {
    q: "Do I have to pay upfront?",
    a: "No. ClearNest invoices you after the cleaning is complete and you’ve walked the property with our team. Pay by card, Apple Pay, or Google Pay — we never charge a deposit.",
  },
  {
    q: "How is the price calculated?",
    a: "Pricing is based on service type, bedrooms, bathrooms, and approximate square footage. Use the on-site estimator for an instant range; we confirm the final number before the visit if anything changes.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes — anytime up to 24 hours before your visit, free of charge. Same-day reschedules are accommodated when possible. Cancellations inside 24 hours are subject to a 25% travel fee.",
  },
  {
    q: "Do I need to be home?",
    a: "Not at all. Most customers leave a key, code, or smart-lock instructions during booking. We text you when we arrive and when we’re done — with photos on request.",
  },
  {
    q: "Are you insured and bonded?",
    a: "Yes. ClearNest carries full general liability and bonding for every visit. Every cleaner is background-checked and W-2 employed — no gig contractors.",
  },
  {
    q: "What products do you use?",
    a: "Pro-grade, low-VOC formulas that are safe for kids and pets. We offer an eco upgrade (plant-based, fragrance-free) — leave a note during booking and we’ll set it up.",
  },
  {
    q: "Do you handle Airbnb turnovers?",
    a: "Yes — this is a core service. We coordinate with your check-in/out windows, restock essentials, swap linens, and send a damage and inventory report after every visit.",
  },
  {
    q: "Do I have to sign an agreement?",
    a: "Yes — a short digital service agreement is required at booking. It covers scope, payment, cancellation, access, and damage policies. Takes about 60 seconds to read and sign.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <Section>
        <Eyebrow>FAQ</Eyebrow>
        <H2>Common questions, answered.</H2>
        <Lead>Don’t see what you need? Text us at (801) 441-0726.</Lead>

        <div className="mt-12 divide-y divide-stone/70 overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <button
                key={item.q}
                onClick={() => setOpen(isOpen ? null : i)}
                className="block w-full px-6 py-5 text-left transition hover:bg-paper/60"
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="text-base font-semibold text-charcoal">{item.q}</span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-stone/70 bg-paper text-graphite">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </span>
                <span
                  className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <span className="min-h-0 block">
                    <span className="mt-3 block text-pretty text-sm leading-relaxed text-graphite">
                      {item.a}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
