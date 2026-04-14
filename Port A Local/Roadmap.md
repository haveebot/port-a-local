# Port A Local — Roadmap & To-Do
_Living document. Updated each session._
_Last updated: 2026-04-13_

---

## Infrastructure — Status

### ✅ Live
- Google Workspace active — admin@, hello@, bookings@ all receive mail (MX: smtp.google.com)
- Domain live: https://theportalocal.com (200 OK, HTTPS)
- Stripe: `acct_1TLv2G…` under admin@theportalocal.com, charges + payouts enabled, live keys in Vercel
- Resend: live API key in Vercel, bookings@theportalocal.com sender
- Twilio: account active, $44 balance, number +1 (361) 428-1706 SMS+Voice
- A2P 10DLC Brand: **APPROVED** (BNd603…)
- GSC: domain verified via TXT, sitemap submitted
- Sitemap + robots on theportalocal.com (175+ URLs)
- Resend wired to Know This Place — admin@ gets email on every new tag suggestion

### ⏳ Waiting
- [ ] A2P 10DLC Campaign — IN_PROGRESS at TCR (low-volume mixed use case, no failure reason). Maintenance SMS code already updated to use MessagingServiceSid when available — auto-flips the moment it approves.

### 🟡 Open
- [ ] Create GitHub org (`port-a-local`), transfer repo from haveebot/port-a-local
- [ ] Create Vercel team (`port-a-local`), move project from haveebots-projects
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

### Session — April 12, 2026 (MONSTER SESSION — 30 commits)
- Port A Heritage rename + 6 new stories (17 total)
- Gully: unified search, tags, menus, "Just Gully It" branding, recent searches
- Know This Place: anonymous tag suggestions
- Nav refactor: Explore dropdown, pills, logo, tagline
- Curated Guides: 10 auto-generated guides
- Trip Planner: My Trip with save/bookmark
- Interactive Map: 127 geocoded businesses
- Island Pulse: 10 webcams, ship traffic, NOAA weather/tides
- Island Essentials: 10-section arrival guide
- Events & Happenings: 15 annual + 4 recurring
- Fishing Report: species, regulations, conditions, captain links
- SEO: structured data + heritage OG images
- Category page refinement, footer update, mobile fixes
- Business listing UX: Open Now, Gully link, Signature Items, hero fix
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
- Domain purchased: theportalocal.com
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
