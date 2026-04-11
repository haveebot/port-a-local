# Port A Local — Roadmap & To-Do
_Living document. Updated each session._
_Last updated: 2026-04-10_

---

## In Progress / Next Up

### 1. SEO Basics ← CURRENT SESSION
- [ ] Submit sitemap to Google Search Console
- [ ] Add meta descriptions to every category page
- [ ] Verify individual business listing pages are indexable (`/eat/grumbles-seafood`, etc.)
- [ ] Fix hero stat — "50+" → "138+" vetted businesses

### 3. Real Business Listing Pages ← CURRENT SESSION
- [ ] Audit existing listing pages — what's there, what's missing
- [ ] Add hours, address, phone, Google Maps embed, tags to each listing
- [ ] Ensure every listing has enough content to rank for local searches

---

## Next Session

### Stripe Integration
- [ ] Add Stripe to `/rent` — collect $10/day reservation fee at booking
- [ ] Add Stripe to `/beach` — collect full amount at booking
- [ ] Test end-to-end payment flow

### Domain & Deployment
- [ ] Connect real domain (port-a-local.com? portalocal.com? TBD)
- [ ] Configure DNS on Vercel
- [ ] Update all internal references from vercel.app URL to real domain
- [ ] SSL / HTTPS confirm

---

## Backlog (prioritized)

### 2. Activate Revenue on Portals
- Stripe (see above — next session)

### 4. Homepage Credibility
- ✅ Fix business count stat (doing this session)
- [ ] Add social proof — quotes, local endorsements
- [ ] Add photos when available

### 5. Mobile Experience Audit
- [ ] Full review of all pages on mobile
- [ ] Portal forms (rent, beach, maintenance) on small screen
- [ ] Nav behavior on mobile
- [ ] Touch targets, font sizes, spacing

### 6. Google Business Profile
- [ ] Create Port A Local Google Business listing
- [ ] Add address, phone, hours, description
- [ ] Link to live domain once connected

### Gully — Search & Discovery
- [ ] Business data enrichment pass (tags, descriptions, offerings)
- [ ] Upgrade category search to use enriched data
- [ ] Site-wide search (`/search` or nav)
- [ ] Crowdsourced tagging system
- [ ] Brand as Gully, build personality
- [ ] AI layer (Claude API) — V2
- Full spec: `vault/Features/Gully — Search & Discovery.md`

### Realty
- [ ] Build out Realty category when ready
- [ ] Source local real estate agents

### Merch / Shop
- [ ] Shopify Storefront API integration
- [ ] `/shop` page on Port A Local
- [ ] Printful/Printify for print-on-demand fulfillment
- [ ] Palm Republic tie-in

---

## Completed ✅
- Directory live — 138 businesses, 6 active categories (Eat, Drink, Stay, Do, Fish, Shop)
- `/maintenance` portal — customer form → John Brown via email + SMS
- `/rent` portal — golf cart booking, internal alert + customer confirmation
- `/beach` portal — cabana ($300/day) + chair & umbrella ($85/day) setups
- Nav: Beach Rentals, Rent a Cart, Maintenance portals linked
- Removed Services, Realty, Beach from directory categories
- "Co" scrubbed from brand everywhere
- Nav contrast fix (gradient desktop, solid mobile menu)
- Repo cleanup (vault-backup, BUSINESS_LIST.md, scripts, docs consolidated)
- Platform strategy decided: Next.js + Vercel + Shopify headless for merch
