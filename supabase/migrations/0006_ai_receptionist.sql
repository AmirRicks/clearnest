-- AI Receptionist & Customer Support System

-- Conversation sessions
create table if not exists public.ai_conversations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  session_id    text not null unique,
  user_name     text,
  user_email    text,
  user_phone    text,
  message_count int not null default 0,
  category      text default 'general',         -- general | booking | support | refund | complaint
  summary       text,
  resolved      boolean not null default false,
  metadata      jsonb default '{}'::jsonb
);

create index if not exists ai_conversations_session_idx on public.ai_conversations (session_id);
create index if not exists ai_conversations_updated_idx on public.ai_conversations (updated_at desc);
create index if not exists ai_conversations_category_idx on public.ai_conversations (category);

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
  issue_type      text not null default 'general',  -- general | complaint | reschedule | cancellation | refund
  priority        text not null default 'low',       -- low | medium | high
  status          text not null default 'new',        -- new | open | in_progress | resolved | closed
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
  service_date    text,         -- date of service YYYY-MM-DD
  address         text,
  reason          text not null,
  photo_urls      jsonb default '[]'::jsonb,  -- array of URLs if photos uploaded
  status          text not null default 'new', -- new | under_review | approved | denied | more_info
  admin_notes     text,
  metadata        jsonb default '{}'::jsonb
);

create index if not exists refund_requests_status_idx on public.refund_requests (status);
create index if not exists refund_requests_created_idx on public.refund_requests (created_at desc);

-- Booking requests (pre-booking info collected by AI)
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
  property_type   text,         -- house | apartment | condo
  cleaning_type   text,         -- standard | deep | move_in | move_out | recurring
  preferred_date  text,         -- YYYY-MM-DD
  preferred_time  text,         -- HH:mm
  notes           text,
  status          text not null default 'new', -- new | contacted | converted | closed
  metadata        jsonb default '{}'::jsonb
);

create index if not exists booking_requests_status_idx on public.booking_requests (status);

-- Daily AI summaries
create table if not exists public.ai_summaries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  summary_date    date not null unique,
  content         jsonb not null,   -- { new_leads, booking_requests, refund_requests, support_tickets, common_questions, ... }
  generated_at    timestamptz not null default now()
);

create index if not exists ai_summaries_date_idx on public.ai_summaries (summary_date desc);

-- RLS: only admin can read/write AI tables
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.refund_requests enable row level security;
alter table public.booking_requests enable row level security;
alter table public.ai_summaries enable row level security;

-- Admin access policies for all AI tables
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ai_conversations' and policyname = 'ai_conversations_admin_all') then
    create policy ai_conversations_admin_all on public.ai_conversations
      for all to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'ai_messages' and policyname = 'ai_messages_admin_all') then
    create policy ai_messages_admin_all on public.ai_messages
      for all to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'support_tickets' and policyname = 'support_tickets_admin_all') then
    create policy support_tickets_admin_all on public.support_tickets
      for all to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'refund_requests' and policyname = 'refund_requests_admin_all') then
    create policy refund_requests_admin_all on public.refund_requests
      for all to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'booking_requests' and policyname = 'booking_requests_admin_all') then
    create policy booking_requests_admin_all on public.booking_requests
      for all to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'ai_summaries' and policyname = 'ai_summaries_admin_all') then
    create policy ai_summaries_admin_all on public.ai_summaries
      for all to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;
end $$;
