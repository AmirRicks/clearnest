-- ClearNest — Production database sync (idempotent, safe to run any number of times)
-- =============================================================================
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run)
-- if the AI receptionist's logging, tickets, refunds, or admin conversation views
-- behave oddly after a deploy. It ensures every table + policy the app expects
-- exists. It is built entirely from `if not exists` / `drop policy if exists`, so
-- re-running it never destroys data.
--
-- NOTE: The customer booking CALENDAR does NOT depend on this file — it now reads
-- bookings via the service-role key (server-side), which bypasses RLS. This sync
-- only matters for the AI receptionist's persistence + admin review screens.
-- Prereqs assumed already present (from 0001_init / setup.sql): the `bookings`,
-- `leads`, `agreements`, `admins` tables, the `ai_conversations` table, and the
-- `public.is_admin(uuid)` helper. Those ship in earlier migrations.
-- =============================================================================

-- 1) Let anonymous visitors read bookings for availability (defense in depth;
--    the app prefers the service-role key, but this keeps the anon path working).
drop policy if exists bookings_public_select on public.bookings;
create policy bookings_public_select on public.bookings
  for select to anon, authenticated
  using (true);

-- 2) AI receptionist conversation columns (no-op if already present).
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'user_name') then
    alter table public.ai_conversations add column user_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'user_email') then
    alter table public.ai_conversations add column user_email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'user_phone') then
    alter table public.ai_conversations add column user_phone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'category') then
    alter table public.ai_conversations add column category text default 'general';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'summary') then
    alter table public.ai_conversations add column summary text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'message_count') then
    alter table public.ai_conversations add column message_count int not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'resolved') then
    alter table public.ai_conversations add column resolved boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'metadata') then
    alter table public.ai_conversations add column metadata jsonb default '{}'::jsonb;
  end if;
end $$;

-- 3) AI receptionist tables.
create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  metadata        jsonb default '{}'::jsonb
);
create index if not exists ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  customer_name   text,
  customer_email  text,
  customer_phone  text,
  issue_type      text not null default 'general',
  priority        text not null default 'low',
  status          text not null default 'new',
  description     text,
  metadata        jsonb default '{}'::jsonb,
  assigned_to     text
);
create index if not exists support_tickets_status_idx on public.support_tickets (status);
create index if not exists support_tickets_priority_idx on public.support_tickets (priority desc);

create table if not exists public.refund_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  service_date    text,
  address         text,
  reason          text not null,
  photo_urls      jsonb default '[]'::jsonb,
  status          text not null default 'new',
  admin_notes     text,
  metadata        jsonb default '{}'::jsonb
);
create index if not exists refund_requests_status_idx on public.refund_requests (status);

create table if not exists public.booking_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  address         text,
  bedrooms        int,
  bathrooms       int,
  property_type   text,
  cleaning_type   text,
  preferred_date  text,
  preferred_time  text,
  notes           text,
  status          text not null default 'new',
  metadata        jsonb default '{}'::jsonb
);
create index if not exists booking_requests_status_idx on public.booking_requests (status);

-- 4) Enable RLS.
alter table public.ai_messages      enable row level security;
alter table public.support_tickets  enable row level security;
alter table public.refund_requests  enable row level security;
alter table public.booking_requests enable row level security;

-- 5) Anonymous INSERT (the chat API uses the anon key server-side) + admin ALL.
do $$ begin
  -- ai_conversations: anon insert/select/update so the widget can log.
  drop policy if exists ai_conversations_anon_insert on public.ai_conversations;
  create policy ai_conversations_anon_insert on public.ai_conversations for insert to anon with check (true);
  drop policy if exists ai_conversations_anon_select on public.ai_conversations;
  create policy ai_conversations_anon_select on public.ai_conversations for select to anon using (true);
  drop policy if exists ai_conversations_anon_update on public.ai_conversations;
  create policy ai_conversations_anon_update on public.ai_conversations for update to anon using (true);

  drop policy if exists ai_messages_anon_insert on public.ai_messages;
  create policy ai_messages_anon_insert on public.ai_messages for insert to anon with check (true);

  drop policy if exists support_tickets_anon_insert on public.support_tickets;
  create policy support_tickets_anon_insert on public.support_tickets for insert to anon with check (true);

  drop policy if exists refund_requests_anon_insert on public.refund_requests;
  create policy refund_requests_anon_insert on public.refund_requests for insert to anon with check (true);

  drop policy if exists booking_requests_anon_insert on public.booking_requests;
  create policy booking_requests_anon_insert on public.booking_requests for insert to anon with check (true);

  -- Admin read/write across all AI tables.
  drop policy if exists ai_messages_admin_all on public.ai_messages;
  create policy ai_messages_admin_all on public.ai_messages for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
  drop policy if exists support_tickets_admin_all on public.support_tickets;
  create policy support_tickets_admin_all on public.support_tickets for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
  drop policy if exists refund_requests_admin_all on public.refund_requests;
  create policy refund_requests_admin_all on public.refund_requests for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
  drop policy if exists booking_requests_admin_all on public.booking_requests;
  create policy booking_requests_admin_all on public.booking_requests for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
end $$;
