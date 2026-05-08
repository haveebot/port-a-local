---
name: Sage Em — current status and open items
description: Where Sage Em agency outreach stands, what's blocked, what's next
type: project
originSessionId: 35a4d1eb-635d-424f-a8eb-a22e66a74d90
---
**Sage Em** is an emergency lighting manufacturer (white-label OEM of SignTex). Winston is VP of Sales building a national rep agency network.

**Why:** Zack Merrill's 2M Lighting reps SignTex in TX. Sage Em creates a "competitor" brand — reps can carry both and cover all specs.

---

## Session discipline (read first)

- **Start every session** with `scripts/rehydrate.sh` — prints repo freshness, latest session note, last Drive sync, last Inbox event, last Zack review entry, Home status-table stamp, and Open Questions. Do not rely on this file alone.
- **End every session** with the `DUMPTRUCK.md` six-step ritual. Drive sync is non-skippable. Inbox events get logged. Zack's feedback goes to `Zack Review Log.md`.
- **This file is a mirror pair.** Authoritative copy lives at `sage-em/sage/Sage Em/memory/project_sage_em.md`; mirror lives at `~/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/project_sage_em.md`. Edit authoritative first, mirror second, `diff` clean before committing.

---

## ✅ Website V1 — LIVE at https://sageem.co (shipped 2026-04-16 evening)

Repo: `haveebot/sage-em-website` (temporary haveebot host — migrates to sageem on laptop day).
Deploy: live on `haveebots-projects` Vercel. 76 routes, builds clean.
Stack: Next.js 16.2.4 + React 19 + TypeScript + Tailwind 4.
Eight specifier tools, Sage Live™ monitoring demo, Knowledge Base (19 articles), interactive US territory map, mega-menu nav, real Sage botanical mark throughout. V1 programmatic audit clean (71/71 URLs green).

DNS: apex `sageem.co` → 307 → `www.sageem.co`. Let's Encrypt R13, Apr 16 → Jul 15 (auto-renew). Wix still registrar; MX/TXT/DKIM untouched. `winston@sageem.co` delivers normally.

**Sage Live™:** resolved naming. "Sage Live" is the Sage-owned brand name. Used across site, spec sheets, KB. Prior V1.5 Backlog entry flagging this as unresolved was stale — corrected 2026-04-21.

---

## Current state (verified with Winston 2026-04-24)

