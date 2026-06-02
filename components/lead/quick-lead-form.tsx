"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Phone, MessageSquare } from "lucide-react";
import { submitLead } from "@/app/lead/actions";
import { trackEvent } from "@/components/analytics";
import type { ServiceId } from "@/lib/pricing";

export type LeadDefaults = {
  source: string;
  serviceId?: ServiceId | string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  estimatedLow?: number;
  estimatedHigh?: number;
};

export function QuickLeadForm({
  defaults,
  onDone,
  cta = "Get my free quote",
  compact = false,
}: {
  defaults: LeadDefaults;
  onDone?: () => void;
  cta?: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      toast.error("Add a phone or email so we can reach you.");
      return;
    }
    start(async () => {
      const res = await submitLead({
        name,
        phone,
        email,
        source: defaults.source,
        service_id: defaults.serviceId,
        bedrooms: defaults.bedrooms,
        bathrooms: defaults.bathrooms,
        sqft: defaults.sqft,
        estimated_low: defaults.estimatedLow,
        estimated_high: defaults.estimatedHigh,
      });
      if (res.ok) {
        setDone(true);
        trackEvent("lead_submitted", {
          source: defaults.source,
          service: String(defaults.serviceId ?? ""),
        });
        toast.success("Got it! We’ll text you your quote shortly.");
        onDone?.();
      } else {
        toast.error(res.error);
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
        <p className="text-sm font-semibold text-success">
          Thanks{name ? `, ${name.split(" ")[0]}` : ""}! Your request is in. 🌿
        </p>
        <p className="mt-1 text-sm text-graphite">
          We’ll reach out within the hour (Mon–Sat, 7am–7pm). Want your quote{" "}
          <span className="font-semibold text-charcoal">right now</span>? Text or call us:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="sms:+18014410726"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            <MessageSquare className="h-4 w-4" /> Text us now
          </a>
          <a
            href="tel:+18014410726"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone/70 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300"
          >
            <Phone className="h-4 w-4" /> (801) 441-0726
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Phone"
          className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {cta}
      </button>
      <p className="text-center text-[11px] text-graphite/80">
        No spam. We only use this to send your quote. Pay after the clean.
      </p>
    </form>
  );
}
