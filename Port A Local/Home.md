# Port A Local — Company Brain
_Winston + Claude's living knowledge base. Updated every session._
_Last updated: 2026-04-22 (A2P fix + 3 new listings + Miguel routing + email automation spec)_

---

## Navigation

### Strategy & Decisions
- [[Project Overview]] — what it is, the team, the mission
- [[Decision Log]] — every major decision, why it was made
- [[Market Intelligence]] — the landscape, competitors, search terms
- [[Revenue Log]] — bookings, payments, lead tracking, scoreboard

### People & Vendors
- [[People & Vendors/John Brown — Port A Maintenance Services]] — maintenance vendor
- [[People & Vendors/JOY Cart Rentals]] — Tier 1 golf cart vendor (pre-marketplace; see cart-vendors.ts for current 20)
- [[People & Vendors/Billy Gaskins — Woody's Last Stand]] — affiliate, family friend
- [[People & Vendors/Collie Caraker — Design]] — design advisor, Palm Republic
- [[People & Vendors/Nick Merrill — Engineering]] — potential investor, not active

### Product
- [[Features/Features Index]] — all features planned and built
- [[Features/Gully — Search & Discovery]] — "Just Gully It" search engine
- [[Features/Rental Engine]] — golf cart + beach rental engine spec
- [[Roadmap]] — prioritized to-do list
- [[Ideas]] — loose scratchpad, future ideas, Collie input

### Heritage + Editorial
- [[Heritage Research/FDR Tarpon Fishing Trip 1937]]
- [[Heritage Research/The Tarpon Era]]
- [[Heritage Research/Farley Boat Works]]
- [[Heritage Research/Hurricane Celia and Port A Storm History]]
- [[Heritage Research/Port Aransas Timeline]]
- [[Heritage Research/Port Aransas Museum and PAPHA]]
- Dispatch source material lives in `workspace/drafts/` and the editorial workflow in `feedback_pal_dispatch_workflow.md`

### Business Directory
- [[Business Directory/Business Directory Index]] — all 140+ businesses
- [[Revenue Model/Revenue Model]] — revenue streams and strategy

### Session Notes
- [[Session Notes/Session Notes Index]]
- [[Session Notes/2026-04-16]] — Printable QR poster pattern (Sandfest signage)
- [[Session Notes/2026-04-21]] — Vault catch-up dumptruck + Collie round 1 (9 silhouette icons shipped, 5 copy fixes, favicon monochrome, sticky header) + attorney scope defined
- [[Session Notes/2026-04-15]] — PUD scrub, cart marketplace pivot, Sandfest heritage, first FB assets, maintenance coupling
- [[Session Notes/2026-04-14]] — Dispatch launches, Lighthouse brand, full-site saturation, editorial workflow locked
- [[Session Notes/2026-04-13]] — Infrastructure live day (domain, Resend, Stripe, Twilio, heritage batch 1, GBP skip)
- [[Session Notes/2026-04-12]] — Monster session (17 heritage stories, Gully upgrade, nav refactor, SEO, Know This Place)
- [[Session Notes/2026-04-10]] — Portals, nav, SEO, Gully concept
- [[Session Notes/2026-04-04]] — First build session

---

## Current Status — April 21, 2026

| What | Detail |
|------|--------|
| Live site | https://theportalocal.com (HTTPS, 200 OK) |
| Domain | theportalocal.com (primary) |
| Businesses | 140+ across 6 categories |
| Heritage | **22 published stories** — Port A Heritage |
| Dispatch | **1 published** — "Port Aransas — A Tale of Two Islands" (features/analysis/reporting) |
| Portals | `/rent` (marketplace model) · `/beach` · `/maintenance` (urgency coupling) |
| Search | Gully — unified index (businesses + heritage + dispatch + menus + archives) |
| Brand | Lighthouse mark locked; full-site saturation complete; full lockup intentionally not yet locked |
| Icon system | **PortalIcon component live** — 9 monochrome silhouettes (eat/drink/stay/do/fish/shop + beach/maintenance/cart); rounds 2+ pending Collie design |
| Favicon | White-monochrome lighthouse on navy |
| Social | FB profile + FB banner routes shipped (`/social/*`) |
| Print | Branded QR poster route (`/print/qr/[slug]`) — home + sandfest targets |
| Revenue | $0 — Stripe LIVE, keys in Vercel, awaiting first transactions |
| Legal | ⚠️ **T&C + vendor agreements + indemnification pending attorney review** — marketplace liability thesis needs paperwork to hold up |
| A2P 10DLC | Brand APPROVED; **campaign resubmitted 2026-04-22** after TCR failure on bundled consent — new submission has separate-opt-in architecture, IN_PROGRESS at TCR |
| Email automation | Spec drafted (`Port A Local/Email Automation.md`); Layer 1 (Gmail UI filters/responders/templates) ready for Winston to configure (~20 min); Layer 2 (server-side inbound parsing) tied to cart marketplace buildout |
| Repo | https://github.com/haveebot/port-a-local |

---

## What's Built (April 21, 2026)
- **Directory:** 140+ businesses, 6 categories, geocoded coordinates
- **Portals:** `/rent` (marketplace model — 20 vendor blast, 8 emails active, 12 pending), `/beach` ($300 cabana + $85 chair&umbrella), `/maintenance` (Standard free / Emergency $20 Priority Dispatch, urgency coupled)
- **Port A Heritage:** 22 published long-form stories (~28,000 words)
- **Port A Dispatch:** 1 published piece, editorial architecture in place for future pieces
- **Gully:** "Just Gully It" — unified index across businesses + heritage + dispatch + menus + archives; Cmd+K everywhere
- **Curated Guides:** 10 guides auto-populated from tags
- **Trip Planner:** My Trip (localStorage, no login)
- **Interactive Map:** 127 businesses with real geocoded pins
- **Island Pulse:** 10 webcams, ship traffic, native NOAA weather/tide dashboard
- **Island Essentials:** 10-section arrival guide
- **Events & Happenings:** 15 annual + 4 recurring
- **Fishing Report:** seasonal species, regulations, live conditions
- **Where to Stay:** neighborhood guide (Cinnamon Shore section removed per PUD rule)
- **Historical Archives:** 31 public domain photos, 1853-2017 — largest organized PA digital photo collection online
- **Community Photos:** "Port A Through Your Eyes" submissions gallery
- **Know This Place:** anonymous tag suggestions, admin review queue
- **Brand:** LighthouseMark component (4 detail levels + monochrome), full-site saturation across every surface, shared OG helper (`brandedOG`), shared email helper (`emailLayout`)
- **Icon system (2026-04-21):** `PortalIcon` component with 9 single-color silhouette SVGs (eat/drink/stay/do/fish/shop/beach/maintenance/cart) using `currentColor`; coral on navy bg, navy on white bg
- **Favicon (2026-04-21):** white-monochrome lighthouse on navy
- **Social assets:** `/social/facebook-profile`, `/social/facebook-banner` (extensible pattern)
- **Print assets:** `/print/qr/[slug]` — QR posters for physical signage
- **SEO:** complete meta + JSON-LD (WebSite, Organization, LocalBusiness, Article, NewsArticle), sitemap 175+ URLs

## Operating Model
Winston makes product decisions and owns local relationships.
Claude builds, maintains, deploys, and organizes everything else.
Goal: lean two-person operation that punches above its weight.
See [[Decision Log]] for all major decisions.

## Key Files
- Vault: `/Users/winstoncaraker/Projects/workspace/port-a-local/Port A Local/`
- Code: `/Users/winstoncaraker/Projects/workspace/port-a-local/` (Next.js + Vercel)
- Stories: `src/data/stories.ts`, `src/data/story-content.ts`
- Dispatch: `src/data/dispatches.ts`, `src/data/dispatch-content.ts`
- Cart vendors: `src/data/cart-vendors.ts` — 20 selected PA cart companies, `getBlastableVendors()` helper
- Brand mark: `src/components/brand/LighthouseMark.tsx`
- **Portal icons: `src/components/brand/PortalIcon.tsx`** — 9 silhouette SVGs, `currentColor`-driven
- Shared OG: `src/lib/brandedOG.tsx`
- Shared email: `src/lib/emailLayout.ts`
- Static logos: `public/logos/lighthouse-{full,standard,simple,icon}.svg`
- Social routes: `src/app/social/facebook-{profile,banner}/route.tsx`
- Print route: `src/app/print/qr/[slug]/page.tsx`
- Archival photos: `public/archives/` (causeway-sign-1939.jpg — first downloaded)
