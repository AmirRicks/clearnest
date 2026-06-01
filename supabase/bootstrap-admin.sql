-- Make yourself an admin (so you can see /admin/leads, bookings, reviews).
--
-- Run this AFTER:
--   1) running supabase/setup.sql, and
--   2) creating a user in Supabase → Authentication → Users
--      (Add user → email + a password you'll remember).
--
-- Replace the email below with the one you used, then Run.

insert into public.admins (user_id, email)
select id, email from auth.users
where email = 'YOUR_EMAIL_HERE'
on conflict (user_id) do nothing;

-- Verify it worked (should return your row):
select * from public.admins;
