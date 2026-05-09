# PAL handoff — 2026-05-07 PM (full PM session: Collie InDeployed + lifecycle framework + heyedeploy parity + editorial v3 + cross-project rules)

_The longest single session in PAL history. Spans editorial substance (TPIA reply parsed + civicweb research + Dispatch v3 with Charter Review elevated), Collie's first canonical InDeploy + 5-PR shipping run, lifecycle framework lock (PreDeploy / InDeploy / PostDeploy), heyedeploy architectural parity with PAL, contributor-context replication discipline, multiple HARD CROSS-PROJECT memory rules, and the Francisca courtesy reply._

_~10 PRs across PAL + heyedeploy + workspace memory. Six new memory rules. Two repos with full architectural parity. Collie + Nick SMS-deliverable. Francisca's TPIA closed on 3 of 5 items + focused follow-up pending. Dispatch v3 staged + sent to Collie + Nick._

---

## Headline events

1. **Collie InDeployed at PAL — first canonical Tier 1 design contributor.** Her first PR (CONTRIBUTORS.md) merged by her own hand at 18:11:22 UTC. ~3 min PR-to-production. Five PRs total in 7 hours: Gully character + homepage redesign + Mother's Day weekend guide + center Gully sections + Mother's Day hero. **+787/-375 lines.** Architecture validated end-to-end.
2. **PreDeploy / InDeploy / PostDeploy lifecycle framework locked + named.** HARD CROSS-PROJECT BRAND-DISCIPLINE RULE filed. Three component docs in `heyedeploy/operations/` + the operator-facing PreDeploy checklist + mirror to PAL contributor-context.
3. **heyedeploy architectural parity with PAL.** CODEOWNERS + branch protection + Collie invited as collaborator + auto-merge + delete-branch-on-merge + allow-update-branch.
4. **Contributor-context folder created in heyedeploy** — for Collie's next-session lock-in. 13 files (README + launch + brand-inheritance + 10 cross-project memory rule mirrors). Plus HARD CROSS-PROJECT INFRASTRUCTURE RULE making this canonical for every future Heye Lab repo.
5. **Editorial Dispatch piece — v3 staged + sent.** "How Port Aransas Decides." Charter Review elevated as the structural anchor (per Winston: *"the real Port A stuff"*). Lorette + Owens + Zahn-Winton + Lafayette households fully Documented. Tourism Bureau as the convergence point + the Mustang Island Ventures LLC → Hentz CEO chain documented + the Aransas Club / Cocke development arc + the food-truck pattern as "in motion" instance + the rubric-not-in-public-packet finding from civicweb. ~2,550 words. v3 sent via SMS to Collie + Nick.
6. **Francisca courtesy/holding reply sent.** Items 2 / 3 / 5 closed on PAL's side; items 1 + 4 + officer-side equivalent of #3 (CIS + § 171.004 affidavits) pending in our focused follow-up.
7. **Five new HARD CROSS-PROJECT memory rules locked.**

## ⚠️ Top awareness items next session

1. **Collie's heyedeploy invitation is still pending her accept.** Visible at https://github.com/haveebot/heyedeploy/invitations. Once accepted, her next session in heyedeploy auto-loads the new contributor-context folder. Verify with `gh api repos/haveebot/heyedeploy/collaborators/colliebreah/permission --jq '.permission'` (returns `write` after acceptance).
2. **Francisca focused follow-up is PINNED** waiting for Winston + Collie scope review. The courtesy reply closed items 2/3/5; the substantive follow-up will request narrowed CIQ + officer-side CIS + § 171.004 affidavits + AG opinion request for bidder responses.
3. **Dispatch piece v3 sent to Collie + Nick via SMS.** Awaiting Collie's tonal read on the absence-of-records paragraph + open editorial questions documented in the matrix file's roadmap memo. Ship criteria explicit; v3 publishable today on what's documented.
4. **Collie may have shipped more PRs overnight.** Her last visible merge was #25 at 01:31 UTC. Run a fresh PR survey via `gh pr list --repo haveebot/port-a-local --author colliebreah --state all` to surface anything she landed while you were asleep.

