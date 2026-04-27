# The "Arnold" — startup-drill ritual

_Cross-project rule | Applies to ALL Claude sessions Winston runs | Filed 2026-04-27 by Winston_

---

## What it is

When Winston says **"do an arnold"** (or "let's arnold this," "give me an arnold," etc.), he's invoking the full **Total Recall** on project memory at session start.

It's the named, ritualized form of the project-startup drill. Boring, durable, never skipped. Pairs with the context-handoff protocol (`feedback_context_handoff.md`) on the close-out side — handoff trucks at the end, arnold restores at the start.

> Reference: *Total Recall* (1990) — Schwarzenegger's character has his memory implanted/restored. An "arnold" is total recall on whatever project we're picking up.

---

## The drill (what Claude does on "arnold")

In order, no skipping:

1. **Read the latest handoff brief.** Look in the project's session-notes folder for the most recent `handoff-YYYY-MM-DD.md` and read it top to bottom.
   - PAL: `Port A Local/Session Notes/handoff-DATE.md`
   - CrossRef: `crossref/session-notes/handoff-DATE.md` (TBD)
   - Sage Em: TBD
   - Heye Lab: TBD

2. **Read the project memory file.** Find current state, recent decisions, key files.
   - PAL: `project_pa_local.md`
   - CrossRef: `project_crossref.md`
   - Sage Em: `project_sage_em.md`
   - Heye Lab: `project_heye_lab.md`

3. **Read any feedback files mentioned in the handoff brief or memory file** that the prior session added or updated. Don't read everything — just what's freshly relevant.

4. **Run the project's orient command if it has one:**
   - PAL: `python scripts/wheelhouse.py orient` — one screen, ~5 sec, shows awaiting-you / last-24h activity / traffic baseline
   - Other projects: TBD

5. **Verify trucked state:**
   - `git status` clean
   - `git log origin/main` shows the last commit Claude wrote
   - Any production smoke-test commands the handoff brief specifies

6. **Surface state to Winston:**
   - "Arnold complete — here's where we are"
   - One paragraph: what just shipped, what's awaiting you, top 3 rocks
   - Then: "Ready when you say."

---

## When to invoke

Winston invokes it. Common triggers:
- Brand new chat after a truck/handoff
- Continuing in the same chat after a break
- After he's been away for hours/a day
- When he wants Claude to re-load project context after working on something else

Claude should NOT auto-arnold. Wait for the cue. (Exception: if a project memory file is in the auto-loaded context and the handoff brief is right there, a light "I see we trucked yesterday at handoff-DATE.md — want me to do an arnold or just dive in?" is fine.)

---

## What "arnold" is NOT

- Not a code review. Read for state, not for audit.
- Not a planning session. Surface state, then wait for direction.
- Not a re-implementation of the handoff brief. Synthesize, don't recap.
- Not a 10-minute deep dive. ~2 minutes for a clean handoff. Longer means something's drifted.

---

## Invocation phrases (all map to the same drill)

- "do an arnold"
- "arnold this"
- "give me an arnold"
- "let's arnold"
- "total recall on PAL" (or other project)
- "refresh on the project"
- "startup drill"

---

## Why this matters

Naming the ritual makes it durable. "Read the handoff brief, then the memory file, then orient" is forgettable. **"Do an arnold"** is one syllable + a callback. Same way `truck` already names the close-out: `arnold` names the open.

Pairs with:
- `feedback_context_handoff.md` — the truck (close-out)
- `feedback_pal_wheelhouse_orient.md` — the PAL-specific orient command (one step inside the arnold drill)
- `feedback_style.md` — read vault first, write it down, push at end of session
