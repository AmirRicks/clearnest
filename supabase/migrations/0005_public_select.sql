-- Allow anonymous availability lookups (calendar needs to read scheduled_for)
drop policy if exists bookings_public_select on public.bookings;
create policy bookings_public_select on public.bookings
  for select to anon, authenticated
  using (true);
