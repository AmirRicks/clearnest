"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Section } from "@/components/section";

export default function AccountLoginPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const prefill = params.get("email") ?? "";
  const [email, setEmail] = useState(prefill);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/account`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for the sign-in link.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn’t send link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Section>
      <div className="mx-auto max-w-md rounded-3xl border border-stone/70 bg-background p-8 shadow-card">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
          Customer sign-in
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal">
          See and manage your bookings.
        </h1>
        <p className="mt-2 text-sm text-graphite">
          Enter the email you booked with — we’ll send a one-tap sign-in link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm text-success">
            We sent a sign-in link to <strong>{email}</strong>. Open it on this device.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {pending ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
        <p className="mt-6 text-[11px] text-graphite">
          Not a customer yet?{" "}
          <a href="/book" className="text-brand-700 underline">
            Book your first cleaning
          </a>
          .
        </p>
      </div>
    </Section>
  );
}
