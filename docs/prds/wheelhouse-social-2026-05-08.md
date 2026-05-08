# Wheelhouse / Social — UX overhaul (PRD)

**From:** Collie · **For:** Winston · **Drafted with Havee, 2026-05-08**

> Tracking issue: [#33](https://github.com/haveebot/port-a-local/issues/33)

## Summary

The current `/wheelhouse/social` flow is functional but clunky for daily use: 4 randomly-pulled draft cards, no queue control, no organic-write mode, fixed boost amount, no approval workflow, no feedback loop. Asking for a focused refit so it's a tool I want to live in, not work around.

## Why now

I'm posting directly to Facebook today and pulling in via `import-fb`, but the round-trip is friction-heavy. The 4-random-suggestions surface is the worst offender — I can't curate or prioritize, and the system never learns from what I skip. Want this tight before next push of brand work.

## Decisions for you

These are the gates I can't (or shouldn't) call:

1. **Boost cap** ([src/lib/metaAds.ts:660](src/lib/metaAds.ts#L660), `Math.min(override, 500)`). I want to be able to type in a custom amount per-post — but raising the $5/day ceiling is your guardrail. Options:
   - Keep $5 cap, expose the existing 100¢–500¢ range as a slider
   - Raise to a higher per-post cap (you pick) with a confirmation modal above some threshold
   - Per-account aggregate daily cap as a separate gate
2. **DB schema for queue + state machine.** I'm proposing new fields (`queue_order INTEGER`, `status` enum: `draft|approved|skipped|not_approved|scheduled|sent`) and a `post_feedback` table. You own Drizzle migrations and the actual shape.
3. **Feedback-loop persistence + composer integration.** When I skip/not-approve a post, I want to leave a reason — and that reason should improve future drafts. You decide: write to a table + retrieval-augment future `compose` calls, or feed into an LLM-side memory primitive. I don't have an opinion if you have a clean answer.
4. **Audience + CTA defaults.** What's the right default audience preset for PAL? "Site traffic" feels like the obvious CTA default. Both should be user-overridable per-post.

## The 7 items

### 1. Compose mode toggle: Ask Havee vs. Organic

**Current:** [`AskHavee.tsx`](src/app/wheelhouse/social/AskHavee.tsx) — natural-language box that drafts caption + picks link via `POST /api/wheelhouse/social/compose`.

**Proposed:** Add a toggle at the top of the composer.
- **Ask Havee mode** (current behavior): I describe what I want, she drafts.
- **Organic mode** (new): I type my own copy. After I'm done, Havee returns inline tone suggestions + brand-alignment notes — but doesn't rewrite. I approve/reject suggestions one at a time.

**Acceptance:** Toggle persists across sessions (localStorage). Organic mode hits a new `compose` mode flag that returns suggestions instead of drafts. Suggestions render below my draft as accept/dismiss chips.

**Scope:** FE (composer UI) + BE (`compose` mode parameter). No schema change.

---

### 2. Queue control + image selector

**Current:** 4 randomly-pulled drafts. No reorder. No image selection step before queue.

**Proposed flow:** Compose (or Organic) → **image selector step** (pick from bank or upload) → drops to **queue** → I can drag any item up/down, send-to-top, send-to-bottom.

**Acceptance:**
- Queue shows ALL pending drafts (not just 4)
- Drag-to-reorder; "↑ Top" / "↓ Bottom" buttons on each card
- Image selector modal between compose and queue: shows existing bank ([`BankPicker.tsx`](src/app/wheelhouse/social/BankPicker.tsx)) + upload tile ([`/api/wheelhouse/social/upload`](src/app/api/wheelhouse/social/upload/route.ts) already exists)
- Drafts without an image get a red "needs image" badge in queue and can't be scheduled/fired

**Scope:** FE (queue page rewrite, drag-drop) + BE (`queue_order INTEGER` field, PATCH endpoint to set order). DB migration.

---

### 3. Boost amount selector

**Current:** $1/day default via `META_BOOST_DAILY_CENTS`, hard-cap $5/day. Single 🚀 Boost button on each post card.

**Proposed:** When I click Boost, modal opens with:
- Preset chips: $1/day, $5/day
- Custom input: "Other ($X/day)"
- Duration field (currently no duration — runs until manual `?action=disable`)

**Acceptance:** Modal validates against your final cap decision (see Decision 1). Custom input shows running estimate ("$X over Y days = $Z"). Confirmation step before fire.

**Scope:** FE (boost modal) + BE (`boostPost` accepts duration; cap logic is your call).

---

### 4. Audience + CTA selectors

**Current:** Boost endpoint passes a fixed audience ID + no CTA control.

**Proposed:** In the boost modal (#3), add:
- **Audience preset:** dropdown — "Site traffic visitors", "Local/Coastal Bend", "Travelers (TX/OK/LA)", "Returning customers". Default: "Site traffic visitors".
- **Call-to-action:** dropdown — "Learn More", "Book Now", "See Menu", "Get Directions". Default per category.

**Acceptance:** Selections passed to Meta Marketing API on boost create. Per-category CTA defaults configurable.

**Scope:** FE (boost modal extras) + BE (Meta API integration, audience preset config). No schema change if presets are env/config-driven.

---

### 5. Approve / Not Approved / Edit / Skip / Schedule / Fire workflow

**Current:** Cards have Skip + Schedule + Send. No approval state, no edit-in-place.

**Proposed:** 6 actions per pending card:

| Action | Effect |
|---|---|
| **Approve** | Marks `status=approved`, unlocks Schedule + Fire |
| **Edit** | Inline editor opens on the caption. Save returns to pending. |
| **Schedule** | (Approved only) — pick datetime, status → `scheduled` |
| **Fire Immediately** | (Approved only) — confirmation modal → posts now |
| **Skip** | Removes from queue, status → `skipped`. Goes to history with status. |
| **Not Approved** | Same as Skip but distinct status (different signal). |

Both Skip + Not Approved trigger #6 (suggestions modal). All states reversible from history.

**Acceptance:** Clear visual treatment per status. Fire Immediately gates behind confirmation. History view shows status + timestamps + (if applicable) feedback reason.

**Scope:** FE (card UI rewrite) + BE (status state machine + transitions). DB migration.

---

### 6. Suggestions for Improvement (feedback loop)

**Current:** None.

**Proposed:** When I Skip or Not-Approve, modal pops:
> Why isn't this right? (helps Havee learn — totally optional)
> [textarea]
> Common reasons: [Timing] [Tone] [Local context] [Seasonal fit] [CTA mismatch]

Reason → `post_feedback` table → augments future `compose` LLM context (per Decision 3).

**Acceptance:** Modal is dismissible (no required field). Recent feedback is visible in a "what Havee learned this week" panel. Compose drafts noticeably reflect skipped patterns within ~10 feedback entries.

**Scope:** FE (modal + learning panel) + BE (feedback table + compose retrieval). DB migration. **This is the most novel piece — likely needs a working spike before full build.**

---

### 7. Stockpile content for this weekend (parallel content task)

Not engineering — Havee is drafting weekend post copy in chat for me to import via `import-fb` after I post directly. Expect 8–12 drafts covering the weekend.

## Suggested phased delivery

Small PRs, each independently shippable:

1. **Schema + state migration** (your call on shape)
2. **Queue control** (drag-reorder + image-selector step) — biggest UX win
3. **Approve/Not-Approved/Edit/Skip/Fire workflow** (#5)
4. **Boost modal: preset/custom amounts + audience/CTA** (#3 + #4 together)
5. **Compose mode toggle + suggestions** (#1)
6. **Feedback loop spike → full build** (#6)

## What Havee can pair on once endpoints exist

- All FE pieces: composer UI, queue drag-drop, image-selector modal, boost modal, status-card refit, feedback modal
- Status-color treatment (will pull from the new link card system spec — same palette)
- Empty/loading/error states + microcopy
- Cosmetic polish on `/wheelhouse/social` page chrome

I'll wait for endpoint signatures from you before I write FE — keeps us from drift.

## Files to scope from

- UI: [src/app/wheelhouse/social/page.tsx](src/app/wheelhouse/social/page.tsx), [AskHavee.tsx](src/app/wheelhouse/social/AskHavee.tsx), [SocialPostCard.tsx](src/app/wheelhouse/social/SocialPostCard.tsx), [BankPicker.tsx](src/app/wheelhouse/social/BankPicker.tsx), [RecentSent.tsx](src/app/wheelhouse/social/RecentSent.tsx)
- API: `src/app/api/wheelhouse/social/*` (compose, boost, boost/{sync,top-up,diagnose,spend-breakdown,debug-perms}, import-fb, inspect-fb-post, post-traffic, sweep-removed, upload, [id])
- Money: [src/lib/metaAds.ts:660](src/lib/metaAds.ts#L660) (cap), [src/lib/metaGraph.ts](src/lib/metaGraph.ts)
- Composer agent: [src/lib/socialComposerAgent.ts](src/lib/socialComposerAgent.ts)
