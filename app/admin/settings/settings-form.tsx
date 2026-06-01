"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateSetting } from "../actions";

const FIELDS = [
  { key: "yelp_url", label: "Yelp profile URL", placeholder: "https://www.yelp.com/biz/clearnest-cleaning-services" },
  { key: "google_review_url", label: "Google review link (from Google Business Profile)", placeholder: "https://g.page/r/...review" },
  { key: "yelp_rating", label: "Yelp displayed rating", placeholder: "5.0" },
  { key: "yelp_review_ct", label: "Yelp displayed review count", placeholder: "0" },
  { key: "booking_lead_hours", label: "Minimum booking lead time (hours)", placeholder: "24" },
] as const;

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, start] = useTransition();

  const save = (key: string) => {
    start(async () => {
      const res = await updateSetting(key, values[key] ?? "");
      if (res.ok) toast.success("Saved.");
      else toast.error(res.error);
    });
  };

  return (
    <div className="grid gap-4">
      {FIELDS.map((f) => (
        <div
          key={f.key}
          className="grid gap-3 rounded-3xl border border-stone/70 bg-background p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center"
        >
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
              {f.label}
            </span>
            <input
              value={values[f.key] ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="rounded-2xl border border-stone/70 bg-background px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => save(f.key)}
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      ))}
    </div>
  );
}
