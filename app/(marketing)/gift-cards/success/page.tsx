import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Home } from "lucide-react";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Gift Card Sent — Thank You",
  robots: { index: false, follow: false },
};

export default function GiftSuccessPage() {
  return (
    <Section className="py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
          Your gift is on its way! 🎉
        </h1>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          Thank you for choosing ClearNest. We&rsquo;ve emailed the gift card and redemption code to
          your recipient, and a receipt with the code is heading to your inbox too.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-3xl border border-stone/70 bg-background p-6 text-left shadow-soft">
          <p className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Mail className="h-4 w-4 text-brand-600" /> What happens next
          </p>
          <ul className="mt-3 space-y-2 text-sm text-graphite">
            <li>• Your recipient gets their gift card email within a few minutes.</li>
            <li>• They redeem it by booking a clean and entering the code.</li>
            <li>• The balance is applied to their visit — gifts never expire.</li>
          </ul>
          <p className="mt-4 text-xs text-graphite">
            Didn&rsquo;t see your receipt? Check spam, or text us at (801) 441-0726 and we&rsquo;ll
            resend it.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Home className="h-4 w-4" /> Back home
          </Link>
          <Link
            href="/gift-cards"
            className="inline-flex items-center gap-2 rounded-full border border-stone/80 px-5 py-3 text-sm font-medium text-charcoal hover:border-brand-300"
          >
            Send another gift
          </Link>
        </div>
      </div>
    </Section>
  );
}
