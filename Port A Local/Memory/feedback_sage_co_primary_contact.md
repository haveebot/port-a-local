---
name: Sage co-primary contact pattern
description: Personal-relationship contacts get co-primary listing alongside the principal. Logged 2026-04-28 from LAI ingest.
type: feedback
originSessionId: 39f652cb-f71a-42ff-9605-fa479524a0b5
---
For agencies where Sage's relationship entry-point is NOT the principal/owner, list BOTH as `primary: true` in `agencies.ts` contacts:

- The **principal** = the legal/business target (always the aimed target; rep agreement signatory; the long-term relationship)
- The **relationship contact** = the operational entry-point (who Winston/Zack actually communicates with day-to-day; the warm thread that gets us to the principal)

The principal may not conduct daily business — but they're the contract-holding party. The relationship contact is the warm channel.

**Why:** Discovered 2026-04-28 ingesting LAI (Lighting Associates, St. Louis). Winston received Jason Frey's card (Outside Sales) via Zack's network, but Joe Thomason is the Principal/Owner. Marking only Jason loses the strategic target. Marking only Joe loses the warm channel. Both are operationally true; both should be primary.

**How to apply:**
- **Single primary** (default): most agencies — the principal who is also the relationship contact
- **Co-primary** (this rule): when the relationship enters via a non-principal, both principal + relationship contact get `primary: true` with an explanatory note in the agency-level `notes` field
- Pipeline outreach decisions reference the agency's notes to know whether to email the relationship-contact-first or go straight to the principal

**Schema implication for Sage HQ Step 2:** Current `agencies.ts` schema allows multiple `primary: true` per agency (boolean per contact, no enforcement). The HQ Postgres schema should formalize as either: (a) `primary` (multi-bool) + new `entry_role` enum (`principal | relationship | both`), or (b) two distinct fields `principal_target` and `relationship_contact`. Decide at Drizzle schema time. Captured in Pipeline Snapshot Schema Gaps section.

**Cross-reference:** Sage rules in `memory/project_sage_em.md`. Companion rule: `feedback_sage_zack_relationship_override.md` (Zack-relationship overrides Acuity-first). Both rules surfaced from the same 2026-04-28 LAI/MZ/Darin ingest.
