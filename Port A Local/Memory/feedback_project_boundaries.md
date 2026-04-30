---
name: Project boundaries — stay in the project of the current chat
description: When working in one project (e.g., crossref), never reach into another project's code (e.g., PAL) even if a word is ambiguous
type: feedback
originSessionId: d5d877ac-231f-4032-ad5d-6942700a594d
---
When a chat is in a specific project (crossref, PAL, sage-em, etc.), all code changes stay in that project. If a term is ambiguous ("residents", "bubbles", "dispatch"), ask which element/page in the CURRENT project — don't go hunting across sibling workspace directories.

**Why:** Winston explicitly called this out mid-session ("we DO NOT work in PAL outside of a PAL chat") after I searched port-a-local for a term that referred to a tenant-switcher on CrossRef. Cross-project drift dilutes session focus, risks editing the wrong project, and burns context.

**How to apply:** If a user's request doesn't obviously map to an element in the current project, ASK for a screenshot / URL / component name before touching other projects. Each chat has a single project scope.
