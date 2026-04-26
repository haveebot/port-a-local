---
name: Port A Local — current status and open items
description: Where PA Local stands, what's built, what's next, key decisions
type: project
originSessionId: 35a4d1eb-635d-424f-a8eb-a22e66a74d90
---
**Port A Local** is a local business directory + services platform for Port Aransas, TX. Winston is PM, Claude builds and maintains everything. Live at port-a-local.vercel.app. Repo: haveebot/port-a-local. Owned by Palm Family Ventures, LLC (never public-facing).

**Operating model:** Winston makes product decisions and handles local relationships. Claude builds, maintains, deploys, and organizes everything else. Goal is a lean two-person operation.

## Current State (as of 2026-04-26) — PAL Delivery (NEW VERTICAL, LIVE WITH REAL $$)

- **PAL Delivery LIVE — `/deliver`.** Real-time food-delivery marketplace for Port Aransas. Customer orders → Stripe pays → on-duty runners get pinged → first to claim wins → runner picks up + drops off → PAL auto-transfers payout to runner's connected Stripe account. First real-money order shipped 2026-04-25 ($28.87 from DQ). Two restaurants live: Crazy Cajun + Dairy Queen Port A. **Full feature spec: `Port A Local/Features/Delivery — Spec.md` — read this before touching delivery code.**
- **Stripe Connect Express LIVE for runners.** Auto-onboarding via `/api/deliver/driver/connect/start` (creates `accounts.create` Express account + `accountLinks.create` for Stripe-hosted onboarding form). On delivery → `stripe.transfers.create` moves funds from PAL balance → runner's Connect balance. Default daily auto-payouts to runner's bank (Stripe default; first payout has 7–14 day fraud hold for new accounts, then daily rolling). Idempotency table `delivery_driver_transfers` blocks duplicate payouts per order. Stripe Issuing deferred 30+ days (need Connect volume history first).
- **Cookie-session runner auth.** `pal_runner` cookie (httpOnly, sameSite=lax, 30-day) replaces token-in-URL for all runner-facing surfaces. Magic link on first sign-in (`/api/deliver/driver/login?t=TOKEN&next=...`) trades token for cookie. Token-in-URL still works as fallback for self-recovery (`/deliver/driver/lookup` emails fresh magic link). "What would Uber do" framing — frictionless, bookmark-able, no token visible after first tap.
- **Runner hub at `/deliver/driver` (NEW 2026-04-25, expanded 2026-04-26).** Cookie-gated client component `RunnerHub.tsx` with 20s polling. Big on-duty toggle (auto-off in 4h), payouts setup nudge if Connect not done, 3-stat earnings panel (today/7-day/available), in-progress orders, available-now feed with inline claim, sign-out. **NEW 2026-04-26: "View Stripe payouts dashboard →" button** appears once payouts are enabled — opens runner's Express dashboard via `stripe.accounts.createLoginLink` (one-time URL, single-use, opens in new tab so PAL session stays put). From there runners see balance, payout schedule, instant-payout option (1.5% fee), bank info.
- **Runner onboarding pipeline LIVE.** `/deliver/runner` application form → DB row in `delivery_drivers` (status=`pending`) → duplicate-phone guard returns 409 with state-aware message (`already-active`/`pending-review`/`previously-rejected`) → applicant confirmation email + admin email with HMAC-signed magic links (`ADMIN_APPROVAL_SECRET`) → Winston taps Approve → status → `active` → welcome email → cookie session → done.
- **Customer comms: belt-and-suspenders (SMS + email) on every transition.** Customer gets confirmation email at paid + picked-up email + delivered email. SMS gated on consent checkbox + A2P 10DLC clearance (best-effort pre-clearance). Admin email moved from order-create to post-payment-success — kills phantom-order admin spam from abandoned carts.
- **Anti-spam email tuning.** Plain ASCII subjects (no emoji), `X-Entity-Ref-ID: pal-deliver-dispatch` header, `reply_to: hello@theportalocal.com`. Helps Gmail bucket as transactional. Domain already verified in Resend (SPF/DKIM/DMARC clean).
- **Wheelhouse mirror.** Every order lifecycle event posts an `update` (or `decision` for delivered) message into pinned "PAL Deliveries — order log" thread (tag: `deliveries`). Activity ticker surfaces them automatically.
- **Runner-side terminal-state UX (NEW 2026-04-26).** Order detail page (`DriverActions.tsx`) shows "← Back to runner home" button on delivered, canceled/refunded, and already-claimed-by-another-runner states. Delivered copy clarifies "Payout hits your bank in 1-2 business days. Stripe handles it automatically."
- **Pricing constants:** `DELIVERY_FEE_CENTS=500`, `SERVICE_FEE_CENTS=200`, `TAX_RATE=0.0825`, restaurant `markupPct=45%` (resort-town pricing). Splits: runner gets 50% markup + 50% delivery + 100% tip. PAL keeps 50% markup + 50% delivery + 100% service fee + tax.
- **PAL hard cutoff at 21:00 Central** for accepting orders (regardless of restaurant hours). Each restaurant has independent hours (Crazy Cajun closed Mondays, dinner-only weekdays, weekend 12pm; DQ daily 10am-9pm). `getRestaurantById()` resolves by id (not slug — DQ has id="dq-port-a" slug="dairy-queen", was the source of a bug 2026-04-25).
- **`getDeliverStripeKey()` defensive `.trim()`.** A trailing newline in `STRIPE_SECRET_KEY` env var burned a session 2026-04-25 (`ERR_INVALID_CHAR` 500s). Now always trimmed. Set this pattern as the default for any Stripe key reads.
- **Runner pool: 1 (Winston).** Onboarding pipeline + Stripe Connect onboarding both validated end-to-end with real bank. Need humans next.

## Current State (as of 2026-04-25)

