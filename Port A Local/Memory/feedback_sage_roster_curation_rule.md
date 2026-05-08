---
name: Sage agency roster curation rule (dashboard vs. HQ seed)
description: Small agencies (≤15 staff scraped) get full roster in agencies.ts. Larger agencies (>15) get leadership-tier cut in agencies.ts; full roster goes to HQ Step 2 seed JSON for Z-curate-out workflow. Locked 2026-04-28 PM.
type: feedback
originSessionId: 39f652cb-f71a-42ff-9605-fa479524a0b5
---
When ingesting agency rosters from website scrapes, apply this size-gated cut between the live dashboard data file (`sage-em-dashboard/app/data/agencies.ts`) and the HQ Step 2 seed JSON (`vault/Raw Sources/agency-rosters-DATE.json`):

## Rule

**Roster size ≤ 15 staff** (scraped total): include the full roster in `agencies.ts`. The dashboard surfaces every contact. No leadership-tier filtering. The seed JSON contains the same full roster (no asymmetry).

**Roster size > 15 staff**: include only the leadership tier in `agencies.ts`. Full roster goes to seed JSON. Dashboard stays compact; HQ Step 2 ingest gets everything for the Z-curate-out workflow.

## Leadership-tier definition (for >15 cut)

Include in `agencies.ts`:
- All principals / owners / partners / CEO / President / VP-tier
- All branch managers (per-office leadership)
- All department heads: Sales Manager, Specifications Manager, Controls Manager, Quotations Manager, Customer Service Manager, Order Administration Manager, Controller / Director of Accounting
- Key sales/specs/controls staff who anchor a territory or office where leadership isn't otherwise represented (e.g., the only spec rep in an outpost office)

Exclude from `agencies.ts` (still goes to seed JSON):
- Customer service representatives (the role, not the manager)
- Order administration / submittals / project order entry
- Field service technicians
- IT / HR / Receptionist / Facilities
- Accounts receivable/payable individual contributors
- Junior sales coordinators / events coordinators / marketing coordinators
- County-level quotation specialists (the lead Quotations Manager covers the team)

## Rationale

`agencies.ts` powers the live Sage operations dashboard — it should surface "who do we actually engage" and stay compact (each agency renders as a card; bloat = scroll). Full directory is HQ Step 2's job, where the curate-out workflow Winston specced lets Zack apply industry knowledge to filter inside-sales-stays / admin-out / etc.

## Origin

Winston 2026-04-28 PM, after the 8-agency website-scrape pass produced 353 contacts total. Implicit rule was applied silently during patches (curated leadership for ALR/MZ/AMA/CLS, full roster for Hartwell Cook/Premier OK/Resource Lighting/Lighting Group). Winston flagged "how are we choosing how many of the roster we are inputing? - just dawned on me how many ALR has for example" → conversation surfaced three options (a/b/c); Winston picked **Option A: lock the size-gated rule and document.**

## Snapshot of the 2026-04-28 application

| Agency | Scraped | In agencies.ts | In seed JSON |
|---|---|---|---|
| Hartwell Cook | 6 | 6 (full) | 6 |
| Lighting Group LV | 4 | 4 (full) | 4 |
| Resource Lighting NM | 12 | 12 (full) | 12 |
| Premier OK | 15 | 15 (full) | 15 |
| Creative Lighting SC | 32 | 18 (leadership) | 32 |
| AMA Lighting | 37 | 14 (leadership) | 37 |
| Mercer Zimmerman | 88 | 13 (leadership) | 88 |
| ALR (CA) | 159 | 14 (leadership) | 159 |

## Cross-reference

- `Strategy/Sage HQ Step 2 — Spec from 2026-04-28 PM Email.md` § B — Z-curate-out workflow definition
- `feedback_sage_zack_relationship_override.md` — when Z-introduction overrides Acuity-first
- `feedback_sage_co_primary_contact.md` — co-primary pattern for non-principal entry-points
- `feedback_sage_z_intro_primary_end_to_end.md` — don't go above Z's introduced contact
