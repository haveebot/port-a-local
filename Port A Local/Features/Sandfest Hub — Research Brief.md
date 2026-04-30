# Sandfest Hub — Research Brief

**Compiled:** 2026-04-27
**Purpose:** Inputs for a PAL build session that turns theportalocal.com into the de-facto online home for Texas SandFest 2027 (and onward), capturing traffic, payments, and services currently scattered across texassandfest.org and Eventeny.

**Next event:** Texas SandFest 2026 — April 17–19, 2026, Mile Markers 13–17, Port Aransas, TX. The 2026 event is imminent at time of writing; PAL's first full hub should target SandFest **2027** (with a 2026 "covering it live" lightweight page as a wedge).

---

## Section A — Sandfest content tree (texassandfest.org)

Top-level nav + footer pages currently shipping:

- `/` — Home with countdown, sponsor wall, hero
- `/at-sandfest` — Main event-info hub (umbrella)
- `/daily-schedule` — Per-day timeline of activities
- `/things-to-do` — Activities + attractions on-site
- `/livemusic` — Music lineup
- `/kidscorner` — Family programming
- `/sustainablity` — Environmental initiatives [sic, typo in URL]
- `/parking-shuttles` — Transportation logistics
- `/petpolicy` — Service-animals-only policy
- `/accessibility` — ADA accommodations
- `/about`, `/mission`, `/board` — Org info
- `/faq` — 11-topic FAQ (pets, parking, ADA, food, tickets, sculptors, contacts, etc.)
- `/magazine` — Publications
- `/guestsurvey` — Post-event feedback
- `/get-involved` — Umbrella for participation
- `/vendors` — "Food and Non-Food" categories; currently "SOLD OUT"; routes apps to Eventeny
- `/sponsorship` — Downloadable packet + Eventeny apply link
- `/volunteer` — Volunteer signup
- `/sculptors` (+ `/master-solo-sculptors`, `/master-duo-sculptors`, `/semi-pro-sculptors`, `/non-competing-sculptors`, `/advancedamateurs`, `/amateur-competition`) — Roster pages by tier; thin on bios
- `/winners` — Past competition results
- `/pressrelease`, `/copy-of-press-release` — Media room
- `/golf-cart-raffle` — Annual fundraiser raffle
- `/generaladmissionticket`, `/vipwristbands` — Ticket-buy entry points (forwards to Eventeny)
- `/contact-us` — Contact form

---

## Section B — What's missing / weak on sandfest.org

- **Sculptor profiles are stubs.** Tier pages list rosters but no bios, photos, portfolios, or social links. The headline draw of the festival is invisible online.
- **No real schedule UX.** `/daily-schedule` is a static dump; no "what's on now," no day filter, no add-to-calendar.
- **Sponsor wall is a logo dump.** No sponsor stories, no "why this brand cares," no measurable spotlight value for the dollars they paid.
- **Vendor map is locked inside Eventeny.** Visitors land on Eventeny's `/events/map/?id=...&mid=...` — leaves the brand site to find a taco truck.
- **No live coverage layer.** No photo galleries, no daily recaps, no real-time results.
- **FAQ is text-heavy.** No search, no categorical drill-in, no jump links.
- **Ticketing dumps to Eventeny.** Conversion happens off-site; PAL never sees the buyer.
- **Site is Wix-built** (judging by URL slugs like `/copy-of-at-sandfest`, `/copy-of-press-release` — telltale Wix duplicate-page artifacts). Mobile is "responsive enough" but slow and template-y.
- **Press / media kit thin.** No high-res image library, no logo pack, no fact sheet.
- **No year-over-year continuity.** Past winners exist but no archive of past sculptures, no "watch it grow" narrative across years.

---

## Section C — Eventeny's vendor-reg model

**Platform pitch:** All-in-one event ops — vendor mgmt, ticketing, maps/seating, volunteer, sponsor, programming, scheduling, mobile organizer app.

**Pricing for organizers:** Tiered subscription. "Plus" plan is $360/mo billed annually ($4,320/yr) with 10 admins; monthly rate $240. Higher tiers exist.

