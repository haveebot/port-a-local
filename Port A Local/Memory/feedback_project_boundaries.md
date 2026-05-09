---
name: Project boundaries — stay in the project of the current chat
description: When working in one project (e.g., crossref), never reach into another project's code (e.g., PAL) even if a word is ambiguous
type: feedback
originSessionId: d5d877ac-231f-4032-ad5d-6942700a594d
---
When a chat is in a specific project (crossref, PAL, sage-em, etc.), all code changes stay in that project. If a term is ambiguous ("residents", "bubbles", "dispatch"), ask which element/page in the CURRENT project — don't go hunting across sibling workspace directories.

**Why:** Winston explicitly called this out mid-session ("we DO NOT work in PAL outside of a PAL chat") after I searched port-a-local for a term that referred to a tenant-switcher on CrossRef. Cross-project drift dilutes session focus, risks editing the wrong project, and burns context.

**How to apply:** If a user's request doesn't obviously map to an element in the current project, ASK for a screenshot / URL / component name before touching other projects. Each chat has a single project scope.

---

## Reinforced 2026-05-08 evening — DON'T surface other projects' state from inside this chat

When asked "what's next?" inside CrossRef, don't reach into PAL/Sage/HeyeWay
context at all. Two specific failure modes seen tonight, both worse than the
naive boundary-cross:

1. **Cross-project info from THIS project's own notes is stale by definition.**
   Session-N's truck doc in CrossRef referencing PAL state is a snapshot from
   that day, not live. Reading "PR#6 awaiting Winston's review" from a 4-day-old
   CrossRef truck doc and presenting it as if it were current PAL status is a
   double-violation: boundary cross + stale-state-as-live.

2. **Cross-project memory entries** (project_pa_local.md, etc.) are summaries
   for orientation when you ENTER that project, not actionable state queries
   from outside it. Don't pull them in to answer "what's pending in PAL" from
   a CrossRef chat.

**Hard rule:** live state on Project X only comes from a Project X chat reading
Project X's repo. From inside CrossRef, the answer to "what next?" is
CrossRef-only options + an optional "you might also have other projects with
open items, check those in their own chats" — without naming brands, PRs,
people, or specific state.
