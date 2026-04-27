# HeyeDeploy — pattern-thinking across all Heye Lab projects

_Cross-project rule | Applies to ALL Heye Lab projects (PAL, CrossRef, Sage Em, future) | Filed 2026-04-27 PM by Winston, refined same session after the CityDeploy-vs-meta-framework framing fix_

---

## The naming hierarchy (matters — don't conflate)

```
HeyeDeploy                  ← the framework / operating model
   │
   ├─ CityDeploy            ← vertical: small/mid-town local-marketplace SaaS
   │     └─ PAL             ← first CityDeploy tenant
   │
   ├─ <future-vertical>Deploy  ← vertical: e.g. an electrical-brokerage SaaS
   │     └─ CrossRef        ← could become first tenant if it productizes
   │
   ├─ <future-vertical>Deploy  ← vertical: e.g. a creative-studio SaaS
   │     └─ Sage Em         ← could become first tenant if it productizes
   │
   └─ shared cross-project tooling
         · Wheelhouse (ops board)
         · arnold drill (session startup)
         · truck protocol (session handoff)
         · memory mirror sync
         · workspace/scripts/* CLIs
```

**HeyeDeploy is the meta-framework.** Every `<Vertical>Deploy` SaaS Heye Lab ships is BUILT USING HeyeDeploy patterns. Tenant instances run on top of a `<Vertical>Deploy`.

CityDeploy is the first vertical (small/mid towns, PAL is its proof-of-concept tenant). Future verticals inherit the same HeyeDeploy patterns.

---

## The rule

**Every reusable pattern any Heye Lab project ships gets treated as a HeyeDeploy template, not just patterns inside CityDeploy.**

Articulated by Winston 2026-04-27 PM:

> "we will CityDeploy the model we use on any project across everything worthwhile that we work on - across all projects - 'HeyeDeploy or HLDeploy, etc.'"

Initial framing was CityDeploy-scoped. Same session refined to HeyeDeploy-scoped because the meta-pattern is bigger than municipal SaaS — it cuts across CrossRef (electrical/lighting), Sage Em (creative/agency), and any future Heye Lab project.

---

## What this means in practice when building

### 1. Reference the canonical implementation by name (across projects, not just within one)

When building anything that mirrors a previous flow — even from a different Heye Lab project — write the build brief or commit message with the canonical reference upfront.

