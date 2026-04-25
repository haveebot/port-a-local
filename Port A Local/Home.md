# Port A Local — Company Brain
_Winston + Claude's living knowledge base. Updated every session._
_Last updated: 2026-04-24 (Live Music feature + Collie's design+marketing drop fully executed — icons v2 + lighthouse v2 + /brand kit + marketing ops + Heritage #19 Red Snapper Fleet shipped + PA Property Taxes Dispatch research in flight)_

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
- [[Session Notes/2026-04-24]] — Live Music feature from Winston's photo + Collie's full design/marketing drop executed (Round 1 icons v2 + Lighthouse v2 + /brand kit + Marketing ops vault) + Heritage #19 Red Snapper Fleet shipped + PA Property Taxes Dispatch research in flight (snapper-Dispatch wrong-turn corrected)
- [[Session Notes/2026-04-23]] — Collie comms channel live + SEO schema expansion (FAQ/Breadcrumb/ItemList/Place) + GSC diagnostic + 9 URL indexing requests + Coastal Carpet listing + Heritage #19 Red Snapper Fleet scaffolded
- [[Session Notes/2026-04-22]] — 13-commit marathon: A2P fix, 3 listings, Miguel routing, 55 silhouettes, Featured swap, Heritage #18 Pat Magee, Dispatch tip form, OG round 5
- [[Session Notes/2026-04-21]] — Vault catch-up dumptruck + Collie round 1 (9 silhouette icons shipped, 5 copy fixes, favicon monochrome, sticky header) + attorney scope defined
- [[Session Notes/2026-04-16]] — Printable QR poster pattern (Sandfest signage)
- [[Session Notes/2026-04-15]] — PUD scrub, cart marketplace pivot, Sandfest heritage, first FB assets, maintenance coupling
- [[Session Notes/2026-04-14]] — Dispatch launches, Lighthouse brand, full-site saturation, editorial workflow locked
- [[Session Notes/2026-04-13]] — Infrastructure live day (domain, Resend, Stripe, Twilio, heritage batch 1, GBP skip)
- [[Session Notes/2026-04-12]] — Monster session (17 heritage stories, Gully upgrade, nav refactor, SEO, Know This Place)
- [[Session Notes/2026-04-10]] — Portals, nav, SEO, Gully concept
- [[Session Notes/2026-04-04]] — First build session

---

## Current Status — April 24, 2026

| What | Detail |
|------|--------|
| Live site | https://theportalocal.com (HTTPS, 200 OK) |
| Domain | theportalocal.com (primary) |
| Businesses | **143+** across 6 categories |
| Heritage | **24 published stories** (Heritage #19 Red Snapper Fleet shipped 2026-04-24 — 10 sections, ~2,800 words, fills the commercial-fishing gap) |
| Dispatch | **1 published** — "Port Aransas — A Tale of Two Islands". **PA Property Taxes Dispatch IN FLIGHT 2026-04-24** — research run, fact base committed at `Port A Local/Dispatch Research/PA Property Tax — Fact Base 2026-04-24.md`, awaiting Winston news-hook + Collie local-prompting before angle lock. PAISD confirmed as Chapter 49 recapture donor ($16.3M → $28.8M trajectory 2019-2024). Tip form at /dispatch (Resend-powered) |
| **Brand kit** | **Live at /brand 2026-04-24** (noindex). Comprehensive internal reference — full color palette (hex + usage), 4 lighthouse detail levels with download links, 9 directory icons (downloadable SVGs), full 46-icon library, typography (Playfair + Inter), 7-tagline bank, voice guide, positioning pillars, icon system rules |
| **Marketing ops** | **Live in vault 2026-04-24** at `Port A Local/Marketing/` — Content Calendar (4 weeks), Caption Library (18 starter captions), Outreach Tracker, Targets (phase-gated + weekly dashboard), README. Built from Collie's Trust→Habit→Conversion launch plan |
| **Live Music** | **Live at /live-music 2026-04-23** (built from Winston's emailed photo of South Jetty schedule). Tonight hero + week grid + upcoming, PA-only filter, 7 venues. **Weekly refresh workflow institutionalized:** photo to haveebot subject `Live Music — Week of MMM DD` → Claude OCRs + transcribes + ships |
| SEO schema | Complete layer stack: WebSite, Organization, LocalBusiness, Article, NewsArticle, FAQPage, BreadcrumbList, ItemList, Place/TouristAttraction/LandmarksOrHistoricalBuildings |
| GSC indexing | 13/192 indexed (young-site crawl budget; 0 quality exclusions, 0 404s). 9 priority URLs submitted 2026-04-23 — re-check this week |
| Collie channel | **Direct IMAP/SMTP via haveebot@gmail.com (live 2026-04-23) + attachments subcommand (added 2026-04-24)** — `workspace/scripts/haveebot_mail.py`. Photo-to-feature workflow proven both directions (Winston→ Live Music; Collie→ icons + lighthouse + brand + marketing). Session-start auto-check |
| Portals | `/rent` (marketplace model) · `/beach` · `/maintenance` (urgency coupling) |
| Search | Gully — unified index (businesses + heritage + dispatch + menus + archives) |
| **Lighthouse mark** | **Collie's Illustrator design v2 (2026-04-24)** — replaced prior Lydia Ann rendering. Three color variants (dark / light / coral), four detail levels preserved. Propagates through 17+ OG cards + 6 transactional emails + FB profile/banner + print QR posters + nav + footer + hero + 404 + Apple touch + PWA. Site ↔ Collie's FB posts now converged |
| **Icon system** | **Round 1 v2 live 2026-04-24** — Collie's clean Illustrator SVGs replaced the distorted Canva versions for all 9 directory + portal icons (eat/drink/stay/do/fish/shop/beach/maintenance/cart). Tier 2-4 still Round 2-4 (46 silhouettes) with `EmojiIcon` fallback. Plug-and-play SVGs at `/icons/directory/*.svg` for Collie's external workflows |
| OG share cards | Every directory link has a branded preview — ~170+ route-specific previews |
| Favicon | Sand-on-navy simplified lighthouse (Collie's design v2) |
| Social | FB profile + FB banner routes (`/social/*`) |
| Print | Branded QR poster route (`/print/qr/[slug]`) |
| Revenue | $0 — Stripe LIVE, keys in Vercel, awaiting first transactions |
| Legal | ⚠️ **T&C + vendor agreements + indemnification pending attorney review** — Roadmap highest-priority item |
| A2P 10DLC | Brand APPROVED; campaign IN_PROGRESS at TCR (separate-opt-in architecture) |
| Email automation | Spec drafted (`Email Automation.md`); Layer 1 ready for Winston to configure (~20 min) |
| Email threading rule | Reply in-thread by default, keep subject line intact across replies (saved 2026-04-24 as `feedback_pal_email_threading.md`) |
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
