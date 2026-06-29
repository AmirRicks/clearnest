# ClearNest — Agent Log (cross-agent handoff)

> **Every agent (OpenCode · Antigravity IDE · Claude Code): read the "Current state" block before you work, append a one-line entry before you finish.**
> You are not the only agent on ClearNest — Amir uses all three interchangeably as his "main" agent. This file (git-shared, visible on GitHub) is the portable quick-state. The **full** capsule is the Brain:
> `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Brain/pages/projects/clearnest/CONTEXT.md` → "🧭 Handoff State".
> Protocol (binds every agent): Brain → `pages/ai-knowledge/agent-handoff-protocol.md`.
> **Get the latest live news in one command:** `bash scripts/agent-sync.sh`

## 🧭 Current state
- **Updated:** 2026-06-28 · Claude Code (Opus 4.8)
- **Status:** Live & healthy — https://clearnest.services HTTP 200; new premium homepage hero deployed (commit `5165303`).
- **Just done:** **Apple-grade premium homepage redesign.** Queried Amir's "Psychology of Premium Websites" NotebookLM via Chrome (halo effect · cognitive fluency · peak-end rule) → rebuilt the above-the-fold from the dark/busy scroll-scrubbed HouseTour into a calm, light, white-space-heavy Apple-style hero: `components/premium-hero.tsx` (centered single bold two-tone headline "A cleaner home. / A clearer mind." + subhead + two pill CTAs + a stunning sun-drenched immaculate living-room "product shot" = `public/hero/living-room.jpg`, Pexels 5998120). Bumped section spacing (py-24/32/36), cleaned the nav CTA. Verified build + desktop/mobile + live HTML. (Earlier 06-19→21 work not in this file: FOUNDING20 promo system, `/admin/bookings`, migration 0008 applied, PageSpeed a11y→100.)
- **Next up:** Nothing pending. Optional: cascade the premium feel deeper into lower sections if Amir wants.
- **Blocked on Amir:** Stripe keys (pay-after-invoice flow already built — needs `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`). Directory uploads (Angi/Thumbtack logos+photos, GBP video). Nextdoor post.
- **🔒 Locked decisions:** Founding offer = **20% off (FOUNDING20)**, never "$25". `clearnest.services` is healthy — **do NOT change DNS/Vercel/registrar to "fix" a local-network "down"**. No paid spend without asking Amir. No fake reviews/ratings/badges.

## Log (newest first)
- **2026-06-28 · Claude Code (Opus 4.8)** — Apple-grade premium homepage hero redesign (queried the premium-websites NotebookLM via Chrome; light/calm/white-space hero with a sun-drenched room "product shot" replacing the dark scroll-tour). Commit `5165303`, live + verified. Full write-up in Brain.
- **2026-06-23 · Claude Code (Opus 4.8)** — "clearnest.services down" = local network filter (false alarm); domain healthy worldwide. Shipped uptime monitor (PR #3) + this continuity wiring. Full write-up in Brain `log.md` + `lessons-learned.md`.
