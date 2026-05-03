---
name: PAL vs Sage Em account separation rule
description: PAL stays on haveebot GitHub/Vercel; Sage Em gets dedicated company-only accounts. Do not conflate.
type: feedback
originSessionId: 35a4d1eb-635d-424f-a8eb-a22e66a74d90
---
**PAL keeps haveebot GitHub + Vercel. Sage Em gets dedicated company accounts.** These two businesses have opposite infra structure — don't apply one rule to both.

**PAL (Port A Local):**
- GitHub: `haveebot/port-a-local` — stays. No org migration.
- Vercel: `haveebots-projects` team — stays. No team migration.
- Business/financial accounts (Stripe, Resend, Twilio, Workspace) DO live under the LLC entity (admin@theportalocal.com).

**Sage Em:**
- GitHub org: `sageem` — dedicated, not haveebot.
- Vercel team: `sageem` — dedicated.
- All infra + financial accounts company-owned.

**Why:** PAL is a lean two-person op — dedicated orgs/teams add Vercel Pro cost ($20/mo) and overhead with zero functional benefit at current scale. Winston owns haveebot; it's effectively his. Sage Em has multiple collaborators (Zack, Taylor) and external-facing structure, so clean separation matters there.

**How to apply:** Never propose creating a `port-a-local` GitHub org or Vercel team. Do propose `sageem` org/team when Sage Em infra comes up. If uncertain, ask — don't default-plan a PAL migration based on stale roadmap bullets.

**Carve-out — haveebot@gmail.com as a comms channel (2026-04-23):** Claude has direct IMAP/SMTP access to haveebot@gmail.com for reading and sending mail (app password in `workspace/.env`, tool at `workspace/scripts/haveebot_mail.py`). This is for *communication* (e.g., Collie's design feedback emails direct-to-haveebot) and does NOT violate the rule above — PAL *infrastructure accounts* (Stripe/Resend/Twilio/Workspace/GitHub/Vercel) still live on admin@theportalocal.com or haveebot-as-GitHub-owner per the structure documented here. If a new PAL infra account is proposed under haveebot, the rule still blocks it. Mail-only is the exception.
