# Go Live: connect Supabase + Resend (make the lead machine real)

Goal: leads/bookings **save to a database** and you get an **instant email** for every new lead.
Time: ~15 minutes. You do the account steps (I can't log in for you); I redeploy + verify.

---

## Part 1 — Supabase (saves leads, bookings, reviews) · ~8 min

1. Go to **https://supabase.com/dashboard** → sign in → **New project**.
   - Name: `clearnest` · pick a strong DB password (save it) · Region: closest to Utah (e.g. West US).
2. Wait ~2 min for it to provision.
3. Left sidebar → **SQL Editor** → **New query** → paste **all** of `supabase/setup.sql` → **Run**. (You should see "Success".)
4. Left sidebar → **Authentication → Users → Add user** → enter **your email + a password**. (This is your admin login.)
5. SQL Editor → new query → paste `supabase/bootstrap-admin.sql`, change `YOUR_EMAIL_HERE` to the email from step 4 → **Run**.
6. Left sidebar → **Project Settings → API**. Copy these two values:
   - **Project URL** → for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Part 2 — Resend (emails you when a lead comes in) · ~4 min

1. Go to **https://resend.com** → sign up (free tier = 3,000 emails/mo).
2. **API Keys → Create API Key** → copy it → for `RESEND_API_KEY`.
3. (Optional but recommended) Verify a domain later for `hello@clearnestcleaning.com`. For now, leave `RESEND_FROM` unset and it uses Resend's test sender; lead alerts still reach you.

## Part 3 — Add the keys to Vercel · ~2 min

**Easiest (dashboard):** Vercel → project **clearnest** → **Settings → Environment Variables** → add each below for **Production** (and Preview):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (Supabase Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabase anon key) |
| `RESEND_API_KEY` | (Resend key) |
| `LEAD_NOTIFY_EMAIL` | your email (where lead alerts go) |

**Or via CLI** (run these yourself so your keys stay private — paste the value when prompted):
```bash
cd ~/code/clearnest
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add RESEND_API_KEY production
vercel env add LEAD_NOTIFY_EMAIL production
```

## Part 4 — Tell me "done"
I'll redeploy, then we submit a real test lead together and confirm it (a) lands in `/admin/leads` and (b) emails you. Then it's live.

---

### What each key unlocks
- `NEXT_PUBLIC_SUPABASE_URL` + `..._ANON_KEY` → leads + bookings + agreements save; `/admin` login works.
- `RESEND_API_KEY` (+ `LEAD_NOTIFY_EMAIL`) → instant email on every new lead; booking confirmations; review requests.
- Later: `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` for pay-after invoicing; `TWILIO_*` for SMS.