- **The Wheelhouse — internal ops dashboard (NEW 2026-04-25, LIVE).** Cookie-gated for humans + token-gated for agents at `/wheelhouse`. Four interlocking systems: (1) threads/messages with state machine, (2) 24h activity ticker (`ActivityFeed.tsx`, default-collapsed, summary line shows freshest event inline), (3) PalStats public-traffic card fed by Vercel Web Analytics Drain → `/api/wheelhouse/analytics-ingest` (HMAC-SHA1 verified) → `wheelhouse_analytics_events` table (self-bootstraps schema on first ingest), (4) PAL Pulse — Vercel Cron at 8am CT generates a markdown digest combining internal + external + per-human-awaiting and posts as an `update` message into a pinned "PAL Pulse" thread. Drain destination MUST use apex URL (`theportalocal.com`, not `www`) — the www→apex 307 redirect breaks signed payloads. **Full architecture doc: `Port A Local/Features/Wheelhouse Architecture.md`** — read this before touching Wheelhouse code.
- **Events architecture: per-event hub pages (NEW 2026-04-25)** — `src/data/events.ts` + `src/data/event-content.ts` + `src/app/events/[slug]/page.tsx` mirroring the dispatches pattern. Events index entries opt into a detail page via the `detailSlug` field; without it they stay as a one-line month entry. EventSchema (schema.org/Event) added to StructuredData.tsx for Google event rich results. Per-event branded OG card. Sitemap includes event slugs at priority 0.85, daily change frequency.
- **EventCountdown** (live-updating client component): days/hr/min/sec; flips to "Happening now" with pulsing dot mid-event; "Wrapped" after end. Used in event hero + homepage banner + events index.
- **FeaturedEventBanner on homepage** (between Hero and Gully) — auto-picks soonest featured event; returns null off-season.
- **Coming Up Next tile on /events index** — surfaces soonest event from both events.ts AND inline monthly events (`nextDateISO` field added to inline events for sorting). Detail-page events take precedence on slug match.
- **EventOrganizerClaim CTA** on every event page — collapsed → expanded form with name/email/role(7 options)/message → POST to `/api/events/claim` (mirrors dispatch tip pattern, Resend to admin@ + hello@). Operationalizes "do it anyway, force them to come to us" — organizer always has a frictionless professional channel.
- **Tournament-coverage stack (NEW 2026-04-25, LIVE)** — `src/data/tournament-results.ts` data layer + 8 components in `src/components/tournament/`:
  - `LeaderboardTable` — billfish.com-style per-division table; desktop tabular + mobile stacked; top-5 with show-all expand; coral row highlight + #1 marker for leader; "Live" pulsing dot; "Unofficial" amber badge; empty state until weigh-ins start
  - `DivisionsPanel` — clean grid card per division, scoring mode badge (Heaviest/Longest/Most Released), expandable rules
  - `CaptainSpotlight` — "boats to watch" card, photo slot, bio paragraphs, divisions, prior wins
  - `PiggyPerchHighlight` — special section for kids' contest, coral gradient, 4 award tiles
  - `TournamentRulesPanel` — editorial rules summary + prominent "Official rules →" CTA + per-division collapsibles + past-editions archive + crowd-source footer
  - `PastChampionsBoard` — grouped by year, per-entry source citations, crowd-source footer ("send us missing years")
  - `HistoricalPhotosShelf` — references existing archives.ts photo IDs (single source of truth, no duplication); per-photo caption/year override; "See full archive" links to /archives
  - `MilestonesPanel` — verified-facts grid (year/label/value/detail). Speculative records belong in crowd-source pipeline, not here.
  - `liveLog` extended with `kind: "weigh-in"` + structured `weighIn` field (renderer wires when needed)
- **Event-level reusable components (NEW 2026-04-25, LIVE):**
  - `CharityCallout` — purple-bordered card for events with a beneficiary; pull-quote leads, mission paragraph, stat strip, "About" + "Donate directly" actions, transparency note. Renders prominently after the lede when `event.charity` is set.
  - `MerchSpotlight` — for events where merch is part of the cultural footprint (TWAT shirts, future Sandfest gear, etc.). Editorial in tone — doesn't host or sell. Concert/Masters-merch framing. Optional storeUrl (omit when scarcity is the story); always has a "Send a sighting photo" CTA.
