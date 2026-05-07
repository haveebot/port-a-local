# PostDeploy — phase framework

_Phase 3 of 3 in the HeyeDeploy lifecycle. Cross-tier (design contributor, operator, tenant). Locked 2026-05-07 PM during Collie Farley's first canonical design-contributor InDeploy._

> **Naming discipline**: Always `PostDeploy` (one word, capital P, capital D). Never bare "Deploy." See `feedback_deploy_phase_naming.md`.

---

## What it is

Operating mode. Everything that happens after InDeploy lands the contributor or tenant successfully. The steady-state contribution loop, tier graduation, ongoing PR flow + brand work, support and retainer work, and the spoke→hub pattern-contribution path.

PostDeploy is the **longest** phase by duration and the most **leveraged** by outcome. PreDeploy + InDeploy are tactical engagements measured in hours and minutes; PostDeploy is the partnership measured in months and years.

## What's in scope

PostDeploy covers everything that makes the contributor or tenant **continuously successful**:

- **Steady-state PR flow** — design contributors shipping brand / copy / cosmetic changes; checks gate, not humans; auto-merge on green
- **Tier graduation** — Tier 1 → Tier 2 expansion as track record builds (more autonomy, more scope, more code-owner status)
- **Memory refresh** — periodic re-mirror of `contributor-context/` files when canonical rules update in the operator-tier vault
- **Spoke→hub contribution** — every spoke contributes back to HeyeLab framework (mandatory, not optional). Patterns discovered during PostDeploy get promoted to HeyeDeploy framework templates.
- **Brand evolution** — Collie-tier work continuously refining the tenant's brand surfaces; OG cards, marketing pages, voice rules
- **Operator coaching** — when an operator (Winston-role) needs to step in vs. let the contributor own the lane
- **Tier-specific rituals** — Wheelhouse orient sessions, Arnold drills, handoff protocols, truck/sync cadence
- **Quality bar** — what "going smoothly" looks like; when to interrupt; when to let the system run
- **Retainer / billing** (tenant tier) — ongoing engagement structure; scope of operator support; SLA on response

What's NOT in scope for PostDeploy:

- ❌ Re-onboarding work — that's a fresh PreDeploy + InDeploy cycle, not PostDeploy
- ❌ Major scope expansions that change the tier — tier graduation IS in scope, but tier-jumping (Tier 1 → operator-tier full vault) is its own deliberate engagement
- ❌ Sunset / wind-down — that's `UnDeploy` (a future phase to be defined when first needed)

## Deliverable

Continuous, not one-shot:

- **For design contributors**: a steady cadence of merged PRs without human review bottleneck on free-merge surfaces; quality holding; tier graduation when track record warrants.
- **For operators**: a substantive operating partnership — direct work on tenant code, operator-tier vault access, hub-spoke contribution back to framework.
- **For tenants**: a living tenant — daily transactions clearing, content updating, customer-facing surfaces evolving, bookings/orders/whatever-the-vertical-does landing reliably.

There's no "PostDeploy done" milestone. PostDeploy ends only when the contributor or tenant relationship ends.

## Tier-specific PostDeploy patterns

| Tier | What PostDeploy looks like |
|---|---|
| **Design contributor** (Tier 1) | Brand / copy / cosmetic PRs auto-merging on green; periodic Collie-tier review of shipped work; tier graduation to Tier 2 when ready |
| **Operator** (Tier 2) | Multi-repo work, code-owner status on protected paths, hub-session participation, daily handoffs / truck protocol, Wheelhouse orient + Arnold drill rituals |
| **Tenant** (customer-facing) | Tenant operating mode — Wheelhouse, daily ops, monthly revenue review, quarterly feature roadmap, ongoing brand evolution. Operator retainer covers questions, breakages, evolution. |

## The empirical pattern (Tier 1)

Measured during the PAL design-contributor canonical (Collie Farley):

- **Cadence**: Variable. PRs land when there's brand/copy work to do; weeks may pass with no PRs, then a flurry around an editorial drop or brand refresh.
- **Quality bar**: Each PR is a discrete change with a clear visual / brand outcome. Vercel preview is the validation.
- **Time per PR**: Minutes to hours of contributor work; <3 min from PR-open to production deploy.
- **Operator involvement**: Coaching the auto-merge enable on the first PR; otherwise none unless the contributor explicitly asks.
- **Tier graduation criteria** (TBD, locked when first contributor crosses the threshold): Sustained PR cadence + clean record on free-merge surfaces + a clear lane the contributor is ready to own end-to-end.

## Coaching cues for the operator (Winston-role)

When to step in during PostDeploy:

