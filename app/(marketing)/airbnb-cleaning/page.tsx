import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ArrowUpRight,
  BedDouble,
  Camera,
  ClipboardList,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Leaf,
} from "lucide-react";
import { BUSINESS } from "@/lib/utils";
import { SERVICES } from "@/lib/pricing";
import { LOCATIONS } from "@/lib/locations";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { MagneticButton } from "@/components/anim/magnetic";
import { PriceEstimator } from "@/components/price-estimator";
import { HowItWorks } from "@/components/how-it-works";
import { CtaBand } from "@/components/cta-band";
import { SpotlightCard } from "@/components/anim/spotlight-card";
import { FaqJsonLd } from "@/components/json-ld";

const BASE = "https://clearnest.services";
const PAGE_URL = `${BASE}/airbnb-cleaning`;

export const metadata: Metadata = {
  title: "Airbnb Turnover Cleaning Salt Lake City, UT",
  description:
    "Reliable Airbnb and short-term rental turnover cleaning in Salt Lake City, Park City, and across Salt Lake County. Linens, restock, staging, and a damage report between every guest. Book online — pay after the clean.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Airbnb Turnover Cleaning Salt Lake City · ClearNest",
    description:
      "Professional STR turnover cleaning for Airbnb, VRBO, and short-term rental hosts across Salt Lake County. Same-day turns available. Pay after the clean.",
    url: PAGE_URL,
    type: "website",
  },
};

const WHAT_WE_DO = [
  {
    icon: BedDouble,
    title: "Linens stripped, washed & remade",
    body: "We handle every bed: strip, wash, dry, and make — so your listing looks hotel-fresh for the next guest.",
  },
  {
    icon: ClipboardList,
    title: "Essentials restock from your checklist",
    body: "We restock toiletries, paper goods, and kitchen staples from supplies you keep on-site, so nothing is missing at check-in.",
  },
  {
    icon: Sparkles,
    title: "Full kitchen & bathroom reset",
    body: "Counters, sinks, toilets, tubs, mirrors — everything wiped, scrubbed, and guest-ready.",
  },
  {
    icon: RefreshCw,
    title: "Trash, recycling & dishes",
    body: "Every bin emptied, recycling sorted, dishes cleared and put away. Zero trace of the previous guest.",
  },
  {
    icon: Camera,
    title: "Damage & inventory report",
    body: "After each turn we photograph anything damaged, missing, or low — so you know before the next guest arrives.",
  },
  {
    icon: Clock,
    title: "Same-day turns",
    body: "Short checkout-to-checkin windows are our specialty. Share your booking calendar and we'll coordinate around it.",
  },
];

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: "Insured & bonded" },
  { icon: CreditCard, label: "Pay after the clean" },
  { icon: Leaf, label: "Eco & pet-safe products" },
  { icon: CheckCircle2, label: "Background-checked cleaners" },
];

const FAQS = [
  {
    q: "Can you work around my Airbnb check-in and check-out times?",
    a: "Yes — that's built into the service. Share your booking windows and we'll schedule the turn between guests, including tight same-day windows (advance notice required).",
  },
  {
    q: "Do you handle linens?",
    a: "Yes. We strip, wash, dry, and remake every bed with your linens. If you want hotel-style staging, we can make the beds that way too.",
  },
  {
    q: "What's in the damage and inventory report?",
    a: "After each turn we photograph and note anything damaged, broken, missing, or running low — including consumables. You get the report before the next guest checks in so you can address issues in time.",
  },
  {
    q: "Do you serve Park City short-term rentals?",
    a: "Yes. Park City's high-volume STR market is a core part of our service area. We cover Salt Lake City, Park City, Sandy, Draper, South Jordan, and the broader Salt Lake County.",
  },
  {
    q: "Do you restock supplies?",
    a: "We restock from supplies you provide on-site (toilet paper, soap, paper towels, coffee, etc.). We work from a checklist you give us so the experience is consistent for every guest.",
  },
  {
    q: "What if I need a turnover on short notice?",
    a: "Text or call (801) 441-0726 — we'll do our best to fit you in. For planned last-minute turns, sharing your calendar in advance gives us the most flexibility.",
  },
  {
    q: "How much does a turnover clean cost?",
    a: "Pricing is based on the size of your rental. Use the instant estimator on this page to get a range for your specific unit — no deposit, and you pay after the clean is done.",
  },
];

const svc = SERVICES["airbnb"];

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Airbnb Turnover Cleaning",
  name: "Airbnb & Short-Term Rental Turnover Cleaning — Salt Lake City",
  description:
    "Professional Airbnb and VRBO turnover cleaning in Salt Lake City, Park City, and Salt Lake County. Includes linens, restock, staging, and an inspection report between every guest.",
  url: PAGE_URL,
  provider: {
    "@type": "HouseCleaningService",
    "@id": `${BASE}/#business`,
    name: BUSINESS.name,
    telephone: "+18014410726",
    url: BASE,
  },
  areaServed: [
    { "@type": "City", name: "Salt Lake City, UT" },
    { "@type": "City", name: "Park City, UT" },
    { "@type": "City", name: "Sandy, UT" },
    { "@type": "City", name: "Draper, UT" },
    { "@type": "City", name: "South Jordan, UT" },
    { "@type": "City", name: "West Jordan, UT" },
    { "@type": "City", name: "Murray, UT" },
  ],
  offers: {
    "@type": "Offer",
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "USD",
      minPrice: svc.baseRate,
    },
  },
};

