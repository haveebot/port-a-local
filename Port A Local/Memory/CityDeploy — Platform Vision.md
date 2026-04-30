# CityDeploy — The Platform Behind PAL
_Status: Locked-in working name | Heye Lab flagship | 2026-04-26_

---

## The frame

**PAL is the proof of concept. CityDeploy is the engine.**

Port A Local is Heye Lab's first deployed instance of a templatable
"local marketplace + media + comms" stack. CityDeploy is the SaaS-ified
engine that gets sold to (or deployed per-town for) other small/mid
American towns who want what PAL has.

Tagline pattern:
> Powered by Heye Lab · Built on CityDeploy

---

## What's in the engine

Every PAL surface is a candidate template:

**Marketplace verticals:**
- Delivery (food + convenience)
- Rentals (carts, kayaks, boards)
- Services (maintenance, charters, photography)
- Beach gear / setups
- Locals (rent + hire dual-mode catch-all)

**Comms infrastructure:**
- Cookie-session auth (runner hub pattern)
- Magic-link email approvals (admin)
- SMS dispatch via Twilio (A2P-aware)
- Email via Resend (anti-spam tuned)
- Wheelhouse internal ops dashboard

**Payment infrastructure:**
- Stripe Connect Express for vendor/runner payouts
- Custom payouts admin tool (one-off transfers)
- Customer-side fee model (10% on top, locals keep 100%)
- Idempotent transfer ledger

**Content infrastructure:**
- Heritage-style longform editorial
- Dispatch-style current-events journalism
- Events hub with per-event detail pages
- Live music / weekly refresh workflows
- Photo-driven intake (email → feature)

**Discovery infrastructure:**
- Gully-style site-wide fuzzy search (Fuse.js)
- Anonymous tag suggestions
- Trip planner / save-for-later
- Map view with geocoded businesses

**Brand infrastructure:**
- Per-deployment lighthouse-style mark (or city's own equivalent)
- Branded OG cards via shared helper
- Branded transactional emails via shared helper
- PWA + favicon + manifest

---

## Why this is the right play

**Small/mid American towns have the same problems:**
- No good local food delivery (DoorDash skips the small markets)
- Marketplaces fragmented across Facebook groups + Craigslist
- Tourism Bureau-style "destination marketing" doesn't reach locals
- No journalism / editorial layer covering local current events
- Vendor payouts are still PayPal/Venmo informal at best

**PAL solves all of them locally.** CityDeploy lets us template that
into a per-town deployment that doesn't require Winston to be on the
ground in every town. Each town gets:
- Their own subdomain (or domain)
- Their own brand mark + voice
- Their own vendor + restaurant + runner roster
- Same engine underneath
- Heye Lab takes a cut of platform fees + an annual license

**Comparable plays:**
- Substack templated newsletters → empire of writers
- Shopify templated storefronts → empire of merchants
- CityDeploy templated marketplaces → empire of small-town economies

## The anti-gatekeeping wedge (locked-in 2026-04-26)

**"PAL doesn't gatekeep"** is CityDeploy's real positioning lever vs
incumbent local platforms. Every town we sell to is already drowning
in:
- Yelp filtering reviews based on advertiser status
- Google suppressing listings without verification gates
- Tourism Bureaus curating a sanitized version of the town
- Airbnb / DoorDash hiding listings below their quality thresholds

CityDeploy's flip: **the town's actual texture, unfiltered.** Listers
participate at their level. Customers see what's there and self-sort.
Quality is surfaced (photo-conversion data, response-time stats) but
never enforced as a gate. The platform IS the public utility, not the
arbiter of who deserves to be on it.

This is the line that separates CityDeploy from "another Yelp clone"
— and the line that makes town governments + chambers of commerce sit
forward when we pitch. Memory: `feedback_pal_doesnt_gatekeep.md`.

---

## What's needed for CityDeploy v1

(For Nick's mining work — not a build list, just the audit map)

1. **Theming abstraction.** Lift PAL's hardcoded brand (Lighthouse mark,
   coordinates, voice) into a per-deployment config.
2. **Catalog seeding.** Vendor + restaurant + business directory data
   model needs to be CMS-shaped, not hand-curated TS files.
3. **Domain + DNS automation.** New deployment = new subdomain or
   custom domain; today this is Vercel-manual.
4. **Operator onboarding flow.** A "Winston for [town]" needs to be
   spun up with admin credentials, vendor scaffolding, etc.
5. **Pricing knob abstraction.** PAL's markup % / delivery fee /
   service fee / driver shares all need to be per-deployment config.
6. **Memory + decisions templating.** This file + the others in the
   memory mirror ARE the seed pattern for a CityDeploy operator playbook.

---

## Status

- **Naming:** Locked 2026-04-26.
- **Build:** Pre-extraction. PAL still in active development; patterns
  being identified as we go.
- **Mining:** Nick has GitHub admin access to PAL repo; memory mirror
  in this folder gives him the design-decision context.
- **Footer attribution:** "Powered by Heye Lab" already on PAL footer
  (commit `26795e5`).

---

## Pickup-here

When CityDeploy moves from "name + vision" to "extraction work":
1. Audit PAL hardcoded values vs extractable patterns
2. Decide repo structure (monorepo vs separate Heye Lab platform repo)
3. First test: deploy CityDeploy v0 to a second town as the validation
   instance
4. License + revenue model — Heye Lab takes platform fee % from each
   deployed town
