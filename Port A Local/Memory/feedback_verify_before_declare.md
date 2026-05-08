---
name: Verify before declare — cross-project rule, hard
description: Before Claude claims that something exists / doesn't exist / was built / wasn't built / is bulletproof / is covered / is ready — Claude MUST audit the source of truth (runbook files, vault docs, verify-on-render outputs, file system state) BEFORE answering. Extrapolating from in-conversation recall is a violation. Locked 2026-04-30 PM after four documented misses in one session.
type: feedback
originSessionId: 2026-04-30-pm-laptop-bulletproof-discovery
---

Cross-project rule. Applies to all Heye Lab projects (Sage, PAL, CrossRef, future tenants). This is the verify-on-render discipline that today got locked into both Sage generators (`verify_v12()` on contracts, `verify_v11()` on briefs) — applied at the **conversation layer** to claims Claude makes to Winston.

## The rule

When Winston asks any of:

- "Is X bulletproof?"
- "Did we cover Y?"
- "Do we have a runbook for Z?"
- "Are we ready for [scenario]?"
- "Was [thing] built?"
- "Is [thing] backed up / synced / staged / done?"
- "Why don't we have [thing]?"
- "Should we build [thing]?" (which presupposes it doesn't exist)
- Any variant of the above

…Claude MUST audit the source of truth **before** answering. Source of truth means:

- Runbook files (`LAPTOP_MIGRATION.md`, `DUMPTRUCK.md`, etc.)
- Vault docs (`memory/`, `Strategy/`, `Documents/`)
- Generator verify output (`verify_v<X>()` results)
- Actual file system state (`find`, `grep`, `Read`)
- HQ Postgres state (when the question is about agencies / activity / users)
- Live URL state (`curl`, when the question is about what's deployed)

**Extrapolating from in-conversation recall is a violation.** Even when the answer feels obvious, even when context already covers it. The check is the cure. Recall is not the cure.

## What this rule replaces

This rule supersedes any softer version of the same idea — `feedback_systemic_gaps_check.md` had the right principle but didn't have teeth. Today's session had four documented misses despite that file existing in memory:

1. **Contract v1.1/v1.2 cascade** — prior session declared "v1.2 staged ready" without opening the PDF. Body content + metadata claim contradicted. Nobody looked. Two real signed agreements went out on the wrong version.
2. **Brief annotation extraction** — Claude pulled `/FreeText` only, skipped silent `/Highlight` + `/StrikeOut` + `/Underline` + `/Squiggly`. Missed 10 of 34 reviewer markups.
3. **Orphan-page declaration** — Claude declared each brief render "clean" via verify functions that didn't include layout density. Winston had to point out blank pages 4 and 7 each time.
4. **Laptop migration runbook** — Claude told Winston "cross-machine wasn't built." A 254-line runbook designed for that exact moment had been in the vault since 2026-04-22. Claude didn't `Read` it before answering.

In all four cases, the truth was checkable in seconds. Each time Claude extrapolated and was wrong. The pattern is consistent enough to lock as a rule.

## How this rule is enforced

There is no automated enforcement at the conversation layer (yet). Enforcement is behavioral:

1. **Before declaring**, Claude runs the source-of-truth check. Specifically:
   - For "is X built?" — `find` / `grep` / `Read` the relevant runbook or directory
   - For "is X bulletproof?" — audit per `feedback_systemic_gaps_check.md`: inbox state, log structure, ritual adherence, runbooks, verify functions, file system
   - For "should we build X?" — check what's already done before recommending
   - For "did Z happen?" — check HQ activity_events, Gmail, vault commits

2. **If Claude isn't willing to run the check** — Claude says "I'm not sure — let me check" instead of guessing. Acquiescence to a wrong premise is also a violation.

3. **If Winston pushes back on a Claude answer** — the FIRST move is to verify, not to acquiesce. "You're right" without checking is itself a verify-before-declare violation.

## Why this rule cross-applies

The same failure mode lives at every layer:
- **Code layer** — generators silently producing stale output. Cured by `verify_v<X>()` + `auto_archive_predecessor()`.
- **Conversation layer** — Claude answering from partial recall. Cured by THIS rule.
- **Workflow layer** — ritual erosion (skipped truck, stale memory). Cured by truck protocol + Arnold drill.

All three layers have the same logical structure: **check the source of truth before declaring**. This rule unifies the conversation layer with the others.

Cross-project applications:
- **Sage** — applies to every "is the contract executed?" / "is the brief shipped?" / "does the runbook cover X?" question
- **PAL** — applies to every "is the residence directory current?" / "is the dispatch ready to publish?" / "is the email cascade configured?" question
- **CrossRef** — applies to every "do we have the cross-ref data for [brand]?" / "is the search ready?" question
- **Heye Lab future tenants** — same shape, same rule

## Cross-references

- `feedback_systemic_gaps_check.md` — older version of this principle, narrower in scope. This file is the harder version.
- `feedback_sage_canonical_versioning.md` — verify-on-render at the code layer. Sister rule.
- `feedback_heyedeploy_pattern_thinking.md` — extended 2026-04-30 with verify-on-render lock as a HeyeDeploy pattern.
- `Session Notes/2026-04-30.md` — full record of the four documented misses that produced this rule.
- `Session Notes/handoff-2026-04-30.md` — Arnold-ready handoff brief.

---

_Filed 2026-04-30 PM after Winston: "everything I've thought we have been doing — do that — got it." This rule has teeth in its naming. Future sessions reading this file should treat verify-before-declare as a hard discipline, not a nice-to-have._
