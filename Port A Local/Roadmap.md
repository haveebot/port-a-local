# Port A Local — Roadmap & To-Do
_Living document. Updated each session._
_Last updated: 2026-04-11_

---

## Next Session

### Stripe Integration
- [ ] Add Stripe to `/rent` — collect $10/day reservation fee at booking
- [ ] Add Stripe to `/beach` — collect full amount at booking
- [ ] Test end-to-end payment flow

### Domain & Deployment
- [ ] Purchase `portaransaslocal.com` via Vercel (primary domain — no hyphens rule)
- [ ] Supporting domains: `portalocal.co`, `localportaransas.com` — redirect to primary
- [ ] Set up Google Workspace → `@portaransaslocal.com` emails
- [ ] Update all hardcoded `port-a-local.vercel.app` references in codebase
- [ ] Update mailto links to real domain email
- [ ] SSL / HTTPS confirm
- [ ] SSL / HTTPS confirm
- [ ] Submit sitemap to Google Search Console once domain live

---

## Backlog (prioritized)

### Mobile Experience Audit ← Winston reviews
- [ ] Full review of all pages on mobile
- [ ] Portal forms (rent, beach, maintenance) on small screen
- [ ] Nav behavior on mobile
- [ ] Touch targets, font sizes, spacing

### FeaturedSpots Audit ← Winston reviews
- [ ] Review which businesses are currently featured
- [ ] Confirm featured set is the right mix

### Google Business Profile
- [ ] Create Port A Local Google Business listing
- [ ] Add address, phone, hours, description
- [ ] Link to live domain once connected

### Homepage Credibility
- [ ] Add photos when available (hero background, category images)
- [x] Visitor testimonials — placeholder copy, customer perspective
- [x] Business name strip — real Port A businesses featured by name, no outreach needed
- **Strategy:** Platform voice IS the trust signal — local curation, no paid ads, honest recs. Business quotes = advertising, deferred intentionally. Stay fully internal until paid advertising is introduced.

### Gully — Search & Discovery
- [ ] Business data enrichment pass (tags, descriptions, offerings)
- [ ] Upgrade category search to use enriched data
- [ ] Site-wide search (`/search` or nav)
- [ ] Crowdsourced tagging system
- [ ] Brand as Gully, build personality
- [ ] AI layer (Claude API) — V2
- Full spec: `Features/Gully — Search & Discovery.md`

### Buy/Sell — Classifieds & Marketplace
- [ ] New nav section: "Buy/Sell" (or "Marketplace")
- [ ] User-posted listings — boats, gear, carts, property, island items
- [ ] Fox Yacht Sales as anchor listing / launch partner
- [ ] Revenue model: free to list, pay to feature (promoted spots)
- [ ] Moderation workflow TBD
- [ ] Consider: listing expiration, photo uploads, contact form per listing
- _Note: Port Aransas has strong demand for boat/marine buy-sell — natural fit_

### Realty
- [ ] Build out Realty category when ready
- [ ] Source local real estate agents

### Merch / Shop
- [ ] Shopify Storefront API integration
- [ ] `/shop` page on Port A Local
- [ ] Printful/Printify for print-on-demand fulfillment
- [ ] Palm Republic tie-in

### Maintenance — Full Tiered Dispatch Model
Current: Standard (free) + Priority Dispatch ($20, 7AM–8PM) — both live.

Next tiers to build:
- [ ] **After Hours Emergency tier** — $75–100, true 24/7, immediate dispatch, John on-call premium
- [ ] **Weekend logic** — confirm hours with John, adjust priority window if different Sat/Sun
- [ ] **Early morning rule** — before 7AM, Priority held until 7AM (already handled by time check); Emergency fires immediately
- [ ] **Revenue split with John** — define % PAL takes on Priority and Emergency fees
- [ ] **Volume tracking** — dashboard showing dispatches per week, revenue per month

### Twilio
- [ ] Swap to 361 local number (~$1/month) → SMS fully live for maintenance

---

## Completed ✅

### Session — April 10, 2026
- `/rent` golf cart portal + `/api/rent`
- `/beach` beach rentals portal (cabana $300/day, chair & umbrella $85/day) + `/api/beach`
- Homepage "Services on the Island" section — three portal cards
- Footer rebuilt with live portal links, dead links removed
- "Get Listed" → mailto
- SEO meta tags on all 6 category pages
- Dynamic SEO metadata on all 142 business listing pages
- SEO layout files for all 3 portals
- Open Now filter on category pages
- Business count copy: "X locally vetted businesses in Port Aransas"
- Hero stat: 140+ vetted businesses
- Nav contrast fix (gradient desktop, solid mobile menu)
- "Co" scrubbed from brand everywhere
- Repo cleanup (vault-backup, BUSINESS_LIST.md, scripts deleted; docs → vault)
- Vault renamed to "Port A Local" in Obsidian
- Roadmap.md + Ideas.md created
- Platform strategy: Next.js + Vercel + Shopify headless for merch

### Session — April 4, 2026
- Directory live — 142 businesses, 6 active categories (Eat, Drink, Stay, Do, Fish, Shop)
- `/maintenance` portal — customer form → John Brown via email + SMS
- Nav: Beach Rentals, Rent a Cart, Maintenance portals linked
- Removed Services, Realty, Beach from directory categories
- Vercel deploy configured, Google Sheet backup created
- Obsidian vault set up
