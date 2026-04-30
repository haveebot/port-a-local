# Build Brief — Locals Sell-mode Stripe Connect Onboarding

_Status: Designed, ready to build. Filed 2026-04-27 PM as the top rock for the next session._

---

## Goal in one sentence

Let approved sell-mode vendors on /locals onboard themselves to Stripe Connect Express via a magic link in their approval email, so when a customer buys their listing, the vendor's payout cents land directly in the vendor's bank automatically — no manual PAL relay.

---

## Why this is the top rock

The locals sell-mode purchase email cascade shipped 2026-04-27 PM (commit `134619b`). It already supports Stripe Connect — when a Listing has `stripeAccountId` set, the buy-now Checkout uses `payment_intent_data.transfer_data.destination` to auto-route the vendor's amount into their Connect account. Verified in `src/app/api/locals/buy/[listingId]/route.ts` lines 161–178.

**But there's no flow for vendors to GET a `stripeAccountId`.** Currently the cascade falls back to "PAL holds funds, manual payout" when the field is missing. That works for the first 1–3 vendors but doesn't scale. This rock unblocks the whole vertical — every approved sell-mode vendor onboards themselves, payouts go on autopilot.

Plus: same cascade ships the vendor a "you sold X" email already. After this rock, the vendor sees "$Y is in your Stripe Express account" instead of "Winston will pay you out manually."

---

## Reference implementation — copy the runner Connect flow

The runner side is fully built and live. **Mirror it.** Don't invent.

**Existing runner files (read these first):**
- `src/app/api/deliver/driver/connect/start/route.ts` — creates Express account + Account Link onboarding URL (95 lines)
- `src/app/api/deliver/driver/connect/dashboard/route.ts` — opens runner's Stripe Express dashboard via `createLoginLink` (51 lines)
- `src/app/api/deliver/driver/connect/refresh/route.ts` — refresh-link if Stripe-hosted onboarding session expires (58 lines)
- `src/data/delivery-store.ts` lines 483–540 — `getDriverStatus`, `setDriverStripeAccount`, the `delivery_driver_status` table with `stripe_account_id` + `payouts_enabled` columns
- `src/lib/deliverStripe.ts` — `getDeliverStripe()` / `getDeliverStripeKey()` (re-use directly, no need to duplicate)

**The runner pattern is:**
1. POST `/api/deliver/driver/connect/start` — auth via cookie session → create Express account if missing → mint Account Link → return URL → frontend redirects to Stripe-hosted onboarding
2. Stripe-hosted form (identity + bank). On completion, returns to `return_url` set in the link.
3. POST `/api/deliver/driver/connect/dashboard` after onboarding — auth → `createLoginLink` → return one-time URL → frontend opens in new tab

**Auth difference for vendors:** runners have a cookie session (`pal_runner`). Vendors don't. **Use HMAC magic-link tokens** like the existing locals approve/reject/verify-photos flow already does — same `ADMIN_APPROVAL_SECRET`, same HMAC-over-`${id}:vendor-connect` shape with a distinct suffix so leaked approval links can't replay against connect.

---

## Architectural fork — read this before coding

The `Listing` interface (in `src/data/locals-types.ts`) has `stripeAccountId?: string`, but the `LISTINGS` array (in `src/data/locals-listings.ts`) is hand-curated TS — Winston manually copies approved offers into it. The `locals_offers` DB table holds the offer side but doesn't have a `stripe_account_id` column yet.

**Two paths:**

