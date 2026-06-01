"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/pricing";
import { Eyebrow, H2, Lead, Section } from "./section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { SpotlightCard } from "@/components/anim/spotlight-card";

export function ServicesTeaser() {
  const services = Object.values(SERVICES);
  return (
    <Section id="services-teaser" className="bg-paper/40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Services</Eyebrow>
          <H2>The right level of clean for every home.</H2>
          <Lead>
            Whether it’s a weekly tidy or a move-out reset, every visit follows our 60-point
            ClearNest checklist.
          </Lead>
        </div>
        <Reveal direction="left">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
          >
            View all services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <RevealItem key={s.id}>
            <SpotlightCard className="group flex h-full flex-col rounded-3xl border border-stone/70 bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite/80">
                From ${s.baseRate}
              </span>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-charcoal">{s.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-graphite">{s.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-graphite">
                {s.includes.slice(0, 3).map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/book?service=${s.id}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition group-hover:gap-2.5"
              >
                Book {s.name.split(" ")[0]}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </SpotlightCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
