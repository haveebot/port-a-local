# Context-window handoff protocol

_Cross-project rule | Applies to ALL Claude sessions Winston runs (PAL, CrossRef, Sage Em, Heye Lab, future projects) | Filed 2026-04-27_

---

## The rule

When a chat session is approaching its context-window limit, **never let it
silently fail**. Proactively notify Winston and execute a clean handoff so
the next session picks up without lost work or lost context.

This is foolproof end-of-session protocol. Same as truck-everything-at-end:
boring, ritualized, never skipped, always works.

---

## When to notify (trigger conditions)

Claude doesn't get a programmatic context-meter, so use heuristics:

**Hard signals (always check + offer handoff):**
- Winston explicitly asks: *"room in chat?"*, *"we good on context?"*, *"how much room left?"*, *"still got headroom?"*, or any variation
- Single session has crossed ~30+ commits, ~50+ tool calls, or has spanned 4+ hours of engagement
- A new tool use or file read returns truncated output that smells like a context-pressure issue
- Internal sense ("this conversation is getting long, edits are getting lossy") — trust it

**Soft signals (suggest handoff at the next natural inflection):**
- Just shipped a major sprint / feature / batch
- About to start a fundamentally new thread (different vertical, different design space)
- End of a clear chapter ("we just landed X, want to take a breath?")
- User says they're stepping away ("grabbing food," "taking a walk," etc.) — prep for clean restart

---

## What "handoff" means (the playbook)

A handoff is not a goodbye. It's a clean state transfer with these steps:

### 1. Truck everything
- `git status` clean, all changes committed + pushed to origin
- Any open uncommitted edits → commit with a descriptive message
- For PAL: also run `bash scripts/sync-memory.sh` to mirror memory updates
- For CrossRef: same pattern via its own memory mirror once established
- Verify on remote (`git log origin/main`) before declaring trucked

### 2. Update the project memory file
- For PAL: `project_pa_local.md` — append a "Current State" section dated today
- For CrossRef: `project_crossref.md` — same pattern (in its own mirror's authoritative copy)
- For Sage Em: `project_sage_em.md` — same
- Capture: what shipped, what's deferred, what's awaiting Winston action,
  what's awaiting external (Stripe Issuing, A2P, etc.)

### 3. Generate a next-session prompt
Save as a markdown file at `Port A Local/Session Notes/handoff-YYYY-MM-DD.md`
(or equivalent for other projects). This file is the brief a fresh Claude
needs to pick up cold. Should include:
- One-paragraph summary of what JUST happened in the closing session
- 3–7 specific awaiting-Winston actions (bullet list)
- 3–7 deferred-design threads with their doc paths (so Claude can read on demand)
- Any in-flight half-built features (so a fresh Claude knows what's done vs not)
- Key recent decisions that haven't yet propagated to the project memory file
- Direct quotes from Winston that reveal current intent (paste sparingly)

### 4. Surface the handoff to Winston
Tell him plainly:
- "We're at ~X% — good moment to hand off"
- "Truck is full, memory is synced, handoff brief is at [path]"
- "Drop this into a fresh chat to keep going: [path or short prompt]"

### 5. Make the new-session prompt copy-pasteable
Include a one-liner Winston can paste verbatim:
> "Pick up from `Port A Local/Session Notes/handoff-2026-04-27.md` — read that first, then ready when you say."

---

## What NOT to do

- **Don't ghost the limit.** If a tool call truncates or a file read fails for
  context reasons, surface it. Don't silently degrade.
- **Don't proactively spam handoff offers** in healthy sessions just to be
  cautious. Use signal, not paranoia.
- **Don't auto-end a session** without Winston's go. Offer; he calls.
- **Don't lose memory by leaving updates stranded** in chat-only — always
  promote critical decisions to the project memory file before handoff.
- **Don't assume the next Claude has session history.** Write the handoff
  brief as if for a stranger who's smart but blank.

---

## Minimum viable handoff (5-minute version, when time is short)

If we hit the wall faster than expected:
1. Commit + push everything (one minute)
2. Sync memory mirror (one command, instant)
3. Add a one-paragraph "JUST FINISHED" + "NEXT" section to the project memory file (two minutes)
4. Tell Winston the project memory file IS the handoff brief and to paste a pointer to it into the next chat (one minute)

Better than nothing. The vault + memory + git push are the durable carriers
— chat is ephemeral.

---

## Application across projects

| Project | Memory file | Mirror location | Handoff brief location |
|---------|-------------|-----------------|------------------------|
| PAL | `project_pa_local.md` | `port-a-local/Port A Local/Memory/` | `port-a-local/Port A Local/Session Notes/handoff-DATE.md` |
| CrossRef | `project_crossref.md` | `crossref/memory/` | `crossref/session-notes/handoff-DATE.md` (TBD) |
| Sage Em | `project_sage_em.md` | `sage-em/sage/Sage Em/memory/` | TBD |
| Heye Lab | `project_heye_lab.md` | (no project repo yet) | TBD |
| Future projects | Create on first session | Establish repo mirror | Establish session-notes folder |

For projects without an established mirror yet, the immediate handoff brief
lives in the project's primary working directory + the user memory file
gets the summary inline.

---

## Why this matters

Winston's working style is "push it to the max, walk back if needed"
(per `feedback_style.md`). High-velocity sessions naturally pile up
context. Without a foolproof handoff, the cost of a long good session is
losing the thread when context tips. With this rule, the cost is bounded:
worst case is ~10 minutes of handoff overhead, and the work + decisions +
deferred threads survive cleanly into the next chat.

---

## Pickup-here

When this file gets revisited:
- [ ] After first real handoff, audit which steps actually mattered, prune
- [ ] If a programmatic context-percentage signal becomes available in
      Claude tooling, wire it in
- [ ] Establish session-notes folders for CrossRef + Sage Em the next
      time we're working in those projects
- [ ] Decide whether handoff briefs should be auto-emailed to Winston or
      just live in vault files (currently: vault only)
