import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { LOCATIONS } from "@/lib/locations";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/anim/reveal";
import { CtaBand } from "@/components/cta-band";

const BASE = "https://clearnest.services";

export const metadata: Metadata = {
  title: "Service Areas — House Cleaning Near You",
  description:
    "ClearNest provides house, deep, move-out, and Airbnb cleaning across Salt Lake City and within 40 miles — Sandy, Holladay, Draper, South Jordan, Park City and more.",
  alternates: { canonical: `${BASE}/house-cleaning` },
};

export default function ServiceAreasPage() {
  return (
    <>
      <Section className="pb-6">
        <Eyebrow>Service areas</Eyebrow>
        <H2>House cleaning across the Salt Lake area</H2>
        <Lead>
          ClearNest serves Salt Lake City and communities within about 40 miles — from the
          Cottonwood canyons to Silicon Slopes and Park City. Find your city for local pricing,
          neighborhoods we cover, and one-tap booking.
        </Lead>
      </Section>

      <Section className="pt-2">
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((loc) => (
            <RevealItem key={loc.slug}>
              <Link
                href={`/house-cleaning/${loc.slug}`}
                className="group flex h-full flex-col justify-between gap-4 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-card"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-graphite/80">
                    <MapPin className="h-3.5 w-3.5 text-brand-500" />
                    {loc.label}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-charcoal">
                    House Cleaning in {loc.city}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">{loc.angle}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition group-hover:gap-2.5">
                  View {loc.city} <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10">
          <p className="text-sm text-graphite">
            Don&rsquo;t see your city? We may still cover you —{" "}
            <Link href="/contact" className="font-medium text-brand-700 hover:text-brand-800">
              get in touch
            </Link>{" "}
            and we&rsquo;ll let you know.
          </p>
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
