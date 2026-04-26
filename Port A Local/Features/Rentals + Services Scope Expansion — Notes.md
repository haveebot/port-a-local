# Rentals + Services Scope Expansion — Design Notes
_Status: Deferred design | Logged 2026-04-26 | Source: Winston brief_

---

## The Problem

Today:
- `/rent` is **golf-cart only** (single category, single product type)
- `/services` is essentially the **maintenance** vendor (one slot, one trade)
- `/locals` is the broader marketplace concept (rent + hire, multi-category)

Winston's note (2026-04-26): "rental and services portal — when customer
clicks rental more than carts can be listed... potential rentals are
listed — unlike/kind of like our directory there will be some that
cross both — a kayak rental could be a service and a rental"

In other words:
1. **Customers expect multiple rental types** when they click "Rentals" — kayaks, paddleboards, beach gear, jet skis, etc.
2. **Customers expect multiple services types** when they click "Services" — beyond maintenance: charters, tours, lessons, lawn care, etc.
3. **Some offerings cross both axes** — a kayak can be rented (you go pick it up) OR a service (someone delivers + sets up + retrieves). The directory pattern (single listing with tags) is closer to right than separate /rent and /services silos.

---

## Design Tension

`/rent` is currently optimized as a **booking funnel** (date picker, $10/day reservation, vendor-blast, claim-first-wins). That's the right pattern for golf carts because golf carts are a known commodity.

But for kayaks, paddleboards, beach gear — the booking model breaks down:
- Hourly vs daily pricing
- Self-pickup vs delivery
- Local-owned (one kayak, one weekend) vs commercial fleet
- Skill-required (jet ski) vs casual

Same for services:
- Maintenance is dispatch/urgency-tiered
- A fishing charter is reservation/calendar
- A surf lesson is booking/scheduling
- Lawn care is recurring/subscription

Each has different UX. **Trying to force them into one /rent or /services funnel will compromise UX for all of them.**

---

## Three Possible Architectures

### Option A — Expand `/rent` and `/services` to multi-category portals
Pros:
- Matches customer mental model ("I want to rent something")
- Single URL per intent
Cons:
- Each category has different booking semantics (date picker vs hourly slot vs request-quote)
- Card design has to accommodate all
- High risk of compromised UX

### Option B — Lean into `/locals` as the rent+hire mega-marketplace, deprecate /rent's single-product framing
Pros:
- Already designed for multi-category, dual-mode (rent | hire)
- Provider-agnostic (matches "kayak could be rental OR service" insight)
- Existing demand-aggregator pattern (request → email → connect)
Cons:
- Loses the booking-engine sophistication of `/rent` (Stripe, calendar, vendor blast)
- "Locals" branding less recognizable than "Rent"
- Breaks the cart-portal direct path

### Option C — Hybrid: /rent stays cart-specific (good UX for known commodity); /locals handles the long tail
Pros:
- Keep what works (cart booking funnel)
- Add new categories where the locals pattern works (gear, services)
- Minimal disruption to existing flows
Cons:
- Two URLs for "rent"-shaped intent (could confuse)
- Have to think hard about which goes where

**Winston's intuition leans toward Option C-ish** — keep cart booking strong, but expose more rentals + services as the demand justifies. Each new category gets a thoughtful UX matched to its shape (date picker vs hourly vs request-quote).

---

## Concrete Categories We've Identified

### Rentals (could be /rent or /locals/rent)
- 🛻 Golf carts (LIVE on /rent — booking model)
- 🚣 Kayaks
- 🏄 Paddleboards
- 🏖️ Beach gear (umbrellas, chairs, cabanas) — note: /beach already covers cabanas + chairs
- 🎣 Fishing rods
- 🚲 Bikes
- 🛥️ Boats / pontoons (probably needs its own funnel — high $$ + insurance)

### Services (could be /services or /locals/hire)
- 🔧 Maintenance (LIVE on /maintenance — dispatch model)
- 🎣 Fishing charters
- 🏄 Surf lessons
- 🚤 Jet ski tours
- 🌅 Photography (sessions, weddings)
- 🎨 Art lessons
- 🏠 Property management
- 🌱 Lawn care
- 🐕 Pet services (sitting, walking)

### Cross-axis (rental OR service)
- Kayak → rent it solo, or pay for guided trip (service)
- Paddleboard → same
- Bike → same
- Photography → rent gear, or hire photographer

This is where the **directory-listing pattern** wins: one listing per provider, with tags `rent` + `service` + category (kayak, surf, etc.). Customers filter; we don't predetermine the funnel.

---

## Suggested Sequencing (when this thread picks back up)

1. **Audit existing /locals** — see what data layer is in place for rent+hire dual mode. Could be the natural home.
2. **Pick ONE new category to add as a v1** — e.g. kayak rentals via /locals/rent — and ship it with the existing demand-aggregator pattern (request quote → email → connect).
3. **Build a "browse rentals" view** that pulls from /locals AND /rent (the cart engine), so customers see all rental options regardless of which URL they hit.
4. **Same for services** — /maintenance + /locals/hire merge into a "browse services" view.
5. **Keep direct booking funnels for known-commodities** (carts, beach setups) — they're proven.
6. **Long term:** consider whether "rent" and "services" should be unified categories on the directory itself (with mode tags), letting Gully + the existing directory carry the discovery layer.

---

## What Tonight's Punch List Did NOT Address

This document is the deferred-design note. Winston flagged scope expansion for awareness, knowing we don't have multi-offerings yet. The night's punch-list work focused on bug fixes + content edits + Gully indexing — the architecture decision lives here for later.

---

## Pickup-here Checklist

When someone (Winston / Nick / future-Claude) returns to this:
- [ ] Read `/locals` data layer + UI to confirm rent+hire dual-mode capability
- [ ] Talk to Winston about Option A/B/C — which direction does he lean?
- [ ] Pick one new rental category to add as v1 (kayak suggested)
- [ ] Decide whether `/rent` becomes "carts + more" or stays cart-only with /locals carrying the long tail
- [ ] Sketch the cross-axis listing model (one listing, multi-mode)
