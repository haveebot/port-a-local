---
name: Sage agency targeting — Zack-relationship-override
description: Zack's personal/network introductions override Sage rule #1 (target Acuity first). Activated MZ, LAI, ALR-Darin 2026-04-28.
type: feedback
originSessionId: 39f652cb-f71a-42ff-9605-fa479524a0b5
---
When Zack has personally met someone at a conference, has a close in-person contact, or makes a direct relationship-based introduction at an agency, that agency moves to Sage's `active` pipeline stage — regardless of whether the agency is the Acuity Brands / Lithonia Lighting rep in their territory.

**Why:** Sage rule #1 (target Acuity rep FIRST, see `memory/project_sage_em.md` "Agency Rules from Zack") is research-driven targeting logic. Zack-personal-relationships are a higher-leverage vector that overrides cold-research targeting. Origin source: Winston 2026-04-28 ingested three contacts handed over by Zack — Trevor Kramer (Mercer Zimmerman, Cooper rep, met at conference), Jason Frey (LAI, via Zack network), Darin Buscaglia (ALR, via Zack close-contact tee-up). Two of those three (MZ, LAI) are non-Acuity but became `active` because Zack opened the door.

**How to apply:**
- When ingesting a new agency contact handed off by Zack: confirm the agency is NOT the SignTex rep in their territory (Sage rule #2 — hard conflict, NOT overridden); prefer they're NOT the Evenlite rep (Sage rule #3, but Zack-relationship can override Evenlite too if needed)
- If Zack-relationship applies, mark `acuityRep: false` (truthful) but set `campaignStage: "active"` and capture the override-reason in the agency notes
- Don't gate on Acuity status when Zack's network is the source — the ST/Evenlite blacklist still applies, but Acuity-first becomes Acuity-preferred
- The override is bidirectional: Acuity reps via Zack-relationship are highest-priority (Tier A); non-Acuity via Zack-relationship are also Tier A; Acuity reps via cold research are Tier B

**Cross-reference:** existing rules in `memory/project_sage_em.md`. Tier structure surfaced in `Strategy/Pipeline Snapshot 2026-04-28.md` (vault).
