"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, MessageSquareText } from "lucide-react";
import { SERVICES, estimatePrice, type ServiceId } from "@/lib/pricing";
import { formatCurrencyRange } from "@/lib/utils";
import { Eyebrow, H2, Lead, Section } from "./section";
import { Modal } from "@/components/ui/modal";
import { QuickLeadForm } from "@/components/lead/quick-lead-form";

export function PriceEstimator({
  asSection = true,
  defaultService = "standard",
}: {
  asSection?: boolean;
  defaultService?: ServiceId;
}) {
  const [serviceId, setServiceId] = useState<ServiceId>(defaultService);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(1400);
  const [leadOpen, setLeadOpen] = useState(false);
  const [, startTransition] = useTransition();

  const estimate = estimatePrice({ serviceId, bedrooms, bathrooms, sqft });

  const Inner = (
    <>
    <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <Eyebrow>Instant estimate</Eyebrow>
        <H2>See your price in seconds — no signup.</H2>
        <Lead>
          Adjust the sliders to match your home. We’ll confirm the exact quote once we review
          service notes during scheduling.
        </Lead>

        <div className="mt-8 grid gap-6">
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
              Service type
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.values(SERVICES).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => startTransition(() => setServiceId(s.id as ServiceId))}
                  className={[
                    "rounded-2xl border px-3 py-3 text-left text-sm transition",
                    serviceId === s.id
                      ? "border-brand-500 bg-brand-50 text-brand-800 shadow-soft"
                      : "border-stone/70 bg-background text-graphite hover:border-stone",
                  ].join(" ")}
                >
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-graphite/70">
                    {s.name.split(" ")[0]}
                  </span>
                  <span className="block font-semibold text-charcoal">
                    {s.name.split(" ").slice(1).join(" ") || s.name}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <NumberRow label="Bedrooms" value={bedrooms} setValue={setBedrooms} min={0} max={6} />
          <NumberRow label="Bathrooms" value={bathrooms} setValue={setBathrooms} min={1} max={6} />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
                Square footage
              </span>
              <span className="rounded-md bg-paper px-2 py-1 text-sm font-semibold text-charcoal">
                {sqft.toLocaleString()} sq ft
              </span>
            </div>
            <input
              type="range"
              min={400}
              max={5000}
              step={50}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--color-brand-500)]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-graphite/70">
              <span>400</span><span>1,500</span><span>3,000</span><span>5,000</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-stone/70 bg-gradient-to-br from-background to-paper p-7 shadow-card"
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
            <Sparkles className="h-3.5 w-3.5" /> Estimated total
          </span>
          <motion.div
            key={`${serviceId}-${bedrooms}-${bathrooms}-${sqft}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5"
          >
            <p className="text-5xl font-semibold tracking-tight text-charcoal sm:text-6xl">
              {formatCurrencyRange(estimate.low, estimate.high)}
            </p>
            <p className="mt-2 text-sm text-graphite">
              Approx. {estimate.hours[0]}–{estimate.hours[1]} hours on site · final quote confirmed
              before service
            </p>
          </motion.div>

          <hr className="my-6 border-stone/60" />
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail k="Service" v={SERVICES[serviceId].name} />
            <Detail k="Bedrooms" v={bedrooms} />
            <Detail k="Bathrooms" v={bathrooms} />
            <Detail k="Size" v={`${sqft.toLocaleString()} sq ft`} />
          </dl>

          <Link
            href={`/book?service=${serviceId}&bedrooms=${bedrooms}&bathrooms=${bathrooms}&sqft=${sqft}`}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Book this cleaning
          </Link>
          <button
            type="button"
            onClick={() => setLeadOpen(true)}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone/70 bg-background px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-brand-300 hover:text-brand-700"
          >
            <MessageSquareText className="h-4 w-4" /> Text me this quote
          </button>
          <p className="mt-3 text-center text-[11px] text-graphite/80">
            Not ready to book? Get your price by text — no obligation.
          </p>
        </div>
      </motion.div>
    </div>

    <Modal open={leadOpen} onClose={() => setLeadOpen(false)}>
      <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
        Your quote · {SERVICES[serviceId].name}
      </span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal">
        We’ll text you {formatCurrencyRange(estimate.low, estimate.high)}
      </h2>
      <p className="mt-1.5 text-sm text-graphite">
        {bedrooms} bd · {bathrooms} ba · {sqft.toLocaleString()} sq ft. Drop your info and we’ll
        confirm your price + earliest opening.
      </p>
      <div className="mt-5">
        <QuickLeadForm
          defaults={{
            source: "estimator",
            serviceId,
            bedrooms,
            bathrooms,
            sqft,
            estimatedLow: estimate.low,
            estimatedHigh: estimate.high,
          }}
          onDone={() => setTimeout(() => setLeadOpen(false), 2600)}
        />
      </div>
    </Modal>
    </>
  );

  if (!asSection) return Inner;
  return <Section id="estimator">{Inner}</Section>;
}

function NumberRow({
  label,
  value,
  setValue,
  min,
  max,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
          {label}
        </span>
        <span className="rounded-md bg-paper px-2 py-1 text-sm font-semibold text-charcoal">
          {value}
        </span>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const n = min + i;
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setValue(n)}
              className={[
                "min-w-12 rounded-2xl border px-3 py-2 text-sm font-medium transition",
                active
                  ? "border-brand-500 bg-brand-500 text-white shadow-soft"
                  : "border-stone/70 bg-background text-graphite hover:border-stone",
              ].join(" ")}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-graphite/80">{k}</dt>
      <dd className="mt-1 font-semibold text-charcoal">{v}</dd>
    </div>
  );
}
