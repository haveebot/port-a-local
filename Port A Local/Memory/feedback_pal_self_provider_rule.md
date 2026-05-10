---
name: PAL stays the listed provider — never lists operators as cart vendors / beach providers on customer surfaces
description: PAL handles cart and beach rentals itself on customer-facing surfaces. Even when a deal with another operator is in place, PAL still rents directly — that's part of PAL's value and the multi-angle marketing footprint. Tenants get their own domains, not PAL listings.
type: feedback
originSessionId: 41980cdf-3bc9-4b3f-8d67-4d3068b084c9
---
**HARD CROSS-PROJECT RULE.** Cross-tenant — applies to PAL today, every future PAL-style local-guide/marketplace tenant.

PAL is its own provider on customer-facing rental surfaces. Cart rentals, beach rentals, and any future PAL-direct service stays PAL-branded to customers. PAL never lists another operator as the rental provider on a PAL customer surface, **even when a revenue-share deal is in place** with that operator.

## Why

1. **PAL's value is the integrated experience.** When a customer books on PAL, they're booking with PAL — same brand, same trust, same recovery story (today's Cabana customer recovery is the canonical proof). Outsourcing that surface to a vendor breaks the trust unit.
2. **Multi-angle marketing footprint.** PAL benefits from running rentals directly (revenue, customer data, recovery practice) AND benefits from affiliate listings on adjacent categories (Bron's as a bar / venue / music slot on `/drink`, `/live-music`, `/eat`). Both channels can run simultaneously without conflict — they're different surface categories.
3. **Tenant deals get their OWN surfaces.** When HeyeLab takes ownership stake in an operator (Bron's 2026-05-09), the deal lives on the tenant's own domain (`bronsbeach.com`) under HeyeLab operations — never as a "Bron's listing on PAL `/rent`."

## What's allowed

- **Backend operator infrastructure** (cart-vendor blast list, first-look priority, vendor SMS routing) — operator-side mechanics, never visible to PAL customers
- **Affiliate listings in non-conflicting categories** — Bron's as a bar on `/drink/drink-brons-backyard`, as a music venue on `/live-music`, as a food spot on `/eat`. These don't compete with PAL's rental services.
- **Wheelhouse operator surfaces** showing tenant-specific data (e.g. `/wheelhouse/brons` dashboard) — operator-only, wheelhouse-gated, not customer-facing
- **Tenant-domain surfaces** (e.g. `bronsbeach.com`) — separate brand surface owned by HeyeLab/the tenant, not under PAL's brand

## What's NOT allowed

- ❌ Listing "Bron's Beach Carts" as a cart-rental provider on PAL `/rent` customer-facing UI
- ❌ Routing PAL `/rent` bookings to "rented by Bron's" or showing customer "your cart will be provided by [vendor]"
- ❌ Renaming PAL's beach service as "Powered by [tenant]" on customer-facing surfaces
- ❌ Showing "Featured cart partner: Bron's" or similar promotional callouts on rental surfaces
- ❌ Any UI element that confuses the customer about who they're renting from when they book on PAL

## How to apply during builds

When designing or reviewing any new customer-facing rental surface on PAL:
- **Customer should see PAL's brand** as the rental provider
- **Customer never sees the operator name** on the booking flow / confirmation / receipt for rental services
- **Backend can route to whomever** — vendor blast, first-look priority, affiliate fulfillment — that's operator-side, the customer never knows
- For tenant deals (revenue-share with named operators), spin up a **separate tenant surface on the tenant's own domain** rather than embedding the tenant brand in PAL

## Pairs with

- `feedback_pal_no_names_on_website.md` — no individual operator names on PAL customer surfaces (Winston / Nick / Collie). Same family of "PAL voice = PAL brand" rules; this rule extends to other-operator-brand-names on rental surfaces specifically.
- `feedback_heyedeploy_pattern_thinking.md` — three-tier hierarchy (HeyeDeploy → vertical → tenant). Tenant-domain surfaces (`bronsbeach.com`) are tenant-tier; PAL is its own tenant under HeyeDeploy. Don't blur the tiers.

**Filed 2026-05-09 PM-2 after the Bron's deal recalibration** clarified that even with revenue-share deals in place, PAL stays a self-providing local guide on its rental surfaces. Tenant deals live on tenant domains.
