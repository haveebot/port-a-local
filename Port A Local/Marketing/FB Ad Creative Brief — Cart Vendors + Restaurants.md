# FB Ad Creative Brief — Cart Vendors + Restaurants

**Status:** ready to launch the moment Meta auth is live (Page Access Token + permission App Review per Strategy Notes Batch 2 §1).
**Goal:** vendor + restaurant signups in the Coastal Bend, anchored on the dual-purpose marketing pages (`/rent/vendor` and `/deliver/restaurant`) once they're built.
**Constraint:** PAL stays agnostic — no logos of paid vendors, no "featured listings," no testimonial copy purchased from operators.

---

## Campaign A — Cart vendors

### Audience

- **Geography:** Port Aransas + Mustang Island + Aransas Pass + Rockport + Corpus Christi metro (15-mile radius from the ferry landing covers ~95% of relevant operators).
- **Demographics:** 30–65, English speakers, US.
- **Interests:** Golf cart, Recreational vehicle, Vacation rental, Small business administration, Tourism, Hospitality industry, Mustang Island, Texas Gulf Coast.
- **Behaviors:** Small business owners · Page admins (FB Pages they manage) · Engaged shoppers in the rental/transportation category.
- **Custom audience (build over time):** lookalike from PAL's existing /rent customers; lookalike from PAL FB Page followers; visitors to `theportalocal.com/rent` (Pixel-based).
- **Exclude:** anyone in PAL's existing cart-vendor approved list (use a custom audience exclusion as we build it).

### Headlines (FB ad copy — ≤25 characters)

A1. **"List your cart fleet free."** (24 chars)
A2. **"Cart fleet? PAL sends renters."** (29 chars — over by 4, will truncate)
A3. **"Get pre-booked cart renters."** (28 chars — over by 3)
A4. **"Your cart, their beach day."** (27 chars — over by 2)

**Pick A1 as the lead.** Direct, names the action, names the price (free). A3 + A4 as A/B variants.

### Primary text (body — keep under 125 chars for above-the-fold readability)

A1-body:
> "PAL sends pre-booked cart renters straight to you. Free to apply. No subscription, no commission, no platform fee. You give the customer a $20 discount, PAL collects the reservation fee from them — never from you."

A3-body (volume framing):
> "Locals + visitors book carts on PAL every week. You set the rate. We send the booking. PAL never charges your business — our fees come from the customer side."

A4-body (story framing):
> "Beach day cart pickup. Customer's pre-paid the reservation, $20 off your daily rate already booked in. You drop off the cart, they take the keys. We handle marketing + reservations + customer comms. You keep 100% of the rate they pay you."

### CTA button

**"Apply"** (preferred) or "Learn More." Avoid "Sign Up" — too transactional, reads like pay-to-play.

### Creative direction

**No vendor logos. No vendor photos. No testimonial copy from operators.**

Options:
1. **Static image — beach + cart silhouette.** Empty cart parked on Port Aransas beach, golden hour, lighthouse on the horizon. PAL coral-line treatment at the bottom. Typography overlay: the headline. Stock or PAL-archived photo, anonymous fleet.
2. **Static image — line drawing.** Minimalist illustration of a cart with the lighthouse mark above it. Coral + navy palette. Looks editorial, not salesy.
3. **15-second video loop — the cart's day.** Time-lapse: empty cart at vendor lot → PAL booking confirmation animation → cart delivered → family piling in → cart driving down beach road → returning at sunset. No faces, just hands + carts + beach. Voiceover optional ("PAL sends pre-booked renters straight to you" — 6 sec line).
4. **Carousel (3-card):** Card 1 = "Apply free." Card 2 = "PAL never charges your business." Card 3 = "Customer pays the reservation fee." Each card a simple coral-on-navy block with PAL lighthouse + headline. Functional, on-brand, low production cost.

**Recommended for v1:** Option 4 (carousel). Cheapest to produce, fastest to A/B-test, scales across the budget without footage gathering.

### Landing page

`theportalocal.com/rent/vendor` (once built — see /rent/vendor design section below).

### A/B test plan

Run 3 ad sets simultaneously over a 7-day window:
- **Set 1 (control):** Headline A1 + Body A1 + Carousel Option 4
- **Set 2 (volume framing):** Headline A3 + Body A3 + Carousel Option 4
- **Set 3 (story framing):** Headline A4 + Body A4 + Static Option 1 (beach + cart silhouette)

