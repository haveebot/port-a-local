---
name: PAL email threading — stay in the thread
description: Reply within existing haveebot email threads; do not start new threads for follow-ups or drift the subject mid-conversation
type: feedback
originSessionId: 02fa516d-c6bf-42c6-b1e3-727a1cb3e023
---
**Rule:** When Winston or Collie emails haveebot, reply within the existing thread. Don't spawn a new conversation for each outbound message. Keep the subject line intact across a thread — don't add new thematic tags to the subject as the content shifts ("— icons v2 + new lighthouse + X").

**Why:** Winston clarified 2026-04-24: "you can reply and communicate through emails Collie and I send, doesn't have to always be a new email thread." The rule before was tacit (Winston-authorization before send, sign off `— The Port A Local`); he's now explicitly approving continuous in-thread replies as the default. Threading keeps the conversation history continuous on his + Collie's phones. New subjects fragment it in Gmail and force them to reconstruct context. My 2026-04-24 reply with subject "Re: Catching you up on PAL — icons v2 + new lighthouse + /brand kit + marketing ops live" added a thematic tag mid-thread; the better move was the unchanged parent subject "Re: Catching you up on PAL — plus opening a direct channel."

**How to apply:**
- On reply: use the EXACT original subject line from the oldest message in the thread (or `Re: <that>` if the original wasn't already prefixed). `haveebot_mail.py thread <uid>` shows the Subject verbatim — copy it.
- Put thematic context in the body, not the subject.
- Use `haveebot_mail.py send --to ... --subject "<original>" --body -` for replies.
- Only start a new thread when: (a) genuinely new topic after the prior thread wrapped up, or (b) the topic has a durable subject-line purpose (e.g., recurring "Live Music — Week of MMM DD" photos need their own thread per week so the subject-as-dedupe-key works).
- Winston-authorization before send still applies (see `reference_haveebot_mail.md`).