---

## What got shipped today PM (chronological)

### 1. Editorial — TPIA reply parsed + civicweb minutes pulled

**City Secretary Francisca Nixon replied** to the April 29 TPIA on the 2019 Hotel + Conference Center procurement + Charter Review Commission records:

| Item | Status |
|---|---|
| #1 — All CIQ filings 2019-present | Asked us to narrow scope |
| #2 — All CIS filings 2019-present | Partially self-serve from cityofportaransas.org/elections/elections-november-2025/ |
| #3 — Filings naming Sea Oats / ZJZ / Bhakta / Cinnamon Shore / Lamkin (2017-present) | **CLOSED — zero records** |
| #4 — 2019 Hotel + Conference Center RFP/RFQ | Rubric + RFP doc received; bidder responses await AG opinion (45-60 days) |
| #5 — Charter Review Commission records | Listing received |

**Civicweb research agent** pulled 20 council agenda packets (Jan 2019 → Dec 2020). Saved to `Port A Local/Dispatch Research/civicweb-minutes-2018-2020/` with SUMMARY.md (PDFs gitignored due to size).

**Headline civicweb finding:** Rubric was NOT in the public Jan 17, 2019 packet. Item 7-H reads literally: *"INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW."* Resolution template was a procedural shell. Crawford + Moore were on the RFP committee; the other five voted on materials kept off the public record. Project relocated July 16, 2020 to Brookdale parcel under "PA Waterfront, LP / The Brookdale Group, LLC" → Resolution 2020-R59 extended Development Agreement with new SPV "The Inn, Spa & Conference Center, LP" through Dec 31, 2022.

### 2. Editorial — three rounds of browser-driven records research

**Round 1** (static-URL): Confirmed Charter Review listing + Owens family relationship (2010 South Jetty obituary names Brenda + Kelly Owens as siblings) + Lorette LLCs (Lorette Properties LLC + Port Aransas Coastal Homes GP LLC) + 137 BuildZoom permits + Dune Crest 70-90 STR plan attribution + Michele Lorette as Kuper Sotheby's Broker Associate (30+ years) + Charlie Zahn 12-year Port Authority commissioner (8 yr Chair, Harbor Drive renamed) + Mark Winton Council Place 1 win (2023, 562-410, not running 2025) + Tourism Bureau current roster.

**Round 2** (browser-driven): The **Lamkin → Suzette Freeman → Hentz CEO chain documented**. Mustang Island Ventures LLC formed May 2016 (within months of McMullin terming out as Mayor) with Suzette Freeman + Keith McMullin + Becky Corder as co-managing-members. Freeman was Tourism Bureau Chair when Hentz was hired CEO January 2017 — she personally led the search committee. Plus: 5497 Highway 361 LLC owns 49 NCAD parcels ($5.18M+ in 2026 appraised value) including ~12 acres of raw Dune Crest beach land. Plus: "Winton Place" platted subdivision under household-name ownership. Plus: Will Cocke / Fisherman's Wharf Holding LLC built The Aransas Club at 136 W Cotter (former Woody's Sports Center) — 26-unit private condominium, demolition July 2022, marketing as "Last Remaining Harborfront Properties" mid-2025. Plus: Cocke's primary residence is in Corpus Christi, NOT Port Aransas. Plus: 2009 South Jetty market roundup names Lorette + McMullin + Freeman + Starkey as principals on adjacent Port Aransas projects — network-longevity anchor at minimum 17 years.

