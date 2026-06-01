import type { Metadata } from "next";
import { Phone, MessageSquare, Mail, MapPin, Clock } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { ContactForm } from "@/components/contact-form";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact ClearNest",
  description: "Call, text, or message ClearNest Cleaning Services. We answer Mon–Sat 7am–7pm.",
};

export default function ContactPage() {
  return (
    <Section>
      <Eyebrow>Contact</Eyebrow>
      <H2>We&apos;re here Monday through Saturday.</H2>
      <Lead>Call, text, or send a message — we usually reply within an hour.</Lead>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-3 self-start">
          <Channel
            icon={Phone}
            title="Call us"
            href={BUSINESS.phoneHref}
            primary={BUSINESS.phone}
            secondary="Tap to call — we answer live or return missed calls within the hour."
          />
          <Channel
            icon={MessageSquare}
            title="Text us"
            href={BUSINESS.smsHref}
            primary={BUSINESS.phone}
            secondary="Fastest for quick questions, scheduling, and pre-booking estimates."
          />
          <Channel
            icon={Mail}
            title="Email"
            href={BUSINESS.emailHref}
            primary={BUSINESS.email}
            secondary="For agreements, invoices, and account questions."
          />
          <div className="rounded-3xl border border-stone/70 bg-paper/60 p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-graphite">
              <Clock className="h-3.5 w-3.5" /> Hours
            </div>
            <p className="mt-2 text-sm text-charcoal">{BUSINESS.hours}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-graphite">
              <MapPin className="h-3.5 w-3.5" /> Service area
            </div>
            <p className="mt-2 text-sm text-charcoal">{BUSINESS.serviceArea}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-stone/70 bg-background p-7 shadow-card">
          <h3 className="text-lg font-semibold tracking-tight text-charcoal">Send a message</h3>
          <p className="mt-1 text-sm text-graphite">
            Not ready to book? Drop us a note and we&apos;ll reach out.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Channel({
  icon: Icon,
  title,
  href,
  primary,
  secondary,
}: {
  icon: React.ElementType;
  title: string;
  href: string;
  primary: string;
  secondary: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-4 rounded-3xl border border-stone/70 bg-background p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
          {title}
        </span>
        <p className="mt-0.5 text-lg font-semibold tracking-tight text-charcoal">{primary}</p>
        <p className="mt-1 text-sm text-graphite">{secondary}</p>
      </div>
    </a>
  );
}
