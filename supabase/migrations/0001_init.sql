-- ClearNest Cleaning Services — initial schema
-- Apply with: supabase db push (or paste into Supabase SQL editor)

------------------------------------------------------------
-- 1. Service Agreements
------------------------------------------------------------
create table if not exists public.agreements (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  customer_name       text not null,
  customer_email      text not null,
  signature_data_url  text not null,
  terms_version       text not null,
  signed_at           timestamptz not null default now(),
  ip_hash             text,
  booking_id          uuid
);

create index if not exists agreements_created_at_idx
  on public.agreements (created_at desc);

------------------------------------------------------------
-- 2. Bookings
------------------------------------------------------------
do $$ begin
  create type booking_status as enum (
    'pending','confirmed','in_progress','completed','invoiced','paid','canceled'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  service_id         text not null,
  scheduled_for      timestamptz not null,
  bedrooms           int  not null default 1,
  bathrooms          int  not null default 1,
  sqft               int  not null default 1000,
  estimated_low      int  not null,
  estimated_high     int  not null,
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text not null,
  address_line1      text not null,
  address_line2      text,
  city               text not null,
  state              text not null default 'UT',
  zip                text not null,
  access_notes       text,
  pets               text,
  special_requests   text,
  status             booking_status not null default 'pending',
  agreement_id       uuid references public.agreements(id) on delete set null,
  reschedule_count   int not null default 0
);

create index if not exists bookings_scheduled_for_idx
  on public.bookings (scheduled_for);
create index if not exists bookings_email_idx
  on public.bookings (customer_email);
create index if not exists bookings_status_idx
  on public.bookings (status);

alter table public.agreements
  add constraint agreements_booking_fk
  foreign key (booking_id) references public.bookings(id) on delete set null
  not valid;

------------------------------------------------------------
-- 3. Reviews (manual CMS — Yelp & testimonials)
------------------------------------------------------------
do $$ begin
  create type review_source as enum ('yelp','google','direct','facebook');
exception when duplicate_object then null; end $$;

create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  customer_name   text not null,
  location        text,
  rating          int  not null check (rating between 1 and 5),
  body            text not null,
  source          review_source not null default 'yelp',
  featured        boolean not null default false,
  reviewed_at     timestamptz not null default now()
);

create index if not exists reviews_featured_idx
  on public.reviews (featured desc, reviewed_at desc);

------------------------------------------------------------
-- 4. Site settings (admin-editable, e.g. Yelp URL)
------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('yelp_url',       'https://www.yelp.com/biz/clearnest-cleaning-services'),
  ('yelp_rating',    '5.0'),
  ('yelp_review_ct', '0'),
  ('booking_lead_hours', '24')
on conflict (key) do nothing;

------------------------------------------------------------
-- 5. Admins
------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.admins a where a.user_id = uid)
$$;

------------------------------------------------------------
-- 6. RLS
------------------------------------------------------------
alter table public.bookings      enable row level security;
alter table public.agreements    enable row level security;
alter table public.reviews       enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins        enable row level security;

-- Bookings: anonymous can INSERT only. Admins can do everything.
drop policy if exists bookings_public_insert on public.bookings;
create policy bookings_public_insert on public.bookings
  for insert to anon, authenticated
  with check (true);

drop policy if exists bookings_admin_all on public.bookings;
create policy bookings_admin_all on public.bookings
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Agreements: same model.
drop policy if exists agreements_public_insert on public.agreements;
create policy agreements_public_insert on public.agreements
  for insert to anon, authenticated
  with check (true);

drop policy if exists agreements_admin_all on public.agreements;
create policy agreements_admin_all on public.agreements
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Reviews: public SELECT, admin write.
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select to anon, authenticated using (true);

drop policy if exists reviews_admin_write on public.reviews;
create policy reviews_admin_write on public.reviews
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Settings: public SELECT, admin write.
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Admins table: only admins can read; only superuser inserts (via SQL).
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));
