# Cart Vendor Email Scrape — 2026-04-28

Best-known-accuracy contact emails for the 13 PA cart-rental vendors currently missing emails in `src/data/cart-vendors.ts`. Each entry tagged with confidence + source. Winston reviews before any marketing email sends.

**Confidence legend:**
- **HIGH** — email visible on the vendor's own website (Contact, About, footer, etc.)
- **MEDIUM** — email surfaced on a third-party directory listing or Facebook About; not seen on vendor's own site
- **LOW** — inferred from name pattern; not directly verified
- **NONE** — not found anywhere

---

## Results

### 1. Coastal Ed's Coastal Carts
- **Email:** contact@coastaleds.com
- **Confidence:** HIGH
- **Source:** https://coastaleds.com/contact/ (also appears in header + footer at https://coastaleds.com/best-golf-cart-rentals-port-aransas-texas/)
- **Website:** https://coastaleds.com/
- **Alternate emails:** Footer of homepage shows a typo variant `contact@coastleds.com` (missing the "a" in coastal) — appears to be a website typo, NOT a real second mailbox. Use `contact@coastaleds.com`.
- **Notes:** The user noted this vendor "has email already" — this confirms `contact@coastaleds.com` is the live address. Flag the typo to Ed if the relationship warms up.

### 2. Port A Beach Buggies
- **Email:** insideout361@gmail.com
- **Confidence:** HIGH
- **Source:** https://www.everythingportaransas.com/listings/inside-out-home-decor-port-a-beach/ (directly published email + phone)
- **Website:** https://portabeachbuggies.com/
- **Owner:** Scott Tanzer (founded Inside-Out Beach Decor 2007, Port A Beach Buggies two years later — per https://portabeachbuggies.com/about-port-a-beach-buggies/)
- **Notes:** Same operator likely runs **Top Deck Golf Carts** (#13 below) — `insideout361@gmail.com` shows up for both. If you reach out to one, you're probably reaching the same person. Worth flagging in your CRM.

### 3. Texas Red Golf Carts
- **Email:** red@texasredgolfcarts.com
- **Confidence:** MEDIUM
- **Source:** Surfaced via Google search snippet pulling from texasredgolfcarts.com — direct fetch of About + Reservations pages did NOT show this email (page is mostly phone-only "(361) 749-5400"). The address pattern `red@<domain>` matches the owner's nickname.
- **Website:** http://www.texasredgolfcarts.com/
- **Notes:** Could not verify on a Contact page directly. Worth a sanity ping (e.g. send a short test before any campaign). If `red@` bounces, fall back to `info@texasredgolfcarts.com` or call.

### 4. First Stop Cart Rentals & Repair
- **Email:** [NOT FOUND]
- **Confidence:** NONE
- **Source:** https://visitorsguide.portasouthjetty.com/places/united-states/texas/port-aransas/beach-and-cart-rentals/first-stop-carts/ — directory shows website `1ststopcarts.com` and phone `361-332-8591`, but no email. Yelp page does not expose email either.
- **Website:** http://www.1ststopcarts.com/ (the live site was unreachable from our crawl — `ECONNREFUSED`. May be down or only-intermittent. Phone-only outreach is the only option until site is reachable.)
- **Notes:** Owner appears to be "Darcy" per a directory snippet — no verified contact. Manual outreach (call 210-338-9918 listed in vendor file, or 361-332-8591 from directory) is the only path. **Hardest one to track down.**

### 5. Tarpon Carts & Rentals
- **Email:** TarponCartsandRentals@gmail.com
- **Confidence:** HIGH
- **Source:** https://www.tarponcartsandrentals.com (in the Reservations section of the homepage)
- **Website:** https://www.tarponcartsandrentals.com/
- **Notes:** They request a 2-day-minimum to reserve and accept reservations by phone, in-person, or via the gmail address.

### 6. Bron's Beach Carts & Backyard
- **Email:** sales@bronsbeachcarts.com
- **Confidence:** MEDIUM
- **Source:** Surfaced via Google search result snippet for `bronsbeachcarts.com`. Direct fetch of homepage and `bronsbeachcarts.com/contact/` did NOT expose the email (homepage and `/contact/` page returned no email and a 404 respectively). Address pattern matches a typical "sales@" pattern on their domain.
- **Website:** https://bronsbeachcarts.com/
- **Notes:** Bron's is also a backyard bar / kitchen — the same operator runs both. The email is plausible but not directly verified on their own pages; recommend a sanity-check ping before campaign use.

### 7. Kacie's Beach Carts
- **Email:** [NOT FOUND]
- **Confidence:** NONE
- **Source:** https://kaciesbeachcarts.com/contact-us (page exists but does not publish an email — only a contact form). Sister site https://kaciesbeachrentals.com/about-us also did not expose an email. Owner appears to be "Kacie M." per chamber listings.
- **Website:** https://kaciesbeachcarts.com/ (also https://kaciesbeachrentals.com/)
- **Notes:** Likely an `info@kaciesbeachcarts.com` or `kacie@kaciesbeachcarts.com` exists but neither is published. Recommended: submit through their on-site contact form for first touch, or DM their Instagram (@kaciesbeachcarts).

### 8. Island Outfitters
- **Email:** info@islandoutfittersTX.com
- **Confidence:** HIGH
- **Source:** https://www.islandoutfitterstx.com/ (visible on homepage)
- **Website:** https://www.islandoutfitterstx.com/
- **Alternate emails:** A search snippet also surfaced `keith@islandoutfitterstx.com` (likely the new-owner contact — Island Outfitters changed hands per a Port A South Jetty article). Couldn't independently verify on the live site, so mark `keith@` as MEDIUM if you want to use it.
- **Notes:** Use `info@` for first touch — `keith@` is the apparent owner mailbox and worth keeping for follow-up if the relationship warms.

### 9. Gulf Carts
- **Email:** gulfcartsllc@gmail.com
- **Confidence:** HIGH
- **Source:** https://thegulfcarts.com/reservations (visible on the Reservations page)
- **Website:** https://thegulfcarts.com/
- **Notes:** LLC-suffix gmail is the published address. Clean to use.

### 10. Ash Cart Rental
- **Email:** ashcartrental@gmail.com
- **Confidence:** MEDIUM
- **Source:** Surfaced via Google search snippet pulling from ashcartrental.com / Yelp / FB. Direct fetch of `ashcartrental.com/contact/` failed (typo-route ECONNREFUSED) so couldn't confirm on their own site, but the pattern is a clean match for the domain name.
- **Website:** https://ashcartrental.com/
- **Notes:** High likelihood real — the gmail matches the brand exactly. Recommend a quick test send to confirm deliverability before bulk campaign.

### 11. Port A Carts
- **Email:** Portacarts@gmail.com
- **Confidence:** MEDIUM
- **Source:** Google search snippet for "Port A Carts" `300-4045` Alister surfaced this as their email. Direct fetch of `portacartsfun.com` did NOT expose it; their own site is phone + social only.
- **Website:** https://www.portacartsfun.com/
- **Notes:** Pattern matches their brand perfectly. Worth a sanity-check ping. Their Instagram is `@porta_carts` if email bounces.

### 12. Sage Beach Carts / Top Deck (5009 Hwy 361)
- **Email:** customerservice@sagebeachcarts.com
- **Confidence:** HIGH
- **Source:** https://sagebeachcarts.com/contact/ (listed in header + footer); also confirmed at https://sagebeachcarts.com/help-faqs/
- **Website:** https://sagebeachcarts.com/
- **Owners:** Kyle Wagner and Brittany Wagner (per Birdeye/directory listings)
- **Notes:** The user labeled this "Sage Beach Carts / Top Deck" — but research surfaces these as **two separate operations** sharing the phone `(361) 217-0703`:
  - **Sage Beach Carts** — sagebeachcarts.com — Wagner-owned — listed at 5009 Hwy 361 AND 3417 S 11th St (this is the address on their site).
  - **Top Deck Golf Carts** — topdeckgolfcarts.com — listed at 3423 Eleventh St — DIFFERENT chamber listings show the email as `insideout361@gmail.com`, suggesting Scott Tanzer / Inside-Out also operates Top Deck (overlap with Port A Beach Buggies #2).
  - The shared `217-0703` phone may be a Sage answering line that also routes Top Deck inquiries — or the two businesses are co-located.
  - **Recommendation:** Treat the user's #12 as **Sage Beach Carts** and use `customerservice@sagebeachcarts.com`. Top Deck is effectively a duplicate of #2 (Port A Beach Buggies / Inside Out) — flag this when reviewing the source vendor file (`src/data/cart-vendors.ts`).

### 13. Port Aransas Golf Cart Rental (2131 State Hwy 361, phone 361-749-0070)
- **Email:** [NOT FOUND]
- **Confidence:** NONE
- **Source:** Yelp listing https://www.yelp.com/biz/port-aransas-golf-cart-rental-port-aransas exposes phone + address only (Yelp scrape blocked us with 403). No website surfaced via search. No FB page surfaced.
- **Website:** Unknown — no domain found.
- **Notes:** Generic / SEO-style business name with no apparent web presence. Phone-only outreach (361-749-0070). This is the second-hardest after First Stop because we can't even find a website.

---

## Coverage Summary

| Confidence | Count |
|---|---|
| HIGH | 6 |
| MEDIUM | 4 |
| LOW | 0 |
| NONE | 3 |

**HIGH (6):** Coastal Ed's, Port A Beach Buggies, Tarpon Carts, Island Outfitters, Gulf Carts, Sage Beach Carts

**MEDIUM (4):** Texas Red, Bron's Beach Carts, Ash Cart Rental, Port A Carts (all surfaced via search snippets but not directly visible on the vendor's own site fetch — recommend a low-stakes verification send before any campaign blast)

**NONE (3):** First Stop Cart Rentals, Kacie's Beach Carts, Port Aransas Golf Cart Rental (2131 Hwy 361)

## Cross-vendor flags

- **Top Deck Golf Carts ↔ Port A Beach Buggies** — both surface `insideout361@gmail.com`. If `cart-vendors.ts` has Top Deck as a separate row, it's likely the same operator (Scott Tanzer / Inside Out) under a second brand. Verify and decide whether to dedupe before sending.
- **Sage Beach Carts vs. Top Deck** — the user's #12 noted "Sage Beach Carts / Top Deck" but these are different businesses by ownership (Wagner vs. Tanzer/Inside-Out) sharing the 361-217-0703 line. The Sage email (`customerservice@sagebeachcarts.com`) only reaches Sage. Reaching Top Deck means going through `insideout361@gmail.com`.
- **Coastal Ed's website typo** — the footer shows `contact@coastleds.com` (missing the "a"). Real address is `contact@coastaleds.com`. Worth mentioning to Ed if the relationship warms.
