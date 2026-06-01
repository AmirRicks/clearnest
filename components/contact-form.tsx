"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: data });
      if (!res.ok) throw new Error("Failed");
      toast.success("Thanks — we’ll be in touch within the hour.");
      form.reset();
    } catch {
      toast.error("Couldn’t send. Please call or text (801) 441-0726.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Phone" name="phone" type="tel" required />
      </div>
      <Field label="Email" name="email" type="email" required />
      <Field label="Message" name="message" textarea required />
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
      <p className="text-[11px] text-graphite/80">
        By submitting, you agree to be contacted by ClearNest at the info provided. Standard message
        rates apply.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={5}
          className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm text-charcoal placeholder:text-graphite/50 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm text-charcoal placeholder:text-graphite/50 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      )}
    </label>
  );
}
