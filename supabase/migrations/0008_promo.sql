-- 0008_promo.sql
-- Promo / discount codes on bookings (founding offer FOUNDING20 = 20% off the
-- first clean). The code registry lives in lib/promo.ts; these columns just
-- record what was applied so the owner invoices the right amount.
-- Run once in the Supabase SQL editor (or `supabase db push`). Idempotent.

alter table public.bookings
  add column if not exists promo_code         text,                       -- e.g. FOUNDING20 (null if none)
  add column if not exists promo_discount_pct integer not null default 0; -- percent applied (0 if none)
