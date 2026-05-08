# Design Contributor Onboarding

_Locked 2026-05-01 PM. First use: Collie Farley → PAL. Pattern generalizes to any HeyeLab tenant when a design / brand / editorial contributor needs scoped commit access._

For contributors who will make **brand · design · cosmetic · copy** updates — not API routes, database migrations, or auth code. Gets you from "GitHub + Vercel logged in" to "shipping a PR" in ~20 minutes.

---

## Prerequisites (Winston confirms before starting)

- [ ] Contributor has own GitHub account
- [ ] Winston added contributor as **collaborator** on the relevant repo
- [ ] _(Optional, only if contributor needs local dev server with full data)_ Vercel team membership — most design contributors don't need this; PR previews auto-deploy from Vercel without team membership

> **Tier 1 reality (locked 2026-05-04 PM):** A design contributor does NOT need Vercel team membership. Their "live preview" comes from Vercel's auto-deploy on every PR — that URL appears on the PR page ~2 min after push. Local `npm run dev` is optional and would require env vars (DATABASE_URL etc.) which design contributors don't need access to. Skip the dev server unless the contributor specifically needs live reload, in which case escalate to Codespaces (browser-based dev env, no local install).
>
> **For the actual launch flow on Tier 1, see [`pal-design-contributor-launch.md`](pal-design-contributor-launch.md) — Claude-driven setup, no Terminal jargon, no env vars.** This canonical doc captures the SCOPE rules + tier graduation + brand resources, not the bash setup steps.

## Setup on contributor's Mac (15–20 min)

### 1. Install tools

If Homebrew isn't installed:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then:

```bash
brew install gh node git
brew install --cask claude
npm install -g vercel
```

### 2. Authenticate

```bash
gh auth login              # GitHub.com → HTTPS → browser auth
vercel login               # browser auth, sign in to Vercel
```

### 3. Clone the project

For PAL (first canonical):

```bash
mkdir -p ~/Projects && cd ~/Projects
gh repo clone haveebot/port-a-local
cd port-a-local
npm install
```

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`. The site should be running locally.

### 5. Bootstrap Claude

In the project directory:

```bash
claude
```

Tell Claude:

> "I'm a brand / design / copy contributor on this project, not a backend engineer. Make a memory note: I work on visible / brand-shaped surfaces only. For PAL specifically, I authored the PAL brand system at theportalocal.com/brand."

## First PR — validate the loop (5 min)

### 1. Branch

```bash
git checkout -b <yourname>/onboarding-test
```

### 2. Make a small visible change

Suggested first change: add yourself to a `CONTRIBUTORS.md` file (create if it doesn't exist) with a one-line bio. Or any tiny visible change Winston suggests.

### 3. Commit + push + open PR

```bash
git add CONTRIBUTORS.md
git commit -m "add <yourname> as design contributor"
git push -u origin <yourname>/onboarding-test
gh pr create --title "Add <yourname> as design contributor" --body "Onboarding test PR — validates GitHub collab + Vercel preview-deploy chain."
```

Vercel auto-builds a preview at a URL the PR page shows. Winston reviews + merges.

## Scope: what's free to touch vs. what to ask first

### Free to touch (cosmetic / brand-shaped)

| Area | Examples |
|---|---|
| Brand surfaces | `app/(public)/brand/`, brand assets, fonts, theme config |
| CSS / styling | Component styles, Tailwind config, CSS modules |
| Copy + content | Marketing pages, hero text, button labels, microcopy |
| Public design components | Card layouts, hero blocks, navigation styling, footers |
| Documentation | README, CONTRIBUTORS, design notes, brand-style docs |
| Image / icon assets | Photos, logos, illustrations |

### Don't touch (ask first)

| Area | Why |
|---|---|
| `app/api/**` | Backend logic, auth, payments — careful review needed |
| Database migrations / Drizzle schema | Migration-ordered, can break production |
| `.env*` files, secrets | Credentials live elsewhere |
| Auth code, NextAuth config | Security implications |
| Stripe / payment code | Money flows; high stakes |
| Cron jobs, scheduled functions | Production timing dependencies |
| Operator / admin tooling | Backend-shaped surfaces, not public design |

When unsure: ask Claude "is this in scope for me as a design contributor?" — Claude knows the boundaries.

## Workflow norms

1. **Always work on a branch**, never commit to main directly
2. **Open a PR for every change**, even tiny ones — preview deploys catch issues
3. **Checks gate the merge, NOT humans** _(updated 2026-05-04)_. Vercel build + status checks must pass. Once green, PR auto-merges. No waiting for Winston approval on cosmetic / brand / copy work.
4. **CODEOWNERS-protected paths still require operator review** — backend / API / auth / DB / build-config changes need Winston or Nick to approve. Design contributor scope avoids these paths by default.
5. **One change per PR** when reasonable — easier to review + roll back

> **Agent-driven autonomy principle (locked 2026-05-04):** The point of HeyeDeploy is contributor autonomy with safety nets, not human approval bottlenecks. Branch protection on PAL main now requires status checks (Vercel build, type-check, lint) but NO required approving review. Code owner review is required only on protected paths (`app/api/`, auth, DB, payments, build config). Everything else auto-merges once checks pass. See `feedback_agent_driven_contributor_autonomy.md`.

## Brand resources

| Resource | Where |
|---|---|
| HeyeDeploy brand tokens (cross-project — colors, type, wordmark spelling) | `heyedeploy/brand/tokens.md` (requires heyedeploy repo access — Tier-2 expand later) |
| HeyeDeploy brand preview (visual) | `heyedeploy/brand/preview.html` (open locally) |
| Tenant-specific brand systems | Each tenant has its own; e.g., PAL's at theportalocal.com/brand |
| HeyeLab brand spelling rule | **HeyeLab** (one word) for marketing/wordmark; **Heye Lab** (two words) for legal/official |
| Design-session decision log | `heyedeploy/decision-log/2026-05-01-heyedeploy-brand-tokens.md` |

## Getting unstuck

- **Merge conflict**: ask Claude — "I have a merge conflict; help me resolve it without breaking anything"
- **Dev server won't start**: try `rm -rf node_modules && npm install` to reset deps
- **Vercel preview not building**: check the build logs in the PR — usually a typo or missing import
- **Lost in code**: ask Claude to summarize what a file does before changing it

## Tier graduation

This is **Tier 1** of the design-contributor pattern — branch-based, PR-required, preview-deploy validated, Winston-reviewed before merge. Graduates to Tier 2 (more autonomy, owning specific brand systems end-to-end) when a track record of clean PRs builds.

## Cross-references

- HeyeDeploy brand tokens: [`../brand/tokens.md`](../brand/tokens.md)
- Brand decision rationale: [`../decision-log/2026-05-01-heyedeploy-brand-tokens.md`](../decision-log/2026-05-01-heyedeploy-brand-tokens.md)
- HeyeLab brand spelling rule: memory `feedback_heyelab_brand_spelling.md`