**Round 3** (food-truck): Texas HB 2844 (89th Leg., 2025) creates Health & Safety Code Ch. 437B (eff. July 1, 2026) — preempts local food-truck health/sanitation permits, leaves municipalities zoning + location + parking + fire + noise authority only. April 21, 2026 PA City Council approved first readings on three ordinance drafts (new Sec. 12-45 Mobile Food Vending + Chapter 25 zoning + Chapter 10 noise) that occupy every avenue 437B preserved. Staff memos describe ordinances as *"structured to avoid conflicts with state preemption."* The 10-week window between first reading and state effective date is the kicker — city racing to lock its gate before state takes effect.

### 3. Editorial — Network Ties matrix + drafts v1, v2, v3

Master ledger filed at `Port A Local/Dispatch Research/P&Z Capture — Network Ties.md`. Four households documented as full paragraphs in the published draft:

- **Household A — Zahn-Winton:** four governance bodies (Charter Review + Port of CC Authority + Tourism Bureau + City Council) + Winton Place subdivision
- **Household B — Owens:** P&Z + Council (Mayor Pro-Tem) + Bureau Bar/Restaurant seat (via Chris Collins) + multi-restaurant operation + tourism-marketing operation (Kendall Owens)
- **Household C — Lorette:** Charter Review + P&Z + Kuper Sotheby's broker + 137 permits + Dune Crest 70-90 STR plan + 5497 LLC's 49 parcels at $5.18M+
- **Household D — Lafayette:** Tourism Bureau Professional Services + Brandon Lafayette Homes LLC (Palmilla Approved Expert Builder) + BL Trojan Development subdivision

Plus pattern coda: three Bureau/Charter-Review seats are held in households where the spouse is a major operator + Aransas Club / Cocke development arc + Avantstay/Sway/Portoro corporate STR seat reference.

**v1** (~1,800 words) → **v2** (~2,400 words, adds Lafayette + Aransas Club + food-truck section + 2009 anchor + Mustang Island Ventures sharpening + Starkey/Lafayette name corrections) → **v3** (~2,550 words, Charter Review elevated to dedicated § 3 with the lapsed-term finding). v3 staged at GitHub URL + sent via SMS to Collie + Nick.

Editorial calibrations locked:
- Tanya Chambers — OUT OF SCOPE (zero references)
- Marnie Pate — name-only-by-role-count
- Laurie Soechting / Fred Samudio / Scott Clanton — OUT OF SCOPE
- Winton's Guide / Winton's Candy — OUT OF SCOPE
- Owens family relationship — asserted; obituary detail kept internal only
- David Parsons "Oz" — described by role + tenure, not named
- Charles Crawford = Jr.
- Chad Shimaitis = FORMER P&Z Chair, current Council Place 1

### 4. Editorial — Francisca courtesy reply sent

Sent from `admin@theportalocal.com` to `fnixon@cityofportaransas.org` (CC `parecords@cityofportaransas.org`). Items 2 / 3 / 5 closed on our side; items 1, 4 + officer-side equivalent of #3 (Form CIS § 176.003 + § 171.004 affidavits naming the same entities) explicitly named for the focused follow-up.

### 5. Editorial — Dispatch v3 sent to Collie + Nick via SMS

URL: https://github.com/haveebot/port-a-local/blob/editorial/pz-capture-draft-v2/Port%20A%20Local/Dispatch%20Research/P%26Z%20Capture%20%E2%80%94%20Draft%20v3.md

Sent from PAL Twilio `+13614281706` (Messaging Service) to:
- Nick `+15122015353` — SID `SMf09d5602fa61a6c3a812ba792373ae4e`, status accepted
- Collie `+12107095771` — SID `SMa1ff8fdc22a6488ee38c75182840cf22`, status accepted

### 6. Collie InDeployed at PAL

Pre-flight verified via `super-admins.ts` + branch protection audit. Onboarding email sent ("PAL design station — easy launch"). Empirical floor: 2 terminal commands + 2 Mac password entries, ~30 min. **PR #19** (CONTRIBUTORS.md) merged by `colliebreah` herself at 18:11:22 UTC; ~3 min PR-to-production.

