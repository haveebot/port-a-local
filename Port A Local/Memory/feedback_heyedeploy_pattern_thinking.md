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

## Pickup-here

When this file gets revisited:
- [ ] Rename `Port A Local/Memory/CityDeploy — Platform Vision.md` to `HeyeDeploy — Framework + Verticals.md`. Restructure so HeyeDeploy is the header and CityDeploy is a section beneath. Existing PAL-specific feature inventory stays under the CityDeploy section.
- [ ] Audit existing PAL features and identify HeyeDeploy template candidates not yet documented
- [ ] Backfill pattern docs for the templates already locked in (Stripe Connect Express, magic-link HMAC, email cascade) once they hit the third-implementation threshold
- [ ] Decide: which feedback files belong in EVERY Heye Lab project's memory mirror vs which are PAL-only? (Probably: HeyeDeploy + arnold + truck + Wheelhouse pattern + CityDeploy pattern doc all go everywhere; PAL-specific brand/dispatch/etc stay PAL-only.)
- [ ] When CrossRef gets a memory mirror established, copy this file in. Same for Sage Em. The HeyeDeploy doc should live in every Heye Lab project's mirror so the framework is visible from any working context.
- [ ] Decide whether to file a complementary `feedback_<vertical>_deploy_pattern.md` for each new vertical-Deploy as it spins up (e.g., a future ElectricalDeploy or StudioDeploy doc)
