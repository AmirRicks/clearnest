-- Allow anonymous users to INSERT for AI chat widget
-- (API route uses anon key server-side; RLS must permit it)

do $$ begin
  -- ai_conversations: anon can insert + select + update
  drop policy if exists ai_conversations_anon_insert on public.ai_conversations;
  create policy ai_conversations_anon_insert on public.ai_conversations
    for insert to anon with check (true);

  drop policy if exists ai_conversations_anon_select on public.ai_conversations;
  create policy ai_conversations_anon_select on public.ai_conversations
    for select to anon using (true);

  drop policy if exists ai_conversations_anon_update on public.ai_conversations;
  create policy ai_conversations_anon_update on public.ai_conversations
    for update to anon using (true);

  -- ai_messages: anon can insert
  drop policy if exists ai_messages_anon_insert on public.ai_messages;
  create policy ai_messages_anon_insert on public.ai_messages
    for insert to anon with check (true);

  -- support_tickets: anon can insert
  drop policy if exists support_tickets_anon_insert on public.support_tickets;
  create policy support_tickets_anon_insert on public.support_tickets
    for insert to anon with check (true);

  -- refund_requests: anon can insert
  drop policy if exists refund_requests_anon_insert on public.refund_requests;
  create policy refund_requests_anon_insert on public.refund_requests
    for insert to anon with check (true);

  -- booking_requests: anon can insert
  drop policy if exists booking_requests_anon_insert on public.booking_requests;
  create policy booking_requests_anon_insert on public.booking_requests
    for insert to anon with check (true);
end $$;
