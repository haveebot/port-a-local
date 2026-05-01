# HeyeDeploy Pattern Capture — 2026-04-30

Patterns shipped or refined today that should propagate to the
HeyeDeploy template library. Each one carries a brief description,
the PAL implementation reference, and the parameters needed to
generalize for other tenants (CrossRef, Sage Em, future).

---

## Pattern 1: Site-wide Emergency Alert System

**What it is:** An always-on operator surface for posting site-wide warning/critical/info banners. Bearer-auth API, cookie-auth UI, instant cache invalidation on create/dismiss, responsive height handling, JS-measured nav offset.

**PAL reference:**
- `src/data/alerts-store.ts` — Postgres table + CRUD
- `src/components/EmergencyBanner.tsx` — fixed top-0 z-[55] server component
- `src/components/PalBannerHeightSync.tsx` — client-side height measurement
- `src/app/api/wheelhouse/alerts/route.ts` — POST/DELETE with revalidatePath + bearer fallback
- `src/app/wheelhouse/alerts/page.tsx` — admin UI
- `src/app/layout.tsx` — body class + banner mount
- `src/app/globals.css` — responsive `--pal-banner-h` CSS var

**Generalization parameters:**
- Severity color mapping (project-specific palette)
- Site-wide layout root (root layout for the tenant app)
- Auth pattern (cookie + bearer header — already standardized)

**Why it matters:** Every Heye Lab tenant will eventually need an "alert me about an incident, instantly visible site-wide" surface. Drought events, system outages, ferry closures, deployment incidents on CrossRef, agency-pause events on Sage Em.

---

## Pattern 2: Photo-to-Feature Workflow

**What it is:** Operator (Collie, vendor, partner) emails a screenshot or photo to a project mailbox → script pulls it → operator-facing site updates → confirmation reply closes the loop.

**PAL reference:** `src/data/live-music.ts` (today's update from Collie's calendar). Validated previously and again today.

**Existing memory:** `feedback_pal_photo_to_feature.md`

**Generalization parameters:**
- Project mailbox (haveebot variant per tenant)
- Target data file (different per surface)
- Reply template ("source attribution rolled to your name on the data file. Photo → live site, that's the loop.")

**Why it matters:** Every tenant has weekly/monthly content updates from non-technical collaborators. Email-as-input + script-pull is dramatically simpler than building a CMS for every collaborator type.

---

## Pattern 3: Wheelhouse Marketing Hub Aggregation

**What it is:** A consolidated `/wheelhouse/marketing` operator surface that aggregates the marketing-lane sub-systems (glossary, social queue, ask-X analytics, upcoming triggers) without replacing the deep-dive pages.

**PAL reference:**
- `src/app/wheelhouse/marketing/page.tsx` — the hub
- `src/lib/eventMilestones.ts` — pure helper for upcoming-triggers preview
- Tools dropdown collapse pattern in `src/components/wheelhouse/WheelhouseHeader.tsx`

