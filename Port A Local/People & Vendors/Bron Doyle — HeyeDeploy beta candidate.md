# Bron Doyle — HeyeDeploy beta candidate

_Discovery filed 2026-05-09 PM. Revenue-share pitch: 12% target on every transaction PAL processes through systems we build for him, EXCLUDING bar/F&B sales (we market the venue free). Internal: actual ceiling is 12; pitch may negotiate to 8-10. Bar carve-out is a goodwill anchor, not a giveaway — bar sales are highest-volume/lowest-margin and the most painful to migrate, so removing them removes friction + frames PAL as growth partner, not vendor._

## Operator at a glance

**Bron Doyle** owns and runs the entire 314 E Avenue G campus in Port Aransas. Five customer-visible arms under one roof, plus a vacation rental property arm noted but **out of scope for this deal**:

| Arm | In deal? | What we'd do |
|---|---|---|
| **Bron's Backyard** (outdoor bar / event venue / live music / yard games / movie nights) | ❌ EXCLUDED — bar carve-out | Free venue marketing via PAL `/live-music`, `/events`, social composer mentions |
| **Bron's Kitchen** (food service inside Backyard) | ❌ EXCLUDED — bar carve-out | Free food-spotlight surface on PAL |
| **Bron's Shaved Ice & To-Go Bar** (frozen daiquiris / shaved ice / to-go cocktails) | ❌ EXCLUDED — bar carve-out | Free promotion |
| **Bron's Beach Carts** (golf cart rentals, 4 + 6 passenger) | ✅ INCLUDED — revenue share | Replace Cojilio booking + integrate into PAL `/rent` (already done as of 2026-05-09 — first-look priority pattern) |
| **Bron's Beach Rentals** (chairs / umbrellas / cabanas / coolers — beach equipment) | ✅ INCLUDED — revenue share | Replace Cojilio booking + integrate into a new PAL `/beach/rentals` surface |
| **Vacation Properties** (Bron's Beach Shack / Bron's Place / Beach Breeze — three 3BR rentals) | 🚫 NO INVOLVEMENT | Per Winston 2026-05-09: PAL takes no involvement in property bookings. Listed here for awareness only — do NOT pitch, do NOT include in revenue scope, do NOT build a properties surface. |

## Commerce stack today (verified 2026-05-09 via webfetch)

