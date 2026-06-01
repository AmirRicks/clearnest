# ClearNest Cleaning Services

A premium, animated booking website for ClearNest Cleaning Services — built with Next.js 16, Tailwind v4, Framer Motion, and Supabase.

> **A Cleaner Home. A Clearer Mind.**
> Residential · Deep · Move-In/Out · Airbnb Turnover
> Salt Lake County, UT · **(801) 441-0726**

---

## What's inside

| Page | Path | Purpose |
| --- | --- | --- |
| Home | `/` | Cinematic hero with looping house-cleaning animation, services teaser, price estimator, gallery preview, reviews, CTA |
| Services | `/services` | Full service list + price estimator |
| Gallery | `/gallery` | Before/after interactive sliders, filterable by room |
| Reviews | `/reviews` | Pulls live testimonials from Supabase + manual Yelp link |
| About | `/about` | Story, promise, Salt Lake County map |
| FAQ | `/faq` | 8-question accordion |
| Contact | `/contact` | Click-to-call, click-to-text, mailto, contact form |
| Agreement | `/agreement` | Full service agreement (same text as booking flow) |
| Book | `/book` | 5-step wizard: service → schedule → property → contact → agreement signing |
| Confirmation | `/book/confirmation` | Post-booking thank-you |
| Admin login | `/admin/login` | Supabase Auth, admin-only |
| Admin bookings | `/admin` | Booking pipeline with one-click status updates |
| Admin reviews | `/admin/reviews` | Yelp/Google review CMS (add, edit, feature, delete) |
| Admin settings | `/admin/settings` | Yelp URL, rating, lead time, etc. |

## Tech

- **Next.js 16** (App Router, Turbopack default, React 19.2, Server Functions, async request APIs)
- **Tailwind CSS v4** (theme tokens in `@theme` inline)
- **Framer Motion** + hand-coded SVG animations + Lenis smooth scroll
- **Supabase** (Auth, Postgres, RLS) — bookings, agreements, reviews, settings, admins
- **signature_pad** — digital signature capture for the service agreement
- **Zod** validation in the booking server action

The hero house-cleaning scene, before/after gallery rooms, and price-estimator UI are all hand-built, not AI-generated stock — designed to feel unique to ClearNest.

---

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in Supabase keys
npm run dev
```

Visit http://localhost:3000.

Without Supabase keys the site still runs — the booking action returns a demo ID and the reviews fall back to seed testimonials. Add the keys and run the migration to enable persistence.

## Supabase setup

1. Create a new Supabase project at https://supabase.com/dashboard (recommended dedicated project for ClearNest).
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Open **SQL Editor** and paste `supabase/migrations/0001_init.sql`, then run.
4. (Optional) Paste `supabase/seed.sql` for starter testimonials.
5. Create your first admin:
   - In **Authentication → Users**, add a user with your email + password.
   - In **SQL Editor** run:
     ```sql
     insert into public.admins (user_id, email)
     select id, email from auth.users where email = 'YOUR_EMAIL';
     ```
6. Sign in at `/admin/login`.

## Deploy to Vercel

```bash
npm i -g vercel@latest
vercel link        # create / link a project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel deploy --prod
```

Or push to GitHub and connect the repo to Vercel — auto-deploys preview branches and promotes `main` to production. Domain is configured under **Project → Settings → Domains**.

---

## Phase 2 roadmap

| Feature | Approach |
| --- | --- |
| Customer accounts + reschedule/cancel UI | Supabase Auth (magic link) + `/account` route |
| Pay-after-service invoicing | Stripe invoice API + webhook → `bookings.status = paid` |
| Email confirmations | Resend on `submitBooking` success |
| SMS reminders | Twilio Functions on 24h / 1h cron |
| Photo before/after gallery | Supabase Storage bucket, admin upload UI |
| Yelp Fusion API | Hot-swap of the manual CMS when API access is approved |

---

## Brand

- **Logo**: animated nest mark in `components/logo.tsx`
- **Palette** (`app/globals.css`): paper, mist, stone, graphite, charcoal, brand (subtle blue), accent (warm gold)
- **Type**: Geist (display + body), via `next/font`
- **Motion timing**: `--ease-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`)

## Phone number

`(801) 441-0726` — appears in the nav, footer, hero CTA, contact page, FAQ, confirmation page, and CTA bands. Single source of truth in `lib/utils.ts → BUSINESS`.
