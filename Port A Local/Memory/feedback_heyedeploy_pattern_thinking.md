# HeyeDeploy — pattern-thinking across all Heye Lab projects

_Cross-project rule | Applies to ALL Heye Lab projects (PAL, CrossRef, Sage Em, future) | Filed 2026-04-27 PM by Winston, refined same session after the CityDeploy-vs-meta-framework framing fix_

---

## The naming hierarchy (matters — don't conflate)

```
HeyeDeploy                  ← the framework / operating model
   │
   ├─ CityDeploy            ← vertical: small/mid-town local-marketplace SaaS
   │     └─ PAL             ← first CityDeploy tenant
   │
   ├─ <future-vertical>Deploy  ← vertical: e.g. an electrical-brokerage SaaS
   │     └─ CrossRef        ← could become first tenant if it productizes
   │
   ├─ <future-vertical>Deploy  ← vertical: e.g. a creative-studio SaaS
   │     └─ Sage Em         ← could become first tenant if it productizes
   │
   └─ shared cross-project tooling
         · Wheelhouse (ops board)
         · arnold drill (session startup)
         · truck protocol (session handoff)
         · memory mirror sync
         · workspace/scripts/* CLIs
```

**HeyeDeploy is the meta-framework.** Every `<Vertical>Deploy` SaaS Heye Lab ships is BUILT USING HeyeDeploy patterns. Tenant instances run on top of a `<Vertical>Deploy`.

CityDeploy is the first vertical (small/mid towns, PAL is its proof-of-concept tenant). Future verticals inherit the same HeyeDeploy patterns.

---

## The rule

**Every reusable pattern any Heye Lab project ships gets treated as a HeyeDeploy template, not just patterns inside CityDeploy.**

Articulated by Winston 2026-04-27 PM:

> "we will CityDeploy the model we use on any project across everything worthwhile that we work on - across all projects - 'HeyeDeploy or HLDeploy, etc.'"

Initial framing was CityDeploy-scoped. Same session refined to HeyeDeploy-scoped because the meta-pattern is bigger than municipal SaaS — it cuts across CrossRef (electrical/lighting), Sage Em (creative/agency), and any future Heye Lab project.

---

## What this means in practice when building

### 1. Reference the canonical implementation by name (across projects, not just within one)

When building anything that mirrors a previous flow — even from a different Heye Lab project — write the build brief or commit message with the canonical reference upfront.

