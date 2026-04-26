# Wheelhouse Architecture

**Status:** live · **Last reviewed:** 2026-04-25 (post-Pulse build)
**Lives at:** `/wheelhouse` (cookie-gated for humans, token-gated for agents)
**Source root:** `port-a-local/src/app/wheelhouse/` + `src/data/wheelhouse-*` + `src/components/wheelhouse/`

The Wheelhouse is PAL's internal operations dashboard. Single page that surfaces who's doing what (humans + Claude agents), public traffic, and a daily auto-digest. Designed so a fresh agent can open it and orient in 10 seconds.

---

## The four systems

Stacked top-down on `/wheelhouse`:

### 1. Threads + messages (the core)
The original primitive. Every coordinated piece of work is a *thread* with a *state* (`open` / `awaiting:<id>` / `blocked` / `done`) and a list of typed *messages* (`request` / `update` / `approval-needed` / `blocked` / `decision` / `fyi`).

- Types: `src/data/wheelhouse-types.ts`
- Storage: `src/data/wheelhouse-store-{mock,pg}.ts`, public surface `wheelhouse-store.ts`
- API: `/api/wheelhouse/threads`, `/api/wheelhouse/threads/[id]`, `/api/wheelhouse/threads/[id]/messages`
- UI: `/wheelhouse` (list), `/wheelhouse/[id]` (detail), `/wheelhouse/new` (composer)

### 2. Activity ticker (the internal pulse)
Last 24h of internal activity in a single collapsible row. Default-closed; summary line shows counts + freshest event inline. Click to expand the full event list.

- Component: `src/components/wheelhouse/ActivityFeed.tsx`
- Data: `getRecentActivity(windowHours)` in `wheelhouse-store.ts`
- API: `GET /api/wheelhouse/activity?hours=N` (max 168) — agents call this on session start

### 3. PalStats (the external pulse)
Public traffic snapshot — pageviews today vs yesterday, 7d total, top 5 paths, top 5 custom events, top 5 countries. Fed by Vercel Web Analytics Drain.

- Component: `src/components/wheelhouse/PalStats.tsx`
- Data: `getPalStats()` in `wheelhouse-store.ts`
- Ingest: `POST /api/wheelhouse/analytics-ingest` (HMAC-SHA1 verified)
- Query: `GET /api/wheelhouse/stats`
- Drain config: Vercel Team Settings → Drains → "Wheelhouse — Web Analytics" (apex URL, JSON, secret = `WHEELHOUSE_DRAIN_SECRET`)

### 4. The Pulse (the daily anchor)
Vercel Cron at 8am CT (`0 13 * * *` UTC) generates a markdown digest combining internal + external + per-human-awaiting and posts it as an `update` message into a pinned "PAL Pulse" thread. Activity ticker catches it on first load.

- Cron config: `vercel.json`
- Route: `src/app/api/wheelhouse/cron/pulse/route.ts`
- Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` (auto-provisioned by Vercel when crons exist)
- Pulse thread: auto-created on first run via `findOrCreatePulseThread()` (uses `pulse` tag for idempotency)

---

## Auth model

Three orthogonal paths, all routed through `src/middleware.ts`:

| Caller | Mechanism | How |
|---|---|---|
| Humans (browser) | Cookie | `wheelhouse_auth=ok` + `wheelhouse_who=<id>` set by `POST /api/wheelhouse/login` (shared password env `WHEELHOUSE_PASSWORD`, identity picked at login) |
| Agents (CLI) | Bearer token | `Authorization: Bearer $WHEELHOUSE_TOKEN_<AGENT>` — middleware maps token → `x-wheelhouse-agent` header for the route handler. Tokens are per-agent env vars (`WINSTON_CLAUDE`, `COLLIE_CLAUDE`, `NICK_CLAUDE`) |
| Vercel Drain | HMAC-SHA1 | `x-vercel-signature` header verified against `WHEELHOUSE_DRAIN_SECRET` in the route itself; middleware allow-lists the path |
| Vercel Cron | Bearer | `Authorization: Bearer $CRON_SECRET` (Vercel-managed); route checks; middleware allow-lists |

Allow-list lives in `PUBLIC_WHEELHOUSE_PATHS` in `src/middleware.ts`. **Important:** allow-listed routes must implement their own auth.

**Identity-from-token rule:** when an agent posts via API, `x-wheelhouse-agent` (set by middleware) overrides any `authorId` in the request body. Prevents impersonation.

---

## Postgres schema

Tables in the Vercel Postgres / Neon database (auto-detected from `POSTGRES_URL` or `DATABASE_URL`):

| Table | Purpose | Bootstrap |
|---|---|---|
| `wheelhouse_threads` | Threads | `initSchemaAndSeed()` via `POST /api/wheelhouse/init` |
| `wheelhouse_messages` | Messages | same |
| `wheelhouse_user_seen` | (queued for Option-A personal alerts; not used yet) | same |
| `wheelhouse_analytics_events` | Drain-ingested page views + custom events | **self-bootstraps** on first ingest via `ensureAnalyticsSchema()` — no manual migration needed |

Backend auto-detect: `wheelhouse-store.ts` checks for `POSTGRES_URL` or `DATABASE_URL`; falls back to in-memory mock if absent (dev only).

---

## Files map (where to look first)

```
src/
  middleware.ts                         ← all auth lives here
  data/
    wheelhouse-types.ts                 ← Participant, Thread, Message, ThreadState
    wheelhouse-seed.ts                  ← initial seed threads
    wheelhouse-store.ts                 ← public interface (delegates to mock or pg)
    wheelhouse-store-mock.ts            ← in-memory dev backend
    wheelhouse-store-pg.ts              ← Postgres backend (CRUD, activity, analytics, pulse helper)
  app/
    wheelhouse/
      page.tsx                          ← /wheelhouse landing (ticker + stats + thread list)
      [id]/page.tsx                     ← thread detail
      new/page.tsx                      ← new thread composer
      login/                            ← cookie auth
      welcome/                          ← onboarding/help
    api/wheelhouse/
      login/route.ts                    ← sets cookies
      logout/route.ts                   ← clears cookies
      init/route.ts                     ← bootstraps schema + seed
      threads/route.ts                  ← GET list, POST create
      threads/[id]/route.ts             ← GET single, PATCH state
      threads/[id]/messages/route.ts    ← POST message
      activity/route.ts                 ← GET activity summary
      analytics-ingest/route.ts         ← Vercel Drain destination (HMAC)
      stats/route.ts                    ← GET PalStats
      cron/pulse/route.ts               ← Vercel Cron daily digest
  components/wheelhouse/
    ActivityFeed.tsx                    ← ticker
    PalStats.tsx                        ← traffic card
    ThreadCard.tsx                      ← row in the thread list
    MessageCard.tsx                     ← row in the thread detail
    MessageComposer.tsx                 ← post a new message
    MessageTypePill.tsx                 ← coral/navy/etc badge
    ParticipantBadge.tsx                ← W / C / N / WC etc
    StatePill.tsx                       ← state badge
    StateTransitions.tsx                ← state-change buttons
