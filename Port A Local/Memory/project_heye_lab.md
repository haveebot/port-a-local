---
name: HeyeLab — Nick Merrill's platform-company; HeyeDeploy framework underneath
description: HeyeLab (one-word brand) is Nick's company; Heye Lab is the official two-word form. Winston co-develops with Nick. HeyeDeploy framework lives under HeyeLab. Foundation track paused.
type: project
originSessionId: d5d877ac-231f-4032-ad5d-6942700a594d
---

# HeyeLab

**HeyeLab** (one-word brand name; **Heye Lab** for official / legal / placement use) is **Nick Merrill's company**. Winston Caraker co-develops with Nick — operating as co-developer/partner, behind-the-scenes by default; Nick is the founder. Nick's personal portfolio currently sits at heyelab.com and will evolve into the umbrella front-door with Nick's bio integrated as founder. The HeyeDeploy framework (canonical at `~/Projects/workspace/heyedeploy/` + GitHub `haveebot/heyedeploy`) is the operating substrate that lives under the HeyeLab umbrella.

> **Correction note (2026-05-01 PM):** Earlier model in this file framed Heye Lab as Winston-owned LLC with Nick as co-builder. That was wrong. HeyeLab is Nick's; Winston co-develops. Tenants like PAL / Sage Em / CrossRef are Winston-operated tenants riding on the HeyeDeploy framework. Don't propagate the old "Winston owns Heye Lab" framing.

