# Port A Local — Roadmap & To-Do
_Living document. Updated each session._
_Last updated: 2026-04-21_

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
- [ ] **A2P 10DLC Campaign** — IN_PROGRESS at TCR (low-volume mixed, no failure reason). Maintenance SMS code uses `MessagingServiceSid` when env var is set — auto-flips on approval. *Re-verify status this session.*

### Decided — no migration, no GBP (2026-04-13)
- **GitHub:** PAL stays on `haveebot/port-a-local`. No org migration.
- **Vercel:** PAL stays on `haveebots-projects` team. Avoids Pro plan cost with zero functional benefit at current scale.
- **Google Business Profile:** skipped. PAL is a media/directory platform, not a storefront.
- **Sage Em is the opposite** — full company-only separation (`sageem` org + `sageem` team).

---

## Backlog (prioritized for next session)

### Cart Portal Marketplace (HIGHEST — revenue blocking)
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
- [ ] **A2P campaign approval re-check** (waiting on TCR — passive). Re-verify status today.
- [ ] **Classifieds / Want Board** — needs Supabase (still deferred).
- [ ] **Per-business OG images** — 130+ business detail pages currently fall back to root OG.
- [ ] **FeaturedSpots audit** — review which businesses are currently featured; confirm the mix.

### Brand — next surfaces before locking lockup
- [ ] Twitter/X profile + banner
- [ ] Instagram profile + highlight covers
- [ ] Per-business OG (see above)
- [ ] Merch mock (sticker, tee, or cap)
- After 3–4 surfaces, decide: one canonical lockup, or 2–3 approved configurations.

### Future — blocked or deferred
- [ ] **Gully V2** — community tagging with gamification (badges, Verified Local) — needs Supabase
- [ ] **Buy/Sell / Classifieds** — Fox Yacht Sales as anchor, user-posted listings, pay to feature — Supabase
- [ ] **Realty** — build out category when ready
- [ ] **Merch / Shop** — Shopify Storefront API, `/shop` page, Palm Republic tie-in
- [ ] **Maintenance full tiered dispatch** — After Hours Emergency tier ($75–100, 24/7), weekend logic, revenue split with John, volume dashboard
- [ ] **PAL token symbol** (parked 2026-04-14) — single-glyph brand mark (like ₿ for Bitcoin). See `parking_pal_token_symbol.md` in workspace memory.

---

## Completed ✅

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
