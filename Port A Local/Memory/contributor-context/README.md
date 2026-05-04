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

## Maintenance

These are **curated mirrors** of files in the operator-tier `workspace-memory` vault. The canonical versions update over time (rarely — these rules are stable once locked).

**To refresh:** Winston (or anyone with workspace-memory access) re-copies updated files into this directory periodically. Stale-risk is low because these rules don't churn often.

**To add a new design-relevant memory:** copy from workspace-memory into this directory + commit. The contributor's Claude will auto-load on next session.

## Contribution back

If you (or your Claude) discover a new pattern, design observation, or convention while working on PAL, add a note in this directory under `contributor-insights/<slug>.md`. These get reviewed by Winston during PR review and promoted to HeyeDeploy framework when patterns emerge.

This is the spoke→hub contribution path — every spoke contributes back to HeyeLab framework. Mandatory, not optional.
