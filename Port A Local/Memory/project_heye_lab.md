---
name: Heye Lab — Winston Caraker's platform-company; LLC + Foundation two-track umbrella
description: Texas LLC owned by Winston, Nick Merrill as co-builder/engineer; HeyeDeploy framework underneath; 501(c)(3) Heye Lab Foundation incoming for grant-qualifying tenants
type: project
originSessionId: d5d877ac-231f-4032-ad5d-6942700a594d
---

# Heye Lab

Heye Lab is the platform-company that hosts Winston's product portfolio. Texas LLC owned by Winston Caraker; Nick Merrill is co-builder, engineer, and co-architect of the underlying infrastructure. The HeyeDeploy framework (canonical at `~/Projects/workspace/heyedeploy/` + GitHub `haveebot/heyedeploy`) is the operating substrate.

**Canonical repo for the framework:** [github.com/haveebot/heyedeploy](https://github.com/haveebot/heyedeploy) — read this first for any framework-level question. Memory holds short principles + naming + how-to-apply; the repo holds the body.

## Two-track umbrella (locked 2026-05-01)

```
Winston (owner)
   │
   ├─ Heye Lab LLC                  ← FOR-PROFIT umbrella
   │     · Commercial tenants
   │     · CityDeploy / EventDeploy / BrandDeploy / RepDeploy / BuildDeploy / RealtyDeploy
   │
   └─ Heye Lab Foundation (501c3)   ← NON-PROFIT umbrella (formation in progress)
         · ArchiveDeploy tenants (PortaHistory + Indianola)
         · Federal grant eligibility (NEH HCRR, IMLS, THC)
         · 1023-EZ path, ~$300, ~6 weeks
         · Board: Winston (President) + Nick (Treasurer) + Cliff Strain (Secretary, pending conversation)
```

Strategic upside: 501(c)(3) formation itself becomes a HeyeDeploy productizable operations capability — most SaaS firms can't help a customer become a 501(c)(3); we will.

## The 4-layer framework hierarchy (locked 2026-05-01)

```
HeyeDeploy (framework + customer-facing brand action)
   ├─ Patterns          — code shapes
   ├─ Components        — bundled capabilities (<X>Deploy)
   ├─ Vertical-Deploys  — SaaS shells per customer class
   └─ Tenants           — concrete deployments
```

The framework name doubles as the customer-facing action. **"We HeyeDeploy your business in an hour."** Single-word brand pattern (like Shopify). Customer experiences "HeyeDeploy" as the moment of magic; OnboardDeploy is the engine behind it.

## Verticals locked

| Vertical | Status | First tenant(s) |
|---|---|---|
| CityDeploy | Production | Port A Local |
| EventDeploy | Pre-build (LIVE shadow at texassandfest.app) | Texas Sandfest |
| BrandDeploy | Two incoming | Palm Republic + Texas Culture Co |
| RepDeploy | Internal (canonical at Sage Em) | Sage Em |
| BuildDeploy *(proposed)* | One incoming | RKay Builders |
| RealtyDeploy *(proposed)* | One incoming | Cactus Coast Realty |

## Components catalog (9 entries)

| Component | Stage | Canonical |
|---|---|---|
| OnboardDeploy | Pre-build | The HeyeDeploy moment — agent-driven migration. The moat. |
| MarketingDeploy | Stage A (PAL) | Awaiting 2nd use at Sandfest → extraction trigger |
| XrefDeploy | Stage A (CrossRef) | Awaiting 2nd-vertical plug-in |
| ArchiveDeploy | Pre-build | Parallel canonical: PortaHistory + Indianola |
| CRMDeploy | Stage A (Sage HQ) | Awaiting 2nd use |
| ContractsDeploy | Stage A (Sage) | Awaiting 2nd use |
| BrandPackDeploy | Stage A (Sage) | Awaiting 2nd use |
| CommerceDeploy | Pre-build | Palm Republic first canonical |
| WholesaleDeploy | Pre-build | Palm Republic first canonical |
| TicketingDeploy | Pre-build | Texas Sandfest first canonical |

## Tenants pipeline (8 — locked 2026-05-01)

| Tenant | Vertical | Status | Domain |
|---|---|---|---|
| Port A Local | CityDeploy | Production | theportalocal.com |
| Texas Sandfest | EventDeploy | LIVE shadow | texassandfest.app + sandfest.app (`.com` pending) |
| Palm Republic | BrandDeploy | Incoming | TBD (palmrepublic.com?) |
| Texas Culture Co | BrandDeploy | Incoming | TBD |
| RKay Builders | BuildDeploy | Incoming | TBD |
| Cactus Coast Realty | RealtyDeploy | Incoming | TBD |
| Sage Em | RepDeploy | Internal | sageem.co + hq.sageem.co |
| CrossRef | (no vertical — XrefDeploy canonical) | Beta | crossref.app |
| PortaHistory | (no vertical — ArchiveDeploy parallel canonical) | Pre-build | portahistory.com |
| Indianola | (no vertical — ArchiveDeploy parallel canonical) | Pre-build | indianola.museum target + indianola.org |

## The lab + QWEN — long-term AI cost trajectory

(Preserved from earlier memory; stays accurate.)

Nick is building "the lab" — a GPU-rich datacenter to self-host inference workloads, including QWEN models running natively. The "max it and find out — same on both sides" mindset (locked 2026-04-27): no planned Vercel→lab migration; both sides build to limit independently; intersection happens organically when both are mature.

**Why it matters strategically:** AI features that today require OpenAI/Anthropic API calls (semantic search, LFS-import, auto-pair authoring, agent inference) can eventually run on Nick's lab at fixed hardware cost rather than per-call API metering. That's the real long-term moat under HeyeDeploy.

**Today's BYOAK candidate (Bring Your Own Agent Key) interacts with this:** customers bring their own Claude/OpenAI keys for the agent layer, paying providers directly. When the lab is mature, customers could optionally route inference through Heye Lab's lab — own model serving, no per-query cost. See decision log at `heyedeploy/decision-log/2026-05-01-moomoo-parallels-byoak-candidate.md`.

## Cross-project principles (HeyeDeploy operations layer)

Locked into the framework, applies to every Heye Lab tenant:

- Cleanest mental model
- Clear-usable analytics
- Anti-gatekeeping
- Customer pulls the platform
- Verify before declare
- Consumer-app feel for non-tech operators
- **Same-Environment Agent Auth** (locked 2026-05-01 — agent runs in our environment, customer credentials never reach the agent layer; Moomoo CEO citation as external validation)
- **Graduated agent-trust ladder** (locked 2026-05-01 — Observe / Confirm-each / Autonomous; per capability, per tenant)

Full body at `heyedeploy/framework.md`.

## How to apply

- When branding any tenant's public surfaces, use "Powered by Heye Lab · Built on `<Vertical>Deploy`" footer chain
- When Winston says "Nick," that's Nick Merrill / Heye Lab co-builder
- **Don't propose Vercel→lab migrations unprompted.** Lab maturation is independent; emergent intersection.
- **Build with portability in mind** (no Vercel-specific lock-in beyond standard build/ISR)
- **For non-profit-shaped tenants** (PortaHistory, Indianola, future archives), they ride under Heye Lab Foundation; commercial tenants ride under Heye Lab LLC
- **For BYOAK questions**: customer brings own API key (Claude/OpenAI/Gemini) for agent inference under Option A hybrid (Heye Lab fronts during HeyeDeploy moment for friction-removal; customer transitions BYOAK after). Pending Winston's lock.
- When asked anything framework-level, **READ the heyedeploy repo** (`framework.md`, `components/`, `verticals/`, `operations/`, `tenants/`) — the repo is canonical, this memory is the index.

## Current status (end of 2026-05-01)

- HeyeDeploy repo live at github.com/haveebot/heyedeploy (private; 12+ commits)
- Sandfest shadow build LIVE at texassandfest.app + sandfest.app
- 8 tenants in pipeline, 4 verticals locked, 9 components catalogued
- Heye Lab Foundation formation: roadmap + filing-ready templates done; Winston-led Cliff Strain conversation pending; Texas Form 202 + IRS 1023-EZ ready to file once Cliff agrees + registered agent service selected
- BYOAK auth model: candidate filed, Option A (hybrid) recommended, pending Winston's lock
- Nick acknowledged Treasurer role
- Cliff Strain Secretary role: brief drafted, conversation Winston-led