✅ **Yes:** "Mirror the runner Connect flow at `port-a-local/src/app/api/deliver/driver/connect/{start,refresh,dashboard}`. Don't invent." (Even if I'm building inside CrossRef now.)

❌ **No:** "Build Stripe Connect onboarding for vendors." (Doesn't tell future-Claude or Nick the existing pattern; invites re-invention; loses the cross-project compounding.)

### 2. Document cross-project shape, not project-specific bits

Every HeyeDeploy template doc should distinguish:
- **Project-specific bits:** route paths, table names, copy strings, brand styling
- **Pattern bits:** the lookup chain, the auth model, the failure modes, the rotation flow

The pattern-bit list is what carries to siblings. The project-specific list is what each tenant customizes.

Example from `feedback_wheelhouse_cross_project_pattern.md`:
> "Per-agent Sensitive bearer tokens in Vercel" ← pattern bit
> "WHEELHOUSE_TOKEN_WINSTON_CLAUDE → resolves to participant `winston-claude`" ← project-specific

Both belong in the doc.

### 3. File a `feedback_<pattern>_cross_project_pattern.md` when a template solidifies

Not every shipped flow is a HeyeDeploy template. But when a flow has been built ≥2× anywhere across Heye Lab projects (e.g., PAL runner Connect → PAL vendor Connect → CrossRef supplier Connect), the second build is the cue: **file the pattern doc**. Title convention: `feedback_<thing>_cross_project_pattern.md`. Index in `MEMORY.md`. Add to `sync-memory.sh` whitelist for whichever project mirrors are relevant.

### 4. Build briefs reference the pattern docs by path

When a build brief is template-replication (e.g., the Stripe Connect onboarding brief at `Port A Local/Features/Locals Sell-mode Stripe Connect Onboarding — Build Brief.md` mirrors the runner flow), the brief opens with the canonical reference and explicitly tells future-Claude *"don't invent."* This prevents drift between project copies.

### 5. The HeyeDeploy patterns catalog lives in the platform vision doc

`Port A Local/Memory/CityDeploy — Platform Vision.md` currently houses the catalog. **Should be renamed / restructured to put HeyeDeploy on top, CityDeploy as a section underneath.** Pickup-here below.

---

## Patterns already locked in as HeyeDeploy templates

| Pattern | Canonical implementation | Pattern doc | Status |
|---------|--------------------------|-------------|--------|
| Wheelhouse (ops board) | PAL: `/wheelhouse` routes + middleware + `wheelhouse_*` tables | `feedback_wheelhouse_cross_project_pattern.md` | LOCKED 2026-04-27 |
| Memory mirror sync | PAL: `scripts/sync-memory.sh` whitelist-based | (in-line in script header) | LOCKED 2026-04-26 (Sprint E) |
| Context-handoff "truck" | session-end ritual | `feedback_context_handoff.md` | LOCKED 2026-04-27 |
| Startup-drill "arnold" | session-start ritual | `feedback_arnold_startup_drill.md` | LOCKED 2026-04-27 |
| **Web push portal — multi-role + alerts unified** | PAL: `src/data/push-subscriptions-store.ts` + `src/lib/{wheelhousePush,cartVendorPush,localsSellerPush,restaurantPush,emergencyPush}.ts` + `src/components/push/EnablePushButton.tsx` + `src/app/api/push/{subscribe,unsubscribe}/route.ts` + generalized `public/sw.js` + manifest icons via `src/lib/pwaLighthouseSvg.ts` | TBD — file once second tenant lands the same shape | LOCKED 2026-04-28 (single-session build) |
| Stripe Connect Express onboarding | PAL: `src/app/api/deliver/driver/connect/*` + signup form | TBD — file when sell-mode vendor Connect ships (the second build inside PAL — third copy across projects elevates it) | designed, second copy in flight |
| Magic-link approval/reject (HMAC) | PAL: `src/app/api/deliver/runner/{approve,reject}/route.ts` + locals offer equivalents | TBD — file when third instance ships | live, two implementations |
| Email cascade (paid → vendor + customer + admin) | PAL: `src/lib/{deliverEmails,localsBuyEmails,housekeepingEmails}.ts` | TBD — file once 3+ verticals are stable | live, three implementations |
| **Tenant collaborator workspace (Wheelhouse Glossary)** | PAL: `/wheelhouse/glossary` page + `wheelhouse_glossary_entries` Postgres table + collaborator-protected upsert (SQL ON CONFLICT omits status/notes/order) + accessible up/down reorder + 17-entry hand-curated seed | TBD — file once second tenant ships the same shape (CrossRef ops catalog or Sage Em agency partner workspace) | LOCKED 2026-04-29 PM (canonical PAL implementation shipped) |
| **Vendor SMS opt-in flow + bulk-invite admin tool** | PAL: `src/data/cart-vendor-sms-store.ts` + `/api/wheelhouse/cart-vendor-sms/route.ts` (cookie + bearer auth) + `/wheelhouse/cart-vendors-sms/page.tsx` (per-vendor + bulk + manual override) + Twilio inbound webhook YES/NO/STOP/CLAIM matcher | TBD — file when second vertical (e.g., locals-vendor or restaurant) ships the same opt-in shape | LOCKED 2026-04-29 |
| **Atomic CLAIM flow (first-SMS-wins race resolution)** | PAL: `src/data/beach-claim-store.ts` (atomic UPDATE WHERE claimed_at IS NULL) + `src/lib/beachVendorBlast.ts` + inbound webhook CLAIM matcher | TBD — file when second marketplace vertical needs first-vendor-wins (e.g., maintenance dispatch racing) | LOCKED 2026-04-29 (first real $300 booking ran through it same session) |
| **Insider SMS bridge (operator + agent rails)** | PAL: `src/data/insiders.ts` + `src/lib/insiderSmsForward.ts` (admin@ email forward w/ MMS attach) + `src/app/api/cron/insider-sms-watch/route.ts` (1-min Vercel cron, operator-only push, no cross-coms) | TBD — file when second tenant needs the same insider-channel pattern | LOCKED 2026-04-29 |
| **Super-admin revenue pings** | PAL: `src/data/super-admins.ts` + `src/lib/superAdminPing.ts` + wires into 6 paid-event endpoints (cart, beach, delivery, locals, housekeeping, maintenance) | TBD — file when second tenant ships the same revenue-pulse pattern | LOCKED 2026-04-29 |
| **Inline Claude SMS agent (Havee)** | PAL: `src/lib/insiderSmsAgent.ts` (Haiku 4.5, tool-use loop, 3-iter cap, AWAITED in webhook to survive Vercel background-kill) + system prompt with action-permissions matrix | TBD — file when second tenant ships an SMS agent (CrossRef / Sage Em are candidates) | LOCKED 2026-04-29 |
| **Twilio Lookup line-type pre-flight** | PAL: `curl https://lookups.twilio.com/v2/PhoneNumbers/+1XXX?Fields=line_type_intelligence` before adding any new mobile to a B2B SMS path | inline in vendor-onboarding playbooks | LOCKED 2026-04-29 (lesson: Lookup classifies fixedVoip / Worldcall as mobile but they bounce 30006 in production — Lookup is a starting filter, not the final word) |
| **Stripe Connect Express for vendor payouts (vertical-second-build)** | PAL: runner Connect (delivery_driver_status table + /api/deliver/driver/connect/{start,refresh,dashboard}) + beach Connect (beach_vendor_status table + /api/beach/vendor/connect/{start,refresh}) — same pattern, slug-keyed vs user-id-keyed | TBD — file when third vertical ships (locals sell-mode is in flight) | LOCKED 2026-04-29 PM (second canonical build) |
| **Auto-payout cron at refund-window-close** | PAL beach: `/api/cron/beach-payouts` hourly, sweeps claims past 72hr-before-setup mark, fires Stripe transfer to vendor's Connect account. Cancellation policy + payout release coupled to a single SQL filter — same number means same mechanism. Idempotent (Stripe idempotencyKey + DB UPDATE WHERE clause). | TBD — file when second vertical needs the same pattern | LOCKED 2026-04-29 PM |
| **Admin payouts tool with onboarding-link SMS delivery** | PAL beach: `/wheelhouse/beach-payouts` + `/api/wheelhouse/beach-payouts` (cookie + bearer auth) — vendor onboarding pills, "Text onboarding link" button (Havee voice via SMS), Stripe dashboard login link, manual "Pay now" button per claim | TBD — file when second vertical ships | LOCKED 2026-04-29 PM |
| **Revenue stats display (Stripe Charges API)** | PAL: `/wheelhouse/revenue` — today/7d/30d gross from Stripe Charges, vertical inferred from `metadata.type` with description-sniffing fallback, refunded charges excluded | TBD — file when second tenant ships | LOCKED 2026-04-29 PM |
| **Live visitors heartbeat (privacy-clean session tracking)** | PAL: `visitor_heartbeats` table + `/api/track-visitor` POST + `VisitorHeartbeat` client component (sessionStorage random ID, 30s heartbeat, sendBeacon fallback, Page Visibility API pause) + `/api/wheelhouse/active-visitors` cookie-gated read + `LiveVisitorsCard` polling component. **Includes admin-traffic exclusion** (cookie + path-prefix check). | TBD — file when second tenant ships | LOCKED 2026-04-29 PM |
| **Instant-archive UX (cleanest-mental-model applied)** | PAL Wheelhouse: API auto-coerces state='done' to state='archived' on PATCH; "Done" button removed from user-clickable transitions; "Archive" is the finishing motion; "Archived (N)" filter chip with count badge replaces "Done" chip | inline pattern, baked into the cleanest-mental-model rule | LOCKED 2026-04-29 PM |
| **Admin traffic 3-layer analytics filter** | PAL: VisitorHeartbeat client-side skip (cookie + path) + Vercel Analytics beforeSend drops /wheelhouse pageviews + wheelhouse_analytics_events SQL queries WHERE path NOT LIKE '/wheelhouse%' | inline pattern, baked into the clear-usable-analytics rule | LOCKED 2026-04-29 PM |
| **Intake-and-surface webhook fallback** | PAL `/api/twilio/sms/inbound`: any inbound that doesn't match a strict intent (CLAIM/YES/NO/STOP) pushes to operator with `[Sender → PAL] body` format. Beach vendor non-CLAIM, cart vendor non-strict, stranger inbound — all routed to a human (Winston) instead of silent-logged | inline pattern | LOCKED 2026-04-29 PM (lesson: don't try to be clever parsing prose intent) |
| **bookings@ transactional ledger CC** | PAL: all 6 paid-event verticals (cart/beach/maintenance/delivery/locals/housekeeping) CC bookings@theportalocal.com on internal alerts. Same alias as the Resend FROM, gives audit-trail visibility | inline | LOCKED 2026-04-29 PM |
| **Workspace SSO + DrizzleAdapter (Internal-only OAuth pattern)** | Sage HQ: `auth.ts` Internal-audience Google OAuth with `hd=domain` enforcement + server-side allowlist (defense-in-depth) + DrizzleAdapter writing user/session/account rows to Neon Postgres. Internal-only audience means no Google verification gauntlet for sensitive scopes (Gmail/Drive/Calendar) — Workspace-only apps can request anything @domain users would consent to. | TBD — file when CrossRef or PAL ships an equivalent Workspace-scoped tool (Likely candidate: any project that needs operator-only SSO instead of magic-link auth) | LOCKED 2026-04-29 (Sage HQ Step 1 ship) |
| **NextAuth stale-tokens-on-re-sign-in fix (signIn callback upsert)** | Sage HQ: `auth.ts` signIn callback that manually upserts the accounts row's access_token / refresh_token / scope on every successful OAuth sign-in. Default DrizzleAdapter only writes on first link; re-consent flows leave stale tokens in DB. Without the fix, scope expansion silently breaks: consent screen shows new permissions, user accepts, but API calls 403 because DB still has OLD token | inline in any auth.ts that uses DrizzleAdapter + plans to ever expand OAuth scopes | LOCKED 2026-04-29 (Sage HQ — every Heye Lab project using DrizzleAdapter needs this) |
| **Drizzle 0.45+ for Neon serverless 1.x compatibility** | Sage HQ: bumped `drizzle-orm@0.36` → `0.45.2` to fix `@neondatabase/serverless@1.x` rejection of the deprecated non-tagged-template `sql()` syntax. Surfaces as runtime crash on first DB query. Every Heye Lab project on the Vercel + Neon + Drizzle stack must be on 0.45+ minimum | inline; pin minimum version in package.json | LOCKED 2026-04-29 (every Drizzle+Neon Heye Lab project) |
| **Vercel author verification — global git user.email = haveebot@gmail.com** | Set on Winston's Mac globally so all commits to Heye Lab repos (haveebot/*) author with a GitHub-verified email and pass Vercel's "Deployment Protection" author check. Local default `winstoncaraker@Winstons-MacBook-Air.local` fails on new Vercel projects with the protection enabled. Force-push amend pattern to fix existing scaffolding commits: `git commit --amend --no-edit --reset-author && git push --force-with-lease` | inline; one-time-per-Mac setup | LOCKED 2026-04-29 (any new Heye Lab repo initialization) |
| **OAuth scope expansion playbook (Gmail + Drive + Calendar via Workspace Internal)** | Sage HQ: scopes-as-array in `authorization.params.scope`, `access_type=offline` + `prompt=consent` for refresh_token, **least-privilege within use case** (gmail.compose not gmail.send; drive.readonly not drive.file; calendar.readonly not calendar.events), Internal-only audience skips Google verification, per-project API enables (Gmail / Drive / Calendar) in GCP project + Data Access page declaration in OAuth consent screen | TBD — file when second Heye Lab project ships scope expansion (likely PAL Wheelhouse if it ever needs Drive/Gmail integration) | LOCKED 2026-04-29 (canonical Sage HQ implementation) |
| **Idempotent CRM ingest from seed JSON + canonical TS source** | Sage HQ: `scripts/ingest-agencies.ts` reads vault seed JSON (full-roster scrape) + dashboard `agencies.ts` (canonical agency list), merges with explicit precedence rule (seed wins for overlap, dashboard wins for unique-to-canonical), preserves user-curated state on re-run (excludedAt / excludedBy / exclusionReason on contacts survive re-ingest of fresh roster scrapes). Idempotent — every re-run lands the same shape | TBD — file when PAL or CrossRef ships an equivalent Postgres-backed pipeline ingest from local TS source | LOCKED 2026-04-29 (Sage HQ canonical) |
| **Inline Claude content composer (Ask Havee pattern)** | PAL 2026-05-01: `src/lib/socialComposerAgent.ts` (Haiku 4.5, tool-use, 4-iter cap) + `/api/wheelhouse/social/compose` POST endpoint + `AskHavee.tsx` UI card on `/wheelhouse/social`. System prompt seeds: brand voice rules + live URL inventory (events/dispatches/heritage built from data files at request time) + today's date in CT. Tools: queue_post / clarify_question / decline. queue_post enforces linkUrl must start with project domain. Two-iteration test produced perfect on-brand caption with correct URL pick. | TBD — file when CrossRef or Sage Em ships a NL composer | LOCKED 2026-05-01 (canonical PAL — extends the SMS Havee agent pattern from 2026-04-29 to a different surface) |
| **Image Bank — single asset library with multi-entry upload** | PAL 2026-05-01: `pal_image_library` Postgres + `src/data/image-library-store.ts` (insert / list / get / soft-delete via `hidden`) + `src/lib/imageUpload.ts` (shared put-to-Blob + insert helper) + `/api/wheelhouse/library` (GET list + POST upload) + `/api/wheelhouse/library/[id]` (PATCH / DELETE) + `/wheelhouse/social/bank` page (drag-drop upload + grid + per-image edit). Two entry points: direct browse + per-card "📚 Pick from Bank" picker on social posts. Both write to same catalog. Soft delete keeps URL live for already-shipped posts. | TBD — file when second tenant ships an image catalog (likely Sage Em brand assets or CrossRef product images) | LOCKED 2026-05-01 |
| **Marketing tile-based hub + breadcrumb (consumer-app UX for non-tech operators)** | PAL 2026-05-01: `/wheelhouse/marketing` page (time-aware greeting using wheelhouse_who cookie + at-a-glance badge row + 3 quick-action tiles + 4 main tool tiles + Coming up + Lately panels) + `MarketingBreadcrumb` component (sticky, one-tap home from any nested page) + Hide-dev-metadata Details toggle on data cards. Validated: Winston "wow this is insane - she is absolutely blown away" — biggest perceived-value jump in PAL operator tooling came from UX polish not features. See `feedback_consumer_ux_for_non_tech_operators.md` for the full playbook. | TBD — file when second tenant ships a collaborator dashboard with this pattern | LOCKED 2026-05-01 |
| **Per-post auto-send cron + Schedule UI** | PAL 2026-05-01: `auto_send_at TIMESTAMPTZ` column on `social_post_queue` + `setAutoSendAt(id, iso)` helper + PATCH `action="schedule"` + `/api/cron/social-auto-send` (every 15 min) picks up due+pending and fires + ⏱ Schedule button on each card with datetime input. Operator can leave any pending row scheduled, cron fires, marks sent. Default stays manual (Send button) — schedule is opt-in per item. | TBD — file when second queued-content system ships this | LOCKED 2026-05-01 |
| **Calendar-based milestone auto-queue cron** | PAL 2026-05-01: `/api/cron/social-milestones` (daily 8am CDT) scans events.ts for any 30/14/7/1d/today/wrap fire that lands inside today's CT day, drafts caption via socialPostTemplates, queues to FB. Loose dedup catches legacy "manual" tags (`<kind>:<slug>` pattern) so hand-stocked posts don't double. `getUpcomingMilestones` helper shares the same logic for the marketing-hub preview. Floor uses `startOfTodayCTMs()` (DST-robust via Intl) so today's already-fired milestones stay in the preview through end-of-day CT. | TBD — file when second tenant runs cron-driven content scheduling | LOCKED 2026-05-01 |
| **Position labels + reorder arrows + jump-to-top (operator queue ergonomics)** | PAL 2026-05-01: `display_order INTEGER` column on `social_post_queue` (backfills to id on first ensureSchema; preserves insert order until reordered) + `moveQueueEntry(id, dir)` two-step swap helper + `moveQueueEntryToTop(id)` (sets to current_min - 10) + PATCH `action="move"` with direction up/down/top + ↑↓⤒ buttons on each pending card with first/last auto-disable + position pill ("🔥 Up next · 1 of 9", "On deck · 2 of 9", etc.). Mirrors Glossary reorder pattern. | TBD — file when second tenant has an operator queue with prioritization | LOCKED 2026-05-01 |
| **Resend pattern (duplicate sent rows back to pending)** | PAL 2026-05-01: `duplicatePost(sourceId)` helper + PATCH `action="resend"` (works on non-pending posts, errors on already-pending) + ↻ Resend button on Recent list rows. Uses trigger_ref `<original>:resend-<timestamp>` so trace lineage preserved + idempotency doesn't block resend-after-resend. Used when an OG was broken on first send, caption typo caught after, etc. | TBD — file when second queued-content system ships | LOCKED 2026-05-01 |
| **FB photo mode + library-cataloged upload** | PAL 2026-05-01: `postToFacebook` branches on imageUrl param — with → POST `/photos` (photo post, no link card, link in caption text); without → POST `/feed` (link card with OG, default behavior). Per-post UI toggle: 🔗 Link mode vs 📷 Upload via custom image. Custom image flows through `uploadAndCatalog` → Vercel Blob + library row, returned URL stored as `image_url` on the post. Operator picks per post via 📚 Pick from Bank / 📤 Upload. | TBD — file when second tenant integrates with FB Graph posting | LOCKED 2026-05-01 |
| **Hide-dev-metadata + Details toggle on data cards** | PAL 2026-05-01: `SocialPostCard.tsx` shows position pill + channel + caption + actions by default; `▸ Show details` toggle reveals trigger_type label, ref string, internal #ID. Pattern for any data card a non-tech operator interacts with: dev affordances are visual noise to them but useful for debugging. Default = hidden, opt-in = shown. | inline pattern | LOCKED 2026-05-01 (per `feedback_consumer_ux_for_non_tech_operators.md` playbook) |
| **FB inspector diagnostic endpoint** | PAL 2026-05-01: `/api/wheelhouse/social/inspect-fb-post?id=N\|extId=FBID` calls Graph API `/{post_id}?fields=is_published,is_hidden,privacy,targeting,feed_targeting,reactions,comments,shares,permalink_url` and returns interpreted summary. Used to definitively diagnose "why can't X see this post" cases. Code never sets targeting, so any restriction visible here is unintentional or page-level. (Note: requires `pages_read_engagement` token scope to fully use; without it returns clear error.) | TBD — file when second tenant integrates with FB Graph | LOCKED 2026-05-01 |
| **Per-post traffic dashboard via own analytics (replaces dead Meta organic insights)** | PAL 2026-05-01 PM: `/api/wheelhouse/social/post-traffic?id=N` joins `social_post_queue` (linkUrl + sentAt) to `wheelhouse_analytics_events` (path + ts + referrer) — counts pageviews where path matches post.linkUrl AND ts in 7d window after sentAt AND referrer ILIKE '%facebook.com%'/'%fb.me%'/'%lm.facebook.com%' OR query_params ILIKE '%fbclid%'. Also pulls 7d top-referrers + hourly first-24h FB breakdown + pre-post baseline daily avg for comparison. UI: 📊 badge on every Recent card (`RecentSent.tsx`), click to expand inline detail panel with 4-tile metric grid + bar chart + referrer list. Toggle: Newest vs Top performers (sort-by-fbClicks-DESC). **Why this matters cross-project:** Meta Graph API v21+ returns empty data for organic post `/insights` (`post_impressions_unique`, `post_clicks`, etc.) — they're API-deprecated for non-paid content. Our own analytics WITH referrer field captures the click-through side, which is a stronger signal than impressions for any directory/dispatch tenant anyway. Pattern requires only that the tenant's analytics events table includes a `referrer` field. | TBD — file when second tenant ships this. Likely Sage Em (agency directory click-throughs) or CrossRef (product spec page click-throughs from email blasts). | LOCKED 2026-05-01 PM |
| **Paid boost auto-fire via Marketing API (when ads_management permission lands)** | PAL 2026-05-01 PM: `src/lib/metaAds.ts` (Marketing API wrapper — createBoost runs the 4-step Campaign → AdSet → Creative-via-`object_story_id` → Ad flow; fetchBoostInsights pulls reach/impressions/clicks/spend per adId; stub mode if META_AD_ACCOUNT_ID unset; hard caps daily_budget_cents at 500 [$5] and duration_hours at 168 [7d] regardless of env value) + `social_post_queue` boost_* columns (boost_status: none\|stub\|active\|complete\|failed\|disabled, plus campaign_id/adset_id/ad_id/creative_id/spend_cents/created_at/insights_synced_at/insights jsonb/error) + POST `/api/wheelhouse/social/boost?action=disable` opt-out + `/api/cron/boost-insights-sync` hourly at :30 (syncs >1hr-old active boosts; marks complete after duration elapsed) + 🚀 Boost button on every sent FB post in `RecentSent.tsx` (greyed out + tooltip with reason if not configured). Re-enables the analytics Meta deprecated for organic — $1/24hr per post is cheap baseline marketing tax (~$5/wk at PAL's cadence) that unlocks reach/CTR/demographics. **Cross-project:** every Heye Lab tenant on FB will eventually hit the same organic-insights deprecation wall; this template is the answer. Pre-built hard safety guards mean a config-leak bug can't burn >$5/post. | TBD — file when second tenant ships this | LOCKED 2026-05-01 PM (stub mode shipped; will flip to live once ads_management scope rotation completes + META_AD_ACCOUNT_ID is set) |

---

## Cross-project PRINCIPLES (added 2026-04-29 PM)

These are higher-order rules that govern HOW we build, not just WHAT we build. Apply across every Heye Lab tenant.

**Cleanest-mental-model rule.** When designing UX, ask "what's the cleanest mental model?" and bias toward that even if it means collapsing intermediate states. Example: Wheelhouse threads went from "Done → wait 7 days → Archived" to "Done = instant Archive" because the in-between state added no real user value while increasing cognitive load. Apply: collapse states, drop intermediate buttons, simplify the model when there's no meaningful semantic in the middle. See `feedback_havee_naming.md` for the codified rule.

**Clear-usable-analytics rule.** Every analytics surface should reflect REAL customer activity, never admin/operator self-traffic. Filter at multiple layers (don't trust one): client-side at source (e.g., heartbeat skip / Vercel beforeSend), DB query backstop (WHERE path NOT LIKE admin-pattern), and visitor identification (cookie checks). Apply to every new analytics surface across all tenants. Winston's principle: "we are the whole team for debugging" — admin traffic is high-volume noise that obscures the small-but-meaningful signal of real customers. See `feedback_havee_naming.md` for the codified rule.

These principles emerged from PAL's 2026-04-29 build sprint but should propagate to CrossRef, Sage Em, and any future tenant.

### Why the web-push portal is a HeyeDeploy template (not just a PAL feature)

Every Heye Lab project ships with the same shape of push need: an internal ops dashboard, multiple vendor/role surfaces, and (for tenant-types like CityDeploy / future verticals) a citizen-facing alerts stream. PAL's 2026-04-28 push build crystallized the entire pattern in one session — meaning the second tenant doesn't get a custom build, they get a transplant.

**The pattern bits (what carries across projects):**
- **One generic `push_subscriptions` table** keyed on `(subscriber_kind, subscriber_id)` + `endpoint` UNIQUE. Schema self-bootstraps via `ensureSchema()` on first call — zero migration overhead per tenant.
- **One reusable `EnablePushButton` client component** with kind+id props. iOS-aware (Add to Home Screen guidance baked in). Reversible toggle (tap to unsubscribe). Light/dark variants for theme flexibility.
- **One generalized service worker** (`/sw.js`) handling every push role via `payload.url` routing. Tab-reuse logic matches first path segment so notifications open the right existing tab.
- **Per-role push fan-out files** (`<role>Push.ts`) follow identical shape: try/catch outer, fan-out inner, expired-pruning, mark-pushed, never throws. One file per kind, ~50 lines each — high template fidelity.
- **VAPID infrastructure** (3 env vars) sets up once per tenant — `npx web-push generate-vapid-keys` → Vercel Sensitive vars → done forever.
- **Severity-tiered emoji prefix** in lock-screen titles (🚨 / ⚠️ / 📍) — same pattern works for any tenant's alert system.
- **Unified opt-in pool** — banner + event push share one customer-topic subscription. Visitors tap once, get the full stream. Reframe to lead with community benefit, not just emergencies.

**The project-specific bits (what each tenant customizes):**
- The list of `SubscriberKind` values (PAL has wheelhouse-participant + cart-vendor + locals-seller + restaurant + housekeeping-vendor + customer-topic; Sage Em would have agency-specific kinds; CrossRef electrical/lighting kinds)
- The trigger points (which DB writes / route handlers / webhooks fire which push)
- The lock-screen copy + URLs (deep-link conventions per tenant)
- The icon assets (each tenant's lighthouse-equivalent — but the SVG-via-Satori pattern carries; remember Satori can't parse `rotate()` transforms, use simple paths)
- The opt-in copy (lead with brand-appropriate benefit; PAL's "Get the call before everyone else" works for local-marketplace tenants but each vertical has its own framing)

**File the pattern doc when:** the second tenant lands a push system using this shape (likely CrossRef beta or first non-PAL CityDeploy tenant). Doc title: `feedback_web_push_portal_cross_project_pattern.md`. Add to `sync-memory.sh` whitelist.

---

## Candidates surfaced — pending second-implementation threshold

Patterns with one Heye Lab implementation each. Watch-list; file pattern docs at the second build per the rule.

| Candidate | Canonical (current) implementation | Trigger to lock |
|---|---|---|
| **Tenant doc generator (markdown → branded PDF)** | Sage Em: `scripts/generate-agency-contract.py`, `generate-agency-brief.py`, `generate-engineer-brief.py`, `generate-monday-comparison-report.py`, `generate-brand-onepager.py` — ReportLab + ImageReader for tenant chrome, deterministic, re-runnable on source-md edit | When PAL or CrossRef ships first equivalent tenant-branded PDF generator. The SHAPE (script structure, ReportLab patterns, brand-asset injection, runnable-from-CLI) carries even though copy/styling/schedules differ |
| **Principal-review → revision iteration cycle** | Sage Em 2026-04-28: stakeholder annotates PDF (Z's review of contract v1.1) → `pypdf` annotation extraction script → md source updated → PDF regenerated via tenant generator → archived as historical artifact alongside resolution log | When second tenant runs a similar review cycle (any tenant with stakeholder review on legal/business docs — likely PAL Heritage research review or CrossRef supplier intro doc review) |
| **Pipeline Snapshot bridge doc** | Sage Em 2026-04-28: `Strategy/Pipeline Snapshot 2026-04-28.md` — schema-aligned point-in-time doc that maps current code-based-data state (`agencies.ts`) to future DB-based-data state (HQ Postgres). Direct seed source for `db:push` once Sage HQ Step 2 (Drizzle migrations) ships | When PAL or CrossRef Wheelhouse migrations need an equivalent bridge from `<state>.ts` → DB seed |

These are flagged but NOT yet pattern docs. Filing happens at second implementation.

---

## When a pattern is NOT a HeyeDeploy template

Sometimes a flow is genuinely project-specific and shouldn't be replicated across Heye Lab projects:
- Brand/voice work (Collie's PAL brand system) — every project has its own brand
- Local content (Heritage research, Dispatches, businesses directory) — town-specific
- Tournament-coverage stack — fishing-tournament-specific in shape, but the data+components ARCHITECTURE is template-able for any cyclical event
- Single-vendor relationships (the maintenance vendor) — every tenant has different local vendors
- Domain-specific scoring (CrossRef's electrical/lighting cross-reference graph) — domain-locked

**The rule:** if the SHAPE generalizes across Heye Lab projects, document the pattern. If only the CONTENT generalizes, just ship it on the project at hand.

---

## How HeyeDeploy relates to CityDeploy / other Deploys

| | HeyeDeploy | CityDeploy | Tenant (e.g. PAL) |
|--|------------|------------|-------------------|
| **Scope** | All Heye Lab projects | One vertical (small/mid-town local marketplaces) | One concrete town |
| **Audience** | Heye Lab team | Other towns/cities | One town's residents + visitors |
| **What ships** | Operating model, pattern docs, shared tooling | A SaaS product (rebranded PAL clone) | A live website |
| **Public-facing?** | Internal mostly (could become IP) | Yes — CityDeploy is sold/licensed | Yes — theportalocal.com |
| **Footer attribution** | n/a (it's the meta-layer) | "Powered by Heye Lab" | "Built on CityDeploy" |

**Footer chain stays the same:** `theportalocal.com` → "Powered by Heye Lab · Built on CityDeploy" — accurate as-is. CityDeploy IS Heye Lab's first vertical-Deploy. HeyeDeploy is the framework underneath that Heye Lab uses to make BOTH efficient.

---

## Why this matters

Without explicit HeyeDeploy thinking, every new Heye Lab project + every new CityDeploy tenant + every new vertical-Deploy is a custom job. With it: every build investment compounds across all projects, all verticals, all tenants. Same engineer time, exponential platform value.

It's also how Nick's platform-extraction work stays cheap: he reads HeyeDeploy pattern docs in any project's memory mirror, doesn't have to reverse-engineer each codebase from scratch.

---

## Patterns crystallized 2026-04-30 — generator discipline + customer-pull signal

A full day of cascading bugs revealed a class of failure that applies to every Heye Lab project producing PDFs/HTML/dashboards. Each pattern below is locked in code (in Sage's generators) and now part of the HeyeDeploy template set.

### Verify-on-render lock (mandatory for every generator)

| | What | Where it shipped first | Apply when |
|--|---|---|---|
| **Verify-on-render** | Every generator that produces a deliverable must read back the rendered output and assert spec-marker presence + predecessor-marker absence. Refuse to leave the file on disk if any assertion fails. Use whitespace-normalized regex matching (PDF text extraction splits phrases across line breaks). | Sage Em 2026-04-30: `scripts/generate-agency-contract.py` `verify_v12()`, `scripts/generate-agency-brief.py` `verify_v11()` (24 v1.1 must-haves, 14 v1.0 must-not-haves, plus orphan-page check). Both raise RuntimeError + unlink the bad file on failure. | Any generator producing PDF/HTML/markdown that has a "current version" worth distinguishing from "stale version." Brief generators, contract generators, report generators, brand-pack generators, spec-sheet generators — every one. |
| **Auto-archive predecessor** | Before writing a new canonical PDF, move the existing one to `<dir>/Archive/<stem>-superseded-<YYYY-MM-DD-HHMM>.<ext>`. Prevents stale-file-side-by-side that caused the L&EA v1.1 mis-attach. | Sage Em 2026-04-30: same generators above, `auto_archive_predecessor()` function. Idempotent — no-op if no predecessor exists. | Every generator. Pair with verify-on-render. |
| **Orphan-page detection** | Every page <400 chars (excluding cover) is a layout failure (orphaned callout, too-small section). Verify-on-render catches it. | Sage Em 2026-04-30: brief generator. Loops through `r.pages`, asserts each page's body text length. | PDF generators specifically. |
| **PDF annotation extraction with highlights+strikethroughs** | When extracting reviewer comments from an annotated PDF, include `/Highlight`, `/StrikeOut`, `/Underline`, `/Squiggly` subtypes — not just `/FreeText`. Silent markup is review feedback too. | Sage Em 2026-04-30: discovered the hard way after missing 10 of Z's 34 annotations on the Brief because they were silent strikethroughs. | Any reviewer-feedback ingestion workflow. |

**Why this matters meta-level:** when source-of-truth is split between markdown + Python (or any two layers), drift will silently happen. Verify-on-render with spec-marker assertions is the only durable defense. Sage's contract generator silently produced v1.1 for several days while metadata claimed v1.2 and the markdown source was correctly v1.2. Two real signed agreements went out on the wrong version. **The discipline now: a "ready to send" declaration requires a passing verify check, automated, non-skippable.**

### Sign-once stamp template

| | What | Where it shipped first | Apply when |
|--|---|---|---|
| **Sign-once** | Extract a signatory's pen-stroke once via image-diff against the unsigned source PDF; store as private PNG asset in `<vault>/Brand/internal-signatures/`; programmatically overlay on every future render under standing consent. README in the folder documents consent + audit chain. | Sage Em 2026-04-30: `Brand/internal-signatures/taylor-mccollum-signature.png` extracted from the L&EA v1.1 Taylor-signed PDF. `stamp_taylor_signature()` in contract generator overlays automatically on every render. | Any internal sign-off workflow where the same signatory signs many similar docs (rep agreements, NDAs, vendor MSAs, partner intros). DocuSign-clone-light. Pair with explicit consent capture in memory. |

### Customer-pulls-the-platform signal

When a customer asks for a portal/dashboard/login/feature that doesn't yet exist as if it does — **that IS the product-market-fit signal.** Build against it immediately as the next priority, ahead of internal-only features.

Filed as standalone memory file: [`feedback_customer_pulls_platform.md`](feedback_customer_pulls_platform.md). Origin: Travis L&EA, 2026-04-30, asking for the agency portal Winston had mentioned in passing. Cross-project applications: PAL resident/contributor portal, CrossRef user dashboard, future tenant customer-facing surfaces.

### Recovery-email-as-intro pattern

When a process error has to be communicated, the composition that works (acknowledge → corrected version + new context → make it about THEM → operate-as-partners) becomes the strongest standard intro pattern. Test against a real recovery before generalizing.

Filed as standalone memory file: [`feedback_sage_intro_email_pattern.md`](feedback_sage_intro_email_pattern.md). Vault template at `Strategy/Standard Agency Intro Email Template.md`. Origin: L&EA recovery 2026-04-30 13:16 → Travis acceptance 18:50.

## Patterns crystallized 2026-05-01 — diagnostics + UX-as-feature-jump

A massive PAL session shipped the entire marketing toolchain end-to-end (Live FB posting, queue with all ergonomics, image Bank, NL composer, consumer-app UX redesign for Collie). Key meta-learnings, all cross-project applicable.

### Meta App "dev mode reach throttle" diagnostic class

When a Meta App (Facebook / Instagram Graph API) is in **Development Mode**, posts published via the API are throttled to be visible only to: app admins, app developers, and explicitly-added test users. Reach to the actual Page audience is severely restricted (PAL saw Reach 2 on a post from the Page where Page admins + their personal accounts both saw it but a non-admin co-marketer did not).

The diagnostic chain:
1. Two viewers see a post (admin + their personal-FB) but a third (non-admin) doesn't → that's the dev-mode signature
2. Meta Insights "Reach" column < 5 on a post that should reach hundreds → that's the dev-mode signature
3. The popup in Meta Business Suite saying "Ads creative post was created by an app that is in development mode" → the smoking-gun confirmation

**The fix:** flip the Meta App from Development → Live in Meta Developer Console. Requirements: Privacy Policy URL, Terms of Service URL, App icon (1024×1024), Category, Data deletion URL. For first-party Page management with `pages_manage_posts` scope, no Business Verification required (don't click "Become a Tech Provider" — that's for accessing OTHER businesses' data, not your own). Use Cases must each show "Ready to test" before publish; pre-publish state should include `pages_read_engagement` if you want post-inspect ability post-Live.

**Crucial caveat:** existing posts published in dev mode are stuck with their reach — they don't retroactively gain visibility post-Live. Only future posts benefit. So any "we're testing the API" posts published in dev mode should be expected to flop, not used as success/failure signal.

**Cross-project rule:** every Heye Lab project that publishes via Meta Graph API must check Live mode status before treating any reach number as signal. Add this to onboarding playbook for any tenant integrating with FB/IG.

### Root-layout `openGraph` overrides child-page metadata bug

In Next.js App Router, fields nested inside the root `layout.tsx`'s `openGraph` block are **authoritative** — they override any child-page metadata that doesn't ALSO nest its own `openGraph`. Setting `openGraph.title`, `openGraph.description`, `openGraph.url` at the root means every page on the site scrapes those values regardless of what the page's own `title` and `description` say.

Symptom: child page sets `title` + `description` correctly, browser tab shows the right title, but FB / Twitter / LinkedIn previews show the homepage title + description + URL. Image often correct (because `og:image` is per-page via `opengraph-image.tsx`).

**The fix:** keep ONLY global fields in root `openGraph` — `siteName`, `locale`, `type`. Strip `title`, `description`, `url`. Each page's top-level `title` and `description` then auto-derive into `og:title` and `og:description`; `og:url` defaults to the request URL.

**Same root cause as the canonical bug** PAL fixed 2026-04-30 (where `alternates.canonical: "https://theportalocal.com"` at root made every URL canonicalize to homepage). The pattern: **root layout sets only TRULY GLOBAL fields**; per-page metadata handles per-page values; never override at root with values that should vary by page.

**Cross-project rule:** when initializing a Next.js App Router project, audit the root `layout.tsx` for any field nested inside an object whose name ends in `-graph` or `alternates` — those tend to be merged-not-replaced and cascade silently. PAL had two of these bite us in two days.

### Vercel Blob "store-level access" + token auto-injection

Two learnings from setting up the PAL image Bank:

1. **`BLOB_READ_WRITE_TOKEN` auto-injects** when you create a Blob store in the Vercel dashboard. No input field; the dashboard generates and injects to project env vars (Production + Preview + Development). If the modal didn't ask you for it, that's correct behavior, not a bug.

2. **Store-level "private" vs "public" access setting** affects whether blob URLs are publicly fetchable. For any blob URL that needs to be FB-scrapable (or scraped by any third-party), the store must be public. Per-blob `access: "public"` in code is necessary but may not be sufficient — store-level setting can override. Test by fetching the URL anonymously (incognito) immediately after upload; if 401/auth required, the store is private and needs recreation.

3. **Recreating a Blob store** generates a new `BLOB_READ_WRITE_TOKEN`. The OLD deployment captured the OLD token at build/deploy time, so a redeploy is required for env to refresh. Push an empty commit to trigger.

**Cross-project rule:** any Heye Lab project using Vercel Blob for FB-scraped content needs (a) public store + (b) verify-public-fetch in setup smoke test + (c) understand redeploy cycle on token rotation.

### "Two systems, similar names" gotcha (upcoming-triggers preview vs auto-send cron)

PAL had a moment where Winston saw a milestone disappear from the marketing hub's "Upcoming triggers" list and thought it had auto-fired a post. It hadn't. The list was a **calendar preview** — pure display logic that filters out past fire dates. The actual auto-fire cron didn't yet exist (was on the build list).

The lesson: **when shipping read-only previews of "what would happen if X were running", visually mark them differently from active state.** A preview list and an action list should look distinct. Without the visual distinction, operators can't tell whether something happened or not.

**Cross-project rule:** any operator surface that shows "future state" or "would-be-triggered" content needs explicit framing (sub-header, badge, color) so it's never confused with "did happen." Canonical PAL fix: marketing hub's Upcoming Triggers panel says "Posts that auto-queue on these dates" + has a "Note: Meta in stub mode" footnote when the cron isn't actually wired.

### UX-as-feature-jump validation

The single biggest "wow" reaction Collie had in the entire PAL build came from the marketing hub redesign — tile launcher + breadcrumb + Details toggle + friendly copy. Not new features. **Existing features rebuilt with consumer-app polish unlocked Collie's confidence in operating independently.**

This validates the broader principle: **for non-engineer collaborators, UX polish is a feature.** A new tool with dev-console design will be used hesitantly; an old tool with consumer-app design will be used confidently. The right ratio of investment is closer to 50/50 (features/UX) than the engineering default of 90/10.

Filed as standalone memory file: [`feedback_consumer_ux_for_non_tech_operators.md`](feedback_consumer_ux_for_non_tech_operators.md). Default for any Heye Lab tenant tool a non-engineer touches.

---

### Generator-vs-spec drift bug class

When source-of-truth lives in TWO places (e.g., markdown + Python that hardcodes the same content), drift will silently accumulate. **Always:**

1. Make the markdown the canonical source if practical (Python reads markdown at render time)
2. OR: lock both layers behind a verify-on-render assertion that compares rendered output to spec markers
3. NEVER rely on metadata (DOC_VERSION = "v1.2") as evidence of what's in the body

Sage Em 2026-04-30 had this bug on BOTH the contract generator AND the brief generator. Both got the verify-on-render lock as the durable fix. Same pattern likely applies to:
- Sage Engineer Brief generator (not yet audited)
- Sage Brand Onepager generator (likely the same drift risk)
- Sage Dashboard-vs-Monday CRM Report generator
- Future PAL/CrossRef equivalent generators

---

## Pickup-here

When this file gets revisited:
- [ ] Rename `Port A Local/Memory/CityDeploy — Platform Vision.md` to `HeyeDeploy — Framework + Verticals.md`. Restructure so HeyeDeploy is the header and CityDeploy is a section beneath. Existing PAL-specific feature inventory stays under the CityDeploy section.
- [ ] Audit existing PAL features and identify HeyeDeploy template candidates not yet documented
- [ ] Backfill pattern docs for the templates already locked in (Stripe Connect Express, magic-link HMAC, email cascade) once they hit the third-implementation threshold
- [ ] Decide: which feedback files belong in EVERY Heye Lab project's memory mirror vs which are PAL-only? (Probably: HeyeDeploy + arnold + truck + Wheelhouse pattern + CityDeploy pattern doc all go everywhere; PAL-specific brand/dispatch/etc stay PAL-only.)
- [ ] When CrossRef gets a memory mirror established, copy this file in. Same for Sage Em. The HeyeDeploy doc should live in every Heye Lab project's mirror so the framework is visible from any working context.
- [ ] Decide whether to file a complementary `feedback_<vertical>_deploy_pattern.md` for each new vertical-Deploy as it spins up (e.g., a future ElectricalDeploy or StudioDeploy doc)
