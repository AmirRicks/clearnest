import Link from "next/link";
import { Phone, Mail, MessageSquare, Star } from "lucide-react";
import { BUSINESS } from "@/lib/utils";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-stone/60 bg-paper/60">
      <div className="container-tight grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-graphite">
            {BUSINESS.tagline} ClearNest delivers premium residential, deep, move-in/out, and
            Airbnb turnover cleaning in {BUSINESS.serviceArea}. Pay after the clean —
            satisfaction promised.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Phone className="h-4 w-4" /> {BUSINESS.phone}
            </a>
            <a
              href={BUSINESS.smsHref}
              className="inline-flex items-center gap-2 rounded-full border border-stone/80 px-4 py-2 text-sm font-medium text-charcoal hover:border-brand-300"
            >
              <MessageSquare className="h-4 w-4" /> Text us
            </a>
            <a
              href={BUSINESS.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-stone/80 px-4 py-2 text-sm font-medium text-charcoal hover:border-brand-300"
            >
              <Star className="h-4 w-4 fill-current text-[#d32323]" /> View on Yelp
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-graphite/70">Services</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/services#standard", l: "Standard Cleaning" },
              { href: "/services#deep", l: "Deep Cleaning" },
              { href: "/services#moveinout", l: "Move-In / Move-Out" },
              { href: "/services#airbnb", l: "Airbnb Turnover" },
              { href: "/book", l: "Get an Estimate" },
            ].map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-graphite transition hover:text-charcoal">
                  {i.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-graphite/70">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/about", l: "About Us" },
              { href: "/gallery", l: "Before & After" },
              { href: "/reviews", l: "Reviews" },
              { href: "/agreement", l: "Service Agreement" },
              { href: "/faq", l: "FAQ" },
              { href: "/contact", l: "Contact" },
            ].map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-graphite transition hover:text-charcoal">
                  {i.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-stone/60">
        <div className="container-tight flex flex-col items-start justify-between gap-3 py-6 text-xs text-graphite md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} ClearNest Cleaning Services. All rights reserved.
            Serving {BUSINESS.serviceArea}.
          </p>
          <div className="flex gap-5">
            <a className="hover:text-charcoal" href={BUSINESS.emailHref}>
              <Mail className="mr-1 inline h-3.5 w-3.5" />
              {BUSINESS.email}
            </a>
            <span>{BUSINESS.hours}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
