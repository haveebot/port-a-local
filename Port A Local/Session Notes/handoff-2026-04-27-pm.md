# PAL Handoff — 2026-04-27 (PM)

_Second handoff today. The morning one (`handoff-2026-04-27.md`) closed out the cascades + discoverability drill. This PM handoff closes out the Wheelhouse cross-project lock-in._

---

## What just shipped this stretch

**Theme:** Lock the Wheelhouse pattern in as the cross-project standard before we replicate it to CrossRef / Sage Em / future Heye Lab tenants. Started with a real bug — `python3 wheelhouse.py orient` couldn't run in Bash-tool sessions because the agent CLI read tokens strictly from `os.environ` — and ended with a documented zero-touch token-rotation flow that works for every future project.

**Last commits:**
- `0599521` (workspace) — `wheelhouse.py: auto-load workspace/.env, document cross-project pattern`
- `05adb17` (port-a-local) — `PAL memory mirror: add Wheelhouse cross-project pattern`

**What landed:**
1. **`scripts/wheelhouse.py` auto-loads `workspace/.env`.** Lookup chain: process env → `.env` file → clean error pointing at the right file. Mirrors `haveebot_mail.py`. Stdlib only.
2. **WHEELHOUSE_TOKEN_WINSTON_CLAUDE rotated cleanly via CLI.** Old token (couldn't be retrieved — Sensitive in Vercel) replaced with fresh 32-byte URL-safe random. New token in workspace/.env (gitignored). Production redeployed (`4jtzblbyo`). `whoami` and `orient` both verified working live.
3. **Bug filed for posterity:** `cat token | vercel env add NAME ENV` preserves the trailing newline as literal `\n` inside the stored value. Manifest: middleware 401s even when tokens "match." Fix: use `--value="$TOKEN" --sensitive --yes` instead of stdin pipe.
4. **Cross-project Wheelhouse pattern memory-locked.** `feedback_wheelhouse_cross_project_pattern.md` filed. Indexed in MEMORY.md. Added to `sync-memory.sh` whitelist. Mirrored into PAL repo.
5. **The "Arnold" drill is now fully operational** — `orient` runs end-to-end in any Bash session with no shell setup.

---

## What's awaiting Winston (carries over from morning brief)

1. **Tyler — photo verification.** Tyler is approved + live on /locals (rent mode) but photos haven't landed yet. Per the doesn't-gatekeep rule, NOT a gate — just ping him for photos when convenient. (Same as morning.)
2. **Local Girls Cleaning brand review (Collie).** Brand placeholder for /housekeeping. (Same as morning.)
3. **License-plate field on existing runners.** Schema column added but only new signups fill it. Backfill plan needed. (Same as morning.)
4. **First sell-mode listing.** `LISTINGS` array still empty. Cascade is built and tested in build but never run live. (Same as morning.)
5. **Lowe's Market data verification.** Address/phone/hours best-guesses. (Same as morning.)
6. **A2P 10DLC clearance.** Pending Twilio. (Same as morning — external blocker.)

**New PM additions to your list — none.** This stretch was internal infrastructure, no new external dependencies.

---

## Top rocks for next session (re-ranked after PM work)

| Rock | Leverage | Time | Notes |
|------|----------|------|-------|
| **Stripe Connect onboarding for sell-mode vendors** | High | 1-2 hr | Same as morning brief. Today's cascade falls back to "PAL holds, manual payout" if vendor has no `stripeAccountId`. Build the magic-link Connect onboarding (mirror runner flow) → vendors get auto-paid on every sale. |
| **Validate locals-purchase cascade live** | High (de-risk) | 30 min | Same as morning. Need a sell-mode listing in `LISTINGS`. Could seed a `test-listing` row gated on env. |
| **Wheelhouse Pulse integration for new portals** | Medium | 30 min | Same as morning. Mirrors fire into pinned threads — surface housekeeping bookings + locals sales in the Pulse aggregator on /wheelhouse. |
| **Replicate Wheelhouse to CrossRef** | NEW — Medium-High | 2-3 hr | Pattern is now locked (`feedback_wheelhouse_cross_project_pattern.md`). When ready, copy PAL's `/wheelhouse` routes + middleware + DB tables, set per-agent Sensitive tokens in CrossRef's Vercel, override `WHEELHOUSE_API_URL` for the agent CLI. Documented step-by-step in the pattern doc. |
| **Add `wheelhouse.py rotate` subcommand** | Low | 30 min | Bake the rotation flow (generate → rm → add --value → write .env → redeploy) into the script itself. Currently lives in pattern-doc as a copy-pasteable shell snippet. Make it `python3 wheelhouse.py rotate winston-claude` and you're done. |
| **Homepage surface for housekeeping** | Medium | 30 min | Same as morning. Why-PAL tile / Services cluster mention on `/`. |
| **Housekeeping marketplace v2** | Low (premature) | Days | Same as morning. Wait for v1 volume. |
| **Order modification + runner ↔ customer comms (Phase 1)** | Medium | 2 hr | Same as morning. |
| **Convenience-store rollout (more stores)** | Medium | per-store | Same as morning. |
| **Runner Rewards Tier 2-4** | Deferred | — | Same as morning. |

---

## Recent decisions (now promoted to project memory file body)

- **Wheelhouse cross-project pattern locked.** Source: `feedback_wheelhouse_cross_project_pattern.md`. Promoted.
- **Token rotation: use `--value` flag, NOT stdin pipe.** Reason: Vercel preserves trailing newline as literal `\n`. Documented in pattern doc.
- **Edge middleware env vars require redeploy.** Verified — env var change without redeploy still rejects with 401.
- **All earlier morning decisions still hold** (PAL doesn't gatekeep, verify=live, outward-facing agnostic, 10% customer-pays fee, CityDeploy = Heye Lab SaaS-ified PAL).

---

## Direct quotes from Winston (intent signals, this stretch)

> "let's go ahead and fix the wheelhouse issue n0w - wheelhouse will be something we implement into all projects - wheelhouse needs to be perfect here first - make sense?"

> "shit, seriously, i have to do all of that manually?" — the prompt that pushed me to rotate via CLI instead of asking him to paste

> "that's what i'm talking about chef! very well done, thank you. go ahead and run a full truck and we'll keep rollin - if you need to - you tell me"

---

## Quick-restart command

Drop this into a fresh PAL chat:

> Do an arnold. Start from `Port A Local/Session Notes/handoff-2026-04-27-pm.md`. Then surface state and wait for my list — Winston has queued items from while usage was paused.

That command triggers the full arnold drill (briefs + project memory + orient + verification) per `feedback_arnold_startup_drill.md`. **DO NOT dive into the Stripe Connect rock until Winston shares his list** — he explicitly said he has queued items. The build brief at `Port A Local/Features/Locals Sell-mode Stripe Connect Onboarding — Build Brief.md` is the *proposed* top rock; Winston's list may reshuffle it.

## Top rock — fully designed, waiting on Winston's go-ahead

**`Port A Local/Features/Locals Sell-mode Stripe Connect Onboarding — Build Brief.md`** — full design doc with:
- Reference runner Connect flow files to mirror (3 files, 204 lines)
- Architectural fork explained (Path A: extend offers table — recommended; Path B: DB-back listings — defer)
- Build plan: schema + helpers, HMAC refactor, 3 API routes, vendor portal page, approval email update, Stripe webhook
- Test plan (Stripe test data, end-to-end flow)
- Edge cases (abandoned onboarding, leaked links, restricted accounts, multi-offer vendors, live vs test mode)
- 5 open questions for Winston to answer in first 5 min
- Time estimate: 1.5–2 hr practical with runner flow as copy template

Skim it BEFORE Winston shares his list — even if his list bumps it, you'll know what's queued.

## HeyeDeploy framing — every build is a template (across ALL Heye Lab projects)

Per Winston end-of-PM-session: **every pattern any Heye Lab project ships gets treated as a HeyeDeploy template**, not just patterns inside CityDeploy. Initial framing was CityDeploy-scoped (PAL specifically); refined same session to HeyeDeploy-scoped because the meta-pattern cuts across PAL + CrossRef + Sage Em + future projects.

**Three-tier hierarchy (don't conflate):**
- **HeyeDeploy** — framework / operating model. Cross-cuts everything Heye Lab does. Lives in `MEMORY.md`-level cross-project rules + `workspace/scripts/`.
- **`<Vertical>Deploy`** — vertical-specific SaaS product built USING HeyeDeploy patterns. CityDeploy is the first (small/mid-town local-marketplace SaaS).
- **Tenant instance** — concrete deployment of a `<Vertical>Deploy`. PAL is the first CityDeploy tenant.

The Stripe Connect onboarding rock above is itself a HeyeDeploy template-replication of the canonical runner Connect flow — the brief explicitly says *"Mirror it. Don't invent."* That's the meta-pattern.

When building anything reusable, reference `feedback_heyedeploy_pattern_thinking.md` and follow the rule: identify the canonical implementation across all Heye Lab projects, document the cross-project shape, ship it once with the template doc filed alongside.

---

## Verification before next session starts

```bash
# PAL repo — should be clean, latest commit 05adb17
cd /Users/winstoncaraker/Projects/workspace/port-a-local && git status && git log --oneline -3

# Workspace repo — last meaningful commit 0599521 (mine; .gitignore + crossref/ are pre-existing, not mine)
cd /Users/winstoncaraker/Projects/workspace && git log --oneline -3

# Production — should be Ready (latest deploy 4jtzblbyo from PM rotation)
cd /Users/winstoncaraker/Projects/workspace/port-a-local && vercel ls 2>&1 | head -4

# The arnold drill — should now work cleanly in any Bash context
python3 /Users/winstoncaraker/Projects/workspace/scripts/wheelhouse.py whoami
python3 /Users/winstoncaraker/Projects/workspace/scripts/wheelhouse.py orient

# Smoke test the four touched routes (still healthy from morning)
curl -s -o /dev/null -w "/housekeeping → %{http_code}\n" https://theportalocal.com/housekeeping
curl -s -o /dev/null -w "/locals → %{http_code}\n" https://theportalocal.com/locals
```

— The Port A Local
