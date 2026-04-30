# Marathon Session Review — Sat 2026-04-26 Evening

**For:** Winston · Nick · Collie
**From:** Claude (Winston's PAL build partner)
**Status:** End-of-session digest, ready for review/forward/edit

---

## Tonight's headline

**35+ commits.** Started with the morning's PAL Delivery vertical going live with real money, ran through six structured sprints + several mid-flight punch lists, ended with "PAL doesn't gatekeep" cemented as a north-star brand principle. The night took PAL from "PAL Delivery is live" to "PAL is a coherent platform with a worldview, ready for CityDeploy extraction."

### What got shipped

**Sprints A through F (the 10-point list):**
- Name scrubs (John Brown → "maintenance vendor"; Palm Family Ventures pulled from customer surfaces, kept on legal pages)
- Wheelhouse footer link + Craigslist-style "want in?" landing
- Runner ID + Insurance verification (two-stage attestation + admin verify magic links)
- Custom Stripe payouts admin tool at `/wheelhouse/payouts`
- Stripe Issuing onboarding doc filed for Q3 reapply
- Public runner leaderboard at `/deliver/runners` + homepage tile (Driver #N anonymized)
- Convenience store deliveries — Lowe's Market — Port Aransas live with 12 essentials
- Heye Lab memory mirror via `scripts/sync-memory.sh` (18 files now mirrored)

**Mid-session work:**
- Customer order tracking page modernized (live 4-stage progress bar, runner display, polling)
- $5 first-delivery welcome bonus auto-fires via Stripe Connect on delivery
- Rewards ladder UI with progress bars (Tier 1 LIVE, Tiers 2–4 marked "coming soon")
- "Powered by Heye Lab · Built on CityDeploy" footer attribution
- Web push notifications for runners (service worker + VAPID keys + dispatch hook)
- Cross-device sign-in QR codes in magic-link emails
- iPhone PWA install banner for Safari users (auto-detects iOS Chrome and gives correct guidance)
- Comforting Stripe-first language across welcome email + hub + application page
- "$14.95 backfill" path: missed-payouts diagnostic + 1-click backfill via PaymentIntent → charge resolution + source_transaction Stripe API
- Wheelhouse "re-fire admin email" tool for legacy offers
- /locals approve/reject/verify-photos magic-link suite
- /locals applicant confirmation email (was missing, parity with runner flow now)
- "Verify = live" semantic restructure (verify is the action; photos are an optional optimization, not a gate)

**Brand layer — the night's biggest non-code shipment:**
- **"PAL doesn't gatekeep"** filed as a permanent north-star principle (`feedback_pal_doesnt_gatekeep.md`). Includes 7-row gatekeeper-vs-PAL pattern table, 5-question application checklist for future product decisions, 3 tagline candidates for Collie to bless.
- Threaded into CityDeploy vision doc as the platform's competitive positioning lever vs Yelp / Google / Tourism Bureaus / Airbnb / DoorDash.

---

## For Nick

**Action items:**
- ⚠️ **GitHub admin invite still pending acceptance** at https://github.com/haveebot/port-a-local/invitations
- Once accepted, you have admin on `haveebot/port-a-local` — full keys to the kingdom (push, branch settings, add/remove collaborators, etc.)

**For the CityDeploy extraction work:**
- Memory mirror at `Port A Local/Memory/` (18 files) — the design context you'll want
- New: `Port A Local/Memory/CityDeploy — Platform Vision.md` — full framing doc, audit map, pickup-here checklist
- New: `Port A Local/Memory/feedback_pal_doesnt_gatekeep.md` — the positioning lever vs incumbent local platforms; this is the line that makes governments + chambers of commerce sit forward when CityDeploy gets pitched to other towns
- Updated: `Port A Local/Memory/project_pa_local.md` — full state of PAL as of tonight, every decision + every key file

**The platform extraction stack to keep in mind as you mine:**
- Cookie-session auth (runner hub pattern templates cleanly)
- Stripe Connect Express (per-vendor payouts, source_transaction for cold-start gap solve)
- Magic-link approval flow (HMAC-signed, distinct sigs per kind)
- Two-stage verification (acknowledge then verify, see runner ID/insurance + locals photos)
- Anti-spam-tuned email layouts via `src/lib/emailLayout.ts`
- Branded OG cards via `src/lib/brandedOG.tsx`
- Memory-mirror as a "decisions context" infrastructure pattern

**Open architectural decisions for CityDeploy v1 (no rush):**
- Theming abstraction (lift PAL's hardcoded brand into per-deployment config)
- Catalog seeding (vendor + restaurant + business directory data → CMS-shaped, not hand-curated TS)
- Domain + DNS automation (per-town subdomains/domains)
- Operator onboarding flow (a "Winston for [town]" admin path)

---

## For Collie

**Brand decisions surfaced for your review:**

1. **Tagline candidates** from the "doesn't gatekeep" principle:
   - **"PAL doesn't gatekeep."**
   - "We don't gatekeep the town."
   - "Real Port A. Unfiltered."

   Could land as a brand line, social bio, /about anchor, footer note. Owned by you for the call. Saved in `feedback_pal_doesnt_gatekeep.md`.

2. **Locals listings model:** Photos are now framed as **optional optimization, not a gate**. Listings without photos go live the moment Winston clicks "Verify." Photos boost conversion but aren't required. Lined up with the broader "no paid placements / 100% to locals / locals own their listings" voice.

3. **Runner #2 = you.** Welcome to the leaderboard, Driver #2. Test status: Stripe holding period on first payout (~7-14 days, Stripe rule for new accounts), PWA install on iPhone is the friction point most runners will hit. Post-A2P SMS becomes the friendly default fallback for iPhone users who skip the PWA install.

4. **Photo-driven workflow proven again:** Tyler's beach-gear listing came in tonight as a real test. Magic-link approval flow built mid-session; he's queued for verify on Winston's next inbox check.

**The week's open content threads (yours to weigh in on whenever):**
- Tagline test from above — pick one, kill the rest, or surface a better
- Whether "PAL doesn't gatekeep" gets a public surface (footer? /about? social?)
- Whether the runner Rewards ladder (Tier 2: $25 + PAL-branded shirt at 10 deliveries; Tier 4: Apple Watch at 250) needs your design input on the shirt or any of the merch

---

## For Winston

**Open actions awaiting you (in priority order):**

1. **Test push notifications** on your phone after dinner — PWA install on iPhone Safari, then `/deliver/driver` → Enable on the bell-icon section → place a test order from laptop → phone *bzzt*. Confirms the night's biggest UX upgrade for runners works end-to-end.

2. **Click "Verify Tyler Pate"** on the locals admin email currently in admin@/hello@ inbox. Tyler gets the "you're in" email. Mark photos verified separately when his shots arrive at hello@.

3. **Lowe's Market verification** — `611 N Alister St`, `(361) 749-6602`, 7am-10pm hours are best-guesses I marked TODO Winston: in `delivery-restaurants.ts`. Verify on first run; fix drift; or set `isActive: false` until you confirm.

4. **Stripe statement descriptor** — confirm next customer credit card statement reads "PORT A LOCAL" not "PALM FAMILY VENTURES."

5. **Stripe payout backfill** — earlier $5.65 + $9.30 transfers worked (your Stripe Express dashboard should show pending balance now). Click them whenever for the canonical-key cleanup; system'll handle the legacy rows.

**Filed-as-deferred design docs (no rush, pickup whenever):**
- `Port A Local/Features/Runner Rewards Program — Design.md` — Tier 2-4 rewards (T-shirt + Apple Watch path)
- `Port A Local/Features/Order Modification + Runner-Customer Comms — Design.md` — mid-flight order changes, Twilio proxy numbers post-A2P, saved-card upcharge support
- `Port A Local/Features/Rentals + Services Scope Expansion — Notes.md` — multi-category /rent vs /locals decision
- `Port A Local/Features/Delivery — Spec.md` — full delivery vertical reference

**Passive waits (no action):**
- A2P 10DLC TCR review (when this clears: SMS reliability for customers + dispatch goes from best-effort to ~1-5s reliable)
- Stripe Issuing reapply window (~Q3 2026, after ~30 days of Connect volume)

---

## The session arc, condensed

Started: PAL Delivery had launched morning of Apr 26 with real money flowing through (DQ test + Nick's order). Customer-side experience was barebones success page; runner-side was a token-in-URL hub.

Ended: PAL is a coherent platform — runners get push notifications, customers get live tracking, locals get a verify-and-go-live flow with no gatekeeping, the whole stack auto-handles cold-start gaps, and the brand has a north-star principle ("PAL doesn't gatekeep") that distinguishes it from every existing local marketplace and gives CityDeploy its real positioning lever.

The pivot moment: Winston's catch on the photos-as-gate framing. Pulled the principle out of the product decision. Now permanent.

Truck is full. Memory is synced. Pickup-here is documented. **Real Port A. Unfiltered.**

— The Port A Local
