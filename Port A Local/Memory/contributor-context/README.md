# Contributor context

A curated subset of HeyeLab cross-project rules + brand canonicals that Claude on a contributor's Mac auto-loads when the PAL repo is opened. Lives here so contributors get consistent design / brand / voice context without needing access to the full operator memory vault (`workspace-memory`).

## What's in here

| File | Why a PAL contributor needs it |
|---|---|
| `feedback_pal_brand_system.md` | PAL's brand voice, asset locations, Collie's design rules |
| `feedback_consumer_ux_for_non_tech_operators.md` | Cross-project UX principle — tile launchers, hide-dev-metadata, consumer-app feel |
| `feedback_pal_doesnt_gatekeep.md` | Design philosophy — quality is surfaced, not enforced; default to "let them in" |
| `feedback_pal_email_signature.md` | Voice for any copy that touches transactional emails (PAL entity-only voice) |
| `feedback_heyelab_brand_spelling.md` | HeyeLab one-word for marketing, Heye Lab two-word for legal — applies anywhere PAL footers reference the umbrella |
| `feedback_heyedeploy_collie_validation.md` | The HeyeDeploy brand tokens (Collie-validated 2026-05-04) — colors, type, Pattern B architecture-layer color split |
| `feedback_deploy_phase_naming.md` | The Pre/In/Post Deploy lifecycle naming discipline — never bare "Deploy" alone (locked 2026-05-07) |
| `feedback_launch_prompt_autonomy.md` | Launch prompts must let Claude run the full technical chain autonomously; only stop for human-judgment inputs (filed 2026-05-11 after Collie's brons-beach launch) |

## Deploy lifecycle docs

The HeyeDeploy lifecycle has three phases — PreDeploy → InDeploy → PostDeploy. Cross-tier framework + checklists:

| File | What it covers |
|---|---|
| `pre-deploy.md` | PreDeploy phase framework — pre-flight (accounts, tools, identity, machine prep) |
| `in-deploy.md` | InDeploy phase framework — the launch ritual itself (what Collie executed at her kitchen table) |
| `post-deploy.md` | PostDeploy phase framework — operating mode, ongoing PR flow, tier graduation |
| `predeploy-checklist.md` | Operator-facing checklist for PreDeploy — tier-aware (design contributor / operator / tenant) |
| `onboarding-design-contributor.md` | Tier 1 scope rules + brand resources (cross-tier reference) |
| `pal-design-contributor-launch.md` | Tier 1 InDeploy ritual (what Collie executed during her own InDeploy) |

## Maintenance

These are **curated mirrors** of files in the operator-tier `workspace-memory` vault. The canonical versions update over time (rarely — these rules are stable once locked).

**To refresh:** Winston (or anyone with workspace-memory access) re-copies updated files into this directory periodically. Stale-risk is low because these rules don't churn often.

**To add a new design-relevant memory:** copy from workspace-memory into this directory + commit. The contributor's Claude will auto-load on next session.

## How your work is captured

Your sessions don't have a separate "truck" or end-of-session ritual — capture is seamless and operator-side:

- **Your PR description IS your handoff brief.** Write it like an operator truck: what shipped, why, what's next, what to watch. The operator reads PR descriptions as the handoff. No separate doc to file.
- **Cross-Heye productivity is auto-aggregated.** A workspace script (`contributor_activity.py`) regenerates a `memory/contributor_<slug>.md` log from your merged PRs across every Heye Lab repo. Operator scans it during their start-of-session drill.
- **Pattern-promotion is operator-driven.** When you ship something framework-relevant, the operator catches it in the activity scan and promotes to `heyedeploy/patterns/`. You don't file separate pattern docs upfront.

Net: you ship PRs with thoughtful descriptions, the rest happens automatically. No extra workflow.

---

## Contribution back

If you (or your Claude) discover a new pattern, design observation, or convention while working on PAL, add a note in this directory under `contributor-insights/<slug>.md`. These get reviewed by Winston during PR review and promoted to HeyeDeploy framework when patterns emerge.

This is the spoke→hub contribution path — every spoke contributes back to HeyeLab framework. Mandatory, not optional.
