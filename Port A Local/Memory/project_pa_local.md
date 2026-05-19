---
name: Port A Local — current status and open items
description: Where PA Local stands, what's built, what's next, key decisions
type: project
originSessionId: 35a4d1eb-635d-424f-a8eb-a22e66a74d90
---
**Port A Local** is a local business directory + services platform for Port Aransas, TX. Winston is PM, Claude builds and maintains everything. Live at port-a-local.vercel.app. Repo: haveebot/port-a-local. Owned by Palm Family Ventures, LLC (never public-facing).

**Operating model:** Winston makes product decisions and handles local relationships. Claude builds, maintains, deploys, and organizes everything else. Goal is a lean two-person operation.

## Current State (as of 2026-05-17 PM — Dispatch Part 1 published + Pixel/Ads engineering hammer + Neon Launch upgrade)

**7 PRs merged this session** (#56, #68-72, #89-90). Major pivot mid-session from engineering to editorial publishing the time-bound piece on the 5/20 Council vote.

**Headline: "$66 Million in Closed Session" Dispatch published live + boosted + cross-shared.** Part 1 of 2 of the P&Z Capture series. URL: theportalocal.com/dispatch/closed-session-66-million. Built around Wednesday 5/20 5PM Council vote on the Palmilla Qualified Hotel Project (KM Beach LLC = McCombs Properties operating entity asking for Municipal Management District consent + Master Development Agreement working group). Bookend: 2019 "INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW" page-71 procedural maneuver that produced the 7-0 Cinnamon Shore award (never built) → 2026 closed-session deliberation that produced the 4/21 5-2 MOU vote with the same family's entity at the same parcel. Phrase appears EXACTLY ONCE across the 11 publicly-available 2019 council packets. Aggregate anonymization rule applied: paid officials + corporate counterparties named (Parsons, Nixon, KM Beach LLC officers Marsha Shields / Harry Ben Adams IV / Steve L. Cummings, McCombs Properties); elected officials and volunteer commissioners by seat or aggregate only.

**FB promotion fired:** post live on PAL Page (`142397023082287_1016247791067024`), boost campaign `120247636486130592` at $5/day. Boost was DENIED by Meta auto-classifier (likely political/issue content category), Winston requested re-review, organic + personal cross-share carrying amplification meanwhile. Re-fire schedule: $5/day Mon evening + Tue evening for full Sun→Wed coverage.

**Two records requests committed publicly** in the piece's close, to file post-Wednesday-vote: (1) CIQ/CIS naming KM Beach LLC + Palmilla Beach Resort + McCombs Properties + officers, 2017-2026; (2) count + records of every agenda item with deliberative material routed outside the public packet 2017-2026.

**Part 2 (architecture piece) parked** — Charter Review Commission lapsed-term anchor, household network in aggregate voice, Bureau composition, food-truck pattern, fix path. ~2,000 words evergreen. Base draft is v4 on `editorial/pz-capture-draft-v4` branch.

**Engineering hammer landed before the editorial pivot:**
- PR #56 — Ads Pause/Resume controls on /wheelhouse/ads (conflict resolution from 5/14 truck)
- PR #68 — Pixel Purchase value enrichment ($value threaded from /api/rent/confirm + /api/beach/confirm to success-page MetaPixelEvent; was hardcoded value=0)
- PR #69 — Pixel Lead event on /locals/inquiry done state
- PR #70 — Broader ViewContent on /deliver /events /live /guides /guides/mothers-day (skipped /guides/summer per Collie-freshest rule)
- PR #72 — Custom Audience CRUD UI in Wheelhouse (`/wheelhouse/ads/audiences` list + create form with event×lookback picker; ads audience field flipped from text input to dropdown)
- PR #89 — GET /api/wheelhouse/ads/list + /audiences/list bearer-authed diagnostic endpoints (campaigns + per-campaign insights + account rollups today/last_7d/lifetime; agent/cron/cross-tenant readable)
- PR #90 — Dispatch publish

**Live ad performance pulled mid-session** via new diagnostic endpoint: lifetime $31.72 spent (since 5/2) · 3,639 reach · 432 clicks · 7.76% CTR. 14 active campaigns. Top CTR boosts: post#20 "Saturday is loaded" 19.44%, post#22 "75,500 birds" 19.13%. Account CTR ~7% well above FB travel/local benchmark — editorial/event content outperforms commerce on engagement. 4 campaigns with $0 spend = failed-to-launch duplicates worth sweeping.

**Neon upgrade — major ops finding:** PAL Vercel-Marketplace Neon (project `wheelhouse`, ancient-lake-78151114) hit 100% of Free-tier 100 CU-hour compute allotment. Risk: intermittent compute suspension + query failures during Wednesday traffic spike. Walked Winston through Vercel Dashboard → Integrations → Neon → Installation → Plan modal. Upgraded to Launch tier (Storage $0.35/GB-month, Compute $0.106/CU-hour). Covers BOTH `wheelhouse` (PAL) AND `sage-hq-db` (one installation = all products). Estimated $10-15/mo of actual usage at current load.

**Vercel env additions:**
- `NEXT_PUBLIC_META_PIXEL_ID` added to Preview target via Vercel API direct (CLI `--yes` flag broken; pulled token from `~/Library/Application Support/com.vercel.cli/auth.json`)
- `META_BOOST_DURATION_HOURS=72` set in production (will propagate on next deploy; future boosts run 72h instead of 24h)

**Twilio newline bug re-confirmed:** PAL's `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` Vercel env values have literal `\n` baked in; Next.js process.env handles fine; raw shell consumers must strip with `sed 's/\\n$//'`. Likely on other tokens too — worth a future env-rotation sweep.

**Civicweb access wall finding** (now in published Dispatch): newer PA council packets (post-2019) gated behind civicweb portal login; agenda HTML public, attachment PDFs not. WordPress mirror at cityofportaransas.org/wp-content/uploads stopped at 2019. Structural transparency-deficit finding that landed in the piece's "What the public packet does not contain" section.

**Detailed handoff brief:** `Session Notes/handoff-2026-05-17.md` — full session context.

## Current State (as of 2026-05-14 — Ads tool + Pixel install + cart-rental architectural rework)

(Previous state below preserved for context — Ads tool foundation, Meta Pixel installation site-wide, beach/cart PII leak fixes, mobile-app-trio closeout. See `Session Notes/handoff-2026-05-14.md` for that session's brief.)

## Current State (as of 2026-05-07 PM — Collie InDeployed + lifecycle framework locked + heyedeploy twin'd + editorial substance landed)

**Six PRs merged this session** (PAL #19, #20; heyedeploy #1, #2; plus Winston's commit `42b5bad` for the runbook fix; plus the FB billing fix on the operator side). Spans editorial research, contributor onboarding, framework lock, and architectural parity. **Headline: Collie InDeployed at PAL — first canonical design-contributor landing in real time, validating the entire Tier 1 architecture.**

**FB billing root-caused and fixed:**
- Account flipped from UNSETTLED to Active (`account_status = 1`); funding source intact (Mastercard *5656)
- Real cause: Stripe Issuing operational balance was empty — card declines on auth regardless of spending-control cap
- Memory rule updated: `feedback_meta_api_error_diagnostics.md` now leads with funding-balance mechanism + prevention pattern
- Auto-cron resumed; boost create works again

**Editorial substance shifted hard:**
- City Secretary Francisca Nixon's TPIA reply parsed: 3 of 5 items fully closed, 1 partial (RFP rubric received; bidder responses await AG opinion 45-60 days), 1 needs narrowing (CIQ filings 2019-present)
- **Item #3 closed with zero records** — no CIQ/CIS filings naming Sea Oats / ZJZ / Bhakta / Cinnamon Shore (or its General Partner) / Lamkin from Jan 2017 → Apr 2026
- **Charter Review Commission listing received** — three of five seats since 2020 on a six-month-term board; one vacant; one missing TOMA training
- **2019 RFP grading rubric received** — Palmilla beat Cinnamon Shore 182-175 (74% vs 71.5%), council voted 7-0 for the lower-scoring bidder
- **Civicweb research agent ran in background** — 20 council agenda packets pulled; full SUMMARY at `port-a-local/Port A Local/Dispatch Research/civicweb-minutes-2018-2020/SUMMARY.md`
- **Critical finding: rubric was NOT in the public Jan 17, 2019 packet.** Item 7-H reads literally: *"INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW."* Resolution template named the planned awardee as **"McCombs Properties"** — that's accurate, not a shell error: Palmilla Beach is owned by McCombs Properties (the Red McCombs San Antonio empire). The draft anticipated Palmilla/McCombs winning consistent with the rubric score (Palmilla 182 vs Cinnamon Shore 175). The "blank awardee" field was the post-vote update placeholder; council voted 7-0 against the draft and awarded Cinnamon Shore + ZJZ Hospitality partnership instead. **Crawford + Moore were on the RFP committee** — the other five council members voted on a contract whose evaluation criteria had not been distributed in the public record. Brett Hentz (Tourism Bureau CEO; hire driven by Suzette Freeman / Mustang Island Ventures LLC search committee in Jan 2017) was running the procurement and briefed council on the bidders.

- **2025 INTERNAL PIVOT RESOLUTION 2025-R14 (Mar 25, 2025):** Council voted 7-0 to award $9.575M contract to **Weaver and Jacobs Constructors** for **City Hall / Civic Center Expansion & Renovation** at 710 W. Avenue A. Architect: **Turner Ramirez Architects** (Project Manager Jody Schade). Funding: General Fund Account #050-66320 + Facility Fund 115-66320. Bond Counsel: **Andrew Friedman, Samco Capital Markets** — proposed Hotel Occupancy Tax reimbursement Resolution mechanism (city would reimburse itself with venue tax if voter-approved). City Manager David Parsons. Three bids: Beecroft $10.14M / Weaver and Jacobs $9.575M (lowest, awarded) / Broaddus $10.48M. **Crawford motioned, Christianson seconded.** Voting yes: Mayor Moore, Mayor Pro-Tem Owens, Winton, Krueger, Chambers, Crawford, Christianson — same Crawford who was on the 2019 RFP committee. **Turner Ramirez Architects continuity finding:** TRA was on Cinnamon Shore's 2019 winning bid team AND is the architect of the 2025 internal alternative — same firm bridging both sides of the 6-year arc. **Project budget context:** Aug 8, 2023 Mayor Moore questioned funding for "the major addition, the City Hall renovation and expansion"; FY 2024-25 budget allocated $4.275M City Hall renovation + $5.35M Civic Center expansion. **Structural finding for Dispatch piece:** same Hotel Motel Tax revenue stream that funded the 2019 RFP under 2017 HMT legislation now flows (via reimbursement mechanism) to internal facility expansion. Dollars stayed; recipient flipped — external private operator → internal city-owned facility, with the Civic Center expansion absorbing the conference function the 2019 RFP would have housed externally. Both votes 7-0 six years apart. Source: civicweb Mar 25, 2025 minutes (lines 195-340) + Aug 8, 2023 Special Meeting minutes (lines 305-399).
- **Jul 16, 2020 7-0 vote** relocated the conference center from Cinnamon Shore II to Brookdale parcel under "PA Waterfront, LP / The Brookdale Group, LLC"
- **Nov 19, 2020 Resolution 2020-R59** (Second Amendment) extended Development Agreement with new SPV "The Inn, Spa & Conference Center, LP" through Dec 31, 2022. Lamkin's developer timeline: groundbreaking Dec 31, 2022.
- **Two emails to Collie via haveebot** — original P&Z Capture editorial review + civicweb addendum (in-thread Re:)
- Editorial roadmap recommendation: piece can publish on what's now sourced (~2,000 words); bidder responses become Part 2 follow-up after AG opinion (45-60 days)

**Collie InDeployed at PAL — first canonical Tier 1 design contributor:**
- Pre-flight verified end-to-end (GitHub `colliebreah` confirmed write collaborator; CODEOWNERS + branch protection settings audited; recent auto-merge in action via PR #18)
- Onboarding launch email sent ("PAL design station — easy launch") with adjustments: dropped winstonciv CC, softened closing for synchronous launch, fixed the heyedeploy-paths runbook bug (referenced PAL contributor-context paths instead — the heyedeploy mirror is what Collie's Tier 1 access can reach)
- **Empirical floor measured: 2 terminal commands + 2 Mac password entries**, ~30 min including auth flows
- **PR #19 — "Add Collie as design contributor"** — merged by `colliebreah` herself at 18:11:22 UTC. ~2 min PR-to-merged, ~3 min PR-to-production. CONTRIBUTORS.md created with bio: *"Brand and design architect specializing in creative direction, graphic design, copywriting, and marketing strategy."*
- One runbook gap discovered: auto-merge has to be explicitly enabled per PR. Winston pushed commit `42b5bad` to fix the canonical `pal-design-contributor-launch.md`.

**PreDeploy / InDeploy / PostDeploy lifecycle framework locked + named:**
- Brand-discipline rule: never bare "Deploy" — always Pre/In/Post temporal prefix. Reserved for HeyeDeploy (umbrella) + vertical products (MarketingDeploy, CityDeploy, ArchiveDeploy, OnboardDeploy, etc.)
- Memory rule filed: `feedback_deploy_phase_naming.md` + MEMORY.md indexed (HARD CROSS-PROJECT BRAND-DISCIPLINE RULE — same teeth as HeyeLab spelling rule)
- **PreDeploy** = pre-flight (productizable as a paid engagement — "Cleared for InDeploy" sign-off)
- **InDeploy** = launch ritual (the wrapper Collie just executed; floor: 2 commands + 2 passwords)
- **PostDeploy** = operating mode (steady-state PR flow, tier graduation, spoke→hub contribution)
- Heyedeploy PR #1 (4 lifecycle docs) — MERGED 19:08:21 UTC
- PAL PR #20 (mirror to contributor-context) — MERGED 19:14:35 UTC
- Operator-facing PreDeploy checklist drafted with three tiers (design contributor / operator / tenant)

**Heyedeploy architectural parity with PAL:**
- Was originally `"Branch not protected"` — now matches PAL exactly
- `allow_auto_merge: true` + `delete_branch_on_merge: true` + `allow_update_branch: true` (the latter also flipped on PAL — lets contributor Claudes self-serve branch updates when main moves between PR-open and Vercel-pass)
- Branch protection on `main`: Vercel status check required, 0 approving reviews, code-owner reviews required on protected paths only
- CODEOWNERS file (heyedeploy PR #2 — merged 19:12:40) — protects framework canonical (`framework.md`, `components/`, `operations/`, `tenants/`, `verticals/`, `decision-log/`, `patterns/`) + build/config; free-merge zone is `brand/`, `site/pages|components|styles|public/`, `docs/`, `CONTRIBUTORS.md`
- Collie invited as collaborator with `write` permission (invitation ID 317854160 — pending her acceptance via GitHub notification)
- Same Tier 1 architecture as PAL across both repos

**Open dials carried into next session (priority order):**

1. **Collie accepts heyedeploy invitation** — her action; visible at https://github.com/haveebot/heyedeploy/invitations
2. **Francisca focused follow-up** (CIQ narrowing + AG opinion confirm + officer-side question) — PINNED per Winston for him + Collie to review scope first. Courtesy/holding reply already sent 2026-05-07 PM closing items 2, 3, 5 and committing to a single focused follow-up on 1, 4, plus the officer-side equivalent of #3 (Form CIS + § 171.004 affidavits naming Sea Oats / ZJZ / Bhakta / Cinnamon Shore / Lamkin)
3. **Dispatch piece draft (P&Z Capture)** — substantively unlocked; gated only on Collie's tonal read of the absence-of-records paragraph
4. **AG opinion request for bidder responses** — file after CIQ-narrowing locks (45-60 day wait)
5. **Watch list active** for Bron Doyle + Angie Axtell (7-day TTL)
6. **Jeremiah's photos** when Angie sends
7. **Push parked autoBoost.ts** (still on `inbox/forward-stranger-sms-to-admin`)
8. **Polish debug-perms** — drop two false-positive checks
9. **Operator approval queue** (4-8 hr — biggest editorial-quality lever)
10. **Day-of-week templates / Quick-fire composer / Sunday brief** — gated on #9
11. **Wheelhouse social UI cleanup** — needs Collie design input
12. **HeyeDeploy framework promotions** — patterns from tonight (lifecycle naming discipline, agent-driven autonomy mirror, PreDeploy productization angle, contributor-context path-mirror discovery)

**Pre-2026-05-06 OPEN PRs (still untouched, separate triage):**
- `#1` — Staff app Palm Republic brand polish
- `#2` — Customer iOS app native shell
- `#3` — Staff app Mock Mode for demos
- `#4` — Checkout price-IDOR hotfix
- `#5` — Maintenance HTML injection hotfix

**Detailed handoff brief:** `port-a-local/Session Notes/handoff-2026-05-07-pm.md` — full context for the PM session.

### LATE-PM CONTINUATION (after the initial PM truck — added through ~02:30 UTC May 8)

After the initial PM truck closed (which captured up through the courtesy reply to Francisca), the session continued for several more hours and produced significant additional work. The handoff brief at `Session Notes/handoff-2026-05-07-pm.md` is the comprehensive document; key additional milestones:

- **Editorial Dispatch piece moved from outline to v3 staged + delivered.** Three rounds of records research (static-URL → browser-driven → food-truck pattern) produced documented findings for four households (Lorette + Owens + Zahn-Winton + Lafayette) plus the Mustang Island Ventures LLC → Hentz CEO chain + the Aransas Club / Cocke development arc + the 2009 four-principal South Jetty co-appearance (network at minimum 17 years old). Drafts v1 (~1,800 words) → v2 (~2,400) → v3 (~2,550) with Charter Review elevated to the structural anchor per Winston's call ("the real Port A stuff"). v3 staged at GitHub + sent via SMS to Collie + Nick.
- **Five Collie PRs after her bio merged.** Beyond #19, she shipped: #21 Homepage redesign + Mother's Day weekend guide → #22 Gully as a brand character → #23 Center Gully sections → #25 Mother's Day hero + booking links + homepage auto-hide. **+787/-375 lines across the 5 PRs.** First canonical Tier 1 design contributor running at full pace.
- **Surname correction**: Collie's vault file was misnamed `Collie Caraker — Design.md` → corrected to `Collie Farley — Design.md`. Fix landed alongside the contact-ledger PR.
- **Three more HARD CROSS-PROJECT memory rules locked**:
  - `feedback_pal_synthesis_journalism.md` — records floor, synthesis is the value (Winston-articulated during the network-ties research)
  - `feedback_email_recipient_verify.md` — pre-send To/CC/BCC verification + screenshot test
  - `feedback_contact_ledger_check_first.md` — discovery hierarchy for internal-collaborator contacts (super-admins.ts + insiders.ts + wheelhousePush.ts + People & Vendors profiles + workspace .env)
  - `feedback_contributor_context_mirror.md` — every Heye Lab repo with Tier 1+ contributor access has a `contributor-context/` folder with curated cross-project rule mirrors
- **Heyedeploy contributor-context folder created** for Collie's next-session lock-in. PR #3 in heyedeploy merged at 02:21:47 UTC with 13 files: README + contributor-launch + pal-brand-inheritance + 10 memory mirrors. CLAUDE.md updated to route Tier 1 contributors there.
- **Documented current super-admin contacts** (now in workspace memory + PAL vault profiles):

| Slug | Name | Cell | Email |
|---|---|---|---|
| winston | Winston Caraker | `+15125681725` | `winstonciv@gmail.com` (personal) / `admin@theportalocal.com` (PAL ops) |
| nick | Nick Merrill | `+15122015353` | `nickbmerrill@gmail.com` |
| collie | Collie Farley | `+12107095771` | `collie.breah@gmail.com` |

PAL Twilio sender: `+13614281706`.

**Total session output (longest in PAL history):** 10 PRs across PAL + heyedeploy + 5 new HARD CROSS-PROJECT memory rules + 2 repos with full architectural parity + 1 new tier-1 contributor canonically InDeployed + 1 lifecycle framework named + locked + 1 Dispatch piece v3 staged + sent + 1 City Secretary TPIA closed on 3/5 items + multiple structural editorial findings documented.

## Current State (as of 2026-05-07 AM — 12-PR shipping marathon + tenant outreach + Meta billing root-cause)

**12 PRs merged in one evening session** (#7-#18). Bigger by PR count than any prior PAL session. Headline themes:

**Tenant outreach in flight (real money):**
- **Bron Doyle** (Bron's Backyard + Beach Carts) pitched as HeyeDeploy beta. SMS + email landed. He replied with phone-confirm 5/6 PM ("7143 for reservations but important info my personal 2766" — soft-engaged on the bigger pitch). Winston driving close. Watch list active (`bron-pitch`, 7-day TTL).
- **Angie Axtell + Chef Matt Axtell** (Crabcakes & Caviar catering + Jeremiah's Boat Dock Grill at Woody's). Two-thread pitch (free catering leads + add Jeremiah's to /eat). Angie replied within 5 hours with full data. PAL closed both threads (Jeremiah's listing live with phone/hours/menu, Crabcakes & Caviar live as `/services` with Texas Chef of the Year framing). Open: photos for Jeremiah's. Watch list active (`chef-matt-catering`).

**Editorial — Collie's full Tuesday delivery (3 asks → 3 PRs → 3 in-thread acks):**
- PR #7 Live Music week of May 7 (18 acts Thu-Sun, with Bron's hosting Fri+Sat)
- PR #8 Events this-week slate (May 9-10 one-offs + 2 new recurring fixtures, new "This Week" surface on /events that auto-rotates by date)
- PR #9 OG color system (4 card systems · 14 routes wired) — full spec from Collie's PDF
- Open: 3 missing OG colors from Collie (PAL Housekeeping · Maintenance Requests · Restaurant Partnerships) + plain-text May 6-8 events list

**Strict no-names rule violation hotfix → systemic lock:**
- Collie spotted "Collie — Port A Local calendar..." rendering on /live-music's Source & Scope panel
- PR #10 + #11 swept 4 violations across /live-music + /brand (×2) + /beach/vendor/connect
- Memory rule **`feedback_pal_no_names_on_website.md`** locked as cross-surface superset of email rule
- PR #16 prebuild CI guard at `scripts/check-no-names.js` — caught 3 additional violations the audit missed (Saltwater Gypsies, Winton's Guide, TWAT event content). Future leaks fail the build.

**OG color complete pass:**
- PR #13 — 15 remaining OG routes wired to category-driven color system. Every standard `brandedOG` surface now flows through Collie's spec. Custom-layout cards (events/[slug] countdown, dispatch/[slug] highlights) skipped pending separate Collie review.

**SMS reply infrastructure rebuilt:**
- PR #14 SMS watch list + race-condition fix. New `sms_watch_list` Postgres table + `/api/wheelhouse/sms-watch` admin endpoint + race fix on stranger inbound webhook (was fire-and-forget; now `Promise.allSettled` before TwiML return — Bron's reply lost to that race).
- Watched-number replies elevate operator push from `[unknown ... → PAL]` to `🔔 WATCHED [<context>] ... → PAL`.

**Meta billing root-cause finally cracked open:**
- 5 days of silent boost-create failures since Sunday 2026-05-02. Vague `creative: Permissions error` on every attempt.
- PR #17 debug-perms diagnostic endpoint shipped — surfaced `account_status = 3` (UNSETTLED) on the ad account
- PR #18 spend-breakdown diagnostic shipped — confirmed total spend was only **$3.16** (NOT $50, NOT close to the Stripe Issuing card cap)
- **Real cause:** Meta tried to bill Stripe Issuing card "PAL · FB Ads" (Mastercard *5656) for the $3.16, charge declined, account flipped to UNSETTLED, blocking all subsequent boost creates
- **Fix path (operator-side, next session):** Stripe Authorizations log → identify decline reason → Meta Billing → "Pay now" the $3.16 with different method → debug-perms verify account_status returns to 1 → resume boosting
- Memory rule extended in `feedback_meta_api_error_diagnostics.md`: "billing first, scopes second" for any Meta `creative: Permissions error`. Stripe Issuing virtual cards on Meta have a known first-charge decline pattern.

**Diagnostic endpoint inventory after tonight:**
- `/api/wheelhouse/social/boost/diagnose?id=N` — per-post boost state + insights triangulation (existed before)
- `/api/wheelhouse/social/boost/debug-perms` — token + perms + page tasks + ad_account.account_status (NEW)
- `/api/wheelhouse/social/boost/spend-breakdown?days=30` — per-ad spend + daily curve (NEW)

**Twilio + Vercel cost audit (no actual spike):**
- April 2026 Twilio bill: $193.08 — **$106 of that was one-time A2P 10DLC registration fees** (brand registration + campaign vetting + carrier setup). Sunk cost. May so far: $1.14 — normal trajectory.
- Vercel notification storm: caused by tonight's PR storm (12 PRs in 4 hours = 30-60 deploy emails). Mitigation = Winston tunes Vercel notification preferences (off "Deploy started" / "Build started"; keep "failed" only).

**Open dials carried into next session (priority ORDER):**

1. **Settle FB billing** ($3.16 outstanding on Meta ad account, fix the Stripe Issuing decline) — TOP PRIORITY
2. Watch admin@ + PAL SMS for Bron / Angie / Adam Porto / Katie Rogers / Chris Jordan replies
3. Jeremiah's photos when Angie sends them
4. Push parked autoBoost.ts work (still stashed on `inbox/forward-stranger-sms-to-admin` branch, sitting since 2026-05-02)
5. Polish debug-perms diagnostic (drop two false-positive checks for PAGE token type)
6. Build operator approval queue for auto-drafted posts (biggest editorial lever)
7. Day-of-week templates / quick-fire composer / Sunday brief (depend on operator approval queue)
8. Wheelhouse social UI cleanup (Collie design input)
9. Travis L&EA portal access (asked 2026-04-30, still open)
10. HeyeDeploy framework promotions (5 patterns from spoke + 5 from PAL tonight)

**Pre-tonight OPEN PRs (untouched, need separate triage):**
- #5 Maintenance HTML injection hotfix
- #4 Checkout price-IDOR hotfix
- #3 Staff app Mock Mode for demos
- #2 Customer iOS app native shell
- #1 Staff app Palm Republic brand polish

**Detailed handoff brief:** `port-a-local/Session Notes/handoff-2026-05-07-am.md` — pickup-here protocol, exact commands, watch list management.

## Current State (as of 2026-05-03 PM — OG link-card staleness bug-class permanently solved + agency outreach round)

Eight commits today (`9192323` → `eef7b34`) plus two HeyeDeploy doc commits + one workspace-memory commit. Headline: **the multi-week recurring "stale OG link card on every shared post" bug is empirically dead.** The actual diagnosis only happened after Winston explicitly demanded evidence over theory (4+ hours of escalating-complexity guesses produced commits but no proof). Once the diagnostic endpoint shipped and we read FB's actual response: **FB caches OG image bytes against the FULL URL string (including query params), in a cache separate from the URL→metadata cache. Sharing Debugger refreshes metadata but does NOT re-fetch image bytes for unchanged URLs.** Force-dynamic on the route makes our server return fresh bytes — but FB never asks because the URL doesn't change. **The mechanism that works**: data-derived fingerprint as `?v=` query param on the og:image URL via `generateMetadata` override. URL changes → FB has no cache match → fresh fetch from server → fresh link card. Verified empirically with the Sunday "wind-down" post (#29).

**Four-layer lockdown** documented in `heyedeploy/components/marketing-deploy.md` for tenant replication: (1) `dynamic = "force-dynamic"` on every `opengraph-image.tsx` (necessary baseline), (2) `scripts/check-og-dynamic.js` as `prebuild` regression guard (with `--fix` mode), (3) URL-versioning fingerprint in `generateMetadata` (the actually-bytes-busting mechanism), (4) dual-cache pre-scrape in `lib/metaGraph.ts preScrapeLinkUrl` that scrapes BOTH page URL AND parses og:image URL from page HTML for an extra defensive scrape. **For new dynamic-OG routes going forward**: layer 3 (the fingerprint) needs manual addition to `generateMetadata` per route — not auto-enforced yet, that's a future tooling improvement.

**Outbound communication round:**
- **Adam Polo** voicemail (Sandcastle guest, May 8-10 weekend, beach setup interest) → outbound SMS via Twilio direct (PAL number `+13614281706` → his `+15852812326`). Pure-SMS close per Winston's preference. Status `accepted`, sid `SMa378b6aec96996ce67cbf86e6ceefddc`. Watch PAL inbound SMS log for reply.
- **Sandcastle / CCMS** (Katie Rogers, Director of Marketing) → email to `news@portaransas-texas.com` (CCMS doesn't publish individual emails) with subject + body both naming Katie. Reports the multi-year stale-info issue (PA Local Co rebranded → The Port A Local, old phone doesn't ring), gives updated contact set, offers a one-pager. CC + Reply-To bookings@. Watch bookings@.
- **Chris Jordan** (catering vendor #1) → lead-gen pitch email. Free hot leads to his phone, he and customer negotiate direct, PAL takes nothing. Asks for phone-number confirmation + optional offerings info. CC + Reply-To bookings@. Watch bookings@.
- **Collie** → both email + Wheelhouse thread `thread-moq5j0f0-95p8u5` for OG color direction (color-coding by topic vs. uniform navy-with-coral). Brand-keeper input needed on palette + grouping + accent-vs-full-background. Email has the FB feed screenshot of post #29 attached for visual reference.

**One outbound Sunday post (#29) — the OG-fix proof.** "Sunday wind-down — Mykel Martin at Bierhaus at 2, Jim Dugan at Shorty's at 3. Slide in." Live at https://www.facebook.com/142397023082287/posts/1004505138907956. Link card rendered correctly with current "Tonight: 2 live acts" + Jim Dugan / Mykel Martin (no Farmers Market in image) — first time today the editorial body and OG card aligned. **Organic only — boost failed at the Meta layer** (`creative: Permissions error` from Marketing API). Same boost system was firing fine this morning per the morning handoff (6 active). Something changed mid-day — possibilities: token scope drift, ad account ↔ page link broken in BM, or token rotation half-completed. Not diagnosed yet. Pick up next session.

**Tooling shipped:** `pal_mail.py --reply-to` flag — lets us send from admin@theportalocal.com with replies routed to a different mailbox (bookings@ today, hello@ when that's wired). Used three times today. Replaces the future need for separate SMTP credentials per workspace mailbox in many cases. Bookings@ + hello@ Gmail app passwords still parked for Winston to generate when he has 10 min.

**Fix loops separately surfaced as systemic gaps** (identified, NOT yet shipped — these are the next-build pile):
- **Operator approval queue for auto-drafted posts** — single biggest editorial-quality lever. Cron drafts → operator sees full link-card preview (body + OG image as it'll render in feed) → one-click approve / skip / edit. Would have prevented today's entire OG cascade (the post that auto-fired this morning had wrong editorial framing AND wrong OG, both visible in a preview).
- **Day-of-week editorial templates** — cron currently composes one template against /live-music data regardless of day. Should branch: Sunday = Farmers-Market-led + slow framing; Friday/Saturday = full music lineup; weekday = current beat. Each day gets composition logic that knows the day's rhythm.
- **Quick-fire composer for recovery** — text + image-bank pick → posts in seconds, no link card, no OG dependency. The bypass for any future OG-class bug. Pairs with "recover, don't relitigate" rule.
- **Sunday content brief** — Sunday has its own rhythm (farmers market morning, slow music afternoon, recovery mode). Deserves an ongoing editorial brief, not a default fallback from /live-music data.

**Cross-project rules NEW or strengthened today** (all in memory): autonomy preference (act on low-risk reads/edits without asking), Deploy-model operator-hassle rule (lock systemically when Winston flags repeated friction), entity-only email voice (opener + body + sign-off, no individual names anywhere unless explicit override), vercel env pull `\n` escape (must strip when sourcing for direct API calls).

**Editorial mid-session reframing** ("if it is a hassle for me then it will be a hassle for the client"): Winston's articulated standard for the Deploy model when something becomes operator-friction. Becomes the test for whether to lock a fix at the framework level vs. ship a per-post workaround. Saved as cross-project rule.

**The Farmers Market data-shape fix:** Farmers Market was wedged into `/data/live-music.ts` acts array (wrong home — it's a community event, not a music act). Removed from there + added to `/events/page.tsx recurringEvents` (right home — alongside Farley Boat Works 2nd Saturday, Art Center First Friday, UTMSI tours). Editorially this matters because Sunday's auto-composed "live music tonight" headline was counting Farmers Market as one of the "acts," producing the absurd "Tonight: 3 live acts across Port Aransas — Jim Dugan · Mykel Martin · Farmers Market" framing that became today's visible failure.

**Open dials for next session** (priority order): (1) boost #29 / debug Meta API perms — quick BM UI check or `/debug_token` GET; (2) Adam SMS reply watch + Katie Rogers reply watch + Chris Jordan reply watch; (3) Collie color reply → implement in `brandedOG`; (4) operator approval queue (the biggest editorial lever); (5) day-of-week editorial templates; (6) quick-fire composer; (7) Sunday content brief; (8) older rocks: Wheelhouse social UI cleanup, municipal features build-out, Catering page if Chris agrees.

## Current State (as of 2026-05-02 evening — encyclopedia + Beta delivery + boost ops + Beyrl day-list + nav cleanup)

Sunday continuation of Saturday's marathon. **~14 commits today** (`d7f9da3` through `4ae997a`). Longest single shipping session in PAL history by scope. Three major threads landed: completed boost-ops layer (diagnose endpoint + cron fix + sync button + top-up button); shipped /birding's first community-sourced day-list (Beyrl Armstrong's 53 species, with dynamic OG); pivoted /deliver from "3-restaurant delivery app" to "the food encyclopedia of Port Aransas" with Beta delivery cart + operator-confirm-before-charge workflow on every island restaurant we have menu data for. **Six concurrent paid boosts running** at session truck ($22 session ceiling). Live URL: https://www.facebook.com/142397023082287/posts/1003842798974190 (the "Prove it" launch post).

**Boost ops matured (5 commits).** Three new operator-facing tools shipped: (1) **Diagnose endpoint** (`/api/wheelhouse/social/boost/diagnose?id=N`) pulls ad effective_status + issues_info + insights at three date_presets + account-level sanity check. Permanent troubleshooting tool. (2) **Sync now button** (`SyncBoostsButton.tsx` + `/api/wheelhouse/social/boost/sync`) — operator-triggered immediate refresh of boost insights, bypasses the cron's 1hr throttle. (3) **Top-up button** (`TopUpBoostButton.tsx` + `/api/wheelhouse/social/boost/top-up` + `topUpBoost()` helper in metaAds.ts) — modify existing adset's `lifetime_budget` instead of spawning new campaign for hot posts. Cheaper + retains Meta's learning. $10 cap per top-up. Plus the bug-fix that mattered most: cron's `fetchBoostInsights` was passing no `date_preset` and Meta returns `data: []` for fresh ads in that case — silently overwriting real spend/reach data with zeros. Filed cross-project as a sharp Marketing API gotcha.

**Beyrl Armstrong's 53-species day-list** lives at /birding now. Two yellow-legal-pad photos came in via haveebot mail (Beyrl is local birder Collie's mom is connected with). Transcribed via image read, structured into `src/data/bird-sightings.ts` (with family-classification heuristic — warblers / shorebirds / ducks-teal / herons-egrets / vireos / orioles / flycatchers / songbirds / waterbirds / gulls-terns / raptors / other). Renders as family-grouped lede on /birding ("53 species. One morning."), with dynamic OG that leads with the species count + birder attribution + named-species list + last-night's BirdCast crossing total in subtitle. Spelling fix: Beryl → Beyrl. **Validated the photo-to-feature pipeline end-to-end at 20-min cadence** — fourth submission will take 5 min, not 20. Same pattern carries to sea turtles, fishing reports, weather observations, Sandfest works-in-progress, etc.

**Restaurant encyclopedia (THE big cook of the night).** /deliver pivoted from "3 PAL-delivery restaurants" to "every restaurant on the island" — 41 spots in 4 sections: 🚀 PAL Delivery (Crazy Cajun, DQ — confirmed partners) · 🏪 Convenience runs (Lowe's) · 📞 Order direct (~28 spots PAL doesn't yet deliver from) · 🪑 Reservations (Venetian Hot Plate, La Playa, Roosevelt's, Lisabella's per Winston's editorial call — fine dining, no takeout). New `restaurant-encyclopedia.ts` joins businesses.ts (39 /eat entries) + delivery-restaurants.ts (3 PAL-delivery). State-based affordances drive the CTAs. New `restaurant-menus-scraped.ts` houses 11 restaurants × ~370 menu items scraped via 3 parallel agents from public sources (Tripadvisor + dunesporta + places.singleplatform.com + restaurant own sites). `selectBestMenu(slug, curatedMenu)` picks whichever is richer per restaurant.

**Beta delivery cart wired on every priced-menu restaurant.** New `delivery-beta-from-scraped.ts` generates `DeliveryRestaurant` + `MenuCategory` + `MenuItem` rows from scraped menus at module load time. Pricing parser handles `$15.99` / `Cup $5.99 / Bowl $7.99` / `$15.99 / $17.99` / `$9.99/lb` (lowest dollar value wins). Items without prices skipped (can't add to cart). `markupPct: 45` matches PAL-confirmed roster — per Winston's conditioning rule: same prices day one so no surprise jump when a restaurant graduates Beta → confirmed partner. Beta restaurants merged into the existing `getActiveRestaurants()` helper so cart, detail pages, dispatch all see them as first-class. ⚡ Beta badge on /deliver index card + full Beta info banner on /deliver/[restaurant] detail page (operator-confirm explainer + price-may-have-drifted disclaimer).

**Operator-confirm-before-charge order workflow.** New `OrderStatus`: `pending_review` (between submit and `placed`). Beta restaurants ALWAYS take the no-Stripe path even when `DELIVER_PUBLIC_LAUNCH=true`. Customer cart submits → order created with `pending_review`, NO Stripe charge → email lands at admin@theportalocal.com with full order details + projected economics → operator calls restaurant + finds runner manually → if GO: create Stripe payment link from dashboard, SMS to customer, customer pays, standard PAL dispatch flow takes over → if NO GO: SMS sorry, no charge. Customer-facing UX: "Request received · we'll text you within ~10 min." Wheelhouse one-click "Create payment link" + "Decline" buttons NOT yet built (next session); operator handles via Stripe dashboard for now.

**Marketing salvo + nav consolidation.** "Prove it" launch banner on /deliver hero — full-width coral, "📣 Locals · Restaurants — Prove it." with two CTAs (Drivers sign up + Restaurants claim listing) + Beta disclaimer below. FB launch post #24 fired with matching editorial-org voice ("40+ restaurants. One platform. Delivery from every one of them.") + $5 boost. Nav consolidated: desktop "Delivery" portal pill → **filled-coral "Eat"** pill (was outlined/subtle; now dominant — `eatPillClass` distinct from secondary `portalLinkClass`). /eat → 308 redirect to /deliver (preserves SEO authority + bookmarks). Explore dropdown's "Eat" entry routed direct to /deliver. Footer "Delivery" → "Eat". New homepage CTA strip — full-width coral section above the fold (right after Hero + FeaturedEventBanner + RunnerLeaderboardTile), big H2 ("Order delivery from every restaurant on the island"), two CTAs.

**Mobile nav bug fixed (recurrence with different mechanism).** The 2026-04-25 fix used `100dvh` not `100vh` — that's still in place. New issue: mobile menu now has 35+ rows (Delivery + Rentals + Services verticals all expanded), and iOS Safari + Android Chrome eat 80-120px of `100dvh` with bottom URL bar / home indicator. Last 1-2 menu items technically scrollable-to but visually hidden under browser chrome. Fix: replaced `pb-4` with dynamic `padding-bottom: max(5rem, env(safe-area-inset-bottom) + 4rem)` — always 5rem of breathing room, grows with iOS safe area. Pattern applies to any tall scrollable mobile UI.

**Boost economics tonight:** Six concurrent boosts firing. Topped up the four carryover boosts ($1 → $2/$2/$3 — drought, happy hour, Sat music kept under-budget but topped to keep them serving Saturday night peak). Two new $5 boosts launched (#23 birding day-list, #24 eat-launch). **$22 session ceiling.** Account spend at last sync: $2.03 (333 reach, 372 imp, 66 clicks, ~18% blended CTR — well above FB benchmark). Birding-radar from yesterday hitting 25% CTR at $5.

**Open threads next session (from Winston's pickup notes):** (1) Voicemail rental conversion — pull email UID 260, transcribe, write tight SMS (NL voice, sectioned per Collie's golf-cart text format), get customer to rent. (2) Wheelhouse social UI cleanup — cards cramped with layered info, layout pass needed. (3) Municipal features build-out — utilities directory, building permits, mirror-and-extend "My Port A" city app features. Civic moat dovetails with Dispatch + PIA work. **Strategic question Winston raised:** when do we call CityDeploy ready to start testing models? Answer: 60-90 days of PAL Beta running with real signal, plus the trigger is an outside signal (someone in another town asking "can you build this for us?"). Pre-work: strip Port-A-hardcoded values into tenant-config layer + document operator runbook.

**HeyeDeploy templates locked tonight (added to MarketingDeploy + cross-project memory):**
1. **Marketing API insights diagnose endpoint** — multi-preset insights triangulation + effective_status + issues_info pull. Permanent troubleshooting tool.
2. **Boost top-up via lifetime_budget PATCH** — cheaper than spawning new campaign, retains Meta's learning.
3. **Manual sync button for cron-driven data** — operator-triggered immediate refresh with throttle bypass.
4. **Photo-to-feature pipeline at 20-min cadence** — email photo → image read → data module → page render → dynamic OG → editorial post → boost.
5. **State-based marketplace surface (Confirmed / Beta / Reservations)** — universal pattern for any marketplace with both formal-partner and informal-listing inventory.
6. **Operator-confirm-before-charge** — accept-then-process for marketplace launches where fulfillment isn't guaranteed.
7. **Conditioning-rule pricing** — same markup on Beta as on confirmed; no surprise price jump when graduating.
8. **Filled-CTA-pill for primary nav** — visual hierarchy when one vertical is THE primary CTA.
9. **iOS chrome safe-area for tall mobile drawers** — `max(5rem, env(safe-area-inset-bottom) + 4rem)`.
10. **Editorial-org voice for marketplace launch** — confrontational "you said you wanted X / prove it" copy for two-sided marketplaces.

**Parked work (NOT pushed, sits locally):** `src/lib/autoBoost.ts` (new file) + `src/app/api/wheelhouse/social/[id]/route.ts` (one-line import) + `src/data/social-post-store.ts` (auto-boost-on-send column + helper). Started earlier in session, paused per Winston's pivot to top-up button. Self-contained, doesn't break anything. Easy resume next session — wire UI selector on pending-post cards, complete the helper integration, push.

**Live FB posts firing tonight:**
- #23 birding day-list ($5/24h, just sent ~17:05 CT)
- #24 eat-launch ("Prove it") ($5/24h, just sent ~18:05 CT)
- #5 drought, #18 happy hour, #20 sat music (all topped up)
- #22 birding migration radar (yesterday's $5)

First substantive numbers expected ~end of Sunday.

## Current State (as of 2026-05-02 PM — paid boost system live + birding feature + spotlight banner)

Marathon Saturday session. **22 commits on main today** (`a33e551` through `34d819a`). Huge build across three threads: completing the paid-boost system (now firing real ads against real ad account), shipping PAL's first nature/wildlife feature page (/birding) with live BirdCast radar integration, and adding the new "spotlight" alert severity for celebratory island-wide notices. **Three concurrent paid boosts running** at session truck: $1 Saturday live music (#20), $1 drought dispatch (#5), $5 birding spotlight (#22). **First $7 of paid PAL ad spend in flight.**

**FB ad account fully wired (a `Port A Local` ad account inside The Palm Republic BM, ID `1512330510557166`).** Token rotated round 2 with `ads_management` + `ads_read` scopes added (Layer-1 use case "Create & manage ads with Marketing API" added to the Meta App). META_AD_ACCOUNT_ID set in Vercel. `/api/wheelhouse/social/boost` endpoint operational; campaign + adset + creative + ad sequence creates clean. Two FB Marketing API gotchas debugged + fixed: (1) `is_adset_budget_sharing_enabled=false` required when not using campaign-level budget (subcode 4834011), (2) `lifetime_budget` instead of `daily_budget` for short campaigns (subcode 1487793 "Schedule Too Short" rejects 24h-exact daily). Both filed in memory `feedback_meta_api_error_diagnostics.md` cross-project. Boost endpoint accepts per-call `budgetCents` override (capped at hard $5/day) for high-value pushes vs. the $1 baseline.

**`/birding` feature page ships PAL's first dedicated nature/wildlife content** — built around live data, not just static copy. Top section pulls from Cornell Lab BirdCast's public S3 bucket (`is-birdcast-observed-prod.s3.us-east-1.amazonaws.com/dashboard/...`) and renders a live radar snapshot — birds aloft + 12hr cumulative crossing total + flight direction/speed/altitude — for both Aransas + Nueces counties. Updates every ~10 minutes via ISR. Page has six hotspot writeups (Leonabelle Turnbull Birding Center, Joan and Scott Holt Paradise Pond, Charlie's Pasture, Mustang Island State Park, UTMSI, South Jetty), notable species list (sourced from BirdCast Gulf Coast fallout spotlight + TPWD migration times + Audubon Texas IBA), and a "From the field · this morning" callout naming local birder Beryl Armstrong (named, real, attending the preserve with Collie's mom this morning). Houston Audubon conservation note. Year-round context (Whooping Crane Festival, IBA designation). Dynamic OG image with the live radar number rendered in the link card. Page added to Explore dropdown in desktop + mobile nav alongside Live Music + Fishing Report. New 🐦 Birding entry uses `EmojiIcon` (no PortalIcon for bird).

**Spotlight banner severity (4th tier) added** — vibrant emerald-to-coral gradient for celebratory/positive island-wide notices, distinct from emergency tones (info/warning/critical). `role=status` + `aria-live=polite` (vs alert/assertive) so screen readers don't treat as emergency. ✨ icon replaces pulsing dot. "Right now · Port Aransas" label. Live on the site right now pointing at /birding ("Peak spring migration is here..."). Fixed a recurring mobile-gap bug in the same change: `PalBannerHeightSync` was selecting `aside[role="alert"]` and missing the new spotlight role; switched to stable `aside[data-pal-banner]` data-attribute selector that survives any future severity additions.

**Auto pre-scrape on every FB post** — `postToFacebook` now hits FB's Sharing Debugger API (`POST /?id=<linkUrl>&scrape=true`) with a 500ms grace period before publishing. Ensures FB has fresh OG cached when it snapshots the link card on the new post. Eliminates the manual debugger trip Winston had been running for every post (and which doesn't reliably refresh anyway because FB caches link cards per-post separately from URL OG cache). Failure to pre-scrape is non-fatal. **The pattern that came clear today:** when an external publishing API uses link cards (FB, Twitter, LinkedIn, etc.), the publishing code has to refresh the destination URL's OG cache server-side before the publish call, OR the publish snapshots stale data permanently.

**Marketing UX polish (Collie's session):**
- TrafficBadge → 3 always-visible pill chips (`📊 N FB` · `N total` · `~N/day base`) replacing the cryptic single-pill hover-only design. Per Collie's request after the first round.
- BoostBadge with five distinct visual states (none, stub, failed, active+syncing, active+insights, complete). Active state has a pulsing blue dot via `animate-pulse` — at-a-glance signal of "this post has spend in flight."
- Pending list sectioned into 🔥 Firing soon (auto_send_at <24h) / ⏰ Scheduled later (>24h) / 📝 Stockpile (no auto_send_at). Visual grouping over existing data; no new state machine. Bucket-local position labels.
- "Currently boosting (N)" section on /wheelhouse/marketing alongside Coming up + Lately. At-a-glance live ad ledger with pulsing-dot pills, inline metrics, View-on-FB direct link.
- "📊 Post performance" tile on the marketing hub; section name on /wheelhouse/social changed from "Recently sent" to match.
- Resend button label flow: Resend → Repost (per Winston) → Re-queue (per Winston after he noticed the action goes back to pending, not direct repost). Internal API action stays `resend`.

**Bidirectional Page↔Queue sync.** `/api/wheelhouse/social/sweep-removed` detects FB-deleted posts (Graph 404 → mark `removed_from_fb_at`), `/api/wheelhouse/social/import-fb` reverse-populates manually-typed FB posts into the queue ledger as `trigger_type='manual_external'`. Together they keep our DB in sync with FB Page reality regardless of how a post got there. UI fades removed posts + hides 🚀 boost button; "🫥 show removed (N)" toggle when removed > 0.

**Stripe Issuing card created today** (Winston, post-boost-system-shipped) — virtual card "PAL · FB Ads" issued to "Winston Caraker" cardholder (Stripe Issuing US requires real-human cardholder per Cross River Bank KYC; card nicknames carry the business-purpose label). $50/month spending limit + Meta MCC restriction. Linked to the new Port A Local ad account in The Palm Republic BM. Self-funding loop: PAL Stripe revenue (cabana bookings, etc.) → Stripe balance → funds the FB Ads card → ad spend.

**One real lesson worth carrying:** Meta's "Invalid parameter" top-level error is meta-vague. The actual diagnostic always lives in `error_user_msg` / `error_user_title` / `error_subcode`. Filed cross-project as `feedback_meta_api_error_diagnostics.md`. Also crystallized: Stripe Issuing US requires individual cardholders (not company); card nicknames carry the business-purpose labeling; FB ad spend funded from Stripe balance creates a self-funding revenue loop where booking revenue pays for marketing.

**HeyeDeploy MarketingDeploy doc updated** with 6 new patterns logged as Stage A — pre-extraction (PAL canonical, awaiting Sandfest second-build): per-post-traffic-via-own-analytics, paid-boost-via-Marketing-API, bidirectional Page↔Queue sync, sectioned-pending-queue, always-visible-analytics-pills, active-boosts-hub-surface. Plus two follow-up items for when second tenant lands: file `patterns/marketing-paid-boost.md` (with the FB-API gotchas) and `patterns/queue-external-bidirectional-sync.md` (generalizable beyond FB).

**Ship-ready next session: actual ads layer.** Boost system is live (paid promotion of organic posts). The next layer is "actual ads" — standalone campaigns with conversion tracking. Plan deferred to Monday after 24h of boost data accumulates. Foundation step is Meta Pixel install (~45 min) which unlocks conversion tracking + retargeting. Standalone campaigns and retargeting build on top.

## Current State (as of 2026-04-29 PM — Wheelhouse organization sprint + analytics hygiene)

Continuation of the morning's A2P-unlocked SMS arc. **17 more commits this afternoon** (`2693da5` → `5265754`) on top of the morning's 23. Now 40 commits total in one day — the largest single-day shipping sprint in PAL history. Theme: organize the Wheelhouse into a real operating dashboard, lock the cross-project patterns, codify principles into memory.

**Cart vendor policy reversal (2693da5).** Per Winston rule: cart vendors in the directory are default opted-in for SMS lead-blast — manual opt-out is the only exclusion. Helper `getOptedOutSlugs` replaces the gating model. Ash Cart Rental flipped `active:false` (replied STOP earlier; per "remove from listings + directory entirely" rule). Net: 14 vendors now in active blast roster (vs 0 confirmed-opt-in under the old gating).

**Intake-and-surface webhook (bdbbad9).** Per Winston rule: don't try to be clever parsing prose intent — just route messages to a human. Beach vendor non-CLAIM/STOP, cart vendor non-strict reply, and stranger inbound all push to operator (Winston) with `[Sender → PAL] body` format. Killed silent-log paths that swallowed John Brown's "out of town this weekend" earlier in the morning.

**Beach pricing reworked (eb166f1).** Vendor-model split: cabana $275 vendor + $25 PAL booking fee = $300 customer; chairs $75 + $10 = $85. Customer total unchanged (no buyer-facing price change). Stripe metadata records `vendor_total_cents` + `pal_fee_total_cents`. Internal admin email + super-admin ping show vendor/PAL split. Customer-facing footnote: "Includes $25/day PAL booking fee. Vendor receives $275/day."

**Beach Stripe Connect onboarding rails (129d692).** Mirrors the runner Connect Express pattern. New `beach_vendor_status` Postgres table; endpoints `/api/beach/vendor/connect/{start,refresh}`; vendor-facing onboarding page `/beach/vendor/[slug]/connect` with "Hi {first name}" greeting + button → Stripe-hosted form → status syncs back. Personal links per vendor (john-brown / tyler / danny-peterson).

**bookings@ as transactional ledger (74bd61d + 3dee7a3).** All 6 paid-event verticals (cart / beach / maintenance / delivery / locals / housekeeping) now CC bookings@theportalocal.com on internal alerts. Originally exposed by Stephanie's $300 cabana — admin@ got the email but bookings@ didn't.

**Cancellation policy + payout-release coupling (ed17ac4 + f9b8fde).** 72hr-before-setup is the cancellation cutoff — also the natural payout-release trigger. Customer-facing copy on /beach + email + Stripe receipt. Hourly cron at `/api/cron/beach-payouts` sweeps eligible claims past 72hr-before-setup mark; fires Stripe transfer to vendor's Connect account. Idempotent (Stripe key + DB UPDATE WHERE clause). Pings Winston if a vendor is past the window but Connect not onboarded.

**Beach payouts admin (cde3193).** New `/wheelhouse/beach-payouts` — vendor onboarding status pills, "Text onboarding link" button (Havee voice via SMS), Stripe dashboard login link, manual "Pay now" button per claim. Cookie + bearer auth.

**Revenue stats (0e26d37).** New `/wheelhouse/revenue` — today / 7d / 30d gross, per-vertical breakdown. Sourced from Stripe Charges API (refunded excluded). CT day boundaries.

**Live visitors counter (8f7f204 → 5265754).** Pulsing emerald-dot card on `/wheelhouse` showing real-time count of distinct sessions seen in last 3 min, per-path breakdown. Custom-built session-heartbeat tracking (privacy-clean, sessionStorage tokens, no PII, no 3rd-party). Polls every 15s. **2026-04-29 PM update:** filtered to exclude admin/operator self-traffic — `isAdminTraffic()` checks both wheelhouse_who cookie and /wheelhouse path; either trips skip.

**Marketing Glossary — Collie's workspace (a2b84d9).** Tier 2 build of the parking doc design. Live at `/wheelhouse/glossary` with 17-entry hand-curated seed (transact / editorial / browse / civic / internal). Marketing status pills (active / queued / parked / do-not-surface), free-form annotations Collie can add, accessible up/down reorder arrows. **Collaborator-protected:** the SQL `ON CONFLICT` clause intentionally omits `marketing_status`, `collaborator_notes`, and `display_order` — Claude can never overwrite Collie's work. This is the canonical PAL implementation of the HeyeDeploy "Tenant Collaborator Workspace" template.

**Instant-archive thread model (34a32df + cdfc73d + 2629db8).** Per Winston "cleanest mental model" rule: collapsed "Done → wait 7 days → Archived" to "Done = instant Archive". API auto-coerces `state==='done'` to `'archived'` on PATCH. "Done" button removed from user-clickable transitions; "Archive" is the finishing motion. New "Archived (N)" filter chip with count badge replaces the "Done" chip. Auto-archive cron now backstop only (drops 7-day threshold, fires on any 'done' state). One-shot sweep endpoint migrated 3 legacy 'done' threads.

**Admin analytics filter (5265754).** Per Winston "clear usable analytics — always" rule: 3-layer filter so admin/operator self-traffic never pollutes customer metrics. Client-side (VisitorHeartbeat skip), source (Vercel Analytics beforeSend drops /wheelhouse pageviews), backstop (wheelhouse_analytics_events SQL queries `WHERE path NOT LIKE '/wheelhouse%'`). Real customer pageview count is now visible (was inflated ~20% by /wheelhouse browsing).

**TWO new cross-project principles locked into memory** (`feedback_havee_naming.md` addendums):
1. **Cleanest-mental-model rule** — collapse intermediate states when there's no user value in the middle (e.g., Done → Archived = one motion, not two)
2. **Clear-usable-analytics rule** — admin traffic NEVER pollutes customer metrics; filter at multiple layers (client + source + backstop)

**HeyeDeploy templates locked this PM session** (added to `feedback_heyedeploy_pattern_thinking.md`):
- Tenant Collaborator Workspace (Glossary) — flipped from DESIGNED to LOCKED
- Stripe Connect Express for vendor payouts (mirrors runner pattern, second build inside PAL)
- Auto-payout cron at refund-window-close (couples cancellation policy + payout)
- Admin payouts tool with onboarding-link delivery via SMS
- Revenue stats display per Stripe Charges API
- Live visitors heartbeat (privacy-clean session tracking)
- Instant-archive UX (cleanest-mental-model applied to thread lifecycle)
- Admin traffic 3-layer filter (analytics hygiene)
- Intake-and-surface webhook fallback (route prose to human)
- bookings@ transactional ledger CC pattern

## Current State (as of 2026-04-29 — Twilio A2P-unlocked SMS arc + inline Claude agent + Havee)

The biggest single PAL session yet. Started with the morning Arnold and a Twilio A2P 10DLC verification, ended with a fully-autonomous Claude agent answering insider SMS in real time. **23 commits today** (`74d5a14` through `1ac50d3`). Everything shipped clean on main. Multiple firsts: first real $$ event through the new beach-vendor system ($300 Stephanie S. cabana for May 9), first end-to-end Claude-via-SMS exchange (Patricia text via Collie's request), first multi-turn live conversation between Winston and the autonomous agent.

**🔥 Twilio A2P 10DLC LIVE (campaign C2KO2MB).** Brand approved (BNd603…) + campaign verified at TCR 2026-04-22 + sender +13614281706 attached to Messaging Service MG197b… by me 2026-04-29. Two carrier-confirmed smoke tests delivered. Customer-side SMS surfaces (maintenance, rent, beach, delivery) all now route via the approved campaign automatically — no code change needed, just better delivery vs the silent-filtering pre-cert period.

**Cart vendor SMS opt-in system — full build.**
- `cart_vendor_sms_consents` Postgres table tracks per-vendor opt-in state (pending / opted_in / opted_out)
- `/api/twilio/sms/inbound` webhook parses YES/NO/STOP/CLAIM and flips DB state
- `/wheelhouse/cart-vendors-sms` admin tool — per-vendor invite buttons, manual override, bulk-invite-all-eligible button, status pills (Pending / Opted-in / Opted-out / Landline-only / Manual)
- Bearer token auth (matches wheelhouse.py agent pattern) so CLI ops work too
- Sequential 800ms pacing under AT&T 1.25 mps
- **Bulk-invited 20 cart vendors → 13 delivered, 7 landline (error 30006)**. Then 4 of the 7 had mobile alternates surfaced via scrape + Twilio Lookup line-type intel (Tarpon 988-8161, Island Surf 210-315-5718 ✅, Ocean Carts 217-8490 ✅, Jackfish 339-1089). Production retry showed 2 of 4 actually mobile (Island Surf, Ocean Carts), the other 2 (Tarpon's Worldcall + Jackfish's fixedVoip) bounced 30006 too. **Net: 15 of 20 cart vendors SMS-reachable.** Remaining 5 (Coastal Ed's, Port A Beach Buggies, Tarpon, Jackfish, PA Golf Cart Rental) need owner cell collected via verbal/email ask.
- One inbound STOP processed correctly (Ash Cart Rental → opted_out)
- Lead-blast format chunked into 5 line-spaced blocks per Collie's revisions

**Beach vendor SMS + atomic CLAIM flow — full build.**
- `src/data/beach-vendors.ts`: John Brown (env), Tyler 361-813-6958, Danny Peterson 808-463-5544. All Twilio-Lookup-confirmed mobile.
- `beach_booking_claims` Postgres table; atomic UPDATE WHERE claimed_at IS NULL ensures first-CLAIM-wins under SMS race
- `/api/beach/confirm` fires the blast on every paid booking
- Inbound webhook handles CLAIM intent: matches phone → finds most-recent-unclaimed → atomic claim → notifies all parties (winner gets customer phone, losers get "next one's up", customer gets vendor name)
- **First REAL booking processed end-to-end 2026-04-29 16:32 UTC**: Stephanie S. paid $300 for cabana on May 9. Vendor blast delivered to John+Tyler+Danny ✓. Awaiting CLAIM as of truck.
- v1 deferred: Stripe Connect for vendor payouts (manual for now), stale-booking cron, Wheelhouse admin tool listing recent claims

**Insider SMS bridge — three-layer system.**
- Layer 1: `src/data/insiders.ts` allowlist (Winston/Collie/Nick) + `/api/twilio/sms/inbound` matches insiders FIRST (before vendor matchers) → forwards full message + MMS attachments to admin@theportalocal.com via Resend (`[SMS from <name>]` subject, branded HTML body, base64-encoded media). MMS bug fixed mid-session — Winston's earlier voicemail-screenshot revealed the v1 bridge was dropping attachments.
- Layer 2: `/api/cron/insider-sms-watch` 1-min Vercel cron — polls Twilio for new inbound from insiders, dedupes via `insider_sms_seen` table, fires push SMS to **operator only (Winston)** when Nick/Collie text. **Per Winston's no-cross-coms rule: insiders don't see each other's PAL conversations** — only the operator does. Sender's own messages are tracked but no self-notify.
- Layer 3 (the BIG one): `runInsiderAgent` inline Claude agent (Haiku 4.5). Webhook fires this AWAITED for any insider message. Agent reads message, decides action via tools (reply_to_sender / send_sms_to_third_party / escalate_to_winston), responds in ~3 seconds end-to-end. Multi-turn conversations work (verified live with Winston during shipping).

**Super-admin revenue pings — wired into 6 surfaces.** Cart, beach, delivery, locals-purchase, housekeeping, maintenance-Priority. Format: `PAL 🛺 $135 - Cart rental \n\n 4-pass cart · May 12-16 (5 days) \n\n J. Smith`. All 3 super-admins (Winston, Nick, Collie) get every revenue event. Per-kind opt-out structure ready (currently empty — everyone all-on). **First real fire 2026-04-29 16:32 UTC** on Stephanie's $300 booking — all 3 phones got the $300 ping concurrently with the vendor blast.

**The "Havee" naming convention.** When Collie texted "Claude — I'm going to call you Havee from now on", Winston explained: Havee is what he and Nick have called each other since high school (meaningless catch-all that became their default "you" word), adopted as the cross-Heye-Lab agent name across the family of products (PAL, CrossRef, Sage Em). Agent's system prompt now identifies as Havee and signs as `- Havee` for insider replies. Customer-facing remains entity-only ("— The Port A Local"). Memory captured at `feedback_havee_naming.md`.

**Anthropic API account.** Created today at console.anthropic.com under (Winston's choice of email). Single API key issued (`sk-ant-api03-…2j2fHwAA`), added to Vercel production as `ANTHROPIC_API_KEY` Sensitive. Migration to a dedicated Heye Lab Anthropic account later is a one-line `vercel env add` away — zero code change. Cost ballpark at current insider-SMS volume (~5/day, plus growing): trivial (~$0.05/day, well under the $25/mo cap discussed).

**Cron infrastructure unstuck.** `CRON_SECRET` was missing in Vercel — meaning the existing daily PAL Pulse cron + the council-scrape weekly cron had been silently failing. Generated + added today (with the `--value` flag fix to avoid the trailing-newline bug from the WHEELHOUSE_TOKEN rotation). Daily Pulse fires 8am CT tomorrow (first time in production).

**Live external action items closed today:**
- City Secretary PIA: courtesy replies sent to Faye Nixon on both threads + consolidated PIA resubmission to `parecords@cityofportaransas.org` per § 552.234. Clock starts 2026-04-29; response due ~2026-05-13. Fed straight into the P&Z Capture piece's "wait the 10 days before publishing" gate.
- Mother's Day weekend customer (210-428-1205): texted back from PAL pointing to /beach for cabana booking. Source customer was an MMS voicemail screenshot Winston forwarded — first end-to-end Claude-bridge → action loop.
- Patricia text on Collie's behalf (Collie's request): "Have a good trip, Tricia! - see you back on the island - Port Aransas Local Co." → 361-332-9410, delivered, Collie acked "Great thank you".
- Collie FB post draft (her ask, agent was down at the time): SMS draft + email with primary + 2 alt versions for Mother's Day weekend splash. Sent via Havee voice but pre-agent.

**HeyeDeploy templates locked today (added to feedback_heyedeploy_pattern_thinking.md):**
1. **Vendor SMS opt-in flow + bulk-invite admin tool** (cart-vendor pattern; reusable for any vertical with B2B vendors that need an SMS opt-in record)
2. **Beach-vendor-style atomic CLAIM flow** (one-call-wins race resolution via UPDATE WHERE claimed_at IS NULL)
3. **Insider SMS bridge** (allowlist + email forward + MMS attachment + operator-only cron broadcast)
4. **Super-admin revenue pings** (multi-vertical fan-out with per-recipient per-kind opt-out scaffold)
5. **Inline Claude SMS agent (Havee)** (Haiku 4.5 + tool-use, AWAITED inside webhook to survive Vercel's serverless-background-kill)
6. **Twilio Lookup line-type verification** (always Lookup before adding a number; Worldcall/Charter Fiberlink/etc. classify as mobile/voip but bounce 30006 in production — Lookup is a starting filter not the final word)

## Current State (as of 2026-04-28 PM — push notification portal + alerts unification)

This session was a single focused build: PAL's web push notification system, end-to-end, across every role. Started from "wheelhouse push only fires email" and ended with a complete cross-role push portal — internal ops + every vendor surface + city-wide alerts — plus a unified opt-in pattern that every Heye Lab tenant will inherit. **12 commits in one session** (`6bf95de` through `0c2144e`). All shipped clean on main.

**The push portal — server side:**
- **Generic `push_subscriptions` table** (`src/data/push-subscriptions-store.ts`) — one Postgres table for every subscriber kind: `wheelhouse-participant`, `cart-vendor`, `locals-seller`, `restaurant`, `housekeeping-vendor`, `customer-topic`. Endpoint-keyed (unique device-channel ID), with helpers `upsertSubscription`, `getSubscriptionsFor` (targeted), `getSubscriptionsByKind` (blast), `markPushed`, `deleteSubscription`, `countSubscriptionsFor`.
- **Service worker generalized** (`public/sw.js`, version `pal-push-2`) — single SW handles every PAL push role; click-routing by `payload.url` instead of hard-coded `/deliver/driver`. Reuses existing tab when first path segment matches (so a Wheelhouse notification opens the existing wheelhouse tab, not the runner tab).
- **Per-role push libs** — `src/lib/wheelhousePush.ts` (awaiting:* state transitions), `src/lib/cartVendorPush.ts` (new bookings, blast fan-out), `src/lib/localsSellerPush.ts` (sale closed, targeted to seller's offerId), `src/lib/restaurantPush.ts` (paid order, targeted to restaurantId), `src/lib/emergencyPush.ts` (event + update + site banner, customer-topic fan-out). Same defensive shape every time: try/catch, expired-pruning, mark-pushed, never throws back to caller.

**The push portal — client side:**
- **Reusable `EnablePushButton`** (`src/components/push/EnablePushButton.tsx`) — drop-in client component. Props: `subscriberKind`, `subscriberId`, `compact?`, `dark?`, `enableLabel?`, `onLabel?`. iOS-aware: detects Safari + standalone-mode and shows "Add to Home Screen" guidance when push isn't yet available. Toggle is reversible: tap green pill or button to unsubscribe (calls `pushManager.unsubscribe()` + `/api/push/unsubscribe` → DB row delete keyed on endpoint).
- **Subscribe surfaces shipped:**
  - Wheelhouse header — compact pill, always visible (status indicator, never hides)
  - `/rent/vendor/[slug]/notify` — cart vendors (per-slug page, public, no auth — slug = network membership)
  - `/locals/vendor/[offerId]` — locals sellers, inline card on existing magic-link portal
  - `/deliver/restaurant/[slug]/notify` — restaurants, multi-device kitchen-tablet setup steps
  - `/emergency` — public alerts (customer-topic / "emergencies")
  - **Footer (every PAL page)** — global "Get the call before everyone else" — fireworks/parade routes/emergencies all in one tap

**Wheelhouse navigation rebuilt:**
- New `WheelhouseHeader.tsx` client component replaces inline header. Mirrors site `Navigation.tsx` pattern.
- md+: logo → push pill → Tools dropdown (Alerts section: Site banner / Emergency events; Tools: Payouts / Locals re-fire / Help; ← Back to PAL site) → identity + sign-out
- sm: hamburger drawer with full-height right panel (alerts / tools / PAL site sections, sign out at bottom)
- Both alerts admin surfaces (`/wheelhouse/alerts` + `/wheelhouse/emergency`) were orphaned — now first-class in the nav

**Alerts unified — banner + emergency events share one push pool:**
- `/wheelhouse/alerts` (single banner, info/warning/critical) AND `/wheelhouse/emergency` (multi-update events) BOTH push to `customer-topic / "emergencies"`. One subscription pool — visitors tap once, get the full stream.
- Severity drives lock-screen tone: 🚨 Critical / ⚠️ Advisory / 📍 Port Aransas (info)
- **Pushes ALL severities** (initially gated info out, reframed per Winston's "good stuff too" feedback). Subscribers opted in for the call about fireworks AND evacuations. Alert fatigue resolves via one-tap unsubscribe, not via withholding the push.
- Reframe across all opt-in copy: lead with community benefit ("Get the call before everyone else"), emergencies as backup. Examples cycle through fireworks, parades, graduations, ferry routes, hurricanes — in that order.

**PWA install icon — finally renders:**
- Manifest had only SVG references + a maskable PNG with 6% margin. iOS / Android both showed blank-tile placeholders.
- New `/pwa-icon-512` + `/pwa-icon-192` route handlers + tightened `/apple-icon` — all use a transform-free lighthouse silhouette inlined in `src/lib/pwaLighthouseSvg.ts` (Satori, the next/og renderer, can't parse `rotate(-45)` transforms — first round shipped solid-navy squares because the lighthouse SVG was silently dropped). Solid navy bg + ~22% safe-zone padding for maskable rendering.
- Verified live: 6353 bytes (blank navy round 1) → 8980 bytes (lighthouse renders, round 2).

**Wheelhouse login bug fix:**
- `router.replace()` after cookie-set was sometimes serving cached RSC from pre-login state, bouncing user back to /login. Fixed with `window.location.assign(fromPath)` so middleware sees the new cookie on a fresh request.

**Other tightening:**
- `winstonciv@gmail.com` swapped to `admin@theportalocal.com` in `wheelhousePush.ts` defaults — personal inbox out of automation
- Defensive `w-full` + `overflow-x-hidden` on Wheelhouse page so any future child overflow doesn't make the navy bar look short of the right edge
- VAPID keys (`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY`) confirmed already in Vercel from the runner-push setup 3 days ago — push system was deploy-ready

**End-to-end test passed:**
- Subscribed Winston's device via /wheelhouse "Enable alerts"
- Created test thread `thread-moiyjhcx-rzn9bp` ("Push test — disregard"), bounced through `open` → `awaiting:winston`
- Push delivered + email delivered. Winston confirmed "Received". Thread closed as `done`.

### Addendum — late 2026-04-28: Collie product map + parking docs

After the truck closed, Winston requested a product/feature inventory for Collie to internalize before she builds the marketing plan. Shipped:
- **Markdown source** at `Port A Local/Marketing/PAL Product + Feature Map — for Collie.md` (368 lines, feature-card style — what it is / where it lives / what's notable)
- **Word version** at `Port A Local/Marketing/PAL Product + Feature Map — for Collie.docx` (clean Arial body + Georgia headings + proper bullets — generated via docx-js, not pandoc, so the brand-friendly typography survived)
- **PDF version** at `Port A Local/Marketing/PAL Product + Feature Map — for Collie.pdf` (788KB — generated via `soffice --headless --convert-to pdf`; LibreOffice was newly installed via `brew install --cask libreoffice` and is now the canonical PAL docx→pdf path)
- **Emailed to Collie** from admin@theportalocal.com with PDF attached — voice/sign-off per PAL rules ("— The Port A Local")

**`pal_mail.py` got `--attach`** (commit `42ee607` in workspace repo). Repeatable flag, defensive on missing files. The send command is now `python3 scripts/pal_mail.py send --to X --subject Y --body Z --attach FILE [--attach FILE2]`. First use was Collie's PDF.

**Parking-lot design filed** at `Port A Local/Features/Wheelhouse Glossary — Collie Workspace.md` — a Wheelhouse-native interactive workspace where Collie (and future non-technical collaborators on every Heye Lab project) can see + reorder + annotate + export the live product/feature inventory. Replaces the static-doc-Claude-regenerates pattern with a tenant-collaborator workspace. **Added as a new HeyeDeploy template (DESIGNED, not built) in `feedback_heyedeploy_pattern_thinking.md`**. Pickup-here checklist included; revisit when there's a build window.

## Current State (as of 2026-04-27 — full drill: cascades + discoverability)

This was the day-2 continuation of the marathon (this session itself was a continuation already — first chat ran out of context mid-build on the locals-purchase ledger). Closed the automation + findability gaps Winston flagged after Sprint 3 ("is this completely clickable and findable in the site? — have we automated everything we can with at our current status/pre a2p?"). Two new portals (`/housekeeping` + locals sell-mode) were live but lacked the email cascades and discoverability hooks needed to actually function end-to-end.

**Day-2 morning:**
- **Runner license plate + state field at signup (commit `c5f16d7`).** Required for umbrella liability coverage. `license_plate` + `license_plate_state` columns on `delivery_drivers`. Form has uppercase 10-char plate input + 50-state-plus-territories dropdown defaulting to TX. Note "never shown to customers." Surfaced in admin email for verification.
- **Homepage Why-PAL emoji swap (commit `c5f16d7`).** `🤝` → `<PortalIcon name="handshake">`. Brand-system consistency.
- **Housekeeping portal v1 LIVE (commit `6e13d66` + `cf5f2f6`).** New `/housekeeping` portal with $100/hr, 1-hour minimum, ~1 hr per 1000 sqft pricing. Stripe Checkout up front, admin email on paid. Brand placeholder: **"Local Girls Cleaning"** (PAL-owned shell entity, flagged for Collie review). v1 manual dispatch — Winston coordinates with cleaning team. v2 will fan out to a marketplace (cart-rental pattern). New `housekeeping_bookings` table, `estimateCleaningHours(sqft)` helper, `HOUSEKEEPING_HOURLY_RATE_CENTS = 10000`. Outward-facing scrubbed of "a PAL service" framing per Winston's rule (internal code retains it).
- **Locals sell-mode (Etsy-on-PAL) LIVE (commit `d5df601`, `707970c`, `a2fa829`).** Third listing mode after rent and hire. 5 new categories: art-prints, crafts-handmade, merch-apparel, baked-goods, books-zines. New `priceCents`, `stripeAccountId`, `soldOut`, `fulfillmentNote` on Listing. Buy-now flow: customer fills modal (name/email/phone + optional message) → Stripe Checkout (item + 10% PAL fee as separate line items) → if vendor has Connect account, `transfer_data.destination` moves vendor's amount automatically; if not, PAL holds funds for manual payout. New `BuyNowButton.tsx` modal component. Sell-mode in /locals/offer form too (3-button mode toggle, conditional price + fulfillment-plan fields). 10% flat platform fee customer-pays, vendor keeps 100% of their quote.
- **Cross-project context-handoff protocol filed (`feedback_context_handoff.md`).** Foolproof end-of-session rule — when chat approaches limit, never silently fail; truck + sync mirror + write handoff brief at `Session Notes/handoff-DATE.md`. Applies to PAL, CrossRef, Sage Em, Heye Lab, all future projects. This very handoff is the first execution of the new protocol.
- **"PAL doesn't gatekeep" lifted to north-star principle (`feedback_pal_doesnt_gatekeep.md`, commit `25a616f`).** When deciding whether to require / restrict / filter — default to "let them in." Quality is surfaced (cost of low quality made visible), not enforced. Articulated during the /locals approval-flow build. 7-row pattern table + 5-question application checklist filed.
- **Verify = live, photos = optional optimization (commit `5de4072`).** Locals offer flow: approval makes the listing live; photos are encouraged but not gated. Subject line "You're in" not "You've been verified." Photos = quality-surface (better photos → better conversion) not gate. Direct application of doesn't-gatekeep.
- **CityDeploy positioning lever (memory mirror).** Heye Lab's flagship platform play named: PAL = proof of concept, CityDeploy = the SaaS-ified engine sold to other small/mid towns. "Powered by Heye Lab · Built on CityDeploy" tagline pattern across PAL footers.

**Day-2 afternoon — full drill (commit `134619b`, this session):**
- **Locals sell-mode purchase email cascade.** Critical gap before this: vendors literally didn't know they sold something. Now: new `locals_purchases` ledger (Stripe session ID PK, `emails_sent_at` gate prevents double-fire on refresh). Three emails fire on first load of the buy-success page: vendor "you sold X for $Y, here's how to reach the customer" (with admin@ fallback CC; if `vendorEmail` not on file, routes to admin@ alone with banner asking Winston to forward), customer receipt with what-to-expect (reply-to hello@), admin audit with vendor-routing status flag. Wheelhouse mirror so each sale lands in the activity ticker. New optional `vendorEmail` / `vendorPhone` fields on Listing interface.
- **Housekeeping confirmation cascade.** `sendHousekeepingCustomerEmail` (branded, receipt, reply-to hello@) + `mirrorHousekeepingBookingToWheelhouse` (pinned thread for v1 manual dispatch). Both fire only on the `placed → paid` transition with a 60-second grace window — refresh-safe.
- **Discoverability — `/housekeeping` is now actually findable.** Added to Gully index with `cleaning`/`maid`/`turnover`/`move-out` tags, mobile nav under Services vertical, `/services` landing as 4-portal grid (cart/beach/maintenance/housekeeping), cross-link box on `/maintenance` routing cleaning over, scope-footer cross-link on `/locals`.
- **Earlier failed deploy diagnosed.** Build `4bgrpgtbd` (50m before this session) failed on commit `cf5f2f6` because `body.mode` was widened to `"sell"` but `CreateOfferInput.mode` was still `"rent" | "hire"` in locals-store.ts. Self-healed in next commit `707970c` ("propagate 'sell' ListingMode through locals-store + approve route"). Production has been Ready since. New `134619b` deploy went out clean (Ready in 49s).

**Day-2 PM — Wheelhouse cross-project pattern locked in (commits `0599521` workspace, `05adb17` PAL):**
- **`scripts/wheelhouse.py` auto-loads `workspace/.env`** (mirrors haveebot_mail.py pattern). Lookup chain: process env → workspace/.env → clean error pointing at the right file. Was reading strictly from `os.environ`, which broke in Bash-tool sessions / cron / non-interactive shells. Now the arnold drill's `orient` step works in any context.
- **WHEELHOUSE_TOKEN_WINSTON_CLAUDE rotated end-to-end via CLI** — no manual paste. Generated fresh URL-safe 32-byte token, removed old from Vercel, added new with `--value="$TOKEN" --sensitive --yes`, wrote to workspace/.env, redeployed production, verified `whoami` resolves to `winston-claude`. **Bug filed:** `cat token | vercel env add` preserves trailing newline as literal `\n` in the stored value (caught when first rotation produced 401 even with "matching" token). Use `--value` flag, NOT stdin pipe. Documented in the cross-project pattern.
- **Cross-project Wheelhouse pattern filed (`feedback_wheelhouse_cross_project_pattern.md`).** Wheelhouse will be replicated to every Heye Lab project (CrossRef, Sage Em, future tenants). The pattern doc locks: per-agent Sensitive bearer tokens in Vercel, single `workspace/.env` for the agent CLI across all projects, `WHEELHOUSE_API_URL` override per-project (or inline), one-command rotation flow, and the redeploy-required note for Edge middleware. Validated end-to-end against PAL.
- **Memory mirror updated** — feedback_wheelhouse_cross_project_pattern.md added to sync-memory.sh whitelist; `Port A Local/Memory/` now has 21 files. Same arnold drill, same handoff protocol, same Wheelhouse pattern travel into every future Heye Lab project repo.

## Current State (as of 2026-04-26 evening — Sprints A through F + punch list)

This was a marathon "ship the 10-point list" session on top of the morning's delivery vertical work. All 10 items addressed (most shipped, some filed-as-deferred-design with full notes). 22+ commits in this stretch.

- **Sprint A — name scrubs + footer + custom payouts (commit `7bf52ee`).** Internal code comments scrubbed of vendor names (`John Brown` → `maintenance vendor`); customer-facing surfaces were already clean. `Palm Family Ventures, LLC` removed from Footer + email layout (legal disclosure pages KEEP it — privacy + terms must legally name the operating LLC). New "The Wheelhouse (internal)" link in footer Company column. **Custom Stripe payouts admin tool** at `/wheelhouse/payouts` — cookie-gated on `wheelhouse_who`, two-step pick-then-review form, $1 min / $10K max soft cap, memo field, audit history table. Uses existing `delivery_driver_transfers` with `custom-` prefix on order_id (shared idempotency, no schema fork).
- **Sprint B — Runner ID + Insurance verification (commit `846a4df`).** Two-stage model: applicant ATTESTS at signup (license + insurance + carrier name + commit-to-emailing-photos checkboxes); admin VERIFIES later via magic-link after photos land at hello@. Schema additions: `license_acknowledged`, `insurance_acknowledged`, `insurance_carrier`, `license_verified_at`, `insurance_verified_at`, `verified_by`. New `/api/deliver/runner/verify?d=ID&kind=license|insurance&s=SIG` endpoint with HMAC over `${id}:verify-${kind}` (distinct from approve/reject sig — leaked approve link can't be replayed against verify). Idempotent. Form copy stays "we ask"/"we encourage" never "you must" — preserves gig-worker boundary.
- **Sprint C — Public Runner Leaderboard at `/deliver/runners` + homepage tile (commit `26795e5`).** Full hero + stats strip (active runners / today / 7d / all-time) + ranked board + 3-step "How driving for PAL works" + apply CTA. New `getLeaderboard()` aggregator (today / 7d / all-time, Central-time midnight boundary matching the runner feed). Cold-start safe — empty board shows "be the first" recruiting card. Homepage `RunnerLeaderboardTile` between FeaturedEventBanner and Gully — server component, returns null if zero runners. **Anonymized to "Driver #N" (commit `846a4df`)** — `ROW_NUMBER() OVER (ORDER BY applied_at)` across ALL drivers (active + rejected) so a rejected runner reserves their slot forever, no reuse, stable internal-tracking shorthand.
- **Sprint D — Wheelhouse Craigslist landing (commit `8f72b9a`).** "Want in?" block below the sign-in form: "Local. Think you can contribute to PAL? Send a note. We read every one. Most don't make it through. We like it that way." Single mailto link to hello@. **No portal. No application form. Just an inbox.** Matches Winston's "we remain Craigslist" framing.
- **Sprint E — Heye Lab memory mirror (commit `8f72b9a`).** New `scripts/sync-memory.sh` whitelist-syncs PAL/Heye Lab memory files into `Port A Local/Memory/` (17 files initially mirrored). Excludes personal stuff (user_winston, Sage Em / CrossRef projects, auth-sensitive references). Nick can now mine PAL patterns from the repo without needing access to Winston's machine. Workflow: run script at session-end, commit, push. One-way mirror — edit source memory, not the destination.
- **Sprint F — Convenience-store deliveries (commit `b586aeb`, `a85fc95`).** First convenience store live: **Lowe's Market — Port Aransas**. 12 essentials catalog across 4 categories (Snacks · Drinks · Beach Day · Paper & Cleaning) at 20% loss-leader markup vs restaurants at 45%. Same Stripe + runner + dispatch + payout machinery — zero new infra. New `kind: "restaurant" | "store"` field on `DeliveryRestaurant` (defaults to restaurant for backcompat). New "Convenience runs" section on `/deliver` — emerald accent, "Beach-day essentials" framing. ⚠️ Address `611 N Alister St` + phone `(361) 749-6602` + 7am-10pm hours are best-guesses — Winston needs to verify on first run, flag any drift.
- **Punch list batch (commit `a85fc95`, `0925f3d`).** Gully now indexes PAL revenue surfaces + delivery vendors (new `portal` + `delivery-vendor` types) — search "delivery" / "rentals" / "kayak" / "essentials" surfaces actual portals and vendors not just directory listings. **Carts verbiage cleanup**: removed "Full refund if we're unable to fulfill" mentions; hero leads with "$10/day reservation fee · pickup or delivery, your call" (was "vendor's call"). New **Handoff radio toggle** on /rent form ("Delivered to me" / "I'll pick up") — defaults to delivery, vendor blast filters to vendors who can fulfill the chosen handoff. Two more John mentions scrubbed (`/locals` and `/locals/offer` pages I'd missed in the original sweep). Filed `Port A Local/Features/Rentals + Services Scope Expansion — Notes.md` as deferred-design doc.
- **PAL Locals — photo attestation (commit `823a86c`).** Front half of #3 from Winston's list. Email-photo flow (Path B) on `/locals/offer` for rent listings. Required attestation checkbox + coral callout. Smart mailto link with auto-prefilled subject. Hire-mode (skills) listings stay photo-optional. Same low-friction "photo to feature" pattern as runner verification + Live Music intake — no Vercel Blob setup tax.
- **PAL Locals — fee clarity (commit `85bd891`, `1609ed5`).** Reframed the "no fee until you make money" copy that implied PAL charges vendors. Locked in the actual model: **10% flat platform fee, ALWAYS paid by the customer on top, NEVER deducted from the local's quote.** Three spots updated (OG image, page subtitle, Step 4 in How-it-works). New "What the customer sees" callout under How-it-works showing concrete fee table for $200 example. Same model now consistent across PAL: customers carry the platform's economics on every vertical.
- **CityDeploy naming locked in (commit `9b6f20a`, `29952cd`).** Heye Lab's flagship platform play named: **CityDeploy** (a.k.a. "City Deployment"). PAL = proof of concept; CityDeploy = the SaaS-ified engine sold to other small/mid towns. Tagline pattern **"Powered by Heye Lab · Built on CityDeploy"** now on every PAL page footer. Full vision doc at `Port A Local/Memory/CityDeploy — Platform Vision.md` — feature inventory, audit map for Nick's mining work, pickup-here checklist.
- **Customer order tracking — live (commit `9b6f20a`).** `/deliver/success/[orderId]` now polls every 20s with a 4-stage progress bar (Paid → Driver heading to pickup → Out for delivery → Delivered). Coral-pulsing ring on current stage · emerald checkmark on done stages · per-stage timestamps · "Live · Updating" indicator. Anonymized runner display once claimed: **"Driver #N · 2018 Ford Ranger"** (consistent with leaderboard anonymization). "Thanks for ordering local" celebration on delivered. GET `/api/deliver/order/[id]/status` extended to return runner info `{ signupNumber, vehicle }`. Customers now get an Uber-grade tracking experience.
- **$5 first-delivery bonus + rewards ladder (commit `213d998`).** **TIER 1 LIVE** — auto-fires via Stripe Connect on first delivered order, idempotent (synthetic order_id `bonus-first-{driverId}`). Skips silently if runner not yet payouts-enabled — Winston backfills via custom payouts admin. **Marketing surfaces:** homepage tile + `/deliver/runners` hero + `/deliver/runner` application page all show "+ $5 welcome bonus on your first delivery." **Runner hub Rewards ladder** — full 4-tier visualization with progress bars: $5 first-delivery (Live/Earned), $25 + shirt at 10 (Coming soon), $100 at 50 (Coming soon), Apple Watch at 250 (Coming soon). **Public leaderboard** — small "+$5" emerald badge next to runners who earned it. Higher-tier rewards deferred per Winston ("flag to revisit all") — design doc filed at `Port A Local/Features/Runner Rewards Program — Design.md`.
- **Order modification + runner ↔ customer comms — design filed (commit `213d998`).** Winston flagged real-world scenario: items unavailable, substitutions, price up/down, runner-customer texting. Three-option design doc at `Port A Local/Features/Order Modification + Runner-Customer Comms — Design.md`. Phase 1 (next sprint): direct phone-to-phone + refund-only adjust. Phase 2: Twilio proxy numbers + saved-card setup intent for upcharges. Phase 3: in-app messaging if needed.
- **Wheelhouse login defensive trim (commit `29952cd`).** Same Vercel-env-with-trailing-newline failure mode that burned us on STRIPE_SECRET_KEY. Login route now `.trim()`s both sides at compare time. Plus side-channel-safe debug log on mismatch (logs LENGTHS only, never values) for future diagnosis. Winston was hitting this exact bug — paste from 1Password / Notes / Drive includes a hidden `\n` that Vercel saves as-is.

## Current State (as of 2026-04-26 morning) — PAL Delivery (NEW VERTICAL, LIVE WITH REAL $$)

- **PAL Delivery LIVE — `/deliver`.** Real-time food-delivery marketplace for Port Aransas. Customer orders → Stripe pays → on-duty runners get pinged → first to claim wins → runner picks up + drops off → PAL auto-transfers payout to runner's connected Stripe account. First real-money order shipped 2026-04-25 ($28.87 from DQ). Two restaurants live: Crazy Cajun + Dairy Queen Port A. **Full feature spec: `Port A Local/Features/Delivery — Spec.md` — read this before touching delivery code.**
- **Stripe Connect Express LIVE for runners.** Auto-onboarding via `/api/deliver/driver/connect/start` (creates `accounts.create` Express account + `accountLinks.create` for Stripe-hosted onboarding form). On delivery → `stripe.transfers.create` moves funds from PAL balance → runner's Connect balance. Default daily auto-payouts to runner's bank (Stripe default; first payout has 7–14 day fraud hold for new accounts, then daily rolling). Idempotency table `delivery_driver_transfers` blocks duplicate payouts per order. Stripe Issuing deferred 30+ days (need Connect volume history first).
- **Cookie-session runner auth.** `pal_runner` cookie (httpOnly, sameSite=lax, 30-day) replaces token-in-URL for all runner-facing surfaces. Magic link on first sign-in (`/api/deliver/driver/login?t=TOKEN&next=...`) trades token for cookie. Token-in-URL still works as fallback for self-recovery (`/deliver/driver/lookup` emails fresh magic link). "What would Uber do" framing — frictionless, bookmark-able, no token visible after first tap.
- **Runner hub at `/deliver/driver` (NEW 2026-04-25, expanded 2026-04-26).** Cookie-gated client component `RunnerHub.tsx` with 20s polling. Big on-duty toggle (auto-off in 4h), payouts setup nudge if Connect not done, 3-stat earnings panel (today/7-day/available), in-progress orders, available-now feed with inline claim, sign-out. **NEW 2026-04-26: "View Stripe payouts dashboard →" button** appears once payouts are enabled — opens runner's Express dashboard via `stripe.accounts.createLoginLink` (one-time URL, single-use, opens in new tab so PAL session stays put). From there runners see balance, payout schedule, instant-payout option (1.5% fee), bank info.
- **Runner onboarding pipeline LIVE.** `/deliver/runner` application form → DB row in `delivery_drivers` (status=`pending`) → duplicate-phone guard returns 409 with state-aware message (`already-active`/`pending-review`/`previously-rejected`) → applicant confirmation email + admin email with HMAC-signed magic links (`ADMIN_APPROVAL_SECRET`) → Winston taps Approve → status → `active` → welcome email → cookie session → done.
- **Customer comms: belt-and-suspenders (SMS + email) on every transition.** Customer gets confirmation email at paid + picked-up email + delivered email. SMS gated on consent checkbox + A2P 10DLC clearance (best-effort pre-clearance). Admin email moved from order-create to post-payment-success — kills phantom-order admin spam from abandoned carts.
- **Anti-spam email tuning.** Plain ASCII subjects (no emoji), `X-Entity-Ref-ID: pal-deliver-dispatch` header, `reply_to: hello@theportalocal.com`. Helps Gmail bucket as transactional. Domain already verified in Resend (SPF/DKIM/DMARC clean).
- **Wheelhouse mirror.** Every order lifecycle event posts an `update` (or `decision` for delivered) message into pinned "PAL Deliveries — order log" thread (tag: `deliveries`). Activity ticker surfaces them automatically.
- **Runner-side terminal-state UX (NEW 2026-04-26).** Order detail page (`DriverActions.tsx`) shows "← Back to runner home" button on delivered, canceled/refunded, and already-claimed-by-another-runner states. Delivered copy clarifies "Payout hits your bank in 1-2 business days. Stripe handles it automatically."
- **Pricing constants:** `DELIVERY_FEE_CENTS=500`, `SERVICE_FEE_CENTS=200`, `TAX_RATE=0.0825`, restaurant `markupPct=45%` (resort-town pricing). Splits: runner gets 50% markup + 50% delivery + 100% tip. PAL keeps 50% markup + 50% delivery + 100% service fee + tax.
- **PAL hard cutoff at 21:00 Central** for accepting orders (regardless of restaurant hours). Each restaurant has independent hours (Crazy Cajun closed Mondays, dinner-only weekdays, weekend 12pm; DQ daily 10am-9pm). `getRestaurantById()` resolves by id (not slug — DQ has id="dq-port-a" slug="dairy-queen", was the source of a bug 2026-04-25).
- **`getDeliverStripeKey()` defensive `.trim()`.** A trailing newline in `STRIPE_SECRET_KEY` env var burned a session 2026-04-25 (`ERR_INVALID_CHAR` 500s). Now always trimmed. Set this pattern as the default for any Stripe key reads.
- **Runner pool: 1 (Winston).** Onboarding pipeline + Stripe Connect onboarding both validated end-to-end with real bank. Need humans next.

## Current State (as of 2026-04-25)

- **The Wheelhouse — internal ops dashboard (NEW 2026-04-25, LIVE).** Cookie-gated for humans + token-gated for agents at `/wheelhouse`. Four interlocking systems: (1) threads/messages with state machine, (2) 24h activity ticker (`ActivityFeed.tsx`, default-collapsed, summary line shows freshest event inline), (3) PalStats public-traffic card fed by Vercel Web Analytics Drain → `/api/wheelhouse/analytics-ingest` (HMAC-SHA1 verified) → `wheelhouse_analytics_events` table (self-bootstraps schema on first ingest), (4) PAL Pulse — Vercel Cron at 8am CT generates a markdown digest combining internal + external + per-human-awaiting and posts as an `update` message into a pinned "PAL Pulse" thread. Drain destination MUST use apex URL (`theportalocal.com`, not `www`) — the www→apex 307 redirect breaks signed payloads. **Full architecture doc: `Port A Local/Features/Wheelhouse Architecture.md`** — read this before touching Wheelhouse code.
- **Events architecture: per-event hub pages (NEW 2026-04-25)** — `src/data/events.ts` + `src/data/event-content.ts` + `src/app/events/[slug]/page.tsx` mirroring the dispatches pattern. Events index entries opt into a detail page via the `detailSlug` field; without it they stay as a one-line month entry. EventSchema (schema.org/Event) added to StructuredData.tsx for Google event rich results. Per-event branded OG card. Sitemap includes event slugs at priority 0.85, daily change frequency.
- **EventCountdown** (live-updating client component): days/hr/min/sec; flips to "Happening now" with pulsing dot mid-event; "Wrapped" after end. Used in event hero + homepage banner + events index.
- **FeaturedEventBanner on homepage** (between Hero and Gully) — auto-picks soonest featured event; returns null off-season.
- **Coming Up Next tile on /events index** — surfaces soonest event from both events.ts AND inline monthly events (`nextDateISO` field added to inline events for sorting). Detail-page events take precedence on slug match.
- **EventOrganizerClaim CTA** on every event page — collapsed → expanded form with name/email/role(7 options)/message → POST to `/api/events/claim` (mirrors dispatch tip pattern, Resend to admin@ + hello@). Operationalizes "do it anyway, force them to come to us" — organizer always has a frictionless professional channel.
- **Tournament-coverage stack (NEW 2026-04-25, LIVE)** — `src/data/tournament-results.ts` data layer + 8 components in `src/components/tournament/`:
  - `LeaderboardTable` — billfish.com-style per-division table; desktop tabular + mobile stacked; top-5 with show-all expand; coral row highlight + #1 marker for leader; "Live" pulsing dot; "Unofficial" amber badge; empty state until weigh-ins start
  - `DivisionsPanel` — clean grid card per division, scoring mode badge (Heaviest/Longest/Most Released), expandable rules
  - `CaptainSpotlight` — "boats to watch" card, photo slot, bio paragraphs, divisions, prior wins
  - `PiggyPerchHighlight` — special section for kids' contest, coral gradient, 4 award tiles
  - `TournamentRulesPanel` — editorial rules summary + prominent "Official rules →" CTA + per-division collapsibles + past-editions archive + crowd-source footer
  - `PastChampionsBoard` — grouped by year, per-entry source citations, crowd-source footer ("send us missing years")
  - `HistoricalPhotosShelf` — references existing archives.ts photo IDs (single source of truth, no duplication); per-photo caption/year override; "See full archive" links to /archives
  - `MilestonesPanel` — verified-facts grid (year/label/value/detail). Speculative records belong in crowd-source pipeline, not here.
  - `liveLog` extended with `kind: "weigh-in"` + structured `weighIn` field (renderer wires when needed)
- **Event-level reusable components (NEW 2026-04-25, LIVE):**
  - `CharityCallout` — purple-bordered card for events with a beneficiary; pull-quote leads, mission paragraph, stat strip, "About" + "Donate directly" actions, transparency note. Renders prominently after the lede when `event.charity` is set.
  - `MerchSpotlight` — for events where merch is part of the cultural footprint (TWAT shirts, future Sandfest gear, etc.). Editorial in tone — doesn't host or sell. Concert/Masters-merch framing. Optional storeUrl (omit when scarcity is the story); always has a "Send a sighting photo" CTA.
- **Deep Sea Roundup 2026 LIVE** — `/events/deep-sea-roundup-2026`. 90th annual, July 9–12, 2026. Lede anchored on Barney Farley + 1932 Tarpon Rodeo (Collie's grandfather). Full pre-event content. 6 divisions populated (Bay-Surf, Offshore, Flyfishing, Kayaking, Tarpon Release, Billfish Release). Special awards (Top Woman Angler, Junior). Piggy Perch with 4 award categories. Rules panel with universal + per-division. Past champions stub: 2024 (Adair Bates Bay GC, Charley Hicks Jr Offshore GC, Hannah Barnwell 1st Red Snapper) + foundational (1934 Dorothy Fair, 1932 North Millican). Historical photos (5) referenced from archives.ts: c.1900 Tarpon launches, c.1910 Ayres rowboat, 1911-24 Tarpon Inn, 1939 fish house, 2007 Tarpon Inn modern. Milestones panel (6 verified): 1932 inaugural, 1934 first woman champion, 1942-45 WWII pause, 2020 COVID pause, 90 editions by 2026, Boatmen Inc. continuous. Captains array empty (no outreach per strategy). Featured = true.
- **TWAT 2026 LIVE** — `/events/texas-women-anglers-tournament-2026`. Texas Women Anglers Tournament, women-only, family-run since 1984 by Pete Fox. Late August 2026 (tentative Aug 21-23 pending official). **4 divisions (Billfish/Dolphin/Tuna/Wahoo) — offshore-only.** Scoring: billfish points + 1 pt/lb across the other three. Charity callout for The Purple Door (formerly Women's Shelter of South Texas) — $130,000+ raised across 40+ years. Pete Fox HOF 2021; Fox family runs it today; Chris Fox operates Fox Yacht Sales (203 W Cotter Ave). **M.L. Walker Perpetual Trophy** named correctly as the top award. 7 past champions populated 2020-2025 (incl. 2020 Rebecca through-COVID + 2024 Instigator + 2024 Penny Slingerland Legacy Award). Spectacle copy includes harbor-circle / mariachi-on-the-bridge / multi-million-dollar-yacht / Mardi Gras-cheering / no-online-store-merch / "Especially for daughters" beats. Sip Yard scrubbed — reception venue intentionally agnostic. Host card removed — Fox Yacht Sales context lives in hostBlurb prose. Featured = true; takes over after DSR rolls past July 12.
- **Tournament Season hub LIVE (NEW 2026-04-25)** — `/events/tournament-season`. Local handle for PA's summer fishing-tournament cluster (May–November, 20+ tournaments, 4 marquee weekends July-August). Full hub page with hero, history blurb (1932→1984→2010s→today), 4 marquee tournament summary cards, at-a-glance comparison table (8 attribute rows), "How to plan a Tournament Season weekend" visitor-oriented practical, sources. Data layer at `src/data/tournament-season.ts` has 4 members: DSR (1932/Boatmen Inc.), Pachanga (~2018/Harte Research+PA Scholarship/40-boat-cap), Texas Legends Billfish (~2010/Triple Crown leg/$800K+ purse), TWAT (1984/Fox family/Purple Door). Pachanga + Texas Legends are stubs; full hubs come when same treatment as DSR/TWAT. `isInTournamentSeason(slug)` helper drives auto cross-link banner from each event detail page. /events index has coral callout banner above monthly timeline.
- **Spring Kite Festival 2026 hub LIVE** — `/events/spring-kite-festival-2026`. Built as Winston's "demo for Collie to pitch the Timms with" (haveebot uid 159, 2026-04-25). Page has hero with countdown, schedule (Fri/Sat/Sun), good-to-know grid (parking permit, no vendors, BYOK), day-of liveblog scaffold, FAQ, host card linking to Fly It Port A, calendar add (Google + .ics), Open in Maps, source citations. Ready for May 9. Awaiting Collie outreach to Jeremy & Courtney Timms.
- **Fly It Port A ownership corrected** — directory listing previously said "Pyle family has owned the shop since 1991" (stale — they sold in 2022). Now reflects: Yocum (1985 founder) → Pyles (1991, 31-year run) → Timms (July 2022). Tagline updated to call out the festival hosting.
- **Pitch ammo for Collie at vault path** — `Port A Local/Marketing/Outreach — Fly It Spring Kite Festival.md`. Three pitch versions (text, email, in-person), objection prep, day-of plan, post-yes next-steps. Outreach Tracker has a new 🟠 row for Fly It.
- **Tournament Coverage Spec at vault path** — `Port A Local/Features/Tournament Coverage — Spec.md`. Full strategic doc on the events-as-wedge play. Anchor: DSR. Templates to TWAT + Texas Legends.
- **Dispatch piece queued: "The Fishing Tournament That's Not Like the Others"** at `Port A Local/Dispatch Research/TWAT — Not Like the Others.md`. Full angle, structure, sources to verify, voice notes. Compares DSR / Texas Legends / TWAT side-by-side; thesis: most tournaments are about the prize, TWAT is about the after. Don't write yet — triggers: Texas Legends hub built, news hook, or Collie surfacing a Fox-family angle.
- **Dispatch idea queued for discussion: User-Submission Pipeline** at `Port A Local/Dispatch Research/User-Submitted Dispatch Pipeline — Idea.md`. Winston's idea (2026-04-25) — Dispatch articles all come from user recommendations: submit topic → auto-reply → we review → if used, email back the link. Doc captures Winston's framing + tradeoffs + 3 decisions to make first (hybrid vs. pure submission-driven; silent vs. acknowledged rejection; tracking infra level). Not building yet — discuss first. NOTE: built and live as of 2026-04-25 with Winston's three answers (hybrid · silent always · minimal tracking). See /dispatch.
- **Dispatch piece queued: "Women Fishing Take Over"** at `Port A Local/Dispatch Research/Women Fishing Take Over — Idea.md`. National-scale piece on the rise of women-only fishing tournaments with TWAT (1984) as the matriarch of the category. Different angle from the other queued TWAT-adjacent piece ("Not Like the Others" compares TWAT to *other Port A tournaments*; this one compares TWAT to *other women-only tournaments nationally*). Don't write yet — triggers: Port-A comparison piece ships first, full list of contemporary women-only tournaments compiled, possible Aly-Fox-via-Collie warm intro for genealogy section.
- **Fox family — confirmed deep Port A roots (private context, NEVER in published copy):** Pete Fox founded TWAT (1984) + Marine Surveyors + Fox Yacht Sales. Chris Fox runs Fox Yacht Sales today (203 W Cotter Ave, in PAL directory at /shop/fox-yacht-sales). **Shana Fox** (Chris's wife) is heavily involved in TWAT operations. Collie is dear friends with **Aly Fox** (Chris and Shana's daughter). Both relationships stay out of published copy per Winston (2026-04-25 session) but warm any future direct conversation with the family. Likely forward path for the TWAT page review: Winston → Collie → Aly + Shana.

## Current State (as of 2026-04-24)

- **Live Music** — new `/live-music` route. Weekly refresh workflow: Winston or Collie emails the South Jetty's "Live Music Tonight" photo to haveebot (subject `Live Music — Week of MMM DD`), Claude OCRs via vision, transcribes, ships. PA-only scope (mainland Corpus/Portland/Fulton filtered). Tonight hero + rest-of-week grid + upcoming. Venue cross-links to directory. Source photo archived at `Port A Local/Winston Inbox/<date>-uid<n>/`. ISR revalidate=3600. 25 acts / 7 PA venues in the first drop (2026-04-23).
- **Brand kit page** at `/brand` (noindex) — internal reference. Full palette + 4 lighthouse detail levels with download links + 9 directory icons (plug-and-play SVGs at `/icons/directory/`) + full 46-icon library + typography (Playfair Display + Inter) + 7-tagline bank + voice guide (sound like / don't) + positioning pillars + icon system rules.
- **Collie lighthouse v2 (2026-04-24)** — entire identity re-anchored on her design. `public/logos/lighthouse-{full,standard,simple,icon}.svg` + `src/components/brand/LighthouseMark.tsx` + `src/app/icon.svg` all rewritten. Propagates automatically through 17+ OG cards + 6 transactional emails + FB profile/banner + print QR posters + nav + footer + hero + 404 + Apple touch + PWA. Site now matches Collie's FB posts (drift resolved). Variants: dark (navy on light), light (sand on dark), coral (accent). Detail levels preserved.
- **Round 1 icons v2 (2026-04-24)** — 9 directory + portal icons (eat/drink/stay/do/fish/shop/beach/maintenance/cart) rewritten with Collie's Illustrator SVGs. Canva version had distortion; these are clean. `viewBox="0 0 128 128"` per-icon, `fill="currentColor"` inheritance preserved.
- **Marketing operations** at `Port A Local/Marketing/` (vault) — Content Calendar (4 weeks, Phase 1→2), Caption Library (18 starter captions in PAL voice), Outreach Tracker (press/businesses/orgs), Targets (phase-gated goals + weekly dashboard template), README. Built from Collie's Trust→Habit→Conversion launch plan (PDF archived 2026-04-24-uid156).
- **Photo-driven intake workflow PROVEN** — Winston→haveebot→Live Music, and Collie→haveebot→icons+lighthouse+brand+marketing. `scripts/haveebot_mail.py attachments <uid> [--out DIR]` is the durable tool. See `feedback_pal_photo_to_feature.md`.
- **Heritage #19 — The Red Snapper Fleet (shipped 2026-04-24, commit `abcb095`)** — 10 sections, ~2,800 words. Thesis: adaptation, not dominance. Pensacola was the Gulf snapper capital, not Port A. Arc: 1888 narrow-gauge → 1971 peak → 1989 TED blockade → 1990 51/49 split → 2007 IFQ → Amendment 40 → modern charter fleet. 20 source citations. Heritage total = **24 published pieces**.
- **PA Property Taxes Dispatch IN FLIGHT (2026-04-24)** — Winston brief (uid 157+158): hot topic, ties to Robin Hood / school tax. Facts-only research run, fact base committed (`264fa1e`) at `Port A Local/Dispatch Research/PA Property Tax — Fact Base 2026-04-24.md`. Headline: PAISD IS a Chapter 49 recapture donor, $16.3M (2019-20) → $28.8M (2023-24). Superintendent McKinney on the record (South Jetty Oct 2022): "The majority of the taxes you pay to PAISD are not actually used for the education of children enrolled here in Port Aransas ISD." 89th Lege passed $10B relief package but Chapter 49 reform did NOT pass. **Awaiting:** Winston news-hook + Collie local prompting before angle lock (grievance / explainer / anchored-to-a-person all viable). New `Port A Local/Dispatch Research/` vault folder parallels `Heritage Research/`.
- **Email threading discipline (saved 2026-04-24)** — reply in-thread by default, keep subject line intact across replies, don't start new threads for follow-ups. See `feedback_pal_email_threading.md`.
- **Don't manufacture Dispatch angles (saved 2026-04-24)** — Dispatch comes from Winston's actual briefs, not from pattern-matching whatever Heritage piece I just shipped. Don't park research from misdirected angles. When inbox has unread mail, read it FIRST before inferring the current task. See `feedback_pal_no_manufactured_dispatch.md`. (Triggered by a snapper-Dispatch wrong-turn this session — corrected via TaskStop + correction email.)

## Current State (as of 2026-04-15)

- **140+ businesses, 6 directory categories** (Eat, Drink, Stay, Do, Fish, Shop)
- **3 revenue portals** live: `/rent`, `/beach`, `/maintenance`
- **Services page** built out — portal callouts at top, directory listings below
- **Gully** — "Just Gully It" branded search engine. Unified Fuse.js index searches 140+ businesses (tags, menus, descriptions) + 21 heritage stories + dispatches. Cmd+K palette on every page, recent searches (localStorage), popular chips. Dedicated homepage section. Nav search pill. ~405 menu items indexed.
- **Port A Heritage** — 22 published long-form heritage pieces, complete editorial content layer. No other website covers this content. First-ever organized digital history of Port Aransas. (Titles 1–17 listed below; 4 added after 2026-04-12; **#22 "The Card Table That Built Texas Sandfest" added 2026-04-15** — verify from `src/data/stories.ts` when referencing specific titles.)
- **Port A Dispatch** (NEW 2026-04-14) — standalone editorial/journalism section at `/dispatch`. Distinct from Heritage (preserved history). Current-events analysis, investigation, opinion. NewsArticle JSON-LD schema, dated bylines, signature seal footer on each piece. First piece live: **"The Two Port Aransases"** — Tourism Bureau vs. in-town economic reality; Sonic closure, Cinnamon Shore/Palmilla/Sunflower Beach as 30A template (Mark Schnell), sales tax vs HOT tax divergence, PAISD flat enrollment. 2,050 words, fully sourced. See `feedback_pal_dispatch_workflow.md` for the 6-step editorial pattern.
- **Full brand system (NEW 2026-04-14)** — official **Lighthouse mark** (inspired by the Lydia Ann) as PAL identity. One `LighthouseMark` component with 4 detail levels:
  - `full` — beam rays, finial, windows, 3-panel shading. Hero, OG, watermark (128px+).
  - `standard` — default. Nav, dispatch footer, 40–96px.
  - `simple` — flat silhouette + coral light. Print, mobile (32–48px).
  - `icon` — pure silhouette. Favicon, buttons, inline (12–32px).
  - `monochrome` prop for single-ink prints / merch when needed.
  - Static SVGs at `public/logos/lighthouse-{full,standard,simple,icon}.svg`.
- **Full-site brand saturation (NEW 2026-04-14)** — every surface carries PAL identity:
  - Favicon (icon.svg) + Apple touch icon (apple-icon.tsx PNG)
  - Organization JSON-LD + WebSite JSON-LD in root layout (Google logo in knowledge panel)
  - PWA manifest (standalone, PAL icons, navy theme, "Add to Home Screen")
  - metadataBase + title template `%s | Port A Local`, canonical URLs, themeColor meta
  - Homepage hero: 620px lighthouse watermark + 14px icon in badge + coordinates
  - Footer: lighthouse lockup, 420px corner watermark, coordinates masthead strip (27°50′N · 97°03′W · Mustang Island · Est. 2026 · Palm Family Ventures, LLC)
  - Nav: lighthouse beside wordmark on every page, subtle hover rotation
  - 404 page: 80px foreground lighthouse + 560px watermark, "Off the Chart", Gully It CTA
  - **OG share cards on 17+ routes** via shared `brandedOG` helper (`src/lib/brandedOG.tsx`): home, dispatch index/article, heritage index/article, events, essentials, live, fishing-report, where-to-stay, map, archives, photos, gully, my-trip, guides, services, rent, beach, maintenance.
  - **Branded transactional emails** via shared `emailLayout` helper (`src/lib/emailLayout.ts`): beach/rent/maintenance request + paid confirmations, priority dispatch, suggestion admin alerts. All carry lighthouse header, accent bar, coordinates footer.
- **Social media export routes (NEW 2026-04-15)** — dynamic PNG assets at `/social/*` generated via `ImageResponse`. Right-click-save from the URL.
  - `/social/facebook-profile` — 1000×1000 PNG. Lighthouse (`standard` detail, light variant) centered on navy. Circle-crop safe for FB's 170×170 desktop / 128×128 mobile display.
  - `/social/facebook-banner` — 1640×624 PNG. 1939 Russell Lee FSA photo of the "STRADDLE THE RAIL AND KEEP ASTRIDE — HARBOR ISLAND CAUSEWAY CO." sign (LOC, public domain) centered on navy with ~371px bleed each side. Sign fully visible on desktop AND inside FB's ~1110w mobile safe zone. No brand overlay — profile picture carries the brand; banner is pure heritage imagery.
  - Source photo saved at `public/archives/causeway-sign-1939.jpg` (237 KB, 1024×712 native).
  - `loadLighthouseLight()` runtime helper retints the dark-variant static SVG to light-variant (navy→sand, med-navy→tan, sand→navy) via tokenized string swap. Inlined per route for now — promote to `src/lib/` if reused more than twice. Pattern extensible to Twitter, Instagram, LinkedIn — same `/social/[platform]-[asset]/route.tsx` convention.
- **The anti-Bureau positioning** — established in Dispatch #1 and visually reinforced through the brand: serif weight, navy+coral (not aqua/yellow), coordinates (not city name), journalistic voice. PAL is positioned as the media/editorial counter-narrative to the Port Aransas Tourism Bureau's "Island Life / Beach Nation" destination marketing.
- **Curated Guides** — 10 guides (Happy Hour, Pet-Friendly, Date Night, Seafood, etc.) auto-populated from tags
- **Trip Planner** — Save/bookmark businesses + stories to My Trip (localStorage, no login)
- **Interactive Map** — 127 businesses with real geocoded coordinates, Leaflet + OpenStreetMap
- **Island Pulse** — 10 webcams, MarineTraffic ship map, native NOAA weather/tide dashboard
- **Island Essentials** — 10-section arrival guide (ferry, beach rules, parking, emergency, etc.)
- **Events & Happenings** — 15 annual events + 4 recurring, organized by month
- **Fishing Report** — seasonal species, fishing types, TPWD regulations, live conditions, captain report links
- **Where to Stay** — neighborhood guide (Downtown, Beachfront, Mid-Island, RV/Camping) — Cinnamon Shore section removed per PUD rule 2026-04-15
- **Historical Archives** — 31 public domain photos spanning 1853-2017, from LOC, NARA, NOAA, NASA, UTSA, Wikimedia (largest organized PA digital photo collection online)
- **Community Photos** — "Port A Through Your Eyes" gallery with anonymous submissions
- **Know This Place** — anonymous tag suggestion on every listing, admin review queue
- **Nav** — Explore dropdown (what to DO) + Discover dropdown (what to KNOW), all 15+ pages accessible in 1 click
- **SEO** — complete: meta tags on every page, JSON-LD (WebSite, LocalBusiness, Article), OG images for heritage, sitemap 175+ URLs
- **Stripe** fully integrated across all 3 portals — test keys in place, swap to live keys when PAL Stripe account is ready
- **Domain:** theportalocal.com (primary). Originally purchased as portaransaslocal.com via Vercel (Cloudflare backend, WHOIS privacy free); rebranded to theportalocal.com.
- **Deployment:** Vercel — green, all builds passing, 30 commits on Apr 12

## Port A Heritage (renamed from "Island Stories" on 2026-04-12)

**Why the rename:** "Stories" was ambiguous — could read as blog posts or news. "Port A Heritage" anchors the section as preserved local history, on brand. URL stays `/history` for SEO ("port aransas history" captures search traffic).

### What's Built
- `/history` landing page with story cards, visual timeline (~2000 BC to 2026), "Share Your History" CTA
- `/history/[slug]` dynamic route — long-form editorial with drop-cap ledes, structured sections, pull quotes, fact sidebars, collapsible source citations, "Visit Today" recommendations, **Related Heritage** cross-links, prev/next navigation
- `stories.ts` — 17 published entries with metadata, tags, categories, `relatedStories` connections
- `story-content.ts` — all editorial content, structured by slug

### Published Stories (all 17 live)
1. **The Day a President Caught a Tarpon** (8 min) — FDR, Barney Farley, May 8 1937
2. **The Tarpon Era** (12 min) — 1880s-1960s, Tarpon Club, Ed Cotter, 69 dams
3. **Farley Boat Works** (10 min) — no blueprints, Tina's 50-year journey, Doyle Marek revival
4. **Hurricane Celia** (10 min) — microbursts, Pearl Beer water, 14 named survivors
5. **The Lydia Ann Light** (7 min) — Christmas Day 1862, Fresnel lens, Charles Butt rescue
6. **They Said We Were Extinct** (8 min) — Karankawa 5,000 years, genocide myth, Donnel Point 2025
7. **38,000 Photos Nobody Can See** (7 min) — museum's Sears kit house, digital gap, Creighton archive
8. **Built, Destroyed, Rebuilt** (12 min) — 1875 through Harvey, each cycle prices people out
9. **The Pirate's Poet's Chapel** (5 min) — Aline Carter, Texas Poet Laureate, sand dune chapel
10. **The Guns That Never Fired** (6 min) — WWII 155mm guns, 360 men, zero shots
11. **Texas's Oldest Fishing Tournament** (6 min) — 1932 Tarpon Rodeo, Totsy's fish, Deep Sea Roundup

### Published Expansion Stories (all 6 live as of 2026-04-12)
12. **No Blueprints, No Problem** (10 min) — Farley craft deep dive: half-models, V-bottom hulls, the apprentice problem, fiberglass trees
13. **The Island's Institutional Memory** (9 min) — Museum collection: Fresnel lens, 40K photos, 1920s film, genealogy scroll, digital gap
14. **The Mercer Logs** (8 min) — six ledger books 1866-1881, post-Civil War records, Dr. Ford transcription
15. **The Red Tide That Built a University** (8 min) — 1935 fish kill → Lund's shack → UTMSI founding 1941, $45M Harvey damage
16. **The Ferry That Keeps the Island an Island** (7 min) — Munsill era, Littleton's county era, TxDOT 24/7 fleet, bridge debate
17. **The Development Question** (9 min) — Cinnamon Shore, $1.3B Phase II, Beach Access 1B fight, Harvey's role, affordability

### Heritage Research Vault (6 files in `Port A Local/Heritage Research/`)
- FDR Tarpon Fishing Trip 1937.md (196 lines)
- The Tarpon Era.md (240 lines)
- Farley Boat Works.md (295 lines)
- Hurricane Celia and Port A Storm History.md (227 lines)
- Port Aransas Timeline.md (627 lines) — Karankawa to 2025
- Port Aransas Museum and PAPHA.md (440 lines) — deep second-pass with Sears kit house, 38K photos, Creighton

### The Farley Connection (PRIVATE — do not reference publicly)
Winston's wife Collie (Colleen Farley) carries the Farley maiden name. **Farley Boat Works is her family's legacy.** This is not a partnership angle — it is personal family history.

## Portal Strategy (UPDATED 2026-04-15)
Revenue features are portals, not directory listings. Portals keep transactions in-house.

1. `/maintenance` — Standard (free) or Priority Dispatch ($20, 7AM–8PM) → John Brown notified via SMS (Twilio), admin@theportalocal.com notified via email (Resend). **Urgency-dispatch coupling (2026-04-15):** only Emergency triggers Priority Dispatch. Urgent (48hr) stays free Standard. Switching Standard ↔ Emergency auto-syncs both fields. SLA: "within 4 hours" (not 2-4). After 8PM, Emergency is disabled; call (361) 455-8606 for after-hours.
2. `/rent` — **MARKETPLACE MODEL (2026-04-15, updated 2026-04-25 to "pickup OR delivery"):** customer books ($10/day reservation fee via Stripe, 5-day calendar minimum). Lead blasts to 20 selected cart companies simultaneously via email. First vendor to respond claims the rental. **Handoff is vendor's call — pickup at their shop OR delivery to the customer's address, whichever they offer for that lead.** (Reversal of the earlier "pickup only" rule — leaving it open captures more customers; vendors self-sort based on what they offer.) Vendor agrees to: clean cart, **minimum $20 discount** off standard rate, standard rental practices (ID, deposit, service, maintenance). Customer gets cart logistics 24-48 hours before arrival. **Internal refund rule:** if no vendor claims 3-4 days before pickup, auto-refund + notify customer. 20 vendors selected, 8 have emails (active in blast), 12 need emails collected. SMS blast channel ready in code, flips on with A2P.
3. `/beach` — cabana ($300/day) + chair & umbrella ($85/day) via Stripe, delivery only, date range

**Vendor branding rule:** No vendor names ever in portal UI at booking time. Cart portal is vendor-agnostic by design (we don't know who's fulfilling at booking). Vendor name revealed only in pre-arrival notification.
**John Brown:** SMS-only by design — does not take email. Internal email record goes to admin@theportalocal.com for all 3 portals.

## Account / Infrastructure Status (verified 2026-04-13)
- **Domain:** ✅ theportalocal.com live, HTTPS, 200 OK
- **Google Workspace:** ✅ active — MX `smtp.google.com`, admin@/hello@/bookings@ all receive mail
- **Stripe:** ✅ LIVE — `acct_1TLv2G…`, under admin@theportalocal.com, charges enabled, **manual platform payouts** (PAL → PAL bank fires when Winston says so), live keys in Vercel. **Stripe Connect Express ALSO live** for runner payouts (separate flow, defaults to daily auto-payouts on connected accounts). **2FA:** enabled with Google Authenticator, recovery code stored in iCloud Keychain (Stripe entry, 2026-04-26 — saved after a panic recovery this session). **Stripe Issuing:** deferred 30+ days, reapply after Connect volume history accumulates (~Q3 2026)
- **Resend:** ✅ live, bookings@theportalocal.com sender, also wired to Know This Place tag suggestions
- **Twilio:** ✅ account active, $44 USD balance, +1 (361) 428-1706 SMS+Voice
- **A2P 10DLC Brand:** ✅ APPROVED (BNd6030f9f0baf17902003652df158da0d)
- **A2P 10DLC Campaign:** ✅ **LIVE 2026-04-29** (campaign `C2KO2MB`, status VERIFIED, registered at TCR 2026-04-22, attached to Messaging Service `MG197b…`). Use case: LOW_VOLUME mixed. Rate: AT&T 1.25 mps T-class, T-Mobile brand tier LOW. Sender +13614281706 attached to Messaging Service same day (was missing — that gap caused first smoke test to fail with error 21703 before number was attached). Two delivery-confirmed smoke tests landed on +15125681725. **Customer-side SMS surfaces (maintenance, rent, beach, delivery) all now route via approved campaign automatically — no code change required, just better delivery.**
- **GSC:** ✅ verified via TXT record on apex, sitemap submitted
- **GitHub:** ✅ stays on `haveebot/port-a-local` — no org migration planned (decided 2026-04-13)
- **Vercel:** ✅ stays on `haveebots-projects` team — no team migration planned. Project name is `port-a-local`, deploys to theportalocal.com.

**Email structure (FIRM):**
- admin@theportalocal.com — all account logins, platform management
- hello@theportalocal.com — public contact, business inquiries
- bookings@theportalocal.com — Resend transactional email sender

**Env vars in Vercel production (as of 2026-04-13):**
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_MESSAGING_SERVICE_SID (MG197b…), ADMIN_PHONE, INTERNAL_ALERT_EMAIL, JOHN_BROWN_PHONE.

## Next Session Priorities

### Open / awaiting Winston action
0a. **Verify Lowe's Market entry** — `delivery-restaurants.ts` has best-guess address `611 N Alister St`, phone `(361) 749-6602`, hours `7am-10pm daily`. Verify on first run, fix drift, or set `isActive: false` if anything's wrong.
0b. **Backfill missed Stripe transfers** — Winston's account was `payouts_enabled=false` at the time of his + Nick's test deliveries, so transfers didn't fire. Use `/wheelhouse/payouts` admin tool to send himself the missed amounts (DQ test $5.65, Nick's order $9.30). Memo: "Backfill — pre-Stripe-verification deliveries". Future deliveries auto-payout.
0c. **Stripe statement descriptor verification** — confirm next customer credit card statement reads "PORT A LOCAL" not "PALM FAMILY VENTURES". Already updated in Stripe Public details.
0d. **Nick's GitHub admin invite** — sitting at https://github.com/haveebot/port-a-local/invitations awaiting accept.

### PAL Delivery — runner pool + restaurant pool
1. **Onboard more runners.** Pipeline + onboarding works end-to-end. Need humans willing to drive. Pool today: 1 (Winston). Each new runner: post application → Winston approves via magic link → runner sets up Stripe Connect → toggles on duty.
2. **Onboard more restaurants.** Currently 2 (Crazy Cajun, DQ). Each new restaurant is one entry in `delivery-restaurants.ts` + a menu file. Bottleneck is menu data collection. **Plus more convenience stores** beyond Lowe's Market.
3. **Customer comms preference UI** — after A2P clears, let customers choose SMS / email / both per order.

### Filed-as-deferred (design ready, build pending)
3a. **Order modification + runner-customer comms** — `Port A Local/Features/Order Modification + Runner-Customer Comms — Design.md`. Phase 1: surface runner phone on customer tracking + refund-only adjust flow. Phase 2: Twilio proxy numbers (post-A2P) + saved-card setup intent for upcharges. Phase 3: in-app messaging if escalation needed.
3b. **Runner Rewards higher tiers** — `Port A Local/Features/Runner Rewards Program — Design.md`. $25+shirt at 10 / $100 at 50 / Apple Watch at 250. Tracked + visible to runners as "Coming soon" with progress bars; rewards held until ready to ship.
3c. **Rentals + services scope expansion** — `Port A Local/Features/Rentals + Services Scope Expansion — Notes.md`. Three-architecture-options doc on whether to expand /rent multi-category, lean into /locals as the rent+hire mega-marketplace, or hybrid. Pickup-here checklist included.
3d. **Stripe Issuing reapply** — passive wait for ~30 days Connect volume (~Q3 2026). Issuing would let runners get virtual cards instead of needing personal credit for restaurant pickups.

### Cart Portal Marketplace (revenue)
1. **Collect 12 missing vendor emails** — Winston task. Call or web-scrape: Coastal Ed's, Port A Beach Buggies, Texas Red, First Stop, Tarpon Carts, Bron's, Kacie's, Island Outfitters, Gulf Carts, Ash Cart, Port A Carts, PA Golf Cart Rental. Drop email into `src/data/cart-vendors.ts` next to slug → live on next deploy.
2. **Click-to-claim mechanism** — needs Vercel KV (free tier). Unique claim links per vendor per lead. First click wins. Replaces manual reply-based claiming.
3. **SMS blast channel** — A2P now live (2026-04-29). Phone numbers exist in `cart-vendors.ts` but the blast loop in `/api/rent/confirm/route.ts` still calls only `sendEmail`, not `sendSms`. Memory previously over-stated readiness. Build needed: (a) add `smsConsent` field to CartVendor (B2B opt-in is separate from registered customer use case in campaign C2KO2MB), (b) admin opt-in tool in Wheelhouse, (c) wire SMS into the blast for opted-in vendors, (d) Twilio inbound webhook to parse YES/NO.
4. **Automated pre-arrival notification** — email + SMS to customer 24-48hrs before pickup with vendor name + pickup address + hours.
5. **Automated return reminder** — email + SMS to customer day before return date.
6. **Auto-refund for unclaimed leads** — cron or manual check: if lead unclaimed 3-4 days before pickup → Stripe refund + customer notification.

### Gully + Claude (AI search — next big feature)
7. **Create Anthropic API account** under admin@theportalocal.com, Palm Family Ventures card, $25/mo cap. Get API key → Vercel env var `ANTHROPIC_API_KEY`.
8. **Build "Ask Gully" augmented search** — Option A (recommended). Fuse returns matches as usual; if query is a question, Claude Haiku synthesizes a short answer from top-N matches with inline citations. Single addition to existing Gully UX. Prompt-cached system prompt + corpus for cost efficiency.

### Content
9. **Heritage expansion batch 2** — candidates: Red Snapper Fleet, Vietnamese shrimping community, Aransas NWR whooping cranes, Harbor Island oil era, Port A ISD history
10. **Dispatch #2 — "The Landlord Nobody Voted For"** (planned follow-up) — shopping center acquisition + rent-doubling pattern. NOTE: Tim Parke (2026 Sandfest president, Lone Star Taste owner) is a potential source — he's both a cart-portal vendor relationship and a possible Dispatch #2 tenant. Handle carefully.

### Infrastructure
11. ~~A2P campaign approval~~ ✅ **LIVE 2026-04-29** (C2KO2MB VERIFIED). Maintenance SMS + delivery customer SMS automatically route via approved campaign. Cart vendor SMS blast still needs a build (data was ready, code was not — see #3 under Cart Portal section).
11b. **Stripe Issuing reapply** (passive — wait for ~30 days of Connect volume to accumulate, ~Q3 2026). Issuing would let runners get virtual cards instead of needing personal credit for restaurant pickups.
12. **Classifieds/Want Board** — needs Supabase (still deferred)
13. **Per-business OG images** (eventual) — 130+ business detail pages currently fall back to root OG.
14. **Heritage per-article OG lighthouse upgrade** ✅ done 2026-04-14.

## PUD Listing Rule (2026-04-15, confirmed + enforced)
- **Rule:** No customer-facing mentions of PUDs (Cinnamon Shore, Palmilla, Sunflower Beach, Preserve at Mustang Island) — no directory listings, map pins, neighborhood callouts, "stay here" recs, popular-chip shortcuts.
- **Exception 1 — Editorial:** Heritage, Dispatch, archives, and archival photos that reference PUDs as part of the historical/economic narrative are protected. Examples: Heritage #17 "The Development Question" (slug `cinnamon-shore-tension`), Dispatch #1 "The Two Port Aransases." Do not scrub these.
- **Exception 2 — Lisabella's:** Listed despite being inside Cinnamon Shore (🔑 personal relationship). Tagline + address + description can all reference Cinnamon Shore — it's a feature for Lisabella's, not a routing to the PUD. Map pin sits inside Cinnamon Shore (accurate lat/lng) — acceptable under the exception.
- **Scrub execution (commit c86b8c9, 2026-04-15):**
  - Removed `Cinnamon Shore` business listing from `src/data/businesses.ts` (matched precedent comment `// [Business] removed — PUD property`)
  - Removed Cinnamon Shore neighborhood section from `src/app/where-to-stay/page.tsx`
  - Replaced Cinnamon Shore with Shorty's in the homepage chip strip (`src/app/page.tsx`)
- **If a new PUD emerges (Preserve at Mustang, bayside subdivision, etc.):** apply the same rule, scrub on sight, leave the comment pattern.

## Decisions Made
- **Google Business Profile: skipped.** PAL is a media/directory platform, not a storefront. GBP rules technically exclude online-only businesses. Brand presence handled by JSON-LD schema + GSC + on-site SEO (already strong). Revisit only if PAL opens a physical presence, pop-up, or paid advertising. Winston confirmed dislike of GBP 2026-04-13.
- **GitHub + Vercel:** PAL stays on haveebot — no migration. Sage Em is the one that gets dedicated company orgs.
- **First FB banner — "Straddle the Rail" over FDR (2026-04-15).** FDR 1937 image is more famous *and* personally meaningful (Barney Farley — Collie's grandfather — is in the photo) but overused by every PA tourism outlet, Tourism Bureau, Tarpon Inn, and museum. "Straddle the Rail" was already sourced in our archives as public domain, is visually distinct, and matches the anti-Bureau "deep-cut" voice — the kind of image that signals *we know this place*. FDR reserved for future use (next banner rotation, story illustration, merch, etc.) — we have ample opportunity.
- **Brand package — formal approval status (clarified 2026-04-15, waiting confirmed 2026-04-15).** The lighthouse mark itself is blessed. The *full lockup* (lighthouse + wordmark + coordinates strip) is used internally on OG cards, emails, footer, and nav, but has **not** been formally approved as "the official identity package" — and we are **deliberately waiting** before locking it. Reasons to wait: (a) it's already working in the right contexts so no lock is blocking, (b) FB banner proved the lockup isn't universal (pure photo + bleed beat lockup overlay), (c) locking prematurely biases us toward using it everywhere. Plan: ship 3–4 more brand surfaces (IG, Twitter, per-business OG, merch) and see the pattern before deciding whether there's one canonical lockup or 2–3 approved configurations. Treat the lockup as in-progress until Winston explicitly flags it as locked.

## Decisions Made (2026-04-26 evening — Sprints A through F + punch list)

- **CityDeploy is the platform name.** Heye Lab's templated SaaS engine that PAL is the proof-of-concept for. PAL = town deployment. CityDeploy = the engine sold to other towns. Tagline pattern: "Powered by Heye Lab · Built on CityDeploy." Full vision in `Port A Local/Memory/CityDeploy — Platform Vision.md`.
- **Locals fee model: 10% flat, customer pays on top, locals keep 100%.** Not tiered. Not deducted from vendor pay. Same shape as Airbnb / Turo / DoorDash on the consumer side; PAL's brand differentiator is that locals never eat the fee. Decided after Winston flagged the original "no fee until you make money" copy as misleading. Tested against $50 kayak ($55 customer) and $600 trailer ($660 customer) — flat 10% wins on simplicity + brand clarity over tiered/capped alternatives.
- **Driver leaderboard is anonymous.** Stable "Driver #N" identifiers numbered by signup order (`ROW_NUMBER() OVER (ORDER BY applied_at)` across ALL drivers — rejected ones reserve their slot). Real names only ever surface in admin contexts (Wheelhouse, admin emails). Doubles as internal-tracking shorthand ("How's Driver #3 doing?").
- **Pickup vs delivery for cart rentals is the CUSTOMER's call, not the vendor's.** Vendor claiming a lead is internal mechanism. Customer chooses handoff at booking; vendor blast filters to vendors who fulfill that method. Reversed prior memory note that said "vendor's call." Customer-facing copy now says "your call" everywhere.
- **Photos for /locals rent listings collected via email, not in-app upload.** Path B "email to hello@" pattern matches Live Music + runner verification flow. Saves the Vercel Blob setup tax for v1; can graduate later if listings volume justifies. Hire-mode (skills) listings remain photo-optional — service description usually carries it.
- **First-delivery $5 bonus auto-fires via Stripe Connect.** Tier 1 of the Runner Rewards program. Higher tiers ($25 + shirt at 10, $100 at 50, Apple Watch at 250) tracked but rewards deferred — runners see them as "Coming soon" with progress bars. Per Collie's recommendation + Winston's "love the whole rewards system - flag to revisit all" greenlight.
- **Rewards bonus uses synthetic order_id pattern in existing transfers ledger.** `bonus-first-{driverId}` (Tier 1) for now; future tiers can extend with `bonus-tier2-{driverId}` etc. Same idempotency machinery as order-tied transfers — no schema fork.
- **Wheelhouse Craigslist landing approach — public link, agnostic, anonymous, "we read every one, most don't make it through."** No portal. No application form. Just a mailto link to hello@. Matches Winston's "we remain Craigslist" framing. Sets the tone for Heye Lab being a quiet tech mystery, not a recruiting funnel.
- **Memory mirror is one-way: source on Winston's machine → mirror in `Port A Local/Memory/`.** Don't edit the mirror; edit source memory and re-run `bash scripts/sync-memory.sh` then commit + push. Whitelist-only — explicitly excludes user_winston (personal), separate-project files (Sage Em / CrossRef), and auth-sensitive references (haveebot mail script).
- **Convenience deliveries get lower margin (20% markup) vs restaurants (45%).** Loss-leader model — PAL takes less, runners stay busy, customers get convenience-priced essentials. Same fee/payout split structure (50% markup share + 50% delivery + 100% tip to runner); just smaller absolute dollars.
- **Driver verification is two-stage, not one.** Acknowledge at signup (checkbox) is separate from Verify by admin (after photos arrive at hello@). Approved runners can start working before full verification — verification is tracked separately. We trust manual approval for v1.
- **Fee verbiage everywhere is consistent: customer covers, locals/runners keep their full quote/take.** Same model across `/deliver` (markup + fees baked into customer total, not deducted from runner pay), `/rent` (cart reservation fee added on top of vendor's standard rate), `/locals` (10% on top of vendor's quote). Brand consistency across all verticals.
- **Vercel env var trailing-newline trim is a defensive default for any sensitive comparison.** Established with Stripe key (commit `4923918`); now applied to Wheelhouse login (`29952cd`). Future rule: any code that compares an env var value should `.trim()` first. Same for any code that READS a Stripe key.

## Decisions Made (2026-04-26 morning session — Delivery hardening + Stripe 2FA recovery)
- **Cookie-session over token-in-URL for runners.** Original token-in-URL design felt like friction. Pivoted to "What would Uber do" — magic-link first sign-in, `pal_runner` cookie thereafter (httpOnly, sameSite=lax, 30-day). Runner bookmarks `/deliver/driver` and never sees a token in the URL again. Token still works as fallback (lookup recovery, dispatch links on a new device).
- **Belt-and-suspenders comms everywhere.** SMS may be filtered pre-A2P; email is reliable. Both fire on every state transition (driver dispatch, customer paid/picked-up/delivered). Once A2P clears, runners + customers will be able to choose preference.
- **Manual platform payouts (PAL → PAL bank).** Winston controls when fund flow at the platform layer fires. Different from Connect-account payouts (PAL → runner bank), which run on Stripe's default daily auto-schedule.
- **Defensive `.trim()` on Stripe key reads.** A trailing newline in `STRIPE_SECRET_KEY` env var burned a session with `ERR_INVALID_CHAR` 500s. `getDeliverStripeKey()` now always trims. Adopt this pattern for any Stripe key reads going forward.
- **Stripe payouts dashboard button on runner hub.** One-tap into runner's Express dashboard via `stripe.accounts.createLoginLink` (one-time URL, single-use). Opens in new tab so PAL session stays put. Lets runners see balance, payout schedule, trigger instant payouts (1.5% fee), update bank info — without leaving PAL.
- **PAL is "an entity," not "Winston."** All customer-facing copy says "PAL" / "we" / `hello@theportalocal.com`. No personal name surfaces anywhere on Delivery surfaces. Mirrors PAL's broader voice rule.
- **Phantom-order admin emails killed.** Admin paid email moved from `/api/deliver/order` (create) to `/deliver/success/[orderId]` (post-Stripe-verify). No more inbox spam from abandoned carts that errored before payment.
- **Runner terminal-state hub-back buttons.** Delivered, canceled/refunded, and already-claimed-by-another-runner all show "← Back to runner home" so runner doesn't dead-end on the success card.
- **Stripe 2FA recovery code is permanent infrastructure, not optional hygiene.** Lost a session almost-recovering from 2FA lockout (Google Auth empty, no clear backup codes; salvaged via a recovery code Winston had drafted to himself 13 days prior). New rule: every 2FA setup gets the recovery code stashed in iCloud Keychain (or 1Password when we have one) immediately, no exceptions. The string format (5 groups of 4 lowercase chars, hyphenated, e.g. `xxxx-xxxx-xxxx-xxxx-xxxx`) is Stripe's master recovery key — single-use, master override.

## Decisions Made (2026-04-25 session)
- **Events strategy: build first, no outreach, force them to come to us.** Decided this session. We're a local site covering public events from public information — same as any news outlet. Org's options after we ship: (1) engage, (2) ask, (3) pay (we decline cash per no-paid-placements), (4) push back (untenable if we're well-executed). EventOrganizerClaim CTA on every event page operationalizes the on-ramp.
- **Tournament coverage is a priority wedge for PAL.** Tournaments in Port A have real economic gravity but their digital presence is in the basement. We can dominate this category at near-zero marginal cost per event because the infrastructure templates. DSR is the framework subject (Heritage piece + Farley family lineage already established); TWAT and Texas Legends are next.
- **Million-Dollar Game Dispatch piece is a separate spin-off.** Winston has been hammering on the title for years. Tone there is more journalistic/observational; tone on the event page itself is celebrate-the-spectacle. The event loves us either way because we cover them better than they cover themselves.
- **Captain interviews / org outreach deferred** — build with public info, let org come to us. Same Heritage/Dispatch workflow.
- **Day-of staffing designed for proxy/automated, not manual.** Photo intake from anyone via mailto/upload, leaderboard updates can be remote, structured weighIn entries kept simple to enable async processing.
- **Per-event hub pages are the demo-for-adoption play.** Build the hub page first, pitch second. The page itself IS the pitch — easier to ask "approve this" than "imagine this." First target: Fly It Port A's Spring Kite Festival 2026. If the Timms say yes and day-of coverage works May 9, the same template runs for Fall Kite Festival, Winter Kite Festival, Wooden Boat Festival, Whooping Crane Festival, Lighted Boat Parade, Deep Sea Roundup. Each is one entry in `src/data/events.ts` away.
- **Day-of coverage scaffold is built into the page.** Empty state today, fills in real time the morning of the event with photos + conditions + updates. Avoids the tourism-bureau pattern of "list of events with no follow-through." Coverage is what we offer that distinguishes us from CVB calendars.
- **Heritage backlog +1: "The Kite Shop on Avenue G."** The Yocum → Pyle → Timms ownership chain across four decades, the competitive-flier sponsorships under Yocum, the long Pyle era, and how the Timms-era three-festivals-a-year cadence (NEW since ~2022) is reshaping the rhythm. Long-form, archival photos. The *shop* is the heritage subject — the festival cadence is too young to be Heritage on its own.

## Decisions Made (2026-04-24 session)
- **Collie's lighthouse is the canonical mark.** Replaces the prior Lydia Ann rendering. Propagated to all surfaces in one commit (`db3a65d`). Three color variants (dark/light/coral) + four detail levels preserved. The `/brand` page is now the single source of truth — future brand questions get resolved there, not re-relitigated.
- **`/brand` is the internal reference, not a public page.** `robots: noindex, nofollow`. URL is unlinked from nav. Collie + Winston bookmark it; I cite it in drafts; future Claude sessions should read it before making brand decisions.
- **Emoji exceptions locked (Collie explicit sign-off).** SMS, seasonal event emojis (🎃🎄🎭🪁), and email subject lines stay as emoji. See `feedback_pal_brand_system.md`.
- **Directory icons: Illustrator-authored only.** Canva round was abandoned. Any future icon ships through the same `PortalIcon.tsx` swap path — one component, all call sites update in one edit.
- **Photo-driven intake is the default for Collie features.** When she sends a photo with content, the protocol is: pull attachments → transcribe / OCR / extract → build the feature → ship → reply with summary. See `feedback_pal_photo_to_feature.md`. Cadence is feature-dependent (weekly for Live Music; one-off for brand drops).
- **Marketing ops are living files, not deliverables.** Content Calendar, Caption Library, Outreach Tracker, Targets are maintained in the vault and updated every Sunday by Winston/Collie/Claude. Not shipped as a PDF.
- **Paid ad spend crosses a Winston-approval threshold.** Collie plans paid placements starting ~May 5 for end-of-school beach vacation targeting (Austin/SA/Houston/DFW). Any paid spend requires Winston's explicit go on budget + creative.
- **Sip Yard is in the Live Music schedule but not yet in the directory.** Renders as plain text on `/live-music` (no crosslink). Winston to provide tagline + address + phone to listing-ify.
- **`music` silhouette still a placeholder.** Live Music nav uses the existing `art` (paint palette) icon. Flagged to Collie as her optional next micro-task.

## Decisions Made (2026-04-16 session)
- **Printable QR poster pattern (2026-04-16).** New route `/print/qr/[slug]` generates letter-size branded posters with a lighthouse-in-center QR code. Two targets live: `home` (general awareness) and `sandfest` (Heritage piece). For physical display at events — first use is Sandfest weekend signage. Powered by `qrcode` npm package with error correction H to survive the center overlay. Not indexed (noindex in metadata).

## Decisions Made (2026-04-15 session)
- **Cart portal: marketplace model (2026-04-15).** Pivoted from preferred-vendor/delivery to competitive marketplace/pickup. Customer books → lead blasts to 20 vendors → first to claim wins → customer picks up. $10/day reservation fee. Vendor gives minimum $20 discount. Pickup only (no delivery). 5-day calendar minimum. 3-4 day no-vendor refund policy. Flywheel: volume → vendor dependence → vendor approaches for exclusive deal → PAL has leverage.
- **Maintenance urgency coupling (2026-04-15).** Only Emergency triggers $20 Priority Dispatch. Urgent (48hr) stays free Standard. Both directions auto-sync. SLA tightened to "within 4 hours" from "2-4 hours."
- **Internal email routing (2026-04-15).** All 3 portals now send internal alert emails to admin@theportalocal.com. Maintenance was previously orphaned (JOHN_BROWN_EMAIL unset). John stays SMS-only.
- **Archives visibility (2026-04-15).** Promoted in nav Discover dropdown (Heritage → Dispatch → Archives → Guides), added to Footer, cross-link callouts on /history and /photos pages. Was buried at bottom of secondary dropdown cluster.
- **Lisa Shelton: passed September 6, 2025, age 61.** Stroke Oct 22, 2024. Executive Director of Sandfest 2018-2019. Nickname "Wiggly." Featured on 2026 logo mountain. South Jetty obit: portasouthjetty.com/articles/shelton-was-sparkling-community-leader/. Honored in Heritage #22 Section 6 "The Logo Mountain" — Sandfest-centric framing, not a memorial section. Per Winston: don't over-concentrate on individuals in festival pieces.
- **Tim Parke: 2026 Sandfest board president.** Owns Lone Star Taste. Also a potential Dispatch #2 source (Landlord piece — tenant angle). Handle dual relationship carefully.
- **Scot Deason: one T (Scot, not Scott).** Confirmed.
- **FB page strategy: parked for Collie.** No mass-delete of old posts. Triage (keep/hide/delete) deferred until Collie begins contributing on marketing. Archive don't nuke.

## Key Decisions
- Platform: Next.js + Vercel (stay). Shopify Storefront API for merch when ready.
- Stripe for booking/reservation fees — lazy initialization pattern
- Domain naming: no hyphens ever. theportalocal.com is primary (originally portaransaslocal.com).
- No business outreach until paid advertising is introduced — stay fully internal
- Gully = site-wide fuzzy search engine, live at /gully. Cmd+K palette on every page.
- RAG/vector search ruled out for current scale — Fuse.js is right. RAG reserved for future "Port A Concierge" AI chat.
- Heritage section = **Port A Heritage** (renamed from "Island Stories" 2026-04-12). URL stays `/history`. Original editorial, not directory listings. Do and build, don't ask permission.

## Key Files
- Vault: `/Users/winstoncaraker/Projects/workspace/port-a-local/Port A Local/`
- Heritage Research: `Port A Local/Heritage Research/` (6 files)
- Stories: `src/data/stories.ts`, `src/data/story-content.ts`
- **Dispatch: `src/data/dispatches.ts`, `src/data/dispatch-content.ts`, `src/app/dispatch/[slug]/page.tsx`**
- **Events: `src/data/events.ts`, `src/data/event-content.ts`, `src/app/events/[slug]/page.tsx`** (per-event hub pages, NEW 2026-04-25)
- **Tournament data + components (NEW 2026-04-25):** `src/data/tournament-results.ts`, `src/components/tournament/{LeaderboardTable,DivisionsPanel,CaptainSpotlight,PiggyPerchHighlight,TournamentRulesPanel,PastChampionsBoard}.tsx`
- **Event extras (NEW 2026-04-25):** `src/components/{EventCountdown,FeaturedEventBanner,EventOrganizerClaim}.tsx`, `/api/events/claim/route.ts`
- Businesses: `src/data/businesses.ts` (140+ with geocoded coordinates)
- Guides: `src/data/guides.ts` (10 curated guides)
- Gully: `src/lib/gullySearch.ts`, `src/app/gully/page.tsx`, `src/components/GullyPalette.tsx`
- Trip Planner: `src/lib/tripPlanner.ts`, `src/components/SaveToTrip.tsx`, `src/app/my-trip/page.tsx`
- Map: `src/app/map/page.tsx`, `src/components/MapView.tsx`
- Live: `src/app/live/page.tsx`, `src/components/IslandConditions.tsx`, `src/app/api/conditions/route.ts`
- Essentials: `src/app/essentials/page.tsx`
- Events: `src/app/events/page.tsx`
- Fishing: `src/app/fishing-report/page.tsx`
- Know This Place: `src/components/KnowThisPlace.tsx`, `src/app/api/suggestions/route.ts`
- SEO: `src/app/sitemap.ts`, `src/components/StructuredData.tsx` (Website + Organization schemas)
- Portals: `src/app/rent/`, `src/app/beach/`, `src/app/maintenance/`
- **Delivery (NEW vertical, 2026-04-25 / 2026-04-26):**
  - Customer surfaces: `src/app/deliver/`, `src/app/deliver/checkout/CheckoutClient.tsx`, `src/app/deliver/success/[orderId]/{page.tsx, OrderTracker.tsx}` (live tracking)
  - Public leaderboard: `src/app/deliver/runners/page.tsx` + `src/components/RunnerLeaderboardTile.tsx` (homepage)
  - Runner surfaces: `src/app/deliver/runner/`, `src/app/deliver/driver/RunnerHub.tsx` (with Rewards ladder), `src/app/deliver/driver/[orderId]/DriverActions.tsx`, `src/app/deliver/driver/lookup/`, `src/app/deliver/driver/payouts/`
  - API routes: `src/app/api/deliver/order/`, `src/app/api/deliver/runner/{,approve,reject,verify}/`, `src/app/api/deliver/driver/{login,logout,feed,online,offline,lookup}/`, `src/app/api/deliver/driver/connect/{start,refresh,dashboard}/`, `src/app/api/deliver/webhook/`
  - Data + libs: `src/data/delivery-{store,types,restaurants,drivers,pricing}.ts` (with `getLeaderboard`, `markDriverVerified`, `getDeliveredCountForDriver`, `listCustomPayouts`), `src/lib/{runnerSession,deliverStripe,deliverDispatch,deliverEmails}.ts`
  - DB tables: `delivery_orders`, `delivery_drivers` (with verification + acknowledgement columns), `delivery_driver_status`, `delivery_driver_transfers` (idempotent migrations on first call; `bonus-first-{driverId}` synthetic IDs for first-delivery bonus, `custom-{rand}` for ad-hoc payouts)
  - **Spec doc: `Port A Local/Features/Delivery — Spec.md`** — read before touching delivery code
  - **Wheelhouse admin: `src/app/wheelhouse/payouts/{page.tsx, CustomPayoutForm.tsx}` + `src/app/api/wheelhouse/payouts/route.ts`** — custom Stripe transfer admin
  - **Lowe's Market** = first convenience store (id `lowes-market-port-a`, slug `lowes-market`, kind=`store`, 20% markup). Curated 12 essentials.

- **Heye Lab / CityDeploy:**
  - Memory mirror: `Port A Local/Memory/` (auto-populated by `scripts/sync-memory.sh`)
  - Platform vision doc: `Port A Local/Memory/CityDeploy — Platform Vision.md`
  - Sync script: `scripts/sync-memory.sh` (whitelist-based; run at end of any session that updates memory)
  - Footer attribution: "Powered by Heye Lab · Built on CityDeploy" on every PAL page

- **Deferred-design docs** (read before picking up these threads):
  - `Port A Local/Features/Runner Rewards Program — Design.md` — Tier 2-4 rewards
  - `Port A Local/Features/Order Modification + Runner-Customer Comms — Design.md` — mid-flight order changes + runner-customer texting
  - `Port A Local/Features/Rentals + Services Scope Expansion — Notes.md` — multi-category rent/services future
- **Cart vendor directory: `src/data/cart-vendors.ts`** — 20 selected PA cart companies, getBlastableVendors() helper, claim terms in header comments
- **Brand mark: `src/components/brand/LighthouseMark.tsx`** — single component, 4 detail levels, monochrome prop
- **Shared OG helper: `src/lib/brandedOG.tsx`** — powers every route's share card
- **Shared email helper: `src/lib/emailLayout.ts`** — powers every transactional email
- **Static logo SVGs: `public/logos/lighthouse-{full,standard,simple,icon}.svg`**
- **App-level branded routes: `src/app/{icon.svg, apple-icon.tsx, manifest.ts, opengraph-image.tsx}`**
- **Social export routes: `src/app/social/facebook-profile/route.tsx`, `src/app/social/facebook-banner/route.tsx`**
- **QR print pages (NEW 2026-04-16): `src/app/print/qr/[slug]/page.tsx`** — branded 8.5×11 printable QR posters via `qrcode` npm package (error correction H, navy-on-sand, lighthouse icon overlay in center on sand-colored circle). Two targets live: `home` → theportalocal.com, `sandfest` → the Heritage piece. Letter-size `@page`, `robots: noindex`, preview bar auto-hides on print. Add more targets by editing the `targets` config map. Pattern extensible to per-portal (`rent`, `beach`, `maintenance`) or per-heritage-piece posters as needed.
- **Archival source photos: `public/archives/causeway-sign-1939.jpg`** (1939 Russell Lee FSA, LOC, PD — first archival image downloaded locally for asset composition; add more here as needed)
- **Draft archive: `workspace/drafts/pal-editorial-two-port-aransases.md`** — original Dispatch #1 draft with notes

## 2026-04-30 mega session highlights (read this for current state)

**One-paragraph summary:** Drought disaster declared in Nueces County. Shipped a 9-min sourced Dispatch with 9 named PA locals + Barney Farley historical voice. Custom 8.7%-stat highlight OG. First auto-post LIVE on PAL FB Page via newly-built review queue. Site-wide canonical bug found and killed (was suppressing every share's OG). Marketing hub at `/wheelhouse/marketing` consolidating Glossary + Social. Glossary→Social auto-trigger wired. Emergency banner system end-to-end (bearer auth + revalidatePath + JS-measured nav offset). Drought banner LIVE site-wide. Live music weekend updated from Collie's calendar. Nav transparency killed (always-solid now). 30+ commits. Worktree clean, Vercel green.

**Detailed handoff:** `Session Notes/handoff-2026-04-30.md` in PAL repo
**HeyeDeploy patterns extracted:** `Session Notes/heyedeploy-patterns-2026-04-30.md`

**Tomorrow's mega-session pending list (priority order):**
1. Stripe Issuing application — apply at https://dashboard.stripe.com/issuing/overview, ~3-7 day review. Once enabled: runner virtual cards + dedicated FB Ads card.
2. Google Search Console + Bing Webmaster — submit sitemap + request re-crawl. Biggest near-term ranking lift now that canonical is fixed.
3. FB milestone cron — auto-queue posts at 30/14/7/1 days out / day-of / wrap. `src/lib/eventMilestones.ts` helper already exists.
4. Schema audit — verify the 10 schema components in `src/components/StructuredData.tsx` are actually rendered on detail pages.
5. Internal linking — surface Related sections on Heritage + Dispatch using existing `relatedDispatches` / `relatedStories` fields.

**Key new files this session worth knowing:**
- `src/data/social-post-store.ts` — Postgres-backed social review queue with idempotency on (trigger_type, trigger_ref, channel)
- `src/lib/metaGraph.ts` — FB + IG Graph API wrapper with stub-mode fallback
- `src/lib/socialPostTemplates.ts` — caption templates per trigger type (event, milestone, heritage, dispatch, glossary_active, manual)
- `src/lib/eventMilestones.ts` — pure helper computing upcoming-milestone preview data
- `src/data/ask-gully-log-store.ts` — analytics log for Ask Gully questions
- `src/components/PalBannerHeightSync.tsx` — JS-measured nav offset for the alert banner
- `src/app/wheelhouse/marketing/page.tsx` — the consolidated marketing hub
- `src/app/api/wheelhouse/social/route.ts` + `[id]/route.ts` + `test/route.ts` — social queue API (cookie + bearer auth)

**Status of operator surfaces (live in prod as of session end):**
- `/wheelhouse/marketing` — aggregated marketing hub
- `/wheelhouse/social` — review queue, FB confirmed working end-to-end
- `/wheelhouse/glossary` — status flip auto-queues social drafts
- `/wheelhouse/ask-gully` — analytics + content gaps
- `/wheelhouse/alerts` — bearer-auth + revalidate live
- Drought banner — LIVE site-wide
- FB automation — LIVE (1 post sent successfully today)
- IG automation — stub mode (no `META_INSTAGRAM_ACCOUNT_ID` yet)
- Stripe Issuing — NOT enabled (application is the unblock)

## Related memory files
- `feedback_pal_dispatch_workflow.md` — the validated 6-step pattern for writing Dispatch pieces

---

## Current State — 2026-05-14 (Ads tool + Pixel install session)

**Session shipped 13 PRs.** Full detail: `port-a-local/Session Notes/handoff-2026-05-14.md`.

**Live in production now:**
- Meta Pixel `2788980784776617` "Port A Local" — installed site-wide, fires PageView + ViewContent on /beach + /rent + InitiateCheckout on form submit + Purchase on success pages
- `/wheelhouse/ads` — read-only campaign list with per-campaign insights (reach/clicks/spend/CTR)
- `/wheelhouse/ads/new` — Create Ad form with objective + post + budget + duration + saved-audience ID
- Beach CLAIM customer-PII leak removed (PR #48). Cart CLAIM same PII leak removed (PR #53). PAL stays the listed provider end-to-end on both verticals.
- Cart Bron's first-look 30-min on every size. Customer chooses pickup/delivery, vendor required to honor.
- Beach team grouping — Bron's 3 vendor records share `team: "brons"`. Same-vendor race-lost SMS suppressed.
- `/wheelhouse/social` Ask Havee ⇄ direct-create toggle (PR #52)
- OG cards in Inter + Playfair Display (PR #37)

**Outstanding:**
- PR #56 (Ads Pause/Resume) stuck in CONFLICT with main — needs ~10-min rebase next session. Both #56 and #57 touched CampaignRow + metaAds.ts; #57 merged first.
- Pixel Purchase value=0 — needs confirm-route enrichment (~30-min PR)
- Pixel Preview env not added — Vercel CLI interactive prompt didn't pipe; add manually or retry

**Meta Business Manager state:**
- PAL = The Palm Republic business portfolio
- Pixel `2788980784776617` "Port A Local" in Palm Republic, connected to Port A Local ad account (`1512330510557166`), Winston + Collie assigned
- Stale ad accounts (Bella Bella Boutique + Mrs. Woody Jr's) removed today
- Orphan Pixels still alive (no events): "Winston Caraker's Pixel" personal + "Ads Pixel for Shopify Facebook Ad" Palm Republic — safe to delete later
- PAL has NO Instagram account (confirmed by Connect Instagram link in Business Suite, and IG scope rabbit hole correctly dropped)

**Mobile-app-trio root cause documented:** late-April Claude misread a compatibility question as a build request. New cross-project memory rule: `feedback_compatibility_vs_build_scope.md`.
