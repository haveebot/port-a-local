# Port A Local — Roadmap & To-Do
_Living document. Updated each session._
_Last updated: 2026-04-22 evening (OG round 5 + Heritage #18 + Dispatch tip form + featured swap)_

---

## Infrastructure — Status

### ✅ Live
- Domain: https://theportalocal.com (200 OK, HTTPS)
- Google Workspace: admin@, hello@, bookings@ all receive mail (MX: smtp.google.com)
- Stripe: LIVE (`acct_1TLv2G…`) under admin@theportalocal.com, charges + payouts enabled, live keys in Vercel
- Resend: live, bookings@theportalocal.com sender, Know This Place admin emails wired
- Twilio: account active, $44 balance, +1 (361) 428-1706 SMS+Voice
- A2P 10DLC Brand: **APPROVED** (BNd603…)
- GSC: domain verified via TXT, sitemap submitted (175+ URLs)
- Brand: Lighthouse mark + full-site saturation + shared OG/email helpers
- Social: FB profile + FB banner routes shipped (`/social/*`)
- Print: branded QR poster route (`/print/qr/[slug]`) — home + sandfest

### ⏳ Waiting
- [ ] **A2P 10DLC Campaign — RESUBMITTED 2026-04-22**. First submission failed 2026-04-22 on error 30923 (MESSAGE_FLOW: consent-as-required-condition). Root cause: forms bundled SMS consent into submit action. **Fix shipped (commit 132b312):** separate unchecked-by-default SMS opt-in checkbox on all three forms; shared `sendConsumerSms` helper gates consumer SMS on `smsConsent === true`; customer SMS copy now includes "Reply STOP to opt out." on every message. **Twilio-side:** account + messaging service renamed, failed Usa2p deleted, new Usa2p submitted with rewritten MessageFlow + 5 fresh consumer-facing sample messages. Brand remains APPROVED (`BCIXLIA`). Status: IN_PROGRESS at TCR. Messaging service code already prefers `MessagingServiceSid` when env var is set — auto-flips on approval. Expected timeline 1–5 business days.

### Decided — no migration, no GBP (2026-04-13)
- **GitHub:** PAL stays on `haveebot/port-a-local`. No org migration.
- **Vercel:** PAL stays on `haveebots-projects` team. Avoids Pro plan cost with zero functional benefit at current scale.
- **Google Business Profile:** skipped. PAL is a media/directory platform, not a storefront.
- **Sage Em is the opposite** — full company-only separation (`sageem` org + `sageem` team).

---

## Backlog (prioritized for next session)

### Legal — one-time attorney review (HIGHEST — unblocks marketplace liability thesis)
- [ ] **Engage a Texas business attorney** for one-time review + drafting. Deliverables:
  - **Platform T&C** that explicitly position PAL as a marketplace (not the service provider), customer's service contract is with the vendor, PAL disclaims liability for vendor actions, customer assumes risk of the rental.
  - **Vendor agreement (one-pager)** per vendor — independent contractor, carries insurance, indemnifies PAL, honors the discount + service commitments.
  - **Indemnification + assumption-of-risk** language that holds up under Texas doctrine (fair notice, express negligence test).
- **Why:** without this paperwork, a plaintiff's lawyer can argue PAL operated as the service provider — not a marketplace — and a judge may agree. Every rental, every maintenance dispatch, every beach setup has tail risk. With the paperwork, the vendor-liability thesis holds cleanly (same model as Airbnb, Thumbtack, HomeAdvisor).
- **Cost estimate:** $500–1,500 one-time. Cheap vs. one slip-and-sue. Budget lives under Palm Family Ventures, LLC.
- **Blocker removes:** cart marketplace operating without signed vendor agreements, current "vetted local companies" marketing claim (needs insurance verification to be defensible).
- **Scope exclusion:** Claude does not draft this. Templates fail Texas indemnification doctrine and create false confidence. Attorney-only.

### Cart Portal Marketplace (revenue blocking — after legal)
- [ ] **Collect 12 missing vendor emails** (Winston task). Call or web-scrape: Coastal Ed's, Port A Beach Buggies, Texas Red, First Stop, Tarpon Carts, Bron's, Kacie's, Island Outfitters, Gulf Carts, Ash Cart, Port A Carts, PA Golf Cart Rental. Drop into `src/data/cart-vendors.ts` → live on next deploy.
- [ ] **Click-to-claim mechanism** — needs Vercel KV (free tier). Unique claim links per vendor per lead. First click wins. Replaces manual reply-based claiming.
- [ ] **SMS blast channel** — code ready; flips on when A2P 10DLC campaign clears TCR. All 20 vendor phone numbers already in data file.
- [ ] **Automated pre-arrival notification** — email + SMS to customer 24–48hrs before pickup with vendor name + pickup address + hours.
- [ ] **Automated return reminder** — email + SMS to customer day before return date.
- [ ] **Auto-refund for unclaimed leads** — cron or manual check: if lead unclaimed 3–4 days before pickup → Stripe refund + customer notification.

### Gully + Claude (Ask Gully AI search)
- [ ] **Create Anthropic API account** under admin@theportalocal.com, Palm Family Ventures card, $25/mo cap. Get API key → Vercel env var `ANTHROPIC_API_KEY`.
- [ ] **Build "Ask Gully" augmented search** (Option A). Fuse returns matches as usual; if query is a question, Claude Haiku synthesizes a short answer from top-N matches with inline citations. Single addition to existing Gully UX. Prompt-cached system prompt + corpus for cost efficiency.

### Content
- [ ] **Heritage expansion batch 2** — candidates: Red Snapper Fleet, Vietnamese shrimping community, Aransas NWR whooping cranes, Harbor Island oil era, Port A ISD history, Pat Magee's Surf Shop (if it earns its own piece vs. Surfing piece).
- [ ] **Dispatch #2 — "The Landlord Nobody Voted For"** — shopping center acquisition + rent-doubling pattern. Needs tenant sourcing. **Tim Parke** (2026 Sandfest president, Lone Star Taste) is a potential source *and* a cart-portal vendor relationship — dual relationship, handle carefully.

### Infrastructure / Polish
- [ ] **A2P campaign approval re-check** (waiting on TCR — passive). Re-verify status next session.
- [ ] **Classifieds / Want Board** — needs Supabase (still deferred).
- [x] ~~**Per-business OG images** — 130+ business detail pages~~ **DONE 2026-04-22 (round 5).** Per-business + per-category + per-guide OG all shipped via brandedOG.
- [x] ~~**FeaturedSpots audit**~~ **DONE 2026-04-22.** Swapped Red Dragon Pirate Ship → Aloha Açaí.

### Next Session — explicit asks from Winston (2026-04-22)
- [ ] **Configure haveebot email for direct Collie comms.** Claude should be able to read Collie's design emails directly (not relayed through Winston). Keep PAL infrastructure accounts on admin@ per existing rule — this is strictly a collaboration channel. Cross-checks memory rule `feedback_pal_vs_sageem_accounts.md` — flag with Winston before building.
- [ ] **Full Collie update briefing.** Prepare a comprehensive document at `Port A Local/Collie Update — 2026-04-22.md` covering everything that shipped since her Round 1 sign-off (4/21) through 4/22 end-of-day. Self-contained prompt ready at `Port A Local/Next Session — Collie Update Prompt.md` — paste into next Claude session to execute.

### Brand — next surfaces before locking lockup
- [ ] Twitter/X profile + banner
- [ ] Instagram profile + highlight covers
- [ ] Per-business OG (see above)
- [ ] Merch mock (sticker, tee, or cap)
- After 3–4 surfaces, decide: one canonical lockup, or 2–3 approved configurations.

### Icon rollout — ALL ROUNDS LIVE (2026-04-22)
**55 silhouettes across 4 rounds — full-site emoji eradication complete.** Winston authorized skipping the Collie-review step between rounds: "assume Collie signed off, let's swap all of them out. if she makes changes we will do it again." Iteration cost is one-line SVG swap in `PortalIcon.tsx` with zero call-site impact.

- **Round 1 (2026-04-21, commit `1770fe0`):** 9 Collie-approved directory + portal silhouettes (eat/drink/stay/do/fish/shop + beach/maintenance/cart).
- **Round 2 (2026-04-22, commit `35ca1b3`):** 26 silhouettes — Tier 1 nav (11), Tier 2 Gully chips (9), Tier 3 Essentials sections (6). Free reuses for Fishing Report + Where to Stay.
- **Round 3 (2026-04-22, commit `f625efb`):** 7 Tier 4 decoratives + `EmojiIcon` helper for data-driven renders with graceful fallback.
- **Round 4 (2026-04-22, commit `c4d63e2`):** 13 UI affordance silhouettes + 21 emoji aliases + `brandedOG` accepts `badgeIcon` prop; all 19 OG share cards now render inline SVG.

**Still emoji (deliberate):**
- SMS body text (plain text, no SVG support)
- Email subject lines + some email HTML (mixed client support for inline SVG)
- Event data emojis with no silhouette — fall back gracefully via EmojiIcon

**Next step:** Collie reviews on live site, flags any icon that reads poorly, swap SVG in `PortalIcon.tsx`.

### Future — blocked or deferred
- [ ] **Gully V2** — community tagging with gamification (badges, Verified Local) — needs Supabase
- [ ] **Buy/Sell / Classifieds** — Fox Yacht Sales as anchor, user-posted listings, pay to feature — Supabase
- [ ] **Realty** — build out category when ready
- [ ] **Merch / Shop** — Shopify Storefront API, `/shop` page, Palm Republic tie-in
- [ ] **Maintenance full tiered dispatch** — After Hours Emergency tier ($75–100, 24/7), weekend logic, revenue split with John, volume dashboard
- [ ] **PAL token symbol** (parked 2026-04-14) — single-glyph brand mark (like ₿ for Bitcoin). See `parking_pal_token_symbol.md` in workspace memory.

---

## Completed ✅

### Session — April 22, 2026 (13 commits — morning + afternoon + evening)
- **A2P 10DLC failure → fix → resubmit** (morning). Forms decoupled SMS consent from submission via separate unchecked-by-default opt-in checkbox; shared `src/lib/twilioSms.ts` gates consumer SMS on `smsConsent`; customer SMS now on all 3 revenue flows (was maintenance-only); STOP opt-out appended to every customer message. Twilio account + messaging service renamed off Twilio defaults. New Usa2p compliance record submitted with rewritten MessageFlow. Commit `132b312`.
- **3 new vendor listings from inbound requests** (morning). Portable Detail Service (Miguel Cantu — mobile RV detailing + undercoating since 1994) → `/services`. Salty Beach Babes (boutique at 345 N Alister St F1) → `/shop` (phone still blank). Barefoot Beans (coffee shop at 345 N Alister St E1, organic/fair-trade) → `/eat`. Aloha Açaí duplicate caught + removed (already live under slug `aloha-acai`). Commit `e0c5a73`.
- **Miguel routing through /maintenance dropdown** (morning). Added "Detailing / Wash" and "RV Undercoating" to `SERVICE_TYPES`; John Brown dispatches, John calls Miguel. Zero new infra.
- **Email signature standardization** (morning). All 6 transactional email templates now sign off with `— The Port A Local` (entity + person voice, no "team"). Rule saved to workspace memory (`feedback_pal_email_signature.md`).
- **Email Automation spec drafted** (morning). `Port A Local/Email Automation.md` — Layer 1 filter rules + labels + canned responses + vacation responders for admin@ / hello@ / bookings@, copy-paste-ready for Gmail UI. Layer 2 (server-side inbound parsing) flagged as future cart-marketplace work.
- **Icon rollout Round 2 — Tier 1 nav + Tier 2 Gully chips + Tier 3 Essentials sections** (afternoon, commit `35ca1b3`). 26 new silhouettes in Collie's style, wired site-wide. Nav dropdowns (desktop + mobile), Gully popularChips, Essentials section headers.
- **Icon rollout Round 3 — Tier 4 decorative + EmojiIcon helper** (afternoon, commit `f625efb`). 7 new silhouettes (sunrise, island, palm, urgent, trophy, art, calendar) + EmojiIcon helper for data-driven renders with graceful emoji fallback.
- **Icon rollout Round 4 — Full-site eradication + OG refactor + aliasing** (afternoon, commit `c4d63e2`, 42 files). 13 new silhouettes + 21 emoji aliases + `brandedOG` accepts `badgeIcon`; all 19 OG share cards now render inline SVG. Footer, GullyPalette, services/rent/beach/maintenance pages, photos, my-trip, admin, archives, KnowThisPlace, CategoryPage, IslandConditions, fishing-report, where-to-stay, history page — all swept.
- **Featured Spots rebalance** (evening, commit `6f8651f`). Swapped Red Dragon Pirate Ship → Aloha Açaí on the homepage 9 tiles. Rebalances "do" (3→2) and "eat" (2→3).
- **Heritage #18 — "Pat Magee's Long Ride"** (evening, commit `418b694`). 9 min read, ~2,200 words. 1967 dune-line shack → 1969 Beach and Station shop → Dewey Weber team → Robert August/Endless Summer orbit → dozen Pat Magee's across Texas → 2005 retirement + Texas Surf Museum co-founding with Brad Lomax. Full public-record version; personal angle held for future. Total Heritage now 23.
- **Dispatch tip form** (evening, commit `0dd95e1`). Triggered by Julie Janda empty-mailto incident. New `/api/dispatch/tip` route + inline form on `/dispatch` with required textarea, optional name + contact, Resend email to admin@ + hello@. Blank sends blocked client + server side.
- **OG round 5 — per-business + per-category + per-guide share cards** (evening, commit `2add0e4`). Closes the last OG gap. 150+ routes now have unique, route-specific previews with the Lighthouse lockup and page identity.

### Session — April 21, 2026 evening (Collie round 1 — 1 commit on top of the dumptruck commit)
- **PortalIcon component** — 9 single-color silhouette SVGs matching Collie's refs (eat, drink, stay, do, fish, shop, beach, maintenance, cart). All `currentColor`, coral on navy bg / navy on white bg per Collie's rule.
- **Wired site-wide:** nav dropdowns + portal pills (desktop + mobile), homepage category tiles + book-direct cards, category pages, CategoryCard, Footer, rent/beach/maintenance page headers + success states, services page, business detail breadcrumb + "More in", map filter chips, essentials (cart + beach).
- **Copy fixes:** carts "discount off" spacing; maintenance subheader ("the most trusted maintenance team in Port Aransas"); Surf Report URL → Horace Caldwell Pier; Dispatch tagline on 5 surfaces ("Editorial…" → "Features, analysis and reporting on the island as it is — not as it's advertised"); Dispatch #1 title ("The Two Port Aransases" → "Port Aransas — A Tale of Two Islands", slug preserved); Dispatch #1 section caps ("The Frame", "The Historical Pattern").
- **Favicon** — white-monochrome lighthouse on navy.
- **Sticky header** — removed pre-scroll gradient overlay on homepage.

### Session — April 16, 2026 (1 commit)
- Printable QR poster pattern — letter-size branded posters at `/print/qr/[slug]`. Lighthouse-in-center QR, error correction H, navy-on-sand. Two targets live: `home`, `sandfest`. Pattern extensible to per-portal + per-heritage posters.

### Session — April 15, 2026 (10 commits)
- **PUD listing scrub** — removed Cinnamon Shore from directory + Where to Stay; Lisabella's + editorial protected as exceptions. Rule enforced on sight for any future PUD.
- **Cart portal: MARKETPLACE PIVOT** — from preferred-vendor/delivery to competitive marketplace/pickup. $10/day reservation, 5-day minimum, 20-vendor blast, minimum $20 vendor discount, 3–4 day no-vendor auto-refund rule.
- **Maintenance urgency-dispatch coupling** — only Emergency triggers $20 Priority Dispatch; Urgent (48hr) stays free Standard; SLA tightened to 4hr; after-8PM Emergency disabled.
- **Archives surfaced** — nav Discover dropdown, footer, cross-links on Heritage/Photos pages.
- **Heritage #22** — "The Card Table That Built Texas Sandfest" for festival weekend; Lisa Shelton honored in Section 6; Josh Abbott fix (Sunday closing, not Saturday).
- **First FB assets** — profile (lighthouse) + banner (1939 "Straddle the Rail" causeway sign). Source photo committed to `public/archives/`.
- Internal email routing: all 3 portals → admin@theportalocal.com.

### Session — April 14, 2026 (6 commits)
- **Port A Dispatch launches** — new editorial section `/dispatch`, separate from Heritage. NewsArticle JSON-LD, sig seal footer.
- **Dispatch #1 "The Two Port Aransases"** — 2,050-word launch piece. Tourism Bureau vs. in-town reality. Fully sourced.
- **Editorial workflow locked** — 6-step pattern captured in workspace memory (`feedback_pal_dispatch_workflow.md`).
- **Lighthouse mark** — inspired by the Lydia Ann Light. One component, four detail levels + monochrome.
- **Full-site brand saturation** — every surface carries PAL identity: favicon, Apple touch icon, PWA manifest, JSON-LD (Org + WebSite), metadataBase + title template, 17+ route OG cards via shared `brandedOG`, branded transactional emails via shared `emailLayout`, nav lighthouse, footer lockup + coordinates strip, 404 page, 620px hero watermark.
- **Anti-Bureau posture** established.

### Session — April 13, 2026 (10 commits)
- **Domain switched** to theportalocal.com (primary). Old Vercel domain redirects.
- **Google Workspace live** — admin@, hello@, bookings@.
- **Stripe live** — `acct_1TLv2G…`, charges + payouts enabled, live keys in Vercel.
- **Resend live** — bookings@theportalocal.com sender; Know This Place admin emails wired.
- **Twilio** — A2P 10DLC Brand APPROVED; MessagingServiceSid preferred in code.
- **Heritage batch 1** — 4 new stories (Tarpon Inn, Jetties, Naming, Surfing) → total 21.
- **Privacy + Terms pages** — Stripe/Twilio compliance.
- **Decisions locked** — GBP skipped; PAL stays on haveebot + haveebots-projects (no migration).

### Session — April 12, 2026 (MONSTER — 30 commits)
- Port A Heritage rename + 6 new stories (17 total)
- Gully: unified search, tags, menus, "Just Gully It" branding, recent searches
- Know This Place anonymous tag suggestions + admin review queue
- Nav refactor: Explore + Discover dropdowns, uniform portal pills
- Curated Guides: 10 auto-generated
- Trip Planner (My Trip, localStorage)
- Interactive Map: 127 geocoded businesses
- Island Pulse, Island Essentials, Events & Happenings, Fishing Report, Where to Stay
- Historical Archives (31 public domain photos)
- SEO structured data (JSON-LD), heritage OG images, mobile fixes

### Session — April 10-11, 2026
- Domain purchased: theportalocal.com
- Gully branded; Cmd+K palette; popular chips
- 11 Island Stories published
- `/rent` + `/beach` portals, homepage portals section, footer rebuild
- SEO meta tags across all pages
- Repo + vault cleanup

### Session — April 4, 2026
- Directory live — 142 businesses, 6 categories
- `/maintenance` portal — John Brown via email + SMS
- Vercel deploy, Google Sheet backup, Obsidian vault
