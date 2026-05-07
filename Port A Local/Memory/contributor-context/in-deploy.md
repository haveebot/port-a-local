# InDeploy — phase framework

_Phase 2 of 3 in the HeyeDeploy lifecycle. Cross-tier (design contributor, operator, tenant). Locked 2026-05-07 PM during Collie Farley's first canonical design-contributor InDeploy._

> **Naming discipline**: Always `InDeploy` (one word, capital I, capital D). Never bare "Deploy." See `feedback_deploy_phase_naming.md`.

---

## What it is

The launch ritual. The "going live" moment. Everything that happens during the contributor's or tenant's first session — install, auth, clone, first PR, first production deploy — driven by the contributor's own credentials, against the substrate that PreDeploy already prepared.

InDeploy is the **observable** phase. PreDeploy is invisible work; InDeploy is what the contributor actually experiences, and what we measure. PostDeploy is everything afterward.

## What's in scope

InDeploy covers the launch ritual end-to-end:

- **Tool install** — Homebrew, git, node, gh, Claude desktop (most of this driven by the contributor's Claude via tool calls; the contributor sees a chat conversation, not a Terminal)
- **Auth flows** — `gh auth login` as the contributor's own GitHub account, Anthropic sign-in, browser-confirm flows
- **Clone** — `gh repo clone <org>/<tenant>` into the conventional `~/Projects/` parent
- **Memory inheritance** — the cloned repo's `Memory/contributor-context/` auto-loads in the contributor's Claude session
- **First PR** — adding the contributor to `CONTRIBUTORS.md` with a one-line bio (the validation loop)
- **First merge** — by the contributor's own credentials, not the operator's
- **First production deploy** — Vercel ships from main; the change is live on the tenant's domain in <90 sec

What's explicitly NOT in scope for InDeploy:

- ❌ Anything PreDeploy should have handled — accounts, identity decisions, machine prep
- ❌ Operator-tier substrate that Tier 1 doesn't need — workspace-memory mirror, Stop hook, agent tokens, Vercel team membership for design contributors
- ❌ Code changes beyond the validation loop — those happen in PostDeploy
- ❌ Tenant launch (customer-facing) data extraction — that's powered by `OnboardDeploy` (the tech engine), consumed during InDeploy but distinct from the InDeploy phase itself

## Deliverable

Two artifacts:

1. **First PR landed on `main`** — by the contributor's own credentials. Squash-merged, branch deleted. Production deploy fired.
2. **Contributor's session-memory pattern** — the contributor's Claude has the auto-merge enable command in session memory. Subsequent PRs auto-flow without coaching.

For tenant deployments, the artifact is also the **tenant going live on its custom domain** — first user-visible page rendering with the customer's data, not placeholder content.

## Tier-specific InDeploy rituals

Each tier has its own canonical InDeploy doc. The cross-tier framework lives here; the tier-specific rituals live alongside:

| Tier | Canonical InDeploy doc | What it covers |
|---|---|---|
| **Design contributor** (Tier 1) | [`pal-design-contributor-launch.md`](pal-design-contributor-launch.md) | The wrapper Collie ran. No Vercel team, no env vars, no `npm run dev`. Clone → first PR → auto-merge. |
| **Operator** (Tier 2) | [`sage-laptop-launch-runbook.md`](sage-laptop-launch-runbook.md) | Multi-repo clone, memory hydration, .env, Drive Desktop, Stop hook, Vercel × 3. |
| **Tenant** (customer-facing) | TBD — first canonical comes when Bron's or Sandfest lands | OnboardDeploy-driven extraction + validation + go-live on custom domain |

## The empirical floor (Tier 1)

Measured during Collie Farley's first canonical design-contributor InDeploy at PAL on 2026-05-07:

| Friction surface | Count | Why irreducible |
|---|---|---|
| Terminal commands the contributor types | **2** | Homebrew install + Homebrew package install (OS confirmation requirement) |
| Mac password entries | **2** | sudo during Homebrew + first directory creation under `/usr/local` |
| Browser tabs the contributor consciously interacts with | **2** | GitHub OAuth + Anthropic sign-in |
| Total InDeploy session time | ~30 min | Auth flows are manual; clone + first PR are scripted |
| PR open → production deploy | **~3 min** | PR `18:09:31` → Vercel green `18:10:30` → merged `18:11:22` → production fired `18:12:24` |

This is the floor without going to MDM-managed devices. Any future InDeploy that exceeds these bars is a regression worth investigating.

## Coaching cues for the operator (Winston-role)

When to step in during InDeploy:

- **Yes, step in once**: tell the contributor to tell their Claude to enable auto-merge with squash. One sentence of coaching, permanent fix for their session memory.
- **Yes, step in when surprised**: if their Claude reports a state that doesn't match GitHub/Vercel reality (e.g., "fully configured" when in fact a step is still pending), audit and clarify.
- **Yes, step in for OS-level prompts**: Mac password, 2FA push notifications, Apple ID confirmations — these are unavoidable and the operator can speed them up by being there.

When NOT to step in:

- **No, don't merge their PR**. Let them merge it themselves — that's the ownership signal. If you click merge for them, their mental model becomes "Winston is the activation step." The architecture exists to remove that bottleneck.
- **No, don't use your credentials**. Every action during InDeploy should be authenticated as the contributor, not the operator.
- **No, don't pre-write the bio for `CONTRIBUTORS.md`**. Their first PR is theirs. The bio is theirs. The ownership is theirs.
- **No, don't pre-fix issues their Claude is about to encounter**. The InDeploy ritual is partly about validating that their Claude can handle stuck points with coaching prompts. Let it work.

## Failure modes (and InDeploy recovery)

| Failure | Recovery |
|---|---|
| Browser auth lands on wrong GitHub account | Sign out of all accounts in the browser; retry `gh auth login` |
| Homebrew install fails — disk space / network | Clear blockers; restart from `/bin/bash -c ...` install command |
| Vercel preview never builds | Check the PR's checks tab → click into Vercel build → identify failing step (usually a typo or missing import); fix on branch; push again |
| First PR sits at green-checks-no-merge | Tell contributor's Claude to run `gh pr merge <PR#> --auto --squash`; permanent fix for the runbook gap |
| `Port A Local/Memory/contributor-context/` doesn't auto-load | Confirm the clone landed at the correct path; tell Claude to read the `README.md` in that folder explicitly |

If the same failure pattern recurs across two contributors, it's a PreDeploy fix, not an InDeploy fix. File the failure mode in the relevant runbook + push the prevention into PreDeploy.

## How InDeploy is sold (tenant tier)

For tenant deployments, InDeploy is the **observable launch event**:

- **Inputs**: A "Cleared for InDeploy" sign-off from PreDeploy + customer time on launch day
- **Operator does**: Drives the launch ritual alongside customer (kitchen-table-style or screen-share); customer's data extracts via OnboardDeploy; customer sees their tenant fill in real-time
- **Deliverable**: Tenant live on custom domain; customer logged in with their data; first transactional flow tested
- **Pricing model**: Fixed-fee per InDeploy event (TBD with second tenant). Premium for same-day-as-signed launches.

The customer-facing pitch leans on the empirical floor: *"You don't migrate. We do. You'll be live the same day you signed."*

## Pairs with

- [`pre-deploy.md`](pre-deploy.md) — what hands off into InDeploy
- [`post-deploy.md`](post-deploy.md) — what InDeploy hands off into
- [`pal-design-contributor-launch.md`](pal-design-contributor-launch.md) — Tier 1 canonical InDeploy ritual
- [`sage-laptop-launch-runbook.md`](sage-laptop-launch-runbook.md) — Tier 2 canonical InDeploy ritual
- [`onboarding-design-contributor.md`](onboarding-design-contributor.md) — Tier 1 scope rules
- [`../components/onboard-deploy.md`](../components/onboard-deploy.md) — the tech engine consumed by tenant-tier InDeploy
- Memory: `feedback_deploy_phase_naming.md`, `feedback_agent_driven_contributor_autonomy.md`, `feedback_if_winston_cant_no_customer_can.md`

## Filed: 2026-05-07 PM

Phase name + framework locked during Collie's first canonical run. The cross-tier framework here; tier-specific rituals in the docs alongside.
