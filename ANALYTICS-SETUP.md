# ClearNest — Analytics & Measurement (free)

The site now instruments itself so we can see what's working. Two free tools,
plus built-in conversion tracking. **Both are $0.**

## 1. Vercel Web Analytics (page views + conversions) — 1 click

Already wired into the code (`@vercel/analytics`). Just turn it on:

1. Vercel dashboard → **clearnest** project → **Analytics** tab → **Enable**.
2. That's it. Free on Hobby (with a monthly data-point cap — plenty for now).

## 2. Microsoft Clarity (heatmaps + session recordings) — 3 min, fully free

See *exactly* where visitors click, scroll, and drop off — and watch real
session replays.

1. Go to **clarity.microsoft.com** → sign in (free) → **Add new project**.
2. Name it "ClearNest", website `clearnest.services`.
3. Copy the **Project ID** (a short code like `abcd1234ef`).
4. In Vercel → clearnest → **Settings → Environment Variables**, add:
   - Name: `NEXT_PUBLIC_CLARITY_ID`
   - Value: *(your Clarity project ID)*
   - Environments: Production (+ Preview if you want)
5. Redeploy (or just push any commit). Heatmaps start collecting immediately.

Until you set `NEXT_PUBLIC_CLARITY_ID`, Clarity simply stays off — no errors.

## Conversion events we're already tracking (in Vercel Analytics)

| Event | Fires when |
|---|---|
| `lead_submitted` | Someone completes the quick-quote / lead form (with the source, e.g. `city:sandy-ut`) |
| `booking_completed` | Someone finishes a booking (confirmation page) |
| `call_clicked` | Any "call us" (tel:) link is clicked — site-wide, automatic |
| `text_clicked` | Any "text us" (sms:) link is clicked — site-wide, automatic |

## The KPIs to watch (your weekly dashboard)

Once data flows, we look at:
- **Traffic by source** (which channel sends visitors)
- **Lead conversion rate** = leads ÷ visitors
- **Lead→booking rate** = bookings ÷ leads
- **Call/text intent** = call_clicked + text_clicked
- **Drop-off points** (Clarity heatmaps) — where people leave the booking flow
- **Reviews per week** and **repeat/recurring rate** (the long-game metrics)

We optimize what we measure. Tell me when both are enabled and I'll start
reading the data and recommending changes.
