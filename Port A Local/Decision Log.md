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

### Operating model: Winston + Havee only
**Decision:** Port A Local is run by Winston (product, relationships, decisions) and Havee (build, maintain, deploy, organize). No dependency on Nick, Shelina, or anyone else.
**Why:** Speed, control, no bottlenecks. Two-person operation that punches above its weight.