- **Yes, when the contributor explicitly asks**. They own the lane; you're a resource, not a gate.
- **Yes, for protected-path work**. CODEOWNERS-protected changes (backend, auth, DB, payments, build config) require operator review by definition.
- **Yes, when the contributor's Claude reports a stuck state**. Especially around the boundaries of their tier — surface the boundary, expand it deliberately if appropriate, otherwise reroute.
- **Yes, when patterns emerge** worth promoting back to HeyeDeploy framework.

When NOT to step in:

- **No, on free-merge surfaces** unless asked. The whole architecture exists to keep you out of the contributor's flow on cosmetic work.
- **No, by retroactively reviewing merged PRs** unless something visibly broke. Trust the gate; ship-and-iterate.
- **No, by gatekeeping brand evolution**. The contributor (especially a Collie-tier brand keeper) IS the canonical for brand voice; defer to their judgment on what they own.

## Spoke→hub contribution path

Every contributor's PostDeploy work feeds the HeyeLab framework. Mandatory, not optional. Per `feedback_hub_spoke_architecture.md`:

- Patterns discovered during PostDeploy get noted in `contributor-context/contributor-insights/<slug>.md`
- Operator reviews these during regular check-ins
- Promotable patterns become HeyeDeploy framework templates
- Templates inform the next tenant's PreDeploy + InDeploy

This is what makes HeyeDeploy compounding. Year 1 contributors do hand-crafted work; Year 2 contributors inherit the patterns Year 1 discovered. Every PostDeploy cycle adds to the substrate.

## Tier graduation

Tier 1 → Tier 2 graduation is its own deliberate engagement, not automatic:

- **Trigger**: Contributor or operator initiates the conversation. Sustained PR cadence + clean track record + identified scope to expand into are usually preconditions.
- **Scope expansion**: Add CODEOWNERS-protected paths to the contributor's review scope; expand `contributor-context/` to include more memory; potentially add operator-tier substrate (workspace memory mirror, .env access for specific systems, etc.)
- **PreDeploy delta**: A graduation usually triggers a small PreDeploy delta — new auth, new repo access, new toolchain. Same checklist discipline.
- **Reversibility**: Graduations are reversible. Tier 2 → Tier 1 if scope contracts. No drama; just an acknowledgment that lanes shifted.

## Failure modes during PostDeploy

| Failure | Recovery |
|---|---|
| Contributor pushes to a CODEOWNERS-protected path accidentally | CODEOWNERS catches it; PR sits awaiting review; operator reviews + either approves with note or asks contributor to revert + redo on a different path |
| Auto-merge stops working — PR sits at green-no-merge | Re-run `gh pr merge <PR#> --auto --squash`; if recurring, audit branch protection settings |
| Memory `contributor-context/` goes stale | Operator re-mirrors from operator-tier vault; commit the refresh to the tenant repo; contributor's Claude picks up on next session |
| Contributor's Claude can't access something it should be able to | Audit the curated memory list; add the missing file if appropriate; or surface that the request crosses a tier boundary |
| Pattern emerges that should be promoted | File `contributor-insights/<slug>.md`; operator reviews; promote to HeyeDeploy framework when patterns from 2+ tenants converge |

## How PostDeploy is sold (tenant tier)

For tenant deployments, PostDeploy is the **retainer engagement**:

- **Inputs**: Tenant on-domain, transacting, with a designated point-of-contact on customer side
- **Operator does**: Steady-state ops support, brand evolution, feature requests triaged + scoped, monthly review, quarterly roadmap
- **Deliverable**: Tenant continuously successful, on-domain, on-brand, transacting
- **Pricing model**: Monthly retainer (TBD with second tenant). Higher tiers include faster response, more brand work, more roadmap influence.

The customer-facing pitch: *"We don't disappear after launch. We operate alongside you."*

## Pairs with

- [`pre-deploy.md`](pre-deploy.md) — what InDeploy hands off from
- [`in-deploy.md`](in-deploy.md) — what hands into PostDeploy
- [`predeploy-checklist.md`](predeploy-checklist.md) — operator-facing PreDeploy checklist
- [`onboarding-design-contributor.md`](onboarding-design-contributor.md) — Tier 1 tier graduation rules
- [`agent-trust-ladder.md`](agent-trust-ladder.md) — graduated trust across operator-customer relationship
- [`../components/onboard-deploy.md`](../components/onboard-deploy.md) — tech engine consumed during InDeploy; substrate continues to evolve during PostDeploy
- Memory: `feedback_hub_spoke_architecture.md`, `feedback_agent_driven_contributor_autonomy.md`, `feedback_deploy_phase_naming.md`

## Filed: 2026-05-07 PM

Phase name + framework locked alongside PreDeploy + InDeploy. PostDeploy is currently active for: PAL operator-tier (Winston), PAL design-contributor-tier (Collie, as of 18:11 UTC today). First tenant PostDeploy will start when Bron's or Sandfest goes live.
