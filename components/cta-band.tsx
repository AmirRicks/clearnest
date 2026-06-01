import Link from "next/link";
import { Phone } from "lucide-react";
import { BUSINESS } from "@/lib/utils";

export function CtaBand() {
  return (
    <section className="relative">
      <div className="container-tight py-24">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-8 py-16 text-white shadow-card sm:px-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]">
                Booking openings this week
              </span>
              <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
                Your home, restored. Your weekend, returned.
              </h2>
              <p className="mt-4 max-w-xl text-white/80">
                Book online in 60 seconds, or call us — we answer Monday through Saturday, 7am–7pm.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-800 shadow-card transition hover:bg-paper"
              >
                Book Cleaning
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> {BUSINESS.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
