# PAL Strategy Notes — Batch 2 (2026-04-28)

_Six items from Winston's Apr 28 PM batch. Code wins shipped separately (commit 32f1b1f). This doc covers what needs Winston input, design, or staged build before shipping._

---

## 1. Facebook integration + automation — what's possible

### Capabilities I have right now
- **Zero direct FB integration.** I can't post to a PAL FB Page, can't read/reply to Messenger threads, can't pull insights, can't manage ads. No tools loaded.
- **Through Meta APIs, almost everything is buildable.** Meta Graph API + Marketing API + Messenger Platform are well-documented; the friction is auth + app review.

### What we'd need (one-time setup Winston-driven)
1. **Meta Developer App** — register PAL as a Meta app at developers.facebook.com. Free.
2. **Page-level Page Access Token** — Winston grants the PAL FB Page to the app. Token stored in Vercel as `FB_PAGE_ACCESS_TOKEN` (Sensitive).
3. **Permissions to request** (subset, depending on what we want):
   - `pages_manage_posts` — auto-publish to the PAL Page
   - `pages_messaging` — read + send Messenger DMs
   - `pages_read_engagement` — comment moderation, post insights
   - `ads_management` — programmatic ad creation/edit/spend (later)
4. **App Review** — Meta requires manual review for production permissions. Takes 5–10 business days the first time. Subsequent permission additions are faster.

### What we can automate (priority-ordered)

| What | Lift | Value | When |
|---|---|---|---|
| **Auto-post Heritage drops to PAL FB Page** | 2 hr | High — turns 24 Heritage pieces into a content engine on FB | Phase 1 |
| **Auto-post Dispatch articles** | 30 min after Heritage shipped | High | Phase 1 |
| **Auto-post event hub launches** (Sandfest, DSR, TWAT) | Same shape, 30 min | Med-High | Phase 1 |
| **Daily PAL Pulse digest as FB post** | 30 min | Med | Phase 1 |
| **Messenger DM auto-reply for common questions** | 4-6 hr (NLP routing) | Med | Phase 2 |
| **Customer inquiry → Messenger relay** | 2-3 hr | Med (extends inquiry inbox into FB) | Phase 2 |
| **Comment moderation + sentiment alerting** | 4-6 hr | Med | Phase 3 |
| **Programmatic ad campaigns from analytics signals** | 8-12 hr | High once we have Phase 1 + 2 | Phase 3 |
| **FB Marketplace listings cross-post for /locals/sell** | 4-6 hr (manual at first; FB throttles automation) | Low-Med | Phase 4 |

### What's blocked / not worth it
- **Direct Messenger replies as Claude** — Meta's Messenger Platform is for businesses replying to users, not user-to-user. Workable for PAL's customer-service voice; not workable as a "talk to Claude" interface for end users.
- **FB Stories / Reels automation** — Meta heavily restricts video automation; needs human-in-loop.
- **Cross-platform Instagram automation via the same API** — Instagram Graph API is sibling; if we want IG too, scope adds 30%.

### Recommendation
Start with Phase 1 — auto-publish Heritage + Dispatch + event launches to the PAL FB Page. ~3-4 hours of setup once Meta auth is done, then it runs forever. That alone would 4× the social footprint with zero ongoing operator cost. Phase 2+ when volume justifies.

---

## 2 + 3. Vendor sourcing — golf carts + restaurants (dual-purpose marketing)

### The pattern
Winston wants two new "list with PAL" funnels. Each does **two jobs at once** with the same page:
- **Job A (vendor side):** capture contact info from a vendor who wants to be listed
- **Job B (customer side):** market the existing service (carts available, delivery available)

The dual-purpose insight: prospective vendors land on the page from FB ads we'll run; existing customers ALSO land there from organic search. The page should serve both audiences without compromising either.

### Golf cart vendors → `/rent/vendor` (proposed)

