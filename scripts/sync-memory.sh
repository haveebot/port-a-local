#!/usr/bin/env bash
# sync-memory.sh
#
# Mirrors the PAL- and Heye-Lab-relevant files from Winston's local
# Claude memory (~/.claude/projects/.../memory/) into the PAL repo at
# `Port A Local/Memory/`. Lets Nick (and any future Heye Lab platform
# extraction work) read the patterns + decisions + working-style notes
# without needing access to Winston's machine.
#
# What's in scope (synced):
#   - project_pa_local.md         — PAL state + decisions + key files
#   - project_heye_lab.md         — Heye Lab umbrella framing
#   - project_account_structure.md — three-layer model (Winston → Heye Lab → tenants)
#   - feedback_pal_*.md           — PAL editorial + comms + nav rules
#   - feedback_heye_lab_*.md      — Heye Lab framing rules
#   - feedback_coverage_vs_goal.md — cross-cutting working style
#   - feedback_systemic_gaps_check.md — cross-cutting working style
#   - feedback_style.md           — Winston's working preferences
#   - feedback_project_boundaries.md — cross-project separation rule
#   - parking_pal_*.md            — PAL parking lot
#
# What's deliberately EXCLUDED:
#   - MEMORY.md           — top-level index, includes non-PAL projects
#   - user_winston.md     — personal profile
#   - project_sage_em.md  — separate project (Zack's lighting work)
#   - project_crossref.md — separate project (electrical/lighting tool)
#   - feedback_pal_vs_sageem_accounts.md — cross-references Sage Em accounts
#   - reference_haveebot_mail.md — auth-sensitive (mentions token paths)
#
# Run at end of session (or whenever memory updates), then commit + push.
#
# Usage:
#   bash scripts/sync-memory.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HOME/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory"
DEST="$REPO_ROOT/Port A Local/Memory"

if [ ! -d "$SRC" ]; then
  echo "✗ Source memory dir not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DEST"

# Files to sync (whitelist — explicitly NOT mirroring everything)
INCLUDE=(
  "project_pa_local.md"
  "project_heye_lab.md"
  "project_account_structure.md"
  "feedback_pal_brand_system.md"
  "feedback_pal_dispatch_workflow.md"
  "feedback_pal_email_signature.md"
  "feedback_pal_email_threading.md"
  "feedback_pal_mobile_nav_reach.md"
  "feedback_pal_no_manufactured_dispatch.md"
  "feedback_pal_photo_to_feature.md"
  "feedback_pal_wheelhouse_orient.md"
  "feedback_pal_doesnt_gatekeep.md"
  "feedback_context_handoff.md"
  "feedback_arnold_startup_drill.md"
  "feedback_wheelhouse_cross_project_pattern.md"
  "feedback_heyedeploy_pattern_thinking.md"
  "feedback_heye_lab_framing.md"
  "feedback_coverage_vs_goal.md"
  "feedback_systemic_gaps_check.md"
  "feedback_style.md"
  "feedback_project_boundaries.md"
  "parking_pal_token_symbol.md"
)

count_synced=0
count_missing=0

for f in "${INCLUDE[@]}"; do
  if [ -f "$SRC/$f" ]; then
    cp "$SRC/$f" "$DEST/$f"
    count_synced=$((count_synced + 1))
  else
    echo "  - skipped (not present in source): $f"
    count_missing=$((count_missing + 1))
  fi
done

# Stamp synced timestamp + provenance — useful for debugging stale mirrors
cat > "$DEST/_synced_at.txt" <<EOF
Last sync: $(date '+%Y-%m-%d %H:%M:%S %Z')
Source: $SRC
Files synced: $count_synced
Files missing: $count_missing
Sync script: scripts/sync-memory.sh

This directory is a one-way mirror of Winston's Claude memory files
relevant to PAL + Heye Lab. The authoritative copy lives on Winston's
machine; this mirror is git-tracked so Nick (and any future Heye Lab
platform extraction work) can read the patterns + decisions without
needing access to Winston's local filesystem.

Don't edit these files directly — changes here will be overwritten
on the next sync. Update the source memory instead (it'll mirror over
on the next session-end push).
EOF

echo "✓ Synced $count_synced files to $DEST"
echo "  See $DEST/_synced_at.txt for sync metadata."
