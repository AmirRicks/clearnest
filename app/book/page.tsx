import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { BookingWizard } from "@/components/booking-wizard";

export const metadata: Metadata = {
  title: "Book a Cleaning",
  description: "Book your ClearNest cleaning in 60 seconds. Pay after the service is complete.",
};

export default function BookPage() {
  return (
    <section className="container-tight py-16">
      <div className="mb-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
          Book online · pay after
        </span>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Let’s schedule your clean.
        </h1>
        <p className="mt-2 text-base text-graphite">
          We confirm by text within minutes — Tue–Sat, 7am–7pm.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-graphite">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
          Insured &amp; bonded · Background-checked · Pay after the clean
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-graphite">Loading…</p>}>
        <BookingWizard />
      </Suspense>
    </section>
  );
}
