-- 0004_revenue.sql
-- Sprint 2 — recurring plans, checkout add-ons, and gift cards.
-- Run once in the Supabase SQL editor (or `supabase db push`). Idempotent.

-- 1) Recurring frequency + add-ons on bookings ------------------------------
alter table public.bookings
  add column if not exists frequency    text    not null default 'one_time', -- one_time | monthly | biweekly | weekly
  add column if not exists addons       jsonb   not null default '[]'::jsonb, -- e.g. ["fridge","oven"]
  add column if not exists addons_total integer not null default 0,           -- dollars
  add column if not exists discount_pct integer not null default 0,           -- recurring discount applied
  add column if not exists gift_code    text;                                 -- redeemed gift card code (owner applies at invoice)

-- 2) Gift cards -------------------------------------------------------------
create table if not exists public.gift_cards (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  code                   text not null unique,
  amount                 integer not null,                 -- cents (face value)
  balance                integer not null,                 -- cents remaining
  status                 text not null default 'pending',  -- pending | active | redeemed | void
  purchaser_name         text,
  purchaser_email        text,
  recipient_name         text,
  recipient_email        text,
  message                text,
  stripe_session_id      text,
  stripe_payment_intent  text
);

alter table public.gift_cards enable row level security;

-- Gift-card codes are sensitive → no public read. Admin can manage in the
-- dashboard; the Stripe purchase webhook writes via the service-role key
-- (which bypasses RLS), so no anon insert/update policy is needed.
drop policy if exists gift_cards_admin_all on public.gift_cards;
create policy gift_cards_admin_all on public.gift_cards
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
