# HeyeDeploy — iOS App Build + Update Pattern

_Cross-project pattern doc | applies to all Heye Lab tenants that warrant a native app | initial filing 2026-04-28 from PAL session_

---

## Why this doc exists

Nick is shipping iOS app builds for PAL via TestFlight. Every Heye Lab project that reaches a certain scale will likely want the same. Codifying the trigger + the build-update best practices means we don't reinvent it three more times for CrossRef, Sage Em, and whatever comes next.

This doc covers:
1. **When** to start building an iOS app for a Heye Lab project (the "x" point)
2. **What** best practices to follow once we start
3. **How** the app stays in sync with the web platform (the canonical source of truth)
4. **Where** the per-tenant work fits the three-tier HeyeDeploy hierarchy

Companion to `feedback_heyedeploy_pattern_thinking.md` (meta-rule) and `feedback_wheelhouse_cross_project_pattern.md` (sibling pattern).

---

## When — the "x" trigger

An iOS app is non-trivial overhead: TestFlight cadence, Apple review cycles, push-cert management, version-skew bugs, App Store metadata. **Don't start one until the web has earned it.** Specific triggers we'll use:

A Heye Lab project is ready to start an iOS app when **two** of the following are true:

1. **Repeat-engagement pattern** — the web product has at least one daily-or-weekly user behavior (PAL: runners checking on-duty, vendors checking sales, customers checking order status). Apps live or die on push notifications + glanceable state, both of which require repeat-engagement to earn.
2. **Push-notification dependency** — there's at least one workflow where SMS or email is too slow + web push isn't enough. PAL Delivery hit this when runners needed sub-30s notification of new orders.
3. **Mobile-friendly web is plateauing** — analytics show mobile engagement metrics (session length, return rate) hitting a ceiling that desktop doesn't have. The web is doing what it can on phone — the rest needs native primitives.
4. **Real-revenue threshold** — the platform has collected at least $1k cumulative gross revenue. Below that, iOS is premature optimization.
5. **Operator capacity** — there's a builder (Nick, in PAL's case) who can carry the iOS lift WITHOUT the web team becoming the bottleneck. App needs its own ship cadence.

PAL hit triggers 1, 2, and 3 by mid-April 2026. Trigger 4 happened with the first DQ delivery 2026-04-25. Trigger 5 has been Nick all along. **All five present → app build kicked off.**

For CrossRef, Sage Em, future tenants: track these triggers explicitly. **Don't build an iOS app on vibes.**

---

## The three-tier hierarchy applied to iOS

Per `feedback_heyedeploy_pattern_thinking.md`:

