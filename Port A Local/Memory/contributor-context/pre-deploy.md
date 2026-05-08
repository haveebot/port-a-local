# PreDeploy — phase framework

_Phase 1 of 3 in the HeyeDeploy lifecycle. Cross-tier (design contributor, operator, tenant). Locked 2026-05-07 PM during Collie Farley's first canonical design-contributor InDeploy._

> **Naming discipline**: Always `PreDeploy` (one word, capital P, capital D — matches `HeyeDeploy` convention). Filenames may use kebab (`pre-deploy.md`); the in-text brand string is single-word camel-case. Never bare "Deploy" alone for any phase. See `feedback_deploy_phase_naming.md`.

---

## What it is

The pre-flight phase. Everything that has to be true *before* InDeploy day so that InDeploy itself is fast, smooth, and human-bearable.

PreDeploy is the phase where the **asymmetric value** in HeyeDeploy lives. Done right, InDeploy is two terminal commands and two Mac password entries — the floor measured during Collie's first canonical run. Done wrong, InDeploy is hours of debugging accounts, 2FA recovery, gh auth failures, and env-var misery — same launch ritual, completely different experience.

That asymmetry is what makes PreDeploy productizable.

## What's in scope

PreDeploy covers the prep that only a human can complete:

- **Identity** — Apple ID, GitHub account, Anthropic account, work-vs-personal identity decisions
- **2FA + recovery codes** — saved somewhere recoverable
- **Mac state** — admin password, macOS version floor, Apple Silicon vs Intel, disk space, network
- **Toolchain prep** — Xcode Command Line Tools (installs git for free, prevents Homebrew grumbling later)
- **Account collaborator status** — added to the right GitHub repo with the right permission level (write for design contributors)
- **Account vendor status** — Vercel team membership decisions, Anthropic Pro subscription confirmed
- **Identity decision: which Apple ID for App Store + iCloud** — not a blocker, but a decision worth surfacing
- **Pre-existing toolchain audit** — does the contributor already have node, npm, gh installed? Conflicting versions?

What's explicitly NOT in scope for PreDeploy:

- ❌ Any secret-handling (env vars, API keys, agent tokens) — that's operator-tier territory, not Tier 1
- ❌ Local dev server setup — Tier 1 contributors don't need `npm run dev` (Vercel preview is their live preview)
- ❌ Any actual code changes — code happens during InDeploy + PostDeploy
- ❌ Vercel team membership when not needed — design contributors don't need it

The omission list matters as much as the inclusion list. PreDeploy success means the contributor is cleared to start InDeploy without anything left to figure out.

## Deliverable

A single artifact: the **"Cleared for InDeploy" checklist**, signed off by the operator (the Winston-role) before InDeploy day is scheduled.

The checklist has measurable bars (see [`predeploy-checklist.md`](predeploy-checklist.md)). Either every box is checked, or InDeploy is rescheduled. There is no halfway state.

