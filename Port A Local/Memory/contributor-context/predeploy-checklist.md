# PreDeploy Checklist — operator-facing

_The actual checklist the operator (Winston-role) works through with a contributor or tenant before InDeploy day is scheduled. Concrete, usable, tickable. Tier-aware._

> **Phase**: PreDeploy. See [`pre-deploy.md`](pre-deploy.md) for framework. **Hand-off**: signed checklist + green-light date for InDeploy. **Floor to protect**: 2 commands + 2 passwords during InDeploy.

---

## How to use this doc

1. Pick the tier section that applies (Tier 1 / Tier 2 / Tenant)
2. Walk the checklist with the contributor or tenant — every box checked OR documented exception
3. Sign off + send the green-light date for InDeploy
4. Do not schedule InDeploy until every required item is green

---

## Tier 1 — Design contributor PreDeploy

_For contributors who will make brand · design · cosmetic · copy updates. ~15 min to walk. First canonical: Collie Farley → PAL, 2026-05-07._

### Identity (contributor confirms)

- [ ] **GitHub account** — username confirmed; sign-in works in browser; 2FA active
- [ ] **2FA recovery codes saved** — somewhere recoverable (password manager / secure note / printed)
- [ ] **Anthropic account** — sign-in works in browser; Pro subscription confirmed if required
- [ ] **Apple ID** — known + recoverable
- [ ] **Mac admin password** — contributor knows it (can be a parent/spouse password, but they can produce it)

### Mac state (operator audits)

- [ ] **macOS version** — within last 2 major versions (macOS 14+ floor recommended)
- [ ] **Apple Silicon vs Intel** — noted (changes Homebrew install path slightly; both supported)
- [ ] **Disk space** — at least 10 GB free
- [ ] **Network** — works on a stable connection (auth flows fail on flaky wifi)
- [ ] **Xcode Command Line Tools** — `xcode-select -p` returns a path. If not, run `xcode-select --install` during PreDeploy.
- [ ] **Homebrew** — optional pre-install; if not present, InDeploy installs it. Contributor will see a Mac password prompt during install.

### Repo access (operator confirms)

