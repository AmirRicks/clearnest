"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const forbidden = params.get("forbidden") === "1";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper/40 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-stone/70 bg-background p-8 shadow-card">
        <Logo />
        <h1 className="mt-7 text-2xl font-semibold tracking-tight text-charcoal">
          ClearNest admin
        </h1>
        <p className="mt-1 text-sm text-graphite">
          Sign in to manage bookings, reviews, and site settings.
        </p>

        {forbidden && (
          <div className="mt-5 rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            That account isn’t set up as an admin. Contact the site owner.
          </div>
        )}

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
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-graphite">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-stone/70 bg-background px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-[11px] text-graphite/80">
          Don’t have an admin login? See the README for how to bootstrap the first admin via SQL.
        </p>
      </div>
    </div>
  );
}
