---
name: Wheelhouse — product vs script (don't conflate)
description: Two distinct things share the "wheelhouse" name; conflating them breaks contributor onboarding and tier framing
type: feedback
originSessionId: 689022d5-bc31-4099-b7ef-87aece1cfdd0
---
**"Wheelhouse" refers to two different things in Heye Lab. Never conflate them.**

| Layer | What | Who uses it | How |
|---|---|---|---|
| **Product** | https://theportalocal.com/wheelhouse — the coordination hub UI (threads, daily Pulse, design feedback, brand reviews) | Tier 1 design contributors (Collie), operators (Winston), engineers (Nick), every collaborator | Web UI, signed-in. Primary daily surface. |
| **Script** | `~/Projects/workspace/scripts/wheelhouse.py` — operator-tier diagnostic CLI | Operator-tier Claude sessions only | Terminal, requires `WHEELHOUSE_AGENT_TOKEN`. Used by `arnold` ritual at session start. |

**Why:** Saying "Tier 1 doesn't use wheelhouse" is wrong without qualification — Collie lives in the product surface daily. Tier 1 doesn't run the *script*. The product is what she'll architect into the cross-tenant marketing tool that ships across HeyeDeploy. Her Wheelhouse design / brand / voice decisions ARE the framework-level marketing tool.

**How to apply:**
- When discussing "wheelhouse" with Winston, default to the **product** unless context is operator-tier diagnostic / orient / token / token rotation
- When framing tier capabilities, qualify: "Tier 1 doesn't run `wheelhouse.py`" or "Tier 1 uses Wheelhouse the product" — never bare "wheelhouse"
- When PAL Wheelhouse design decisions get made, treat them as candidate canonicals for the cross-tenant marketing tool (per HeyeDeploy pattern-thinking) — flag them upstream when patterns emerge
- The operator-tier script is a thin diagnostic layer over the product's data; the product is the architectural surface
