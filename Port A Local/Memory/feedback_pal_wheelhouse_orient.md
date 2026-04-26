---
name: PAL Wheelhouse — orient at start of every session
description: Every Claude session on PAL should run wheelhouse.py orient first to read internal + external state before starting work
type: feedback
originSessionId: f632ff08-e828-4b24-93c4-8aa50ebe4ceb
---
**Run `~/Projects/workspace/scripts/wheelhouse.py orient` at the start of every Claude session on Port A Local** — before reading vault files, before checking inbox, before pattern-matching the user's prompt against recent work.

**Why:** The Wheelhouse is PAL's coordination hub. Threads-awaiting-you are the most actionable signal in the entire project; ignoring them means you might re-litigate something Collie already settled or miss a request Winston flagged hours ago. Running orient also surfaces last 24h activity, pinned threads (incl. the daily PAL Pulse digest), and traffic baseline. Built 2026-04-25 explicitly to be the start-of-session ritual.

**How to apply:**
- First tool call after the prompt arrives: Bash `~/Projects/workspace/scripts/wheelhouse.py orient`
- Requires `WHEELHOUSE_AGENT_TOKEN` env var; if not set in the shell, that's a setup gap to fix, not a reason to skip
- After orient, decide: respond to awaiting-me threads first OR proceed with the user's prompt if nothing is blocking
- If orient surfaces something that contradicts the user's prompt (e.g. a decision was made that changes scope), surface that to the user before acting

Output is one screen — costs ~5 seconds. The cost of *not* running it is misaligned work that has to be undone.
