---
name: HeyeDeploy — pattern-thinking across all Heye Lab projects
description: Cross-project framework rule. The 4-layer hierarchy + the rule for filing patterns/components/verticals. Memory pointer; canonical body lives in github.com/haveebot/heyedeploy.
type: feedback
originSessionId: 2026-04-27-heyedeploy-pattern-thinking
---

**This file is now a Cliff's Notes pointer.** The canonical body lives at `~/Projects/workspace/heyedeploy/` (mirrored at github.com/haveebot/heyedeploy). Slimmed 2026-05-01 from 47KB after the framework's standalone repo went live.

## The 4-layer hierarchy

```
HeyeDeploy (framework + customer-facing brand action)
   ├─ Patterns          — code shapes (one shape at a time)
   ├─ Components        — bundled capabilities (<X>Deploy); plug into multiple verticals
   ├─ Vertical-Deploys  — SaaS shells per customer class
   └─ Tenants           — concrete deployments (vertical + components + tenant-specific glue)
```

Components and verticals share the `<X>Deploy` suffix. Customer-facing: framework name doubles as the action — "We HeyeDeploy your business in an hour."

## The rule

**Every reusable pattern any Heye Lab project ships gets treated as a HeyeDeploy template.** When a flow has been built ≥2× across Heye Lab projects, file the pattern doc. Two implementations is the line — earlier is over-fitting, later is debt.

## Five practical guidelines

1. **Reference the canonical implementation by name** in build briefs + commits (e.g., "Mirror PAL's runner Connect at `port-a-local/src/app/api/deliver/driver/connect/*`. Don't invent.")
2. **Document cross-project shape, not project-specific bits** — separate pattern bits (carries) from project-specific bits (tenant customizes)
3. **File pattern docs at second implementation** — single tenant stays in tenant repo; second build proves shape generalizes
4. **Build briefs reference patterns by path** — explicit "don't invent" prevents drift
5. **The patterns catalog lives in the repo**, not scattered across project memories — see `heyedeploy/patterns/README.md`

## Cross-project principles (apply across every tenant)

- **Cleanest mental model** — bias toward simpler, even if it means collapsing intermediate states
- **Clear-usable analytics** — reflect real customer activity, never admin/operator self-traffic; filter at multiple layers
- **Anti-gatekeeping** — quality is surfaced, not enforced; default is "let them in"
- **Customer pulls the platform** — when a customer asks for X-as-if-it-exists, that's the PMF signal
- **Verify before declare** — audit the source of truth before claiming X is built/bulletproof/covered
- **Consumer-app feel for non-tech operators** — UX polish IS a feature; tile launchers, breadcrumbs, hide-dev-metadata
- **Same-Environment Agent Auth** (2026-05-01) — agents run in our environment; customer credentials never reach the agent layer
- **Graduated agent-trust ladder** (2026-05-01) — Observe (paper) → Confirm-each → Autonomous, per capability, per tenant

## When a pattern is NOT a HeyeDeploy template

Skip filing if:
- It's brand/voice work (each tenant has its own brand)
- It's local content (each town/festival/business directory has its own)
- It's a single-vendor relationship
- It's domain-specific scoring (CrossRef's electrical/lighting graph; Sage's agency-pipeline scoring)

Rule: **if the SHAPE generalizes, document the pattern. If only the CONTENT generalizes, just ship.**

## Where the body lives

- `heyedeploy/framework.md` — full meta, principles, comparison table, customer-facing-action section
- `heyedeploy/components/` — 9 components catalogued (OnboardDeploy, MarketingDeploy, XrefDeploy, ArchiveDeploy, CRMDeploy, ContractsDeploy, BrandPackDeploy, CommerceDeploy, WholesaleDeploy, TicketingDeploy)
- `heyedeploy/verticals/` — CityDeploy, EventDeploy, BrandDeploy, RepDeploy locked + BuildDeploy/RealtyDeploy proposed
- `heyedeploy/operations/` — build-discipline, agent-trust-ladder, 501c3-formation, Heye Lab Foundation execution, sandfest-shadow-build
- `heyedeploy/tenants/` — per-tenant docs (PAL, Sandfest, PR, TX Culture, RKay, Cactus Coast, Indianola, PortaHistory)
- `heyedeploy/decision-log/` — dated framework-level decisions
- `heyedeploy/docs/research/` — external sources informing the framework (Moomoo CEO interview)
- `heyedeploy/docs/briefs/` — communications drafts (Nick brief sent 2026-05-01; Cliff brief pending Winston-led conversation)
- `heyedeploy/docs/handoffs/` — session handoff briefs

## How to apply (Claude session behavior)

- **For framework questions** — READ the heyedeploy repo. This file is the index, not the answer.
- **For pattern lookup** — `heyedeploy/patterns/README.md` and `heyedeploy/components/<x>-deploy.md`
- **For tenant context** — `heyedeploy/tenants/<slug>.md`
- **Don't pre-extract** — the 4-phase rule (Phase A canonical → Phase B second-use → Phase C extract → Phase D mature). Two implementations is the line.
- **HeyeDeploy moment as customer pitch** — framework name = customer-facing action. Pitch escalation: "AI gives you one expert; HeyeDeploy gives you the whole consulting firm in one click."