export default function AirbnbCleaningPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <FaqJsonLd items={FAQS} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 pb-20 pt-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_60%_-10%,theme(colors.brand.400/0.18),transparent)]" />
        <div className="container-wide relative z-10">
          <div className="max-w-2xl">
            <Reveal>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
                Airbnb &amp; STR turnover · Salt Lake City, UT
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="display-1 text-white">
                Airbnb Turnover<br />
                <span className="text-accent">Cleaning</span> That<br />
                Keeps Guests Happy
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Reliable, guest-ready turnovers for Airbnb, VRBO, and short-term rental hosts across Salt Lake County and Park City. Linens made, essentials restocked, damage photographed — every time.
              </p>
            </Reveal>

            <Reveal delay={0.16} className="mt-5 flex flex-wrap gap-2">
              {TRUST_CHIPS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {label}
                </span>
              ))}
            </Reveal>

            <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton href="/book?service=airbnb">
                Book a Turnover
              </MagneticButton>
              <MagneticButton href={BUSINESS.phoneHref} variant="outline">
                <Phone className="h-4 w-4" /> {BUSINESS.phone}
              </MagneticButton>
            </Reveal>

            {/* Quick chips */}
            <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/60">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                From ${svc.baseRate}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" /> {svc.durationHrs[0]}–{svc.durationHrs[1]} hrs per turn
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Pay after the clean
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── What we do ───────────────────────────────────────── */}
      <Section>
        <Eyebrow>What&rsquo;s included</Eyebrow>
        <H2>Everything a host needs between guests</H2>
        <Lead>
          Every ClearNest turnover covers the full checklist — linens, restock, staging, and a damage report. You get a guest-ready unit and a paper trail, every single time.
        </Lead>
        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_WE_DO.map((item) => (
            <RevealItem key={item.title}>
              <SpotlightCard className="glass-light glass-specular flex h-full flex-col gap-4 rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold leading-snug text-charcoal">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-graphite">{item.body}</p>
                </div>
              </SpotlightCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ── Why hosts choose ClearNest ───────────────────────── */}
      <Section className="bg-paper/40">
        <Eyebrow>Why hosts choose us</Eyebrow>
        <H2>Built for STR hosts, not one-time cleans</H2>
        <Lead>
          Most cleaning companies treat turnovers like a standard clean. We built our process specifically around Airbnb and short-term rental needs.
        </Lead>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "No deposit — ever",
              body: "You pay after each turnover is done, not before. Your cash flow stays intact between bookings.",
            },
            {
              title: "Consistent every visit",
              body: "The same 60-point checklist, the same standards, the same report format — so your guests get a 5-star experience every check-in.",
            },
            {
              title: "Coordinate around your calendar",
              body: "Share your Airbnb booking window with us and we'll show up between checkout and check-in — no chasing required.",
            },
            {
              title: "Damage reports protect your listing",
              body: "Every turn ends with a photo report of anything broken, missing, or low. You're never blindsided by a guest complaint about something a previous guest caused.",
            },
          ].map((item) => (
            <Reveal key={item.title}>
              <div className="flex items-start gap-4 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-charcoal">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-graphite">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Price estimator ──────────────────────────────────── */}
      <Section>
        <PriceEstimator asSection={false} defaultService="airbnb" />
      </Section>

      <HowItWorks />

      {/* ── Service area ─────────────────────────────────────── */}
      <Section className="bg-paper/40">
        <Eyebrow>Where we work</Eyebrow>
        <H2>Airbnb turnover cleaning across Salt Lake County</H2>
        <Lead>
          We cover the full Salt Lake area — from downtown SLC to the Cottonwood Canyons, West Valley, and the Park City STR corridor. Find your city:
        </Lead>
        <div className="mt-8 flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <Link
              key={loc.slug}
              href={`/house-cleaning/${loc.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-graphite transition hover:border-brand-300 hover:text-brand-700"
            >
              <MapPin className="h-3 w-3 text-brand-500" />
              {loc.city}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/services/airbnb-turnover"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Full Airbnb service details <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-charcoal"
          >
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <Section className="pt-0">
        <Eyebrow>FAQ</Eyebrow>
        <H2>Airbnb turnover cleaning — common questions</H2>
        <div className="mt-10 divide-y divide-stone/70 overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-charcoal marker:content-['']">
                {item.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-stone/70 bg-paper text-graphite transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-graphite">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
