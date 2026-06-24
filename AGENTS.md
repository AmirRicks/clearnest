<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤝 Cross-agent continuity — READ FIRST (OpenCode · Antigravity IDE · Claude Code)

You are **not** the only agent on ClearNest. Amir runs OpenCode, Antigravity IDE, and Claude Code as interchangeable "main" agents. To pick up exactly where the last one left off — and never contradict it — follow this every session:

1. **READ FIRST (before any work):**
   - **Repo quick-state (git-shared, always available):** [`AGENT-LOG.md`](./AGENT-LOG.md) → "🧭 Current state".
   - **Full capsule (single entry point — don't crawl the vault):** `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Brain/pages/projects/clearnest/CONTEXT.md` → "🧭 Handoff State" + the auto "Ground Truth" block.
   - **Latest live news in one command:** `bash scripts/agent-sync.sh` (git, open PRs, Vercel prod, uptime monitor, REAL off-network site status).
2. **UPDATE LAST (before you finish — even mid-task, even if you think you're done):** append a line to `AGENT-LOG.md` **and** update the Handoff State block in `CONTEXT.md` (Last touched / Just done / Next up / Blocked / Decisions locked). Then refresh machine ground-truth: `node "$BRAIN/tools/sync-truth.mjs" clearnest`.
3. **Don't relitigate locked decisions.** Full protocol (binds every agent): Brain → `pages/ai-knowledge/agent-handoff-protocol.md`.

⚠️ **Locked fact:** `clearnest.services` is **healthy**. If `curl` says it's "down" from Amir's network, suspect a **local work-network content filter**, not the domain — confirm with `scripts/agent-sync.sh` (external check) and do **NOT** change DNS / Vercel / Namecheap.
