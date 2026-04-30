# Handoff — 2026-04-29 PM (Wheelhouse organization sprint + analytics hygiene)

_Continuation of the morning's `handoff-2026-04-29.md`. Both briefs together describe the full day. PM-side stands alone for the afternoon's work; pair with the morning brief for full context._

---

## What just happened (one paragraph)

Continuation of the marathon. **17 more commits this PM** (`2693da5` → `5265754`) on top of the morning's 23 — **40 commits in one day**, the largest single-day shipping sprint in PAL history. Theme shifted from "ship the SMS arc" to "organize the Wheelhouse into a real operating dashboard." The Wheelhouse went from a bare ops board to a multi-tool admin surface: revenue stats, beach payouts admin, live visitors counter, marketing glossary for Collie, instant-archive thread UX, intake-and-surface webhook pattern, admin analytics filtering at 3 layers, vendor-model pricing for beach with 72hr cancellation policy + auto-payout cron. **Two cross-project principles** got codified into memory (cleanest-mental-model rule + clear-usable-analytics rule) so they propagate to CrossRef, Sage Em, and every future Heye Lab tenant. **Eleven new HeyeDeploy templates** locked into `feedback_heyedeploy_pattern_thinking.md` — each with canonical implementation paths so the second tenant doesn't re-invent.

---

## What's now LIVE in production (this PM session)