**Five Collie PRs total** (+787/-375 lines):

| PR | Title | Merged |
|---|---|---|
| #19 | Add Collie as design contributor | 18:11 UTC |
| #21 | Homepage redesign + Mother's Day weekend guide | 21:06 UTC |
| #22 | Gully as a brand character — Just Gully It + /gully + 404 | 23:46 UTC |
| #23 | Center Gully sections (Just Gully It, /gully, 404) | 00:05 UTC (5/8) |
| #25 | Mother's Day guide: hero image, booking links, homepage auto-hide | 01:31 UTC (5/8) |

Plus the surname correction: vault file renamed `Collie Caraker — Design.md` → `Collie Farley — Design.md`.

### 7. Lifecycle framework — PreDeploy / InDeploy / PostDeploy

HARD CROSS-PROJECT BRAND-DISCIPLINE RULE filed at `feedback_deploy_phase_naming.md`. Never bare "Deploy" alone — always temporal prefix. Reserved for HeyeDeploy (umbrella) + vertical products.

- **heyedeploy PR #1** (lifecycle docs) — MERGED 19:08:21 UTC. Four operations docs: pre-deploy.md + in-deploy.md + post-deploy.md + predeploy-checklist.md
- **PAL PR #20** (mirror to contributor-context) — MERGED 19:14:35 UTC

PreDeploy is brandable + billable as a service. Empirical InDeploy floor: 2 commands + 2 passwords. PostDeploy is the steady-state contribution loop.

### 8. heyedeploy architectural parity with PAL

heyedeploy `main` was originally `"Branch not protected"`. Now matches PAL exactly:

- `allow_auto_merge: true` + `delete_branch_on_merge: true` + `allow_update_branch: true` (also flipped on PAL)
- Branch protection on `main`: Vercel status check required, 0 approving reviews, code-owner reviews on protected paths only
- **heyedeploy PR #2** (CODEOWNERS) — MERGED 19:12:40 UTC
- Collie invited as collaborator with `write` permission (invitation ID 317854160 — pending her acceptance)

### 9. Contact-ledger discovery rule + profile updates

Caught by Winston that I asked for Nick's + Collie's phone numbers when they were already in `port-a-local/src/data/super-admins.ts`. Filed HARD CROSS-PROJECT RULE `feedback_contact_ledger_check_first.md` with explicit discovery hierarchy (super-admins.ts + insiders.ts + wheelhousePush.ts + People & Vendors profiles + workspace .env). Updated PAL vault profiles with full Contact blocks + corrected Collie's surname (Caraker → Farley). **PAL PR #24** (chore/contact-ledger-discovery) — auto-merge enabled, finishing as of writing.

Locked super-admin contacts:

| Slug | Name | Cell | Email |
|---|---|---|---|
| winston | Winston Caraker | `+15125681725` | `winstonciv@gmail.com` (personal) / `admin@theportalocal.com` (PAL ops) |
| nick | Nick Merrill | `+15122015353` | `nickbmerrill@gmail.com` |
| collie | Collie Farley | `+12107095771` | `collie.breah@gmail.com` |

PAL Twilio sender: `+13614281706`.

### 10. heyedeploy contributor-context folder

For Collie's next-session lock-in. **heyedeploy PR #3** (chore/contributor-context-folder) — MERGED 02:21:47 UTC. Contains:

- README.md (orients framework-tier contributors)
- contributor-launch.md (heyedeploy InDeploy ritual)
- pal-brand-inheritance.md (one-way upstream-flow discipline)
- 10 cross-project memory rule mirrors

Plus `heyedeploy/CLAUDE.md` updated to point Tier 1 design contributors at `contributor-context/README.md` first.

HARD CROSS-PROJECT INFRASTRUCTURE RULE filed at `feedback_contributor_context_mirror.md` — every Heye Lab repo with Tier 1+ contributor access has a `contributor-context/` folder. Future tenants inherit this canonically.

