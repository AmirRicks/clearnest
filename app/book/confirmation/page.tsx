import Link from "next/link";
import { Suspense } from "react";
import { Check, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/utils";
import { TrackOnMount } from "@/components/analytics";

export default function ConfirmationPage() {
  return (
    <section className="container-tight py-16">
      <TrackOnMount event="booking_completed" />
      <Suspense>
        <Inner />
      </Suspense>
    </section>
  );
}

function Inner() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
        <Check className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
        You’re booked. Welcome to ClearNest.
      </h1>
      <p className="mt-3 max-w-lg text-base text-graphite">
        We sent confirmation to your email and will text you 24 hours and 1 hour before your visit.
        Need anything in the meantime?
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a
          href={BUSINESS.phoneHref}
          className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Phone className="h-4 w-4" /> {BUSINESS.phone}
        </a>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-5 py-3 text-sm font-medium text-charcoal transition hover:border-brand-300"
        >
          Back to home
        </Link>
      </div>
      <p className="mt-8 text-xs text-graphite">
        A copy of your signed agreement is on file. You can request a PDF copy any time by replying
        to your confirmation email.
      </p>
    </div>
  );
}