**Fees on top of subscription:**
- 3–5% Eventeny transaction fee on every ticket/sponsor/vendor charge
- Stripe 2.9% + $0.31 per txn on top
- Product sales: flat 5%
- Vendor application fee: 5.9% surcharge (typically passed to vendor)
- +1% (cap $5/txn) if org takes payouts by check instead of Stripe

**Vendor flow on Eventeny:**
1. Vendor lands on event page → "Apply" by category (Food, Non-Food, etc.)
2. Fills application form (booth size, photos, biz info, COI upload)
3. Saves payment method on file (org charges later for booth + fees)
4. Org juries / approves
5. On approval, org charges card for booth
6. Eventeny hosts the live vendor map at `/events/map/?id=...&mid=...`

**What Sandfest specifically uses Eventeny for** (per their site):
- Ticket sales (GA wristbands + VIP)
- Vendor applications (food + non-food)
- Sponsor applications (tiered: Whale → Marlin → Sailfish → Tarpon → Trout → Flounder)
- Vendor-location map

**What PAL should replicate (Phase 1+2):** Schedule, sculptor profiles, sponsor display, vendor map, FAQ, parking/ADA, photo galleries, live updates.

**What PAL should *not* rebuild day one:** Jurying workflow, COI upload/storage, application payment-on-file, vendor messaging inbox. These are heavy and sit behind login walls Eventeny has already paid to build. Phase 2 territory.

---

## Section D — Recommended PAL hub structure (`/events/sandfest-2027`)

(Use 2026 as a "live coverage" lightweight build; 2027 as the full hub. Confirm year choice with board.)

- `/events/sandfest-2027` — Hub home: hero, countdown, "What is SandFest," CTA stack
- `/events/sandfest-2027/schedule` — Day-by-day timeline w/ filters + add-to-cal
- `/events/sandfest-2027/sculptors` — Roster grid by tier
- `/events/sandfest-2027/sculptors/[slug]` — Per-sculptor profile (bio, past work, social, sculpture this year)
- `/events/sandfest-2027/winners` — Live results + historical archive
- `/events/sandfest-2027/vendors` — Searchable vendor directory + map
- `/events/sandfest-2027/vendors/apply` — PAL-hosted application form (Phase 2 takes payments)
- `/events/sandfest-2027/sponsors` — Tiered sponsor wall w/ stories + ROI proof
- `/events/sandfest-2027/sponsors/pitch` — Sponsor pitch deck + tiers + apply CTA
- `/events/sandfest-2027/tickets` — GA + VIP buy flow (Phase 2 = direct Stripe; Phase 1 = passthrough)
- `/events/sandfest-2027/parking` — Lots, shuttles, RV, beach permit cost
- `/events/sandfest-2027/accessibility` — ADA, wheelchairs, sensory, service animals
- `/events/sandfest-2027/things-to-do` — On-site activities, music, kids, food
- `/events/sandfest-2027/faq` — Searchable, jump-linked FAQ
- `/events/sandfest-2027/live` — Live blog + photo stream during festival weekend
- `/events/sandfest-2027/gallery` — Photo + video archive (year-over-year)
- `/events/sandfest-2027/press` — Media kit, logos, hi-res, fact sheet, contacts
- `/events/sandfest-2027/volunteer` — Volunteer signup + shift picker
- `/events/sandfest-2027/board` — Mission, board roster, financial transparency
- Cross-link to existing Heritage piece *The Card Table That Built Texas Sandfest*

---

## Section E — Phase 1 vs Phase 2

**Phase 1 — PAL becomes the front door (no payments, no logins):**
- Hub home + all static info pages (schedule, sculptors w/ bios, sponsors, FAQ, parking, ADA, things-to-do)
- Sculptor profile pages w/ photos + bios (PAL editorial work)
- Sponsor wall w/ short brand stories
- Vendor application form (PAL-hosted, submissions email org → still juried in Eventeny short-term)
- Live blog + photo gallery
- Press / media kit
- "Buy tickets" + "Apply as vendor/sponsor" buttons can deep-link to Eventeny for now
- Heritage piece tie-in
- 301 plan: agree with board which sandfest.org pages eventually redirect to PAL

