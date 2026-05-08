# CLAUDE.md — Port A Local (PAL) repo

You are working in the **Port A Local** tenant repo. Live at https://theportalocal.com.

## Repo shape

```
port-a-local/
├── src/                       ← Next.js app (pages, components, API routes)
├── scripts/                   ← repo-local scripts (check-no-names, check-og-dynamic, etc.)
├── public/                    ← static assets
├── Port A Local/              ← project vault (memory, runbooks, contributor-context, briefs)
│   └── Memory/
│       └── contributor-context/   ← curated cross-project rules + onboarding for Tier 1+
└── Session Notes/             ← handoff briefs (one per truck)
```

## For Tier 1 design contributors

If you're a design / brand / copy contributor (not a backend engineer), **start at [`Port A Local/Memory/contributor-context/README.md`](Port%20A%20Local/Memory/contributor-context/README.md)**.

That folder auto-loads the cross-project rules + PAL-specific brand/voice/UX context you need. The launch ritual lives at [`Port A Local/Memory/contributor-context/pal-design-contributor-launch.md`](Port%20A%20Local/Memory/contributor-context/pal-design-contributor-launch.md). Canonical scope rules live at [`Port A Local/Memory/contributor-context/onboarding-design-contributor.md`](Port%20A%20Local/Memory/contributor-context/onboarding-design-contributor.md).

**Wheelhouse** (the product surface at https://theportalocal.com/wheelhouse) is your primary coordination hub — design feedback threads, daily PAL Pulse digest, brand reviews. Distinct from `scripts/wheelhouse.py` (an operator-tier diagnostic CLI you don't need).

## For operator-tier sessions (Winston / Claude)

1. **Run the start-of-session orient first**: `python3 ~/Projects/workspace/scripts/wheelhouse.py orient` — one screen showing awaiting-you threads + 24h activity + traffic baseline. Per [`feedback_pal_wheelhouse_orient.md`](https://github.com/haveebot/workspace-memory/blob/main/memory/feedback_pal_wheelhouse_orient.md).
2. **Read the latest handoff brief**: `Session Notes/handoff-YYYY-MM-DD-*.md` — the most recent file. Pairs with `feedback_arnold_startup_drill.md` (the "arnold" ritual).
3. **Honor the no-names-on-website rule**: never render `Winston / Nick / Collie / Havee` in any customer- or vendor-facing string. Pre-build `scripts/check-no-names.js` will fail the build on violations.
4. **Honor the project-boundary rule**: stay in PAL — don't reach into CrossRef / Sage Em / Heye Lab repos from a PAL session.

## Working rules

1. **Memory parity:** workspace-memory is the auto-loaded source of truth; this repo's `Port A Local/Memory/contributor-context/` is the curated mirror for Tier 1 contributor sessions.
2. **CODEOWNERS gate** the backend / auth / build / payment paths. Free-merge zone is design/copy/content surfaces — see [`.github/CODEOWNERS`](.github/CODEOWNERS).
3. **Auto-merge gates on Vercel preview pass**, not on operator approval. Per `feedback_agent_driven_contributor_autonomy.md`.
4. **Verify before declare** — when asked "is X bulletproof / built / ready?", audit source-of-truth files first; don't extrapolate from in-conversation recall.

## Cross-references

- Framework: `~/Projects/workspace/heyedeploy/` — the umbrella; PAL is one tenant
- Workspace memory: `~/Projects/workspace/memory/` — operator-tier vault
- Arnold drill: `feedback_arnold_startup_drill.md`
- Truck protocol: `feedback_context_handoff.md`
- Hub-spoke architecture: `feedback_hub_spoke_architecture.md`