### Path A — extend `locals_offers` table (recommended)
- Add `stripe_account_id TEXT` + `stripe_payouts_enabled BOOLEAN DEFAULT FALSE` columns to `locals_offers` (idempotent migration in `ensureSchema()`)
- Vendor onboarding writes to the OFFER row (since the offer IS the vendor's record once approved)
- Winston's manual "promote offer to listing" step copies `stripeAccountId` from the offer into the TS `LISTINGS` entry
- Cascade keeps reading `stripeAccountId` from the Listing (no cascade change needed)

✅ **Recommended** — minimal moving parts, eliminates the dual-source-of-truth question, doesn't refactor the live cascade. Manual promote-to-listing stays as-is.

### Path B — DB-back the listings entirely
- New `locals_listings` table, `LISTINGS` becomes a query result
- Approved offer auto-becomes a draft listing
- Wheelhouse "promote draft to active listing" tool

❌ **Not yet** — bigger refactor, breaks the cascade until DB seeded with the existing TS entries (Tyler is the only one currently). Defer to v2 when there are ≥5 sell-mode listings.

**Build Path A.** When deferred Path B becomes the move, the offer-side stripeAccountId column carries over cleanly.

---

## Build plan (specific files + edits)

### 1. Schema + helpers
**File:** `src/data/locals-store.ts`

Add to `ensureSchema()`:
```sql
ALTER TABLE locals_offers ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE locals_offers ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE;
```

Add to `LocalsOfferRecord`:
```ts
stripeAccountId: string | null;
stripePayoutsEnabled: boolean;
```

Add to `rowToOffer`:
```ts
stripeAccountId: (row.stripe_account_id as string) ?? null,
stripePayoutsEnabled: row.stripe_payouts_enabled === true,
```

Add new helpers:
```ts
export async function setLocalsOfferStripeAccount(
  offerId: string,
  stripeAccountId: string,
  payoutsEnabled: boolean,
): Promise<LocalsOfferRecord | null>

export async function getLocalsOfferByStripeAccount(
  stripeAccountId: string,
): Promise<LocalsOfferRecord | null>  // for webhook lookup
```

### 2. HMAC helpers (or reuse existing)
**File:** `src/lib/locals-hmac.ts` (likely already exists for approve/reject — check first)

Add a `signVendorConnect(offerId)` / `verifyVendorConnect(offerId, sig)` pair using the same `ADMIN_APPROVAL_SECRET` and a distinct payload suffix (`${offerId}:vendor-connect`).

If the existing locals approve/reject HMAC is inline in the route file, refactor into shared `src/lib/locals-hmac.ts` first — this is the third reason to share it (approve, reject, verify-photos, vendor-connect).

### 3. Three new API routes (mirror runner structure)
**File:** `src/app/api/locals/vendor/connect/start/route.ts`
- POST `?id=OFFER_ID&s=SIGNATURE`
- Verify HMAC → load offer → require `approvedAt` not null
- If `stripe_account_id` not set, `stripe.accounts.create({ type: "express", ... })` with metadata `{ offer_id, source: "pal-locals-sell" }`
- `setLocalsOfferStripeAccount(offerId, accountId, false)`
- `stripe.accountLinks.create({ refresh_url: /locals/vendor/${id}?s=${sig}&from=stripe-refresh, return_url: same with from=stripe-done, type: "account_onboarding" })`
- Return `{ ok: true, url }` for frontend redirect

**File:** `src/app/api/locals/vendor/connect/dashboard/route.ts`
- POST `?id=OFFER_ID&s=SIGNATURE`
- Verify HMAC → load offer → require `stripe_account_id`
- `stripe.accounts.createLoginLink(stripeAccountId)`
- Return `{ ok: true, url }` (single-use, opens in new tab)

**File:** `src/app/api/locals/vendor/connect/refresh/route.ts`
- POST `?id=OFFER_ID&s=SIGNATURE`
- Verify HMAC → mint a fresh accountLink, same shape as `start` but with existing `stripe_account_id`
- For when Stripe-hosted onboarding session expires before vendor finishes

### 4. Vendor portal page
**File:** `src/app/locals/vendor/[offerId]/page.tsx`
- Server component, reads `?s=SIG` query, verifies HMAC, loads offer
- If invalid sig → notFound()
- Renders three sections:
  1. **Your listing** — title, description, price, fulfillment plan (read from offer row)
  2. **Payouts** — status pill (`Not set up` / `Setup in progress` / `Live, payouts daily to your bank`)
     - Big CTA: "Set up Stripe payouts →" if not started → POST to `/api/locals/vendor/connect/start` → redirect
     - Or: "Open Stripe dashboard →" if `payouts_enabled=true` → POST to `/api/locals/vendor/connect/dashboard` → open in new tab
     - Or: "Continue Stripe onboarding →" if started but not enabled → POST to `/api/locals/vendor/connect/refresh`
  3. **What happens when you sell** — receipt-style "$X to you / $Y PAL fee = $Z customer pays. Funds land in your Stripe account on every sale."

Mirror the visual style of `/deliver/driver/payouts/` page — same coral status pills, same disclosure copy.

### 5. Update the approval email
**File:** `src/app/api/locals/offer/approve/route.ts`

When mailing the vendor "You're in" email after approval, include the magic link to the vendor portal:
```
🎉 You're live on PAL Locals.

[Set up Stripe payouts →]   ← link to /locals/vendor/${offerId}?s=${sig}

Set this up once and every sale auto-deposits to your bank within
1–2 business days. Skip and we'll relay payouts manually until you do.
```

Plain-text version for clients that strip CTAs.

### 6. Stripe webhook to flip `payouts_enabled`
**File:** `src/app/api/locals/vendor/webhook/route.ts` (NEW)

Listen for `account.updated` event:
- Find the `locals_offers` row by `stripe_account_id`
- If `account.payouts_enabled === true` AND our row has `stripe_payouts_enabled = false`, flip it
- Optional: send vendor a "you're set up — sales now auto-payout" email

Register this webhook URL in Vercel Stripe dashboard. (Alternative: poll on the dashboard route if vendor visits — simpler, less reliable. Webhook is the right move.)

---

## Test plan

**Pre-build:** confirm Stripe Connect is enabled on the platform — log into Stripe dashboard → Connect → Overview. (Already enabled per runner flow being live.)

**Local test (after building):**
1. Submit a sell-mode offer at `/locals/offer?mode=sell` (use a real test email)
2. Approve via the magic link that lands at admin@
3. Check approval email — verify the vendor portal magic link is present
4. Click the vendor portal link → confirm the page renders, payout status reads "Not set up"
5. Click "Set up Stripe payouts" → redirects to Stripe-hosted onboarding (use Stripe's test data: `000-00-0000` SSN, test bank `110000000` / `000123456789`)
6. Complete onboarding → returns to vendor portal with `?from=stripe-done`
7. Webhook fires (or wait a few seconds, refresh the page if no webhook) → status flips to "Live, payouts daily"
8. Manually add the offer's `stripeAccountId` to the TS `LISTINGS` array (or build the cascade-side helper that reads from offer row in step 7 of v1.1)
9. Test a buy-now end-to-end → verify Stripe Checkout uses `transfer_data.destination` and the vendor's amount routes correctly

**Smoke (after deploy):**
- Same flow against production with a real test card and Stripe test mode if available

---

## Edge cases worth thinking about

1. **Vendor abandons mid-onboarding.** Stripe Account exists, `payouts_enabled=false`, no funds flow. Cascade falls back to manual payout. ✅ already handled.
2. **Magic link leaked.** HMAC sig prevents anyone but the holder of the offer ID + secret from accessing the portal. Token doesn't expire (mirroring runner pattern); rotate `ADMIN_APPROVAL_SECRET` if compromise suspected.
3. **Vendor wants to update bank info.** Click "Open Stripe dashboard" from the vendor portal → Stripe-hosted self-service. We don't custody bank details.
4. **Vendor's Connect account gets restricted by Stripe.** `account.updated` webhook flips `payouts_enabled=false`. Cascade falls back to manual. Notify Winston via Wheelhouse mirror.
5. **Two offers from the same person.** Each offer gets its own `stripe_account_id` — that's wrong. Either: (a) detect by phone/email and reuse the existing account, (b) leave it (Stripe allows multiple Express accounts per individual). For v1, leave it. Document as known limitation.
6. **Test mode vs live mode.** PAL is currently live-mode for /deliver. Sell-mode buy-now uses the same `STRIPE_SECRET_KEY` so it's also live. Vendor onboarding will create REAL Connect accounts requiring REAL identity verification. **This is correct** — Tyler will be a real vendor, not a test vendor. Just be aware when testing.

---

## Open questions for Winston (decide first 5 minutes of session)

1. **Path A confirmed?** ("Yes, extend offers row, manual promote-to-listing stays.") — vs Path B refactor.
2. **Vendor portal URL pattern.** `/locals/vendor/[offerId]?s=SIG` (recommended, matches existing locals magic-link pattern) vs `/locals/vendor?token=...` (token-as-opaque) vs cookie-session (overkill for v1).
3. **Does the approval email currently exist?** Check `src/app/api/locals/offer/approve/route.ts` lines ~60–160 — if there's no vendor email yet, this rock includes building one. (Likely YES based on the morning brief saying "verify=live" subject "You're in" — confirm.)
4. **Webhook vs polling for `payouts_enabled` flip?** Webhook is cleaner. Polling on dashboard-page-load is simpler. Defer to webhook.
5. **Does Tyler get an email about this when it ships?** "Hey, payouts setup is now live, here's the magic link" — yes, send a one-shot to existing approved sell-mode vendors.

---

## Time + commit shape estimate

- **Schema + helpers:** 20 min
- **HMAC refactor (if needed):** 15 min
- **Three API routes (start/dashboard/refresh):** 45 min
- **Vendor portal page:** 45 min
- **Approval email update:** 15 min
- **Stripe webhook handler:** 30 min
- **Test + ship:** 30 min

**Total:** 3 hours sketched, probably 1.5–2 in practice with the runner flow as a copy template.

**Commit shape:** one big commit titled `PAL Locals: Stripe Connect onboarding for sell-mode vendors` covering all of the above, mirrors how the original cascade shipped as one commit (`134619b`).

---

## Pickup-here

When this brief is loaded into the next session:
1. Skim the runner Connect flow files (3 files, 204 lines total — quick read)
2. Check whether `src/lib/locals-hmac.ts` already exists or HMAC is inlined
3. Confirm the existing approve email shape
4. Answer Winston's 5 open questions in <5 min
5. Build in the order: schema → routes → page → email → webhook → test → ship

The Wheelhouse mirror already handles sale events — when a vendor with Connect set up makes a sale, the existing cascade auto-uses `transfer_data.destination`. NOTHING on the cascade or mirror side needs to change. This rock is purely additive.
