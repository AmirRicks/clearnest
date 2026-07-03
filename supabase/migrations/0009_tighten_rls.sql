-- 0009_tighten_rls.sql
-- Security hardening: remove over-broad ANONYMOUS read/tamper policies that
-- exposed customer PII through the public anon key.
--
-- Findings this closes (assessed 2026-07-03):
--   * bookings_public_select granted anon SELECT on ALL bookings (using true).
--     Every customer's name / email / phone / ADDRESS + full schedule was
--     world-readable with the public anon key. For a cleaning business the
--     schedule ("which house is empty when") is a physical-safety leak.
--     Availability reads use the SERVICE-ROLE client and FAIL OPEN
--     (app/book/availability-action.ts, lib/ai/actions.ts checkAvailability),
--     so no feature depends on this policy.
--   * ai_conversations_anon_select / _anon_update (using true) let anyone READ
--     and TAMPER with every chat conversation — including the name / email /
--     phone the receptionist captured. 42 real conversations were exposed at
--     assessment time. All conversation logging is server-side
--     (app/api/ai/chat → lib/ai/actions), now routed through the service-role
--     client, so anon read/update is unnecessary.
--
-- Unchanged: admin access (bookings_admin_all, ai_conversations_admin_all) and
-- the anon INSERT policies, which are intentionally KEPT as a graceful fallback
-- for the rare case SUPABASE_SERVICE_ROLE_KEY is unset — inserts cannot read
-- data back, so they leak nothing.

drop policy if exists bookings_public_select on public.bookings;

drop policy if exists ai_conversations_anon_select on public.ai_conversations;
drop policy if exists ai_conversations_anon_update on public.ai_conversations;
