# Features Index
_Last updated: 2026-04-12_

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
- **Port A Heritage** — 17 published long-form editorial stories at `/history`
- Related Heritage cross-links between stories
- Integrated into Gully search

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
- Stripe live keys (waiting on Workspace/admin@ email)
- Resend email notifications for Know This Place suggestions
- Classifieds / Want Board (needs Supabase)
- Community tagging with gamification (badges, Verified Local)
- Gully AI layer (Claude API) — V2
- Map view for directory
- Realty category
- Merch via Shopify Storefront API
