import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowUpRight, CalendarHeart, CreditCard, Repeat, Sparkles } from "lucide-react";
import { FREQUENCIES, ADDONS } from "@/lib/pricing";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { CtaBand } from "@/components/cta-band";

const BASE = "https://clearnest.services";

export const metadata: Metadata = {
  title: "Cleaning Plans & Memberships — Save Every Visit",
  description:
    "Recurring house-cleaning plans in the Salt Lake area — weekly, biweekly, or monthly. Save up to 20% on every clean. Still pay after each visit, no deposit, no card on file. Cancel anytime.",
  alternates: { canonical: `${BASE}/plans` },
};

const PLAN_ORDER = ["weekly", "biweekly", "monthly", "one_time"] as const;

const HOW = [
  { icon: Repeat, title: "Set your rhythm", body: "Pick weekly, biweekly, or monthly. We hold your spot with the same trusted cleaner where possible." },
  { icon: CreditCard, title: "Pay after each clean", body: "Your standing discount applies every visit — and you still pay after we're done. No deposit, no card on file." },
  { icon: CalendarHeart, title: "Skip or cancel anytime", body: "Going on vacation? Skip a visit. Want to stop? Cancel anytime — no contracts, no fees." },
];

export default function PlansPage() {
  return (
    <>
      {/* Hero */}
      <Section className="pb-6">
        <Eyebrow>Plans & memberships</Eyebrow>
        <H2>A consistently clean home — for less, every time.</H2>
        <Lead>
          Set a recurring plan and save up to <strong className="text-charcoal">20% on every
          clean</strong>. You still pay after each visit — no deposit, no card on file, cancel or
          skip anytime. It&rsquo;s the easiest way to never think about cleaning again.
        </Lead>
      </Section>

      {/* Plan cards */}
      <Section className="pt-2">
        <RevealGroup className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((id) => {
            const f = FREQUENCIES[id];
            const popular = id === "biweekly";
            return (
              <RevealItem key={id}>
                <div
                  className={[
                    "relative flex h-full flex-col rounded-3xl border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card",
                    popular ? "border-brand-400 ring-1 ring-brand-200" : "border-stone/70",
                  ].join(" ")}
                >
                  {popular && (
                    <span className="absolute -top-3 left-6 rounded-full bg-brand-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold tracking-tight text-charcoal">{f.label}</h3>
                  <p className="mt-1 text-sm text-graphite">{f.short}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-brand-700">
                      {f.discountPct > 0 ? `${f.discountPct}%` : "—"}
                    </span>
                    {f.discountPct > 0 && (
                      <span className="text-sm font-medium text-graphite">off / visit</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{f.blurb}</p>
                  <ul className="mt-4 grid gap-2 text-sm">
                    <li className="flex items-start gap-2 text-graphite">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> Same 60-point checklist
                    </li>
                    <li className="flex items-start gap-2 text-graphite">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> Pay after each clean
                    </li>
                    <li className="flex items-start gap-2 text-graphite">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{" "}
                      {id === "one_time" ? "No commitment" : "Skip or cancel anytime"}
                    </li>
                  </ul>
                  <Link
                    href={`/book?frequency=${id}`}
                    className={[
                      "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
                      popular
                        ? "bg-charcoal text-white hover:bg-brand-700"
                        : "border border-stone/80 bg-background text-charcoal hover:border-brand-300",
                    ].join(" ")}
                  >
                    Choose {f.label} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* How it works */}
      <Section className="bg-paper/40">
        <Eyebrow>How memberships work</Eyebrow>
        <H2>All the savings, none of the lock-in.</H2>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {HOW.map((h) => (
            <RevealItem key={h.title}>
              <div className="glass-light glass-specular h-full rounded-3xl p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <h.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{h.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Add-ons menu */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow><Sparkles className="h-3.5 w-3.5 text-accent" /> Make it spotless</Eyebrow>
            <H2>Add-ons, any visit.</H2>
            <Lead>Tap on extras during booking — applied to that visit&rsquo;s clean.</Lead>
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(ADDONS).map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-stone/70 bg-background p-5 shadow-soft"
            >
              <div>
                <h3 className="text-sm font-semibold text-charcoal">{a.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-graphite">{a.blurb}</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">
                +${a.price}
              </span>
            </div>
          ))}
        </div>
        <Reveal className="mt-8">
          <Link
            href="/book?frequency=biweekly"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Build your plan &amp; book <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
