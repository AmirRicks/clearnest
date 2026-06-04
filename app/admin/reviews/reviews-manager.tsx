"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Star, Trash2, Save } from "lucide-react";
import { upsertReview, deleteReview } from "../actions";
// Manual type
interface Review {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  body: string;
  source: "yelp" | "google" | "direct" | "facebook";
  featured: boolean;
  reviewed_at: string;
}

const SOURCES: Review["source"][] = ["yelp", "google", "direct", "facebook"];

const blank = (): Partial<Review> => ({
  customer_name: "",
  location: "",
  rating: 5,
  body: "",
  source: "yelp",
  featured: false,
  reviewed_at: new Date().toISOString().slice(0, 10),
});

export function ReviewsManager({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [pending, start] = useTransition();

  const save = () => {
    if (!editing) return;
    if (!editing.customer_name || !editing.body) {
      toast.error("Name and review body required.");
      return;
    }
    start(async () => {
      const res = await upsertReview({
        id: editing.id,
        customer_name: editing.customer_name!,
        location: editing.location ?? null,
        rating: Number(editing.rating ?? 5),
        body: editing.body!,
        source: (editing.source ?? "yelp") as Review["source"],
        featured: Boolean(editing.featured),
        reviewed_at: new Date(editing.reviewed_at ?? new Date()).toISOString(),
      });
      if (res.ok) {
        toast.success("Saved.");
        setEditing(null);
        // refresh on next load
        location.reload();
      } else {
        toast.error(res.error);
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    start(async () => {
      const res = await deleteReview(id);
      if (res.ok) {
        toast.success("Deleted.");
        setReviews((rs) => rs.filter((r) => r.id !== id));
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="grid gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Reviews CMS</h1>
          <p className="mt-1 text-sm text-graphite">
            Manually mirror your Yelp / Google reviews here. Featured reviews show on the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(blank())}
          className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add review
        </button>
      </header>

      {editing && (
        <div className="rounded-3xl border border-brand-200 bg-brand-50/40 p-6 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Customer name"
              value={editing.customer_name ?? ""}
              onChange={(v) => setEditing({ ...editing, customer_name: v })}
            />
            <Field
              label="Location (e.g. Sandy, UT)"
              value={editing.location ?? ""}
              onChange={(v) => setEditing({ ...editing, location: v })}
            />
            <Field
              label="Rating (1–5)"
              type="number"
              value={String(editing.rating ?? 5)}
              onChange={(v) => setEditing({ ...editing, rating: Number(v) })}
            />
            <SelectField
              label="Source"
              value={editing.source ?? "yelp"}
              options={SOURCES}
              onChange={(v) => setEditing({ ...editing, source: v as Review["source"] })}
            />
            <Field
              label="Reviewed on"
              type="date"
              value={(editing.reviewed_at ?? "").slice(0, 10)}
              onChange={(v) => setEditing({ ...editing, reviewed_at: v })}
            />
            <label className="flex items-end gap-3 md:col-span-1">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-brand-500)]"
                checked={Boolean(editing.featured)}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              <span className="text-sm text-graphite">Featured (homepage)</span>
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
                Review body
              </span>
              <textarea
                className="mt-1.5 w-full rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                rows={4}
                value={editing.body ?? ""}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {pending ? "Saving…" : "Save review"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-graphite hover:text-charcoal"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {reviews.length === 0 && <p className="text-sm text-graphite">No reviews yet.</p>}
        {reviews.map((r) => (
          <article
            key={r.id}
            className="grid gap-4 rounded-3xl border border-stone/70 bg-background p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <div className="flex items-center gap-2 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < r.rating ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-25"}
                  />
                ))}
                <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-graphite">
                  {r.source}
                </span>
                {r.featured && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-brand-800">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-charcoal">“{r.body}”</p>
              <p className="mt-1 text-xs text-graphite">
                {r.customer_name}
                {r.location ? ` · ${r.location}` : ""} · {new Date(r.reviewed_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 md:flex-col md:items-end">
              <button
                type="button"
                onClick={() => setEditing(r)}
                className="rounded-full border border-stone/80 bg-background px-3 py-1.5 text-xs font-medium text-charcoal hover:border-brand-300"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="inline-flex items-center gap-1 rounded-full border border-danger/40 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-stone/70 bg-background px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-stone/70 bg-background px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
