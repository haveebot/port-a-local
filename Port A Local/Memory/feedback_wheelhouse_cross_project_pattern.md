# Wheelhouse — cross-project pattern

_Cross-project rule | Applies to every Heye Lab project that gets a Wheelhouse | Filed 2026-04-27_

---

## What Wheelhouse is

Internal ops board on `/wheelhouse` for each Heye Lab project. Threads,
messages, activity ticker, traffic snapshot, and an agent CLI for
posting from Claude sessions without the human relaying through chat.
PAL has the canonical implementation. CrossRef, Sage Em, and every
future Heye Lab tenant get a copy.

---

## The standard the canonical PAL implementation locked in

These are the rules every replicated Wheelhouse must follow so the same
agent CLI works against every instance with zero per-project shell setup.

### 1. Auth via per-agent bearer tokens

Each project has these Vercel env vars (all marked **Sensitive** in
Vercel — `vercel env pull` returns empty for them, which is correct):

```
WHEELHOUSE_TOKEN_WINSTON_CLAUDE      → resolves to participant `winston-claude`
WHEELHOUSE_TOKEN_COLLIE_CLAUDE       → resolves to participant `collie-claude`
WHEELHOUSE_TOKEN_NICK_CLAUDE         → resolves to participant `nick-claude`
```

Server-side middleware (Next.js Edge) matches the `Authorization:
Bearer <token>` header against each of these and resolves to the
participant ID. Add new agents the same way (one env var per agent,
one match arm in middleware).

### 2. CLI reads token from a single canonical location

The agent CLI (`scripts/wheelhouse.py` in workspace, soon-to-be
copied/symlinked into each project) reads `WHEELHOUSE_AGENT_TOKEN`
in this lookup order (first non-empty wins):

1. **Process env var** `WHEELHOUSE_AGENT_TOKEN` — for interactive
   shells where Winston has it exported in `.zprofile` or similar
2. **`workspace/.env` file** — for Bash-tool sessions, cron jobs,
   automation. The .env file is .gitignored so secrets stay local.
3. Clean error pointing the user at the .env file if neither has it

This is the same pattern `scripts/haveebot_mail.py` uses for Gmail
auth. Don't invent a third location.

### 3. The same workspace/.env serves every project

```
# Wheelhouse agent token — bearer token for scripts/wheelhouse.py.
# Must match one of WHEELHOUSE_TOKEN_<AGENT>_CLAUDE in Vercel.
WHEELHOUSE_AGENT_TOKEN=<paste from Vercel or rotate via CLI>
WHEELHOUSE_API_URL=https://theportalocal.com   # PAL default
```

For multi-project use, swap `WHEELHOUSE_API_URL` per project (or pass
inline: `WHEELHOUSE_API_URL=https://crossref.app python3 scripts/wheelhouse.py orient`).
Future enhancement: per-project sub-config under `workspace/.env.d/<project>`.

### 4. Token rotation is a one-command operation

If a token leaks or needs rotation, the script-driven flow is:

```bash
# 1. Generate
python3 -c "import secrets; print(secrets.token_urlsafe(32))" > /tmp/new-token.txt

# 2. Rotate in Vercel — clean (use --value, NOT stdin which adds \n)
TOKEN=$(cat /tmp/new-token.txt | tr -d '\n')
cd <project-repo>
vercel env rm WHEELHOUSE_TOKEN_WINSTON_CLAUDE production --yes
vercel env add WHEELHOUSE_TOKEN_WINSTON_CLAUDE production --value="$TOKEN" --sensitive --yes

# 3. Update local .env
python3 -c "
import re
from pathlib import Path
token = Path('/tmp/new-token.txt').read_text().strip()
p = Path('/Users/winstoncaraker/Projects/workspace/.env')
p.write_text(re.sub(r'^WHEELHOUSE_AGENT_TOKEN=.*$', f'WHEELHOUSE_AGENT_TOKEN={token}', p.read_text(), flags=re.M))
"

# 4. Redeploy so middleware picks up new value
vercel deploy --prod --yes

# 5. Cleanup
rm /tmp/new-token.txt

# 6. Verify
python3 /Users/winstoncaraker/Projects/workspace/scripts/wheelhouse.py whoami
```

**Critical:** use `--value="$TOKEN"`, NOT `cat token | vercel env add`.
The pipe approach preserved the trailing newline as a literal `\n`
character inside the stored value (validated 2026-04-27 — first rotation
attempt produced `"sUMv...M\n"` instead of `sUMv...M`). The `--value`
flag handles it cleanly.

### 5. Edge middleware env vars require a redeploy

Vercel Edge Runtime bakes env vars at deploy time. Changing a token in
Vercel UI/CLI does NOT propagate to running middleware until a fresh
deploy. After any rotation: `vercel deploy --prod --yes`.

---

## Project-by-project status

| Project | Wheelhouse | Token in workspace/.env | Status |
|---------|-----------|------------------------|--------|
| PAL | LIVE at /wheelhouse | ✅ (winston-claude) | canonical |
| CrossRef | not yet built | n/a | pending — replicate the PAL pattern |
| Sage Em | not yet built | n/a | pending — replicate |
| Heye Lab | not yet built | n/a | pending — replicate |

When adding a new project's Wheelhouse:
1. Build the routes + middleware following the PAL implementation
2. Set `WHEELHOUSE_TOKEN_<AGENT>_CLAUDE` env vars in that project's
   Vercel (Sensitive, Production + Preview)
3. The agent CLI already works against the new project — just override
   `WHEELHOUSE_API_URL` per call, or add a per-project config layer
4. Document any divergences here

---

## Why this matters

Wheelhouse is the central ops surface — humans + agents collaborate
through it. If every project has its own quirky auth setup, agents have
to re-learn each one. With this pattern locked, **the same `wheelhouse.py
orient` command works against every project Heye Lab ever ships**, and
Winston touches the .env file exactly once per machine, never per
project.

CityDeploy framing: Wheelhouse is one of the SaaS-able surfaces. Every
deployed city/tenant gets a Wheelhouse for its operators and Claude
agents. This pattern is what makes that scale-out cheap.

---

## Pickup-here

When this file gets revisited:
- [ ] Multi-project support: per-project `.env.d/<project>` overrides
      OR a CLI flag like `wheelhouse.py --project crossref orient`
- [ ] Audit: should the script auto-detect project from cwd and pick
      the right `WHEELHOUSE_API_URL` accordingly? (Probably yes once
      we have 3+ projects with Wheelhouse.)
- [ ] Document the routes that Wheelhouse exposes so future projects
      have a checklist (currently lives in `Port A Local/Features/Wheelhouse Architecture.md`).
- [ ] Add `wheelhouse.py rotate` subcommand to bake step-by-step
      rotation flow into the script itself.
