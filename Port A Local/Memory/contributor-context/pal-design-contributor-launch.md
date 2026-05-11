# PAL design contributor — launch (Claude-driven)

_Customer-friendly launch wrapper for the design-contributor tier. Canonical scope rules + brand resources + tier-graduation rules live in [`onboarding-design-contributor.md`](onboarding-design-contributor.md) — this file is just the entry-point a contributor receives via email and uses to get set up._

_First canonical use: Collie Farley → PAL, 2026-05. Subsequent uses become the template for any future PAL design contributor._

---

## What's in the email Collie receives

The contributor receives a single email containing:

1. A pre-flight checklist (5 lines — accounts she needs to have)
2. A 4-line setup sequence
3. A prompt to paste into Claude on her Mac
4. A "what to expect" summary

That's it. **No bash commands she has to type herself.** Claude on her Mac runs anything technical via tool calls; she sees a chat conversation, not a Terminal.

## The pre-flight (what she needs ready)

- Her own GitHub login (`colliebreah`, with 2FA device)
- Her Anthropic Claude login
- ~30 minutes uninterrupted
- A Mac

She does NOT need:
- A Vercel account (PR previews work via Winston's Vercel project, not hers)
- Any `.env` file or secret-handling
- Any workspace-memory hydration (scoped tier)
- Any Google Drive / agent token / etc.

## The launch sequence (what she does)

1. Open Safari → go to `claude.ai/download` → download the Mac app
2. Open the downloaded file → drag Claude into Applications → open Claude
3. Sign in with her Anthropic account
4. When Claude prompts **"Select a folder first"** (this WILL happen):
   - Click "Select folder..."
   - Click **"New Folder"** at the bottom-left of the picker
   - Name it: **`Projects`** → click Create
   - With `Projects` selected, click **"Open"**

   _Why `Projects`: matches the convention used across Heye Lab operator stations. When you join other projects later (Sandfest design, HeyeLab brand, etc.), they become siblings inside the same `Projects` folder. Claude will clone `port-a-local` as `~/Projects/port-a-local/` automatically._
5. In the chat, paste the prompt below

## The prompt she pastes

```
I'm Collie, joining the Port A Local (PAL) project as a design contributor on a Mac.

My GitHub account is colliebreah. I've already been added as a collaborator on haveebot/port-a-local. I make brand / design / copy / styling changes — not backend, not auth, not API code.

The full onboarding runbook with scope rules + brand resources is at:
github.com/haveebot/heyedeploy → operations/onboarding-design-contributor.md

Walk me through it in plain English — no jargon dumps, no Terminal-speak. If something needs me to type or click, tell me clearly what and where.

Steps to do, in order:
1. Install whatever tools you need (Homebrew, git, node, gh) — quietly via your tools.
2. Walk me through `gh auth login` (use MY GitHub: colliebreah, not haveebot).
3. Clone haveebot/port-a-local into ~/port-a-local.
4. Run `npm install` and start `npm run dev` so I can see the site at localhost:3000.
5. Help me open my first PR — adding myself to a CONTRIBUTORS.md file at the root of the PAL repo with a one-line bio.
6. After opening the PR, run `gh pr merge <PR_NUMBER> --auto --squash` to enable auto-merge. (Locked rule: auto-merge has to be enabled per PR; checks gate the merge once the Vercel build passes.)

Run the technical chain autonomously — install, auth, clone, read contributor-context, open the first PR, enable auto-merge — in one go. Don't pause to ask me "did this step work?" between technical steps. Only stop when you need MY input as a person — my bio for CONTRIBUTORS.md, design decisions, anything that needs my judgment rather than your verification.
```

## What she should expect

- Claude installs the dev tools quietly via its own tool calls (~5 min, mostly invisible to her)
- Claude tells her: "I'm going to open a browser for GitHub login — when it opens, log in as colliebreah, not haveebot"
- Claude clones the PAL repo
- Her Claude reads `Port A Local/Memory/contributor-context/` from the cloned PAL repo — auto-loads HeyeLab brand spelling, consumer UX principles, PAL voice rules, HeyeDeploy brand tokens. She has the right cross-project design context every session without needing operator-tier memory access.
- Claude walks her through opening her first PR (the CONTRIBUTORS.md addition)
- PR auto-merges once Vercel preview build passes (no Winston approval required per `feedback_agent_driven_contributor_autonomy.md`)
- Total time: ~30 min including auth flows

## Architecture position (locked 2026-05-04)

Per `feedback_hub_spoke_architecture.md`, Collie's Mac is a **spoke** in Heye Lab's hub-and-spoke architecture:

- **Spoke role:** PAL design contributor — scoped to PAL repo + the curated `contributor-context/` mirror
- **Contribution path:** her PRs land in PAL → Winston/me reviews → patterns get promoted to HeyeDeploy framework templates when applicable
- **No operator-tier hooks:** she doesn't have workspace-memory mirror, no Stop hook, no agent tokens — by design (Tier 1 scope)
- **Director-spoke comms:** Winston pings her at `collie.breah@gmail.com` when needed — she reads manually + surfaces to her Claude (Tier 1 = manual surface; v0.2 may add an automated SessionStart hook for her if useful)

## What she should NOT do

- Touch backend / API / auth / DB / payment / build-config paths — CODEOWNERS will auto-request operator review on these and merge will gate
- Run `npm install` or `npm run dev` — Tier 1 doesn't need a local dev server (Vercel preview is her live preview)
- Worry about being a bottleneck or waiting for approval — checks gate the merge, not humans

## What Claude on her Mac will need to ask her for

| Step | What Claude needs |
|---|---|
| Install Homebrew | Her Mac password (when Homebrew installer prompts; one time) |
| `gh auth login` | A one-time browser login as `colliebreah` |
| First PR | A one-line bio for CONTRIBUTORS.md |

That's it. No `.env` paste. No agent tokens. No vault credentials. Scoped tier, narrow scope.

## What's different from the Sage operator-tier launch

| Sage operator-tier | PAL design-contributor-tier |
|---|---|
| 5 repos cloned + memory hydration + .env paste + Drive Desktop + Stop hook + Vercel link × 3 | One repo cloned. That's it. |
| Operator's full vault | Scoped to PAL repo only |
| Auth as haveebot (operator account) | Auth as her own (colliebreah) |
| `~/Projects/workspace/` | `~/Projects/port-a-local/` (matches operator convention, scales to siblings) |
| Stop hook auto-sync memory | None — she ships via PR only |
| Verifies via `wheelhouse.py orient` | Verifies via her first PR landing |

Less complexity → less surface for failure. The design-contributor tier is a simpler beast than operator-tier and should stay that way.

## When to send the email

After Winston:
1. Reviews this runbook + the email body below
2. Confirms Collie's collaborator state on `haveebot/port-a-local` is still active (`gh api repos/haveebot/port-a-local/collaborators --jq '.[] | {login,role_name}'`)
3. Picks a moment Collie's likely to have ~30 min uninterrupted

## The email body Collie will receive

```
Subject: PAL design station — easy launch

Collie —

Here's the easy way to get the PAL site running on your Mac so you can make brand / design / copy edits and see them live before they ship.

Plan ~30 min uninterrupted.

Have ready:
  • Your GitHub login (colliebreah) with 2FA device
  • Your Claude login
  • A Mac

──────── DO THIS ────────

1) Open Safari → go to claude.ai/download → download the Mac app

2) Open the download → drag Claude into Applications → open Claude → sign in

3) When Claude says "Select a folder first":
   - Click "Select folder..."
   - Click "New Folder" (bottom-left of the picker)
   - Name it: Projects
   - Click Create, then Open

   (This is your future home for Heye Lab project clones — port-a-local goes inside it, and any future projects you join will be siblings.)

4) Paste THIS into the chat in Claude:

────
I'm Collie, joining the Port A Local (PAL) project as a design contributor on a Mac.

My GitHub account is colliebreah. I've already been added as a collaborator on haveebot/port-a-local. I make brand / design / copy / styling changes — not backend, not auth, not API code.

Two reference docs in the heyedeploy repo:
• operations/pal-design-contributor-launch.md (HOW to launch — Tier 1 setup, no Vercel team needed, no env vars)
• operations/onboarding-design-contributor.md (WHAT I touch + scope rules + brand resources)

Read both. Follow the launch wrapper for setup. Use the canonical for scope guidance.

Walk me through it in plain English — no jargon dumps, no Terminal-speak. If something needs me to type or click, tell me clearly what and where.

Steps:
1. Install whatever tools you need (Homebrew, git, node, gh) — quietly via your tools.
2. Walk me through gh auth login (use MY GitHub: colliebreah, not haveebot).
3. Clone haveebot/port-a-local into ~/Projects/port-a-local.
4. Skip `npm install` AND `npm run dev` / localhost entirely. I won't be running a local dev server. Vercel runs install + build on every PR and gives me a live preview URL on the PR page (~2 min after push). That's my "live preview." (If I ever ask for live reload later, we'll set up Codespaces or local then — that's when pnpm/npm versions start to matter.)
5. Help me open my first PR — adding myself to a CONTRIBUTORS.md file at the root of the PAL repo. Ask me for a one-line bio when we get there.
6. After opening the PR, run `gh pr merge <PR_NUMBER> --auto --squash` to enable auto-merge. (Locked rule: auto-merge has to be enabled per PR; checks gate the merge once the Vercel build passes.)

Run the technical chain autonomously — install, auth, clone, read contributor-context, open the first PR, enable auto-merge — in one go. Don't pause to ask me "did this step work?" between technical steps. Only stop when you need MY input as a person — my bio for CONTRIBUTORS.md, design decisions, anything that needs my judgment rather than your verification.
────

Hit send. Claude on your Mac walks you through everything from there in plain English.

If anything stops you, screenshot it and reply to this thread — we'll get you unstuck.

— Havee
```

## Cross-references

- Existing canonical (scope, tier graduation, brand): [`onboarding-design-contributor.md`](onboarding-design-contributor.md) — DO NOT supersede
- Manifest stub: [`../components/crew-deploy/manifests/design-contributor-pal.yaml`](../components/crew-deploy/manifests/design-contributor-pal.yaml)
- Sage parallel (operator-tier): [`sage-laptop-launch-runbook.md`](sage-laptop-launch-runbook.md)
- Memory rule (folder pick is unavoidable): `feedback_claude_desktop_requires_folder_first.md`
- Memory rule (no Terminal as primary): `feedback_if_winston_cant_no_customer_can.md`

## How Winston approves + sends

When ready:
1. Re-read this runbook + email body
2. Adjust anything Collie-specific (timing, voice, anything)
3. Send via `python3 workspace/scripts/haveebot_mail.py send --to collie.breah@gmail.com --cc winstonciv@gmail.com --subject "PAL design station — easy launch" --body -` (paste body via stdin)

Or have me send it from this Claude session when given explicit go.
