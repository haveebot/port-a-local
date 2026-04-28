# PAL Enhance Review — 2026-04-28

_Winston's prompt: "is it time? maybe a full scale scrape of what we have added since we last enhanced it — what we can add — best practices now that we have updated the site to something larger — use of agent assistance for NL — etc."_

**TL;DR — Yes, it's time.** PAL has roughly 4× the surface area it had at the last enhance pass (~Apr 14–15). Five new verticals, two operational dashboards, ~10 new long-form pieces, three new portals, and a Wheelhouse pattern that's about to fork into CrossRef. The site is no longer "a directory site." It's now a multi-vertical local platform with operational tooling, real-money transactions, and editorial depth. Time to do a sweep.

This doc surfaces (a) what's been added, (b) what's slipping, (c) best-practice gaps the bigger surface area exposes, (d) agent-assistance leverage we haven't used yet. Each item is "fix now / fix soon / file for later" labeled. Pick the ones to ship.

---

## Section A — What got built since the last enhance pass (~Apr 14–15)

**New revenue + operational verticals (5)**
- PAL Delivery — runner pipeline, Stripe Connect Express, cookie sessions, leaderboard, $5 first-delivery bonus, customer order tracking, runner rewards ladder
- PAL Locals — rent + hire + sell modes, photo-attestation, Stripe Connect for sell-mode vendors (today), buy-now cascade, vendor portal, webhook
- Housekeeping (`/housekeeping`) — Stripe Checkout, admin email, Wheelhouse mirror
- Convenience-store deliveries (Lowe's Market) — same Stripe + runner machinery, 20% loss-leader markup
- Custom Stripe payouts admin (`/wheelhouse/payouts`) — cookie-gated tool

**Operational tooling (3)**
- The Wheelhouse — internal ops dashboard, threads, activity ticker, PAL Pulse digest, Web Analytics Drain, agent CLI (cross-project pattern)
- Wheelhouse cross-project pattern — locked + documented for replication to CrossRef + Sage Em + future Heye Lab tenants
- Memory mirror — `Port A Local/Memory/` syncs with auto-memory; Nick can mine PAL patterns from the repo

**Editorial layer (a lot)**
- Heritage #18–24 (Red Snapper Fleet, Card Table That Built Texas Sandfest, etc.) — total now 24 published pieces
- Dispatch — new section at `/dispatch`, distinct from Heritage. First piece: "The Two Port Aransases" (Tourism Bureau vs. in-town reality)
- Dispatch user-submission pipeline — submit topic → silent acknowledgment → publish if used
- 4 new event hub pages: Spring Kite Festival, Deep Sea Roundup 2026, TWAT 2026, Texas Legends Billfish 2026, Pachanga 2026, Tournament Season hub, **Sandfest 2027 (today)**
- 8 tournament-coverage components (Leaderboard, Divisions, Captain Spotlight, Piggy Perch, Rules, Past Champions, Historical Photos, Milestones)

**Brand + design (Collie v2)**
- Lighthouse mark v2 — re-anchored on Collie's design (Apr 24)
- Round 1 portal icons v2 — 9 directory + portal icons
- Brand kit page at `/brand`
- Marketing operations vault — content calendar, caption library, outreach tracker

**Communication primitives**
- haveebot mail — direct comms tool (`scripts/haveebot_mail.py`) for Collie/photo intake
- 6 transactional email cascades (delivery, housekeeping, locals buy, runner approval, vendor approval, photo-verify)
- Insurance agent auto-dispatch (today) — adds approved runners to umbrella policy

**Trust + safety (today)**
- 18+ + content-rules attestation across runner + locals provider forms
- Favicon aligned to Collie's icon-level spec

---

## Section B — What's slipping / drifted

**Ship-ready, just needs Winston's go**
- **Stripe Connect Tyler one-shot** — the new approval-email flow doesn't auto-fire for already-approved vendors. Tyler is the only one. Need a one-time email with his vendor portal magic link. Fix soon.
- **First sell-mode listing** — `LISTINGS` array still empty in code; Tyler's offer is in DB but not promoted to a Listing TS entry. Until he completes Stripe onboarding + a Listing entry exists, the buy-now cascade has nothing to test against. Fix when Tyler onboards.
- **STRIPE_LOCALS_CONNECT_WEBHOOK_SECRET** is set; webhook is registered. Recommend rotating the leaked `STRIPE_SECRET_KEY` from yesterday's transcript as a precaution. Fix now.

**Stale data**
- **Lowe's Market store details** — address (`611 N Alister St`), phone (`(361) 749-6602`), 7am–10pm hours are best-guesses. Need verification on first run. File for later.
- **License-plate field** — added at signup, but existing approved runners (Tyler, Winston) don't have plates on file. Backfill plan needed. Fix soon.
- **TWAT 2026 dates** — "tentative Aug 21–23" in events.ts. Lock once official site posts. File for later.
- **Pachanga 2026 dates** — "Mid-July (tentative — 2025 was July 16–19)". Same. File for later.

**Events index churn**
- Sandfest 2026 is past. Inline entry now points at 2027 detail page. ✓ done today.
- Several events.ts entries reference "2026" in slug + dates. After each event ends, we'll need a flip-to-2027 ritual. **File for later: Sandfest-pattern automation** — when an event's `endISO` passes, the system rolls slug + dates to next year automatically (with a "we covered it" recap landing at the previous slug as a 301 source).

**Form ergonomics**
- Runner signup is now 5 acknowledgement checkboxes (license + insurance + photos + 18+/conduct + the implicit form fields). Heavy. **File for later: "expert mode" toggle** for repeat signups, or auto-collapse when applicable.
- Locals offer form has 3 mode buttons + dynamic photo + 18+/conduct. Mobile-okay but trending toward heavy. Same file-for-later.

---

## Section C — Best-practice gaps the bigger surface exposes

### Performance
- **Page-level loading states** — many `force-dynamic` routes (Wheelhouse, success pages, runner hub) don't show skeletons during fetch. Fix soon: add Suspense boundaries to the heaviest server components.
- **Image optimization** — `archives.ts` references 31 historical photos via direct paths. Some are 1-3MB JPGs not optimized through Next/Image. Fix soon: convert to next/image with sizes. Big SEO + LCP win.
- **OG image regeneration** — every ImageResponse loads full SVG via fs at request time. Fine for low traffic, but caching the data URL would shave 50-100ms per OG response. File for later.

### Accessibility (a11y)
- **Skip-to-content link** on Navigation — not present, common a11y miss. Fix soon.
- **Form error announcements** — current forms set `setError` to a div. Need `aria-live="polite"` on the error region so screen readers announce. Fix soon.
- **Color-contrast audit** — coral-300 on navy-900 (delivery driver hub) is borderline at small sizes. Run axe + Lighthouse. File for later.
- **Focus rings** — many buttons rely on default browser focus rings; some are styled away. Audit. File for later.

### SEO
- **Per-event JSON-LD** — DSR has full Event schema. Sandfest 2027 (just shipped) does NOT yet have it in `/events/[slug]/page.tsx`. Verify the dynamic page emits Event schema for any event with `featured: true`. Fix soon.
- **Canonical URLs on every page** — most pages have them via metadataBase but `/wheelhouse/*` routes are noindex (correct). Check the new `/locals/vendor/[offerId]` is noindex (it is — magic-link gated). ✓
- **Sitemap entries for new content** — Sandfest 2027 should be in the sitemap automatically via `events.ts` iteration. **Verify** sitemap.xml has the new URL.

### Security
- **Webhook signing audits** — Stripe webhooks (regular + Connect) are signed-verified. Other inbound webhooks (Wheelhouse analytics drain) use HMAC-SHA1. Vercel Web Analytics drain. Verify ALL inbound webhooks are auth'd. ✓ confirmed earlier.
- **Magic-link expiration** — locals magic links (approve/reject/verify-photos/vendor-connect) don't expire. Acceptable risk because they're scoped to specific offer IDs and the secret can rotate. **File for later: per-link expiration** if compromise becomes a real concern.
- **Rate limiting** — `/api/locals/inquiry` and `/api/deliver/runner` (signup endpoints) have no rate limit. A bot could mass-signup and burn admin email budget. **Fix soon: add a basic IP rate limit middleware** (Vercel KV or in-memory token bucket).
- **CSRF on state-changing routes** — Next.js App Router server actions handle CSRF; raw API routes that mutate state with cookie auth (like runner toggle on-duty) should verify origin or use SameSite=Strict. Audit. File for later.

### Observability
- **Wheelhouse Pulse covers most of it.** But: error logs from Vercel only surface in the dashboard, not in PAL Wheelhouse. **File for later: error-mirror to a "PAL Errors" pinned thread**, with stack-trace-when-known. Useful for catching cascades that fail silently.
- **Email deliverability dashboard** — Resend has analytics; PAL doesn't surface them. File for later.

### Code quality
- **Inline HMAC patterns** — locals routes were refactored to shared `locals-hmac.ts` (yesterday). **Runner routes still have inline HMAC** (approve/reject/verify) — should follow the same shared-helper pattern. Fix soon.
- **Inline Stripe instantiation** — `localsStripe.ts` (today) helper exists but `/api/locals/buy/[listingId]/route.ts` still creates its own `getStripe()`. Refactor to use the helper. Fix soon.
- **Insurance dispatch** is only called from the runner approve route. Mirror it to the locals vendor approve route (when relevant — e.g., commercial vendor gets a similar "added to platform policy" notification). File for later.

### Operational
- **Tyler one-shot** — flagged in section B.
- **Dispatch + Heritage cross-link maintenance** — As we add more pieces, cross-links go stale. **File for later: a periodic check that verifies every `relatedStories[]` and `relatedHistory` href resolves to an existing file.**
- **Vercel env audit** — last cleanup unknown. List + check no stale keys, no leaked test keys. Fix soon (pair with the STRIPE_SECRET_KEY rotation).

---

## Section D — Agent-assistance leverage we haven't used yet

PAL is now big enough that natural-language-driven workflows save real time. Candidates:

### High-value, ship-this-month
- **Heritage piece drafter** — Winston feeds a topic + sources, agent drafts a 6–10 minute Heritage piece in PAL voice + structure. Requires a "PAL voice + style" prompt artifact (Collie's brand guide already partly captures this). Pair with a `/dispatch-draft` slash skill.
- **Event recap auto-generator** — when an event's `endISO` passes, agent compiles photos + Wheelhouse activity + winners into a recap section appended to the existing event hub. Triggered by Wheelhouse cron.
- **Inquiry triage** — `/api/locals/inquiry` posts customer requests into the Wheelhouse. Agent reads new inquiries, drafts 2-3 reply options for Winston to pick from. Saves 5 min per inquiry. Cron-triggered.
- **Vendor outreach drafter** — `Port A Local/Marketing/Outreach Tracker.md` has 🟠 (warm leads). Agent drafts the next-touch email per row. Winston approves + sends.

### Medium-value, ship-next-month
- **Listing photo describer** — when Collie or a vendor emails photos for a listing, agent extracts caption + alt text + suggested PortalIcon. Bridges the photo-to-feature workflow's last manual step.
- **Live music lineup OCR + scheduler** — already partly built (vision OCR on Tonight pages); extend with weekly auto-sweep of South Jetty's social posts + auto-publish.
- **SEO meta-description audit** — agent crawls all routes, surfaces missing/duplicate/over-length descriptions, proposes fixes.

### Long-game
- **Editorial calendar autopilot** — ~4-week content calendar in `Port A Local/Marketing/Content Calendar.md`. Agent reads it weekly, surfaces what's overdue + drafts the post.
- **Anonymized analytics summarization** — agent reads Wheelhouse analytics events daily, surfaces "what's catching attention this week" insights to the PAL Pulse digest.
- **Sandfest hub + Bujan piece + Sandfest brand asset agent** — once the Sandfest board is engaged, agents can assist board comms (board agendas, sponsor outreach drafts, vendor confirmations). Sandfest is already the proof case for HeyeDeploy event-hosting; agents become the interface.

### Patterns worth locking
- **Spawn-and-forget research** — today's Sandfest + Bujan agents are textbook. Background research while main thread cooks. **Lock this as a HeyeDeploy ritual: "before any large content/feature build, spawn a research agent to compile a brief at `Features/<thing> — Research Brief.md`."**
- **HeyeDeploy doc generation on each ship** — every reusable pattern gets a HeyeDeploy doc filed alongside. Today's Stripe Connect onboarding could be that doc. File for later: agent that watches commits and auto-drafts HeyeDeploy template docs.

---

## Section E — Recommended punch-list (what to actually ship)

In priority order, what to ship in the next 2-3 sessions:

1. **Refactor runner HMAC routes to shared helper** (locals already done; runner side should match) — 30 min
2. **Refactor /api/locals/buy to use localsStripe helper** — 10 min
3. **Add Stripe webhook for /locals/buy refunds + chargebacks** — currently nothing handles disputes. Important before sell-mode volume — 1 hr
4. **Skip-to-content + aria-live forms** — a11y baseline — 30 min
5. **Rate limit on signup endpoints** — bot defense — 1 hr
6. **Per-event Event schema in dynamic event page** (verify Sandfest 2027 emits it) — 30 min
7. **Sitemap audit for Sandfest 2027** — 5 min
8. **Tyler one-shot vendor-connect email** (Winston-gated, but ready) — 15 min
9. **Image optimization sweep on archives** — 1 hr
10. **STRIPE_SECRET_KEY rotation** (still pending from yesterday's transcript leak) — 15 min

Total ~6 hours. Rest goes "file for later" or backlog.

---

## Section F — Open question for Winston

**Should we run a `/enhance` command as a recurring 2-week ritual?** The pace at which PAL is growing means drift accumulates fast. A standing "review-and-tighten" cadence would prevent the bigger gaps in section C from getting worse. Same shape as this doc, run every other Monday.

Pairs naturally with the truck/arnold ritual. Truck at end-of-session preserves state. Arnold at start-of-session restores state. Enhance at start-of-fortnight verifies state is still healthy.
