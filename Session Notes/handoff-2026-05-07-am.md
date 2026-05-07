# PAL handoff — 2026-05-07 AM (continuation of 2026-05-06 marathon)

_Long evening session. **12 PRs merged** (#7–#18), two outreach pitches fired (Bron + Angie/Chef Matt), strict-rule hotfix swept + CI guard locked, SMS reply infra rebuilt (watch list + race fix), Meta billing root-cause finally cracked open after 5 days of silent failure._

---

## ⚠️ TOP PRIORITY NEXT SESSION — FB BILLING FIX

**Boost create has been broken since 2026-05-02.** Five days of missed paid-content opportunities. Root cause is now nailed:

**`account_status = 3` (UNSETTLED)** on the "Port A Local" Meta ad account. Meta tried to bill the Stripe Issuing card "PAL · FB Ads" (Mastercard *5656) for the **$3.16 outstanding balance** from Sunday's six boosts. The charge declined. Account flipped to UNSETTLED. Every subsequent boost create has hit the vague `creative: Permissions error` since.

**Action to take FIRST next session:**

1. **Stripe Dashboard → Issuing → "PAL · FB Ads"** → Authorizations → find the declined Meta charge → read the decline reason
2. **Meta Ads Manager → Billing & payment methods** for "Port A Local" ad account → "Pay now" the $3.16 with a different method (or re-attempt the same card if Stripe-side fix made)
3. **Verify the fix:**
   ```bash
   TOKEN=$(grep '^WHEELHOUSE_AGENT_TOKEN=' /Users/winstoncaraker/Projects/workspace/.env | cut -d= -f2-)
   curl -sS "https://theportalocal.com/api/wheelhouse/social/boost/debug-perms" \
     -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep account_status
   ```
   Should return `1` (Active). If still `3`, billing isn't settled yet.
4. **Resume boosting.** Auto-cron will pick up automatically once account_status returns to 1.

**Memory locked at** `feedback_meta_api_error_diagnostics.md` — the new diagnostic order is "billing first, scopes second" for any Meta `creative: Permissions error`. Stripe Issuing virtual cards on Meta have a known first-charge decline pattern; the rule lives in memory now.

---

## Watch list — what to expect

The new SMS watch list (PR #14) means inbound from these numbers fires an **elevated `🔔 WATCHED [<context>]` push** to the operator phone (race condition fixed too):

| Number | Context | TTL | Status |
|---|---|---|---|
| +13619462766 (Bron Doyle) | `bron-pitch` | 2026-05-14 | Replied 5/6 PM with phone preference. Winston driving close from here. |
| +19032407784 (Angie Axtell) | `chef-matt-catering` | 2026-05-14 | Replied to email with full data. Jeremiah's listing live, pending photos. |

Manage via:
```bash
curl -X POST .../api/wheelhouse/sms-watch -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"add","phone":"+1...","context":"...","ttlHours":168}'
curl .../api/wheelhouse/sms-watch -H "Authorization: Bearer $TOKEN"   # list
```

---

## What got shipped today

### Tenant outreach (real money in flight)

- **Bron Doyle** (Bron's Backyard + Beach Carts) — SMS sid `SMabac85b3e1629f3b546abc838cf48700` + email to brondoyle@yahoo.com. Pitched as HeyeDeploy beta tenant ("Crabcakes & Caviar + Jeremiah's" framing not used here — that's Angie's separate deal). Replied with phone-confirm. Winston's close.
- **Angie Axtell + Chef Matt Axtell** (Crabcakes & Caviar catering + Jeremiah's Boat Dock Grill) — SMS sid `SM1d8cd05ed663dde383fab101af11c80d` + email to info@crabcakesandcaviar.com. Two-thread pitch (free catering leads + add Jeremiah's to /eat). Angie replied within 5 hours with all the data. Both threads CLOSED on PAL's side: Jeremiah's full listing live (PR #15), Crabcakes & Caviar live as `/services` entry. **Open thread:** Jeremiah's photos pending Angie.
- Identity-clarifying follow-up SMS sent to Angie sid `SMf410e4391baab55bdc32dfa1c8e16350` (she "Liked" it).

### Collie's editorial set (3 emails → 3 PRs → 3 replies)

- **PR #7** Live Music week of May 7 (18 acts, Thu–Sun, Bron's hosting John Elijah Band Fri + Palacios Bros Sat) — MERGED
- **PR #8** Events this-week slate (May 9-10 one-offs + 2 new recurring fixtures) — MERGED. New "This Week" surface on /events auto-rotates by date.
- **PR #9** OG color system (4 card systems · 14 routes wired) — MERGED. Full spec from Collie's PDF (uid 294).
- 3 in-thread acks sent from Havee. **Open:** Collie owes the 3 missing OG colors (PAL Housekeeping · Maintenance Requests · Restaurant Partnerships) + plain-text list for the May 6-8 events that didn't render legibly in screenshots.

### Strict-rule hotfix sweep + lock

Collie spotted "Collie — Port A Local calendar..." rendering on /live-music. Rule was already in memory but not enforced:

- **PR #10** /live-music sourcedFrom strip — MERGED
- **PR #11** /brand (×2) + /beach/vendor/connect (×1) sweep — MERGED
- Memory rule **`feedback_pal_no_names_on_website.md`** locked as cross-surface superset of the email rule
- **PR #16** prebuild CI guard `scripts/check-no-names.js` — MERGED. Caught + fixed 3 additional violations the audit had missed (Saltwater Gypsies "friend of Collie's", Winton's Guide "family friends of Winston's", TWAT event content "Collie Caraker (PAL co-founder)"). Future leaks fail the build.

### OG color follow-up

- **PR #13** — 15 remaining routes wired to the category-driven color system. Now every `brandedOG` surface on PAL flows through Collie's spec. Skipped: `/` (custom hero), `events/[slug]` countdown, `dispatch/[slug]` stat/quote highlights — separate visual systems pending Collie review.

### SMS infrastructure

- **PR #14** SMS watch list + race fix — MERGED. New table `sms_watch_list` + `/api/wheelhouse/sms-watch` admin endpoint + race-condition fix on stranger inbound webhook (was fire-and-forget; now `Promise.allSettled` before TwiML return). Bron + Angie backfilled with 7-day TTLs.

### Catering completion

- **PR #12** Jeremiah's stub on /eat — MERGED
- **PR #15** Jeremiah's flesh-out (phone, hours, menu, vibe) + Crabcakes & Caviar new `/services` listing (phone for leads = (214) 402-5386 = Matt's cell) — MERGED
- **PR #17** boost debug-perms diagnostic endpoint — MERGED
- **PR #18** boost spend-breakdown diagnostic endpoint — MERGED

---

## Open dials, ranked

| # | Dial | Effort | Notes |
|---|---|---|---|
| 1 | **Fix FB billing** (above) | ~10 min, then verify | DO THIS FIRST — content opportunities rotting |
| 2 | Watch admin@ + PAL SMS for Bron / Angie / Adam Porto / Katie Rogers / Chris Jordan replies | passive | Watch list elevates Bron + Angie |
| 3 | Catering follow-up: Jeremiah's photos when Angie sends | ~15 min | Drop into businesses.ts entry once they arrive |
| 4 | Push parked autoBoost.ts | 30-60 min | Stashed on `inbox/forward-stranger-sms-to-admin` branch. Self-contained. Auto-boost-on-send option for pending posts. |
| 5 | Polish debug-perms diagnostic — drop the false-positive "tasks field" check + the over-eager scope warning for PAGE tokens | ~15 min | Caught in tonight's diagnosis; works fine but produces noise |
| 6 | Build operator approval queue for auto-drafted posts | 4-8 hr | Biggest editorial-quality lever per memory; would have prevented Sunday's OG cascade |
| 7 | Day-of-week editorial templates / Quick-fire composer / Sunday brief | each 2-4 hr | All depend on operator approval queue landing first |
| 8 | Wheelhouse social UI cleanup | 2-4 hr | Needs Collie design input |
| 9 | Travis L&EA portal access | 30-45 min | Re-consent gmail.send + L&EA logo + send the link. Asked 2026-04-30. |
| 10 | Promote 5 spoke-teed HeyeDeploy patterns to framework | hub-level | magic-link Gmail OAuth · two-role curate-ship · subdomain rewrite · verify-before-declare project memory · persisted-curation hierarchy dataset |
| 11 | CrossRef post-2M follow-up | passive | Awaiting Z's engineer feedback |
| 12 | Build PAL municipal features | bigger play | Civic moat for CityDeploy |

## Pre-2026-05-06 OPEN PRs (untouched tonight)

These were open before tonight's marathon and remain unmerged:
- `#5` — Maintenance HTML injection hotfix
- `#4` — Checkout price-IDOR hotfix
- `#3` — Staff app Mock Mode for demos
- `#2` — Customer iOS app native shell
- `#1` — Staff app Palm Republic brand polish

Worth a separate session pass to triage / merge / close.

## Truck status

- [x] All session PRs merged on main (#7-#18)
- [x] Memory updated: `feedback_meta_api_error_diagnostics.md` (billing-first rule), `project_brons.md` (Bron reply), `feedback_pal_no_names_on_website.md` (locked tonight), `MEMORY.md` (Bron + no-names links)
- [x] CI guard locked at build layer — future names violations fail prebuild
- [x] SMS watch list active for Bron + Angie (7-day TTL)
- [x] Both diagnostic endpoints live (debug-perms + spend-breakdown)
- [ ] **FB billing settlement — operator-side, next session**
- [ ] Jeremiah's photos when Angie sends them
- [ ] PAL project memory `project_pa_local.md` Current State refresh — pending separate update

## Pickup-here for next session

1. **Arnold drill**: read this brief + project memory + recent feedback files
2. **Fix FB billing first** (Stripe + Meta UI work, then verify with debug-perms)
3. **Confirm watch list still active** (`curl GET /api/wheelhouse/sms-watch`)
4. **Sweep replies**: admin@theportalocal.com inbox + PAL inbound SMS log
5. Then pick from open dials by priority

---

_Filed 2026-05-07 AM (UTC). Hub session ran ~6 hours of intensive shipping. Trucked clean per Winston's call. **Fresh session: settle the $3.16 first.**_
