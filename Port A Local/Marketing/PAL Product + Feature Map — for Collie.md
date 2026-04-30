# PAL Product + Feature Map — for Collie

_Internal · for Collie · not client-facing · as of 2026-04-28_

---

## How to read this

This is a walk-through of everything that's live on PAL right now — not a marketing plan, not in any specific order. The point is: **you can see what's in the kit before deciding what to highlight, when, and how.**

I've grouped surfaces by what people actually DO with them (browse, transact, read, plan, react), not by tech. Skip what doesn't move you, linger on what does. Each block tells you:

- **What it is** in one line
- **Where it lives** on PAL
- **What's notable** — the thing you might want to lead with if you were posting about it

If something here is the FIRST you're hearing of it, that's normal — Winston shipped fast. Use this as the inventory; cherry-pick from it when you want to.

---

## 🧭 The browse layer — what people land on

### The Gully
**The unified search + discovery surface.** Type "kayak," "delivery," "boil water" — Gully resolves to directory listings, portals, dispatch pieces, events, anything indexed.

- Lives at: `/gully` and powers the homepage search
- Notable: indexes EVERYTHING — businesses, portals, dispatches, events, even delivery vendors. One source of truth for "where on PAL is..."

### The directory
**Six categories of vetted local businesses** — Eat, Drink, Stay, Do, Fish, Shop. 140+ listings, every one vetted by locals. No paid placements, no corporate sponsors.

- Lives at: `/eat`, `/drink`, `/stay`, `/do`, `/fish`, `/shop` + per-business detail pages
- Notable: the no-pay-to-play ethos is the differentiator. Every listing is there because a local stood behind it.

### Featured spots
**Curated stand-outs** that get larger placement on the homepage and category pages.

- Lives at: throughout `/`, `/eat`, etc.
- Notable: rotates organically based on what's worth surfacing — not a paid slot system.

### Map view
**Every business on the island, plotted.** Filter by category, find what's near you.

- Lives at: `/map`
- Notable: works on mobile. Doesn't try to be Google Maps; it's PAL's curated set on a coastal layout.

### My Trip
**Save spots as you browse, view your saved list later.** No account required — uses local storage.

- Lives at: `/my-trip`
- Notable: low-friction. No signup wall. Visitors can build a personal trip-plan in 5 minutes.

### Live conditions tile
**Tide, surf, wind, water temp — at-a-glance for visitors.**

- Lives at: homepage `IslandConditions` block
- Notable: real data, not stock. Updates dynamically.

---

## 🛒 The transact layer — what people actually pay for

### PAL Delivery
**Real-time food + convenience delivery.** Customer orders → Stripe pays → on-duty PAL runners get pinged → first to claim wins → real-time tracking on the receipt page.

- Lives at: `/deliver`
- Live restaurants: Crazy Cajun · Dairy Queen Port A
- Live convenience store: Lowe's Market (12 essentials, 20% loss-leader markup)
- Notable:
  - **Uber-grade tracking** — customers see a 4-stage progress bar, runner vehicle ("Driver #N · 2018 Ford Ranger"), live timestamps
  - **Push notification to runners** the moment a paid order lands — first to claim wins
  - **First real-money order shipped** 2026-04-25 ($28.87 from DQ) — this works
  - **$5 first-delivery bonus + rewards ladder** — Tier 1 live, higher tiers parked
  - **Anonymous leaderboard** at `/deliver/runners` — "Driver #N" framing, $5 badge for completed first-delivery
  - **Convenience store framing** ("Beach-day essentials") differentiates from restaurant orders

### PAL Carts (golf cart rentals)
**Reservation-fee model** ($10/day) — customer reserves through PAL, gets matched with a local vendor. Customer keeps a guaranteed $20 discount off the vendor's standard rate.

- Lives at: `/rent`
- Notable:
  - **Vendor blast pattern** — every paid reservation goes to ALL active cart vendors simultaneously; first to claim wins
  - **No commission on the rental itself** — vendors keep 100% of their rate
  - **Pickup or delivery, customer's call** — handoff toggle on the booking form
  - **6 vendors with confirmed emails** + several more in outreach
  - **Vendor signup at `/rent/vendor`** with locked Winston-approved pitch ("We send the bookings. Claim what you want.")

### PAL Locals
**Three modes for local people: Rent · Hire · Sell.** Approved offers go live as listings on `/locals`.