| Item | State |
|---|---|
| Travis V1 website send | ✅ **Done by Winston.** Travis walked the live site, "very impressed, ready to sign a contract." |
| Sage Sales Representative Agreement | ✅ **v1.2 EXECUTED at L&EA 2026-04-30** + locked end-to-end. Generator at `scripts/generate-agency-contract.py` rebuilt with verify-on-render lock + auto-archive predecessor + Phase 1 sign-once stamping (Taylor's signature programmatically applied every render). 6 v1.2 must-have markers, 7 v1.1 must-not-have markers — refuses to write the file if any assertion fails. Three contract drafting principles locked in [`feedback_sage_contract_principles.md`](/Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/feedback_sage_contract_principles.md). Schedule restructure: A (Products) · B (Trade Areas, catch-all "largest lighting conglomerate") · C (Consignment, Reserved) · D (Brand Standards). Send-ready PDF at `~/Desktop/Sage-Agency-Sales-Representative-Agreement-v1.2-TaylorSigned.pdf`. **Per-agency `--agency <id>` flag** wired (Phase 2) — pulls agency name + primary contact from HQ Postgres, outputs `Documents/Variants/Sage-Agency-Sales-Representative-Agreement-<CODE>.pdf`. **Canonical-versioning rule locked:** see [`feedback_sage_canonical_versioning.md`](/Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/feedback_sage_canonical_versioning.md). |
| L&EA contract status | ✅ **EXECUTED v1.2 — 2026-04-30.** Travis signed v1.1 (with Z's review changes missing — generator-vs-spec drift bug); recovery PDF stitched v1.2 body + the v1.1 sig page preserving both Taylor's + Travis's signatures, sent to Travis 2026-04-30 13:16 (msg `19ddf9bb7f7776d9`); Travis accepted as-is 18:50 (msg `19ddfba67b867449`): *"I'm good. Please just send the log in info for the portal when it's ready."* **L&EA stage flipped contract-pending → active in HQ.** Three activity_events logged. Legal-of-record file at `Documents/Archive/L&EA-Sage-Agency-Sales-Representative-Agreement-v1.2-EXECUTED-2026-04-30.pdf`. Travis pulled for agency portal — first customer demand for the customer-facing surface. |
| L&EA on public map | 🟡 **Eligible to flip — Travis executed agreement.** Currently still showing Louisiana = "in-conversation" on `app/markets/page.tsx`. Next action: flip Louisiana → "represented" with Travis named as primary contact for the territory. Same edit on `app/find-a-rep/page.tsx`. |
| Brand Identity v2.0 | ✅ **Released 2026-04-24.** Full rewrite supersedes v1.1. Operating system for every Sage designed surface. Companion artifacts: `Brand/Brand Changelog.md`, `scripts/generate-brand-onepager.py`, `Brand/partner-assets/` (one-pager PDF + 4 logos + README + 342 KB zip). Website `app/brand-assets/page.tsx` refreshed (commit `1452b12`). Public download: `sageem.co/brand/Sage-Brand-Onepager.pdf`. Trigger = ST asking "do you have a logo?"; answer = Winston sends `Sage-Brand-Pack.zip` via email with v2.0 §11.1 body template. |
| Dashboard v1.5 | ✅ **Released 2026-04-24.** Agencies tab restructured with 4 campaign-stage sections (contract-pending / active / queued / awaiting-maturity) + pipeline summary strip. 11 agencies now in roster — 6 on active hit list (Premier OK, AMA, Illuminations, Hartwell Cook, Creative Lighting SC, Lighting Group LV), 1 contract-pending (L&EA), 2 queued (Spectrum SA, LESCO — Texas), 2 awaiting-maturity (ALR California, KSA Chicago — KSA explicitly parked for IL building codes). **Hybrid edit overlay:** Winston can add/edit contacts from dashboard without Claude in session — writes to Vercel Blob, renders immediately with "✎ pending" pill, harvest script reconciles back to `agencies.ts` at dumptruck. Dashboard commits `3372737` + `87835b5`. |
| Dashboard Edit-mode activation | 🔜 **Deferred to laptop day.** `SAGE_ADMIN_TOKEN` env var required on the Vercel `sageem` team for `/api/edit-agency` writes to work; setup documented in `LAPTOP_MIGRATION.md §2.1a`. Intentionally deferred — between now and laptop day, round-2 outreach research happens in Claude sessions (direct `.ts` edits to git), so the overlay is dormant. Overlay's real value kicks in post-round-2 when reply-emails bring new contacts at off-hours. |
| Outreach round 2 | 📋 **Planned 2026-04-24, not yet sent. Research complete.** 6-agency hit list: **Premier OK (Jim Prior)**, **AMA Lighting (Warren Stojcich + Dale Goolsby, 3 offices)**, **Resource Lighting NM (Brad Gibbs — REPLACED Illuminations Inc. after discovering Illuminations = PA/NJ/DE agency)**, **Hartwell Cook MS (Bob Tickner Sr + Robert Tickner III, 55-yr heritage)**, **Creative Lighting SC (CLS = 2024 Murphy+CAL+D merger, 49-yr Acuity partnership via Murphy heritage)**, **Lighting Group LV (James Highgate + Tom + Nicole; ⚠️ not the Acuity rep — same Premier-OK-pattern non-Acuity alternative, flag for Zack)**. Territorial overlap AMA ↔ Hartwell Cook in S. AL + FL Pan still needs Zack territory-split conversation. AMA Warren direct email needs confirmation before send (best guess: wstojcich@amalighting.com). |
| Sales briefs (agency + engineer) | ✅ **Agency Brief v1.2 shipped 2026-04-30 PM.** Z's full review applied (34 annotations across 9 pages — text comments + silent highlights/strikethroughs). 11 pages, all dense (>400 char min per page enforced by orphan-page check). **New section: "How Sage closes specs for your agency"** consolidates 8 sales angles Z flagged (100% Overage / Sage Live free / design-assist / substitution-defense / non-proprietary batteries / Alyssa's Law / instant activation / wall-mount footprint). Factual fixes: **Alyssa's Law** (was incorrectly "Elisa's Law"), Lithonia ELC30P03 example removed, "1,145 match entries" specifics removed (would outdate). Header `The category, honestly` → `Why agencies without a CB line are losing specs`. "Cold" jargon → "inside and out". Generator at `scripts/generate-agency-brief.py` rebuilt with verify-on-render lock (22 v1.1 must-have markers, 14 v1.0 must-not-have markers, plus orphan-page check) + auto-archive predecessor. Send-ready at `~/Desktop/Sage-Agency-Brief-v1.2.pdf`. **Engineer/Distributor Brief** (`Documents/Sage-Engineer-Brief.{md,pdf}`) still at v1.0 — same hardcoded-Python-vs-markdown bug pattern likely applies; pending its own audit + re-render. Phase 2 (web experiences `/agencies-presentation` + `/engineers-presentation`) and Phase 3 (videos) queued for next sessions. |
| Lighting-industry CRM long-game | 🌅 **Strategic horizon noted 2026-04-24.** Sage's dashboard, with rep-conflict intelligence + manufacturer-rep relationship modeling + spec-sheet workflow + Sage Live monitoring per agency, is structurally ~30% of what a lighting-industry-specific CRM should be. Pattern-matches Procore (construction), Veeva (pharma), Toast (restaurants) — solving one company's problem then realizing the solution is the product. Deferred behind L&EA close + round-2 send. Platform play emerges naturally if dashboard works. |
| Zack's Agency & Territory Tracker | ✅ **Archived as frozen baseline 2026-04-24.** Zack confirmed he built it by hand ("took me forever"), mostly from Acuity website. He knows it's likely outdated / has errors. Pinned copy in vault at `Raw Sources/Zacks-Agency-Territory-Tracker-baseline-2026-04-24.csv` + README. **Architecture:** Zack's tracker = read-only historical baseline (his effort preserved); **dashboard = Sage operational source of truth** (where all live work happens). No two-way sync. No per-row approval dance. See Decision Log 2026-04-24 entry "Zack's Agency & Territory Tracker — frozen as baseline; dashboard becomes Sage operational source of truth." |
| Dashboard vs. Monday CRM report | ✅ **Built 2026-04-24, ready to send to Zack.** Trigger: Zack mentioned 2M uses Monday CRM, asked if Sage's dashboard could match. **Deliverable:** `Documents/Sage-Dashboard-vs-Monday-CRM-Report.pdf` — 6-page Sage-branded honest comparison, feature matrix, monday-strengths + sage-strengths sections, 5-year cost analysis (Monday Pro tier verified against monday.com/crm/pricing 2026-04-24). **Numbers:** Monday Pro 5-year cost (3→20 users ramp) = $15K-$22K. Sage Dashboard 5-year = $2.5K-$7K. Savings $10K-$17K. **Recommendation:** keep building the dashboard. Phase 1 (Gmail integration, Today's Actions widget, reports page, document attachments) closes ~85% of what 2M actually uses Monday for in 1-3 sessions. Decision Log entry "Build the dashboard, don't buy Monday CRM" documents alternatives + reversibility. PDF staged on Desktop for sending. Generator at `scripts/generate-monday-comparison-report.py` (deterministic, re-runnable). |
| Dashboard UX upgrades 2026-04-24 | ✅ **Shipped.** Stat tiles on `/agencies` are now clickable pipeline filters (commit `fdd52eb`). Per-agency cards now carry a quick-stats pill row (commit `b66c210`): staleness color-coded by last-activity date (green ≤7d → red 31+d "stale"); Acuity-rep status as first-class boolean field with visual pill (⭐ Acuity rep / ⚪ Non-Acuity alt-play with conflict-pattern tooltip); contact count, office count (when >1), activity count. Phone numbers now render in primary-contact line. Collapse-button text simplified. `acuityRep: boolean` added to Agency type, all 11 agencies tagged: 9 confirmed Acuity reps, 2 non-Acuity alt-plays (Premier OK, Lighting Group LV — both Premier-OK-pattern, Acuity rep in territory holds ST = excluded). |
| Strategic horizon — lighting-industry CRM | 🌅 **Long-game vision noted 2026-04-24.** Winston floated the idea that Sage's dashboard, with its rep-conflict intelligence + manufacturer-rep relationship modeling + spec-sheet workflow + Sage Live monitoring per agency, is structurally 30% of what a lighting-industry-specific CRM should be. No existing CRM (Monday, Salesforce, HubSpot) models the manufacturer ↔ rep agency ↔ distributor ↔ specifier ↔ contractor ↔ end-user chain or the line-card conflict graph. Pattern matches Procore (construction), Veeva (pharma), Toast (restaurants) — companies that started solving one company's problem, then realized the solution was the product. **Deliberately deferred.** Today's job is closing L&EA + landing round-2 + making Sage win the next 12 months. Platform play emerges naturally if dashboard works. |
| Zack V1 review | ✅ **Closed 2026-04-21.** 6 resolved + 1 held (IES backlog). See `Zack Review Log.md`. |
| Ordering-codes email (Zack + Taylor) | ✅ **Killed 2026-04-24.** Zack review + SignTex public-spec scraper + spec-sheet overhaul resolved the underlying ask. All 29 products carry Sage-accurate ordering examples. ELCXX drift on 5 Luminaires closed. |
| Coverage Estimator email to Zack | ✅ **Parked 2026-04-24.** Phase 1 ship already addresses his critique in code; no open thread from Zack to respond to. Re-surface if he reopens. |
| Taylor preview + sign-off | Still pending an explicit moment; Taylor has been in the loop on calls. |
| Sage HQ (Wheelhouse) | ✅ **FULLY OPERATIONAL 2026-04-29 PM at `hq.sageem.co`.** Repo: [`haveebot/sage-em-wheelhouse`](https://github.com/haveebot/sage-em-wheelhouse), latest commit `b973134`. **Live:** `https://hq.sageem.co` (Wix CNAME → cname.vercel-dns.com, Let's Encrypt cert `cert_b4yWlkmxyP4bphjpVEy5MpGZ` valid through Jul 29). GCP redirect_uri whitelist updated to include hq.sageem.co. **Stack:** Next.js 16.2 + React 19.2 + Tailwind 4 + Drizzle 0.45.2 + Neon 1.x + Auth.js v5. Auth: Google Workspace SSO @sageem.co only (winston@/sales@/taylor@). 5 OAuth scopes (gmail.readonly + modify + compose + drive.readonly + calendar.readonly). **Step 2 UI shipped end-to-end:** `/agencies` pipeline → 4 stage columns × tier-sorted cards (A→E) × Acuity-pill (verified-at-source variant) × roster-source quality pill (🟢/🟡/🔴) × family-marker chips × primary-contact spotlight (co-primary supported for LAI Joe+Jason) × per-card Drive/Gmail/Calendar context lazy-loaded from `/api/agency/[id]/context`. `/agencies/[id]` full roster grouped by ContactTier with curate-out × exclude / ↺ restore inline + "Excluded contacts (N)" expandable section. **Outreach engine:** ✏ Draft intro email button on every card → `/api/agency/[id]/outreach-draft` → tier-aware template (`lib/outreach.ts`, A-warm-Z-intro through E-keep-in-touch) → Gmail Draft via gmail.compose scope → auto-logs as `email_drafted` activity event. **Activity log foundation:** new `activity_events` table (Drizzle migration applied direct via Neon HTTP) + POST/GET `/api/agency/[id]/activity` + ActivityStripe (top-3 with relative timestamps) + LogActivityButton (+ Log inline form with type picker). **Curate-out audit:** excludedAt/By/Reason on contacts; reversible restore. **`sage_mail.py`** at `scripts/sage_mail.py` (HeyeDeploy mail-tool-per-identity, OAuth via Postgres tokens, no app password) with subcommands inbox/unread/from/thread/attachments/check/draft/send. **`SEND_ALLOWLIST`** locked: winston@/taylor@/sales@sageem.co — anything else falls back to draft. **Z + T invite email** sent 2026-04-29 19:51 (msg `19ddc4d6135fa999`) pre-framing Google's standard consent wording + send-permissions boundary. **Postgres tables in production:** users, accounts, sessions, verification_tokens, agent_tokens, agencies (13), agency_offices (34), agency_contacts (390), activity_events (NEW; 0 rows + grows from here). **Plan:** [`Strategy/Sage HQ Step 2 — Spec from 2026-04-28 PM Email.md`](../Strategy/Sage%20HQ%20Step%202%20—%20Spec%20from%202026-04-28%20PM%20Email.md). **Recovery brief:** [`Session Notes/2026-04-29.md`](../Session%20Notes/2026-04-29.md). |
| SignTex factory visit (Grasonville MD, Apr 21 or Apr 28 week) | **Not confirmed.** |
| Laptop arrival | **Not arrived.** Early next week per 2026-04-18 dumptruck (still pending as of 2026-04-24). |
| Shelina file delivery | **Not arrived.** Waiting since 2026-04-14 redirect. |
| Apr 17–20 activity | **Blank.** No Sage work. |
| Apr 23 activity | **Blank in vault** (Winston-led Travis follow-up; not yet logged with exact date). |
| Apr 21 activity | **17 website commits today** + 2 post-hoc fixes. Shipped: Evenlite end-to-end (+27 families, PDF spec parsing), Sage Beta badges, Vercel pipeline fix, rclone Drive sync, Lithonia+Hubbell expansion (+549 entries), **Task-6 close-out: source catalogs for SignTex/Myers/Sure-Lites/Extant built, enrichment script fallbacks added, all 7 brands at 100% enrichment, 100% environment coverage**, Lithonia ordering-code variant fan-out (+49). **Final catalog: 1,145 match entries · 423 unique SKUs · 7 brands · 100% enrichment · 100% environment coverage.** Daily delta: 489→1,145 match entries (2.3×), 149→423 unique SKUs (2.8×), 3→7 brands fully enriched. Late-evening shipped: Zack concerns pass → crossref expansion → Xwalk tiered-search engine port → interactive US map → per-URL OG cards → NL query parser. **Night sprint added:** voltage + environment hard-gates (scripts/enrich-match-entries.mjs joins against competitors-{lithonia,hubbell,evenlite}.json by full_name; analyzeQuery filters by voltageHint + environmentHint); real Sage brand leaf favicon from canonical public/brand/sage-leaf.png; "fuzzy search" jargon gone. **Late-night sprint added:** Evenlite catalog expansion (+27 gap families covering full /lex-cms/products/all universe — Telesis T-series, XNY/XCH, LCPSD, Sentry CCDS/SDI, Sovereign SXP, Aperion APAL, Curve, PWII, Phoenix, LiteMinder Optimus variants; 60 new match entries; WLEM placeholder removed); Sage Beta badges on 3 sizing tools + markets ValueProp; count refresh. **Post-hoc fixes tonight:** (1) Vercel Git integration dropped silently after 6b183c0 — three pushes stuck on GitHub with no Vercel build for ~40 min; resolved via `vercel git disconnect`/`connect` + manual `vercel --prod`; verified auto-deploy restored with test push (35725dd → 11e3ef4fv in 30s). (2) **Evenlite fully ingested** — scripts/parse-evenlite-specs.py downloaded + pdfplumber-parsed all 27 spec PDFs; extracted voltage, wattage, mounting, duration, battery, compliance; re-enrichment bumped voltage_set 71%→73%, mounting 39%→43%, 90% environment coverage maintained. (3) **Drive sync live** — rclone v1.73.5 + drive.file OAuth + root_folder_id pin to Wiki Snapshots folder; 5 snapshot files synced to haveebot@gmail.com Drive end-to-end; settings.json allowlisted so future dumptrucks run step 4 automatically. Coverage: **547 match entries · 175 unique SKUs · 7 brands · 90% environment coverage**. |

## Priority queue (2026-04-30 PM evening, post-L&EA-execution + Brief-v1.2)

1. 🌐 **Agency portal MVP for Travis** — Travis pulled for `https://hq.sageem.co/portal` (or similar) on 2026-04-30: *"send the log in info for the portal when it's ready."* First customer demand for agency-facing surface. Block 1: schema + magic-link auth for non-@sageem.co users. Block 2: `/portal` route with agency-scoped data access (their contract, brief, activity feed). Block 3: send Travis the link.
2. 📞 **Round-2 outreach drafts using Standard Intro Email Template** — `Strategy/Standard Agency Intro Email Template.md` filed. Tier-A (Z-handoff) cards first: Trevor Kramer (MZ KC) · Joe Thomason + Jason Frey co-primary (LAI St. Louis) · Darin Buscaglia (ALR Bay Area). HQ workflow: open agency card → click ✏ Draft intro → Gmail Draft auto-staged with tier-aware template + v1.2 brief attached → Winston reviews → Send. CA framing pending for ALR.
3. 🎯 **Per-agency template injection — MZ canary** — `python3 scripts/generate-agency-contract.py --agency mercer-zimmerman` → verify the personalized Taylor-signed contract renders cleanly. Wired but not yet end-to-end tested. ~20 min.
4. 🗺️ **Flip Louisiana → "represented" on public website** — Travis is signed; flip `app/markets/page.tsx` + `app/find-a-rep/page.tsx` to show L&EA as the named rep. (Engineer Brief revision separate — see below.)
5. ✂️ **Curate-out pass with Z** — 8 large rosters (ALR 159, MZ 88, AMA 37, CLS 32, Resource NM 12, Premier OK 15, Hartwell Cook 6, Lighting Group LV 4) ready for Z's industry-knowledge filtering at `/agencies/[id]`. × exclude inline per row, audit trail preserved, restore reversible. ~10 min on his end raises HQ data quality dramatically.
6. 🎨 **HQ "Awaiting You" home tile** — Step 3 surface. Pull from `activity_events` to surface "what needs your action" personalized per role.
7. 📄 **Engineer Brief audit + revision** — same hardcoded-Python-vs-markdown drift bug pattern likely applies. Apply verify-on-render lock + run a similar Z-review pass.
8. 💬 **Zack territory-split conversation** — two splits blocking round-2 sequencing: **AMA ↔ Hartwell Cook** (S. AL + FL Pan); **MZ ↔ LAI** (Central + Southern IL).
9. 🔍 **Source remaining Tier-B primary emails** — Hartwell Cook (Bob Sr) still missing. Premier OK + Resource Lighting NM resolved 2026-04-28 PM.
10. 🏭 **SignTex factory visit confirmation** — Grasonville MD, timing TBD
11. 🗂️ **Shelina handoff** — check for file delivery
12. 💻 **Laptop-day migration** — when hardware arrives, execute repo transfers (runbook: `LAPTOP_MIGRATION.md`)
13. 🔁 **Outreach event tracking + reply detection** — match incoming Gmail threads to drafted outreaches, auto-update activity_events with email_received → email_replied state transitions
14. 🔍 **Phase 2 Coverage Estimator backlog** (when appetite returns)

**Closed 2026-04-28 (AM session):** Sage Sales Representative Agreement v1.1 drafted (with Taylor + Zack for review); Strategy/Agency Contract Framework.md updated with Zack's pure-overage model; L&EA Ned-side nudge dropped (Travis operative principal); Sage-vs-Monday CRM PDF sent to Zack (outcome: build forward, replace dashboard with Wheelhouse); Sage HQ Step 1 scaffolded (`haveebot/sage-em-wheelhouse` @ `76bf073`).

**Closed 2026-04-28 PM (pipeline expansion + dashboard cleanup):**
- **Pipeline expanded 11 → 13 agencies** via Zack conference handoff: Trevor Kramer (Mercer Zimmerman, KC + Midwest, Cooper rep) · Jason Frey + Joe Thomason co-primary (LAI / Lighting Associates, E. MO + IL + KY, architectural-spec) · Darin Buscaglia (ALR Bay Area, principal CA contact). Both MZ and LAI added at `campaignStage: "active"` despite non-Acuity status — see Zack-relationship-override rule below.
- **ALR flipped `awaiting-maturity` → `active`.** Zack actively teed up Darin via close-network introduction ("starting point" for CA outreach). Darin contact enriched with mobile `(510) 385-4626` and `office: "bay-area"`.
- **AMA Warren Stojcich direct email confirmed**: `wstojcich@amalighting.com` (verified via newstarlighting.com agent locator). Primary email coverage now 10/13 agencies (was 7/11).
- **2 new Sage targeting rules locked in memory:**
  - [`feedback_sage_zack_relationship_override`](/Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/feedback_sage_zack_relationship_override.md) — personal-relationship introductions override Sage rule #1 (target Acuity FIRST). Sage rule #2 (no SignTex reps) and #3 (avoid Evenlite reps) still apply.
  - [`feedback_sage_co_primary_contact`](/Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-Projects-workspace/memory/feedback_sage_co_primary_contact.md) — when relationship enters via non-principal, both principal + relationship contact get `primary: true`. Applied first to LAI (Joe Thomason aimed-target + Jason Frey relationship entry-point).
- **5-tier hit-list structure introduced** (in `Strategy/Pipeline Snapshot 2026-04-28.md`): **A** Zack-relationship (3 — ALR, MZ, LAI) · **B** Acuity-confirmed (3 — AMA, Hartwell Cook, Creative Lighting SC) · **C** non-Acuity alt-plays (3 — Premier OK, Lighting Group LV, **Resource Lighting NM** — moved from B to C 2026-04-28 PM after inside.lighting verification: NM Acuity rep is RKL Sales which also holds Evenlite/Emergilite/SignTex; Resource reps Current/HLI/Lumenpulse/architectural lines, same Triple-C-Oklahoma pattern) · **D** Texas queue (2 — Spectrum SA, LESCO) · **E** awaiting-maturity (1 — KSA Chicago-only, territory narrowed since MZ now covers IA/NE/Central+Southern IL).
- **Vault docs v2 written**: [`Strategy/Pipeline Snapshot 2026-04-28.md`](../Strategy/Pipeline%20Snapshot%202026-04-28.md) — schema-aligned 13-agency doc, HQ Step 2 seed source. [`Contacts/Contacts Index.md`](../Contacts/Contacts%20Index.md) — organized by stage + tier, all 13 agencies fully rostered.
- **Dashboard cleanup (live at sage-em-dashboard.vercel.app):**
  - "Needs Zack" flags wiped — 10 markets cleared (`needsReview: true` removed from El Paso, NC Charlotte, NC Raleigh, WV, KY Louisville, MI Detroit, MI Grand Rapids, IN, AZ, ID). Markets remain in directory; type definitions preserved for future re-enable.
  - L&EA "Waiting on Contract Approval" banner added (manual one-off — only agency in contract-pending state).
  - Today's Actions: 2 illustrative DEMO_ENTRIES added so Z+T can visualize pipeline activity ahead of Sage HQ v1 (Trevor MZ initial intro + Joe+Jason LAI initial intro). Real outreach overlays them as it gets logged.
  - Stats row dropped — vanity metrics, not actionable. Page flows: header → L&EA banner → Today's Actions → Quick Links → Market Status by Region.
- **Dashboard commits (`haveebot/sage-em-dashboard`)**: `b66c210 → 969da18 → 00b780c → 2bb66f2 → 87d968c → aaba9a0 → b2d8152 → 3ce47eb` (7 commits this session).
- **`hq.sageem.co` provisioning** discussed — paths documented (Vercel custom domain + Wix DNS CNAME), deferred to post-Sage-HQ-Step-1-deploy per Plan §1.2.
**Closed 2026-04-24:** ordering-codes email (killed), Coverage Estimator email to Zack (parked), Travis V1 send (Winston done directly), Luminaire ELCXX drift (fixed).

---

## Three-Layer Architecture

- **Vault** (`haveebot/sage-em` → `sageem/sage-em` on laptop day) — knowledge base, decisions, session memory, append-only logs
- **Drive** (`winston@sageem.co → My Drive → SAGE/`) — static business documents
- **Dashboard** (`sage-em-dashboard.vercel.app`) — internal visual layer for Zack + Taylor
- **Website** (`haveebot/sage-em-website` → live at `sageem.co`) — public surface with specifier arsenal
- **Haveebot Drive mirror** (folder `1QeBmtW3WXkhwSyx0Koy0g_nvOFVRr27e`) — backup of wiki + spec sheets + product data. Synced at dumptruck per `DUMPTRUCK.md` step 4.

## Dashboard

Live: https://sage-em-dashboard.vercel.app · Repo: `haveebot/sage-em-dashboard` · Local: `/Users/winstoncaraker/Projects/workspace/sage-em-dashboard/`

Pages: Dashboard (home), Markets, Agencies, Products, Documents, Brand. Known gap: Drive links on Documents + Products empty — Winston to grab shareable links, Claude wires in.

## Website

Repo: `haveebot/sage-em-website` · Local: `/Users/winstoncaraker/Projects/workspace/sage-em-website/`
Live: `https://sageem.co`
Build health: clean, 0 warnings, 76 routes.

## Agency Outreach

| Agency | Market | Status |
|--------|--------|--------|
| L&EA | Louisiana (all 3) | 📞 Principal call complete 2026-04-14 (Travis D'Amico). Conditional yes pending website send — still not sent as of 2026-04-21. |
| Spectrum SA | San Antonio / Austin | Not started |
| LESCO | Houston | Not started |
| ALR | California (all) | Not started |
| Premier OK | Oklahoma | Not started |
| KSA | Chicago | Not started |

## Agency Rules (from Zack)
1. Target Acuity (Lithonia) rep FIRST
2. NEVER target SignTex rep — hard conflict
3. Avoid Evenlite reps where possible (coverage beats exclusion if needed)
4. Dallas-Fort Worth EXCLUDED for 1 year
5. ALR = priority for ALL California markets (one call = whole state)

## Key Agency Contacts

- **L&EA** (Louisiana all 3 markets) — Ned Chargois (President, Greater LA), Travis D'Amico (Principal, Baton Rouge) — 22 total contacts in Contacts Index
- **Spectrum SA** (San Antonio + Austin) — Eric Wehmeyer, Chance Chumbley, Dennis Golsch, Tim Eurton
- **LESCO** (Houston) — Austin Carpenter (principal)
- **ALR** (California all) — Darin Buscaglia, Darrell Packard, Maryanne Berger
- **Premier OK** (Oklahoma) — Jim Prior
- **KSA** (Chicago/Illinois) — in dashboard

## Vault Location
`/Users/winstoncaraker/Projects/workspace/sage-em/sage/Sage Em/`

**How to apply:** When working on Sage Em, always run `scripts/rehydrate.sh` first. Latest session is [[Session Notes/2026-04-21]]. Travis send is the single hot-path unblock. Zack V1 review notes capture is the gate. Dumptruck is non-skippable per `DUMPTRUCK.md`.

**Strict: no SignTex on public surfaces.** ST = SignTex is internal only. Never mention SignTex by name in any shared doc, public website disclaimer, marketing copy, spec-writer output, or OG card / meta description. This includes phrasing like *"layouts are produced by the manufacturer (SignTex)"* or *"Sage / SignTex designs the real layout"* — even when softening a Sage Beta tool to avoid specifier misuse, the conversation-starter / reference-only framing does the job without naming the OEM. Exceptions that are OK: (a) the `signtex_equivalent` type field in `lib/products.ts` which carries internal data but is never rendered; (b) `lib/query-parser.ts` brand-alias regex that only produces a "Brand: SignTex" chip in the cross-reference tool if a specifier themselves types "signtex" as a competitor search — that's user-echo of competitor data, same pattern as Lithonia / Hubbell / Evenlite, not a Sage admission. Rule enforced live on 2026-04-21 after `23e1592` → `8b6b0b4` scrub of Coverage Estimator disclaimers.
