---
name: PAL photo-to-feature workflow
description: Proven pattern for turning an emailed photo/attachment into a shipped feature or content update on PAL
type: feedback
originSessionId: 02fa516d-c6bf-42c6-b1e3-727a1cb3e023
---
**Rule:** When Winston or Collie emails haveebot@gmail.com with a photo or attachment and a "do this" framing, treat the email as a full feature spec. Don't bottleneck on clarification — pull attachments, execute, reply with a summary.

**Why:** Proven end-to-end 2026-04-23 → 2026-04-24 across two features:
1. Winston sent one phone photo of the South Jetty's "Live Music Tonight" sheet → `/live-music` feature shipped the same evening, plus a weekly refresh workflow now institutionalized
2. Collie sent 17 attachments (icons + lighthouse + logo + marketing plan + screenshots) → icon Round 1 v2 + lighthouse swap + /brand page + marketing ops docs all shipped next afternoon

Winston's explicit posture: "Think like - do it - if we don't like it then it changes or is removed - it can't be too bad or we would not have sent the idea." Low-friction intake unblocks momentum; we can iterate after.

**How to apply:**

**On session start:** auto-run `python3 scripts/haveebot_mail.py collie --since <last-session-date>` (already in the session-start hook) to catch up on Collie's mail. Manually check for Winston's via `from winstonciv@gmail.com` when relevant.

**When a new email lands with attachments:**
1. **Pull attachments first.** `python3 scripts/haveebot_mail.py attachments <uid> --out "port-a-local/Port A Local/<sender>/<date>-uid<n>/"`. Path convention: `Collie Attachments/` for Collie, `Winston Inbox/` for Winston. This archives the source material as provenance before anything else.
2. **Read the body + attachments.** Use vision for images (OCR / transcription). Read PDFs + SVGs directly.
3. **Scope the work.** Split into: (a) execute now — within established authority patterns, (b) flag for Winston — structural / big-cost / shared-state-visible.
4. **Ship.** Single-commit-per-concern where possible. Push to main (Vercel auto-deploys PAL).
5. **Reply.** Summary email back to the sender (and CC the other one if the work affects both). Structure: what shipped · what's still open · what they should review · what needs their decision. Sign off `— The Port A Local` per `feedback_pal_email_signature.md`.

**Cadence by feature type:**
- **Recurring feeds** (Live Music weekly sheet, event roundups): one photo per week, subject prefix like `Live Music — Week of MMM DD`. Subject line is the dedupe key (new week replaces prior week's data, not appends).
- **One-off brand / content drops** (icons, logo, copy edits): treat each as its own event. Archive the attachments. Ship what's executable.
- **Mid-week corrections** (cancelled show, misspelled name, typo): reply to the same thread with a one-liner. I patch same-day.

**Per-feature enrichment:** When the source is a printed sheet that doesn't carry all the info (cover charges, age restrictions, set times, venue hours), attempt per-venue website/social enrichment on each refresh. Leave fields blank where authoritative sources don't exist. The printed sheet is the floor, not the ceiling.

**Tool:** `scripts/haveebot_mail.py` in workspace-memory repo. Subcommands: `check`, `inbox`, `unread`, `from`, `collie`, `thread <uid>`, `attachments <uid>`, `send`. Attachment output is basename-only (traversal-safe) with collision numbering. See `reference_haveebot_mail.md`.

**What gets archived (both:** `port-a-local/Port A Local/*` vault directories are committed to git for provenance. Small binaries (< 1 MB PDFs, screenshots, SVGs) are fine to commit. Large files (e.g., multi-MB .ai Illustrator source) are also fine for the PAL repo scale.

**Explicit Winston-approval gates:** paid ad spend, T&C changes, anything that transacts money, anything that goes to a third-party list (press, partners). Default: ship unless the work crosses one of these.
