# PAL handoff — 2026-05-07 PM (Collie InDeployed + lifecycle framework + heyedeploy twin)

_Full PM session: editorial research → records → email to Collie → Collie's first canonical InDeploy → lifecycle framework lock (PreDeploy/InDeploy/PostDeploy) → heyedeploy architectural parity with PAL. **Six PRs merged across two repos.** Empirical floor measured during Collie's launch: 2 terminal commands + 2 Mac password entries._

---

## Headline

**Collie shipped her first PR to PAL by her own hand at 18:11:22 UTC.** `CONTRIBUTORS.md` created with her bio. ~2 min PR-to-merged, ~3 min PR-to-production. First canonical Tier 1 design-contributor landing. Architecture validated end-to-end.

## ⚠️ Top awareness items next session

There's no blocking item. Three things to be aware of:

1. **Collie's heyedeploy invitation is pending her accept.** Visible at https://github.com/haveebot/heyedeploy/invitations. Once accepted, she has the same Tier 1 access on the framework repo as on PAL. Verify with `gh api repos/haveebot/heyedeploy/collaborators/colliebreah/permission --jq '.permission'` (returns `write` after acceptance).

2. **Francisca's TPIA reply is pinned** — waiting for Winston + Collie to review CIQ-narrowing scope. Recommended narrowing when ready: (a) Jan 2018–Mar 2019 around the Conference Center procurement, (b) any year naming Conference Center bidders/affiliates / Sea Oats / Cinnamon Shore / Palmilla / their principals.

3. **Dispatch piece (P&Z Capture) is substantively unlocked.** The civicweb finding + the named-entity zero-records finding mean the piece can publish on what's sourced now (~2,000 words) without waiting for AG opinion. Holding only on Collie's tonal read of the absence-of-records paragraph.

---

## What got shipped today PM

### FB billing fix (operator-side, pre-Collie)

Boost create has been broken since 2026-05-02 — `account_status = 3` (UNSETTLED). **Root cause confirmed by Winston: Stripe Issuing operational balance was empty.** Stripe Issuing cards draw from the connected account's balance, not a credit line — empty balance = declined auth = Meta UNSETTLED.

Fix: paid the $3.16 manually via different payment method in Meta. `account_status` returned to 1. Auto-cron resumed.

Memory rule updated at `feedback_meta_api_error_diagnostics.md` — now leads with the funding-balance mechanism + prevention pattern (pre-fund Stripe Issuing balance before linking card to any external billing system).