- **Deep Sea Roundup 2026 LIVE** — `/events/deep-sea-roundup-2026`. 90th annual, July 9–12, 2026. Lede anchored on Barney Farley + 1932 Tarpon Rodeo (Collie's grandfather). Full pre-event content. 6 divisions populated (Bay-Surf, Offshore, Flyfishing, Kayaking, Tarpon Release, Billfish Release). Special awards (Top Woman Angler, Junior). Piggy Perch with 4 award categories. Rules panel with universal + per-division. Past champions stub: 2024 (Adair Bates Bay GC, Charley Hicks Jr Offshore GC, Hannah Barnwell 1st Red Snapper) + foundational (1934 Dorothy Fair, 1932 North Millican). Historical photos (5) referenced from archives.ts: c.1900 Tarpon launches, c.1910 Ayres rowboat, 1911-24 Tarpon Inn, 1939 fish house, 2007 Tarpon Inn modern. Milestones panel (6 verified): 1932 inaugural, 1934 first woman champion, 1942-45 WWII pause, 2020 COVID pause, 90 editions by 2026, Boatmen Inc. continuous. Captains array empty (no outreach per strategy). Featured = true.
- **TWAT 2026 LIVE** — `/events/texas-women-anglers-tournament-2026`. Texas Women Anglers Tournament, women-only, family-run since 1984 by Pete Fox. Late August 2026 (tentative Aug 21-23 pending official). **4 divisions (Billfish/Dolphin/Tuna/Wahoo) — offshore-only.** Scoring: billfish points + 1 pt/lb across the other three. Charity callout for The Purple Door (formerly Women's Shelter of South Texas) — $130,000+ raised across 40+ years. Pete Fox HOF 2021; Fox family runs it today; Chris Fox operates Fox Yacht Sales (203 W Cotter Ave). **M.L. Walker Perpetual Trophy** named correctly as the top award. 7 past champions populated 2020-2025 (incl. 2020 Rebecca through-COVID + 2024 Instigator + 2024 Penny Slingerland Legacy Award). Spectacle copy includes harbor-circle / mariachi-on-the-bridge / multi-million-dollar-yacht / Mardi Gras-cheering / no-online-store-merch / "Especially for daughters" beats. Sip Yard scrubbed — reception venue intentionally agnostic. Host card removed — Fox Yacht Sales context lives in hostBlurb prose. Featured = true; takes over after DSR rolls past July 12.
- **Tournament Season hub LIVE (NEW 2026-04-25)** — `/events/tournament-season`. Local handle for PA's summer fishing-tournament cluster (May–November, 20+ tournaments, 4 marquee weekends July-August). Full hub page with hero, history blurb (1932→1984→2010s→today), 4 marquee tournament summary cards, at-a-glance comparison table (8 attribute rows), "How to plan a Tournament Season weekend" visitor-oriented practical, sources. Data layer at `src/data/tournament-season.ts` has 4 members: DSR (1932/Boatmen Inc.), Pachanga (~2018/Harte Research+PA Scholarship/40-boat-cap), Texas Legends Billfish (~2010/Triple Crown leg/$800K+ purse), TWAT (1984/Fox family/Purple Door). Pachanga + Texas Legends are stubs; full hubs come when same treatment as DSR/TWAT. `isInTournamentSeason(slug)` helper drives auto cross-link banner from each event detail page. /events index has coral callout banner above monthly timeline.
- **Spring Kite Festival 2026 hub LIVE** — `/events/spring-kite-festival-2026`. Built as Winston's "demo for Collie to pitch the Timms with" (haveebot uid 159, 2026-04-25). Page has hero with countdown, schedule (Fri/Sat/Sun), good-to-know grid (parking permit, no vendors, BYOK), day-of liveblog scaffold, FAQ, host card linking to Fly It Port A, calendar add (Google + .ics), Open in Maps, source citations. Ready for May 9. Awaiting Collie outreach to Jeremy & Courtney Timms.
- **Fly It Port A ownership corrected** — directory listing previously said "Pyle family has owned the shop since 1991" (stale — they sold in 2022). Now reflects: Yocum (1985 founder) → Pyles (1991, 31-year run) → Timms (July 2022). Tagline updated to call out the festival hosting.
- **Pitch ammo for Collie at vault path** — `Port A Local/Marketing/Outreach — Fly It Spring Kite Festival.md`. Three pitch versions (text, email, in-person), objection prep, day-of plan, post-yes next-steps. Outreach Tracker has a new 🟠 row for Fly It.
- **Tournament Coverage Spec at vault path** — `Port A Local/Features/Tournament Coverage — Spec.md`. Full strategic doc on the events-as-wedge play. Anchor: DSR. Templates to TWAT + Texas Legends.
- **Dispatch piece queued: "The Fishing Tournament That's Not Like the Others"** at `Port A Local/Dispatch Research/TWAT — Not Like the Others.md`. Full angle, structure, sources to verify, voice notes. Compares DSR / Texas Legends / TWAT side-by-side; thesis: most tournaments are about the prize, TWAT is about the after. Don't write yet — triggers: Texas Legends hub built, news hook, or Collie surfacing a Fox-family angle.
- **Dispatch idea queued for discussion: User-Submission Pipeline** at `Port A Local/Dispatch Research/User-Submitted Dispatch Pipeline — Idea.md`. Winston's idea (2026-04-25) — Dispatch articles all come from user recommendations: submit topic → auto-reply → we review → if used, email back the link. Doc captures Winston's framing + tradeoffs + 3 decisions to make first (hybrid vs. pure submission-driven; silent vs. acknowledged rejection; tracking infra level). Not building yet — discuss first. NOTE: built and live as of 2026-04-25 with Winston's three answers (hybrid · silent always · minimal tracking). See /dispatch.
- **Dispatch piece queued: "Women Fishing Take Over"** at `Port A Local/Dispatch Research/Women Fishing Take Over — Idea.md`. National-scale piece on the rise of women-only fishing tournaments with TWAT (1984) as the matriarch of the category. Different angle from the other queued TWAT-adjacent piece ("Not Like the Others" compares TWAT to *other Port A tournaments*; this one compares TWAT to *other women-only tournaments nationally*). Don't write yet — triggers: Port-A comparison piece ships first, full list of contemporary women-only tournaments compiled, possible Aly-Fox-via-Collie warm intro for genealogy section.
- **Fox family — confirmed deep Port A roots (private context, NEVER in published copy):** Pete Fox founded TWAT (1984) + Marine Surveyors + Fox Yacht Sales. Chris Fox runs Fox Yacht Sales today (203 W Cotter Ave, in PAL directory at /shop/fox-yacht-sales). **Shana Fox** (Chris's wife) is heavily involved in TWAT operations. Collie is dear friends with **Aly Fox** (Chris and Shana's daughter). Both relationships stay out of published copy per Winston (2026-04-25 session) but warm any future direct conversation with the family. Likely forward path for the TWAT page review: Winston → Collie → Aly + Shana.

## Current State (as of 2026-04-24)

- **Live Music** — new `/live-music` route. Weekly refresh workflow: Winston or Collie emails the South Jetty's "Live Music Tonight" photo to haveebot (subject `Live Music — Week of MMM DD`), Claude OCRs via vision, transcribes, ships. PA-only scope (mainland Corpus/Portland/Fulton filtered). Tonight hero + rest-of-week grid + upcoming. Venue cross-links to directory. Source photo archived at `Port A Local/Winston Inbox/<date>-uid<n>/`. ISR revalidate=3600. 25 acts / 7 PA venues in the first drop (2026-04-23).
- **Brand kit page** at `/brand` (noindex) — internal reference. Full palette + 4 lighthouse detail levels with download links + 9 directory icons (plug-and-play SVGs at `/icons/directory/`) + full 46-icon library + typography (Playfair Display + Inter) + 7-tagline bank + voice guide (sound like / don't) + positioning pillars + icon system rules.
- **Collie lighthouse v2 (2026-04-24)** — entire identity re-anchored on her design. `public/logos/lighthouse-{full,standard,simple,icon}.svg` + `src/components/brand/LighthouseMark.tsx` + `src/app/icon.svg` all rewritten. Propagates automatically through 17+ OG cards + 6 transactional emails + FB profile/banner + print QR posters + nav + footer + hero + 404 + Apple touch + PWA. Site now matches Collie's FB posts (drift resolved). Variants: dark (navy on light), light (sand on dark), coral (accent). Detail levels preserved.
- **Round 1 icons v2 (2026-04-24)** — 9 directory + portal icons (eat/drink/stay/do/fish/shop/beach/maintenance/cart) rewritten with Collie's Illustrator SVGs. Canva version had distortion; these are clean. `viewBox="0 0 128 128"` per-icon, `fill="currentColor"` inheritance preserved.
- **Marketing operations** at `Port A Local/Marketing/` (vault) — Content Calendar (4 weeks, Phase 1→2), Caption Library (18 starter captions in PAL voice), Outreach Tracker (press/businesses/orgs), Targets (phase-gated goals + weekly dashboard template), README. Built from Collie's Trust→Habit→Conversion launch plan (PDF archived 2026-04-24-uid156).
- **Photo-driven intake workflow PROVEN** — Winston→haveebot→Live Music, and Collie→haveebot→icons+lighthouse+brand+marketing. `scripts/haveebot_mail.py attachments <uid> [--out DIR]` is the durable tool. See `feedback_pal_photo_to_feature.md`.
- **Heritage #19 — The Red Snapper Fleet (shipped 2026-04-24, commit `abcb095`)** — 10 sections, ~2,800 words. Thesis: adaptation, not dominance. Pensacola was the Gulf snapper capital, not Port A. Arc: 1888 narrow-gauge → 1971 peak → 1989 TED blockade → 1990 51/49 split → 2007 IFQ → Amendment 40 → modern charter fleet. 20 source citations. Heritage total = **24 published pieces**.
- **PA Property Taxes Dispatch IN FLIGHT (2026-04-24)** — Winston brief (uid 157+158): hot topic, ties to Robin Hood / school tax. Facts-only research run, fact base committed (`264fa1e`) at `Port A Local/Dispatch Research/PA Property Tax — Fact Base 2026-04-24.md`. Headline: PAISD IS a Chapter 49 recapture donor, $16.3M (2019-20) → $28.8M (2023-24). Superintendent McKinney on the record (South Jetty Oct 2022): "The majority of the taxes you pay to PAISD are not actually used for the education of children enrolled here in Port Aransas ISD." 89th Lege passed $10B relief package but Chapter 49 reform did NOT pass. **Awaiting:** Winston news-hook + Collie local prompting before angle lock (grievance / explainer / anchored-to-a-person all viable). New `Port A Local/Dispatch Research/` vault folder parallels `Heritage Research/`.
- **Email threading discipline (saved 2026-04-24)** — reply in-thread by default, keep subject line intact across replies, don't start new threads for follow-ups. See `feedback_pal_email_threading.md`.
- **Don't manufacture Dispatch angles (saved 2026-04-24)** — Dispatch comes from Winston's actual briefs, not from pattern-matching whatever Heritage piece I just shipped. Don't park research from misdirected angles. When inbox has unread mail, read it FIRST before inferring the current task. See `feedback_pal_no_manufactured_dispatch.md`. (Triggered by a snapper-Dispatch wrong-turn this session — corrected via TaskStop + correction email.)

## Current State (as of 2026-04-15)

- **140+ businesses, 6 directory categories** (Eat, Drink, Stay, Do, Fish, Shop)
- **3 revenue portals** live: `/rent`, `/beach`, `/maintenance`
- **Services page** built out — portal callouts at top, directory listings below
- **Gully** — "Just Gully It" branded search engine. Unified Fuse.js index searches 140+ businesses (tags, menus, descriptions) + 21 heritage stories + dispatches. Cmd+K palette on every page, recent searches (localStorage), popular chips. Dedicated homepage section. Nav search pill. ~405 menu items indexed.
- **Port A Heritage** — 22 published long-form heritage pieces, complete editorial content layer. No other website covers this content. First-ever organized digital history of Port Aransas. (Titles 1–17 listed below; 4 added after 2026-04-12; **#22 "The Card Table That Built Texas Sandfest" added 2026-04-15** — verify from `src/data/stories.ts` when referencing specific titles.)
- **Port A Dispatch** (NEW 2026-04-14) — standalone editorial/journalism section at `/dispatch`. Distinct from Heritage (preserved history). Current-events analysis, investigation, opinion. NewsArticle JSON-LD schema, dated bylines, signature seal footer on each piece. First piece live: **"The Two Port Aransases"** — Tourism Bureau vs. in-town economic reality; Sonic closure, Cinnamon Shore/Palmilla/Sunflower Beach as 30A template (Mark Schnell), sales tax vs HOT tax divergence, PAISD flat enrollment. 2,050 words, fully sourced. See `feedback_pal_dispatch_workflow.md` for the 6-step editorial pattern.
- **Full brand system (NEW 2026-04-14)** — official **Lighthouse mark** (inspired by the Lydia Ann) as PAL identity. One `LighthouseMark` component with 4 detail levels:
  - `full` — beam rays, finial, windows, 3-panel shading. Hero, OG, watermark (128px+).
  - `standard` — default. Nav, dispatch footer, 40–96px.
  - `simple` — flat silhouette + coral light. Print, mobile (32–48px).
  - `icon` — pure silhouette. Favicon, buttons, inline (12–32px).
  - `monochrome` prop for single-ink prints / merch when needed.
  - Static SVGs at `public/logos/lighthouse-{full,standard,simple,icon}.svg`.
- **Full-site brand saturation (NEW 2026-04-14)** — every surface carries PAL identity:
  - Favicon (icon.svg) + Apple touch icon (apple-icon.tsx PNG)
  - Organization JSON-LD + WebSite JSON-LD in root layout (Google logo in knowledge panel)
  - PWA manifest (standalone, PAL icons, navy theme, "Add to Home Screen")
  - metadataBase + title template `%s | Port A Local`, canonical URLs, themeColor meta
  - Homepage hero: 620px lighthouse watermark + 14px icon in badge + coordinates
  - Footer: lighthouse lockup, 420px corner watermark, coordinates masthead strip (27°50′N · 97°03′W · Mustang Island · Est. 2026 · Palm Family Ventures, LLC)
  - Nav: lighthouse beside wordmark on every page, subtle hover rotation
  - 404 page: 80px foreground lighthouse + 560px watermark, "Off the Chart", Gully It CTA
  - **OG share cards on 17+ routes** via shared `brandedOG` helper (`src/lib/brandedOG.tsx`): home, dispatch index/article, heritage index/article, events, essentials, live, fishing-report, where-to-stay, map, archives, photos, gully, my-trip, guides, services, rent, beach, maintenance.
  - **Branded transactional emails** via shared `emailLayout` helper (`src/lib/emailLayout.ts`): beach/rent/maintenance request + paid confirmations, priority dispatch, suggestion admin alerts. All carry lighthouse header, accent bar, coordinates footer.
- **Social media export routes (NEW 2026-04-15)** — dynamic PNG assets at `/social/*` generated via `ImageResponse`. Right-click-save from the URL.
  - `/social/facebook-profile` — 1000×1000 PNG. Lighthouse (`standard` detail, light variant) centered on navy. Circle-crop safe for FB's 170×170 desktop / 128×128 mobile display.
  - `/social/facebook-banner` — 1640×624 PNG. 1939 Russell Lee FSA photo of the "STRADDLE THE RAIL AND KEEP ASTRIDE — HARBOR ISLAND CAUSEWAY CO." sign (LOC, public domain) centered on navy with ~371px bleed each side. Sign fully visible on desktop AND inside FB's ~1110w mobile safe zone. No brand overlay — profile picture carries the brand; banner is pure heritage imagery.
  - Source photo saved at `public/archives/causeway-sign-1939.jpg` (237 KB, 1024×712 native).
  - `loadLighthouseLight()` runtime helper retints the dark-variant static SVG to light-variant (navy→sand, med-navy→tan, sand→navy) via tokenized string swap. Inlined per route for now — promote to `src/lib/` if reused more than twice. Pattern extensible to Twitter, Instagram, LinkedIn — same `/social/[platform]-[asset]/route.tsx` convention.
- **The anti-Bureau positioning** — established in Dispatch #1 and visually reinforced through the brand: serif weight, navy+coral (not aqua/yellow), coordinates (not city name), journalistic voice. PAL is positioned as the media/editorial counter-narrative to the Port Aransas Tourism Bureau's "Island Life / Beach Nation" destination marketing.
- **Curated Guides** — 10 guides (Happy Hour, Pet-Friendly, Date Night, Seafood, etc.) auto-populated from tags
- **Trip Planner** — Save/bookmark businesses + stories to My Trip (localStorage, no login)
- **Interactive Map** — 127 businesses with real geocoded coordinates, Leaflet + OpenStreetMap
- **Island Pulse** — 10 webcams, MarineTraffic ship map, native NOAA weather/tide dashboard
- **Island Essentials** — 10-section arrival guide (ferry, beach rules, parking, emergency, etc.)
- **Events & Happenings** — 15 annual events + 4 recurring, organized by month
- **Fishing Report** — seasonal species, fishing types, TPWD regulations, live conditions, captain report links
- **Where to Stay** — neighborhood guide (Downtown, Beachfront, Mid-Island, RV/Camping) — Cinnamon Shore section removed per PUD rule 2026-04-15
- **Historical Archives** — 31 public domain photos spanning 1853-2017, from LOC, NARA, NOAA, NASA, UTSA, Wikimedia (largest organized PA digital photo collection online)
- **Community Photos** — "Port A Through Your Eyes" gallery with anonymous submissions
- **Know This Place** — anonymous tag suggestion on every listing, admin review queue
- **Nav** — Explore dropdown (what to DO) + Discover dropdown (what to KNOW), all 15+ pages accessible in 1 click
- **SEO** — complete: meta tags on every page, JSON-LD (WebSite, LocalBusiness, Article), OG images for heritage, sitemap 175+ URLs
- **Stripe** fully integrated across all 3 portals — test keys in place, swap to live keys when PAL Stripe account is ready
- **Domain:** theportalocal.com (primary). Originally purchased as portaransaslocal.com via Vercel (Cloudflare backend, WHOIS privacy free); rebranded to theportalocal.com.
- **Deployment:** Vercel — green, all builds passing, 30 commits on Apr 12

## Port A Heritage (renamed from "Island Stories" on 2026-04-12)

**Why the rename:** "Stories" was ambiguous — could read as blog posts or news. "Port A Heritage" anchors the section as preserved local history, on brand. URL stays `/history` for SEO ("port aransas history" captures search traffic).

### What's Built
- `/history` landing page with story cards, visual timeline (~2000 BC to 2026), "Share Your History" CTA
- `/history/[slug]` dynamic route — long-form editorial with drop-cap ledes, structured sections, pull quotes, fact sidebars, collapsible source citations, "Visit Today" recommendations, **Related Heritage** cross-links, prev/next navigation
- `stories.ts` — 17 published entries with metadata, tags, categories, `relatedStories` connections
- `story-content.ts` — all editorial content, structured by slug

### Published Stories (all 17 live)
1. **The Day a President Caught a Tarpon** (8 min) — FDR, Barney Farley, May 8 1937
2. **The Tarpon Era** (12 min) — 1880s-1960s, Tarpon Club, Ed Cotter, 69 dams
3. **Farley Boat Works** (10 min) — no blueprints, Tina's 50-year journey, Doyle Marek revival
4. **Hurricane Celia** (10 min) — microbursts, Pearl Beer water, 14 named survivors
5. **The Lydia Ann Light** (7 min) — Christmas Day 1862, Fresnel lens, Charles Butt rescue
6. **They Said We Were Extinct** (8 min) — Karankawa 5,000 years, genocide myth, Donnel Point 2025
7. **38,000 Photos Nobody Can See** (7 min) — museum's Sears kit house, digital gap, Creighton archive
8. **Built, Destroyed, Rebuilt** (12 min) — 1875 through Harvey, each cycle prices people out
9. **The Pirate's Poet's Chapel** (5 min) — Aline Carter, Texas Poet Laureate, sand dune chapel
10. **The Guns That Never Fired** (6 min) — WWII 155mm guns, 360 men, zero shots
11. **Texas's Oldest Fishing Tournament** (6 min) — 1932 Tarpon Rodeo, Totsy's fish, Deep Sea Roundup

### Published Expansion Stories (all 6 live as of 2026-04-12)
12. **No Blueprints, No Problem** (10 min) — Farley craft deep dive: half-models, V-bottom hulls, the apprentice problem, fiberglass trees
13. **The Island's Institutional Memory** (9 min) — Museum collection: Fresnel lens, 40K photos, 1920s film, genealogy scroll, digital gap
14. **The Mercer Logs** (8 min) — six ledger books 1866-1881, post-Civil War records, Dr. Ford transcription
15. **The Red Tide That Built a University** (8 min) — 1935 fish kill → Lund's shack → UTMSI founding 1941, $45M Harvey damage
16. **The Ferry That Keeps the Island an Island** (7 min) — Munsill era, Littleton's county era, TxDOT 24/7 fleet, bridge debate
17. **The Development Question** (9 min) — Cinnamon Shore, $1.3B Phase II, Beach Access 1B fight, Harvey's role, affordability

### Heritage Research Vault (6 files in `Port A Local/Heritage Research/`)
- FDR Tarpon Fishing Trip 1937.md (196 lines)
- The Tarpon Era.md (240 lines)
- Farley Boat Works.md (295 lines)
- Hurricane Celia and Port A Storm History.md (227 lines)
- Port Aransas Timeline.md (627 lines) — Karankawa to 2025
- Port Aransas Museum and PAPHA.md (440 lines) — deep second-pass with Sears kit house, 38K photos, Creighton

### The Farley Connection (PRIVATE — do not reference publicly)
Winston's wife Collie (Colleen Farley) carries the Farley maiden name. **Farley Boat Works is her family's legacy.** This is not a partnership angle — it is personal family history.

## Portal Strategy (UPDATED 2026-04-15)
Revenue features are portals, not directory listings. Portals keep transactions in-house.

1. `/maintenance` — Standard (free) or Priority Dispatch ($20, 7AM–8PM) → John Brown notified via SMS (Twilio), admin@theportalocal.com notified via email (Resend). **Urgency-dispatch coupling (2026-04-15):** only Emergency triggers Priority Dispatch. Urgent (48hr) stays free Standard. Switching Standard ↔ Emergency auto-syncs both fields. SLA: "within 4 hours" (not 2-4). After 8PM, Emergency is disabled; call (361) 455-8606 for after-hours.
2. `/rent` — **MARKETPLACE MODEL (2026-04-15, updated 2026-04-25 to "pickup OR delivery"):** customer books ($10/day reservation fee via Stripe, 5-day calendar minimum). Lead blasts to 20 selected cart companies simultaneously via email. First vendor to respond claims the rental. **Handoff is vendor's call — pickup at their shop OR delivery to the customer's address, whichever they offer for that lead.** (Reversal of the earlier "pickup only" rule — leaving it open captures more customers; vendors self-sort based on what they offer.) Vendor agrees to: clean cart, **minimum $20 discount** off standard rate, standard rental practices (ID, deposit, service, maintenance). Customer gets cart logistics 24-48 hours before arrival. **Internal refund rule:** if no vendor claims 3-4 days before pickup, auto-refund + notify customer. 20 vendors selected, 8 have emails (active in blast), 12 need emails collected. SMS blast channel ready in code, flips on with A2P.
3. `/beach` — cabana ($300/day) + chair & umbrella ($85/day) via Stripe, delivery only, date range

**Vendor branding rule:** No vendor names ever in portal UI at booking time. Cart portal is vendor-agnostic by design (we don't know who's fulfilling at booking). Vendor name revealed only in pre-arrival notification.
**John Brown:** SMS-only by design — does not take email. Internal email record goes to admin@theportalocal.com for all 3 portals.

## Account / Infrastructure Status (verified 2026-04-13)
- **Domain:** ✅ theportalocal.com live, HTTPS, 200 OK
- **Google Workspace:** ✅ active — MX `smtp.google.com`, admin@/hello@/bookings@ all receive mail
- **Stripe:** ✅ LIVE — `acct_1TLv2G…`, under admin@theportalocal.com, charges enabled, **manual platform payouts** (PAL → PAL bank fires when Winston says so), live keys in Vercel. **Stripe Connect Express ALSO live** for runner payouts (separate flow, defaults to daily auto-payouts on connected accounts). **2FA:** enabled with Google Authenticator, recovery code stored in iCloud Keychain (Stripe entry, 2026-04-26 — saved after a panic recovery this session). **Stripe Issuing:** deferred 30+ days, reapply after Connect volume history accumulates (~Q3 2026)
- **Resend:** ✅ live, bookings@theportalocal.com sender, also wired to Know This Place tag suggestions
- **Twilio:** ✅ account active, $44 USD balance, +1 (361) 428-1706 SMS+Voice
- **A2P 10DLC Brand:** ✅ APPROVED (BNd603…)
- **A2P 10DLC Campaign:** ⏳ IN_PROGRESS at TCR (low-volume mixed). Maintenance routes already use MessagingServiceSid when env var is set — flips automatically on approval.
- **GSC:** ✅ verified via TXT record on apex, sitemap submitted
- **GitHub:** ✅ stays on `haveebot/port-a-local` — no org migration planned (decided 2026-04-13)
- **Vercel:** ✅ stays on `haveebots-projects` team — no team migration planned. Project name is `port-a-local`, deploys to theportalocal.com.

**Email structure (FIRM):**
- admin@theportalocal.com — all account logins, platform management
- hello@theportalocal.com — public contact, business inquiries
- bookings@theportalocal.com — Resend transactional email sender

**Env vars in Vercel production (as of 2026-04-13):**
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_MESSAGING_SERVICE_SID (MG197b…), ADMIN_PHONE, INTERNAL_ALERT_EMAIL, JOHN_BROWN_PHONE.

## Next Session Priorities

### PAL Delivery — runner pool + restaurant pool
1. **Onboard more runners.** Pipeline + onboarding works end-to-end. Need humans willing to drive. Pool today: 1 (Winston). Each new runner: post application → Winston approves via magic link → runner sets up Stripe Connect → toggles on duty.
2. **Onboard more restaurants.** Currently 2 (Crazy Cajun, DQ). Each new restaurant is one entry in `delivery-restaurants.ts` + a menu file. Bottleneck is menu data collection.
3. **Customer comms preference UI** — after A2P clears, let customers choose SMS / email / both per order.

### Cart Portal Marketplace (revenue)
1. **Collect 12 missing vendor emails** — Winston task. Call or web-scrape: Coastal Ed's, Port A Beach Buggies, Texas Red, First Stop, Tarpon Carts, Bron's, Kacie's, Island Outfitters, Gulf Carts, Ash Cart, Port A Carts, PA Golf Cart Rental. Drop email into `src/data/cart-vendors.ts` next to slug → live on next deploy.
2. **Click-to-claim mechanism** — needs Vercel KV (free tier). Unique claim links per vendor per lead. First click wins. Replaces manual reply-based claiming.
3. **SMS blast channel** — code ready, flips on when A2P 10DLC campaign clears TCR. All 20 vendor phone numbers already in data file.
4. **Automated pre-arrival notification** — email + SMS to customer 24-48hrs before pickup with vendor name + pickup address + hours.
5. **Automated return reminder** — email + SMS to customer day before return date.
6. **Auto-refund for unclaimed leads** — cron or manual check: if lead unclaimed 3-4 days before pickup → Stripe refund + customer notification.

### Gully + Claude (AI search — next big feature)
7. **Create Anthropic API account** under admin@theportalocal.com, Palm Family Ventures card, $25/mo cap. Get API key → Vercel env var `ANTHROPIC_API_KEY`.
8. **Build "Ask Gully" augmented search** — Option A (recommended). Fuse returns matches as usual; if query is a question, Claude Haiku synthesizes a short answer from top-N matches with inline citations. Single addition to existing Gully UX. Prompt-cached system prompt + corpus for cost efficiency.

### Content
9. **Heritage expansion batch 2** — candidates: Red Snapper Fleet, Vietnamese shrimping community, Aransas NWR whooping cranes, Harbor Island oil era, Port A ISD history
10. **Dispatch #2 — "The Landlord Nobody Voted For"** (planned follow-up) — shopping center acquisition + rent-doubling pattern. NOTE: Tim Parke (2026 Sandfest president, Lone Star Taste owner) is a potential source — he's both a cart-portal vendor relationship and a possible Dispatch #2 tenant. Handle carefully.

### Infrastructure
11. **A2P campaign approval** (waiting on TCR — passive). Flips maintenance SMS + cart vendor SMS blast + **PAL Delivery customer SMS** automatically.
11b. **Stripe Issuing reapply** (passive — wait for ~30 days of Connect volume to accumulate, ~Q3 2026). Issuing would let runners get virtual cards instead of needing personal credit for restaurant pickups.
12. **Classifieds/Want Board** — needs Supabase (still deferred)
13. **Per-business OG images** (eventual) — 130+ business detail pages currently fall back to root OG.
14. **Heritage per-article OG lighthouse upgrade** ✅ done 2026-04-14.

## PUD Listing Rule (2026-04-15, confirmed + enforced)
- **Rule:** No customer-facing mentions of PUDs (Cinnamon Shore, Palmilla, Sunflower Beach, Preserve at Mustang Island) — no directory listings, map pins, neighborhood callouts, "stay here" recs, popular-chip shortcuts.
- **Exception 1 — Editorial:** Heritage, Dispatch, archives, and archival photos that reference PUDs as part of the historical/economic narrative are protected. Examples: Heritage #17 "The Development Question" (slug `cinnamon-shore-tension`), Dispatch #1 "The Two Port Aransases." Do not scrub these.
- **Exception 2 — Lisabella's:** Listed despite being inside Cinnamon Shore (🔑 personal relationship). Tagline + address + description can all reference Cinnamon Shore — it's a feature for Lisabella's, not a routing to the PUD. Map pin sits inside Cinnamon Shore (accurate lat/lng) — acceptable under the exception.
- **Scrub execution (commit c86b8c9, 2026-04-15):**
  - Removed `Cinnamon Shore` business listing from `src/data/businesses.ts` (matched precedent comment `// [Business] removed — PUD property`)
  - Removed Cinnamon Shore neighborhood section from `src/app/where-to-stay/page.tsx`
  - Replaced Cinnamon Shore with Shorty's in the homepage chip strip (`src/app/page.tsx`)
- **If a new PUD emerges (Preserve at Mustang, bayside subdivision, etc.):** apply the same rule, scrub on sight, leave the comment pattern.

## Decisions Made
- **Google Business Profile: skipped.** PAL is a media/directory platform, not a storefront. GBP rules technically exclude online-only businesses. Brand presence handled by JSON-LD schema + GSC + on-site SEO (already strong). Revisit only if PAL opens a physical presence, pop-up, or paid advertising. Winston confirmed dislike of GBP 2026-04-13.
- **GitHub + Vercel:** PAL stays on haveebot — no migration. Sage Em is the one that gets dedicated company orgs.
- **First FB banner — "Straddle the Rail" over FDR (2026-04-15).** FDR 1937 image is more famous *and* personally meaningful (Barney Farley — Collie's grandfather — is in the photo) but overused by every PA tourism outlet, Tourism Bureau, Tarpon Inn, and museum. "Straddle the Rail" was already sourced in our archives as public domain, is visually distinct, and matches the anti-Bureau "deep-cut" voice — the kind of image that signals *we know this place*. FDR reserved for future use (next banner rotation, story illustration, merch, etc.) — we have ample opportunity.
- **Brand package — formal approval status (clarified 2026-04-15, waiting confirmed 2026-04-15).** The lighthouse mark itself is blessed. The *full lockup* (lighthouse + wordmark + coordinates strip) is used internally on OG cards, emails, footer, and nav, but has **not** been formally approved as "the official identity package" — and we are **deliberately waiting** before locking it. Reasons to wait: (a) it's already working in the right contexts so no lock is blocking, (b) FB banner proved the lockup isn't universal (pure photo + bleed beat lockup overlay), (c) locking prematurely biases us toward using it everywhere. Plan: ship 3–4 more brand surfaces (IG, Twitter, per-business OG, merch) and see the pattern before deciding whether there's one canonical lockup or 2–3 approved configurations. Treat the lockup as in-progress until Winston explicitly flags it as locked.

## Decisions Made (2026-04-26 session — Delivery hardening + Stripe 2FA recovery)
- **Cookie-session over token-in-URL for runners.** Original token-in-URL design felt like friction. Pivoted to "What would Uber do" — magic-link first sign-in, `pal_runner` cookie thereafter (httpOnly, sameSite=lax, 30-day). Runner bookmarks `/deliver/driver` and never sees a token in the URL again. Token still works as fallback (lookup recovery, dispatch links on a new device).
- **Belt-and-suspenders comms everywhere.** SMS may be filtered pre-A2P; email is reliable. Both fire on every state transition (driver dispatch, customer paid/picked-up/delivered). Once A2P clears, runners + customers will be able to choose preference.
- **Manual platform payouts (PAL → PAL bank).** Winston controls when fund flow at the platform layer fires. Different from Connect-account payouts (PAL → runner bank), which run on Stripe's default daily auto-schedule.
- **Defensive `.trim()` on Stripe key reads.** A trailing newline in `STRIPE_SECRET_KEY` env var burned a session with `ERR_INVALID_CHAR` 500s. `getDeliverStripeKey()` now always trims. Adopt this pattern for any Stripe key reads going forward.
- **Stripe payouts dashboard button on runner hub.** One-tap into runner's Express dashboard via `stripe.accounts.createLoginLink` (one-time URL, single-use). Opens in new tab so PAL session stays put. Lets runners see balance, payout schedule, trigger instant payouts (1.5% fee), update bank info — without leaving PAL.
- **PAL is "an entity," not "Winston."** All customer-facing copy says "PAL" / "we" / `hello@theportalocal.com`. No personal name surfaces anywhere on Delivery surfaces. Mirrors PAL's broader voice rule.
- **Phantom-order admin emails killed.** Admin paid email moved from `/api/deliver/order` (create) to `/deliver/success/[orderId]` (post-Stripe-verify). No more inbox spam from abandoned carts that errored before payment.
- **Runner terminal-state hub-back buttons.** Delivered, canceled/refunded, and already-claimed-by-another-runner all show "← Back to runner home" so runner doesn't dead-end on the success card.
- **Stripe 2FA recovery code is permanent infrastructure, not optional hygiene.** Lost a session almost-recovering from 2FA lockout (Google Auth empty, no clear backup codes; salvaged via a recovery code Winston had drafted to himself 13 days prior). New rule: every 2FA setup gets the recovery code stashed in iCloud Keychain (or 1Password when we have one) immediately, no exceptions. The string format (5 groups of 4 lowercase chars, hyphenated, e.g. `xxxx-xxxx-xxxx-xxxx-xxxx`) is Stripe's master recovery key — single-use, master override.

## Decisions Made (2026-04-25 session)
- **Events strategy: build first, no outreach, force them to come to us.** Decided this session. We're a local site covering public events from public information — same as any news outlet. Org's options after we ship: (1) engage, (2) ask, (3) pay (we decline cash per no-paid-placements), (4) push back (untenable if we're well-executed). EventOrganizerClaim CTA on every event page operationalizes the on-ramp.
- **Tournament coverage is a priority wedge for PAL.** Tournaments in Port A have real economic gravity but their digital presence is in the basement. We can dominate this category at near-zero marginal cost per event because the infrastructure templates. DSR is the framework subject (Heritage piece + Farley family lineage already established); TWAT and Texas Legends are next.
- **Million-Dollar Game Dispatch piece is a separate spin-off.** Winston has been hammering on the title for years. Tone there is more journalistic/observational; tone on the event page itself is celebrate-the-spectacle. The event loves us either way because we cover them better than they cover themselves.
- **Captain interviews / org outreach deferred** — build with public info, let org come to us. Same Heritage/Dispatch workflow.
- **Day-of staffing designed for proxy/automated, not manual.** Photo intake from anyone via mailto/upload, leaderboard updates can be remote, structured weighIn entries kept simple to enable async processing.
- **Per-event hub pages are the demo-for-adoption play.** Build the hub page first, pitch second. The page itself IS the pitch — easier to ask "approve this" than "imagine this." First target: Fly It Port A's Spring Kite Festival 2026. If the Timms say yes and day-of coverage works May 9, the same template runs for Fall Kite Festival, Winter Kite Festival, Wooden Boat Festival, Whooping Crane Festival, Lighted Boat Parade, Deep Sea Roundup. Each is one entry in `src/data/events.ts` away.
- **Day-of coverage scaffold is built into the page.** Empty state today, fills in real time the morning of the event with photos + conditions + updates. Avoids the tourism-bureau pattern of "list of events with no follow-through." Coverage is what we offer that distinguishes us from CVB calendars.
- **Heritage backlog +1: "The Kite Shop on Avenue G."** The Yocum → Pyle → Timms ownership chain across four decades, the competitive-flier sponsorships under Yocum, the long Pyle era, and how the Timms-era three-festivals-a-year cadence (NEW since ~2022) is reshaping the rhythm. Long-form, archival photos. The *shop* is the heritage subject — the festival cadence is too young to be Heritage on its own.

## Decisions Made (2026-04-24 session)
- **Collie's lighthouse is the canonical mark.** Replaces the prior Lydia Ann rendering. Propagated to all surfaces in one commit (`db3a65d`). Three color variants (dark/light/coral) + four detail levels preserved. The `/brand` page is now the single source of truth — future brand questions get resolved there, not re-relitigated.
- **`/brand` is the internal reference, not a public page.** `robots: noindex, nofollow`. URL is unlinked from nav. Collie + Winston bookmark it; I cite it in drafts; future Claude sessions should read it before making brand decisions.
- **Emoji exceptions locked (Collie explicit sign-off).** SMS, seasonal event emojis (🎃🎄🎭🪁), and email subject lines stay as emoji. See `feedback_pal_brand_system.md`.
- **Directory icons: Illustrator-authored only.** Canva round was abandoned. Any future icon ships through the same `PortalIcon.tsx` swap path — one component, all call sites update in one edit.
- **Photo-driven intake is the default for Collie features.** When she sends a photo with content, the protocol is: pull attachments → transcribe / OCR / extract → build the feature → ship → reply with summary. See `feedback_pal_photo_to_feature.md`. Cadence is feature-dependent (weekly for Live Music; one-off for brand drops).
- **Marketing ops are living files, not deliverables.** Content Calendar, Caption Library, Outreach Tracker, Targets are maintained in the vault and updated every Sunday by Winston/Collie/Claude. Not shipped as a PDF.
- **Paid ad spend crosses a Winston-approval threshold.** Collie plans paid placements starting ~May 5 for end-of-school beach vacation targeting (Austin/SA/Houston/DFW). Any paid spend requires Winston's explicit go on budget + creative.
- **Sip Yard is in the Live Music schedule but not yet in the directory.** Renders as plain text on `/live-music` (no crosslink). Winston to provide tagline + address + phone to listing-ify.
- **`music` silhouette still a placeholder.** Live Music nav uses the existing `art` (paint palette) icon. Flagged to Collie as her optional next micro-task.

## Decisions Made (2026-04-16 session)
- **Printable QR poster pattern (2026-04-16).** New route `/print/qr/[slug]` generates letter-size branded posters with a lighthouse-in-center QR code. Two targets live: `home` (general awareness) and `sandfest` (Heritage piece). For physical display at events — first use is Sandfest weekend signage. Powered by `qrcode` npm package with error correction H to survive the center overlay. Not indexed (noindex in metadata).

## Decisions Made (2026-04-15 session)
- **Cart portal: marketplace model (2026-04-15).** Pivoted from preferred-vendor/delivery to competitive marketplace/pickup. Customer books → lead blasts to 20 vendors → first to claim wins → customer picks up. $10/day reservation fee. Vendor gives minimum $20 discount. Pickup only (no delivery). 5-day calendar minimum. 3-4 day no-vendor refund policy. Flywheel: volume → vendor dependence → vendor approaches for exclusive deal → PAL has leverage.
- **Maintenance urgency coupling (2026-04-15).** Only Emergency triggers $20 Priority Dispatch. Urgent (48hr) stays free Standard. Both directions auto-sync. SLA tightened to "within 4 hours" from "2-4 hours."
- **Internal email routing (2026-04-15).** All 3 portals now send internal alert emails to admin@theportalocal.com. Maintenance was previously orphaned (JOHN_BROWN_EMAIL unset). John stays SMS-only.
- **Archives visibility (2026-04-15).** Promoted in nav Discover dropdown (Heritage → Dispatch → Archives → Guides), added to Footer, cross-link callouts on /history and /photos pages. Was buried at bottom of secondary dropdown cluster.
- **Lisa Shelton: passed September 6, 2025, age 61.** Stroke Oct 22, 2024. Executive Director of Sandfest 2018-2019. Nickname "Wiggly." Featured on 2026 logo mountain. South Jetty obit: portasouthjetty.com/articles/shelton-was-sparkling-community-leader/. Honored in Heritage #22 Section 6 "The Logo Mountain" — Sandfest-centric framing, not a memorial section. Per Winston: don't over-concentrate on individuals in festival pieces.
- **Tim Parke: 2026 Sandfest board president.** Owns Lone Star Taste. Also a potential Dispatch #2 source (Landlord piece — tenant angle). Handle dual relationship carefully.
- **Scot Deason: one T (Scot, not Scott).** Confirmed.
- **FB page strategy: parked for Collie.** No mass-delete of old posts. Triage (keep/hide/delete) deferred until Collie begins contributing on marketing. Archive don't nuke.

## Key Decisions
- Platform: Next.js + Vercel (stay). Shopify Storefront API for merch when ready.
- Stripe for booking/reservation fees — lazy initialization pattern
- Domain naming: no hyphens ever. theportalocal.com is primary (originally portaransaslocal.com).
- No business outreach until paid advertising is introduced — stay fully internal
- Gully = site-wide fuzzy search engine, live at /gully. Cmd+K palette on every page.
- RAG/vector search ruled out for current scale — Fuse.js is right. RAG reserved for future "Port A Concierge" AI chat.
- Heritage section = **Port A Heritage** (renamed from "Island Stories" 2026-04-12). URL stays `/history`. Original editorial, not directory listings. Do and build, don't ask permission.

## Key Files
- Vault: `/Users/winstoncaraker/Projects/workspace/port-a-local/Port A Local/`
- Heritage Research: `Port A Local/Heritage Research/` (6 files)
- Stories: `src/data/stories.ts`, `src/data/story-content.ts`
- **Dispatch: `src/data/dispatches.ts`, `src/data/dispatch-content.ts`, `src/app/dispatch/[slug]/page.tsx`**
- **Events: `src/data/events.ts`, `src/data/event-content.ts`, `src/app/events/[slug]/page.tsx`** (per-event hub pages, NEW 2026-04-25)
- **Tournament data + components (NEW 2026-04-25):** `src/data/tournament-results.ts`, `src/components/tournament/{LeaderboardTable,DivisionsPanel,CaptainSpotlight,PiggyPerchHighlight,TournamentRulesPanel,PastChampionsBoard}.tsx`
- **Event extras (NEW 2026-04-25):** `src/components/{EventCountdown,FeaturedEventBanner,EventOrganizerClaim}.tsx`, `/api/events/claim/route.ts`
- Businesses: `src/data/businesses.ts` (140+ with geocoded coordinates)
- Guides: `src/data/guides.ts` (10 curated guides)
- Gully: `src/lib/gullySearch.ts`, `src/app/gully/page.tsx`, `src/components/GullyPalette.tsx`
- Trip Planner: `src/lib/tripPlanner.ts`, `src/components/SaveToTrip.tsx`, `src/app/my-trip/page.tsx`
- Map: `src/app/map/page.tsx`, `src/components/MapView.tsx`
- Live: `src/app/live/page.tsx`, `src/components/IslandConditions.tsx`, `src/app/api/conditions/route.ts`
- Essentials: `src/app/essentials/page.tsx`
- Events: `src/app/events/page.tsx`
- Fishing: `src/app/fishing-report/page.tsx`
- Know This Place: `src/components/KnowThisPlace.tsx`, `src/app/api/suggestions/route.ts`
- SEO: `src/app/sitemap.ts`, `src/components/StructuredData.tsx` (Website + Organization schemas)
- Portals: `src/app/rent/`, `src/app/beach/`, `src/app/maintenance/`
- **Delivery (NEW vertical, 2026-04-25 / 2026-04-26):**
  - Customer surfaces: `src/app/deliver/`, `src/app/deliver/checkout/CheckoutClient.tsx`, `src/app/deliver/success/[orderId]/page.tsx`
  - Runner surfaces: `src/app/deliver/runner/`, `src/app/deliver/driver/RunnerHub.tsx`, `src/app/deliver/driver/[orderId]/DriverActions.tsx`, `src/app/deliver/driver/lookup/`, `src/app/deliver/driver/payouts/`
  - API routes: `src/app/api/deliver/order/`, `src/app/api/deliver/runner/`, `src/app/api/deliver/driver/{login,logout,feed,online,offline,lookup}/`, `src/app/api/deliver/driver/connect/{start,refresh,dashboard}/`, `src/app/api/deliver/webhook/`
  - Data + libs: `src/data/delivery-{store,types,restaurants,drivers,pricing}.ts`, `src/lib/{runnerSession,deliverStripe,deliverDispatch,deliverEmails}.ts`
  - DB tables: `delivery_orders`, `delivery_drivers`, `delivery_driver_status`, `delivery_driver_transfers` (idempotent migrations on first call)
  - **Spec doc: `Port A Local/Features/Delivery — Spec.md`** — read before touching delivery code
- **Cart vendor directory: `src/data/cart-vendors.ts`** — 20 selected PA cart companies, getBlastableVendors() helper, claim terms in header comments
- **Brand mark: `src/components/brand/LighthouseMark.tsx`** — single component, 4 detail levels, monochrome prop
- **Shared OG helper: `src/lib/brandedOG.tsx`** — powers every route's share card
- **Shared email helper: `src/lib/emailLayout.ts`** — powers every transactional email
- **Static logo SVGs: `public/logos/lighthouse-{full,standard,simple,icon}.svg`**
- **App-level branded routes: `src/app/{icon.svg, apple-icon.tsx, manifest.ts, opengraph-image.tsx}`**
- **Social export routes: `src/app/social/facebook-profile/route.tsx`, `src/app/social/facebook-banner/route.tsx`**
- **QR print pages (NEW 2026-04-16): `src/app/print/qr/[slug]/page.tsx`** — branded 8.5×11 printable QR posters via `qrcode` npm package (error correction H, navy-on-sand, lighthouse icon overlay in center on sand-colored circle). Two targets live: `home` → theportalocal.com, `sandfest` → the Heritage piece. Letter-size `@page`, `robots: noindex`, preview bar auto-hides on print. Add more targets by editing the `targets` config map. Pattern extensible to per-portal (`rent`, `beach`, `maintenance`) or per-heritage-piece posters as needed.
- **Archival source photos: `public/archives/causeway-sign-1939.jpg`** (1939 Russell Lee FSA, LOC, PD — first archival image downloaded locally for asset composition; add more here as needed)
- **Draft archive: `workspace/drafts/pal-editorial-two-port-aransases.md`** — original Dispatch #1 draft with notes

## Related memory files
- `feedback_pal_dispatch_workflow.md` — the validated 6-step pattern for writing Dispatch pieces
