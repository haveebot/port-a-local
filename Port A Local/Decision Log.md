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

---

## 2026-04-13

### Primary domain: theportalocal.com
**Decision:** Switch primary domain from port-a-local.vercel.app to **theportalocal.com**. No hyphens (ever).
**Why:** Clean URL, professional, easier to say/type/remember. Hyphens are a domain-naming no-go for the brand.

### Skip Google Business Profile
**Decision:** Defer/skip GBP entirely.
**Why:** PAL is a media/directory platform with no storefront. GBP is built for storefronts and service-area businesses — technically we're ineligible and functionally we don't need it. Brand presence is handled by JSON-LD schema (live), GSC, and clean on-site SEO.
**Revisit if:** PAL opens a pop-up, adds paid advertising, or takes on a physical presence.

### PAL stays on haveebot GitHub + Vercel (no migration)
**Decision:** Do NOT migrate PAL to a dedicated `port-a-local` GitHub org or Vercel team. Stay on `haveebot/port-a-local` + `haveebots-projects`.
**Why:** PAL is a lean two-person op. Dedicated orgs/teams would add Vercel Pro cost ($20/mo) and overhead with zero functional benefit at current scale. Winston owns haveebot; it's effectively his.
**Contrast with Sage Em:** Sage Em gets full company-only separation (`sageem` org + `sageem` team) because it has multiple collaborators and external-facing structure.

### Twilio: prefer MessagingServiceSid
**Decision:** Maintenance SMS code now prefers `TWILIO_MESSAGING_SERVICE_SID` when set, falls back to raw phone number.
**Why:** Once A2P 10DLC campaign clears TCR, it auto-flips to the messaging service without a code change.

---

## 2026-04-14

### Port A Dispatch — new editorial section
**Decision:** Launch `/dispatch` as a separate section from Heritage. Distinct data layer (`dispatches.ts` + `dispatch-content.ts`), NewsArticle JSON-LD, dated bylines, signature seal footer.
**Why:** Heritage = preserved history. Dispatch = current-events journalism. Collapsing them would confuse both audiences and dilute the editorial posture. Separate sections keep each voice clear and let them scale independently.
**First piece:** "The Two Port Aransases" (2,050 words) — Tourism Bureau vs. in-town economic reality.

### Editorial workflow — 6-step pattern
**Decision:** Dispatch pieces follow: (1) push back on the brief first, (2) verify every factual claim publicly before writing, (3) hold unverifiable claims as follow-ups, (4) critique roles not people, (5) ship directly to live when authorized, (6) build architecture not just content.
**Why:** Winston wants PAL to be a legitimate media outlet — "shareable, marketable, ours." That means defensible sourcing, sharp analytical spine, not agitating locals who are *"some of us,"* and a platform that grows. This pattern was validated live with Dispatch #1.
**Stored at:** `feedback_pal_dispatch_workflow.md` in workspace memory.

### Lighthouse mark — the PAL brand
**Decision:** Lighthouse (inspired by the Lydia Ann Light) becomes the PAL identity. One `LighthouseMark` component, four detail levels (`full`, `standard`, `simple`, `icon`), `monochrome` prop.
**Why:** Anchored in island history — not generic beach iconography. Works at every scale (12px favicon → 620px hero watermark) from a single source of truth. The anti-Bureau posture (serif weight, navy+coral, coordinates, journalistic voice) is visually carried by this mark.
**Alternatives considered:** Three directions explored first, then v2 fusion, then v3 Lighthouse-only (locked).

### Anti-Bureau positioning
**Decision:** PAL is positioned as the media/editorial counter-narrative to the Port Aransas Tourism Bureau's "Island Life / Beach Nation" destination marketing.
**Why:** The Bureau speaks for visitors. PAL speaks for the place. Established in Dispatch #1 and visually reinforced through the brand.

---

## 2026-04-15

