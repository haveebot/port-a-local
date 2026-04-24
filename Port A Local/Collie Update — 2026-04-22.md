# Collie Update — 2026-04-22

Hey Collie — this is a full briefing on what landed on Port A Local between your Round 1 icon sign-off (Monday evening, 2026-04-21) and end of day Tuesday, 2026-04-22. A lot rode on top of your Round 1 approval; Winston's call was to assume you'd sign off on Rounds 2–4 and keep moving — *"if she makes changes we will do it again."* So nothing here is final. It's the current state of the live site, and any icon you want to retune is a one-line swap we can do in minutes.

**TL;DR:** 55 silhouettes live across 5 rounds (4 icon + 1 OG coverage), every visible emoji across the site replaced or aliased, every one of your copy edits shipped, a new Heritage piece (Pat Magee), a new Dispatch tip-form that replaced the broken mailto, 3 new directory listings, and a featured-tile swap. Plus one piece of compliance plumbing (A2P 10DLC) fixed under the hood.

Everything is live at **https://theportalocal.com**.

---

## 1. Icon rollout — Rounds 2, 3, 4 recap

Your Round 1 gave us the 9 "directory + portal" silhouettes: **eat, drink, stay, do, fish, shop, beach, maintenance, cart.** On top of those, three more rounds shipped:

### Round 2 — Tier 1/2/3 (commit `35ca1b3`) — 26 silhouettes

Drafted in your monochrome style. Coral on navy, navy on white, `currentColor` throughout.

**Tier 1 — nav items (11):**
1. `services` — toolbox
2. `events` — calendar grid
3. `heritage` — open book
4. `dispatch` — compass
5. `archives` — Parthenon/columns
6. `guides` — clipboard
7. `essentials` — backpack
8. `live` — broadcast tower with signal waves
9. `map` — pin drop
10. `photos` — camera
11. `mytrip` — heart

**Tier 2 — Gully chips (9):**
12. `burger`
13. `happyhour` — tropical cocktail
14. `taco`
15. `coffee` — mug + steam
16. `seafood` — crab
17. `sailing` — sailboat
18. `surfing` — surfboard
19. `latenight` — crescent moon
20. `offshore` — speedboat + wake

**Tier 3 — Essentials section headers (6):**
21. `ferry`
22. `parking` — block-P
23. `weather` — sun + cloud
24. `wildlife` — dolphin leaping
25. `emergency` — medical cross
26. `connectivity` — phone + wifi

**Two free reuses** (no new design needed): **Fishing Report** nav uses the Round 1 `fish`; **Where to Stay** nav uses the Round 1 `stay`.

### Round 3 — Tier 4 decoratives + EmojiIcon helper (commit `f625efb`) — 7 silhouettes

