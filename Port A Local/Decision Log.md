# Decision Log
_Append-only. Every significant decision recorded here — what, why, what alternatives were considered._
_This is institutional memory. Never delete an entry._

---

## 2026-04-10

### Portal strategy over directory listings
**Decision:** Revenue-generating services (rentals, maintenance) are built as portals, not directory listings.
**Why:** Directory listings route customers to vendors. Portals keep the transaction in-house — we collect the fee, control the experience, and own the relationship.
**Alternatives considered:** Listing JOY Cart Rentals, John Brown, etc. as regular directory entries with affiliate links.
**Outcome:** Three portals built: `/rent`, `/beach`, `/maintenance`.

### Generic vendor branding (FIRM)
**Decision:** No vendor names ever appear in portal UI. "Golf Cart Rentals" not "JOY Cart Rentals."
**Why:** Protects the business model. Vendor can be swapped without the customer noticing. Not locked to any single supplier. Prevents customers from going direct.
**Applies to:** All portals, all time.

### Delivery-only rental model
**Decision:** All rentals are delivery-only. No physical storefront, no required in-person customer/vendor interaction.
**Why:** Keeps our operating model lean — no location overhead, no staffing a desk. Vendor delivers, customer receives. If vendor sees customer at delivery, that's acceptable and fine.
**Applies to:** Golf carts, beach setups, all future rentals.

### Platform: Next.js + Vercel (stay the course)
**Decision:** Keep building on Next.js + Vercel. Do not migrate to Shopify or any other platform.
**Why:** The directory, portals, and booking flows require custom logic that Shopify can't support cleanly. Next.js gives full control.
**For merch:** Use Shopify Storefront API (headless) — Shopify handles inventory/fulfillment behind the scenes, customer never leaves the site.
**Alternatives considered:** Full Shopify migration, Webflow.

### Beach rentals: V1 products
**Decision:** Two products for V1 — Cabana Setup ($300/day), Chair & Umbrella Setup ($85/day). Date range booking, delivery only.
**Why:** Simple, clean, testable. Expand SKUs once demand is proven.
**Future:** Water sports, additional beach equipment.

### Golf cart pricing model
**Decision:** $10/day platform reservation fee collected at booking. Customer pays rental balance directly to vendor at pickup/delivery at a discounted rate that exceeds the fee.
**Why:** Keeps payment infrastructure simple. Platform earns upfront, customer saves net vs. booking direct, vendor gets qualified booking cheaper than any marketing channel.

### "Port A Local" — drop the "Co"
**Decision:** Brand is "Port A Local." "Co" removed everywhere.
**Why:** Cleaner, simpler. Stands on its own.

### Operating model: Winston + Claude
**Decision:** Port A Local is run by Winston (product, relationships, decisions) and Claude (build, maintain, deploy, organize). No dependency on anyone else.
**Why:** Speed, control, no bottlenecks. Two-person operation that punches above its weight.

---

## 2026-04-12

### "Port A Heritage" rename (from "Island Stories")
**Decision:** Rename the heritage section from "Island Stories" to "Port A Heritage." Nav label: "History." URL stays `/history`.
**Why:** "Stories" was ambiguous — could read as blog posts, news articles, opinion pieces. "Heritage" anchors the content as preserved local history. "Port A" ties it to the brand.
**Alternatives considered:** "Island History", "Island Heritage", "Port A History", "Our History."

### Publish all 17 stories for V1
**Decision:** Write and publish all 6 expansion stories in-session rather than deferring to future sessions.
**Why:** Heritage is a key marketing differentiator at launch. No other Port A site has anything close to this depth. 17 original editorial pieces covering 5,000 years of history.

### "Just Gully It" brand identity
**Decision:** Brand the search engine as "Gully" with the verb "Gully it" used throughout — placeholders, headers, empty states, homepage section, nav pill.
**Why:** "Gully it" is ownable, local, and action-oriented. Same energy as "Google it" but for the island. Turns a search bar into a brand moment.

### Unified Gully search index
**Decision:** Combine businesses + heritage stories + menu items into a single Fuse.js index rather than separate search instances.
**Why:** One search experience across all content types. User doesn't need to know whether they're searching businesses or heritage — Gully handles it.

### Menu data as internal search fuel
**Decision:** Add menu items to business data for search purposes only. Not displayed on listing pages.
**Why:** Enriches search results dramatically (someone searches "fried shrimp" and gets businesses that serve it) without cluttering the listing UI or implying we maintain live menus.

### "Know This Place?" — anonymous, no login
**Decision:** Build community tag suggestions without user accounts, login, or gamification. Fully anonymous.
**Why:** No signup friction. Visitors contribute on first visit. Approval queue keeps quality high. Gamification (badges, Verified Local) deferred until Supabase.
**Alternatives considered:** Full community tagging with accounts + badges (requires backend).

### Nav refactor — Explore dropdown
**Decision:** Collapse 6 category links + Services into an "Explore" dropdown. Portals as uniform pills. Gully as search pill.
**Why:** 12 items in the nav was overcrowded. Portal boxes were getting squeezed and uneven. 7 items is cleaner, gives everything room to breathe.

### Push to main for live review
**Decision:** Push to `main` whenever there's a clean build and Winston wants to review on the live Vercel deployment. Always confirm first.
**Why:** Winston reviews on the Vercel URL, not a local dev server. Changes in worktree branches are invisible to him.