**Generalization parameters:**
- The glossary equivalent (any project's marketing-content reference)
- The social queue equivalent (any project's outbound posting system)
- The ask-X analytics equivalent (any project's content-priority signal)
- The trigger source data (events, releases, content publishes)

**Why it matters:** Operators need a single "what's happening in marketing right now" surface — pending action, upcoming, recent metrics. Each tenant has its own underlying systems but the AGGREGATION pattern stays identical.

---

## Pattern 4: Trigger-Source-to-Queue Auto-Drafting

**What it is:** When an entity's status changes (glossary entry → "active", event published, heritage piece published), a server-side hook auto-drafts a social post into a review queue. Operator reviews + sends; doesn't have to start from scratch.

**PAL reference:**
- `src/app/api/wheelhouse/glossary/[id]/route.ts` — status-transition detection in PATCH
- `src/lib/socialPostTemplates.ts` — caption templates per trigger type
- `src/data/social-post-store.ts` — `queuePost()` with idempotency on `(trigger_type, trigger_ref, channel)`

**Generalization parameters:**
- The trigger entity (glossary entry, event, content piece)
- The transition that fires the trigger (status flip, publish, milestone)
- Caption template appropriate to the entity type

**Why it matters:** Operator effort drops from "draft a post" → "review a draft." Brand voice locked in templates, idempotency prevents duplicate-fires, caught failures don't block the upstream entity update.

---

## Pattern 5: Attention-Getting OG with Stat / Pull-Quote Variants

**What it is:** Custom OG image generator that goes beyond the standard branded card. Big focal stat (8.7%) or pull quote ("It's the wrong place.") anchors the share, designed to stop scrolls on FB/IG/X. Falls back to standard branded OG when no `ogHighlight` is set.

**PAL reference:**
- `src/app/dispatch/[slug]/opengraph-image.tsx` — custom highlight + brandedOG fallback
- `src/data/dispatches.ts` — `ogHighlight: { type: "stat" | "quote", ... }` field
- `src/lib/brandedOG.tsx` — shared loadLighthouse + ogSize/ogContentType

**Generalization parameters:**
- The brand mark for bottom lockup
- Coordinates / footer detail
- Stat or quote highlight content (per-record)

**Why it matters:** Hero-piece content (drought story, major announcement, big number) deserves better than the same generic-template card every other route uses. This pattern makes "make this one POP" a one-line data field.

---

## Pattern 6: Anti-Pattern — Root-Layout Canonical

**What NOT to do:** Set `alternates.canonical` on the root layout's metadata. It cascades to every page on the site, causing FB OG to pull homepage card on every share + Google to collapse all URLs into the home rank.

**PAL reference (the fix):** `src/app/layout.tsx` — comment block explaining why canonical was removed.

**Diagnostic tool:** FB Sharing Debugger shows "Redirect Path" with `rel="canonical" → /` if this is happening.

**Generalization:** every Next.js tenant should audit their root layout for `alternates.canonical`. If present and pointing to root, kill it. Per-page metadata can set canonical when explicit canonicalization is needed; otherwise the request URL is the right default.

**Why it matters:** This bug was invisible until we tested an FB share. Could have suppressed PAL's SEO for months. The fix is one line; the audit costs 30 seconds. Worth running on every Heye Lab tenant.

---

## Pattern 7: Bearer-Auth Fallback on Operator Routes

**What it is:** Wheelhouse-style operator API routes accept either a cookie session (UI) OR a bearer token (cross-project agent automation). Same handler, two auth paths.

**PAL reference:**
- `src/app/api/wheelhouse/alerts/route.ts` — `getWheelhouseUser(req)` checks cookie first, falls back to `x-wheelhouse-agent` header
- Same pattern in `/api/wheelhouse/social/[id]/route.ts`, `/api/wheelhouse/glossary/[id]/route.ts`

**Existing memory:** `feedback_wheelhouse_cross_project_pattern.md`

**Generalization parameters:**
- Cookie name (per tenant)
- Bearer-token env var name (per tenant agent identity)

**Why it matters:** Lets Havee (or any cross-project agent) drive operator surfaces from automation without being a logged-in human. Critical for cron-triggered alerts, Slack/SMS-driven post queueing, etc.

---

## Pattern 8: Phase 0 Token Bootstrap (Meta Graph API)

**What it is:** Documented + executed flow for bringing a new app from "no Meta API access" to "permanent Page Access Token in production env." Includes app creation, redirect-URI whitelisting, token extension, and self-check endpoint.

**PAL reference:**
- `src/lib/metaGraph.ts` — wrapper with stub-mode fallback when no token
- `src/app/api/wheelhouse/social/test/route.ts` — self-check endpoint returning `{ configured, ping }`
- Today's session log (in handoff doc) for the full step-by-step path including the redirect-URI domain whitelist gotcha and the User → Long-Lived → Page Token exchange

**Generalization parameters:**
- App name + use case
- Page ID
- Permission scopes per use case
- Env var names: `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, `META_INSTAGRAM_ACCOUNT_ID`

**Why it matters:** Every Heye Lab tenant that posts to FB/IG will need this exact sequence. Documenting it once means the next tenant gets through Phase 0 in 15 minutes instead of an hour of UI hunting.

---

## Action items for HeyeDeploy library

When the HeyeDeploy repo gets standalone status:
1. Create `templates/site-wide-alerts/` from Pattern 1
2. Create `templates/photo-to-feature-mailbox/` from Pattern 2
3. Create `templates/wheelhouse-marketing-hub/` from Pattern 3
4. Create `templates/trigger-source-to-queue/` from Pattern 4
5. Create `templates/og-with-highlights/` from Pattern 5
6. Create `templates/wheelhouse-bearer-auth/` from Pattern 7
7. Create `templates/meta-phase0-bootstrap/` from Pattern 8
8. Add `audits/canonical-cascade.md` from Pattern 6 (anti-pattern doc)

Each template = working Next.js code + README explaining params + migration guide for existing tenants.

---

*HeyeDeploy is a meta-pattern at this scope; each project ships features that crystallize as templates over time. Today added 7 new patterns + 1 anti-pattern to the library.*
