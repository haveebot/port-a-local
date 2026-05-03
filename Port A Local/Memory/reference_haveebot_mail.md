---
name: haveebot@gmail.com — mail tool for direct comms
description: Claude can read and send mail as haveebot@gmail.com via workspace/scripts/haveebot_mail.py. Use for Collie design feedback, other direct comms that bypass Winston-as-middleman.
type: reference
originSessionId: bc6a0dfe-9a93-407a-a506-9af356b47218
---
**Tool:** `python3 /Users/winstoncaraker/Projects/workspace/scripts/haveebot_mail.py <subcommand>`

**Auth:** Gmail app password at `/Users/winstoncaraker/Projects/workspace/.env` (gitignored, mode 600). Generated under haveebot@gmail.com with 2FA + authenticator app as primary. If auth fails (expired/revoked), ask Winston to regenerate at https://myaccount.google.com/apppasswords.

**Commands (see `--help` on the script for full list):**
- `check` — connection + auth smoke test.
- `inbox [--limit N]` — list recent threads (default 20). Unread marked with ○.
- `unread` — list unseen messages.
- `from <email> [--limit N] [--since YYYY-MM-DD]` — filter by sender.
- `collie [--limit N] [--since YYYY-MM-DD]` — shortcut for `collie.breah@gmail.com`.
- `thread <uid>` — full content of a single message (plain text preferred, HTML stripped as fallback).
- `attachments <uid> [--out DIR]` — download all attachments from a message. Default output: `./attachments/uid<uid>/`. Basename-only (traversal-safe) with collision numbering. Use for archiving Collie/Winston drops to the vault — convention: `port-a-local/Port A Local/Collie Attachments/<date>-uid<n>/` or `.../Winston Inbox/<date>-uid<n>/`.
- `send --to <addr> --subject <s> --body <b> [--cc <a>] [--html]` — send a message. `--body -` reads stdin.

**When to use:**
- Start of every PAL session — run `collie --since <last-session-date>` to catch up on design feedback without Winston having to relay it.
- When drafting a reply to Collie — send directly after Winston authorizes.
- When a PAL user asks how they can reach us — haveebot@ is the collab inbox; `hello@theportalocal.com` remains the public contact.

**When NOT to use:**
- Do NOT use for PAL infrastructure comms (Stripe disputes, Twilio, Vercel billing, etc.) — those go to admin@theportalocal.com. See `feedback_pal_vs_sageem_accounts.md`.
- Do NOT send without explicit Winston authorization for the specific message. Draft first, show him, then send.

**Sending: Winston-authorization rule.** Every outbound message needs a green light from Winston in the current session (paste the draft, wait for confirmation, then send). The script will happily send anything — the check is in the workflow, not the code. Sign off with "— The Port A Local" per `feedback_pal_email_signature.md` when the mail is on behalf of PAL.

**Credential hygiene:**
- `.env` is mode 600, gitignored at workspace root.
- App password is a 16-char Gmail credential that grants IMAP/SMTP full mailbox access. Treat like a password.
- If the laptop changes, re-export .env. If the password is suspected leaked, revoke at https://myaccount.google.com/apppasswords and regenerate.

**Memory boundary:** This is comms access, NOT account ownership. See `feedback_pal_vs_sageem_accounts.md` carve-out.
