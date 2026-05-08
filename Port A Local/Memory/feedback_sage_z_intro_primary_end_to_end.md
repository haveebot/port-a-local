---
name: Sage Z-introduction primary stays end-to-end
description: When Zack personally introduces a contact, that contact remains Sage's primary all the way through — including contract conversation. Don't go above their head. Locked 2026-04-28 PM.
type: feedback
originSessionId: 39f652cb-f71a-42ff-9605-fa479524a0b5
---
When Zack does a personal/relationship introduction at an agency, that contact stays Sage's primary contact through the entire campaign — initial outreach, follow-ups, contract conversation, signed agreement. **Don't go above their head, even if there's a higher-ranking principal in the same agency.**

**Origin:** Winston 2026-04-28 PM, in response to a Claude-suggestion that Mercer Zimmerman's CEO Shon Yust might need to be "looped in for contract conversation" alongside the Zack-introduced President Trevor Kramer. Winston's correction: "Keep Z's main contact as our main contact — let's not go above his head."

**Why:** Zack's introduction is the warm channel Sage built the relationship through. Going around the introduced contact (even to their boss) would betray that channel and could damage Z's standing at the agency. Trevor Kramer signs the contract for MZ; Joe Thomason signs for LAI (with Jason Frey kept co-primary as the operational entry-point per the [Sage co-primary contact pattern](feedback_sage_co_primary_contact.md)); Darin Buscaglia signs for ALR.

**How to apply:**
- When ingesting a Z-introduction agency contact, mark them `primary: true` and DO NOT add a "may need to loop in [higher-up] for contract" note.
- Higher-ranking principals at the same agency stay in the data as known principals (CEOs, owners) but are NOT Sage outreach contacts.
- Sage rep agreement signatory = the Z-introduced contact.
- If the Z-introduced contact is operationally junior (e.g., LAI Jason Frey is Outside Sales, not principal), the [co-primary pattern](feedback_sage_co_primary_contact.md) applies: aimed-target principal + relationship contact both `primary: true`. But we still don't go ABOVE the principal who's the relationship pair.

**Cross-reference:**
- [Sage agency targeting Zack-relationship-override](feedback_sage_zack_relationship_override.md) — establishes when Z-introduction overrides Acuity-first
- [Sage co-primary contact pattern](feedback_sage_co_primary_contact.md) — when relationship enters via non-principal, both get `primary: true`
- [Sage Em project memory](project_sage_em.md) — "Agency Rules from Zack" + Pipeline Snapshot
- Vault: this rule cross-referenced in `Strategy/Sage HQ Step 2 — Spec from 2026-04-28 PM Email.md` § Zack confirmation questions
