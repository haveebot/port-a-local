# Port A Local — Roadmap & To-Do
_Living document. Updated each session._
_Last updated: 2026-04-12_

---

## Blocked on Google Workspace

### Account Creation
- [ ] Google Workspace resolves → admin@portaransaslocal.com live
- [ ] Create Stripe account under admin@
- [ ] Create Resend account under admin@
- [ ] Create Twilio account under admin@
- [ ] Create GitHub org (port-a-local), transfer repo from haveebot
- [ ] Create Vercel team (port-a-local), move project

### Once Accounts Are Live
- [ ] Swap Stripe test keys → live PAL Stripe keys
- [ ] Swap BASE_URL in sitemap.ts + robots.ts → portaransaslocal.com
- [ ] Wire Resend to Know This Place (email on new suggestions)
- [ ] Swap Twilio to 361 local number (~$1/month) → SMS live for maintenance
- [ ] Google Search Console → submit sitemap
- [ ] Google Business Profile for Port A Local

---

## Backlog (prioritized)

### FeaturedSpots Audit ← Winston reviews
- [ ] Review which businesses are currently featured
- [ ] Confirm featured set is the right mix

### Heritage Expansion Ideas
- [ ] Surfing History — surfing in Port A from the 1960s
- [ ] The Tarpon Inn — 1886, the scales, FDR, Harvey survival
- [ ] The Jetties — granite from Central Texas, Aransas Harbor Terminal Railway
- [ ] Ropesville to Port Aransas — the naming history (Ropesville → Tarpon → Port Aransas)

### Buy/Sell — Classifieds & Marketplace
- [ ] New section: "Buy/Sell" (or "Marketplace")
- [ ] User-posted listings — boats, gear, carts, property
- [ ] Fox Yacht Sales as anchor
- [ ] Revenue model: free to list, pay to feature
- Needs Supabase — hold until admin@ is live

### Gully V2
- [ ] AI layer (Claude API) for natural language queries
- [ ] Community tagging with gamification (badges, Verified Local)
- [ ] Menu data expansion — more restaurants

### Realty
- [ ] Build out Realty category when ready

### Merch / Shop
- [ ] Shopify Storefront API integration
- [ ] `/shop` page
- [ ] Printful/Printify for print-on-demand
- [ ] Palm Republic tie-in

### Maintenance — Full Tiered Dispatch
- [ ] After Hours Emergency tier ($75-100, 24/7, immediate dispatch)
- [ ] Weekend logic
- [ ] Revenue split with John
- [ ] Volume tracking dashboard

---

## Completed ✅

### Session — April 12, 2026 (monster session — 16 commits)
- Port A Heritage rename (Island Stories → Port A Heritage)
- 6 new heritage stories published (17 total for V1)
- Related Heritage cross-links on all story pages
- Heritage stories integrated into Gully search
- Tag enrichment pass (648 → 732 tags, all popular chips work)
- Menu item search (~405 items across 38 businesses)
- "Just Gully It" branding across all touchpoints
- Gully homepage section
- Gully nav search pill
- Gully recent searches (localStorage)
- "Know This Place?" anonymous tag suggestions + admin review
- Business listing hero fix (wave-bg → hero-gradient)
- Nav refactor (Explore dropdown, uniform portal pills, logo + tagline)
- SEO structured data (JSON-LD: WebSite, LocalBusiness, Article)
- Mobile responsiveness fixes
- Full vault update

### Session — April 10-11, 2026
- Domain purchased: portaransaslocal.com
- Gully branded: search engine with Cmd+K palette, popular chips
- 11 Island Stories published (complete heritage content layer)
- `/rent` golf cart portal + `/beach` beach rentals portal
- Homepage portals section, footer rebuild
- SEO meta tags across all pages
- Open Now filter, nav contrast fix
- Repo + vault cleanup

### Session — April 4, 2026
- Directory live — 142 businesses, 6 categories
- `/maintenance` portal — John Brown via email + SMS
- Vercel deploy, Google Sheet backup, Obsidian vault