### PUD listing rule (firm)
**Decision:** No customer-facing mentions of PUDs (Cinnamon Shore, Palmilla, Sunflower Beach, Preserve at Mustang Island). No directory listings, map pins, neighborhood callouts, "stay here" recs, popular chips.
**Exception 1 — Editorial:** Heritage, Dispatch, archives, archival photos referencing PUDs as part of historical/economic narrative are protected.
**Exception 2 — Lisabella's:** Listed despite sitting inside Cinnamon Shore (personal relationship). Address, tagline, map pin all fine — it's a feature for Lisabella's, not a routing to the PUD.
**Why:** PAL's audience is locals and visitors who want the real island — not the gated developments that displace it. Editorial protection preserves the ability to *critique* those developments.
**Enforcement:** Scrub on sight if a new PUD emerges (next likely: Preserve at Mustang Island, bayside subdivision).

### Cart portal: marketplace model
**Decision:** Pivot from preferred-vendor/delivery to competitive marketplace/pickup. Customer books → lead blasts to 20 vendors → first to claim wins → customer picks up. $10/day reservation fee. Vendor gives minimum $20 discount. 5-day calendar minimum. 3–4 day no-vendor refund policy.
**Why:** Delivery is expensive and vendor-dependent — couldn't commit without a single exclusive vendor. Marketplace flips the dependency: we bring the demand, vendors compete for it. Flywheel thesis: volume → vendor dependence → vendor approaches us for exclusive deal → PAL has leverage.
**Vendor branding rule holds:** no vendor names in portal UI at booking time. Name revealed only in pre-arrival notification.

