import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Leaf,
} from "lucide-react";
import { SERVICES } from "@/lib/pricing";
import { BUSINESS, cn } from "@/lib/utils";
import { getLocation, LOCATION_SLUGS, LOCATIONS } from "@/lib/locations";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { MagneticButton } from "@/components/anim/magnetic";
import { HowItWorks } from "@/components/how-it-works";
import { CtaBand } from "@/components/cta-band";
import { QuickLeadForm } from "@/components/lead/quick-lead-form";
import { CityServiceJsonLd, FaqJsonLd } from "@/components/json-ld";

const BASE = "https://clearnest.services";

export function generateStaticParams() {
  return LOCATION_SLUGS.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) return {};
  const url = `${BASE}/house-cleaning/${loc.slug}`;
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${loc.metaTitle} · ClearNest`,
      description: loc.metaDescription,
      url,
      type: "website",
    },
  };
}

const TRUST = [
  "Insured & bonded",
  "Pay after the clean",
  "Eco & pet-safe",
  "Background-checked W-2 cleaners",
];

const WHY = [
  {
    icon: ShieldCheck,
    title: "Insured, bonded, vetted",
    body: "Every cleaner is a background-checked W-2 employee — never a gig contractor — with full liability coverage on every visit.",
  },
  {
    icon: Sparkles,
    title: "60-point checklist",
    body: "The same detail-first standard on every clean. No missed corners, no eyeballing it.",
  },
  {
    icon: CreditCard,
    title: "Pay after the clean",
    body: "No deposits, no surprises. You pay once the work is done and you've walked the home.",
  },
  {
    icon: Leaf,
    title: "Family- & pet-safe",
    body: "Pro-grade, low-VOC products. Fragrance-free eco upgrade available — just leave a note.",
  },
];

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) notFound();

  const url = `${BASE}/house-cleaning/${loc.slug}`;
  const services = Object.values(SERVICES);
  const featured = SERVICES[loc.featured];
  const nearby = loc.nearby
    .map((slug) => LOCATIONS.find((l) => l.slug === slug))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  const faqs = [
    {
      q: `Do you offer house cleaning in ${loc.city}?`,
      a: `Yes — ${loc.city} is part of our core service area. We clean homes across ${loc.neighborhoods
        .slice(0, 3)
        .join(", ")} and the surrounding ${loc.zips.join(
        ", "
      )} ZIP codes, with recurring, deep, move-in/out, and Airbnb turnover options.`,
    },
    {
      q: `How much does house cleaning cost in ${loc.city}?`,
      a: `It depends on the service and your home's size. Standard cleans start at $${SERVICES.standard.baseRate} and deep cleans at $${SERVICES.deep.baseRate}. Use our instant online estimator for a ${loc.city}-specific range — and you only pay after the clean is complete.`,
    },
    {
      q: `Are ClearNest cleaners insured and background-checked?`,
      a: `Always. Every ClearNest cleaner is a background-checked W-2 employee (never a gig contractor), and we carry full liability insurance and bonding for every ${loc.city} visit.`,
    },
    {
      q: `Can you handle Airbnb or rental turnovers in ${loc.city}?`,
      a: `Yes. Our turnover service includes linens, restocking, staging, and a damage and inventory report — coordinated around your check-in and check-out windows in ${loc.city}.`,
    },
  ];

  return (
    <>
      <CityServiceJsonLd city={loc.city} url={url} description={loc.metaDescription} />
      <FaqJsonLd items={faqs} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="container-tight pb-12 pt-14 md:pb-16 md:pt-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              Serving {loc.label}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 max-w-4xl text-balance display-1 text-charcoal">
              House Cleaning in {loc.city}
            </h1>
          </Reveal>
          <Lead>{loc.intro}</Lead>

          <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton href={`/book?city=${loc.slug}`}>Book a Cleaning</MagneticButton>
            <MagneticButton href={BUSINESS.phoneHref} variant="outline">
              <Phone className="h-4 w-4" /> {BUSINESS.phone}
            </MagneticButton>
          </Reveal>

          <RevealGroup className="mt-8 flex flex-wrap gap-2">
            {TRUST.map((t) => (
              <RevealItem key={t}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-graphite">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                  {t}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Services in this city */}
      <Section className="pt-4">
        <Eyebrow>{loc.angle}</Eyebrow>
        <H2>{`Cleaning services in ${loc.city}`}</H2>
        <Lead>
          Every visit follows our 60-point ClearNest checklist. Choose a service to book, or build a
          custom estimate online — there&rsquo;s never an upfront deposit.
        </Lead>

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((s) => {
            const isFeatured = s.id === loc.featured;
            return (
              <RevealItem key={s.id}>
                <article
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl border bg-background p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-card",
                    isFeatured ? "border-brand-300 ring-1 ring-brand-200" : "border-stone/70"
                  )}
                >
                  {isFeatured && (
                    <span className="absolute right-5 top-5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                      Popular in {loc.city}
                    </span>
                  )}
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite/80">
                    From ${s.baseRate}
                  </span>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-charcoal">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">{s.blurb}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-graphite">
                    <Clock className="h-3.5 w-3.5" />
                    Typical visit: {s.durationHrs[0]}–{s.durationHrs[1]} hours
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {s.includes.slice(0, 3).map((line) => (
                      <li key={line} className="flex items-start gap-2 text-graphite">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/book?service=${s.id}&city=${loc.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Book {s.name.split(" ")[0]} in {loc.city}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Why ClearNest */}
      <Section className="bg-paper/40">
        <Eyebrow>Why {loc.city} chooses ClearNest</Eyebrow>
        <H2>{`The premium standard for ${loc.city} homes`}</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {WHY.map((v) => (
            <div
              key={v.title}
              className="flex gap-4 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <v.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-charcoal">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Neighborhoods + map */}
      <Section>
        <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <Eyebrow>Where we clean</Eyebrow>
            <H2>{`Across ${loc.city} and nearby`}</H2>
            <Lead>
              We regularly clean homes throughout {loc.city}, including these neighborhoods and ZIP
              codes. Just outside the lines? Call us — we may still cover you.
            </Lead>

            <div className="mt-7 flex flex-wrap gap-2">
              {loc.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone/60 bg-paper/60 px-3 py-1.5 text-xs font-medium text-graphite"
                >
                  <MapPin className="h-3 w-3 text-brand-500" />
                  {n}
                </span>
              ))}
            </div>

            <p className="mt-6 text-sm text-graphite">
              <span className="font-semibold text-charcoal">ZIP codes:</span>{" "}
              {loc.zips.join(" · ")}
            </p>
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-stone/70 bg-paper shadow-soft">
            <iframe
              title={`${loc.city}, UT service area map`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `${loc.city}, Utah`
              )}&output=embed`}
            />
          </div>
        </div>
      </Section>

      <HowItWorks />

      {/* Local lead capture */}
      <Section className="bg-paper/40">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <Eyebrow>Free quote</Eyebrow>
            <H2>{`Get a free ${loc.city} cleaning quote`}</H2>
            <Lead>
              Tell us a little about your home and we&rsquo;ll text or email a {loc.city}-specific
              quote — usually the same day. No obligation, no deposit.
            </Lead>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-graphite">
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-stone/80 px-4 py-2 font-medium text-charcoal transition hover:border-brand-300"
              >
                <Phone className="h-4 w-4" /> Call {BUSINESS.phone}
              </a>
              <span className="inline-flex items-center gap-2 py-2">{BUSINESS.hours}</span>
            </div>
          </div>
          <div className="rounded-3xl border border-stone/70 bg-background p-6 shadow-soft sm:p-8">
            <QuickLeadForm
              defaults={{ source: `city:${loc.slug}`, serviceId: loc.featured }}
              cta={`Get my ${loc.city} quote`}
            />
          </div>
        </div>
      </Section>

      {/* Nearby areas */}
      {nearby.length > 0 && (
        <Section className="pt-0">
          <Eyebrow>Nearby</Eyebrow>
          <H2>Other areas we serve</H2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/house-cleaning/${n.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-stone/70 bg-background p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
              >
                <span>
                  <span className="block text-base font-semibold text-charcoal">{n.city}</span>
                  <span className="mt-0.5 block text-xs text-graphite">House cleaning</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-graphite transition group-hover:text-brand-600" />
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/house-cleaning"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              View all service areas <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      )}

      {/* Local FAQ */}
      <Section className="pt-0">
        <Eyebrow>FAQ</Eyebrow>
        <H2>{`House cleaning in ${loc.city} — common questions`}</H2>
        <div className="mt-10 divide-y divide-stone/70 overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
          {faqs.map((item) => (
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
