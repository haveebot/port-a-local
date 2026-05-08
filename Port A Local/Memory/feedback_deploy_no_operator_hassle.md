---
name: Deploy-model rule — if it's a hassle for the operator, it's a hassle for every tenant
description: Cross-project. Anything that requires per-action operator workaround (like manually refreshing an OG cache before each post) must be locked down systemically before it hits Deploy templates
type: feedback
originSessionId: f96f1706-d1d4-4c47-bb8b-0919a0add5eb
---
**Cross-project rule.** When something becomes an "ongoing pain point" for Winston as the PAL operator — the kind of thing where he says "I have to deal with this on every post / every order / every X" — that is the SIGNAL that it's a foundational defect, not a quirk. Lock it down systemically (defaults, CI guards, framework-level documentation) BEFORE the Deploy model ships it to other tenants.

**Why:** Winston's quote 2026-05-03 AM after the OG-staleness incident: *"if it is a hassle for me then it will be a hassle for the client."* The Deploy model (HeyeDeploy → CityDeploy → tenants) means every gotcha that survives in PAL replicates across CrossRef, Sage Em, Sandfest, future municipalities. A 5-min annoyance for one operator becomes a 5-min annoyance × N tenants × M posts/orders/whatever — that's a permanent tax on the model.

**How to apply:**
- When Winston flags something as repetitive friction ("every post," "every time," "we really need to get this locked in"), DON'T treat it as a one-off fix. Audit the surface area (every route / every endpoint / every tenant), apply a defensive default, AND add a guard that prevents regression.
- Three-layer pattern: (1) sweep all current instances, (2) add a CI/lint/runtime guard so future drift is impossible, (3) document in the relevant Deploy template doc (HeyeDeploy framework doc or vertical-specific MarketingDeploy / CityDeploy / etc.).
- The cost of "force-dynamic by default" or similar defensive defaults is almost always negligible (a few ms, a few cents). The cost of an operator-facing hassle is N × forever. Default to the defensive choice, optimize only when there's measured cost.
- Don't propose 3 options — propose the lockdown plan + execute when he says go. He doesn't want to debate technical right answers, he wants the problem to disappear.
