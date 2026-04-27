# CityDeploy pattern-thinking — every PAL build is a template

_Cross-project rule | Applies to PAL + every Heye Lab project | Filed 2026-04-27 PM by Winston_

---

## The rule

**Every reusable pattern PAL ships gets treated as a CityDeploy template, not just Wheelhouse.**

PAL is the proof of concept. CityDeploy is the SaaS-ified engine sold to other small/mid towns. That means every flow we build on PAL — runner onboarding, Stripe Connect, magic-link auth, email cascades, marketplace patterns, dispatch, customer tracking, ops boards — is a candidate template. When we ship it on PAL, we document its shape so the next CityDeploy tenant inherits it cheaply.

Articulated by Winston 2026-04-27 PM:

> "we're also running full CityDeploy model on everything, correct? - patterns - how we build runner onboarding portals - ect.?"

Yes. Everything.

---

## What this means in practice when building

### 1. Reference the canonical PAL implementation by name

When building anything that mirrors a previous PAL flow, write the build brief or commit message with the canonical reference upfront:

✅ **Yes:** "Mirror the runner Connect flow at `src/app/api/deliver/driver/connect/{start,refresh,dashboard}`. Don't invent."

❌ **No:** "Build Stripe Connect onboarding for vendors." (Doesn't tell future-Claude or Nick the existing pattern, invites re-invention.)

### 2. Document cross-project shape, not just PAL specifics

When a feature is a template candidate, the doc should distinguish:
- **Project-specific bits:** route paths, table names, copy strings, brand styling
- **Pattern bits:** the lookup chain, the auth model, the failure modes, the rotation flow

Example from `feedback_wheelhouse_cross_project_pattern.md`:
> "Per-agent Sensitive bearer tokens in Vercel" ← pattern bit
> "WHEELHOUSE_TOKEN_WINSTON_CLAUDE → resolves to participant `winston-claude`" ← project-specific

Both belong in the doc. The pattern-bit list is what carries to CrossRef / Sage Em / future tenants.

### 3. File a `feedback_<pattern>_cross_project.md` when a template solidifies

Not every shipped flow is a template. But when a flow has been built ≥2× (PAL runner Connect → PAL vendor Connect, for example), the second build is the cue: **file the pattern doc**. Title convention: `feedback_<thing>_cross_project_pattern.md`. Index in `MEMORY.md`. Add to `sync-memory.sh` whitelist for the PAL mirror so Nick + future projects can read it.

### 4. Build briefs (`Port A Local/Features/<Thing> — Build Brief.md`) reference the pattern docs

When a build brief is a template-replication (e.g., the Stripe Connect onboarding brief filed 2026-04-27 PM mirrors the runner flow), the brief opens with the canonical reference and explicitly tells future-Claude "don't invent." This prevents drift between project copies.

### 5. CityDeploy patterns catalog lives in the platform vision doc

`Port A Local/Memory/CityDeploy — Platform Vision.md` is the index. As patterns solidify, add them to the catalog there with one-line descriptions + pointers to the per-pattern feedback file. That doc is the "what does CityDeploy actually consist of" question answered.

---

## Patterns already locked in as CityDeploy templates

| Pattern | Canonical PAL location | Pattern doc | Status |
|---------|------------------------|-------------|--------|
| Wheelhouse | `/wheelhouse` routes + middleware + `wheelhouse_*` tables | `feedback_wheelhouse_cross_project_pattern.md` | LOCKED 2026-04-27 |
| Memory mirror sync | `scripts/sync-memory.sh` whitelist-based | (in-line in script header) | LOCKED 2026-04-26 (Sprint E) |
| Context-handoff "truck" | `Port A Local/Session Notes/handoff-DATE.md` | `feedback_context_handoff.md` | LOCKED 2026-04-27 |
| Startup-drill "arnold" | session-start ritual | `feedback_arnold_startup_drill.md` | LOCKED 2026-04-27 |
| Runner onboarding (Connect Express) | `src/app/api/deliver/driver/connect/*` + signup form | TBD — file when sell-mode vendor Connect ships (it's the second build) | designed, second copy in flight |
| Magic-link approval/reject | `src/app/api/deliver/runner/{approve,reject}/route.ts` + locals offer equivalents | TBD — file when third instance ships | live, two implementations |
| Email cascade pattern (paid → vendor + customer + admin) | `src/lib/{deliverEmails,localsBuyEmails,housekeepingEmails}.ts` | TBD — file once 3+ verticals are stable | live, three implementations |
| HMAC magic-link auth | inline in route handlers | TBD — extract on third use | live, multiple implementations |

---

## When a pattern is NOT a template

Sometimes a flow is genuinely PAL-specific and shouldn't be CityDeploy-replicated:
- Brand/voice work (Collie's brand system) — every CityDeploy tenant has their own brand
- Local content (Heritage research, Dispatches, businesses directory) — town-specific, not template-able
- Tournament-coverage stack — fishing-tournament-specific, but the ARCHITECTURE (data + components) is template-able for any town with cyclical events
- Single-vendor relationships (the maintenance vendor) — every tenant has different local vendors

The rule: **if the SHAPE generalizes, document the pattern. If only the CONTENT generalizes, just ship it on PAL.**

---

## Why this matters

Without explicit pattern-thinking, every CityDeploy tenant deploy is a custom job — re-implementing what PAL already solved, drift between projects, no compounding. With this rule, every PAL build investment compounds across all future tenants. Same engineer time, exponential platform value.

It's also how Nick's platform-extraction work stays cheap: he reads the pattern docs in the PAL memory mirror, doesn't have to reverse-engineer the PAL codebase.

---

## Pickup-here

When this file gets revisited:
- [ ] Audit existing PAL features and identify pattern candidates not yet documented
- [ ] Backfill pattern docs for the templates already locked in (runner onboarding, magic-link, email cascade, HMAC)
- [ ] Once 3+ pattern docs exist, add a CityDeploy patterns catalog table to `Port A Local/Memory/CityDeploy — Platform Vision.md` so it's a single source of truth
- [ ] Decide: should every build brief have a "CityDeploy template-status" header field? (yes/no/maybe — depends on if it ships to >1 project)
