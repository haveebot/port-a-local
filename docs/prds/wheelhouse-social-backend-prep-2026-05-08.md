# Wheelhouse / Social — Operator Backend Prep (response to PRD)

**From:** Havee (operator-tier) · **For:** Collie · **Drafted 2026-05-08**

Companion to [`wheelhouse-social-2026-05-08.md`](./wheelhouse-social-2026-05-08.md). This doc closes the four decisions the PRD pushed back to operator side, specs the schema migration + API endpoint contracts, and confirms the operator-side commitments per phase. Goal: give the FE a stable contract to write against without backend drift.

## Decisions — answered

### 1. Boost cap policy → **Per-account daily aggregate, $25/day default**

Replaces the per-post `Math.min(override, 500)` hard-cap at [`src/lib/metaAds.ts:660`](../../src/lib/metaAds.ts#L660) with an aggregate model:

- **Per-account daily ceiling: $25/day** (configurable via `META_BOOST_DAILY_AGGREGATE_CAP_CENTS`, default `2500`)
- **Per-post freedom up to that ceiling** — composer can input any amount, blocked at boost-create if it would push the day's cumulative spend over the cap
- **Confirmation modal threshold: $10/post** — boost amounts above this surface a confirmation step in the FE
- **Daily aggregate computed from `boost_actions` log** filtered by `created_at >= start-of-day-UTC` and `status IN ('active', 'completed')`

Trade-off: removes the per-post hard-cap but adds a daily aggregate guardrail. Net effect: can fire $20 on a single high-value post, but can't accidentally fire ten $5 posts in a day.

Future: the `META_BOOST_DAILY_AGGREGATE_CAP_CENTS` env can be raised by operator without code change. PR-amount cap per post intentionally not added (rely on FE confirmation modal + daily aggregate).

### 2. DB schema for queue + state machine → **Take the PRD proposal as-is**

Drizzle migration to extend the existing `wheelhouse_social_drafts` table + add a new `wheelhouse_social_feedback` table:

```sql
-- Migration: 2026-05-08-wheelhouse-social-queue-state

ALTER TABLE wheelhouse_social_drafts
  ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'draft',
  ADD COLUMN queue_order INTEGER,
  ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN approved_by VARCHAR(64),
  ADD COLUMN edited_caption TEXT,
  ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE,
  ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN image_path VARCHAR(512);

CREATE INDEX idx_wheelhouse_social_drafts_status_queue_order
  ON wheelhouse_social_drafts (status, queue_order)
  WHERE status IN ('draft', 'approved', 'scheduled');

CREATE TABLE wheelhouse_social_feedback (
  id SERIAL PRIMARY KEY,
  draft_id INTEGER NOT NULL REFERENCES wheelhouse_social_drafts(id) ON DELETE CASCADE,
  reason TEXT,
  tags VARCHAR(64)[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(64) NOT NULL DEFAULT 'collie'
);

CREATE INDEX idx_wheelhouse_social_feedback_created_at
  ON wheelhouse_social_feedback (created_at DESC);
```

**Status enum values:** `draft` · `approved` · `skipped` · `not_approved` · `scheduled` · `sent`

Reversibility: every status transition is reversible via the same endpoint with target `status`. History view can display all states + timestamps.

### 3. Feedback loop persistence → **Table-first, retrieval-augment composer**

Decision: write feedback to the `wheelhouse_social_feedback` table; augment future `compose` LLM calls by fetching the last N feedback entries (default 20) and threading them into the system prompt as "recent reasons drafts were skipped."

LLM-side memory primitives are explicitly v2 — table-first is debuggable, deterministic, and trivially testable. Once feedback accumulates we can evaluate whether to graduate to a memory primitive.

Implementation note: the composer agent at [`src/lib/socialComposerAgent.ts`](../../src/lib/socialComposerAgent.ts) gets a new param `recentFeedback?: FeedbackEntry[]` that the route handler populates from the table.

### 4. Audience + CTA defaults → **"Site traffic visitors" default; per-category CTAs**

**Default audience preset:** `site_traffic_visitors` — Meta Custom Audience built from PAL site visitors (last 90 days). Configurable via `META_DEFAULT_AUDIENCE_ID`.

**CTA defaults per category:**

| Category | Default CTA | Meta Marketing API value |
|---|---|---|
| Generic / no specific category | Learn More | `LEARN_MORE` |
| `/beach`, `/rent` (booking flows) | Book Now | `BOOK_TRAVEL` |
| Restaurants (`/eat`, `/services` food) | See Menu | `SEE_MENU` |
| Locations / event venues | Get Directions | `GET_DIRECTIONS` |

Detection: composer infers category from the link URL path. Per-post user override always available in the boost modal.

Configurable via env: `META_CTA_DEFAULTS_JSON` (key/value map for per-path-prefix overrides).

---

## API endpoint contracts (FE writes against these)

All endpoints under `/api/wheelhouse/social/*`. Auth via Wheelhouse middleware (cookie/bearer). All return JSON.

### Compose

```
POST /api/wheelhouse/social/compose
Body: {
  prompt: string,
  mode: "draft" | "suggest",     // NEW: "suggest" returns suggestions vs full draft
  organicCaption?: string,        // NEW: required when mode="suggest"
}

Response (mode=draft):
  { caption: string, link: string, suggested_image: string|null }

Response (mode=suggest):
  {
    suggestions: Array<{
      type: "tone" | "brand" | "voice" | "spelling",
      span?: { start: int, end: int },  // optional caption span the suggestion targets
      original?: string,
      proposed: string,
      rationale: string
    }>
  }
```

### Queue

```
POST /api/wheelhouse/social/queue/order
Body: { drafts: Array<{ id: int, queue_order: int }> }
Response: { ok: true, count: int }

POST /api/wheelhouse/social/queue/[id]/[action]
  action: "approve" | "edit" | "skip" | "not_approved" | "schedule" | "fire"
Body (varies by action):
  edit:        { caption: string }
  schedule:    { scheduled_for: ISO8601 }
  fire:        { boost_amount_cents?: int, audience_id?: string, cta?: string, duration_days?: int }
  skip / not_approved: { reason?: string, tags?: string[] }   // optional, if present writes feedback
Response: { ok: true, status: <new_status>, fb_post_id?: string, boost_id?: string }

GET /api/wheelhouse/social/queue
Query: ?status=draft|approved|scheduled|skipped|not_approved|sent (defaults to non-sent)
Response: { drafts: Array<DraftWithStatus>, total: int }
```

### Feedback

```
POST /api/wheelhouse/social/feedback
Body: { draft_id: int, reason: string, tags?: string[] }
Response: { ok: true, id: int }

GET /api/wheelhouse/social/feedback/recent
Query: ?limit=20
Response: { feedback: Array<FeedbackEntry>, total_this_week: int }
```

### Boost

```
POST /api/wheelhouse/social/boost/[postId]
Body: {
  amount_cents: int,
  duration_days: int,
  audience_id?: string,    // defaults from env
  cta?: string,            // defaults per category
}
Response: {
  ok: true,
  boost_id: string,
  remaining_daily_cap_cents: int   // shows what's left in today's aggregate
} | {
  ok: false,
  error: "exceeds_daily_aggregate_cap",
  daily_cap_cents: int,
  spent_today_cents: int,
  attempted_cents: int
}
```

### Image upload (existing — no change)

Already at [`/api/wheelhouse/social/upload`](../../src/app/api/wheelhouse/social/upload/route.ts). FE wires the existing `BankPicker.tsx` selection + upload into the new image-selector step.

---

## Phased delivery — operator commitments

| Phase | What ships | Who | When |
|---|---|---|---|
| **0** | This doc + her PRD merged | both | ✅ done 2026-05-08 |
| **1a** | Drizzle migration: schema changes (status, queue_order, feedback table) | operator | next |
| **1b** | API endpoint stubs returning shaped responses (no business logic yet) | operator | parallel with 1a |
| **2** | Queue control + image-selector FE (PRD #2) | Collie | unblocked after 1a + 1b |
| **3** | Approve/Edit/Skip/Schedule/Fire workflow FE (PRD #5) | Collie | depends on 2 |
| **4** | Boost cap mechanism in `metaAds.ts` + boost modal FE (PRD #3 + #4) | both | parallel |
| **5** | Compose mode toggle + organic suggestions FE (PRD #1) | Collie | depends on compose API extension |
| **6** | Feedback loop spike → full build (PRD #6) | both | last; spike first |
| **7** | Stockpile weekend content (parallel non-engineering) | Collie + Havee | this weekend |

## Operator commitments (concrete, scoped)

- **Drizzle migration (Phase 1a):** I own. New migration file `drizzle/migrations/2026-05-08-wheelhouse-social-queue-state.sql`. Roll-forward only; rollback path is `ALTER TABLE ... DROP COLUMN` if needed.
- **Endpoint stubs (Phase 1b):** I own. Each route returns the documented shape with placeholder data; full logic lands per-phase as Collie's FE pieces stabilize the UX.
- **Boost cap mechanism (Phase 4 backend):** I own. Aggregate calc lives in `lib/metaAds.ts`; reads from the existing boost-actions log.
- **Compose-mode extension (Phase 5 backend):** I own. Adds `mode` + `organicCaption` params to the compose route + composer agent.
- **Feedback retrieval-augmentation (Phase 6 backend):** I own. Pulls last N feedback entries into the composer's system prompt context.

## What Collie can write FE against today

Phase 2 (queue control + image selector) only needs:
- `GET /api/wheelhouse/social/queue` returning the drafts in `queue_order`
- `POST /api/wheelhouse/social/queue/order` for drag-reorder
- `POST /api/wheelhouse/social/queue/[id]/[action]` for individual actions

If Phase 1a + 1b stubs land first (operator-side), she can build Phase 2 against the stub responses without waiting for full backend.

## Open questions (deferred — not blocking this prep)

- **Image-bank schema:** existing `BankPicker.tsx` reads from S3-backed images. Whether the new image-selector should track which images have been used previously per-draft is a v2 polish.
- **Notification on `sent`:** when a post fires, do we surface a Wheelhouse thread back to operator+Collie summarizing the result + any boost spend? Defer to Phase 5+.
- **Multi-account expansion:** if PAL ever runs multiple FB pages (Palm Republic + PAL combined), the daily-aggregate cap key needs page-id partition. Defer.

---

## Refs

- Her PRD: [`docs/prds/wheelhouse-social-2026-05-08.md`](./wheelhouse-social-2026-05-08.md)
- Linked issue: [#33 Wheelhouse / Social — UX overhaul (PRD)](https://github.com/haveebot/port-a-local/issues/33)
- Boost cap location: [`src/lib/metaAds.ts:660`](../../src/lib/metaAds.ts#L660)
- Composer agent: [`src/lib/socialComposerAgent.ts`](../../src/lib/socialComposerAgent.ts)
- Existing upload endpoint: [`src/app/api/wheelhouse/social/upload/route.ts`](../../src/app/api/wheelhouse/social/upload/route.ts)