✅ **Yes:** "Mirror the runner Connect flow at `port-a-local/src/app/api/deliver/driver/connect/{start,refresh,dashboard}`. Don't invent." (Even if I'm building inside CrossRef now.)

❌ **No:** "Build Stripe Connect onboarding for vendors." (Doesn't tell future-Claude or Nick the existing pattern; invites re-invention; loses the cross-project compounding.)

### 2. Document cross-project shape, not project-specific bits

Every HeyeDeploy template doc should distinguish:
- **Project-specific bits:** route paths, table names, copy strings, brand styling
- **Pattern bits:** the lookup chain, the auth model, the failure modes, the rotation flow

The pattern-bit list is what carries to siblings. The project-specific list is what each tenant customizes.

Example from `feedback_wheelhouse_cross_project_pattern.md`:
> "Per-agent Sensitive bearer tokens in Vercel" ← pattern bit
> "WHEELHOUSE_TOKEN_WINSTON_CLAUDE → resolves to participant `winston-claude`" ← project-specific

Both belong in the doc.

### 3. File a `feedback_<pattern>_cross_project_pattern.md` when a template solidifies

Not every shipped flow is a HeyeDeploy template. But when a flow has been built ≥2× anywhere across Heye Lab projects (e.g., PAL runner Connect → PAL vendor Connect → CrossRef supplier Connect), the second build is the cue: **file the pattern doc**. Title convention: `feedback_<thing>_cross_project_pattern.md`. Index in `MEMORY.md`. Add to `sync-memory.sh` whitelist for whichever project mirrors are relevant.

### 4. Build briefs reference the pattern docs by path

When a build brief is template-replication (e.g., the Stripe Connect onboarding brief at `Port A Local/Features/Locals Sell-mode Stripe Connect Onboarding — Build Brief.md` mirrors the runner flow), the brief opens with the canonical reference and explicitly tells future-Claude *"don't invent."* This prevents drift between project copies.

### 5. The HeyeDeploy patterns catalog lives in the platform vision doc

`Port A Local/Memory/CityDeploy — Platform Vision.md` currently houses the catalog. **Should be renamed / restructured to put HeyeDeploy on top, CityDeploy as a section underneath.** Pickup-here below.

---

## Patterns already locked in as HeyeDeploy templates

| Pattern | Canonical implementation | Pattern doc | Status |
|---------|--------------------------|-------------|--------|
| Wheelhouse (ops board) | PAL: `/wheelhouse` routes + middleware + `wheelhouse_*` tables | `feedback_wheelhouse_cross_project_pattern.md` | LOCKED 2026-04-27 |
| Memory mirror sync | PAL: `scripts/sync-memory.sh` whitelist-based | (in-line in script header) | LOCKED 2026-04-26 (Sprint E) |
| Context-handoff "truck" | session-end ritual | `feedback_context_handoff.md` | LOCKED 2026-04-27 |
| Startup-drill "arnold" | session-start ritual | `feedback_arnold_startup_drill.md` | LOCKED 2026-04-27 |
| Stripe Connect Express onboarding | PAL: `src/app/api/deliver/driver/connect/*` + signup form | TBD — file when sell-mode vendor Connect ships (the second build inside PAL — third copy across projects elevates it) | designed, second copy in flight |
| Magic-link approval/reject (HMAC) | PAL: `src/app/api/deliver/runner/{approve,reject}/route.ts` + locals offer equivalents | TBD — file when third instance ships | live, two implementations |
| Email cascade (paid → vendor + customer + admin) | PAL: `src/lib/{deliverEmails,localsBuyEmails,housekeepingEmails}.ts` | TBD — file once 3+ verticals are stable | live, three implementations |

---

## When a pattern is NOT a HeyeDeploy template

Sometimes a flow is genuinely project-specific and shouldn't be replicated across Heye Lab projects:
- Brand/voice work (Collie's PAL brand system) — every project has its own brand
- Local content (Heritage research, Dispatches, businesses directory) — town-specific
- Tournament-coverage stack — fishing-tournament-specific in shape, but the data+components ARCHITECTURE is template-able for any cyclical event
- Single-vendor relationships (the maintenance vendor) — every tenant has different local vendors
- Domain-specific scoring (CrossRef's electrical/lighting cross-reference graph) — domain-locked

**The rule:** if the SHAPE generalizes across Heye Lab projects, document the pattern. If only the CONTENT generalizes, just ship it on the project at hand.

---

## How HeyeDeploy relates to CityDeploy / other Deploys

| | HeyeDeploy | CityDeploy | Tenant (e.g. PAL) |
|--|------------|------------|-------------------|
| **Scope** | All Heye Lab projects | One vertical (small/mid-town local marketplaces) | One concrete town |
| **Audience** | Heye Lab team | Other towns/cities | One town's residents + visitors |
| **What ships** | Operating model, pattern docs, shared tooling | A SaaS product (rebranded PAL clone) | A live website |
| **Public-facing?** | Internal mostly (could become IP) | Yes — CityDeploy is sold/licensed | Yes — theportalocal.com |
| **Footer attribution** | n/a (it's the meta-layer) | "Powered by Heye Lab" | "Built on CityDeploy" |

**Footer chain stays the same:** `theportalocal.com` → "Powered by Heye Lab · Built on CityDeploy" — accurate as-is. CityDeploy IS Heye Lab's first vertical-Deploy. HeyeDeploy is the framework underneath that Heye Lab uses to make BOTH efficient.

---

## Why this matters

Without explicit HeyeDeploy thinking, every new Heye Lab project + every new CityDeploy tenant + every new vertical-Deploy is a custom job. With it: every build investment compounds across all projects, all verticals, all tenants. Same engineer time, exponential platform value.

It's also how Nick's platform-extraction work stays cheap: he reads HeyeDeploy pattern docs in any project's memory mirror, doesn't have to reverse-engineer each codebase from scratch.

---

## Pickup-here

When this file gets revisited:
- [ ] Rename `Port A Local/Memory/CityDeploy — Platform Vision.md` to `HeyeDeploy — Framework + Verticals.md`. Restructure so HeyeDeploy is the header and CityDeploy is a section beneath. Existing PAL-specific feature inventory stays under the CityDeploy section.
- [ ] Audit existing PAL features and identify HeyeDeploy template candidates not yet documented
- [ ] Backfill pattern docs for the templates already locked in (Stripe Connect Express, magic-link HMAC, email cascade) once they hit the third-implementation threshold
- [ ] Decide: which feedback files belong in EVERY Heye Lab project's memory mirror vs which are PAL-only? (Probably: HeyeDeploy + arnold + truck + Wheelhouse pattern + CityDeploy pattern doc all go everywhere; PAL-specific brand/dispatch/etc stay PAL-only.)
- [ ] When CrossRef gets a memory mirror established, copy this file in. Same for Sage Em. The HeyeDeploy doc should live in every Heye Lab project's mirror so the framework is visible from any working context.
- [ ] Decide whether to file a complementary `feedback_<vertical>_deploy_pattern.md` for each new vertical-Deploy as it spins up (e.g., a future ElectricalDeploy or StudioDeploy doc)