| Layer | Current vendor | What PAL would replace |
|---|---|---|
| Marketing site | bronsbeachcarts.com (Wix-based, Websmart/wsimg.com CDN) | Migrate to PAL subdomain or PAL-powered with `bronsbeachcarts.com` domain pointed at PAL infra |
| Booking — golf carts | `booking.cojilio.com/3967/online` | PAL `/rent` (already integrated as cart-vendor + first-look priority — shipped PR #40, 2026-05-09) |
| Booking — beach equipment | `booking.cojilio.com/bronsbeachrentals/online` | New PAL `/beach/rentals` surface (Phase 2 staging build) |
| Booking — beach carts (separate Cojilio) | `booking.cojilio.com/bronsbeachcarts/online` | Consolidate with golf cart booking under PAL |
| Payment processor | Unknown (likely Cojilio's pass-through to Stripe) | Stripe Connect via PAL — Direct Charges (Bron is merchant) OR Destination Charges (PAL is merchant); decide based on tax/branding stance |
| Bar / F&B POS | Unknown — likely separate (Square / Toast / Clover) | **Not touching.** Bar carve-out. |
| Customer comms | Phone-only on marketing site (no email visible) | PAL Twilio + automated booking confirmations + reminders |
| Rental docs / waivers / agreements | Implied — Cojilio templates or manual | Sage-style auto-generated PDF docs |

**Cojilio cost estimate**: niche scheduling platform (Canadian), per-business pricing typically $50-200/mo. Bron runs **3 separate instances** = ~$150-600/mo total. **Killing all 3 = a real hard-dollar saving** he can quantify the moment we close.

## Damage liability framework (verified from public policies page)

These are pre-canned auto-doc inputs. The rental agreement generator can render these per booking:

- Water damage: $1,000 - $8,000+ charged to renter
- Cart tipping: $1,000 - $5,000 charged to renter
- Refuel fee: $30 if returned without fuel
- General liability: renter responsible for all replacement / repair / loss
- Third-party damage: renter must obtain insurance + license info from other party + file police report
- Driver requirement: valid driver's license required
- Geographic restrictions: no Hwy 361 south of Ave G · no past mile marker 60 · no driving in water · no sand dunes · stay behind pylons · no public sidewalks or pedestrian walkways
- Conduct: no reckless driving (no speeding, donuts, etc.)

**For the auto-doc demo (Phase 3)**: render these into a customer-readable rental agreement with their booking-specific data merged in (name / dates / cart number / payment summary). Sage's `verify-on-render + auto-archive` pattern applies.

## Brand voice samples (preserve in any PAL-powered surfaces)

- *"The friendliest golf cart rental in town!"*
- *"Come see why Bron's Backyard is the place to be!"*
- *"Reserve your spot, show up, and start enjoying the island life — no setup required!"*

Casual, friendly, island-vibes. **Not** PAL editorial voice. Anything PAL renders under the bronsbeachcarts.com brand should match this voice, NOT shift to PAL's own. Distinct branding tracks.

## Existing PAL surfaces touching Bron's (already in production)

- `/drink/drink-brons-backyard` — featured drink listing (`businesses.ts:2291`)
- `/eat` — multi-category cross-listing
- `/live-music` — recurring venue (slug `brons` → `directoryHref: /drink/drink-brons-backyard`, `live-music.ts:60`)
- `/rent` — cart-rental marketplace (vendor `brons-beach-carts`, with **first-look priority 30-min** flag as of 2026-05-09)
- `/events` — nightly-music callout includes Bron's by name
- `/essentials` — happy-hour callout includes Bron's
- Wheelhouse social composer (`socialComposerAgent.ts`) — names Bron's as a regular venue in drafts
- **NEW 2026-05-09**: vendor record carries 3 phones + 2 unverified emails, first-look priority window in `cart_rental_first_look_pending` table, ACCEPT/PASS keyword routing in inbound webhook

## Competitive intel

- **PortA.Today** linked in the bronsbeachcarts.com footer — competitor of PAL (rival local guide). Could mean: friendly relationship with that operator, hedging across guides, or stale legacy footer link from before PAL existed. **Worth surfacing in conversation casually**: "I noticed PortA.Today in your footer — happy to talk about how this would map across both surfaces or if that link should evolve once we're partners."
- His marketing surface is Wix-based, no SEO meta worth saving, no analytics signals visible. Easy to migrate without losing traffic value.
- He's NOT on Stripe Direct (booking goes through Cojilio's pass-through). Means we're competing against Cojilio for the rental commerce layer, not against Stripe directly. Easier sell.

## What still needs answers from Bron directly

To be answered in the walk-in conversation, NOT by web research:

1. **Payment processor** — what's behind Cojilio? Stripe pass-through, Square, or his own merchant account? This determines the Stripe Connect onboarding path.
2. **Volume estimates** — weekly/monthly/seasonal rental count, average ticket, peak-vs-off ratio. Need this to size the 12% number against real revenue.
3. **Bar POS** — Square / Toast / Clover / other? Not for migration, but knowing it confirms the carve-out narrative.
4. **Email reality** — `bron@bronsbeachcarts.com` and `sales@bronsbeachcarts.com` are both unverified guesses. Per-address bounce tracking on the cart-vendor blast (PR #40) will tell us which works, OR he confirms verbally.
5. **Staff roles** — Kristen (+12542203808) handles what? Are there other team members on rentals vs bar?
6. **Existing rental agreement** — what does it look like today? Word doc, Cojilio template, in-person paper? The auto-doc rebuild should match or exceed.
7. **Cojilio cost** — confirms the hard-dollar savings number for the pitch.
8. **Brand stance** — PAL-invisible behind bronsbeachcarts.com, co-branded ("powered by Port A Local"), or full migration to a PAL subdomain?
9. **Off-ramp comfort** — what makes him feel safe saying yes if he's still hesitant? Data ownership, contract length, exit clauses?
10. **Decision authority** — does this close on him alone, or does he loop in Kristen / others / a partner?

## Phased build plan (recap)

1. ✅ **Phase 1 — discovery** (THIS DOC) — verify what stack he runs, what's replaceable, what's carved out
2. ⬜ **Phase 2 — staging wedge**: new `/beach/rentals` surface on PAL with 2-3 hardcoded Bron's products + Stripe split-payment test flow → URL on his phone in the walk-in
3. ⬜ **Phase 3 — auto-docs demo**: working rental agreement generator → demo file produced live in the walk-in
4. ⬜ **Phase 4 — walk-in**: Tuesday/Wednesday afternoon at his place. Lead with HIS phone showing his existing PAL footprint, then flip to staging URL, then auto-doc demo, then `/wheelhouse/cart-vendors-sms` showing he's the only first-look-priority vendor in the directory
5. ⬜ **Phase 5 — gated decision**: he says yes → build the rest. He passes → Phase 2/3 outputs become next-tenant patterns

## Show-off arsenal best matched to Bron

| Asset | Why it lands |
|---|---|
| theportalocal.com (PAL prod) | He's ALREADY ON IT. Show his own listings on his own phone. *"This is what we already do for you for free."* |
| First-look priority surface | Shipped today specifically for him. *"You're the only first-look-priority vendor in the directory. 30-min head start on every cart lead. This was built this afternoon."* |
| Customer recovery story (today's Cabana arc) | We just navigated a customer from refund-demand to "thank you" + on-site pickup. *"This is the kind of thing your operation gets backed by — we don't drop you when something goes sideways."* |
| Multi-recipient comms | We text Bron, his cell, AND Kristen on every lead. *"Three numbers, one alert, no missed leads. You don't have to be the bottleneck."* |
| Stripe Connect daily payouts | Same rails PAL beach-payouts cron uses. *"You see your share of every transaction land in your account daily, no invoice from us."* |
| HeyeDeploy framework story | *"You're not buying software. You're a beta tenant in a system that's getting smarter every week."* |

## Internal notes

- **Pricing — DO NOT show Bron**: 12% is the internal target. Pitch may land at 8-10% after negotiation. Below 8% probably means we walked back too far; above 12% is upside we don't expect to capture.
- **The bar carve-out is a feature, not a concession**: explicitly framed as "we don't take a cut on your bar because we're not the ones selling those drinks." This anchors us as a value-add on transactions we DRIVE, not a tax on his existing business.
- **Don't mention competitors by name**: PortA.Today, Cojilio. Let him bring those up. We replace systems, we don't badmouth them.
- **Watch list `bron-pitch`** TTL through 2026-05-14 — elevated 🔔 push fires on any reply from his three phones.
- **Intro SMS landed 2026-05-09 21:46 UTC** to all 3 numbers (Bron reservations, Bron personal, Kristen) — all delivered cleanly. Zero replies as of doc-writing.

## Sources

- bronsbeachcarts.com (homepage + policies-%26-regulations) — webfetched 2026-05-09
- Cojilio booking subdomains (3 instances identified, JS-rendered SPA) — confirmed presence
- portaransaslive.com, yelp.com, ccms portaransas-texas.com listings — webSearch 2026-05-09
- PAL data layer (`businesses.ts`, `live-music.ts`, `cart-vendors.ts`) — verified in code
- `memory/project_brons.md` — May 6 outreach + reply context
- `Session Notes/handoff-2026-05-08.md` — context as of 2026-05-08