After 7 days, kill the bottom-performer by application-form-completion-rate (not click-through, not impressions).

### Budget framing

- **Test budget (week 1):** $50/day total · ~$17/day per ad set
- **Validation budget (weeks 2–3):** $75/day on the winning set, kill the rest
- **Scale budget (week 4+):** dial up only when the application-completion-rate stays >2.0% and Winston/Collie can keep up with vetting calls

### Success metrics (in priority order)

1. **Application-form completion rate** (cart vendor signup form on `/rent/vendor`)
2. **Vendors approved + listed within 14 days of signup** (operator-quality signal)
3. **Reservation fee revenue uplift** within 60 days of approval (the only one that matters long-term)
4. CPC, CTR, impressions — read but don't optimize on

---

## Campaign B — Restaurants

### Audience

- **Geography:** same Coastal Bend radius as Campaign A.
- **Demographics:** 25–60, English speakers, US.
- **Interests:** Restaurant management, Food service, Small business, Hospitality, Local cuisine, Texas BBQ / Coastal seafood / Tex-Mex (vertical-specific tags), Toast (POS), Square POS, Clover (POS).
- **Behaviors:** FB Page admins (restaurant Pages) · Small business owners · Engaged users in the food + drink category · Page-roles: admin / editor for a Local Business or Restaurant.
- **Custom audience (build over time):** lookalike from existing PAL Delivery customers; lookalike from PAL FB Page followers; visitors to `theportalocal.com/deliver` (Pixel-based).
- **Exclude:** restaurants already onboarded on PAL Delivery (existing approved list).

### Headlines (≤25 characters)

B1. **"Your menu price. Period."** (24 chars)
B2. **"Delivery, no commission."** (23 chars)
B3. **"Local drivers, zero cuts."** (24 chars)
B4. **"PAL delivers. You keep 100%."** (28 chars — over by 3)

**Pick B1 as the lead** — captures the entire value prop in 4 words. B2 + B3 as A/B variants.

### Primary text (body — under 125 chars)

B1-body:
> "PAL delivers from your restaurant. We don't take a commission. Your menu price = your revenue, every order. We mark up the customer side for delivery + service — never your side. Local runners. We pick up. You make the food."

B2-body (DoorDash-comparison framing):
> "Tired of 25–30% commissions on delivery? PAL handles delivery, our drivers pick up, we never charge your restaurant. The customer pays delivery + service fees on top of your menu price. You keep your full price on every order."

B3-body (open-marketplace framing):
> "PAL Delivery is run by local runners on an open queue — first to claim wins. No restaurant has favored access; everyone gets the same shot at every order. We never charge your restaurant a commission. Customer-side fees only, your menu price stays your revenue."

### CTA button

**"Apply"** or "Learn More." Same reasoning as Campaign A.

### Creative direction

**Same agnostic constraint.** No specific restaurants featured.

Options:
1. **Static image — anonymous to-go bag.** Brown paper to-go bag on a counter. Soft Coastal Bend lighting. PAL coral-line + lighthouse mark. No restaurant brand visible.
2. **Static image — "your menu price" graphic.** Mock receipt showing: "Menu item: $14.00 · Your revenue: $14.00 · Delivery (customer pays): $5.00 · Service (customer pays): $2.00 · Customer total: $21.00 · Restaurant gets: $14.00." Editorial design, on-brand. Direct math = direct pitch.
3. **15-second video — the order journey.** Restaurant bag handed to runner → runner gets in car → runner delivers to door → customer takes bag. Voiceover: "PAL takes nothing from your restaurant. Local drivers do the rest." 12 sec body + 3 sec brand close.
4. **Carousel (4-card):** Card 1 = "Your menu price. Period." Card 2 = "Local drivers." Card 3 = "We never charge your restaurant." Card 4 = "Free to apply." Same coral-on-navy block treatment.

**Recommended for v1:** Option 2 (mock-receipt graphic). The math IS the pitch — showing it visually beats explaining it.

### Landing page

`theportalocal.com/deliver/restaurant` (once built).

### A/B test plan

