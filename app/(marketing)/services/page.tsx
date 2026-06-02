import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/pricing";
import { SERVICE_SLUG_BY_ID } from "@/lib/service-pages";
import { PriceEstimator } from "@/components/price-estimator";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Cleaning Services & Pricing",
  description:
    "Standard, deep, move-in/out, and Airbnb turnover cleaning in Salt Lake County. Transparent pricing, online booking, pay after service.",
};

export default function ServicesPage() {
  const services = Object.values(SERVICES);

  return (
    <>
      <Section className="pt-16">
        <Eyebrow>Services & pricing</Eyebrow>
        <H2>Premium cleaning for every kind of home.</H2>
        <Lead>
          Each visit follows our 60-point ClearNest checklist. Build a custom estimate below, or
          choose a service to book.
        </Lead>
      </Section>

      <Section id="all-services" className="-mt-12">
        <div className="grid gap-6">
          {services.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="grid gap-6 rounded-3xl border border-stone/70 bg-background p-7 shadow-soft md:grid-cols-[1.2fr_1.8fr_auto] md:items-center"
            >
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite/80">
                  From ${s.baseRate}
                </span>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-charcoal">
                  {s.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{s.blurb}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-graphite">
                  <Clock className="h-3.5 w-3.5" />
                  Typical visit: {s.durationHrs[0]}–{s.durationHrs[1]} hours
                </div>
                <div className="mt-4">
                  <Link
                    href={`/services/${SERVICE_SLUG_BY_ID[s.id]}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition hover:gap-2.5 hover:text-brand-800"
                  >
                    Learn more <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {s.includes.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-graphite">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/book?service=${s.id}`}
                className="inline-flex h-fit items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Book {s.name.split(" ")[0]}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section className="bg-paper/40">
        <PriceEstimator asSection={false} />
      </Section>

      <CtaBand />
    </>
  );
}
