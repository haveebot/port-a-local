---
name: Sage standard agency intro email pattern
description: Recovery-as-intro pattern that landed cleanly with Travis (L&EA) becomes the round-2 outreach standard. Template at vault Strategy/Standard Agency Intro Email Template.md. Locked 2026-04-30 PM.
type: feedback
originSessionId: 2026-04-30-pm-lea-recovery
---

The L&EA correction email Winston sent Travis 2026-04-30 13:16 is the new standard for agency intros. Pattern crystallized from a recovery moment — when the corrected v1.2 contract + v1.2 brief had to land cleanly enough to soften a process error — but the composition is the strongest outreach template Sage has produced and gets canonicalized as the round-2 baseline.

## The send that landed

> Perfect, Travis. Thank you. I wanted to get these back over to you. You can send the agency brief to your team, let us know if you need additional materials to get started. Everything will be available in your agency portal soon.
>
> Also attached is a v1.2 agreement. Our principles all have agency backgrounds so they wanted the language softened a bit. For example we don't require monthly reports from each other, we operate as needed. We will also provide all the real-time info you need and input areas for our use/review in your portal so that type of thing won't matter anyhow.
>
> The signature and info for our President and the same for you, are already in the doc. If you'd like to sign a fresh document just let me know. If you're good then that will be both of our records.

Travis replied 5h22m later: *"I'm good. Please just send the log in info for the portal when it's ready."*

## Pattern (5 parts)

1. **Personal opener** — name, brief acknowledgment, no "Hi"
2. **What's attached + an action item for them** — "send the brief to your team"
3. **Future-looking promise** — "available in your agency portal soon" / "we'll provide real-time info"
4. **Operational philosophy** — what Sage IS by being explicit about what Sage isn't (no monthly reports, quote-by-quote, design-assist over engineering-stamping, partner-not-vendor)
5. **Choice for them** — "if you'd like to sign fresh, let me know; if you're good, this is both our records"

## Why it works

- **Acknowledgment without apology** — "I wanted to get these back over to you" not "sorry I sent the wrong version"
- **Reframes the error as an upgrade** — "softened the language" lets the recipient see a refined doc, not a botched one
- **Concrete examples ground the philosophy** — "we don't require monthly reports" is more memorable than "we operate as partners"
- **Choice respects their autonomy** — they decide whether the existing signatures stand or they want fresh
- **Future-looking close** — "agency portal soon" plants demand and gives Travis a reason to come back

## How to apply for round-2 fresh sends

The recovery framing doesn't apply to fresh introductions, but the SHAPE does. Tier-aware adaptations live in the vault template at:
- [`Strategy/Standard Agency Intro Email Template.md`](../../../Projects/workspace/sage-em/sage/Sage Em/Strategy/Standard Agency Intro Email Template.md)

Tiers:
- **A (Z-handoff warm)** — "Z mentioned he'd connected us…"
- **B (Acuity-confirmed cold)** — "Reaching out on Sage Em…"
- **C (Non-Acuity alt-play)** — "Reaching out specifically because the Acuity rep in your territory carries SignTex…"
- **D (Texas queue)** — "Quick intro: Sage Em is…"

## Voice rules

- No "Hi" + first name + comma — lead with the name on its own line
- Sage's POV — "Sage Em is" / "we operate" — first person plural
- No emojis, no exclamation marks (Sage Brand v2.0)
- One concrete operational example per email (the brief carries the feature density)
- Specific small ask — "20-min call" not "interested?"
- Sign off "— Winston" plain — let the email client render the signature block

## Attachment rules

- Always attach the latest v1.X **Sage-Agency-Brief** PDF from Desktop
- **DO NOT attach the contract on first send.** Contract goes after the principal call. Brief is the doorway; contract is the close.

## How HQ should integrate

The `/api/agency/[id]/outreach-draft` endpoint should:

1. Pull the agency's tier from the `agencies` table
2. Pull the primary contact from `agency_contacts` (co-primary supported)
3. Pull market_ids → human-friendly territory description
4. Slot all into the tier-appropriate template
5. Attach the latest send-ready brief PDF (auto-fetched from `Documents/Variants/Sage-Agency-Brief-v<latest>.pdf` or its Desktop staged copy)
6. Stage as a Gmail draft for Winston to review and send

This makes the ✏ Draft Email button on each agency card produce a publish-ready intro automatically.

## Cross-references

- Vault template: `Strategy/Standard Agency Intro Email Template.md`
- L&EA executed file (legal-of-record): `Documents/Archive/L&EA-Sage-Agency-Sales-Representative-Agreement-v1.2-EXECUTED-2026-04-30.pdf`
- Travis's acceptance: Gmail msg `19ddfba67b867449` (2026-04-30 18:50)
- Activity events: 3 rows for `lea-louisiana` in HQ Postgres covering email_sent → email_received → stage_change
- Sage Em project memory: [project_sage_em.md](project_sage_em.md)
- Brief v1.2 (the package): `~/Desktop/Sage-Agency-Brief-v1.2.pdf` (11 pages, Z's review applied, How Sage Closes Specs sales-angles section)