1. `sunrise` — half-sun rising over horizon + waves
2. `island` — palm on sand mound with water
3. `palm` — standalone palm with segmented trunk
4. `urgent` — lightning bolt
5. `trophy` — two-handle cup + pedestal
6. `art` — paint palette with thumb hole + paint dots
7. `calendar` — single-date picker (distinct from `events`' full month grid)

Plus a helper component called **`EmojiIcon`** — when a data file (guides, heritage, events) stores an icon as an emoji string, `EmojiIcon` renders the silhouette where one exists and falls back to the raw emoji where it doesn't. That means data stays readable and icons upgrade automatically.

### Round 4 — UI affordances, aliases, OG refactor (commit `c4d63e2`) — 13 silhouettes + 21 aliases

New silhouettes:
1. `check` — success states everywhere
2. `warning` — error states everywhere
3. `sun`
4. `thermometer`
5. `wind`
6. `search` — nav + footer + Gully
7. `handshake` — community copy, "know this place" prompts
8. `shell` — webcam cards
9. `video` — webcam cards
10. `winter` — snowflake (fishing seasons)
11. `storm` — hurricane + thunderstorm
12. `castle` — one of the Live webcams
13. `hammer` — heritage timeline

**21 emoji aliases** — these are emojis that map to an existing silhouette, no new design:
- 🏨 🏘️ 🏕️ → `stay`
- 🛣️ 📍 → `map`
- 🛥️ → `offshore`
- 🪨 🛶 🐟 → `fish`
- 🦅 → `wildlife`
- 🎵 🎭 → `art`
- 🌿 🪵 🍂 → `palm`
- 🏮 → `sunrise`
- 📜 → `guides`
- 🌸 → `sun`
- 🎆 → `urgent`
- 🪁 → `sailing`

**Round 4 also refactored the OG (social share) system** — the "share card" that shows up when a PAL link is posted to iMessage, Facebook, Twitter, LinkedIn, Slack. The badge on every one of our 19 share cards used to be an emoji-prefixed string like *"📖 Heritage"*; it now renders the actual silhouette SVG inline in the badge pill, matched to whatever page you're sharing.

### Round 5 — OG coverage expansion (commit `2add0e4`)

Not a new icon round, but worth flagging: we pre-generated a **per-business + per-category + per-guide** share card for every directory route. That's **150+ pages** that previously fell back to the generic PAL preview — now every individual business, category, and guide has its own branded share card with the Lighthouse lockup and the page's own identity.

### Grand total

**55 silhouettes + 21 aliases + EmojiIcon fallback.** Every visible UI emoji across the site is now either a silhouette or deliberately left as emoji (see "still emoji" below).

### The swap mechanic — if an icon reads poorly

All 55 silhouettes live in a single file: **`src/components/brand/PortalIcon.tsx`** (1,150 lines). Every call site just says `<PortalIcon name="heritage" />` — so if the `heritage` book silhouette reads poorly at nav size, we edit the SVG path for "heritage" once and every appearance across the site updates. No call-site changes, no find-and-replace, no redeploy dance. That's the point — iteration is cheap. Send me notes like *"the coffee mug looks like a chalice"* and I can turn that around in minutes.

### Still emoji (deliberate)

Three categories stay emoji on purpose:
- **SMS text bodies** (e.g., the 🚨 prefix on Emergency dispatch texts) — SMS is plain text, can't render SVG.
- **Email subject lines and some HTML in transactional emails** — inline SVG in email is a minefield across Outlook, Gmail, Apple Mail. Low reward for the swap.
- **Seasonal event emojis with no silhouette** — 🎃 🎄 🎭 🪁. These fall back gracefully via `EmojiIcon`. See next section — open question for you.

---

## 2. Live-site review path — where to find everything

Open https://theportalocal.com on whatever device is comfortable (phone is fine — we test both). Flag any icon that feels off.

- **Every page** — nav bar (desktop has Explore + Discover dropdowns; mobile has the hamburger). You'll see Tier 1 silhouettes in the dropdowns and My Trip heart in the top-right.
- **Cmd+K on any page (or visit `/gully`)** — Gully search palette. Tier 2 chips (burger, happyhour, taco, coffee, seafood, sailing, surfing, latenight, offshore) + category icons in results.
- **`/essentials`** — Tier 3 section headers (ferry, parking, weather, wildlife, emergency, connectivity).
- **Homepage (`/`)**
  - "Island Curated" palm stat + "No Pay-to-Play" trophy stat (Tier 4 decorative).
  - Featured Spots tiles (see #4 below — Red Dragon out, Aloha Açaí in).
- **Portal pages**
  - `/maintenance` — portal header icon, urgent-dispatch callout (⚡ → `urgent`), success states with `check`, error states with `warning`.
  - `/rent` — portal header, "Pick Your Dates" calendar pill, 📍 → `map`, ✅ stats → `check`.
  - `/beach` — portal header, "Pick Your Dates" pill, ☀️ → `sun`, ✅ → `check`.
- **`/photos`** — 🤙 shaka → `handshake`, 📸 → `photos`, 🏛️ → `archives` empty state.
- **`/my-trip`** — heart in nav; empty state uses `map`; saved items pull category icons.
- **`/archives`** — empty-state per-era columns icon.
- **`/admin/suggestions`** — empty-state icon.
- **`/live`** — IslandConditions card (thermometer / sun / wind), webcam cards (castle + shell + video).
- **`/fishing-report`** — season icons (sun / palm / winter for fall+winter), type icons (offshore, fish for bay/pier/etc.).
- **`/where-to-stay`** — neighborhood icons (downtown / beachfront / mid-island / RV camping), property-manager callout uses `stay`.
- **Any Heritage page (e.g., `/history/pat-magees-surf-shop`)** — category pill at the top, related-stories cards at the bottom.
- **Any Guide page (e.g., `/guides/happy-hour`)** — category icon.
- **Anywhere a PAL link is shared** (iMessage, FB, Slack, Twitter, LinkedIn) — the OG preview card, now with an inline silhouette in the badge pill.

Anything that reads wrong, flag it. Size matters — an icon can look great at 48px in the nav and muddy at 16px in a chip, which is exactly why we want your eye on the live site.

---

## 3. Copy changes from your edits doc

Every edit from your 2026-04-21 PDF shipped with Round 1 (commit `1770fe0`). Listing them explicitly so you can sanity-check:

- **Dispatch tagline swap** across 5 surfaces (`/dispatch` index, article footer, OG alt text, OG subtitle, email footer):
  - **Before:** *"Editorial, analysis, and reporting on the island as it is — not as it is advertised."*
  - **After:** *"Features, analysis and reporting on the island as it is — not as it's advertised."*
  - Your rationale was spot-on — "editorial" implies an editor / editorial board, and PAL doesn't have one.

- **Dispatch #1 title:**
  - **Before:** *"The Two Port Aransases"*
  - **After:** *"Port Aransas — A Tale of Two Islands"*
  - URL is preserved at `/dispatch/the-two-port-aransases` so any links already shared keep working. Only the display title changed.

- **Dispatch #1 section-header capitalization:**
  - *"The frame"* → *"The Frame"*
  - *"The historical pattern"* → *"The Historical Pattern"*

- **Maintenance subheader grammar fix:**
  - **Before:** *"Port Aransas's most trusted maintenance team..."*
  - **After:** *"the most trusted maintenance team in Port Aransas..."*

- **Carts spacing fix** — explicit space added between "discount" and "off" in the Carts portal header (the mushed-together "$20 discountoff" was a JSX whitespace bug).

- **Surf Report URL fix on `/live`:**
  - **Before:** Surf Report pointed to a Port Aransas page that returned 404.
  - **After:** Points to Horace Caldwell Pier (live page with real data).

- **Sticky header pre-scroll gradient removed** — the navy-to-transparent overlay that made the header look slightly shaded even before you scrolled is gone. Clean solid color now.

- **Favicon** — lighthouse is now monochrome white on navy (your call to lose the coral light panel at favicon scale). Live at theportalocal.com favicon, also applies to Apple touch icon, PWA install icon, and "Add to Home Screen".

---

## 4. New content + features you should know about

### Heritage #18 — "Pat Magee's Long Ride" (commit `418b694`)

Live at **`/history/pat-magees-surf-shop`**. 9 min read, ~2,200 words, 8 sections.

Deep profile of Pat Magee and Pat Magee's Surf Shop, written as the companion to the existing broader-scene piece "Shack on Beach and Station." This one goes deep on Pat individually:

- 1967 dune-line partnership with Mike Lee → 1969 buyout of Island Surf Shop at Beach and Station
- Two-time Texas Gulf Coast Surfing Champion + Dewey Weber team
- Robert August / *Endless Summer* orbit, San Blas 1969
- Chain of ~12 Pat Magee's stores across Texas
- T-shirt legacy: Hang Ten / O.P. exclusives, Beach Boys + Jimmy Buffett sponsorships
- 1980s oil bust → 1990s–2000s real-estate contraction → 36-year run closes in 2005
- Co-founds Texas Surf Museum with Brad Lomax in Corpus Christi the same year

Sources: Bend Magazine profile, Pat Magee's official shop history, Texas Surf Museum exhibit page, Port Aransas Visitors Guide, 2005 *South Jetty* retirement coverage via Portal to Texas History.

**A note for you personally:** Winston's instruction was to write the public-record legacy version — any personal relationships held for a later piece. If you know anything firsthand about Pat, his circle, or the shop's later years that should land in a second piece, tell us and we'll sketch it.

Total Heritage count is now **23 published pieces** (22 standard Heritage + the Sandfest piece).

### Dispatch tip form (commit `0dd95e1`)

Live at **`/dispatch`** — bottom of the page, "Send a Tip" card.

Incident that triggered this: on 2026-04-22, Julie Janda (Nick's mom) tapped the old "Send a Tip" mailto button. iOS Mail opened with subject pre-filled. She hit send without adding a body. We received a blank email.

Root cause: the old button was a `mailto:` link with zero server involvement, zero validation, zero record. Users without a default mail client configured could click it and have nothing happen.

New flow is an inline form on `/dispatch` itself:
- Required tip textarea (min 10 characters, validated both client and server side — blank sends are blocked).
- Optional name + contact (leave both blank for a truly anonymous tip).
- POSTs to a new `/api/dispatch/tip` handler.
- Sends via Resend (our transactional email provider) to both `admin@` and `hello@` with full structured formatting.
- Success state renders in place with a `check` silhouette.
- Error fallback tells the user to email `hello@` directly.

Belt-and-suspenders: every tip now lands in the inbox with structured formatting *and* works for users without a default mail client.

### 3 new directory listings (inbound vendor requests, 2026-04-22)

- **Portable Detail Service** (Miguel Cantu) — emailed `hello@` introducing himself: on the island since 1992, business since 1994, mobile RV detailing + undercoating. Added under `/services`. Phone (361) 673-8195.
- **Salty Beach Babes** — boutique at 345 N Alister St, Suite F1. Added under `/shop`. Phone still blank — we couldn't verify it, flagged to collect from the owner.
- **Barefoot Beans** — coffee shop at 345 N Alister St, Suite E1. (361) 339-2120, daily 6 AM–4 PM, organic / fair-trade, nitro cold brew. Added under `/eat`.
- **Aloha Açaí** — already live at `/eat` before Kaitlin Howse's request mentioned it. We briefly duplicated it under the Açaí spelling and caught the duplicate same-session. The original (more complete) entry is the one that stayed.

All three came through as emailed asks. Reply sent to Kaitlin confirming.

### Featured Spots rebalance (commit `6f8651f`)

Swapped **Red Dragon Pirate Ship** (out) for **Aloha Açaí** (in) on the homepage's 9-tile Featured Spots section.

Reasoning: Red Dragon is the most tourist-bureau-adjacent of the three "do" entries and reads least local. Deep Sea HQ keeps the real fishing anchor slot; Woody's Last Stand keeps the family-friend slot. Dropping one "do" tile rebalances toward "eat" with Aloha Açaí, which also promotes one of the three new Alister Square corridor businesses added the same day.

Final 9 tiles: Venetian Hot Plate · Tortuga's · Aloha Açaí (eat ×3); The Gaff · Bron's Backyard (drink ×2); The Tarpon Inn (stay); Deep Sea HQ · Woody's Last Stand (do ×2); Saltwater Gypsies (shop).

### Miguel routing through `/maintenance`

Winston's call — instead of building a separate detailing portal, we added "Detailing / Wash" and "RV Undercoating" to the `/maintenance` service-type dropdown. Customer requests flow to John Brown like any other maintenance service; John knows to call Miguel on detailing jobs. Preserves John's relationship-based routing (his actual competitive advantage) and costs us two strings in an array. Easy to graduate Miguel to a direct-to-vendor lead-blast later if volume justifies it.

### Email signature standardized

Every transactional email from PAL (6 templates: rent, rent/confirm, beach, beach/confirm, maintenance, maintenance/confirm) now ends with exactly:

> — The Port A Local

Em-dash, capital T, capital P, capital L. No trailing "team." No individual name.

Why: Winston wants the signature to read as both an entity and a single person simultaneously — ambiguous by design. "Team" sounds corporate; an individual name breaks the editorial / anti-Bureau posture. "The Port A Local" holds both — it's the publication *and* it's how a local would describe themselves in the third person. This rule now applies to every future draft: auto-responders, vendor replies, replies to inquiries, everything.

### A2P 10DLC fix (under the hood)

Background context you don't necessarily need but should know happened: our Twilio SMS compliance campaign (A2P 10DLC — the thing that lets us send transactional SMS from a US number without it getting blocked) came back FAILED. Root cause: our three forms (maintenance, rent, beach) bundled SMS consent into the submit-button language ("By submitting, you agree to... and consent to receive SMS"). The regulator reads that as *required* consent — which violates CTIA rules.

Fix shipped: SMS consent is now its own **unchecked-by-default checkbox** on each form — *"Text me confirmations and updates about this request (optional). Msg & data rates may apply. Reply STOP to opt out."* — separable from form submission. Customers can complete the transaction without opting in; only affirmatively-opted-in customers get SMS.

Campaign resubmitted the same day with the fixed flow. **Status: IN_PROGRESS at TCR** (the regulator). Expected timeline 1–5 business days. All email confirmations still flow; SMS flips on automatically when approved.

---

## 5. What's still pending you / next moves

**Icons — active:**
1. **Review the icon rollout on the live site.** Any that read poorly at nav size, chip size, or on dark backgrounds — flag them. One-line SVG swap in `PortalIcon.tsx`, no call-site changes.
2. **Tier 4 seasonal event emojis** — 🎃 🎄 🎭 🪁. These fall back to emoji via `EmojiIcon` because they're seasonal one-offs on `/events`. Do you want silhouettes for those, or is the emoji fallback fine for rotating seasonal content? (My honest take: emoji is fine for one-offs, but you're the designer — say the word.)

**Design-adjacent:**
3. **Email Automation — canned response templates.** Winston has the spec written at `Port A Local/Email Automation.md` — 5 canned templates for `hello@` (Listing added, Listing update confirmed, Customer booking follow-up, Press inquiry, Polite decline). He implements the filter rules + auto-responders in the Workspace UI in ~20 min, but the *copy* of those canned responses is worth your eye before they're live. Low-lift, high-leverage.

**Brand — looking further out:**
4. **Brand lockup formal-lock decision.** We're deliberately *not* locking the full lockup (lighthouse + wordmark + coordinates strip) yet. We want to ship 3–4 more brand surfaces first — Twitter/X profile + banner, Instagram profile + highlight covers, merch mock — and see whether one canonical lockup covers everything, or whether we need 2–3 approved configurations. Current surfaces: FB profile + banner (pure photo, no lockup overlay, "Straddle the Rail" 1939 Russell Lee FSA image), 19 OG share cards + 150+ per-route OG cards (lockup), transactional emails (lockup), all print QR posters (lockup), footer (lockup). Decision gate: after merch + IG + Twitter, we review together and lock.

---

## Notes + open questions

- The iteration model is genuinely cheap. I'm not selling you on 55 silhouettes we then refuse to change. Flag anything off — I'd rather rebuild 10 icons you don't like than ship a library you half-trust.
- If you want, I can package this as a clickable checklist in a shared note (Google Doc, Notion, wherever) so you can tick off "reviewed" per surface. Let me know.
- Winston's next priority once icons settle: **engage a Texas business attorney** for platform T&C + vendor agreements + indemnification language (the marketplace-liability layer for the cart portal). Mentioning it here because it's the next big thing he'll be coordinating with you on — specifically on what the brand-voice version of customer-facing legal copy should read like once the attorney drafts the core.

That's the full rundown. Live at https://theportalocal.com. Send notes however's easiest — text to Winston, email to haveebot, in-person, pasted screenshots in chat, a PDF — whatever fits the moment.

— The Port A Local
