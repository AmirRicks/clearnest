-- AI Receptionist & Customer Support System

-- ai_conversations may already exist with different schema; migrate it
do $$
begin
  -- Add columns that might be missing from old schema
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'user_name') then
    alter table public.ai_conversations add column user_name text;
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
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'resolved') then
    alter table public.ai_conversations add column resolved boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ai_conversations' and column_name = 'metadata') then
    alter table public.ai_conversations add column metadata jsonb default '{}'::jsonb;
  end if;
  -- Index session_id for lookups
  if not exists (select 1 from pg_indexes where tablename = 'ai_conversations' and indexname = 'ai_conversations_session_idx') then
    create index if not exists ai_conversations_session_idx on public.ai_conversations (session_id);
  end if;
end $$;

create index if not exists ai_conversations_updated_idx on public.ai_conversations (updated_at desc);

-- Individual messages within conversations
create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  metadata        jsonb default '{}'::jsonb
);

create index if not exists ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

-- Support tickets
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
create index if not exists support_tickets_created_idx on public.support_tickets (created_at desc);

-- Refund requests
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
create index if not exists refund_requests_created_idx on public.refund_requests (created_at desc);

-- Booking requests
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

-- Daily AI summaries
create table if not exists public.ai_summaries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  summary_date    date not null unique,
  content         jsonb not null,
  generated_at    timestamptz not null default now()
);

create index if not exists ai_summaries_date_idx on public.ai_summaries (summary_date desc);

-- RLS
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.refund_requests enable row level security;
alter table public.booking_requests enable row level security;
alter table public.ai_summaries enable row level security;

-- Admin access policies (drop existing first, then recreate)
do $$ begin
  drop policy if exists ai_conversations_admin_all on public.ai_conversations;
  create policy ai_conversations_admin_all on public.ai_conversations
    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

  drop policy if exists ai_messages_admin_all on public.ai_messages;
  create policy ai_messages_admin_all on public.ai_messages
    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

  drop policy if exists support_tickets_admin_all on public.support_tickets;
  create policy support_tickets_admin_all on public.support_tickets
    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

  drop policy if exists refund_requests_admin_all on public.refund_requests;
  create policy refund_requests_admin_all on public.refund_requests
    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

  drop policy if exists booking_requests_admin_all on public.booking_requests;
  create policy booking_requests_admin_all on public.booking_requests
    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

  drop policy if exists ai_summaries_admin_all on public.ai_summaries;
  create policy ai_summaries_admin_all on public.ai_summaries
    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
end $$;