**Phase 2 — PAL takes the money + the workflow:**
- Direct ticketing via Stripe Connect (already PAL infra per Locals Sell-mode brief)
- Vendor application *with* payment-on-file + jurying queue + approval emails
- Sponsor invoicing
- Vendor portal logins (manage booth, COI upload, messaging)
- Replace Eventeny entirely; sandfest.org becomes a redirect or sunsets
- Year-over-year sculptor + sponsor data model (so 2028 inherits 2027)

---

## Section F — Open questions for the Sandfest board

1. **Domain control** — who owns texassandfest.org DNS? Willing to 301 to PAL, or run dual-site for a season?
2. **Eventeny exit terms** — current contract length, renewal date, what data exports out cleanly (vendor list, sponsor list, ticket holders)?
3. **Vendor list export** — can we get the 2026 approved vendor roster as CSV for the directory?
4. **Sculptor list + photos** — who has authoritative bios, portfolio shots, social handles? Permission to publish?
5. **Sponsor relationships** — who's the primary contact per sponsor? Are dollar amounts disclosable for tier transparency?
6. **Schedule source** — Google Doc? Spreadsheet? Email-then-paste? PAL needs a single ingestion point.
7. **Ticketing** — wristbands fulfilled physically at gate or scanned? What's the existing ticket-stock workflow?
8. **Payouts** — who's the legal entity receiving Stripe payouts on PAL? Same EIN as the nonprofit?
9. **Board signoff path** — single empowered champion, or full-board vote per change?
10. **Brand assets** — logo files, brand colors, font, photography library — where do they live?
11. **Volunteer tooling** — already in Eventeny? Or in a separate platform (SignUpGenius, etc.)?
12. **Rain/weather contingency policy** — needs to be in FAQ; current site is silent.
13. **Magazine** — what is `/magazine`? Print zine, sponsor program, or web archive?

---

## Section G — Source URLs (last fetched 2026-04-27)

- https://www.texassandfest.org/
- https://www.texassandfest.org/at-sandfest
- https://www.texassandfest.org/daily-schedule
- https://www.texassandfest.org/livemusic
- https://www.texassandfest.org/kidscorner
- https://www.texassandfest.org/parking-shuttles
- https://www.texassandfest.org/accessibility
- https://www.texassandfest.org/petpolicy
- https://www.texassandfest.org/about
- https://www.texassandfest.org/mission
- https://www.texassandfest.org/board
- https://www.texassandfest.org/faq
- https://www.texassandfest.org/get-involved
- https://www.texassandfest.org/vendors
- https://www.texassandfest.org/sponsorship
- https://www.texassandfest.org/volunteer
- https://www.texassandfest.org/sculptors
- https://www.texassandfest.org/master-solo-sculptors
- https://www.texassandfest.org/master-duo-sculptors
- https://www.texassandfest.org/semi-pro-sculptors
- https://www.texassandfest.org/non-competing-sculptors
- https://www.texassandfest.org/advancedamateurs
- https://www.texassandfest.org/amateur-competition
- https://www.texassandfest.org/winners
- https://www.texassandfest.org/pressrelease
- https://www.texassandfest.org/golf-cart-raffle
- https://www.texassandfest.org/generaladmissionticket
- https://www.texassandfest.org/vipwristbands
- https://www.texassandfest.org/contact-us
- https://www.eventeny.com/
- https://www.eventeny.com/product/pricing/
- https://help.eventeny.com/hc/en-us/articles/18430073200411-Eventeny-s-Fees-Explained
- https://www.eventeny.com/welcome-artists-vendors/
- https://www.eventeny.com/events/texas-sandfest-2026-21603/
- https://www.eventeny.com/events/texas-sandfest-2025-7959/
- https://www.eventeny.com/events/texas-sandfest-2024-7958/
- https://www.eventeny.com/events/map/?id=21603&mid=20106
- https://www.eventeny.com/events/ticket/?id=21603
- https://www.portaransas.org/sandfest/ (CVB cross-listing — secondary traffic source PAL also wants to capture)
