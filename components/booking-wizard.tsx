"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  SERVICES,
  estimatePrice,
  ADDONS,
  FREQUENCIES,
  type ServiceId,
  type AddonId,
  type FrequencyId,
} from "@/lib/pricing";
import { formatCurrencyRange } from "@/lib/utils";
import { SignaturePad } from "./signature-pad";
import { AGREEMENT_SECTIONS, AGREEMENT_VERSION } from "@/lib/agreement";
import { submitBooking, type BookingResult } from "@/app/book/actions";

const STEPS = ["Service", "Schedule", "Property", "You", "Agreement"] as const;
type Step = number;

const todayISO = (offsetDays = 1) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>(0);
  const [pending, startTransition] = useTransition();

  const [serviceId, setServiceId] = useState<ServiceId>(
    (params.get("service") as ServiceId) || "standard"
  );
  const [bedrooms, setBedrooms] = useState<number>(Number(params.get("bedrooms") || 2));
  const [bathrooms, setBathrooms] = useState<number>(Number(params.get("bathrooms") || 2));
  const [sqft, setSqft] = useState<number>(Number(params.get("sqft") || 1400));
  const [frequency, setFrequency] = useState<FrequencyId>(
    (params.get("frequency") as FrequencyId) in FREQUENCIES
      ? (params.get("frequency") as FrequencyId)
      : "one_time"
  );
  const [addons, setAddons] = useState<AddonId[]>([]);
  const toggleAddon = (id: AddonId) =>
    setAddons((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));

  const [date, setDate] = useState<string>(todayISO(2));
  const [time, setTime] = useState<string>("09:00");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("UT");
  const [zip, setZip] = useState("");
  const [access, setAccess] = useState("");
  const [pets, setPets] = useState("");
  const [requests, setRequests] = useState("");
  const [giftCode, setGiftCode] = useState("");

  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const estimate = useMemo(
    () => estimatePrice({ serviceId, bedrooms, bathrooms, sqft, addonIds: addons, frequency }),
    [serviceId, bedrooms, bathrooms, sqft, addons, frequency]
  );

  const canNext = (() => {
    switch (step) {
      case 0:
        return Boolean(serviceId);
      case 1:
        return Boolean(date && time);
      case 2:
        return bedrooms >= 0 && bathrooms >= 1 && sqft >= 400;
      case 3:
        return (
          name.trim().length > 1 &&
          /.+@.+\..+/.test(email) &&
          phone.replace(/\D/g, "").length >= 10 &&
          address1.trim().length > 2 &&
          city.trim().length > 1 &&
          zip.trim().length >= 4
        );
      case 4:
        return Boolean(signature) && agreed;
      default:
        return false;
    }
  })();

  const submit = () => {
    if (!signature) return toast.error("Please sign the agreement.");
    if (!agreed) return toast.error("Please confirm you accept the terms.");
    const scheduledFor = new Date(`${date}T${time}:00`).toISOString();

    startTransition(async () => {
      const res: BookingResult = await submitBooking({
        serviceId,
        scheduledFor,
        bedrooms,
        bathrooms,
        sqft,
        frequency,
        addons,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        addressLine1: address1,
        addressLine2: address2 || null,
        city,
        state,
        zip,
        accessNotes: access || null,
        pets: pets || null,
        specialRequests: requests || null,
        giftCode: giftCode || null,
        signatureDataUrl: signature,
      });
      if (res.ok) {
        toast.success("Booking confirmed — see you soon!");
        router.push(`/book/confirmation?id=${res.bookingId}`);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      {/* MAIN */}
      <div>
        <Stepper step={step} />
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <Step title="Choose your service" hint="Pick the level of clean that fits this visit.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.values(SERVICES).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setServiceId(s.id as ServiceId)}
                        className={[
                          "rounded-2xl border p-5 text-left transition",
                          serviceId === s.id
                            ? "border-brand-500 bg-brand-50 shadow-soft"
                            : "border-stone/70 bg-background hover:border-stone",
                        ].join(" ")}
                      >
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite/80">
                          From ${s.baseRate}
                        </span>
                        <span className="mt-1 block text-lg font-semibold text-charcoal">
                          {s.name}
                        </span>
                        <span className="mt-1 block text-sm text-graphite">{s.blurb}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
                      How often?
                    </span>
                    <p className="mt-1 text-sm text-graphite">
                      Set a recurring plan and save on <em>every</em> visit — you still pay after
                      each clean, no card on file.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {Object.values(FREQUENCIES).map((f) => {
                        const active = frequency === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFrequency(f.id as FrequencyId)}
                            className={[
                              "rounded-2xl border p-3 text-left transition",
                              active
                                ? "border-brand-500 bg-brand-50 shadow-soft"
                                : "border-stone/70 bg-background hover:border-stone",
                            ].join(" ")}
                          >
                            <span className="block text-sm font-semibold text-charcoal">{f.label}</span>
                            {f.discountPct > 0 ? (
                              <span className="mt-0.5 block text-[11px] font-semibold text-brand-700">
                                Save {f.discountPct}%
                              </span>
                            ) : (
                              <span className="mt-0.5 block text-[11px] text-graphite/80">Single visit</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Step>
              )}

              {step === 1 && (
                <Step title="Pick a date and time" hint="Visits start at the time you choose; team arrives within a 15-minute window.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Date" type="date" value={date} min={todayISO(1)} onChange={(v) => setDate(v)} />
                    <Input label="Start time" type="time" value={time} onChange={(v) => setTime(v)} />
                  </div>
                  <p className="mt-3 text-xs text-graphite">
                    24-hour notice required. Need same-day? Call (801) 441-0726.
                  </p>
                </Step>
              )}

              {step === 2 && (
                <Step title="Tell us about the home" hint="This helps us send the right-sized crew and time block.">
                  <NumberPicker label="Bedrooms" value={bedrooms} setValue={setBedrooms} min={0} max={6} />
                  <NumberPicker label="Bathrooms" value={bathrooms} setValue={setBathrooms} min={1} max={6} />
                  <div className="mt-3">
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
                  </div>

                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
                      Add-ons (optional)
                    </span>
                    <p className="mt-1 text-sm text-graphite">Tap any extras you'd like this visit.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {Object.values(ADDONS).map((a) => {
                        const active = addons.includes(a.id as AddonId);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleAddon(a.id as AddonId)}
                            className={[
                              "rounded-2xl border p-4 text-left transition",
                              active
                                ? "border-brand-500 bg-brand-50 shadow-soft"
                                : "border-stone/70 bg-background hover:border-stone",
                            ].join(" ")}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-charcoal">{a.name}</span>
                              <span className="text-sm font-semibold text-brand-700">+${a.price}</span>
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-graphite">{a.blurb}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Step>
              )}

              {step === 3 && (
                <Step title="Your contact and address" hint="We never share your info. Used only to confirm and run the visit.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full name" value={name} onChange={setName} required />
                    <Input label="Phone" type="tel" value={phone} onChange={setPhone} required />
                    <Input label="Email" type="email" value={email} onChange={setEmail} required wrap />
                    <Input label="Address" value={address1} onChange={setAddress1} required wrap />
                    <Input label="Unit / Apt (optional)" value={address2} onChange={setAddress2} />
                    <Input label="City" value={city} onChange={setCity} required />
                    <Input label="State" value={state} onChange={setState} required />
                    <Input label="ZIP" value={zip} onChange={setZip} required />
                  </div>
                  <Input
                    textarea
                    label="Access notes (key, code, lockbox, smart-lock)"
                    value={access}
                    onChange={setAccess}
                  />
                  <Input
                    label="Pets at home (type, name)"
                    value={pets}
                    onChange={setPets}
                  />
                  <Input
                    textarea
                    label="Special requests (areas to focus, allergies, eco upgrade)"
                    value={requests}
                    onChange={setRequests}
                  />
                  <Input
                    label="Gift card code (optional)"
                    value={giftCode}
                    onChange={(v) => setGiftCode(v.toUpperCase())}
                  />
                </Step>
              )}

              {step === 4 && (
                <Step title="Review and sign the agreement" hint="Plain-English terms — same as on /agreement.">
                  <div className="rounded-3xl border border-stone/70 bg-paper/40 p-5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
                      Agreement version {AGREEMENT_VERSION}
                    </span>
                    <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-stone/60 bg-background p-4 text-sm leading-relaxed text-graphite">
                      <ol className="grid gap-3">
                        {AGREEMENT_SECTIONS.map((s) => (
                          <li key={s.title}>
                            <span className="font-semibold text-charcoal">{s.title}.</span>{" "}
                            {s.body}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
                      Your signature
                    </span>
                    <div className="mt-3">
                      <SignaturePad
                        onChange={setSignature}
                        onEmpty={() => setSignature(null)}
                      />
                    </div>
                  </div>

                  <label className="mt-5 flex items-start gap-3 rounded-2xl border border-stone/70 bg-background p-4">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--color-brand-500)]"
                    />
                    <span className="text-sm text-graphite">
                      I have read and agree to the ClearNest Service Agreement and I am authorized
                      to engage cleaning services at the address provided.
                    </span>
                  </label>
                </Step>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone/80 bg-background px-4 py-2.5 text-sm font-medium text-charcoal transition hover:border-brand-300 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext || pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canNext || pending}
              className="inline-flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Booking…
                </>
              ) : (
                <>
                  Confirm booking <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SIDEBAR — running estimate */}
      <aside className="sticky top-24 h-fit overflow-hidden rounded-3xl border border-stone/70 bg-paper/60 p-6 shadow-card">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
          Your booking
        </span>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
          {formatCurrencyRange(estimate.low, estimate.high)}
        </p>
        {estimate.discountPct > 0 && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            {FREQUENCIES[frequency].label} · {estimate.discountPct}% off every clean
          </span>
        )}
        <p className="mt-2 text-xs text-graphite">
          Pay after the clean. Same-day reschedule allowed.
        </p>
        <hr className="my-5 border-stone/60" />
        <dl className="grid gap-3 text-sm">
          <Row k="Service" v={SERVICES[serviceId].name} />
          {frequency !== "one_time" && <Row k="Plan" v={FREQUENCIES[frequency].label} />}
          <Row k="Bedrooms" v={bedrooms} />
          <Row k="Bathrooms" v={bathrooms} />
          <Row k="Size" v={`${sqft.toLocaleString()} sq ft`} />
          {addons.length > 0 && (
            <Row
              k="Add-ons"
              v={
                <span className="block">
                  {addons.map((id) => (
                    <span key={id} className="block">
                      {ADDONS[id].name}{" "}
                      <span className="text-graphite/80">+${ADDONS[id].price}</span>
                    </span>
                  ))}
                </span>
              }
            />
          )}
          <Row k="Scheduled" v={`${date} · ${time}`} />
          {name && <Row k="Customer" v={name} />}
          {(city || zip) && <Row k="Location" v={`${city}${city ? ", " : ""}${state} ${zip}`} />}
        </dl>
      </aside>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li
            key={label}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium uppercase tracking-[0.16em]",
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : done
                ? "border-success/60 bg-success/10 text-success"
                : "border-stone/70 bg-background text-graphite",
            ].join(" ")}
          >
            {done ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{i + 1}</span>}
            {label}
          </li>
        );
      })}
    </ol>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-graphite">{hint}</p>
      <div className="mt-7 grid gap-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  wrap,
  textarea,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  wrap?: boolean;
  textarea?: boolean;
  min?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${wrap ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm text-charcoal focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      ) : (
        <input
          type={type}
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm text-charcoal focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      )}
    </label>
  );
}

function NumberPicker({
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
      <div className="mt-2 flex flex-wrap gap-2">
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

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-graphite/80">{k}</dt>
      <dd className="text-right text-sm font-medium text-charcoal">{v}</dd>
    </div>
  );
}