### Maintenance urgency-dispatch coupling
**Decision:** Only **Emergency** triggers $20 Priority Dispatch. Urgent (48hr) stays free Standard. Switching Standard ↔ Emergency auto-syncs both fields. SLA tightened: "within 4 hours" (not 2-4). After 8PM, Emergency disabled — call (361) 455-8606 for after-hours.
**Why:** Previous UX let customers pick Urgent + free Standard and expect same-day service. Coupling the two removes the ambiguity and protects John (who is SMS-only and doesn't need a flood of "urgent but free" leads).

### First FB banner — "Straddle the Rail" over FDR
**Decision:** Use the 1939 Russell Lee FSA photo of the Harbor Island Causeway sign as the first FB banner — not the FDR 1937 fishing photo.
**Why:** FDR is more famous *and* personally meaningful (Barney Farley, Collie's grandfather, is in the photo) but overused by every PA tourism outlet, Tourism Bureau, Tarpon Inn, and museum. "Straddle the Rail" was already sourced as public domain, is visually distinct, and matches the anti-Bureau "deep-cut" voice — signals *we know this place.* FDR reserved for a future rotation.

### Brand lockup — deliberately NOT locked yet
**Decision:** The lighthouse mark itself is blessed. The *full lockup* (lighthouse + wordmark + coordinates strip) is in use internally (OG cards, emails, footer, nav) but has **not** been formally approved as "the official identity package" — and we are deliberately waiting.
**Why:** (a) it's already working where needed so no lock is blocking, (b) FB banner proved the lockup isn't universal (pure photo + bleed beat lockup overlay), (c) locking prematurely biases toward using it everywhere.
**Plan:** Ship 3–4 more brand surfaces (IG, Twitter, per-business OG, merch) and see the pattern before deciding whether there's one canonical lockup or 2–3 approved configurations.

### FB page strategy — parked for Collie
**Decision:** No mass-delete of old PAL FB posts. Triage (keep/hide/delete) deferred until Collie begins contributing on marketing.
**Why:** Archive, don't nuke. Collie is the design/marketing co-founder — let her make the call when she's ready to own the channel.

---

## 2026-04-16

### Printable QR poster pattern
**Decision:** New dynamic route `/print/qr/[slug]` generates letter-size branded posters with a lighthouse-in-center QR code. Two initial targets: `home` and `sandfest`.
**Why:** First physical-world PAL artifact. Bridges the site to in-person signage (Sandfest weekend was the forcing function). Pattern is trivially extensible to per-portal and per-heritage posters.
**Tech:** `qrcode` npm package, error correction H (survives the center overlay), navy-on-sand, lighthouse icon overlay. `robots: noindex`. Letter-size `@page`.

---

## 2026-04-21 (evening — Collie round 1)

### Icon system: monochrome silhouettes (replacing emoji site-wide)
**Decision:** Replace emoji icons site-wide with single-color silhouette SVGs. One `PortalIcon` component (`src/components/brand/PortalIcon.tsx`) exports 9 icons matching Collie's design refs: eat, drink, stay, do, fish, shop, beach, maintenance, cart. All use `currentColor`, color set at the call site via Tailwind.
**Color rule (from Collie):** coral on navy backgrounds, navy on white backgrounds. Universal — not per-icon.
**Why:** Emoji is inconsistent across browsers/OS, renders with OS-native colors that break brand cohesion, and reads as casual at small sizes. Silhouettes render identically everywhere, scale cleanly, and match the anti-Bureau "serious local media" posture established with the lighthouse and Dispatch.
**Scope — round 1 (shipped):** the 9 Collie designed, wired into nav, homepage, category pages, portal pages, services, essentials, map, footer, business detail.
**Scope — rounds 2+ (pending Collie design):** nav items she didn't design (Services, Events, Heritage, Dispatch, Archives, Guides, Essentials, Island Pulse, Map, Photos, My Trip), Gully chips, Essentials section headers. Decorative content emoji likely stays.
**Alternatives considered:** Lucide icon library (doesn't match our brand voice), keeping emoji (Collie vetoed).

### Dispatch tagline: "Editorial" → "Features"
**Decision:** Change the Dispatch tagline on all 5 surfaces (index, article footer, OG alt text, OG subtitle, email footer) from "Editorial, analysis, and reporting on the island as it is — not as it is advertised" to **"Features, analysis and reporting on the island as it is — not as it's advertised."**
**Why:** Collie's feedback — "editorial" implies an editor or editorial board/publisher. PAL is written by Winston; no editorial board exists. "Features" is more accurate to the actual operating model and still carries journalistic weight.
**Alternatives considered:** keep "Editorial" (Collie flagged), use "Reporting" alone (too narrow — Dispatch also does analysis).

### Dispatch #1 title change, slug preserved
**Decision:** Change Dispatch #1 title from "The Two Port Aransases" to **"Port Aransas — A Tale of Two Islands"** — but keep the slug at `/dispatch/the-two-port-aransases`.
**Why:** Collie flagged "Aransases" as awkward with the "-es". Her suggestion was cleaner. Slug kept because: (a) any already-shared URLs continue to work with no redirect needed, (b) the new title is a display-only change — SEO/link equity preserved.
**Alternatives considered:** change both title + slug with 301 redirect (more surface area, unnecessary at this stage), keep original title (Collie's point stands).

### Marketplace model requires legal paperwork — attorney engagement
**Decision:** Engage a Texas business attorney for a one-time review and drafting of (1) platform T&C positioning PAL as a marketplace and disclaiming liability for vendor actions, (2) a one-page vendor agreement confirming independent-contractor status, insurance, and indemnification, (3) assumption-of-risk and indemnification language that holds up under Texas doctrine.
**Why:** The 4/15 cart marketplace pivot assumes vendor-liability (customer's service contract is with the vendor, not PAL). That assumption only holds if the T&C explicitly says so and vendor agreements exist. Right now vendors claim leads by email reply with no signed terms, and PAL's existing T&C doesn't explicitly position PAL as a marketplace. Without the paperwork, a plaintiff's lawyer can argue PAL operated as the service provider, and a judge may agree. With it, the marketplace thesis holds (Airbnb / Thumbtack / HomeAdvisor pattern). Texas-specific: fair notice doctrine and express-negligence test mean generic template language often fails.
**Cost:** $500–1,500 one-time. Cheap vs. one slip-and-sue on a rented cart or beach setup.
**Scope exclusion:** Claude does not draft this. Templates create false confidence; Texas doctrine fails most generic templates. Attorney-only.
**Alternatives considered:** (a) DIY from templates — rejected (Texas indemnification doctrine is specific), (b) template service like Rocket Lawyer — works for simple cases but PAL's vendor marketplace is not simple enough, (c) defer — rejected (current vendor-claim process has zero paper trail; exposure grows with every booking).

---

## 2026-04-22

### A2P 10DLC — separate-opt-in architecture
**Decision:** SMS consent on all three revenue forms (maintenance, rent, beach) must be collected via an **unchecked-by-default optional checkbox**, separable from form submission. Customer can complete the transaction without checking the box and still get email confirmation. Only affirmatively-opted-in customers receive SMS.
**Why:** Twilio A2P 10DLC campaign came back FAILED with error 30923: "consent cannot be a required condition for service or transaction completion." Our bundled "By submitting, you agree to... and consent to receive SMS" language violated CTIA rules. Separating consent is the only path to TCR approval.
**Implementation:** Shared `src/lib/twilioSms.ts` helper with `sendSms` (unconditional, for internal/vendor) and `sendConsumerSms` (gated on `smsConsent === true`, for customers). `smsConsent` threaded through all three Stripe checkout routes in metadata so it survives the payment round-trip. Customer SMS copy appends "Reply STOP to opt out." on every message.
**Alternatives considered:** (a) keep bundled consent and appeal the rejection — rejected (TCR rule is explicit), (b) remove SMS entirely — rejected (we want SMS for pre-arrival and return reminders), (c) require consent but hide the checkbox from non-US visitors — rejected (too cute, would likely fail on resubmission).

### Email signature — "— The Port A Local"
**Decision:** All PAL-outbound email (transactional templates, autoresponders, drafts-for-Winston-to-paste, vendor replies) signs off with exactly `— The Port A Local`. Em-dash, capital T/P/L. No trailing "team." No individual name.
**Why:** Winston's call — wants the signature to read as both an entity and a single person simultaneously. "Team" sounds corporate; a personal name breaks the editorial/anti-Bureau posture. "The Port A Local" holds both — it's the publication, and it's also how a local would describe themselves in the third person.
**Applied:** 6 transactional email templates updated (rent, rent/confirm, beach, beach/confirm, maintenance, maintenance/confirm). Rule saved to workspace memory as `feedback_pal_email_signature.md`.

### Miguel detailing routing — service-type dropdown, not separate dispatch
**Decision:** Add "Detailing / Wash" and "RV Undercoating" to the `/maintenance` `SERVICE_TYPES` dropdown. John Brown receives the dispatch SMS like any other service type; John calls Miguel for detailing jobs. No new env var, no new dispatch state machine, no new portal route.
**Why:** John is the island's trust anchor and his relationship-based routing IS the value — using him as the hub leverages that instead of bypassing it. Zero infrastructure cost (two strings added to an array). Also survives the A2P wait — John's dispatch is already wired. Graduates cleanly: if Miguel starts getting consistent volume and wants a dedicated channel, easy to flip him to the cart-style accept/decline flow later.
**Alternatives considered:** (a) new `/detail` portal mirroring /rent or /maintenance — rejected for now (over-engineering for one vendor), (b) direct-to-Miguel lead-blast like cart vendors — rejected for now (Miguel hasn't asked for it; John's relationship handles routing better than software).

### Email Automation — Gmail UI (Layer 1) before server-side (Layer 2)
**Decision:** Implement email automation for admin@ / hello@ / bookings@ Workspace accounts in two layers. Layer 1 uses Gmail's built-in filters, labels, canned responses, and vacation responders — configured in the UI, ~20 minutes one-time. Layer 2 (server-side inbound parsing for click-to-claim vendor flows) is tied to the cart marketplace buildout and is future work.
**Why:** Layer 1 covers the 80% use cases (autoresponders for hello@, infra-labeling for admin@, inbound-to-hello@ forwarding for bookings@) with no code. Server-side parsing introduces real infra (webhook endpoints, inbound mail vendor choice, storage for claim state) and couples to the cart click-to-claim buildout — better to tackle as one piece of work when the cart marketplace is the driver.
**Artifact:** `Port A Local/Email Automation.md` — copy-paste-ready filter rules, label list, canned response templates, and vacation responder text for Winston to configure in the Workspace UI.