**What to capture (form fields):**
- Business name + DBA
- Owner / primary contact name + role
- Phone (preferred contact) + email
- Fleet size (4-pass, 6-pass, 8-pass — counts for each)
- Cart age + condition note
- Service area (Port A only? Aransas Pass too?)
- Insurance carrier + commercial liability policy number (collected, not displayed)
- Pickup / delivery offered? (matches /rent's handoff toggle)
- Pricing they want to set (daily / weekly rates)
- Photos (mailto: hello@ pattern, no upload tax)
- Standard 18+/legal-business attestation
- Free-form "anything else"

**Marketing copy on the same page (above the form):**
- Short pitch: "We send local + visitor cart demand straight to your door. Vendors keep 100% of their rental rate. We charge a flat $10/day reservation fee paid by the customer."
- Trust signals: "Vetted local vendors only · Stripe-collected reservation fees · No subscription, no monthly minimums · You set your own rates"
- Three-bullet "what we ask of you": clean carts, on-time delivery, 24/7 reachable phone for the cart logistics window
- Where renters come from: theportalocal.com → /rent (link)

**Submit goes to:** admin@ + Wheelhouse mirror (new pinned thread "PAL Carts — vendor pipeline")

**Status:** scaffold ready to build; ~1 hour. Defer until Winston confirms field list + the 18+ attestation is appropriate for commercial vendors (they'd typically be LLCs not individuals — different attestation language).

### Restaurants → `/deliver/restaurant` (proposed)

**What to capture (form fields):**
- Restaurant name
- Owner / primary contact name + role
- Phone + email + best contact-window hours
- Address (auto-fills service-area distance)
- Hours of operation (per-day grid)
- Menu URL or "we'll help you build one"
- Current order tech: do they have POS integration that exports orders? (Toast / Square / Clover / paper)
- Delivery fee they want PAL to collect (or use PAL default — $5)
- Markup model preference: 45% (default — resort-town pricing) or custom
- **Closed-loop runner option** (toggle): "I want my employees to be eligible PAL runners exclusively for orders from my restaurant. Same pay structure as regular runners ($20/run typical, more for distance + tip)." (See Section 4 for full design.)

**Marketing copy on the same page:**
- Pitch: "We bring delivery to your restaurant without forcing you to integrate with a third-party platform. We pick up, we deliver, customer pays direct via Stripe."
- Stats card: deliveries this week from existing restaurants, average ticket size, runner roster size
- "Why us vs DoorDash / UberEats / GrubHub": local runners, lower customer fees, no per-order commission to YOU (we charge customer-side, your menu price stays your menu price), opt-in closed-loop option, you keep the customer relationship

**Submit goes to:** admin@ + Wheelhouse mirror (new thread "PAL Delivery — restaurant pipeline")

**Status:** scaffold ready to build; ~1.5 hours including the closed-loop toggle UX. Defer until restaurant-as-runner design (Section 4) is locked.

---

## 4. Restaurant-as-runner closed-loop option — KILLED 2026-04-28

**Status:** abandoned per Winston. Violates PAL's core open-marketplace + agnostic-runner-pool ethos.

**Why it was killed:**
- **Two-tier runner queues are gatekeeping.** Locking a runner to a single restaurant means they don't compete in the open queue with everyone else. Regular runners would see fewer orders because closed-loop runners siphon them off. That's exactly the kind of segmented marketplace PAL avoids.
- **Conflict-of-interest risk.** A restaurant employee acting as the delivery runner is structurally biased on any dispute (food quality, missing items, customer complaints).
- **Slippery slope to pay-to-play.** "Closed-loop" today is a free favor; tomorrow it becomes a paid tier. We don't want that path open.
- **PAL doesn't gatekeep** (per `feedback_pal_doesnt_gatekeep.md` — north-star principle): every runner sees every order, every customer gets the same dispatch process. Closed-loop breaks that.

**What we kept:**
- The /deliver/restaurant signup page itself — restaurants still apply, still get the open-marketplace runner pool, still pay zero commission.
- The intent capture + Wheelhouse pipeline thread.

**What was removed:**
- The closed-loop opt-in checkbox on the form
- The collapsible explainer block
- The `closedLoopOptIn` field from the API + dispatch helper interfaces
- Campaign B3's "closed-loop angle" body copy in the FB brief — replaced with an "open-marketplace" angle that doubles down on the agnostic-pool framing

**The schema impact this would have had** (preserved here only as a record of what we considered, not a build path):
- `delivery_drivers.restaurant_lock_id` — DEAD
- `delivery_restaurants.allows_closed_loop` — DEAD
- Orders-feed filter changes — DEAD

If a restaurant later wants their employee to drive: they apply through the standard `/deliver/runner` flow like every other runner. They take the same orders as everyone else. No special treatment.

---

## 7. PAL Gmail tree config — what's needed

### What "manage all" requires
For me to read and send from `hello@`, `admin@`, `bookings@theportalocal.com` (and any other PAL Gmail trees), the cleanest pattern is **Gmail App Passwords + IMAP/SMTP**, mirroring the existing `haveebot_mail.py` script.

### Setup checklist (Winston-driven, not something I can do for you)

1. **Verify each PAL Gmail address exists.** If they're aliases routing to one master, the auth happens at the master level. If they're separate Workspace accounts, each needs its own setup.

2. **For each address that has its own login, generate an App Password:**
   - Workspace admin enables "App Passwords" (Settings → Security → 2-Step Verification → App Passwords). Requires 2FA on the account.
   - Generate a 16-character app password. **Don't paste it back to me in a Claude chat** — write it to a file, then I'll consume from there.

3. **Store the credentials in `workspace/.env`** (gitignored):
   ```
   PAL_HELLO_EMAIL=hello@theportalocal.com
   PAL_HELLO_APP_PASSWORD=<paste here>
   PAL_ADMIN_EMAIL=admin@theportalocal.com
   PAL_ADMIN_APP_PASSWORD=<paste here>
   PAL_BOOKINGS_EMAIL=bookings@theportalocal.com
   PAL_BOOKINGS_APP_PASSWORD=<paste here>
   ```

4. **Build `workspace/scripts/pal_mail.py`** mirroring `haveebot_mail.py`:
   - Subcommands: `read`, `unread`, `search`, `attachments`, `send`
   - Per-account flag: `--account hello|admin|bookings`
   - Shares the same patterns + UX as haveebot_mail
   - Add to the cross-project pattern doc

5. **Bootstrap the Wheelhouse mirror** — every new mail in any PAL inbox could optionally fire into a "PAL Inbox" thread with sender + subject line. Watch-and-mirror, not bidirectional.

### Re: "I think I'll need to direct Taylor through workstation"
Read this two ways:
- **(a)** Taylor is a person who manages PAL's Google Workspace and you'll route through them to set this up — that works. I just need the app passwords once they're generated.
- **(b)** Taylor is a typo for Tyler (the sell-mode locals vendor) — doesn't fit this context, ignore that read.

If it's (a): the steps above are what Taylor (or you) need to execute in the Workspace admin console. After that, I build the script and we're operational.

### Build estimate (script side)
1.5 hours total: 1 hr to mirror haveebot_mail.py, 30 min to test against the actual accounts and add the multi-account flag.

---

## 9. City services positioning — agent research findings

Full research at [Port A Local/Features/City Services Hub — Research Brief.md](Port A Local/Features/City Services Hub — Research Brief.md). Headlines:

### "My Port A App" verdict
**Thin shell.** It's a GOGov white-label template (same vendor ships 600+ near-identical city apps — "My La Quinta," "My Eastvale," etc.). Released Feb 9, 2026. Currently has 1 App Store rating. Cost: GOGov entry tier is ~$2,500/yr, far from the "significant money" framing Winston heard. Worth a public-records request to confirm actual contract size, but don't budget on the assumption it's a big spend.

What the app does: push notifications + tile of links to existing city web pages. **No transactions.** No bill payment, no permit purchase, no in-app forms. The city's "Report a Concern" is still a custom WordPress form, not a GOGov 311 module.

### PAL's positioning vs. the city app
PAL should be the **discovery layer**, not the transaction layer:
- We host the unified hub on the open web (no app install required)
- Deep-link into the city's existing portals (MunicipalOnline / OpenGov / MUNIRevs / Paylocity) for actual transactions
- City keeps system-of-record + their app
- PAL becomes the front door — and that's a partnership pitch, not a competitive threat

### Top 5 high-value PAL integrations (from the research brief)
1. **Emergency / weather alerts as a PAL banner** — subscribe a PAL phone/email to CivicPlus, fan out to a site banner. Matches the app's only real moat (push) on the web with zero install.
2. **Council meeting digests** — scrape CivicWeb weekly, summarize the agenda + minutes in PAL voice. Editorial muscle GOGov can't ship.
3. **Beach permit "where to buy" map** — overlay the directory businesses that sell permits. The city's page just says "various vendors."
4. **Calendar unification** — RecDesk + library + marina + chamber feeds into one PAL `/calendar`. Each is currently a separate destination.
5. **Beach conditions widget** — Texas Beach Watch advisories + NOAA tide/wind + flag status. None of this is in My Port A. Whoever owns "what's the beach like right now" owns the local mobile market.

### Recommendation
Build the **emergency-alert banner** first (highest leverage, mirrors the app's only differentiator), then **council digests** (editorial wedge), then the rest. Roll the suite up under a `/city` or `/services` namespace once 3-4 are live. Each integration is 1-3 hours of code + the data subscription.

---

## 10. Decision needed — alert delivery channel

You asked: "let us know where to send your alert to - send through FB message as well if we integrate."

Right now, every PAL form (signup, inquiry, offer, housekeeping, etc.) routes to:
1. `admin@theportalocal.com` (you) — via email
2. `hello@theportalocal.com` (you + Collie) — via email
3. **Wheelhouse pinned thread** — visible at `/wheelhouse` after sign-in

That's the existing pattern. **For the new vendor signup pages (golf carts + restaurants), I'd default to the same:** admin@ + hello@ + Wheelhouse mirror, no FB Messenger yet (FB integration is Section 1 — separate decision).

**Three things I need from you:**

1. **Alert priority tiers** — should vendor signups be a separate inbox / Wheelhouse thread? Right now everything dumps into admin@. With cart vendors + restaurants + runners + housekeeping + locals + maintenance, the signal-to-noise gets thin. Recommend: per-vertical Wheelhouse pinned thread (already the pattern; just keep extending). Per-vertical SUBJECT-line tags in the admin email so Gmail filters can sort them.

2. **Phone-as-alert-channel?** Some signups (vendor commitments, restaurant onboarding) are time-sensitive enough to warrant SMS-to-Winston. We have Twilio infrastructure for /deliver but not configured for ops alerts. Worth ~30 min build if you say yes.

3. **FB Messenger for ops alerts?** Once Section 1 is live, we could pipe high-priority alerts to a PAL Page DM that you read via your phone's FB app. That's about ~1 hr to wire up after the Page Access Token is set. Lower priority than getting Page-post automation going first.

**Proposed default for the new signup forms (until you say otherwise):** admin@ + hello@ + Wheelhouse mirror, with SUBJECT-line vertical-tag (e.g., `[CART VENDOR]`, `[RESTAURANT]`).

---

## What's ready to build (priority order, Winston picks)

In order of leverage:

1. **Vendor signup pages — `/rent/vendor` + `/deliver/restaurant`** (~3 hr) — unblocks Section 2/3 marketing. Embeds the closed-loop opt-in for restaurants.
2. **Emergency alert banner** (~2 hr) — highest-leverage city integration. Site-wide visibility.
3. **Restaurant-as-runner schema + flow** (~4 hr) — full Section 4 build. Defer until Section 3 is live.
4. **Council digest scraper + Heritage-style mini-digests** (~4 hr) — editorial wedge against the city app.
5. **FB Page-post automation Phase 1** (~3-4 hr after Meta auth) — 4× the social footprint.
6. **PAL Gmail script + Wheelhouse-mirror inbox watcher** (~2 hr after app passwords) — enables me to read/send from PAL accounts at scale.

Pick whichever calls to you. No order required.
