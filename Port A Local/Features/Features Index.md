# Features Index
_Last updated: 2026-04-25_

## Live Features

### Search & Discovery
- **Gully** — "Just Gully It" site-wide search engine
  - Unified Fuse.js index: 140+ businesses + 17 heritage stories + ~405 menu items
  - Cmd+K command palette on every page
  - Recent searches (localStorage, last 5)
  - Tag enrichment: happy hour, live music, pet friendly, sunset views, etc.
  - Dedicated homepage section + nav search pill
  - Spec: [[Gully — Search & Discovery]]

### Revenue Portals
- `/maintenance` — Standard (free) + Priority Dispatch ($20). Spec: [[Maintenance Portal]]
- `/rent` — golf cart booking ($10/day reservation fee). Spec: [[Rental Engine]]
- `/beach` — cabana ($300/day) + chair & umbrella ($85/day). Spec: [[Rental Engine]]
- All portals: Stripe integrated (test keys), Resend email confirmations

### Heritage Content
- **Port A Heritage** — 24+ published long-form editorial stories at `/history` (last addition: #19 The Red Snapper Fleet, 2026-04-24)
- Related Heritage cross-links between stories
- Integrated into Gully search

### Events
- **Per-event hub pages** at `/events/[slug]` — full editorial + practical hub per event
  - Hero with live countdown (`EventCountdown` — flips to "Happening now" mid-event, "Wrapped" after)
  - Lede / what-to-expect / schedule / good-to-know / FAQ / host blurb / host timeline / day-of liveblog / sources / "Are you the organizer?" claim CTA
  - Per-event content fields drive copy: `relatedHistory?` · `photoCTA?` · `liveCoverage?` · `merchSpotlight?` (no hardcoded copy, sensible defaults)
  - Branded OG card per event via `brandedOG`
  - Schema.org/Event JSON-LD for rich results
  - Sitemap entries at priority 0.85
  - Live: KiteFest, DSR, TWAT, Tournament Season
- **Tournament coverage stack** (`src/components/tournament/`) — per-tournament infrastructure
  - `LeaderboardTable` — billfish.com-style per-division (responsive)
  - `DivisionsPanel` — division grid + expandable rules
  - `CaptainSpotlight` — boats-to-watch card
  - `PiggyPerchHighlight` — DSR kids-contest section
  - `TournamentRulesPanel` — editorial summary + "Official rules →" CTA + per-division collapsibles + crowd-source footer
  - `PastChampionsBoard` — grouped by year + per-entry source citations + crowd-source footer
  - `HistoricalPhotosShelf` — references `archives.ts` photo IDs (no duplication)
  - `MilestonesPanel` — verified-facts grid
  - Data layer: `src/data/tournament-results.ts`
- **Tournament Season hub** at `/events/tournament-season` — local-handle cluster page (DSR + Pachanga + Texas Legends + TWAT)
  - History blurb, per-tournament cards, at-a-glance comparison table, "How to plan a Tournament Season weekend"
  - Cross-link banner auto-renders from each event detail page via `isInTournamentSeason(slug)` helper
  - Pachanga + Texas Legends are stub members; promote by setting `detailHref` when their full hubs ship
- **EventOrganizerClaim CTA** — every event page renders a structured claim/contact form. POSTs to `/api/events/claim` → admin@ + hello@ via Resend.
- **CharityCallout** component — events with `event.charity` set get a prominent purple-bordered callout (mission, stat strip, donate-direct + about CTAs, transparency note).
- **MerchSpotlight** component — events where merch is part of the cultural footprint (TWAT). Editorial in tone; doesn't host or sell; "Send a sighting photo" CTA.
- **CountUpNext + Coming Up Next** on `/events` index — auto-picks soonest upcoming event (events.ts featured + inline monthly entries combined).
- **FeaturedEventBanner** on homepage — automatic, returns null off-season.

### Dispatch
- **`/dispatch` user-submission pipeline** (2026-04-25) — single-textarea topic-suggestion form, silent confirmation only, hybrid model
  - No name field, no contact, no acknowledgment email, no tracking ID, no trace tied to submitter
  - Submission emails admin@ + hello@ as before; we look whenever
  - Heading: "A real share of Dispatch starts with you" + "These pieces start as a topic somebody on the island sent us"

### Community Input
- **Know This Place?** — anonymous tag suggestion form on every business listing
  - 16 quick-pick tag chips + free-text note
  - No login required
  - Admin review at `/admin/suggestions`
  - API: `/api/suggestions`

### SEO
- JSON-LD structured data: WebSite (homepage), LocalBusiness (listings), Article (heritage)
- Dynamic meta tags on all pages
- Sitemap + robots.txt

### Navigation
- Explore dropdown (6 categories + Services)
- Gully search pill
- Uniform portal pills (Beach, Carts, Maintenance)
- Mobile menu with section headers

### Directory
- 140+ businesses across 6 categories
- Open Now filter on category pages
- BusinessCard component with tags, hours, location

## Planned / Backlog
- Texas Legends Billfish full hub (stub member in Tournament Season today)
- Billfish Pachanga full hub (stub member in Tournament Season today)
- "Not Like the Others" Dispatch piece (research backlog)
- "Women Fishing Take Over" Dispatch piece (research backlog)
- Classifieds / Want Board (needs Supabase)
- Community tagging with gamification (badges, Verified Local)
- Gully AI layer (Claude API) — V2
- Merch via Shopify Storefront API (PAL-branded Tournament Season merch as first candidate)
- Lodging / charter / restaurant reservation engines (extension of cart-portal pattern — see Revenue Model notes)