- Lives at: `/locals` (browse) · `/locals/offer` (submit)
- The three modes:
  - **Rent** — surfboards, kayaks, paddleboards, beach gear (vendor's call on price + duration)
  - **Hire** — fishing guides, photographers, beach-day planners, anyone with a skill
  - **Sell** — local artisans selling stuff: prints, shirts, baked goods, books-zines (5 categories live)
- Notable:
  - **10% PAL platform fee, ALWAYS paid by the customer** — vendor never sees a deduction
  - **Stripe Connect Express** for sell-mode — vendor onboards once, gets direct deposit on every sale
  - **Vendor portal at `/locals/vendor/[offerId]`** with magic-link auth — sellers see their listing + payouts setup + sale alerts
  - **"Doesn't gatekeep"** north star — approval = listing live; photos are encouraged, not required

### PAL Housekeeping
**$100/hour, 1-hour minimum, ~1 hour per 1000 sqft.** Stripe Checkout up front, manual dispatch in v1.

- Lives at: `/housekeeping`
- Notable: brand placeholder is **"Local Girls Cleaning"** (PAL-owned shell entity, flagged for your review). Outward-facing copy is scrubbed of "a PAL service" framing per Winston's rule. v2 will fan out to a marketplace (cart-rental pattern).

### Maintenance requests
**Submit a request, get matched with the maintenance vendor.** Free to submit.

- Lives at: `/maintenance`
- Notable: simpler flow than housekeeping — request lands in admin@, Winston coordinates with the maintenance vendor (whose name we don't publish).

---

## 📰 The editorial layer — what people read

### Heritage
**24+ deep-research pieces on Port A's history.** Tarpon Inn, Cattle drives, Red Snapper Fleet, the Tarpon Rodeo, lighthouse lineage — every piece sourced + cited.

- Lives at: `/history` + `/history/[slug]`
- Latest: Charles Bujan piece (Heritage #25) — mayor through Harvey
- Notable:
  - **No interviews** — every piece is built from public records, court filings, on-record media, FOIA. By design.
  - Source citations on every piece.
  - Heritage is the long tail of PAL's editorial — the "we know this place" credential.

### Dispatch
**Investigative + community-pulse pieces.** What's happening, what's changing, what locals are talking about.

- Lives at: `/dispatch`
- In flight: P&Z Capture piece (1,391+ line fact base, two TPIAs filed), property tax piece
- Notable:
  - **Tip submission** at `/dispatch` — the submission pipeline is hybrid: silent rejection on most, real reply when it ships
  - Each piece comes from a real local concern, not from pattern-matching what just shipped

### Live Music
**Weekly refresh of who's playing where.** PA-only — Corpus / Portland / Fulton filtered out.

- Lives at: `/live-music`
- Notable:
  - **Workflow**: South Jetty's "Live Music Tonight" photo gets emailed to haveebot weekly; Claude OCRs, transcribes, ships
  - "Tonight" hero + rest-of-week grid + venue cross-links to the directory
  - First drop (2026-04-23): 25 acts across 7 venues

### Events
**Per-event hub pages with countdowns + structured-data.** Spring Kite Festival, Deep Sea Roundup, TWAT, Tournament Season, etc.

- Lives at: `/events` + `/events/[slug]`
- Notable:
  - **Live-updating countdown** that flips to "Happening now" mid-event, "Wrapped" after
  - Event Schema (schema.org/Event) injected for Google rich results
  - Per-event branded OG cards
  - **EventOrganizerClaim** CTA on every event page — collapsed → form → admin@. Operationalizes "do it anyway, force them to come to us"
  - **Featured banner on homepage** auto-picks the soonest featured event, returns null off-season

### Tournament Season hub
**The local handle for PA's summer fishing-tournament cluster.** May–November, 20+ tournaments, 4 marquee weekends July–August.

- Lives at: `/events/tournament-season`
- Anchor pieces live:
  - **Deep Sea Roundup 2026** (90th annual, July 9–12 — Texas's oldest fishing tournament, anchored on Barney Farley + 1932)
  - **TWAT 2026** (Texas Women Anglers Tournament, late August — women-only since 1984, charity-engine for The Purple Door)
- Stubs for: Billfish Pachanga · Texas Legends Billfish
- Notable: Each anchor page has the full tournament-coverage stack — leaderboards, divisions panel, captain spotlights, charity callout, past champions, historical photos, milestones panel.

### Fishing Report + Live Conditions
**Surf, tide, wind, water temp + what's biting.**

- Lives at: `/fishing-report` + the homepage IslandConditions tile
- Notable: real-time data + cold-state-safe (works year-round even when nothing's noteworthy).

### Photos archive
**Historical images of Port A** — referenced from `archives.ts` (single source of truth).

- Lives at: `/photos` and `/archives`
- Notable: same archives drive the Heritage pieces' inline imagery — no duplication, single source.

---

## 🚨 The civic layer — what keeps locals + visitors safe

### Emergency hub
**One page for everything urgent on the island.** Active hurricanes, evacuation orders, road closures, water advisories — and the running updates as they unfold.

- Lives at: `/emergency` + `/emergency/[slug]` per event
- Notable:
  - **PAL is the single page locals + visitors check first** during an unfolding event — consolidates city, NWS, ferry, TxDOT into one surface
  - **Push notifications** to subscribers the moment something lands (or updates)
  - Cold-state shows "nothing active right now" — the calm baseline matters as much as the active one

### Site banner alerts
**Persistent top-strip across every PAL page.** Three tiers:
- 🚨 **Critical** — evacuations, life-safety
- ⚠️ **Advisory** — road closures, water boil, ferry shutdowns
- 📍 **Community** — fireworks tonight, parade routes, school graduations, ferry route changes

- Triggers from `/wheelhouse/alerts`
- Notable: **dual-use**. Same banner system handles "Mandatory evacuation" AND "PAHS Graduation 5/14 6PM" — every tier pushes to subscribers (info-tier shows the ✨ "good stuff" tone, not emergency dread)

### Council Watch
**Auto-scraped Port A City Council meeting digests + YouTube embeds.** Weekly cron pulls from CivicWeb.

- Lives at: `/council-watch` + `/council-watch/[slug]`
- Notable: civic-transparency layer that didn't exist before PAL. Most residents don't watch council; PAL turns it into a digestible summary.

---

## 🤝 The vendor + partner layer

### Cart vendor pipeline
- Public signup at `/rent/vendor`
- Existing vendor email blast on every booking
- Per-vendor push subscribe at `/rent/vendor/[slug]/notify`
- Free to apply, no subscription, no commission. PAL collects a $10/day reservation fee from the customer.

### Runner program (delivery)
- Public signup at `/deliver/runner`
- 18+ + license + insurance attestations at signup
- Magic-link admin approval flow
- Stripe Connect Express auto-onboarding
- Anonymous leaderboard at `/deliver/runners`
- Real-time push for new orders
- $5 welcome bonus on first delivery

### Locals offers
- Public submission at `/locals/offer`
- Three modes (rent / hire / sell)
- Photo attestation (rent listings) — encouraged, not gated
- Approval = live (no extra steps)
- Sell-mode vendors get a Stripe Connect portal at `/locals/vendor/[offerId]`

### Restaurant partnerships
- v1: 2 restaurants live (Crazy Cajun, Dairy Queen) + 1 convenience store (Lowe's)
- Restaurant push subscribe at `/deliver/restaurant/[slug]/notify`
- New restaurants: Winston onboards manually for now (signup form was killed when "restaurants-as-runners" was deemed off-ethos)

### Event organizer claim
- On every event hub page — "I run this, want to add detail / claim it" → goes to admin@
- Operationalizes the "force them to come to us" principle

---

## 📲 The member-experience layer

### Push notifications — the unified system
**One subscribe button, every alert.** Live for:
- 🔔 **Wheelhouse participants** (you, Winston, Nick) — instant alert when a thread flips to your action
- 📍 **Public alert subscribers** — fireworks, evacuations, parade routes, hurricane warnings, ferry changes
- 🚗 **Cart vendors** — instant alert on new bookings
- 🎨 **Locals sellers** — instant alert on closed sales
- 🍽️ **Restaurants** — instant alert on paid delivery orders
- 🛵 **Runners** — instant alert on new available orders

- Lives across the site (Footer subscribe + per-role pages + Wheelhouse header)
- Notable:
  - **One tap to enable, one tap to disable.** Reversible.
  - **iOS-aware** — explains "Add to Home Screen" requirement when needed
  - **Same opt-in pool covers every alert tier** — community AND emergency, in one click

### PWA install ("Add to Home Screen")
**PAL installs as an app on iOS and Android.** Lighthouse icon on the home screen, runs full-screen, push-capable.

- Lives across the site (banner suggestion or Share → Add to Home Screen)
- Notable: this is the unlock for push on iPhone — Apple gates web push behind PWA install. Worth promoting to people who want emergency alerts.

### Brand kit
**Internal brand reference + downloadable assets** — palette, lighthouse SVGs, directory icons, taglines, voice guide, positioning pillars.

- Lives at: `/brand` (noindex)
- Notable: the source of truth for brand consistency. If you're sending an asset to a partner, this is where they should grab it.

---

## 🎛️ The Wheelhouse — internal ops board

**Cookie-gated dashboard for PAL staff** (you, Winston, Nick). The single place we run the operation from.

- Lives at: `/wheelhouse`
- What it does:
  - **Threads + messages** with state machine (open / awaiting:X / blocked / done)
  - **24h activity ticker** — every order, sale, signup, alert in one feed
  - **Public traffic stats** — Vercel Analytics piped in (visitors, top pages)
  - **Alerts admin** at `/wheelhouse/alerts` — fires the site-wide banner + push
  - **Emergency events admin** at `/wheelhouse/emergency` — multi-update timelines + push
  - **Custom payouts admin** at `/wheelhouse/payouts` — manual Stripe transfers to runners
  - **Locals re-fire admin** at `/wheelhouse/locals-resend` — replay vendor sale emails
  - **PAL Pulse** — daily 8am digest auto-posts to the Pulse thread
- Notable:
  - **Mobile-friendly drawer nav** — full Wheelhouse functionality from a phone
  - **Push pill in the header** — your personal alert toggle, always visible
  - "Back to PAL site" link from anywhere in Wheelhouse

---

## 🛠️ What's quiet but powering everything

These don't need promotion individually but inform "PAL is more than a directory":

- **Stripe Connect Express** — direct deposit infrastructure for every revenue surface (delivery, locals sell, future verticals)
- **Email cascades** — paid-event triggers fire vendor + customer + admin emails in one shot, idempotent (refresh-safe)
- **Magic-link approvals** — HMAC-signed tokens for runner approval, locals offer approval, vendor portal access
- **Wheelhouse mirror** — every customer-facing event posts a thread message into the Wheelhouse for real-time ops awareness
- **Auto-generated OG images** — per-page social cards for Facebook / Twitter / Slack previews
- **Sitemap + structured data** — Google indexes everything (events, businesses, articles) with rich-result eligibility
- **Vercel Postgres** — single database backing every transactional surface

---

## 🅿️ What's parked / coming (not for promotion yet)

So you don't pitch what doesn't exist:

- **SMS push (Twilio A2P)** — pending 10DLC clearance; current channels are email + web push
- **Stripe Issuing** — runner cards deferred 30+ days (need Connect volume first)
- **Phase 2 emergency banner auto-feeds** — NWS + CivicPlus auto-mirror, not yet wired
- **Customer order modification + comms** — design filed, not built
- **Higher-tier runner rewards** ($25 + shirt, $100, Apple Watch) — design only
- **Convenience-store restock automation** — manual Winston coordination for now
- **Housekeeping marketplace v2** — manual dispatch in v1
- **Restaurant signup self-serve flow** — Winston onboards manually for now

---

## 🎯 Distinctive angles (just material — your plan, not mine)

Things that feel marketable because nothing else local has them:

- **"The single page Port A checks first when a hurricane lands"** — emergency hub + push subscribers
- **"Every business vetted by locals · no paid placements"** — north-star differentiator vs. Yelp / TripAdvisor
- **"From Add to Home Screen to alert in 5 seconds"** — the PWA + push story for Carlos who just landed and wants the call about fireworks
- **"$28.87 was the first paid delivery"** — proof real money flows through PAL
- **"40+ years of Heritage stories — sourced and cited, no interviews, just records"** — the Heritage credential story
- **"Council meetings → readable digest, weekly"** — the civic-transparency angle
- **"One tap covers fireworks AND evacuations"** — the unified alert opt-in story
- **"$10/day cart, $20 off on top — and we never charge the vendor"** — the no-pay-to-play vendor pitch
- **"The kite festival demo Winston built for Collie to pitch the Timms with"** — PAL as a free demo platform for local-business owners
- **"PAL is built on CityDeploy" footer** — the platform-IP story for future Heye Lab projects (probably hold this one — meta-layer, not visitor-facing)

---

## 🔒 Things that are NOT for marketing copy

For your awareness:

- **The Wheelhouse** — internal only. Don't surface in posts.
- **Specific runner / vendor names** — anonymized internally as "Driver #N" / "Vendor"
- **The Bujan piece's precise sourcing process** — the piece is public; the research workflow stays internal
- **TPIA filings + investigative-piece sources in flight** — never reference until the piece ships
- **Personal relationships** (Fox family, Aly, Shana, Pete) — context-only, never in copy
- **Internal entity placeholders** ("Local Girls Cleaning" as a PAL-owned shell) — flagged for your review before any public reference
- **Heye Lab / CityDeploy framing** — keep quiet per the "tech mystery" feedback file unless you're actively promoting the platform-IP story

---

## What this map does NOT include

- The marketing plan itself — you do that, not me
- Specific copy / captions — you've got the Caption Library
- A posting calendar — that's the Content Calendar
- Outreach targets — that's the Outreach Tracker
- ROI / measurement — that's Targets

This map is the **inventory you riff against** when those other documents need an update.

---

— The Port A Local
