import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Clock, MapPin, Phone } from "lucide-react";
import { SERVICES } from "@/lib/pricing";
import { BUSINESS } from "@/lib/utils";
import { getServicePage, SERVICE_PAGE_SLUGS } from "@/lib/service-pages";
import { LOCATIONS } from "@/lib/locations";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { MagneticButton } from "@/components/anim/magnetic";
import { PriceEstimator } from "@/components/price-estimator";
import { HowItWorks } from "@/components/how-it-works";
import { CtaBand } from "@/components/cta-band";
import { FaqJsonLd } from "@/components/json-ld";

const BASE = "https://clearnest.services";

export function generateStaticParams() {
  return SERVICE_PAGE_SLUGS.map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const sp = getServicePage(service);
  if (!sp) return {};
  const url = `${BASE}/services/${sp.slug}`;
  return {
    title: sp.metaTitle,
    description: sp.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${sp.metaTitle} · ClearNest`,
      description: sp.metaDescription,
      url,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const sp = getServicePage(service);
  if (!sp) notFound();

  const svc = SERVICES[sp.serviceId];
  const url = `${BASE}/services/${sp.slug}`;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: svc.name,
    name: sp.metaTitle,
    description: sp.metaDescription,
    url,
    provider: {
      "@type": "HouseCleaningService",
      "@id": `${BASE}/#business`,
      name: BUSINESS.name,
      telephone: "+18014410726",
      url: BASE,
    },
    areaServed: { "@type": "City", name: "Salt Lake City, UT" },
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: svc.baseRate,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <FaqJsonLd items={sp.faqs} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-tight pb-12 pt-14 md:pb-16 md:pt-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
              {sp.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 max-w-4xl text-balance display-1 text-charcoal">{sp.h1}</h1>
          </Reveal>
          <Lead>{sp.intro}</Lead>

          <Reveal delay={0.12} className="mt-7 flex flex-wrap items-center gap-3 text-sm text-graphite">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone/60 bg-background/70 px-3 py-1.5 font-medium">
              From ${svc.baseRate}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone/60 bg-background/70 px-3 py-1.5 font-medium">
              <Clock className="h-3.5 w-3.5" /> Typical visit {svc.durationHrs[0]}–{svc.durationHrs[1]} hrs
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone/60 bg-background/70 px-3 py-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" /> Pay after the clean
            </span>
          </Reveal>

          <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton href={`/book?service=${sp.serviceId}`}>
              Book {svc.name.split(" ")[0]}
            </MagneticButton>
            <MagneticButton href={BUSINESS.phoneHref} variant="outline">
              <Phone className="h-4 w-4" /> {BUSINESS.phone}
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      {/* What's included */}
      <Section className="pt-4">
        <Eyebrow>What&rsquo;s included</Eyebrow>
        <H2>{`Every ${svc.name.toLowerCase()} covers`}</H2>
        <Lead>Each visit follows our 60-point ClearNest checklist. Here&rsquo;s the core of this service:</Lead>
        <RevealGroup className="mt-10 grid gap-3 sm:grid-cols-2">
          {svc.includes.map((line) => (
            <RevealItem key={line}>
              <div className="flex items-start gap-3 rounded-2xl border border-stone/70 bg-background p-4 shadow-soft">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <span className="text-sm leading-relaxed text-charcoal">{line}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Who it's for */}
      <Section className="bg-paper/40">
        <Eyebrow>Is it right for you?</Eyebrow>
        <H2>{`${svc.name} is a great fit for`}</H2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {sp.whoFor.map((w) => (
            <div
              key={w}
              className="flex items-start gap-3 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-sm leading-relaxed text-charcoal">{w}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Estimator (preselected to this service) */}
      <Section>
        <PriceEstimator asSection={false} defaultService={sp.serviceId} />
      </Section>

      <HowItWorks />

      {/* Available across the area — service → geo internal links */}
      <Section className="bg-paper/40">
        <Eyebrow>Where we work</Eyebrow>
        <H2>{`${svc.name} across the Salt Lake area`}</H2>
        <Lead>
          We provide {svc.name.toLowerCase()} in Salt Lake City and communities within about 40
          miles. Find your city for local details:
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
        <div className="mt-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            View all services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <Eyebrow>FAQ</Eyebrow>
        <H2>{`${svc.name} — common questions`}</H2>
        <div className="mt-10 divide-y divide-stone/70 overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
          {sp.faqs.map((item) => (
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
