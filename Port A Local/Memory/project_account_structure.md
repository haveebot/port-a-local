---
name: Account structure vision
description: Winston's goal to own all accounts cleanly while Claude operates as much as possible
type: project
originSessionId: 35a4d1eb-635d-424f-a8eb-a22e66a74d90
---
Winston wants Claude to be his primary operating tool across all businesses. He is the owner/founder/principal of everything — PA Local, Sage Em, Palm Republic. The goal is accounts structured so Claude can execute as much as possible while Winston retains full ownership.

**Why:** He's building multiple businesses simultaneously and wants a lean, powerful setup — not juggling logins or depending on a developer for every action.

**How to apply:**
- Always recommend account structures where Winston is the owner/admin
- Suggest company-specific accounts (GitHub orgs, Vercel teams) rather than personal accounts for business assets
- Prefer platforms with strong CLI/API access so Claude can operate them (Vercel, GitHub, Resend, Stripe)
- haveebot = collaborator/member role, never the owner of business-critical accounts

## Target Structure

### PA Local (Port A Local) — exception to company-only rule
- **Owning entity:** Palm Family Ventures, LLC — used for PAL business/financial accounts (Stripe, Resend, Twilio, Workspace)
- **LLC is never public-facing** — generic "Port A Local" branding only
- **GitHub: stays on `haveebot/port-a-local`** (Winston owns haveebot, managed jointly). No org migration.
- **Vercel: stays on `haveebots-projects` team.** Project already named `port-a-local`, deploys to theportalocal.com. No team migration.
- Domain: ✅ theportalocal.com
- Google Workspace: ✅ live (admin@/hello@/bookings@)
- Stripe: ✅ live under admin@theportalocal.com (acct_1TLv2G…, charges + payouts enabled)
- Resend: ✅ live, bookings@ sender
- Twilio: ✅ account active, A2P brand APPROVED, campaign IN_PROGRESS at TCR
- **Reason for the exception:** PAL is a two-person solo-ish operation; dedicated GitHub/Vercel orgs would add Vercel Pro cost ($20/mo) and overhead with zero functional benefit at current scale. Business/financial accounts still live under the LLC entity.

### PAL Email Structure (FIRM)
- admin@theportalocal.com — all account logins and platform management
- hello@theportalocal.com — public contact, Get Listed, Claim Listing
- bookings@theportalocal.com — Resend transactional sender for portal confirmations

### Sage Em — full company-only account separation (FIRM)
- GitHub org: `sageem` (Winston owner, collaborators as members) — not on haveebot
- Vercel team: `sageem` (Winston owner) — not on haveebots-projects
- Stripe: business account under Sage Em entity
- All infra + financial accounts belong to the company, never to haveebot

### General principle
- Domains → Vercel (integrated, no manual DNS)
- Code → GitHub orgs per company
- Deployments → Vercel teams per company
- Billing → company card/email per business
- Claude operates through CLI/API wherever possible
