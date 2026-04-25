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

### Full-site emoji eradication — icon system as design primitive
**Decision:** Replace every visible emoji across PAL with single-color silhouettes from the `PortalIcon` component. Aliases (emoji → existing PortalIcon name) cover rarely-used emojis without requiring new designs. SMS body text and email subject lines stay emoji by necessity (plain-text / mixed client SVG support).
**Why:** Emoji rendering varies across OS/browser/email-client, which breaks brand cohesion. Silhouettes render identically everywhere, inherit color from parent (coral on navy / navy on white per Collie's rule), and match the anti-Bureau "serious local media" posture. Winston authorized the full rollout in one push: "assume Collie signed off, let's swap all of them out. if she makes changes we will do it again."
**Scope locked in this push (rounds 2–4, commits `35ca1b3` / `f625efb` / `c4d63e2`):** 55 silhouettes total + 21 emoji aliases. EmojiIcon helper wraps data-driven render sites with graceful emoji fallback for any unmapped emoji. Every visible UI surface now renders silhouettes — Nav, Footer, GullyPalette + /gully page, homepage stats, portal headers + stats + success + error states, category pages, services, photos, my-trip, admin, archives, KnowThisPlace, CategoryPage, IslandConditions weather, fishing-report seasons + types, where-to-stay neighborhoods, history buttons, all 19 OG share cards.
**Review model:** ship now, iterate later — any icon that reads poorly is a one-line SVG swap in `PortalIcon.tsx` with zero call-site impact. Collie reviews on the live site whenever she has time.

### OG share-card badges use inline PortalIcon SVG
**Decision:** Refactor `brandedOG` to accept `badgeIcon: PortalIconName` alongside `badge` text. Render the PortalIcon SVG inline in the badge pill (satori-compatible — `currentColor` inherits from the badge's text color). All 19 OG routes updated to pass text-only badges + separate badge icons instead of emoji-prefixed strings. Dynamic routes (`dispatch/[slug]`, `history/[slug]`) resolve from metadata via `emojiToIconName` with fallback to category default.
**Why:** Social share cards were the last emoji holdout in the visible brand surfaces. Satori (Next's OG image engine) renders inline SVG cleanly, so there's no technical reason to keep emoji in social previews. Consistent silhouette in LinkedIn/Twitter/Facebook link previews completes the anti-Bureau posture.
**Pattern for future OG routes:** import from `brandedOG`, pass `badgeIcon` + `badge`. Same shape for every route.

### Featured Spots rebalance — Red Dragon Pirate Ship out, Aloha Açaí in
**Decision:** Swap the homepage Featured Spots tile from Red Dragon Pirate Ship to Aloha Açaí. Final 9: Venetian Hot Plate, Tortuga's, Aloha Açaí (eat × 3); The Gaff, Bron's Backyard (drink × 2); The Tarpon Inn (stay); Deep Sea HQ, Woody's Last Stand (do × 2); Saltwater Gypsies (shop).
**Why:** (a) Red Dragon is the most tourist-bureau-adjacent of the three "do" entries and least local-resonant in voice. (b) Deep Sea HQ keeps the real fishing anchor; Woody's keeps the family-friend relationship. (c) Dropping one "do" rebalances toward "eat" with Aloha Açaí, which fits the Old Town / Alister Square corridor expansion and promotes one of the three same-corridor businesses added 2026-04-22.

### Dispatch tip form replaces mailto — server-side capture + validation
**Decision:** Replace the mailto "Send a Tip" link on /dispatch with an inline form that POSTs to a new `/api/dispatch/tip` route. Required textarea (min 10 chars, client + server validation); optional name and contact; sends via Resend to admin@ + hello@ with structured HTML; in-place success state.
**Why:** Triggered by the Julie Janda incident (2026-04-22) — empty email received with subject "Dispatch Tip". Root cause analysis showed the old mailto had four gaps: no body-required validation (users could send blank), no server-side record (we relied on hello@ inbox only), no structured fields, and silent failure for users without a default mail client configured. The form closes all four. Uses the same Resend + emailLayout pattern as the maintenance/rent/beach forms — direct reuse, no new infra.

### Per-business + per-category + per-guide OG share cards
**Decision:** Add `opengraph-image.tsx` to `[category]`, `[category]/[slug]`, and `guides/[slug]` routes. Each uses `brandedOG` with route-specific badge + badgeIcon + title + subtitle, pre-rendered via `generateStaticParams`.
**Why:** 150+ directory/guide routes were falling back to the root OG image for social share previews, which meant every business link shared to iMessage / FB / Slack showed the same generic "Port A Local" preview. Per-route OG cards differentiate every shared link and reinforce brand/content identity at the preview layer. Completes the OG system started in Round 4 (which covered all static routes).

### EmojiIcon helper — graceful data-driven render pattern
**Decision:** Introduce `EmojiIcon({ emoji, className })` helper component in `PortalIcon.tsx`. Looks up the emoji in the full `emojiToIconName` map (42+ mapped emojis). Returns `PortalIcon` if mapped, raw emoji span otherwise. Use at every data-driven render site where icon values come from a data file or CMS rather than being known statically.
**Why:** Data files (guides.ts, stories.ts, events/live/history data arrays) store icons as emoji strings. Changing those to a typed `PortalIconName` union would require ripping up the data model AND losing emoji fallback for unusual cases (events data has seasonal 🎃 🎄 🎭 that don't deserve dedicated silhouettes). EmojiIcon lets data stay as strings, renders silhouettes where available, falls back gracefully. One-line swap at each render site (`<span>{data.icon}</span>` → `<EmojiIcon emoji={data.icon} className="..." />`).

### Email Automation — Gmail UI (Layer 1) before server-side (Layer 2)
**Decision:** Implement email automation for admin@ / hello@ / bookings@ Workspace accounts in two layers. Layer 1 uses Gmail's built-in filters, labels, canned responses, and vacation responders — configured in the UI, ~20 minutes one-time. Layer 2 (server-side inbound parsing for click-to-claim vendor flows) is tied to the cart marketplace buildout and is future work.
**Why:** Layer 1 covers the 80% use cases (autoresponders for hello@, infra-labeling for admin@, inbound-to-hello@ forwarding for bookings@) with no code. Server-side parsing introduces real infra (webhook endpoints, inbound mail vendor choice, storage for claim state) and couples to the cart click-to-claim buildout — better to tackle as one piece of work when the cart marketplace is the driver.
**Artifact:** `Port A Local/Email Automation.md` — copy-paste-ready filter rules, label list, canned response templates, and vacation responder text for Winston to configure in the Workspace UI.

---

## 2026-04-23

### Haveebot@gmail.com as a Claude comms channel — carve-out from the PAL/SageEm account rule
**Decision:** Claude has direct IMAP/SMTP access to haveebot@gmail.com via an app password stored in `workspace/.env`. Tool lives at `workspace/scripts/haveebot_mail.py`. Used for *communication only* — primarily Collie's design/journalism feedback, plus any cross-project comms (PAL, Sage Em, CrossRef) where haveebot is the convenient inbox. PAL *infrastructure* accounts (Stripe, Resend, Twilio, Workspace, GitHub, Vercel) remain on admin@theportalocal.com or haveebot-as-GitHub-owner per the prior rule.
**Why:** Winston's call on 2026-04-22: Collie shouldn't have to route feedback through Winston as middleman. Direct channel enables near-real-time design iteration. Memory boundary preserved by distinguishing comms access (allowed) from account ownership (blocked). Rule carve-out saved to `feedback_pal_vs_sageem_accounts.md`.
**Implementation:** Python stdlib-only script (imaplib + smtplib) with `check` / `inbox` / `unread` / `from <email>` / `collie` / `thread <uid>` / `send` subcommands. App password mode 600, gitignored. Reference memory `reference_haveebot_mail.md` documents usage + Winston-authorization-before-send workflow. Session-start hook auto-runs `collie --since <last-check>` so her recent mail is in Claude's context at session start.
**Alternatives considered:** (a) Claude in Chrome browser automation of Gmail — rejected for this use (per-session, no persistent "last-read" state, slow). Still available as escape hatch. (b) Gmail OAuth API — more secure scoping but more setup; app-password path was sufficient. (c) Winston manually relaying — the status quo; didn't scale as Collie joined active design/journalism work.

### SEO schema expansion — additive stack for rich-result eligibility
**Decision:** Add four new JSON-LD schema types (FAQPage, BreadcrumbList, ItemList, Place) layered on top of the existing WebSite / Organization / LocalBusiness / Article / NewsArticle schema. Wiring is surgical:
- FAQPage on `/essentials` (10-section arrival guide becomes Q/A-shaped).
- BreadcrumbList site-wide on detail route types: `/[category]/[slug]`, `/history/[slug]`, `/guides/[slug]`, `/dispatch/[slug]`.
- ItemList on `/guides/[slug]` (curated business lists).
- Place / TouristAttraction / LandmarksOrHistoricalBuildings on 6 Heritage pieces about physical landmarks (Lydia Ann Lighthouse, Farley Boat Works, Port Aransas Museum, Chapel on the Dunes, Tarpon Inn, Port Aransas Jetties).
**Why:** Rich results are gated on machine-readable markup of specific shapes. PAL already had strong structured-data hygiene (WebSite, Organization, LocalBusiness everywhere) but was missing the four shapes Google most rewards with rich results — FAQ carousels, SERP breadcrumb trails, ItemList structure signals, and Place cards. All additive — zero risk to existing rankings.
**Scope exclusion:** Event schema (for `/events`) deferred because our event data uses natural-language timing strings ("Third weekend of April") rather than parseable dates. Would need data-model expansion to add `startDate` / `endDate` per event per year. Flagged as future work.
**Commits:** `2962f3c` (FAQ + Breadcrumb + ItemList + Place helper), `9eaf55e` (Place wiring on 6 Heritage pieces).

### PlaceSchema selection criteria — physical landmarks only
**Decision:** PlaceSchema wired only on Heritage pieces about **fixed, physical, visitable** locations. Pieces about people, events, services, industries, or crafts are deliberately excluded.
**Why:** Google rejects Place schema that doesn't describe an actual visitable location. False Place markup on an article about *people* or *events* would trip up the structured-data validator and potentially hurt the URL's search eligibility. Clean fit: Lydia Ann Light, Farley Boat Works (museum), Port Aransas Museum, Chapel on the Dunes, Tarpon Inn, Port Aransas Jetties. Deliberately excluded: FDR / Karankawa / Pat Magee (people); Hurricane Celia / Sandfest / Mercer Logs (events); Ferry (service); Red Tide UTMSI (event→institution but about the 1935 fishkill).

### Coastal Carpet Cleaners — third vendor via John-as-hub routing (Miguel precedent)
**Decision:** Add Coastal Carpet Cleaners (owner Tyler, (361) 813-6958) as a `/services` directory listing and slot "Carpet / Upholstery Cleaning" into the `/maintenance` `SERVICE_TYPES` dropdown. John Brown receives the dispatch SMS and calls Tyler for carpet jobs. Same pattern as Miguel's detailing entries (2026-04-22).
**Why:** Preserves John's trust-anchor role, zero infrastructure cost, no new env var, no new dispatch state machine. Graduation path is explicit — if Tyler starts getting consistent volume and wants a direct SMS channel, a small `src/data/service-dispatch.ts` map (service type → vendor phone) flips it to direct routing. Gate for graduation: ~5–10 clean John-routed dispatches per vendor demonstrating reliability.
**Copy note:** Initial draft used Winston's "world-class carpet and furniture cleaning" brief as the tagline; reworked on his feedback to "Long-established, locally owned carpet & upholstery cleaning — mobile, by appointment" to match PAL's earnest anti-Bureau voice.

### Heritage #19 subject — Red Snapper Fleet (commercial fishing gap)
**Decision:** Heritage #19 covers the rise, peak, crisis, and modern pivot of Port Aransas's commercial red snapper fishing fleet (1880s–present). Deliberately complementary to existing Heritage pieces on sport fishing (`tarpon-era`, `fdr-tarpon-port-aransas`), tournaments (`deep-sea-roundup`), infrastructure (`port-aransas-jetties`), and science (`red-tide-utmsi`).
**Why:** Commercial fishing is the missing industrial/economic counterpoint to PAL's existing fishing coverage (which leans sport / recreational). Red snapper specifically is a rich SEO capture (we already rank for "wok on" type business-name queries; this piece captures "port aransas fishing history" + "red snapper gulf of mexico" + "Individual Fishing Quota" type queries). Narrative has a strong arc: commercial rise → overfishing crisis → regulatory regime (Magnuson-Stevens, IFQ) → allocation wars → charter-fleet pivot.
**Sourcing policy:** Heritage, not Dispatch — so the pattern is preservation-first, less adversarial. Still needs multi-source verification (NOAA, Gulf of Mexico Fishery Management Council, Texas Parks & Wildlife, academic journals, Port Aransas Museum). Background research agent dispatched to compile the factual brief; body drafted once research lands.
**Cross-links:** Bidirectional with `tarpon-era`, `deep-sea-roundup`, `port-aransas-jetties`, `red-tide-utmsi`, `farley-boat-works`. Updated on 2026-04-23 in `stories.ts`.

### GSC indexing diagnostic — direct pull via Claude in Chrome
**Decision:** Pull real indexing and performance data from Google Search Console by navigating the GSC web UI via Claude in Chrome MCP, logged in as haveebot@gmail.com (full permissions granted 2026-04-23). Use URL Inspection tool manually to request indexing on priority URLs (rate-limited to ~10/day by GSC).
**Why:** Needed actual indexing state, not guesses. Setting up the GSC API via Google Cloud OAuth was a longer path; the browser path was zero-setup and gave immediate read access plus the ability to submit indexing requests. 9 priority URLs submitted on 2026-04-23: `/history`, `/dispatch`, `/essentials`, `/eat`, `/do`, `/stay`, `/dispatch/the-two-port-aransases`, `/history/pat-magees-surf-shop`, `/where-to-stay`.
**Diagnostic result:** 13 / 192 URLs indexed. 175 "Discovered — currently not indexed" (crawl budget). 3 redirects to investigate. **Zero** "Crawled — not indexed" (no quality exclusions). **Zero** 404s. Clean bill of health; issue is purely site age / authority signals.
**Follow-up:** GSC API via OAuth is worth setting up if we find ourselves doing this repeatedly. For now, the browser path is sufficient for periodic checks.

---

## 2026-04-24

### Photo-driven feature intake — `/live-music` proves the workflow
**Decision:** When Winston or Collie emails haveebot a photo with a "do this" framing, treat the email as a full feature spec. Pull attachments via the new `attachments <uid>` subcommand, OCR/transcribe via vision, ship the feature, reply with summary. No bottleneck on clarification.
**Trigger:** Winston's 2026-04-23 evening email (uid 153) with the South Jetty's printed "Live Music Tonight" sheet attached. *"Example of a feature we could add via simple emails with screenshots or content. Think like - do it - if we don't like it then it changes or is removed - it can't be too bad or we would not have sent the idea."*
**Outcome:** `/live-music` route built, deployed, and confirmed live in one evening. Tonight hero + week grid + upcoming, PA-only filter, 7 venues, 25 acts. Weekly refresh institutionalized: subject prefix `Live Music — Week of MMM DD` is the dedupe key. Source photos archived to `Port A Local/Winston Inbox/<date>-uid<n>/`.
**Workflow rule saved:** `feedback_pal_photo_to_feature.md`. Script extension (commit `a1f6510` in workspace-memory) is the durable tool — basename-only filenames, traversal guards, collision numbering.

### Collie Round 1 v2 — replace Canva icons with Illustrator SVGs
**Decision:** Swap all 9 Round 1 directory + portal icons in `PortalIcon.tsx` with Collie's Illustrator output (received 2026-04-24, uid 156). Original Canva versions distorted at small sizes; the Illustrator SVGs are clean and proportionally consistent.
**Why:** Round 1 icons appear in 150+ call sites. Distortion at small sizes was visible. Collie's Illustrator file fixes it cleanly. `viewBox="0 0 128 128"` per-icon, `fill="currentColor"` inheritance preserved — zero call-site changes needed.
**Bonus:** Added `public/icons/directory/*.svg` standalone files for Collie's external workflows (Canva, Illustrator, anywhere she needs to plug-and-play the marks). Visible on `/brand` with download links.

### Lighthouse mark v2 — Collie's design replaces the Lydia Ann rendering
**Decision:** Adopt Collie's lighthouse design as the canonical PAL mark. Three color variants (dark / light / coral) replace the prior dark/light pair. Four detail levels preserved (full / standard / simple / icon) with progressive simplification from her 8-ray full design down to a silhouette-only icon.
**Why:** Site lighthouse and Collie's FB posts had drifted. Her FB profile + banner posts showed her own lighthouse, not the site's. Single-source-of-truth resolved by adopting her design site-wide. Drift-prevention going forward: `/brand` is the arbiter.
**Propagation:** All in one commit (`db3a65d`). Auto-flows through favicon, Apple touch, PWA, 17+ OG cards, 6 transactional email templates, FB profile/banner routes, print QR posters, nav, footer, hero, 404.
**`monochrome` prop deprecated** (kept as no-op for backwards compat) since Collie's design is already monochromatic by default.

### `/brand` page — internal reference, not public content
**Decision:** Build a comprehensive brand kit page at `/brand` with `robots: noindex, nofollow`. NOT linked from nav. Bookmark-only access for Winston + Collie (and future Claude sessions reading state).
**Why:** A public-facing brand page would compete for SEO with our actual content pages and confuse the audience (we're a directory + media outlet, not a design studio). Internal reference keeps decision-friction low: when a brand-level question arises, the answer is one URL away — no re-litigating colors / fonts / voice / icon names.
**Sections (lock-in):** Colors → Lighthouse Mark → Directory + Portal Icons → Icon System Rules → Full Icon Library → Typography → Tagline Bank → Voice (We sound like / We don't) → Positioning Pillars → Quick Links.
**Maintenance posture:** `/brand` is updated as Collie sends new designs. Memory rule `feedback_pal_brand_system.md` instructs future sessions to defer to `/brand` for any brand-level call.

### Marketing operations — living docs, not PDF deliverables
**Decision:** Translate Collie's "Trust → Habit → Conversion" launch plan PDF into 5 living markdown documents at `Port A Local/Marketing/`. Update them every Sunday. Fill the weekly dashboard in `Targets.md` Monday morning.
**Why:** PDFs are time-stamped artifacts. Marketing operations are continuous. Living files make the work navigable, the targets verifiable, and the captions reusable.
**Files:** README · Content Calendar (4 weeks Phase 1→2) · Caption Library (18 starter captions, 7 categories) · Outreach Tracker (press / businesses / orgs + outreach templates) · Targets (phase-gated goals + weekly funnel dashboard + explicit list of vanity metrics NOT chased).
**Paid-ad guardrail:** any spend requires Winston's explicit go on budget + creative.

### Email threading discipline — reply in-thread, keep subject intact
**Decision:** When Winston or Collie emails haveebot, reply within the existing thread. Do not start new conversations for follow-ups. Keep the subject line intact across the conversation — do not add thematic tags mid-thread.
**Trigger:** Winston flagged 2026-04-24: *"you can reply and communicate through emails Collie and I send, doesn't have to always be a new email thread."*
**Why:** Threading keeps the conversation history continuous on Winston + Collie's phones. The "Catching you up on PAL" thread accidentally drifted to a new subject mid-conversation; Winston flagged, rule saved.
**Memory:** `feedback_pal_email_threading.md`.

### Heritage #19 — Red Snapper Fleet shipped (commit `abcb095`)
**Decision:** Ship Heritage #19 with the thesis "adaptation, not dominance" — Port Aransas was never the Gulf's red snapper capital (Pensacola was), but it adapted across a century of fleet, regulatory, and economic change. 10 sections, ~2,800 words, 20 source citations.
**Why:** The most honest version of the story is also the most defensible. Claiming Port A was the snapper hub is overclaiming and easy to falsify; framing it as adaptation gets at the actual local truth and avoids Chamber-of-Commerce framing. Aligns with anti-Bureau editorial posture without crossing into Dispatch territory.
**Sources locked:** NOAA Fisheries history, Solís et al. (Marine Resource Economics 2014, IFQ consolidation), Gulf Council Reef Fish Amendment 26, *CCA v. U.S. Dept. of Commerce* (5th Cir.), TSHA Handbook entries, PAPHA, South Jetty (Owens / Horner / Schoolcraft on the record), UPI 1989 TED-blockade reporting, Houston Public Media Harvey-recovery coverage.

### Don't manufacture Dispatch angles — wait for the brief
**Decision:** Dispatch story ideas come from Winston's actual briefs (the email or chat message that names the topic + news hook), not from pattern-matching whatever Heritage piece I just shipped. Do not "park" research from misdirected angles for a future Dispatch.
**Trigger:** I drove a "Two Landlord Systems" thesis correlating Heritage #19 (red snapper IFQ) with a hypothetical Dispatch piece, after Winston had actually emailed about PA Property Taxes (a separate topic, in a separate thread that I'd missed). Spawned a research agent on the wrong topic. Winston flagged: *"it does not go into the parking lot. we do not need a made up dispatch story about snapper."*
**Recovery:** Background agent killed. Output dropped (not archived). Correction email sent to the mis-targeted thread. New rule saved: `feedback_pal_no_manufactured_dispatch.md`. Sister rule: when the inbox has unread mail from Winston or Collie, READ IT FIRST before making inferences about the current task.

### PA Property Taxes Dispatch — facts-only research before angle lock
**Decision:** Run baseline fact-gathering on PAISD recapture status, NCAD trendlines, 89th Lege bills, and South Jetty archive coverage — strictly raw numbers + citations, no analytical synthesis. Hold angle selection until Winston (news hook) and Collie (local prompting) weigh in.
**Why:** Winston's concern: research can steer the angle even when "neutral." Mitigation: scope the research agent tightly to facts-only, deliver as data not narrative. Collie's local instinct stays unsteered. Avoids replaying the snapper rabbit hole.
**Outcome:** Fact base committed (commit `264fa1e`) at `Port A Local/Dispatch Research/PA Property Tax — Fact Base 2026-04-24.md`. Headline finding: PAISD IS a Chapter 49 recapture donor, $16.3M (2019-20) → $28.8M (2023-24). Superintendent McKinney on record (South Jetty, Oct 2022): *"The majority of the taxes you pay to PAISD are not actually used for the education of children enrolled here in Port Aransas ISD."* 89th Lege passed a $10B relief package but Chapter 49 structural reform did NOT pass. New vault folder `Dispatch Research/` parallels existing `Heritage Research/`.