- [ ] **GitHub collaborator added** — `gh api repos/<org>/<tenant>/collaborators/<contributor>/permission` returns `write`
- [ ] **CODEOWNERS reviewed** — protected paths align with contributor's tier (backend / auth / DB / build / payments — operator review only)
- [ ] **Branch protection on main** — required check: Vercel; required approving reviews: 0; auto-merge enabled at repo level
- [ ] **Vercel project linked** — preview builds fire on PR push (verify by looking at recent PR's checks tab)

### What's NOT needed (the omission list, just as important)

- [ ] **Vercel team membership** — NOT needed for Tier 1 (PR previews work without team membership)
- [ ] **`.env` file** — NOT needed, NOT shared, NOT pasted anywhere
- [ ] **Workspace memory mirror** — NOT needed (Tier 1 inherits curated `contributor-context/` from the tenant repo)
- [ ] **Stop hook / Wheelhouse agent token / Sage mail / haveebot mail** — NOT needed
- [ ] **Drive Desktop** — NOT needed
- [ ] **Local dev server** — NOT needed (`npm run dev` skipped; Vercel preview is the live preview)

### Identity decisions (surface during PreDeploy, don't leave to InDeploy)

- [ ] **Apple ID for App Store + iCloud** — same as personal? Separate work identity? (Not a blocker; document the decision)
- [ ] **GitHub HTTPS vs SSH auth** — default to HTTPS (`gh auth login` uses it; simpler, no SSH-key dance)
- [ ] **Browser of record for OAuth flows** — Safari is default Mac; works fine. Document if contributor uses something else.
- [ ] **Email address for any tenant comms** — confirmed and verified

### Sign-off

- [ ] **All required boxes green** OR exceptions documented
- [ ] **InDeploy date scheduled**
- [ ] **Contributor confirms ~30 min uninterrupted on InDeploy day**
- [ ] **InDeploy email queued or kitchen-table session confirmed** (per the tenant's canonical InDeploy doc — e.g. `pal-design-contributor-launch.md`)

---

## Tier 2 — Operator PreDeploy

_For operators (or operator-role partners) who will work across multiple repos, touch backend code, hold code-owner status. ~45-60 min to walk. First canonical: Winston's own laptop setup._

### Everything in Tier 1 PLUS:

### Identity (additional)

- [ ] **Vercel account** — sign-in works; team membership decisions made (which teams, which projects)
- [ ] **Workspace SSO** — if relevant for the project (Sage HQ, etc.), sign-in works under the right Workspace identity
- [ ] **Stripe account** — read-only access at minimum; full access depends on scope

### Mac state (additional)

- [ ] **Drive Desktop installed + signed in** — the right Workspace account, not personal
- [ ] **Multiple Anthropic / Claude accounts switchable** — if the operator runs hub-and-spoke

### Substrate (additional)

- [ ] **Workspace memory mirror cloned** — `~/Projects/workspace/memory/` synced
- [ ] **Multi-repo clone plan** — which repos clone, in what order, with what tokens
- [ ] **`.env` files known + sourced** — ideally from Vercel via `vercel env pull` (with the `\n`-escape fix per `feedback_vercel_env_pull_escaped_newlines.md`)
- [ ] **Stop hook design** — what auto-syncs on session end
- [ ] **Wheelhouse agent token rotated + saved** — per project the operator will use

### Tools (additional)

- [ ] **Python 3.10+ available** — for `pal_mail.py`, `haveebot_mail.py`, `wheelhouse.py` etc.
- [ ] **Postgres / Drizzle CLI** — if the operator will run migrations
- [ ] **Stripe CLI** — for webhook testing
- [ ] **Twilio CLI** — if the operator will work on SMS flows

### Sign-off

- [ ] **All Tier 1 boxes green**
- [ ] **All Tier 2 additional boxes green**
- [ ] **InDeploy session scoped** (multi-hour, not 30 min)
- [ ] **Senior operator audit complete** — someone above the new operator has signed off on substrate

---

## Tenant — Customer-facing PreDeploy

_For tenant deployments (Bron's, Sandfest, future). Scoped engagement. Billable. First canonical: TBD when first tenant signs._

### Identity discovery

- [ ] **Customer's existing data sources catalogued** — Salesforce / HubSpot / Outlook / Google Workspace / Excel / website / vendor portals — what's where
- [ ] **OAuth scopes confirmed** — minimum-scope, time-limited, revocable; customer signs off on each connector
- [ ] **Customer point-of-contact identified** — who has authority to make decisions during InDeploy
- [ ] **Customer admin contact identified** — separate from POC if they're not the same person

### Domain + brand

- [ ] **Custom domain registered** — and DNS controllable by Heye Lab during InDeploy
- [ ] **Brand assets gathered** — logo, fonts, colors, voice (per BrandPackDeploy if applicable)
- [ ] **Tenant Vercel project pre-provisioned** — empty project, custom domain pre-staged
- [ ] **Tenant GitHub repo pre-created** — with CODEOWNERS, branch protection, starter content from the canonical
- [ ] **Workspace SSO / identity** — customer's domain can authenticate against the tenant if applicable

### Tech substrate

- [ ] **Connectors needed identified** — per the customer's data sources (see `onboard-deploy.md`)
- [ ] **Schema mapping rules drafted** — per-vertical normalizers ready
- [ ] **Validator UI configured** — the swipe-style accept/reject flow scoped to the tenant's data shape
- [ ] **Stripe Connect (if applicable)** — customer's Stripe identity, KYC requirements understood
- [ ] **Email + SMS provider setup** — Resend domain verification, Twilio number provisioning

### Compliance + trust

- [ ] **OAuth-only credential delegation** — no passwords stored anywhere
- [ ] **Audit trail prepared** — every action during InDeploy will be logged
- [ ] **Validation gates scoped** — what auto-publishes vs. what requires customer review
- [ ] **Revocation flow understood** — customer can revoke OAuth + delete tenant data within the hour
- [ ] **Per-vertical compliance** — IDX rules for RealtyDeploy, contract retention for ContractsDeploy, etc.

### Customer commitments

- [ ] **InDeploy session scheduled** — same-day-as-signed launches command premium pricing
- [ ] **Customer commits ~2 hours uninterrupted on InDeploy day** — for tenant tier, more than design contributor
- [ ] **Customer's POC commits to validation review** — in real time during InDeploy

### Sign-off

- [ ] **All boxes green**
- [ ] **PreDeploy deliverable signed** — billable proof of work
- [ ] **InDeploy date locked**
- [ ] **Green-light memo sent to customer** — confirming readiness, scheduling, and what to expect

---

## Cross-tier rules

These hold regardless of tier:

- **No box gets skipped silently.** Every box is either green or has a documented exception.
- **InDeploy doesn't get scheduled until PreDeploy is signed off.** No partial-readiness launches.
- **Operator never uses their own credentials for the contributor's auth.** Every auth during InDeploy is the contributor's identity.
- **The omission list matters as much as the inclusion list.** Document what's NOT needed for this tier — that's where Tier 1 stays Tier 1.
- **PreDeploy failures should turn into PreDeploy fixes, not InDeploy patches.** If two contributors hit the same friction point during InDeploy, that's a PreDeploy gap to close.

## Empirical anchor (Tier 1)

Floor measured during Collie Farley's first canonical design-contributor InDeploy at PAL on 2026-05-07:

- **2** terminal commands during InDeploy
- **2** Mac password entries
- **~30** minutes including auth flows
- **~3** minutes from PR open to production deploy

PreDeploy's job: keep InDeploy at this floor. Anything that gets added to InDeploy because PreDeploy was incomplete is a regression worth measuring.

## Pairs with

- [`pre-deploy.md`](pre-deploy.md) — phase framework
- [`in-deploy.md`](in-deploy.md) — what hands off to
- [`post-deploy.md`](post-deploy.md) — what eventually hands off to
- [`onboarding-design-contributor.md`](onboarding-design-contributor.md) — Tier 1 scope rules
- [`pal-design-contributor-launch.md`](pal-design-contributor-launch.md) — Tier 1 InDeploy ritual
- [`sage-laptop-launch-runbook.md`](sage-laptop-launch-runbook.md) — Tier 2 InDeploy ritual
- Memory: `feedback_deploy_phase_naming.md`, `feedback_if_winston_cant_no_customer_can.md`, `feedback_claude_desktop_requires_folder_first.md`

## Filed: 2026-05-07 PM

First operational use: TBD. Pattern empirically grounded by Collie's PAL InDeploy. Next anticipated use: next design contributor (Sandfest design tier) or Bron's tenant launch.
