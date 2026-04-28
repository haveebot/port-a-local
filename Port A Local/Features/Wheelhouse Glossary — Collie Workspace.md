# Wheelhouse Glossary / Directory — Collie's interactive workspace

_Filed 2026-04-28 PM by Winston · parking-lot design · pickup when build window opens · scope is HeyeDeploy-relevant (not PAL-only)_

---

## The trigger

After Claude shipped the [PAL Product + Feature Map — for Collie](../Marketing/PAL%20Product%20+%20Feature%20Map%20—%20for%20Collie.md) (markdown + Word + PDF, sent to Collie from admin@ on 2026-04-28), Winston flagged: this kind of inventory shouldn't live as a static doc that Claude regenerates. It should live in **Collie's own corner of Wheelhouse** — interactive, current, hers to update and reorder.

> "we'll need to build a type of glossary or directory in whouse to display this type of info to C - maybe with her own interactive workflow to update and order - etc. that would also be a great add to HeyeDeploy wiki/backup/wire"

This document captures the build idea for later. Don't build now — file it, revisit when there's a window.

---

## What it is

A **tenant-collaborator workspace** inside Wheelhouse where non-technical team members (Collie, future brand/marketing/comms partners on other Heye Lab projects) can:

1. **See the live product/feature inventory** — same content as the static map but always current
2. **Reorder + group features** by their own mental model (not Claude's)
3. **Mark features for promotion** (✅ "in the post stack" / 🔜 "queued" / ⏸ "parked" / 🚫 "don't surface")
4. **Add their own annotations** — "this needs a photo before I can post it" / "Aly to verify Fox-family detail"
5. **Triage what's NEW since they last looked** — "what shipped since 4/28?"
6. **Push their reordering back to a canonical doc** they can email/print when needed

The output for Winston is the same — a digestible inventory. The output for Collie is a **workspace she owns**, not a doc Claude periodically regenerates.

---

## The shape (Wheelhouse-native, mirrors existing patterns)

```
/wheelhouse/glossary           ← her collaborator landing page
   /[entryId]                  ← per-feature card (annotations, status, history)
```

Backed by a `wheelhouse_glossary_entries` Postgres table — same shape as `wheelhouse_threads` but content-keyed, not workflow-keyed:

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `category` | TEXT | "browse" / "transact" / "editorial" / "civic" / etc. |
| `feature_name` | TEXT | "PAL Delivery", "Heritage", etc. |
| `one_liner` | TEXT | the ≤ 1 sentence summary |
| `lives_at` | TEXT | URL paths, comma-separated |
| `notable_bullets` | TEXT[] | array of "what's notable" lines |
| `marketing_status` | TEXT | "active" / "queued" / "parked" / "do-not-surface" |
| `collaborator_notes` | TEXT | Collie's free-form annotations (markdown) |
| `display_order` | INTEGER | her ordering, default by createdAt |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `updated_by` | TEXT | participant id |

---

## The interactive flow

**Collie's side:**
1. Lands on `/wheelhouse/glossary` — sees the full feature stack grouped by category, with her custom ordering
2. Drags to reorder (drag-and-drop list, same `react-dnd` pattern as ThreadCard could use)
3. Taps a feature → drawer opens with editable notes + status picker
4. **Whatever she types is hers** — Claude doesn't overwrite her annotations (one-way ownership)
5. **Claude pushes UPDATES from the codebase** (new features, removed features, copy-edits to one-liners) into a "Pending review" bucket she can accept/dismiss — no surprise overwrites of her staging work

**Claude's side:**
- A `scripts/pal_glossary_sync.py` (or similar) reads the codebase + `project_pa_local.md` + recent commits → diffs against the glossary table → opens a Wheelhouse thread for any new entries needing Collie's review
- Existing entries with structural changes get marked "pending review" but stay visible to her
- Collie's annotations + ordering are NEVER touched by automated sync

**Winston's side:**
- Periodically reviews the whole glossary in one screen
- One-click "Generate fresh PDF for Collie" button → pulls live state, outputs the same doc shape we shipped today (markdown → docx → PDF cascade)

---

## Why this is HeyeDeploy-template, not just PAL

Every Heye Lab project will have a non-technical collaborator who needs an inventory like this:

| Project | Collaborator | Their inventory shape |
|---|---|---|
| PAL | Collie (brand/marketing) | Product + feature map |
| CrossRef | Beta tenants (Heye Lab + 2M) | Catalog of supplier integrations + crosswalks |
| Sage Em | Zack + agency partners | Service offerings + active engagements |
| Future verticals | TBD | Their domain catalog |

The pattern bits that carry:
- **Wheelhouse-native interactive workspace** for one specific collaborator role
- **Codebase-sync** that proposes updates without overwriting human annotations
- **One-click export** to a portable doc (PDF/docx/markdown)
- **Canonical-state-of-tenant** that anyone on the team can pull on demand

The project-specific bits each tenant customizes:
- The category taxonomy (PAL groups by browse/transact/editorial; CrossRef would group by domain/vertical/integration)
- The "notable" axes (PAL emphasizes "what's marketable"; another tenant might emphasize "what's billable")
- The export format (PAL ships PDF for Collie; CrossRef might ship Excel for ops teams)
- The collaborator role itself (brand/marketing for PAL, ops for CrossRef, etc.)

---

## What this doesn't replace

- **`project_pa_local.md`** — that's the durable state-of-PAL for Claude's continuity, not a Collie-facing surface. Stays as-is.
- **The static `Port A Local/Marketing/PAL Product + Feature Map — for Collie.{md,docx,pdf}`** — useful as a snapshot artifact when shipping a fresh handoff to her. The glossary tool would generate this on demand instead of Claude rewriting it.
- **The Wheelhouse threads system** — totally different shape (workflow vs. inventory). They live side-by-side.

---

## Pickup-here

When this gets revisited:
- [ ] Decide: drag-to-reorder UX or just a `display_order` integer field with explicit up/down arrows? (DnD is more polished but heavier; arrows are 100% accessible)
- [ ] Decide: how often should the codebase-sync run? Daily cron? On-demand from a "Refresh inventory" button? Both?
- [ ] Decide: who else gets a glossary view eventually? (Probably Nick when CrossRef's tenant catalog matures.)
- [ ] Build a feedback file `feedback_tenant_collaborator_workspace_cross_project_pattern.md` once the second instance ships (CrossRef + ?)
- [ ] Mirror this design doc into HeyeDeploy memory once the canonical implementation lands inside PAL — until then it lives as a parking-lot in PAL's Features folder

---

— The Port A Local