---

## All session PRs at a glance

**heyedeploy (3 PRs all merged):**
- #1 Lifecycle: Pre/In/Post Deploy framework — 19:08 UTC
- #2 CODEOWNERS — agent-driven contributor autonomy — 19:12 UTC
- #3 contributor-context folder — 02:21 UTC

**PAL (7 PRs, 6 merged + 1 finishing):**
- #19 Add Collie as design contributor (Collie) — 18:11 UTC
- #20 contributor-context: mirror lifecycle framework — 19:14 UTC
- #21 Homepage redesign + Mother's Day weekend guide (Collie) — 21:06 UTC
- #22 Gully as a brand character (Collie) — 23:46 UTC
- #23 Center Gully sections (Collie) — 00:05 UTC
- #24 chore: contact-ledger — fill super-admin contacts in vault profiles — auto-merging
- #25 Mother's Day guide hero + booking links + homepage auto-hide (Collie) — 01:31 UTC

**Workspace memory (5 new HARD CROSS-PROJECT rules):**
- `feedback_deploy_phase_naming.md` — Pre/In/Post Deploy discipline
- `feedback_pal_synthesis_journalism.md` — records floor, synthesis is the value
- `feedback_email_recipient_verify.md` — pre-send To/CC/BCC check + screenshot test
- `feedback_contact_ledger_check_first.md` — discovery hierarchy for internal contacts
- `feedback_contributor_context_mirror.md` — every Heye Lab repo gets contributor-context

---

## Open dials, ranked

| # | Dial | Effort | Notes |
|---|---|---|---|
| 1 | **Collie accepts heyedeploy invite** | her side | Visible at https://github.com/haveebot/heyedeploy/invitations. Once accepted, contributor-context auto-loads on next heyedeploy session. |
| 2 | **Editorial — Dispatch v3 publication path** | gated on Collie's read | v3 staged + sent. Awaiting tonal read on the absence-of-records paragraph + open editorial questions in the matrix roadmap memo. Ship criteria explicit. |
| 3 | **Francisca focused follow-up** | PINNED | CIQ narrowing + officer-side equivalent of #3 (CIS + § 171.004) + AG opinion confirm. Awaiting Winston + Collie scope review. |
| 4 | AG opinion request for 2019 bidder responses | passive after filing | 45-60 day wait; file after focused follow-up locks. Drives the eventual Part 2 Dispatch. |
| 5 | Watch list (Bron Doyle / Angie Axtell) | passive | 7-day TTL on both |
| 6 | Jeremiah's photos | ~15 min | When Angie sends |
| 7 | Push parked autoBoost.ts | 30-60 min | Still on `inbox/forward-stranger-sms-to-admin` |
| 8 | Polish debug-perms diagnostic | ~15 min | Drop 2 false-positive checks |
| 9 | Operator approval queue | 4-8 hr | Biggest editorial-quality lever |
| 10 | Day-of-week templates / Quick-fire / Sunday brief | each 2-4 hr | Gated on #9 |
| 11 | Civicweb backfill 2010-2018 + 2021-2025 | bigger pull | Closes Lorette P&Z tenure dates + Mark Winton Council 2023-2025 votes |
| 12 | Wayback Tourism Bureau historical chair tenure | needs browser | Could retroactively unblock the dropped Kim Winton Chair claim |
| 13 | Wheelhouse social UI cleanup | 2-4 hr | Needs Collie design input |
| 14 | HeyeDeploy framework promotions | hub-level | Lifecycle naming pattern, agent-driven autonomy mirror, PreDeploy productization, contributor-context replication, contact-ledger discovery hierarchy, email-recipient-verify, synthesis-journalism — all locked tonight |

## Pre-2026-05-06 open PRs (still untouched)

Need a separate triage pass:

