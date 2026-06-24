# ClearNest — Agent Log (cross-agent handoff)

> **Every agent (OpenCode · Antigravity IDE · Claude Code): read the "Current state" block before you work, append a one-line entry before you finish.**
> You are not the only agent on ClearNest — Amir uses all three interchangeably as his "main" agent. This file (git-shared, visible on GitHub) is the portable quick-state. The **full** capsule is the Brain:
> `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Brain/pages/projects/clearnest/CONTEXT.md` → "🧭 Handoff State".
> Protocol (binds every agent): Brain → `pages/ai-knowledge/agent-handoff-protocol.md`.
> **Get the latest live news in one command:** `bash scripts/agent-sync.sh`

## 🧭 Current state
- **Updated:** 2026-06-23 · Claude Code (Opus 4.8)
- **Status:** Live & healthy — https://clearnest.services returns HTTP 200 globally.
- **Just done:** Confirmed the "site is down" report is a **local work-network content filter**, not the domain (DNS, Vercel, and the Let's Encrypt cert through 2026-08-31 are all healthy). Shipped an off-network uptime monitor (`.github/workflows/uptime.yml`, PR #3, merged + self-test passed). Wired cross-agent continuity (this file + `AGENTS.md` + `scripts/agent-sync.sh`).
- **Next up:** Nothing pending. If the site looks "down," verify externally FIRST (`bash scripts/agent-sync.sh`) before believing it.
- **Blocked on Amir:** To view the site from the work network: phone on cellular, or whitelist `clearnest.services` on the network filter.
- **🔒 Locked decisions:** `clearnest.services` is healthy — **do NOT change DNS/Vercel/registrar to "fix" a local-network "down"** (a local `curl` failure ≠ a real outage; `vercel certs ls` showing no certs is a red herring). No paid spend without asking Amir. No fake reviews/ratings/badges.

## Log (newest first)
- **2026-06-23 · Claude Code (Opus 4.8)** — "clearnest.services down" = local network filter (false alarm); domain healthy worldwide. Shipped uptime monitor (PR #3) + this continuity wiring. Full write-up in Brain `log.md` + `lessons-learned.md`.