Two false-positive checks in `debug-perms` diagnostic still produce noise (low-priority polish, dial #8 below).

### Editorial: TPIA reply parsed + civicweb minutes pulled

**City Secretary Francisca Nixon replied** to PAL's April 29 TPIA on the 2019 Hotel + Conference Center procurement + Charter Review Commission records:

| Item | Status |
|---|---|
| #1 — All CIQ filings 2019-present | Asked us to narrow scope (project / contract / agenda item / date range) |
| #2 — All CIS filings 2019-present | Partially self-serve from cityofportaransas.org/elections/elections-november-2025/ |
| #3 — Filings naming Sea Oats / ZJZ / Bhakta / Cinnamon Shore / Lamkin (2017-present) | **CLOSED — zero records** |
| #4 — 2019 Hotel + Conference Center RFP/RFQ | Rubric + RFP doc received; bidder responses await AG opinion (45-60 days) |
| #5 — Charter Review Commission records | Listing received; agendas/minutes self-serve from civicweb |

**Civicweb minutes research agent ran in background** — pulled 20 council agenda packets (Jan 2019 → Dec 2020). Full SUMMARY at `port-a-local/Port A Local/Dispatch Research/civicweb-minutes-2018-2020/SUMMARY.md`.

**Headline civicweb finding:**
- **Rubric NOT in the public Jan 17, 2019 packet.** Item 7-H reads literally: *"INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW."* Resolution template was a procedural shell (wrong opponent "McCombs Properties" not Palmilla; blank awardee). Full-text search returns zero hits for *rubric*, *175*, *182*, *71.5*, or *74%*.
- **Crawford + Moore were on the RFP grading committee.** Two of seven voting council members had the rubric. The other five voted on a contract whose evaluation criteria had not been distributed in any publicly retrievable record.
- **Project relocated.** Jul 16, 2020 7-0 vote moved the conference center from Cinnamon Shore II to the Brookdale parcel under PA Waterfront, LP / The Brookdale Group, LLC. Nov 19, 2020 Resolution 2020-R59 (Second Amendment) extended Development Agreement to new SPV "The Inn, Spa & Conference Center, LP" through Dec 31, 2022.
- **Lamkin's developer timeline (in 2020-12-17 packet):** Close on land Feb 1, 2021 → PUD amendment Aug 1, 2021 → Infrastructure design Dec 31, 2021 → Groundbreaking Dec 31, 2022.

**Two emails to Collie via haveebot (both rendering well):**
- *P&Z Capture editorial — TPIA reply landed, review of where we stand* (HTML, full review of how TPIA reply changes the piece) — sent to `collie.breah@gmail.com`, fresh thread
- *Re: P&Z Capture editorial — TPIA reply landed, review of where we stand* (in-thread addendum after civicweb came back; smoking-gun finding surfaced)

### Collie InDeployed at PAL — first canonical Tier 1 design contributor

**Pre-flight verified end-to-end before launch:**
- GitHub `colliebreah` is a confirmed collaborator on `haveebot/port-a-local` with `write` permission
- Branch protection on main: Vercel required, 0 approving reviews, code-owner reviews only on protected paths
- Auto-merge enabled at repo level + `delete_branch_on_merge: true`
- Vercel preview chain working (verified via PR #18 from morning marathon)
- `CONTRIBUTORS.md` doesn't exist yet — first PR creates it

**Onboarding email sent** ("PAL design station — easy launch"), with two adjustments from the canonical runbook:
- Dropped CC to `winstonciv@gmail.com` (per email-routing memory rule)
- Softened closing for synchronous launch ("Winston's coaching this launch in person")
- Adjusted prompt's doc-reference paths from `heyedeploy/operations/...` to `Port A Local/Memory/contributor-context/...` (Tier 1 access doesn't include heyedeploy; the contributor-context mirror is accessible via the PAL clone)

**Empirical floor measured during her launch:**
- **2 terminal commands** during InDeploy (Homebrew install + Homebrew package install — OS confirmation requirement)
- **2 Mac password entries** (sudo prompts during Homebrew install + first directory creation under `/usr/local`)
- **~30 min** total InDeploy time including auth flows
- **~3 min** PR-to-production end-to-end

**PR #19 — "Add Collie as design contributor"** — merged by `colliebreah` herself at 18:11:22 UTC.

`CONTRIBUTORS.md` created with bio: *"Brand and design architect specializing in creative direction, graphic design, copywriting, and marketing strategy."* Production deploy fired at 18:12:24.

**One runbook gap discovered:** the runbook said "PR auto-merges once Vercel passes" but didn't tell her Claude to explicitly call `gh pr merge --auto --squash`. Auto-merge has to be enabled per PR. Winston already pushed commit `42b5bad` to fix the canonical `pal-design-contributor-launch.md`.

### PreDeploy / InDeploy / PostDeploy lifecycle framework locked

**Brand-discipline rule (HARD CROSS-PROJECT):** Never bare "Deploy" alone for a phase or sub-component. That's reserved for the umbrella (HeyeDeploy) + vertical products (MarketingDeploy, CityDeploy, ArchiveDeploy, OnboardDeploy). Phase names always carry a temporal prefix:

- **PreDeploy** = pre-flight (accounts, tools, identity, machine prep)
- **InDeploy** = launch ritual (the wrapper Collie just executed)
- **PostDeploy** = operating mode (steady-state PR flow, tier graduation, spoke→hub contribution)

Memory rule filed: `feedback_deploy_phase_naming.md`. Indexed in MEMORY.md alongside `feedback_heyedeploy_pattern_thinking.md`.

**PreDeploy as a brand surface:** the asymmetric value lives there. Done right, InDeploy is 30 min + 2 commands + 2 passwords (the floor measured tonight). Done wrong, hours of debugging accounts. That asymmetry is what makes PreDeploy productizable as a scoped engagement with a *"Cleared for InDeploy"* sign-off deliverable.

**Heyedeploy PR #1** — MERGED 19:08:21 UTC. Four docs:
- `operations/pre-deploy.md` — phase framework
- `operations/in-deploy.md` — phase framework
- `operations/post-deploy.md` — phase framework
- `operations/predeploy-checklist.md` — operator-facing checklist (tier-aware: Tier 1 / Tier 2 / Tenant)

**PAL PR #20** — MERGED 19:14:35 UTC. Mirrors all four lifecycle docs + the naming-discipline memory rule into `port-a-local/Port A Local/Memory/contributor-context/`. README updated. Branch had to be updated first because PAL's status check is `strict: true` and main moved between PR-open and Vercel-pass.

### Heyedeploy architectural parity with PAL

heyedeploy `main` was originally `"Branch not protected"`. Now matches PAL:

- `allow_auto_merge: true`
- `delete_branch_on_merge: true`
- `allow_update_branch: true` (also flipped on PAL — lets contributor Claudes self-serve `gh api -X PUT repos/.../pulls/<PR>/update-branch` when main moves)
- Branch protection on main: Vercel status check required, 0 approving reviews, code-owner reviews required on protected paths only

**Heyedeploy PR #2** — MERGED 19:12:40 UTC. CODEOWNERS file mirroring PAL's autonomy model. Protects framework canonical (`framework.md`, `components/`, `operations/`, `tenants/`, `verticals/`, `decision-log/`, `patterns/`) + build/config. Free-merge zone: `brand/**`, `site/pages|components|styles|public/**`, `docs/**`, `CONTRIBUTORS.md`.

**Collie invited as heyedeploy collaborator** — invitation ID 317854160, write permission, sent 19:11:47 UTC. Pending her acceptance via GitHub notification.

---

## Open dials, ranked

| # | Dial | Effort | Notes |
|---|---|---|---|
| 1 | **Collie accepts heyedeploy invite** | her side | Visible at https://github.com/haveebot/heyedeploy/invitations |
| 2 | **Francisca focused follow-up** (CIQ narrowing + AG opinion confirm + officer-side question) | PINNED | Waiting on Winston + Collie scope review. Courtesy/holding reply already sent 2026-05-07 PM closing items 2, 3, 5 and committing to a single focused follow-up on 1, 4, plus officer-side equivalent of #3 (Form CIS + § 171.004 affidavits naming the same entities). |
| 3 | **Dispatch piece draft (P&Z Capture)** | 4-8 hr | Now substantively unlocked. Gated on Collie's tonal read of absence-of-records paragraph |
| 4 | AG opinion request for bidder responses | passive after filing | 45-60 day wait; file after #2 narrowing locks |
| 5 | Watch list (Bron Doyle / Angie Axtell) | passive | 7-day TTL on both |
| 6 | Jeremiah's photos | ~15 min | When Angie sends |
| 7 | Push parked autoBoost.ts | 30-60 min | On `inbox/forward-stranger-sms-to-admin` |
| 8 | Polish debug-perms diagnostic | ~15 min | Drop 2 false-positive checks |
| 9 | Operator approval queue | 4-8 hr | Biggest editorial-quality lever |
| 10 | Day-of-week templates / Quick-fire / Sunday brief | each 2-4 hr | Gated on #9 |
| 11 | Wheelhouse social UI cleanup | 2-4 hr | Needs Collie design input |
| 12 | HeyeDeploy framework promotions | hub-level | Patterns from tonight (lifecycle naming, agent-driven autonomy mirror, PreDeploy productization) |

## Pre-2026-05-06 open PRs (still untouched)

Need a separate triage pass:

- `#1` — Staff app Palm Republic brand polish
- `#2` — Customer iOS app native shell
- `#3` — Staff app Mock Mode for demos
- `#4` — Checkout price-IDOR hotfix
- `#5` — Maintenance HTML injection hotfix

---

## Truck status

- [x] Francisca courtesy/holding reply sent (admin@ → fnixon@, CC parecords@) — items 2, 3, 5 closed; items 1, 4 + officer-side question held for focused follow-up
- [x] All session PRs merged (PAL #19, #20; heyedeploy #1, #2)
- [x] FB billing settled; `account_status = 1`; memory rule updated
- [x] Civicweb minutes pulled (20 packets) + SUMMARY.md filed
- [x] Two emails to Collie sent via haveebot
- [x] Collie InDeployed at PAL (PR #19 by her own hand)
- [x] Lifecycle framework locked + memory rule filed + MEMORY.md indexed
- [x] heyedeploy parity with PAL (CODEOWNERS, branch protection, repo settings)
- [x] Collie invited to heyedeploy (pending her accept)
- [x] PAL `project_pa_local.md` Current State refreshed
- [x] Handoff brief filed (this doc)
- [ ] Collie accepts heyedeploy invite — her action
- [ ] Francisca CIQ-narrowing reply — waits on scope review

## Pickup-here for next session

1. **Arnold drill**: read this brief + project memory + relevant feedback files
2. **Verify Collie accepted heyedeploy invite** (`gh api repos/haveebot/heyedeploy/collaborators/colliebreah/permission --jq '.permission'` → `write`)
3. **Sweep replies** — admin@theportalocal.com + haveebot inbox + PAL inbound SMS — looking for Collie's tonal read on the editorial review, Bron, Angie, Adam Porto, Katie Rogers, Chris Jordan
4. **If Collie weighed in on CIQ-narrowing scope**: send Francisca reply
5. **If Dispatch piece is moving**: integrate the civicweb findings (rubric NOT in public packet + Crawford/Moore on committee + Brookdale relocation) into § 5 of the P&Z Capture piece
6. Otherwise pick from open dials by priority

---

_Filed 2026-05-07 PM (UTC). Hub session ran ~6 hours from arnold to truck. **Headline event: Collie InDeployed at PAL — first canonical Tier 1 design-contributor landing.** Lifecycle framework locked alongside. Heyedeploy now architectural twin to PAL. **Fresh session: confirm Collie accepted the heyedeploy invite, then move on dials.**_
