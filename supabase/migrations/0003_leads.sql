-- Leads: capture the ~90% of visitors who aren't ready to book yet.
-- Sources: floating_cta, exit_intent, estimator, contact, other.

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text,
  email           text,
  phone           text,
  source          text not null default 'website',
  service_id      text,
  bedrooms        int,
  bathrooms       int,
  sqft            int,
  estimated_low   int,
  estimated_high  int,
  message         text,
  status          text not null default 'new'   -- new | contacted | won | lost
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

alter table public.leads enable row level security;

-- Anyone can submit a lead; only admins can read/manage.
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon, authenticated with check (true);

drop policy if exists leads_admin_all on public.leads;
create policy leads_admin_all on public.leads
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
