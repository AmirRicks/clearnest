-- Phase 2 additions: invoices, magic-link customer access, reschedule history

------------------------------------------------------------
-- Booking enhancements
------------------------------------------------------------
alter table public.bookings
  add column if not exists stripe_invoice_id   text,
  add column if not exists stripe_invoice_url  text,
  add column if not exists last_reschedule_at  timestamptz,
  add column if not exists last_status_change  timestamptz default now();

create or replace function public.touch_booking_status()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.last_status_change := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_touch_booking_status on public.bookings;
create trigger trg_touch_booking_status
  before update on public.bookings
  for each row execute function public.touch_booking_status();

------------------------------------------------------------
-- Customer access by email (RLS — read your own bookings)
-- We rely on supabase.auth.email() so signed-in customers can view rows
-- where customer_email = their auth email.
------------------------------------------------------------
drop policy if exists bookings_owner_read on public.bookings;
create policy bookings_owner_read on public.bookings
  for select to authenticated
  using (
    lower(customer_email) = lower(auth.email())
    or public.is_admin(auth.uid())
  );

drop policy if exists bookings_owner_update on public.bookings;
create policy bookings_owner_update on public.bookings
  for update to authenticated
  using (lower(customer_email) = lower(auth.email()) or public.is_admin(auth.uid()))
  with check (lower(customer_email) = lower(auth.email()) or public.is_admin(auth.uid()));

drop policy if exists agreements_owner_read on public.agreements;
create policy agreements_owner_read on public.agreements
  for select to authenticated
  using (
    lower(customer_email) = lower(auth.email())
    or public.is_admin(auth.uid())
  );