```

---

## Agent CLI

`workspace/scripts/wheelhouse.py` — Python stdlib CLI that wraps the API for agents.

Subcommands: **`orient`** · `whoami` · `list` · `show <id>` · `post <id>` · `transition <id> <state>` · `new`

Reads `WHEELHOUSE_AGENT_TOKEN` env var (set per-agent in their shell). Each agent has their own token; tokens map to participant IDs via `tokenToAgent()` in middleware.

**`orient` is the start-of-session ritual.** Run it FIRST in every Claude session. Single command prints: who you are, threads awaiting you, last 24h activity (top 5 events), pinned threads, and PAL public-traffic snapshot. Backed by `/api/wheelhouse/me` + `/api/wheelhouse/activity` + `/api/wheelhouse/stats` + `/api/wheelhouse/threads`.

---

## Operations playbook

### Add a new participant
1. Add entry to `PARTICIPANTS` in `src/data/wheelhouse-types.ts` (id, name, kind, accent, short)
2. Extend `ThreadState` and `THREAD_STATE_META` if the participant can be "awaiting"
3. (For agents) add a `WHEELHOUSE_TOKEN_<AGENT>` env var in Vercel; add a branch in `tokenToAgent()` in `src/middleware.ts`
4. Update login route's `who` allow-list

### Run schema migration on prod
```bash
curl -X POST https://theportalocal.com/api/wheelhouse/init \
  -H "Authorization: Bearer $WHEELHOUSE_TOKEN_WINSTON_CLAUDE"
```
Idempotent — `CREATE TABLE IF NOT EXISTS` everywhere, seed step skips if data exists.
**Note:** `wheelhouse_analytics_events` no longer needs this — it self-bootstraps on first ingest.

### Test the Pulse cron manually
```bash
curl https://theportalocal.com/api/wheelhouse/cron/pulse \
  -H "Authorization: Bearer $CRON_SECRET"
```
Returns `{ ok: true, threadId, messageId }`. The digest gets posted as a real message — only run if you want a fresh entry.

### Drain destination URL
Always use the **apex** (`theportalocal.com`), not `www`. The `www → apex` 307 redirect at Vercel's edge breaks drain test and would drop signed payloads.

---

## Env vars (Vercel project)

| Var | Purpose | Sensitive |
|---|---|---|
| `POSTGRES_URL` *or* `DATABASE_URL` | Postgres connection | yes |
| `WHEELHOUSE_PASSWORD` | Shared cookie-auth password | yes |
| `WHEELHOUSE_TOKEN_WINSTON_CLAUDE` | Winston's agent Bearer token | yes |
| `WHEELHOUSE_TOKEN_COLLIE_CLAUDE` | Collie's agent Bearer token | yes |
| `WHEELHOUSE_TOKEN_NICK_CLAUDE` | Nick's agent Bearer token | yes |
| `WHEELHOUSE_DRAIN_SECRET` | Vercel Web Analytics Drain HMAC secret | should be (currently isn't — rotate to sensitive when convenient) |
| `CRON_SECRET` | Vercel Cron Bearer (auto-provisioned) | yes |

---

## What's queued

- **Push 2 — Clerk auth.** Replace cookie+token with proper per-user accounts. No urgency; current model works fine for a 3-human / 3-agent team.
- **Speed Insights drain.** Same pattern as analytics — `/api/wheelhouse/perf-ingest` route, `wheelhouse_perf_events` table, surface p75 LCP / TTFB on the PalStats card.
- **Awaiting-me email digest.** Vercel Cron + transactional email provider, only triggers when a human has > 0 awaiting threads and hasn't visited Wheelhouse in N hours.
- **Personal alerts (Option A from session 2026-04-25).** Per-user `last_seen` tracking; "since you last checked" markers. The `wheelhouse_user_seen` table is already in init schema, just unused.

---

## Brand notes

The Wheelhouse uses the same navy/coral/sand palette as the public PAL site. Lighthouse mark in the top bar. **No emoji in body copy** (per PAL brand rules) — emoji exceptions are SMS, seasonal callouts, and email subject lines only. Pulse digest body uses ⚓ as the only emoji exception (single anchor when nobody owes anybody anything). If that bothers Collie, drop it.
