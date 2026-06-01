import type { Metadata } from "next";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { AGREEMENT_SECTIONS, AGREEMENT_VERSION } from "@/lib/agreement";

export const metadata: Metadata = {
  title: "Service Agreement",
  description:
    "ClearNest service agreement — scope, pricing, payment, cancellation, access, and liability.",
};

export default function AgreementPage() {
  return (
    <Section>
      <Eyebrow>Service Agreement · {AGREEMENT_VERSION}</Eyebrow>
      <H2>Plain-English terms for every ClearNest visit.</H2>
      <Lead>
        This is the same agreement you sign before your first booking. Take your time — questions
        are welcome at (801) 441-0726.
      </Lead>

      <div className="mt-12 grid gap-4">
        {AGREEMENT_SECTIONS.map((s) => (
          <article
            key={s.title}
            className="rounded-3xl border border-stone/70 bg-background p-6 shadow-soft"
          >
            <h3 className="text-base font-semibold tracking-tight text-charcoal">{s.title}</h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-graphite">{s.body}</p>
          </article>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-xs text-graphite">
        Agreement version {AGREEMENT_VERSION}. Last updated 2026. This document does not constitute
        legal advice; if you have specific concerns, please consult a licensed attorney.
      </p>
    </Section>
  );
}
