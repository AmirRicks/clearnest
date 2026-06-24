#!/usr/bin/env bash
# agent-sync.sh — one-shot "where are we" digest for ANY agent
# (OpenCode / Antigravity IDE / Claude Code). Read-only, no side effects.
#
# Prints: git state, open PRs, latest Vercel prod deploy, the uptime monitor's
# recent runs, and the REAL global status of the live site — checked off-network
# so a local work-network content filter can't fake a "down". Run it FIRST when
# you pick up ClearNest, and trust the external check over a local curl.
#
#   bash scripts/agent-sync.sh

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
LIVE="https://clearnest.services"

line() { printf '\n── %s %s\n' "$1" "$(printf '─%.0s' $(seq 1 $((46 - ${#1}))))"; }

echo "===================== ClearNest · agent-sync ====================="
echo "When: $(date '+%Y-%m-%d %H:%M %Z')"

line "Git"
echo "branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
git log --oneline -5 2>/dev/null
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "⚠ uncommitted changes:"; git status --short 2>/dev/null
else
  echo "working tree clean"
fi

line "Open PRs"
gh pr list --state open --limit 10 2>/dev/null || echo "(gh unavailable)"

line "Vercel (production)"
vercel ls clearnest --prod 2>/dev/null | head -6 || echo "(vercel cli unavailable / not linked)"

line "Uptime monitor — recent runs"
gh run list --workflow=uptime.yml --limit 3 2>/dev/null || echo "(gh unavailable)"

line "Live site status"
direct=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 8 "$LIVE" 2>/dev/null || echo 000)
echo "  from THIS network : HTTP ${direct}   (000 / reset usually = a LOCAL work-network filter, NOT a real outage)"
# External check via check-host.net (keyless, multi-node, genuinely off-network).
ext="?"
rid=$(curl -s --max-time 12 -H 'Accept: application/json' \
      "https://check-host.net/check-http?host=${LIVE}&max_nodes=3" 2>/dev/null \
      | python3 -c "import sys,json;print(json.load(sys.stdin).get('request_id',''))" 2>/dev/null)
if [ -n "${rid:-}" ]; then
  for _ in 1 2 3 4 5 6; do
    sleep 2
    out=$(curl -s --max-time 10 -H 'Accept: application/json' \
          "https://check-host.net/check-result/${rid}" 2>/dev/null \
          | python3 -c "import sys,json
d=json.load(sys.stdin)
c=[v[0][3] for v in d.values() if v and v[0] and len(v[0])>3 and v[0][3]]
print(c[0] if c else '')" 2>/dev/null)
    [ -n "${out:-}" ] && { ext="$out"; break; }
  done
fi
echo "  external (off-net): HTTP ${ext}   ←  TRUST THIS for real uptime"
echo "=================================================================="
