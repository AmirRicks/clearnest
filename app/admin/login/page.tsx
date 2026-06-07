"use client";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const error = params.get("error");
  const message = params.get("message");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper/50">
      <div className="w-full max-w-sm rounded-3xl border border-stone/70 bg-background p-8 shadow-soft">
        <h1 className="text-center text-2xl font-bold tracking-tight text-charcoal">
          ClearNest Admin
        </h1>
        
        <form
          action="/api/admin/login"
          method="post"
          className="mt-6"
        >
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-graphite" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="mt-1 block w-full rounded-xl border border-stone/80 bg-paper/50 px-4 py-2.5 text-sm text-charcoal transition focus:border-charcoal focus:bg-background focus:outline-none focus:ring-1 focus:ring-charcoal"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-graphite" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="mt-1 block w-full rounded-xl border border-stone/80 bg-paper/50 px-4 py-2.5 text-sm text-charcoal transition focus:border-charcoal focus:bg-background focus:outline-none focus:ring-1 focus:ring-charcoal"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="group relative mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <span className="relative z-10">Sign In</span>
            <span className="shine-bar" />
          </button>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 text-center text-sm text-blue-600">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