**Canonical repo for the framework:** [github.com/haveebot/heyedeploy](https://github.com/haveebot/heyedeploy) — read this first for any framework-level question. Memory holds short principles + naming + how-to-apply; the repo holds the body.

## Org structure (revised 2026-05-01 PM — earlier framing was wrong)

```
HeyeLab (Nick Merrill — founder / company owner)
   └── Winston Caraker co-develops the platform-engineering work

HeyeDeploy framework (lives under HeyeLab; Winston + Nick co-develop)
   ├─ Patterns          — code shapes
   ├─ Components        — bundled capabilities (<X>Deploy)
   ├─ Vertical-Deploys  — SaaS shells per customer class
   └─ Tenants           — concrete deployments

Tenants on the framework (Winston-operated):
   · PAL (CityDeploy first canonical) — theportalocal.com
   · Sandfest (EventDeploy first canonical) — texassandfest.app + sandfest.app, LIVE shadow build
   · CrossRef (XrefDeploy canonical) — crossref.app
   · Sage Em (RepDeploy internal canonical) — sageem.co
   · Palm Republic, TX Culture Co, RKay Builders, Cactus Coast Realty — incoming
```

> **Foundation track PAUSED 2026-05-01 PM** — the 501(c)(3) instantiation of an archive-tenant umbrella (for PortaHistory + Indianola) is paused pending internal discussion (Winston / Nick / Collie). Different structural route may replace it. Pre-pause locks (Colleen as Secretary, LegalZoom as registered agent, all director records) retained at `heyedeploy/operations/private/foundation-director-records.md`. The two-track *concept* (commercial-vs-archive separation) is not paused — only this specific 501(c)(3) instantiation. Strategic framing of 501(c)(3) as a productizable HeyeDeploy capability ("most SaaS firms can't help a customer become a 501(c)(3); we will") was a pre-pause angle — may or may not survive the alternate-route decision.

> **Legal-entity mapping** (which tenants are LLCs, who owns each, how HeyeLab the company corresponds to HeyeLab the brand): TBD — pending Winston clarity. The above reflects the operating mental model, not necessarily the legal stack.

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

**BYOAK (Bring Your Own Agent Key, LOCKED 2026-05-01 PM)** interacts with this: customers bring their own Claude/OpenAI/Gemini keys for the agent layer post-onboarding, paying providers directly. Heye Lab fronts during the HeyeDeploy moment (Option A hybrid). Foundation tenants don't BYOAK — Foundation grant-funded inference pool covers them. When the lab is mature, customers could optionally route inference through Heye Lab's lab — own model serving, no per-query cost. See architecture doc at `heyedeploy/operations/byoak-architecture.md`.

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

- When branding any tenant's public surfaces, use **"Powered by HeyeLab · Built on `<Vertical>Deploy`"** footer chain (HeyeLab one-word — see `feedback_heyelab_brand_spelling.md`)
- When Winston says "Nick," that's Nick Merrill / HeyeLab founder / Winston's co-developer
- **Don't propose Vercel→lab migrations unprompted.** Lab maturation is independent; emergent intersection.
- **Build with portability in mind** (no Vercel-specific lock-in beyond standard build/ISR)
- **For non-profit-shaped / archive tenants** (PortaHistory, Indianola, future archives) — Foundation track PAUSED 2026-05-01 PM; alternate structural route under discussion. Don't reference "Heye Lab Foundation" as if formed.
- **For BYOAK questions**: LOCKED 2026-05-01 PM — Option A hybrid. HeyeLab fronts during the HeyeDeploy moment; customer transitions to own key after. (Foundation grant-funded inference pool variant pending the alternate-route decision.) Architecture doc at `heyedeploy/operations/byoak-architecture.md`.
- **For brand-token questions** (colors, type, voice, wordmark): canonical at `heyedeploy/brand/tokens.md`. Composition 2 (charcoal canvas, neon dual-pop) + Pattern B (architecture-layer color split: coral=patterns / lime=components+verticals / pink=tenants) — locked 2026-05-01 PM. Decision rationale at `heyedeploy/decision-log/2026-05-01-heyedeploy-brand-tokens.md`.
- **For brand-spelling questions**: HeyeLab (one-word) for marketing/wordmark; Heye Lab (two-word) for legal/official. See `feedback_heyelab_brand_spelling.md`.
- When asked anything framework-level, **READ the heyedeploy repo** (`framework.md`, `brand/`, `components/`, `verticals/`, `operations/`, `tenants/`, `decision-log/`) — the repo is canonical, this memory is the index.

## Current status (end of 2026-05-01 PM)

- HeyeDeploy repo live at github.com/haveebot/heyedeploy (private; 14+ commits + truck commits)
- Sandfest shadow build LIVE at texassandfest.app + sandfest.app (deployment-protection OFF; SEO front-run posture confirmed 2026-05-01 PM)
- 10 tenants in pipeline, 4 verticals locked, 9 components catalogued
- Heye Lab Foundation formation: **PAUSED 2026-05-01 PM** — Winston pausing 501(c)(3) application pending internal discussion (Winston / Nick / Colleen); different structural route may replace it. Pre-pause state retained: roadmap + filing-ready templates done, Colleen locked as Secretary, LegalZoom locked as registered agent, all three director records collected (filed at `heyedeploy/operations/private/foundation-director-records.md` — PII; do not propagate), heyelab.com domain owned by Nick (admin@ active; winston@ + colleen@ to be created), insider-board composition review parked (option matrix A/B/C/D). Nothing committed externally — no LegalZoom signup, no IRS filings. The two-track *concept* (commercial-vs-archive separation) is not paused — only this specific 501(c)(3) instantiation. BYOAK lock unaffected.
- BYOAK auth model: **LOCKED 2026-05-01 PM** — Option A hybrid; architecture doc filed at `heyedeploy/operations/byoak-architecture.md`; framework principle added; OnboardDeploy customer-trust updated
- Nick acknowledged Treasurer role; LegalZoom-instructions brief drafted at `heyedeploy/docs/briefs/2026-05-01-nick-legalzoom-instructions.md` awaiting Winston review/send
- Cliff Strain Secretary brief archived as superseded (retained as historical reference + alternate)
- Nextra docs scaffold paused on `site-scaffold-paused` branch — pending Winston's merge/deploy decision (heyedeploy.com landing + docs combo)
