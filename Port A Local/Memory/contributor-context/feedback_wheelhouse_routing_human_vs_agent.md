---
name: Wheelhouse routing — human vs agent participant IDs
description: Threads routed to `awaiting:<name>` ping the person's email; `awaiting:<name>-claude` pings operator. Plus SMS for instant pings since Phase 2 SMS push isn't built.
type: feedback
originSessionId: 689022d5-bc31-4099-b7ef-87aece1cfdd0
---
**Cross-project rule. Applies to every Heye Lab Wheelhouse instance (PAL canonical today; CrossRef, Sage Em, future tenants follow).**

The Wheelhouse push system in [`port-a-local/src/lib/wheelhousePush.ts`](https://github.com/haveebot/port-a-local/blob/main/src/lib/wheelhousePush.ts) maps participant IDs to email recipients:

| Participant ID | Email recipient |
|---|---|
| `winston` | `admin@theportalocal.com` |
| `collie` | `collie.breah@gmail.com` |
| `nick` | `nickbmerrill@gmail.com` |
| `winston-claude` | `admin@theportalocal.com` (operator inbox) |
| `collie-claude` | `admin@theportalocal.com` (operator inbox) |
| `nick-claude` | `admin@theportalocal.com` (operator inbox) |

**Routing rule:**

- **Directive meant for the person to read + decide** → `awaiting:<name>` (bare name) — emails them at their personal/work address
- **Coordination meant for the agent to action** → `awaiting:<name>-claude` — emails operator inbox; agent reads from Wheelhouse on next session

**Why this matters:** sending a scope-handoff or brief to `awaiting:collie-claude` means *Collie-the-person never gets a notification* — only her Claude sees it on next launch. Operator gets the email at admin@. Failure mode: Collie doesn't know she has work waiting.

**SMS gap:** the file's docstring notes Phase 1 = email only; Phase 2 = SMS via Twilio (subset of participants opt in by adding their phone to env). Phase 2 is **not yet built.** Until it ships, **for instant pings to a Heye Lab collaborator, send SMS via PAL Twilio direct** using the contact-ledger numbers (Winston `+15125681725`, Nick `+15122015353`, Collie `+12107095771`; PAL sender `+13614281706`).

**How to apply:**

- When posting Wheelhouse threads via `wheelhouse.py new --state awaiting:<id>`: pick `<id>` based on whether action is on the person or their agent
- For high-priority directive threads, follow up with a Twilio SMS pointing to the thread URL — assumes the recipient is checking SMS, which is fast and reliable
- When in doubt, route to the person (`awaiting:collie`) and let her Claude pick it up from her queue when she launches the session

**Edge case:** the `colliebreah` GitHub login and the `collie` Wheelhouse participant ID are different identifiers. Don't confuse the two; participant ID is hyphenless first name (or `<name>-claude` for the agent), GitHub login is the full handle.

**Filed 2026-05-08 PM** after a marketing-scope handoff thread routed to `awaiting:collie-claude` left Collie unaware her email was never pinged.