Same 3-set structure:
- **Set 1 (control, math-first):** Headline B1 + Body B1 + Mock-Receipt Static (Option 2)
- **Set 2 (DoorDash-compare):** Headline B2 + Body B2 + To-Go Bag Static (Option 1)
- **Set 3 (open-marketplace):** Headline B3 + Body B3 + Carousel (Option 4)

After 7 days, kill the bottom-performer by application-form-completion-rate.

### Budget framing

- **Test (week 1):** $50/day · ~$17/day per set
- **Validation (weeks 2–3):** $75/day on winner
- **Scale (week 4+):** ramp when delivery-order volume from new restaurants justifies (~5+ orders/week per onboarded restaurant)

### Success metrics

1. **Application-form completion rate** (restaurant signup on `/deliver/restaurant`)
2. **Restaurants going live within 21 days of signup** (longer than carts because menu integration takes time)
3. **PAL Delivery order volume** uplift in the 60 days post-onboarding (the metric that matters)

---

## Cross-campaign organic prep (run before paid ads)

Don't start paid ads cold. Two weeks of organic posts on the PAL FB Page warms the audience + lets us A/B test ad copy on engagement metrics before paying for impressions.

**Week 1–2 organic content (cart vendors angle):**
- Post: "PAL Carts is a vendor-aggregator, not a rental company. Here's how it works." (link to /rent)
- Post: A heritage-piece tie-in mentioning Port A's golf cart culture (we have material in archives.ts)
- Post: A "weekend cart-rental stats" auto-post once the leaderboard ticker is live
- Post: "How does a cart vendor make more money during the off-season? List with PAL — apply free." (link to /rent/vendor when live)

**Week 1–2 organic content (restaurant angle):**
- Post: "PAL Delivery shipped its first DQ order in April 2025. Here's what's changed." (link to /deliver)
- Post: Public delivery stats from /deliver/runners ($X paid out this week, N runners on the road)
- Post: "Restaurants — PAL never takes a commission from your menu. Apply free." (link to /deliver/restaurant when live)
- Post: A sample math graphic (your menu price = your revenue)

**Week 3+ launch paid:** turn on Campaign A + B simultaneously. Pixel data from organic engagement + on-site visits gives FB ad delivery a head start.

---

## Targeting + retargeting infrastructure

**Before any paid ads launch, do these one-time setups:**

1. **Install Meta Pixel** on theportalocal.com (events: PageView, ViewContent, Lead-on-form-submit, AddToCart for /rent + /deliver + /housekeeping flows). Existing PAL site has none currently — gap to close before any paid ad spend.
2. **Conversions API (CAPI)** — server-side complement to the Pixel for iOS 14+ tracking parity. PAL's already on Vercel; CAPI is straightforward via the Meta Conversions API endpoint. Adds ~2 hr.
3. **Custom audiences** — set up the 3 named in each campaign brief (existing customers · Page followers · site visitors). Build over the first 30 days; FB needs ~1k events to model lookalikes.
4. **UTM parameters** on every ad URL so Wheelhouse analytics can attribute applications to specific ad sets.

---

## What needs to exist before this launches

1. **Vendor signup pages live:** `/rent/vendor` + `/deliver/restaurant` (both designed in Strategy Notes Batch 2 §2/§3, ~3 hr build).
2. **Meta Developer App + Page Access Token + Pixel + CAPI** (Strategy Notes Batch 2 §1, Phase 1 setup; ~3-4 hr after Winston grants Page admin access).
3. **PAL FB Page baseline** — post cadence established, follower count >100 ideally (lookalike audience needs critical mass).
4. **Tracking attribution** — UTMs + analytics drain so we can tell paid traffic from organic.

When all four exist: Campaign A + Campaign B can launch the same week with the carousel + mock-receipt creative direction above, $50/day budget, 7-day learning windows, and the success metrics named.

---

## What this isn't

- **Not a brand campaign.** No "PAL is the future of local marketplaces" puffery. Direct response: get vendors to apply, get them to show up at /apply with intent.
- **Not promo-driven.** No discount codes, no "first 100 vendors free" — those undercut the "free to apply forever" framing.
- **Not aspirational copy.** "PAL is the local platform built by locals" goes on the homepage, not in a $17/day FB ad. Ads pitch the math + the offer; the brand is upstream.

When you say go, I build the vendor pages around these pitches and we set up Meta auth in a follow-up session.
