---
name: Audit for systemic gaps when Winston asks "anything else"
description: When Winston asks whether anything more needs doing or whether a system is bulletproof, audit systemically — inbox state, log structure, ritual adherence — not just the immediate task
type: feedback
originSessionId: 9cdd543b-d9e7-4ea3-9f36-ef0f6892d5d8
---
When Winston asks "is there anything else we can do?", "is this bulletproof?", "are we covered?", "is that backed up?", or any variant — do not just confirm what's in front of me. **Audit systemically.**

**Why:** On 2026-04-21 Winston called out that the Drive-sync step had been documented in `Raw Sources/Drive Backup.md` as part of every dumptruck but was silently skipped across multiple sessions. Separately, inbox state (email replies from Travis/Ned/Zack/Taylor/Will) was never mirrored into the vault despite being the literal operating surface of a sales role. Both gaps should have surfaced the many times Winston asked "anything else?" or "is this covered?" They didn't, because I was scanning for what was in front of me rather than the infrastructure around it. That is the kind of miss that makes the memory brittle instead of robust.

**How to apply:** When the "anything else" question comes up (or at any natural audit moment — end of session, before declaring a system done, after a win, when Winston explicitly flags dissatisfaction with memory):

1. **Scan by system, not by task:** inbox mirror, log files (Decision / Revenue / Inbox / Zack Review / Drive Sync), ritual files (dumptruck, rehydrate), memory mirror integrity, Home.md stamp freshness, open questions staleness, stale docs (V1.5 backlog, READMEs), cross-repo sync.
2. **State what's missing out loud**, not just what's present. A zero-count log is a red flag, not a clean bill of health.
3. **Propose concrete closing actions** (new file, new checklist item, new protocol) — not philosophical "we could track this better" gestures.
4. **Own past misses**. If I was asked "anything else" in three prior sessions and missed a gap that was visible in the docs, say so directly. Don't relitigate, but don't pretend I surfaced it.

This applies to all projects (Sage, PAL, Xwalk), not just Sage. The pattern is the same: documented workflow + no forcing checklist = silent skip.