- **HeyeDeploy** (framework / operating model) — this doc + the shared Xcode project template + Apple Developer account organization
- **`<Vertical>Deploy`** — vertical-specific app shell. CityDeploy (PAL's vertical) gets one app shell that handles directory, delivery, locals, etc. Other verticals (e.g. lighting industry for CrossRef) would get their own app shell.
- **Tenant instance** — per-deploy white-label of the vertical app. PAL's CityDeploy app vs. (hypothetical) "Port Isabel Local" CityDeploy app would share the shell + customize via configuration (theme, copy, business catalog, branded launch screen).

Concretely for now (PAL only): Nick's app == one CityDeploy shell == PAL tenant. The shell architecture should already be designed with multi-tenant in mind so the SECOND CityDeploy tenant doesn't require a code fork.

---

## Build + update best practices

### App architecture

- **Web is canonical.** Anything the app does, the web can do too. The app NEVER has features the web is missing (with the rare exception of native-only primitives like Apple Pay, Sign in with Apple, push). This rule is critical because:
  - Customer support stays simple ("we can do that on the website too")
  - Web SEO stays the source of truth
  - The app can't drift into a different product
- **API parity from day one.** Every screen's data flow should hit a public PAL API endpoint (or a thin app-only proxy). No iOS-only databases. No "we'll sync later." Saves us from version-skew nightmares.
- **Web-view fallback for complex flows.** Stripe Checkout, magic-link verifications, vendor onboarding — these stay in WKWebView for v1 and v2. Native-rebuild only the screens with daily-engagement patterns (runner hub, order tracking, push consent). 80/20 rule.
- **Authentication mirrors web cookies.** Use the same magic-link → cookie-session pattern. The app is just a fancy cookie jar with native widgets. Don't re-invent auth.
- **Push tokens as a column on the user record.** PAL already has `push_subscription_json` on `delivery_drivers` for web push. Add `apns_token` (Apple) + `fcm_token` (Android, if/when) for the same purpose. Same dispatch helper picks whichever is available.

### Build + version

- **TestFlight first, App Store second.** Ship every build to TestFlight for 7-14 days before App Store. Both apps support up to 25 internal testers without an Apple review.
- **Build numbers monotonic, version semantic.** Build = increment per CI run. Version = `<major>.<minor>.<patch>` mapped to web-product milestones, not app-only changes.
- **One App Store Connect organization for all Heye Lab apps.** PAL, CrossRef, Sage Em apps all live under `Heye Lab` in the developer portal. Saves $99/yr per project + simplifies signing certs.
- **Test on the lowest supported iOS version Apple still accepts** — typically iOS 16+ at time of writing. PAL's TestFlight has been on iOS 17.5 minimum; consider pushing the floor down for older-phone runners.
- **Don't skip Apple's review queue with hotfixes.** Hotfixes go through TestFlight first, even when urgent. The 24h Apple review cycle is the ceiling — if something is actually that urgent, the fix happens in the web canonical, not the app.

### Update cadence

- **Web ships continuously, app ships fortnightly at most.** Web changes don't need to wait for app review. App ships should batch a meaningful set of fixes + features, not single-bug patches.
- **Force-update floor.** App should hard-block (with a friendly message) when its version is more than 2 minor versions behind. Avoids API-shape skew burning users.
- **Backwards-compatible API changes.** Web API endpoints should never break the lowest live app version. If a breaking change is unavoidable, version the route (`/api/v2/...`) and keep the v1 alive for 60+ days.
- **Crash + analytics opt-in.** Sentry or similar for crashes. Opt-in disclosure on first launch. Privacy-respecting.

### Apple-specific operational notes

- **Push notification certificates expire annually.** Calendar reminder set to renew 60 days out. Renewal failure is silent and catastrophic.
- **Apple Developer membership is $99/yr per organization.** Heye Lab has the org account; tenants don't need their own.
- **Sign-in with Apple is required for any app that has any third-party login (including magic links to Google/Apple emails).** PAL's magic-link flow may or may not trigger this — flag for review.
- **App tracking transparency** — PAL doesn't currently track for ads, so the prompt isn't required. Note this in the App Store metadata.
- **App Store metadata + screenshots** — re-shoot every 6 months or when major UX changes ship. Stale screenshots = lost installs.
- **PWA + native coexistence.** PAL already has a PWA install option (Add to Home Screen). The iOS app is an upgrade path. **Don't sunset the PWA** — Android users + iPad-first users will prefer it for years.

### Tenant-specific config

When CrossRef, Sage Em, or future tenants get their own app:
- App name: `<Tenant Name>` (PAL = "Port A Local")
- Bundle ID: `org.heyelab.<vertical>.<tenant>` (PAL = `org.heyelab.citydeploy.portalocal`)
- Theme + branding: load from a per-tenant `app-config.json` served by the canonical web (`https://<tenant-domain>/api/app-config`). Allows brand changes without an app rebuild.
- Push topics: scoped per tenant (no cross-tenant push leaks).
- Deep links: `<tenant-domain>` deep-links into the right native screen, with a web fallback.

---

## What goes in the app, what stays web-only

| Surface | App native? | Web only? | Why |
|---|---|---|---|
| Runner hub (on-duty, claim orders) | Native | — | Daily glanceable + push-driven |
| Order tracking (customer side) | Native | — | High-engagement, push-driven |
| Listing browse + buy (customer) | Web-view | — | Stripe Checkout in WebView; Apple disallows in-app purchases for physical goods anyway |
| Vendor portal (Stripe Connect setup) | Web-view | — | Stripe-hosted, sensitive, brittle to native rebuilds |
| Heritage + Dispatch (editorial) | Web-view | — | Long-form editorial content; web SEO is the point |
| Wheelhouse (admin) | Web-view | — | Internal-only; not worth native rebuild |
| Sign-in (magic-link) | Native | — | Must support Sign in with Apple if Apple insists |
| Push consent | Native | — | Native primitive |
| Photo capture (delivery proof, listing photos) | Native (camera) → web upload | — | Better UX than browser file picker |

Default rule: **if it's an everyday primitive on a phone, native it; if it's contentful or transactional, web-view it.**

---

## When this doc updates

- After every Heye Lab tenant's first 30 days on the App Store: revise the trigger list with whatever the data showed (was the threshold too high? too low?).
- When Apple changes a major rule (push, in-app purchase, Sign in with Apple).
- When a new Heye Lab vertical (CrossRef, Sage Em, etc.) is ready to add its own app shell.

---

## Open questions for Winston / Nick

- **Apple Developer org structure** — confirm everything is under the Heye Lab org, not haveebot personal. Migrate if not.
- **Push notification provider** — APNs direct, or going through OneSignal / Pusher? (Affects token storage shape on the API side.)
- **Apple Pay** — does PAL want it? Could replace magic-link friction for repeat customers, but bumps build complexity. File for later unless Winston pushes.
- **App Store category** — PAL probably "Local Marketplace" or "Travel" or "Food + Drink." Pick before next App Store metadata update.
- **CrossRef + Sage Em readiness** — neither is at the trigger threshold yet. Track with the same 5-trigger list.

---

## Pairs with

- `feedback_heyedeploy_pattern_thinking.md` — the meta-rule
- `feedback_wheelhouse_cross_project_pattern.md` — sibling pattern (web ops)
- `Port A Local/Features/Wheelhouse Architecture.md` — the web-side counterpart of "what goes in the app"
- `Port A Local/Features/CityDeploy — Platform Vision.md` — the vertical that PAL is the proof of
