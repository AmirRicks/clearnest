@AGENTS.md

# ClearNest — agent-specific notes

This is a Next.js **16** project — there are real breaking changes from Next 15. Before writing any code, check `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`:

- `params` / `searchParams` / `cookies()` / `headers()` are **async** — always `await`.
- Routing-layer file is `proxy.ts` (not `middleware.ts`).
- Turbopack is default for `next dev` and `next build` — no `--turbopack` flag.
- `experimental.turbopack` → top-level `turbopack` in `next.config.ts`.
- Tailwind is v4 — theme tokens live in `@theme inline { … }` in `app/globals.css`, not `tailwind.config.ts`.

## Project conventions

- `BUSINESS` in `lib/utils.ts` is the single source of truth for phone, email, hours, Yelp URL.
- All currency formatting goes through `formatCurrencyRange` / `formatCurrency`.
- Brand colors are Tailwind v4 tokens: `bg-brand-500`, `text-charcoal`, etc.
- Server Functions live under `app/<route>/actions.ts` with `"use server"` at top of file.
- RLS is enabled on every table — admin-only writes go through `requireAdmin()` in `app/admin/actions.ts`.

## Phase 1 vs Phase 2

Phase 1 (this code) ships: marketing site + booking with signed agreement + admin (bookings/reviews/settings).
Phase 2 (not yet): customer accounts, reschedule UI, Stripe pay-after-invoice, Resend confirmations, Twilio SMS. See `README.md` roadmap.