- **Cart vendor opt-in policy reversed:** default-opt-in for directory cart vendors; STOP/NO-only exclusion. Ash Cart Rental marked inactive (replied STOP earlier). Net: 14 cart vendors now in active blast roster.
- **Intake-and-surface webhook:** any inbound that doesn't match strict intent (CLAIM/YES/NO/STOP) pushes `[Sender → PAL] body` to operator. Beach vendor non-CLAIM, cart vendor non-strict, stranger inbound — all routed to Winston instead of silent-logged.
- **Beach pricing reworked:** vendor-model split. Cabana $275 vendor + $25 PAL fee = $300 customer. Chairs $75 + $10 = $85. Customer total unchanged. Stripe metadata records vendor/PAL split.
- **Beach Stripe Connect onboarding rails:** vendor-facing pages at `/beach/vendor/{slug}/connect` for John / Tyler / Danny. Mirrors runner Connect pattern (second canonical PAL build of Connect Express).
- **Beach cancellation policy:** 72hr-before-setup free-cancellation cutoff. Copy on /beach page + customer email + Stripe receipt.
- **Beach auto-payout cron:** hourly, sweeps claims past 72hr-before-setup, fires Stripe transfer to vendor's Connect account. Idempotent. Pings Winston if vendor blocked by missing Connect onboarding.
- **Beach payouts admin:** `/wheelhouse/beach-payouts` — vendor onboarding pills, "Text onboarding link" button (Havee voice), Stripe dashboard link, manual "Pay now" per claim.
- **Wheelhouse Revenue stats:** `/wheelhouse/revenue` — today/7d/30d gross from Stripe Charges, per-vertical breakdown.
- **Live visitors counter on /wheelhouse:** pulsing emerald-dot card showing count of distinct sessions in last 3 min + path breakdown. Privacy-clean (sessionStorage tokens, no PII). **Filtered to exclude admin traffic.**
- **Marketing Glossary for Collie:** `/wheelhouse/glossary` — 17-entry hand-curated feature inventory, marketing status pills, free-form notes Collie can add, accessible up/down reorder. Collaborator-protected schema (Claude can't overwrite her annotations).
- **Instant-archive thread UX:** API auto-coerces `state='done'` → `state='archived'`. "Done" button removed from user-clickable transitions. "Archived (N)" filter chip with count badge replaces "Done" chip. 3 legacy done threads swept on deploy.
- **Admin traffic 3-layer filter:** client (VisitorHeartbeat skip) + source (Vercel Analytics beforeSend) + backstop (SQL `path NOT LIKE '/wheelhouse%'`). PAL traffic numbers now reflect real customers only.
- **bookings@theportalocal.com receives transactional copies** across all 6 paid-event verticals.

---

## Awaiting Winston actions

- [ ] **Send beach vendor onboarding links** to John / Tyler / Danny so they can complete Stripe Connect setup. Personal links: `theportalocal.com/beach/vendor/{john-brown,tyler,danny-peterson}/connect`. Or use the "Text onboarding link" button in `/wheelhouse/beach-payouts` to fire from there.
- [ ] **Stephanie's $300 cabana booking (May 9):** awaiting CLAIM from Tyler or Danny (John declined — out of town). Once one of them claims AND has Stripe Connect onboarded, the May 6 cron tick auto-pays $275. Otherwise manual via `/wheelhouse/beach-payouts` "Pay now" or Stripe Dashboard.
- [ ] **Vivian (Joy Cart Rentals) opt-in reply** — sent SMS to her cell `+13613326532` earlier. If she replies YES, add her cell to `cart-vendors.ts` as Joy's `phoneMobile`. If NO/STOP, no change.
- [ ] **5 SMS-dead cart vendors still need owner cells** (carryover from morning): Coastal Ed's, Port A Beach Buggies, Tarpon, Jackfish, PA Golf Cart Rental. Verbal/email ask required.
- [ ] **City Secretary PIA** — clock running, response due ~2026-05-13. Feeds the P&Z Capture piece.
- [ ] **Photo licensing review for Bujan piece** — still pending from a prior session.
- [ ] **STRIPE_SECRET_KEY rotation** — recommended (sed-regex transcript leak earlier in week, still open).
- [ ] **Anthropic API key migration** to dedicated Heye Lab account when convenient (Option 2 from earlier).
- [ ] **Possibly review:** delivery + locals + housekeeping internal alerts ALSO go to `hello@theportalocal.com` (PAL's public contact inbox). Slightly odd architecture — flagged this AM but not changed.

---

## What's NOT done (in-flight or deferred)

- **Visitor heartbeats prune cron** — table grows linearly. At PAL volume (~50 sessions/day) it's months before any cleanup is needed. Defer.
- **Glossary v2 features** (per parking doc): codebase auto-sync ("pending review" bucket when feature data changes), one-click PDF export from canonical state, drag-and-drop reorder (current: up/down arrows).
- **Per-kind opt-out UI for super-admin revenue pings** — currently hardcoded all-on. Opt-out scaffold exists in code but no UI.
- **Beach vendor stale-booking cron** — if no vendor claims a booking 4 hours before setup, ping Winston for manual dispatch. Not built.
- **Auto-payout for delivered orders that missed Connect onboarding** — runner pattern handles this; beach pattern is on-demand for v1.
- **Multi-unclaimed beach booking disambiguation** — today vendor's CLAIM applies to most-recent unclaimed.

---

## Key recent decisions (this PM session)

- **Cleanest-mental-model rule (LOCKED).** When there's no user value in an intermediate state, collapse it. Done → Archived = instant. No 7-day buffer. Applied cross-project.
- **Clear-usable-analytics rule (LOCKED).** Admin traffic NEVER pollutes customer metrics. Filter at multiple layers. Applied cross-project.
- **Cart vendors are default-opt-in for SMS blasts.** Manual opt-out is the only exclusion. STOP'd vendors removed from listings + directory entirely.
- **Beach pricing model is vendor-base + PAL booking fee.** Customer total unchanged but split is now transparent + Stripe metadata captures both halves for clean payout settlement.
- **72hr-before-setup is the cancellation cutoff AND the payout-release trigger.** Single number, single mechanism — same SQL filter governs both customer-facing policy AND vendor-side payout.
- **Glossary collaborator fields are protected.** SQL `ON CONFLICT` clause intentionally omits `marketing_status`, `collaborator_notes`, `display_order`. Any future codebase-sync auto-update can never overwrite Collie's work. This is the canonical implementation of the HeyeDeploy "Tenant Collaborator Workspace" template — pattern bit that protects collaborator state from automated updates is the key insight.
- **Intake-and-surface beats prose-intent parsing.** Don't try to be clever — just route messages to a human when intent isn't strictly known. John Brown's "out of town" demonstrated why.
- **Admin traffic exclusion: 3 layers, not 1.** Client + source + backstop. Defense in depth so a single failure doesn't pollute the dashboard.

---

## Direct Winston quotes (intent fingerprints — this PM session)

> "cleanest mental model is beautiful - we should use that mentality a ton - we probably already do - instant archive" — codified the rule

> "we are the whole team for debugging hahaha - cook it - clear usable analytics as much as possible, always" — codified the analytics-hygiene rule

> "intake the message and do what we need to with it - John sends a message like that - we see it and we know he won't be able to do any beach setup this weekend" — codified the intake-and-surface webhook fallback

> "i think we need it" (re beach payouts admin tool) — green light to ship Option B

> "we are pretty much at the point that we consider this machine and all associated accounts as owned by HeyeLab" — broader account-structure framing

> "we have completed many tasks so far in this session that are great for HeyeDeploy - always make sure that also has a full truck happening recording best practices and notes, steps etc - always the bigger picture" — closing instruction that produced this brief's HeyeDeploy template updates

---

## HeyeDeploy template status (after this session)

**Newly LOCKED 2026-04-29 PM** (added to `feedback_heyedeploy_pattern_thinking.md`):

11. **Tenant collaborator workspace (Wheelhouse Glossary)** — flipped DESIGNED → LOCKED. Canonical PAL implementation shipped.
12. **Stripe Connect Express for vendor payouts (vertical-second-build)** — runner + beach = pattern crystallized.
13. **Auto-payout cron at refund-window-close** — couples cancellation policy + payout into single SQL filter.
14. **Admin payouts tool with onboarding-link SMS delivery** — admin-side companion to the vendor-side Connect flow.
15. **Revenue stats display per Stripe Charges API** — today/7d/30d aggregate with vertical breakdown.
16. **Live visitors heartbeat (privacy-clean)** — sessionStorage-token tracking with admin-traffic exclusion baked in.
17. **Instant-archive UX (cleanest-mental-model applied)** — collapses Done → Archived via API auto-coercion + UI button removal.
18. **Admin traffic 3-layer analytics filter** — defense-in-depth analytics hygiene.
19. **Intake-and-surface webhook fallback** — route prose to a human, don't try to be clever with intent parsing.
20. **bookings@ transactional ledger CC** — cross-vertical pattern for paid-event email recipients.

**Two cross-project PRINCIPLES** added to `feedback_heyedeploy_pattern_thinking.md` (higher-order than templates):
- Cleanest-mental-model rule
- Clear-usable-analytics rule

These propagate to every Heye Lab project, current and future.

---

## Files that carry the PM session's patterns

**Backend:**
- `src/data/glossary-store.ts` + `src/data/glossary-seed.ts` — Glossary table + seed
- `src/data/beach-vendor-status.ts` — beach Connect onboarding status
- `src/data/beach-claim-store.ts` — extended with payout tracking columns
- `src/data/visitor-heartbeats.ts` — live visitor tracking
- `src/data/cart-vendors.ts` — Ash flipped inactive + Joy Cart Rentals (Vivian's cell pending)
- `src/data/cart-vendor-sms-store.ts` — `getOptedOutSlugs` helper for default-opt-in policy
- `src/lib/cartVendorSmsBlast.ts` — opt-out filter (default-in)
- `src/lib/beachPayouts.ts` — Stripe transfer helper for vendor payouts
- `src/lib/beachVendorBlast.ts` — beach SMS templates + claim resolution

**API routes:**
- `/api/beach/vendor/connect/{start,refresh}` — vendor Connect onboarding
- `/api/cron/beach-payouts` — hourly auto-payout cron
- `/api/cron/archive-done-threads` — backstop archival
- `/api/wheelhouse/beach-payouts` — admin actions
- `/api/wheelhouse/glossary/[id]` — collaborator-field updates
- `/api/wheelhouse/sweep-done-archive` — one-shot admin sweep
- `/api/wheelhouse/active-visitors` — live visitor count
- `/api/track-visitor` — heartbeat
- `/api/twilio/sms/inbound` — extended with intake-and-surface fallback

**Pages:**
- `/wheelhouse/glossary` + EntryRow + page
- `/wheelhouse/beach-payouts` + VendorRow + ClaimRow
- `/wheelhouse/revenue`
- `/beach/vendor/[slug]/connect` + ConnectStartButton

**Components:**
- `src/components/AnalyticsWrapper.tsx` — Vercel Analytics with admin filter
- `src/components/VisitorHeartbeat.tsx` — extended with admin skip
- `src/components/wheelhouse/LiveVisitorsCard.tsx` — admin-side display

**Cron schedule (vercel.json):**
- `* * * * *` — insider SMS watch
- `0 * * * *` — beach payouts auto-fire
- `0 13 * * *` — daily PAL Pulse digest
- `0 14 * * *` — archive done threads (backstop)
- `0 13 * * 1` — council scrape (weekly)

---

## Next-session pickup prompt (paste into a fresh chat)

> Pick up from `Port A Local/Session Notes/handoff-2026-04-29-pm.md` — read that first, then the "Current State as of 2026-04-29 PM" section in `project_pa_local.md`, then run `python3 scripts/wheelhouse.py orient`. Things to check first thing:
>
> 1. Did Stephanie's $300 cabana booking (May 9) get CLAIMed by Tyler or Danny? If yes + their Connect is onboarded, May 6 cron tick auto-pays $275.
> 2. Did Vivian (Joy Cart Rentals, +13613326532) reply to the opt-in invite? If YES → add her cell as Joy's phoneMobile in cart-vendors.ts. If NO/STOP → no action.
> 3. Did John / Tyler / Danny finish Stripe Connect onboarding? Check `/wheelhouse/beach-payouts` page.
> 4. Did the daily PAL Pulse cron fire correctly at 8am CT? (Should be clean now that admin traffic is filtered.)
> 5. Any new revenue events overnight? Check `/wheelhouse/revenue`.
> 6. Any insider SMS that Havee processed overnight? `pal_mail.py inbox` for `[SMS from ...]` subjects.
>
> Ready when you say.