- `#1` — Staff app Palm Republic brand polish
- `#2` — Customer iOS app native shell
- `#3` — Staff app Mock Mode for demos
- `#4` — Checkout price-IDOR hotfix
- `#5` — Maintenance HTML injection hotfix
- `#8` — Events: this-week slate (May 9-10) + 2 new recurring fixtures (Collie editorial, AM-session draft)

---

## Truck status

- [x] Francisca courtesy/holding reply sent (admin@ → fnixon@, CC parecords@) — items 2/3/5 closed; 1/4/officer-side held for focused follow-up
- [x] Dispatch v3 staged + sent to Collie + Nick via SMS
- [x] Editorial roadmap memo filed at bottom of Network Ties matrix
- [x] All session PRs merged on main (PAL #19-#25 except #24 finishing; heyedeploy #1-#3)
- [x] FB billing settled; auto-cron resumed
- [x] Civicweb minutes (20 packets) + 3 records-pull rounds + food-truck research saved
- [x] All 5 new memory rules filed + MEMORY.md indexed
- [x] heyedeploy contributor-context folder live + CLAUDE.md updated
- [x] PAL `project_pa_local.md` Current State refreshed (this session's continuation update)
- [x] Handoff brief filed (this doc — full PM rewrite)
- [ ] Collie accepts heyedeploy invite — her action
- [ ] Francisca focused follow-up — waits on scope review
- [ ] Collie's tonal read on Dispatch v3 — awaiting

## Pickup-here for next session

1. **Arnold drill**: read this brief + project memory + relevant feedback files (especially the 5 new memory rules locked tonight)
2. **Verify Collie accepted heyedeploy invite** — `gh api repos/haveebot/heyedeploy/collaborators/colliebreah/permission --jq '.permission'` → `write`
3. **Survey Collie's overnight PRs** — `gh pr list --repo haveebot/port-a-local --author colliebreah --state all --limit 15` (last visible was #25 at 01:31 UTC)
4. **Sweep replies** — admin@theportalocal.com inbox + haveebot inbox + PAL inbound SMS — looking for:
   - Collie's tonal read on Dispatch v3
   - Nick's reaction to Dispatch v3
   - Bron Doyle reply
   - Angie Axtell follow-up (Jeremiah's photos)
   - Adam Porto / Katie Rogers / Chris Jordan replies
   - Francisca (no expected reply yet — courtesy reply just sent)
5. **If Collie + Winston have decided narrowed-CIQ scope**: send Francisca focused follow-up
6. **If Dispatch v3 is moving to publish**: integrate Collie's tonal feedback + lock the headline; otherwise let it sit
7. **If Collie has opened heyedeploy in her own session**: surface what she's working on at the framework level
8. Otherwise pick from open dials by priority

---

## What changed in the system today (longest-running session in PAL history)

- 10 PRs merged across PAL + heyedeploy
- 5 new HARD CROSS-PROJECT memory rules
- 2 repos now share full architectural parity (CODEOWNERS, branch protection, auto-merge, contributor-context)
- 1 new tier-1 contributor canonically InDeployed (Collie)
- 1 new lifecycle framework named + locked (PreDeploy / InDeploy / PostDeploy)
- 1 Dispatch piece moved from outline to v3 staged + sent
- 1 brand character introduced (Gully)
- 1 City Secretary's TPIA reply parsed + courtesy-replied
- 1 disclosure-regime architecture finding documented (zero CIQ records for the named developer entities, 2017-present)
- 1 rubric-not-in-public-packet finding (the seven words on page 71)
- 1 brokerage-tier-captures-Tourism-Bureau finding (Mustang Island Ventures LLC + Hentz CEO chain)

**Filed 2026-05-08 02:30 UTC. Hub session ran ~9 hours from arnold to truck. Cleanest landing in operator-history. Fresh session: confirm Collie accepted heyedeploy invite, surface her overnight work, then move on dials.**