For tenant deployments (Bron's, Sandfest, future), the artifact is also the **billable proof of work**. Operator delivers a signed checklist + a green-light date for InDeploy. Customer pays against the deliverable.

## The empirical floor

Measured during Collie Farley's first canonical design-contributor InDeploy at PAL on 2026-05-07:

| Friction surface | Count | Why it can't be lower |
|---|---|---|
| Terminal commands the contributor types | 2 | Homebrew install + Homebrew package install — both require explicit confirmation per the OS |
| Mac password entries | 2 | sudo prompts during Homebrew install + first system directory creation under `/usr/local` |
| Total InDeploy time | ~30 min | Auth flows (gh + Anthropic) require manual browser confirmation; clone + npm install + first PR scripted |
| End-to-end PR-to-prod | <3 min | PR open → Vercel preview build → merge → production deploy |

This is the floor without going to MDM-managed devices. Two commands + two passwords is genuinely irreducible without enterprise-tier provisioning.

PreDeploy's job is to keep InDeploy at that floor. Anything that gets added to InDeploy because PreDeploy was incomplete is a regression we can measure and prevent.

## Phase ownership by tier

| Tier | Who owns PreDeploy | What it looks like |
|---|---|---|
| **Design contributor** (Tier 1) | Operator (Winston-role) prepares; contributor confirms accounts | ~15 min checklist pass, mostly verifying GitHub + Apple ID + Anthropic accounts exist |
| **Operator** (Tier 2) | Operator prepares own machine; senior operator audits | More substrate: workspace memory hydration, multiple repo clones, Stop hook, Vercel link × N |
| **Tenant** (customer-facing) | Heye Lab does PreDeploy as a scoped engagement | Identity discovery, account provisioning, machine prep on customer side, integration with customer's existing systems |

The phase is the same across tiers; the **scope of what's prepared** scales up.

## How PreDeploy is sold (tenant tier)

For tenant deployments, PreDeploy is a **fixed-scope engagement**:

- **Inputs**: Customer commits Mac, Apple ID, an admin contact, a 30-min PreDeploy session
- **Operator does**: Account audit, toolchain prep, identity decisions documented, custom-domain DNS pre-staged, Vercel project pre-provisioned, GitHub repo pre-staged with CODEOWNERS, branch protection, and starter content
- **Deliverable**: Signed "Cleared for InDeploy" checklist + green-light date
- **Pricing model**: Fixed-fee per tenant (TBD as second tenant lands and pattern firms up). Asymmetric value = asymmetric pricing leverage.

Customer can't argue with the deliverable because the floor is empirical. "We deliver a Mac that's cleared for InDeploy day" is a real promise with a measurable bar.

## Failure modes (and their PreDeploy fix)

What happens when PreDeploy is incomplete:

| Failure during InDeploy | PreDeploy fix |
|---|---|
| `gh auth login` redirects to wrong account | PreDeploy verifies the contributor signs in to GitHub on their browser as the right account before starting |
| Homebrew fails — Xcode CLT missing | PreDeploy installs Xcode CLT in advance OR prompts during PreDeploy session |
| 2FA code unreachable mid-flow | PreDeploy verifies recovery codes are saved + accessible |
| Vercel preview never builds | PreDeploy verifies the GitHub repo is connected to a Vercel project + branch protection allows the preview to deploy |
| Contributor can't see CODEOWNERS-protected paths | PreDeploy aligns the contributor's tier with the right CODEOWNERS scope |
| Apple ID / iCloud confusion mid-install | PreDeploy surfaces the work-vs-personal identity decision before InDeploy starts |
| First PR sits at green-checks-no-merge | PreDeploy ensures the runbook prompt explicitly tells Claude to call `gh pr merge --auto --squash` (locked 2026-05-07) |

Every failure mode either gets prevented in PreDeploy or surfaces during InDeploy as friction the contributor has to absorb.

## Pairs with

- [`in-deploy.md`](in-deploy.md) — what PreDeploy hands off to
- [`post-deploy.md`](post-deploy.md) — what InDeploy hands off to
- [`predeploy-checklist.md`](predeploy-checklist.md) — operator-facing checklist
- [`onboarding-design-contributor.md`](onboarding-design-contributor.md) — tier-specific scope rules for design contributors
- [`pal-design-contributor-launch.md`](pal-design-contributor-launch.md) — tier-specific InDeploy ritual at PAL
- Memory: `feedback_deploy_phase_naming.md` (the naming discipline rule)
- Memory: `feedback_if_winston_cant_no_customer_can.md` (the bar the floor is measured against)
- Memory: `feedback_claude_desktop_requires_folder_first.md` (a hard fact PreDeploy must surface)

## Filed: 2026-05-07 PM

Locked at the kitchen table during Collie's first canonical design-contributor InDeploy at PAL. Pattern empirically validated in real time; phase framework named immediately after. First operational use: `predeploy-checklist.md` → tested next contributor (Sandfest, Bron's, etc.).
