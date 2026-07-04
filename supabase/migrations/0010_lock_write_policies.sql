-- 0010_lock_write_policies.sql
-- Security hardening pass 2 (2026-07-03). Removes permissive PUBLIC WRITE
-- policies that let the public anon key (or a signed-in customer) bypass the
-- server actions' business rules by writing directly to the REST API.
--
-- All writes to these tables go through trusted SERVER paths that now use the
-- SERVICE-ROLE client (which bypasses RLS): app/book/actions.ts submitBooking,
-- app/account/actions.ts reschedule/cancel, /api/contact, lib/ai/actions.
-- A codebase scan confirmed NO client component writes these tables directly,
-- so removing the anon/owner write policies breaks nothing.
--
-- Findings this closes:
--   * bookings_public_insert `with check (true)` — anyone could POST directly to
--     /rest/v1/bookings with the public key and set status='paid' (fake a paid
--     job) or flood future slots with active bookings (calendar/slot DoS on the
--     booking funnel). The server action recomputes price server-side and lets
--     status default to 'pending'; only the direct-REST path was dangerous.
--   * bookings_owner_update — a signed-in customer could UPDATE their OWN booking
--     row's status to 'paid' (the policy only checked email ownership, not which
--     column changed) → free clean marked paid. Reschedule/cancel now run through
--     the service-role server action, which enforces the real status/lead rules.
--   * agreements_public_insert / leads_public_insert — direct-REST write spam with
--     no matching read policy; unused now that both inserts run service-role.
--
-- KEPT (still needed, still safe): bookings_owner_read + agreements_owner_read
-- (customers read their OWN rows, scoped by auth.email(), read-only),
-- reviews/settings public READ, and every *_admin_all / leads_admin_all policy.

drop policy if exists bookings_public_insert   on public.bookings;
drop policy if exists bookings_owner_update     on public.bookings;
drop policy if exists agreements_public_insert  on public.agreements;
drop policy if exists leads_public_insert       on public.leads;
