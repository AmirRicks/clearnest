import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { LOCATIONS } from "@/lib/locations";
import { Eyebrow, H2, Lead, Section } from "./section";
import { RevealGroup, RevealItem } from "@/components/anim/reveal";

/**
 * Local-specificity trust section (grounded rule, ClearNest Services notebook
 * 2026-07-01): naming the real neighborhoods you serve signals "local resident,
 * not a national lead-gen site". Links feed the 17 real city landing pages.
 */
export function ServiceAreas() {
  return (
    <Section id="areas">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Where we clean</Eyebrow>
          <H2>Proudly local to Salt Lake County.</H2>
          <Lead>
            From the bungalows of Sugar House to new builds in Daybreak and slope-side condos in
            Park City — we live here, we drive these streets, and we know these homes.
          </Lead>
        </div>
        <Link
          href="/house-cleaning"
          className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
        >
          All service areas <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <RevealGroup className="mt-12 flex flex-wrap gap-2.5">
        {LOCATIONS.map((loc) => (
          <RevealItem key={loc.slug}>
            <Link
              href={`/house-cleaning/${loc.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-stone/70 bg-background px-4 py-2.5 text-sm font-medium text-charcoal transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              <MapPin className="h-3.5 w-3.5 text-brand-600 transition group-hover:scale-110" />
              {loc.city}
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-graphite">
        Same flat-rate pricing in every city — The Avenues, Sugar House, Daybreak, Suncrest, and
        every neighborhood in between. Don’t see yours?{" "}
        <Link href="/contact" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Ask us — we probably cover it.
        </Link>
      </p>
    </Section>
  );
}
