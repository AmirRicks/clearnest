import type { Metadata } from "next";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";
import { ShieldCheck, Sparkles, HeartHandshake, Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "About ClearNest",
  description:
    "ClearNest is a locally owned cleaning service in Utah. Built on attention to detail, reliability, and care.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Insured, bonded, background-checked",
    body: "Every ClearNest pro is W-2, insured, and personally vetted. We respect your home like it’s ours.",
  },
  {
    icon: Sparkles,
    title: "Detail-first checklist",
    body: "Our 60-point cleaning checklist is the standard for every visit — no missed corners, no eyeballing it.",
  },
  {
    icon: HeartHandshake,
    title: "Pay after the clean",
    body: "We earn your trust at the end of the visit, not the start. No deposits. No surprise charges.",
  },
  {
    icon: Leaf,
    title: "Family- and pet-safe products",
    body: "Pro-grade, low-VOC formulas. Eco upgrade available on request — just leave a note when booking.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <Eyebrow>Our story</Eyebrow>
        <H2>A cleaning company built around how you actually live.</H2>
        <Lead>
          ClearNest started for one reason: the cleaning industry doesn’t feel modern. We built a
          service that’s easy to book, transparent about pricing, and obsessive about the details
          that make a home feel calm — not just &ldquo;cleaned.&rdquo;
        </Lead>
      </Section>

      <Section className="bg-paper/40">
        <Eyebrow>What we promise</Eyebrow>
        <H2>Every clean should feel fresh, detailed, and stress-free.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {values.map((v) => (
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

      <Section>
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Service area</Eyebrow>
            <H2>Proudly serving Salt Lake County.</H2>
            <Lead>
              Salt Lake City · Sandy · Holladay · Cottonwood Heights · Murray · Draper · West
              Jordan · South Jordan · West Valley · Millcreek · Riverton. Just outside? Call us —
              we may still cover you.
            </Lead>
          </div>
          <div className="aspect-video overflow-hidden rounded-3xl border border-stone/70 bg-paper shadow-soft">
            <iframe
              title="Service area map"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Salt+Lake+County,+Utah&output=embed"
            />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
