# Feature Spec: PAL Delivery
_Status: LIVE (real money flowing) | Priority: Top revenue vertical | Authors: Winston + Claude_
_Last updated: 2026-04-26_

---

## Summary

PAL Delivery is a food (and small-package) delivery marketplace for Port Aransas, TX. Customers order from local restaurants through `/deliver`; PAL collects payment via Stripe; on-duty runners get pinged by SMS + email; first to claim wins; runner picks up + drops off; PAL auto-transfers payout to the runner's connected Stripe account.

Built fast (single weekend → live with real $$), distinct from the rental/maintenance/beach portals because:
- It's a real-time marketplace, not a request board
- Money flows in three directions (customer → PAL → runner; PAL keeps a margin)
- It runs on Stripe Connect Express for runner payouts
- It has a runner-facing web app with cookie-session auth

---

## Who It's For

**Customers:** Tourists and locals in Port A who want food delivered. The town's existing options are thin — DoorDash and UberEats coverage is sparse out here.

**Restaurants:** Local-only. First wave: Crazy Cajun (full menu, real hours), Dairy Queen Port A (daily 10am–9pm). PAL hard cutoff at 21:00 Central. More restaurants get added as menu data comes in.

**Runners:** Locals who want side income. Onboard via `/deliver/runner` form → admin-approved by Winston via magic-link → set up Stripe Connect Express (real bank) → toggle on duty → claim orders.

---

## Customer Order Flow

1. Land on `/deliver` → restaurant grid (open status auto-computed from per-restaurant hours)
2. Tap restaurant → menu → add to cart (cart persists per restaurant)
3. `/deliver/checkout` → structured address form (street, apt, city default "Port Aransas," state default "TX," zip default "78373"), name, phone, optional delivery notes, tip slider, SMS-consent checkbox
4. "Continue to payment" → Stripe-hosted Checkout
5. Payment succeeds → redirect to `/deliver/success/[orderId]`
6. Success page server-side verifies the Stripe session (idempotent first-transition guard) → marks order paid → mirrors to Wheelhouse → sends admin paid email → sends customer confirmation email → dispatches drivers
7. Customer gets transactional updates (email + SMS, A2P-pending) at: paid · picked up · delivered

### Pricing Math
Base item price · quantity = subtotal
+ Delivery fee: $5.00 (`DELIVERY_FEE_CENTS=500`)
+ Service fee: $2.00 (`SERVICE_FEE_CENTS=200`)
+ Tax: 8.25% on subtotal (`TAX_RATE=0.0825`)
+ Restaurant markup: 45% (resort-town pricing — covers PAL's restaurant-side margin)
+ Optional tip (100% to runner)

### Splits
- **Runner payout:** 50% of markup + 50% of delivery fee + 100% of tip
- **PAL net:** 50% markup + 50% delivery + 100% service fee + tax (paid to TX comptroller eventually)
- **Restaurant cost:** base item prices, paid out separately (manual for now — Winston handles)

---

## Runner Onboarding Flow

1. `/deliver/runner` → application form (name, phone, email, vehicle, etc.)
2. POST `/api/deliver/runner` → creates DB row in `delivery_drivers` with `status='pending'`
3. **Duplicate guard:** if phone already exists → 409 with state-aware message ("already-active" / "pending-review" / "previously-rejected")
4. Applicant gets confirmation email; admin@ gets approval email with HMAC-signed magic links
5. Winston taps "Approve" → POST to `/api/deliver/runner/approve` → status → `'active'` → token assigned
6. Runner gets welcome email with single CTA: "Open my runner home →"
7. CTA goes through `/api/deliver/driver/login?t=TOKEN&next=/deliver/driver` → sets `pal_runner` cookie (httpOnly, sameSite=lax, 30-day) → lands on the runner hub
8. Runner clicks "Set up payouts" on hub → Stripe Connect Express onboarding (Stripe-hosted: identity + bank verification) → returns to `/deliver/driver/payouts?from=stripe` → we re-check `payouts_enabled` via `account.retrieve`
9. Runner toggles "On duty" — auto-off in 4 hours unless re-toggled

### Self-Lookup (lost link recovery)
- `/deliver/driver/lookup` → enter email or phone → emails a fresh "Tap to sign in" magic link (single button)
- Used when a runner clears cookies or loses access on a new device

### Hub UX (`/deliver/driver`)
- Live polling every 20s
- On-duty toggle (big primary action)
- "Set up payouts" amber nudge until Connect onboarding done
- 3-stat earnings: today / 7-day / available
- **Stripe payouts dashboard button** (NEW 2026-04-26) — appears once payouts enabled; opens runner's Express dashboard in new tab via `stripe.accounts.createLoginLink`
- In-progress orders (claimed or picked-up) — clickable to detail page
- Available-now feed — claim button right inline
- Pulses on new order arrival
- Sign-out form

---

## Order Lifecycle

```
placed → paid → dispatching → claimed → picked_up → delivered
                                                    ↓
                                        triggerDriverPayout (Stripe transfer)
```

- **placed** — order created, payment intent not yet fulfilled
- **paid** — Stripe session marked complete; admin email + customer confirmation fired; drivers dispatched
- **dispatching** — visible in runner feed, claimable
- **claimed** — runner has it; customer notified by SMS + email
- **picked_up** — runner has tapped pickup confirmation; customer notified
- **delivered** — runner has tapped delivery confirmation; customer notified; **`stripe.transfers.create` fires** to runner's Connect balance
- **canceled / refunded** — terminal, hub-back button shown

State transitions are guarded — invalid prereqs return 409 with `currentStatus`.

### Idempotency
- First-transition to `paid` is guarded on the success page (only the first verify call wins)
- `delivery_driver_transfers` table tracks Stripe transfer IDs per `order_id` — `hasDriverTransfer(orderId)` blocks duplicate payouts

---

## Architecture

### Tables (Postgres / Neon via Vercel)
- `delivery_orders` — id, restaurant_id, customer (jsonb), items (jsonb), tip_cents, fees, totals, driver_id, status, all timestamps
- `delivery_drivers` — id, name, phone, email, token, status (`pending`/`active`/`rejected`), created_at, last_seen_at, etc. (replaced static array on 2026-04-26)
- `delivery_driver_status` — driver_id, is_online, online_until, stripe_account_id, payouts_enabled, last_seen
- `delivery_driver_transfers` — order_id (PK), driver_id, transfer_id, amount_cents (idempotency)

All migrations are idempotent (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... IF NOT EXISTS`).

### Auth
- **Customers:** none — tied to Stripe checkout sessions
- **Runners:** cookie-session (`pal_runner`, httpOnly, sameSite=lax, 30-day). Token in URL only on first login (magic link), then traded for cookie at `/api/deliver/driver/login`
- **API helpers:** `getCurrentRunner` (server components, reads cookie), `getApiRunner` (route handlers, cookie-first with token-query fallback)

### Stripe Configuration
- **Platform account:** active, charges + payouts enabled, **manual platform payouts** (Winston controls when PAL → PAL bank fires)
- **Connect Express** for runners: requested `transfers` capability; default daily auto-payouts to runner's bank (Stripe's default — no override). First payout on a new account: 7–14 day hold; thereafter daily rolling.
- **Stripe Issuing** (deferred 30+ days — needs Connect volume history first; reapply after Q3-ish)
- **2FA:** enabled with Google Authenticator. Recovery code stashed safely (the famous one — `jdxy-awjd-...`).

### Email + SMS Channels
- **Email:** Resend, sender `bookings@theportalocal.com`, `reply_to: hello@`
- **SMS:** Twilio. A2P 10DLC Brand approved; Campaign in TCR review (best-effort sends until cleared). Customer SMS uses `sendConsumerSms` helper (gated on consent checkbox).
- **Anti-spam tuning:** plain ASCII subjects (no emoji), `X-Entity-Ref-ID` header, `reply_to: hello@`. Helps Gmail bucket as transactional.

### Wheelhouse Mirror
Every order lifecycle event posts an `update` (or `decision` for delivered) message into the pinned "PAL Deliveries — order log" Wheelhouse thread. Activity ticker surfaces them.

---

## Live Status (as of 2026-04-26)

✅ Customer order flow — end-to-end live (real $$ flowing)
✅ Stripe payment + customer confirmation email
✅ Runner dispatch SMS + email
✅ Runner claim flow
✅ Runner status transitions (picked-up, delivered)
✅ Customer status emails (picked-up, delivered) + SMS (best-effort pre-A2P)
✅ Runner cookie-session login (magic-link → cookie exchange)
✅ Runner hub (`/deliver/driver`) — on-duty, earnings, available, in-progress
✅ Stripe Connect Express runner onboarding
✅ Auto-payout via `stripe.transfers.create` on delivery
✅ Stripe Express dashboard button (one-tap from hub)
✅ Self-lookup (lost-link recovery via email)
✅ Duplicate-application guard
✅ Wheelhouse mirror

⏳ A2P 10DLC Campaign clearance (TCR — passive wait) → reliable customer SMS
⏳ Stripe Issuing reapply (after 30+ days Connect volume) → runners get virtual cards instead of personal credit
🟡 More on-duty runners (currently 1: Winston)
🟡 More restaurants (currently 2: Crazy Cajun, DQ)

---

## Decisions Made (2026-04-25 / 2026-04-26 sessions)

- **Cookie session over token-in-URL.** Original design had token-in-URL for everything. Felt like friction. Pivoted to "What would Uber do" — magic link on first sign-in, cookie thereafter. 30-day session. Token still works as fallback (lookup recovery, dispatch-link-on-new-device).
- **Belt-and-suspenders comms.** SMS may fail pre-A2P; customer + runner emails are the reliable backbone. Both fire on every transition.
- **Manual platform payouts (PAL → PAL bank).** Winston controls fund flow at the platform layer. Daily auto-payouts at the Connect layer (PAL → runner bank) — different flow.
- **Defensive `.trim()` on Stripe key.** A trailing newline in the env var burned a session; `getDeliverStripeKey()` always trims now.
- **Runner is "an entity" not "Winston."** All customer-facing copy says "PAL" / "we" / `hello@theportalocal.com`. No personal name surfaces anywhere.
- **Stripe payouts dashboard link in runner hub.** Lets runners see balance, schedule, instant-payout option (1.5% fee) without leaving PAL session.
- **DQ id-vs-slug bug fixed.** Crazy Cajun has id=slug; DQ has id="dq-port-a" slug="dairy-queen". `getRestaurantById()` helper now used everywhere — pricing was previously breaking on DQ orders.
- **Phantom orders killed.** Admin email moved from order-create to post-payment-success. No more inbox spam from abandoned carts.
- **Runner terminal-state hub-back buttons** (delivered, canceled/refunded, already-claimed-by-another). Avoids dead-end on the success card.

---

## Key Files

### Routes
- `/deliver` — restaurant index
- `/deliver/[restaurant]` — menu
- `/deliver/checkout` — cart + structured address form
- `/deliver/success/[orderId]` — Stripe verify + customer-facing receipt
- `/deliver/runner` — runner application
- `/deliver/driver` — runner hub (cookie-gated; redirects through login if no session)
- `/deliver/driver/[orderId]` — order detail (claim / status / hub-back)
- `/deliver/driver/lookup` — lost-link recovery
- `/deliver/driver/payouts` — Stripe Connect onboarding redirect target

### API Routes
- `POST /api/deliver/order` — create
- `POST /api/deliver/order/[id]/claim` — runner claim
- `POST /api/deliver/order/[id]/status` — runner status transition + auto-payout
- `GET /api/deliver/order/[id]/status` — order lookup
- `POST /api/deliver/runner` — application
- `GET /api/deliver/runner/approve?...` — admin magic-link approve
- `GET /api/deliver/runner/reject?...` — admin magic-link reject
- `GET /api/deliver/driver/login` — token → cookie exchange
- `POST /api/deliver/driver/logout` — clear cookie
- `GET /api/deliver/driver/feed` — hub data backbone
- `POST /api/deliver/driver/online` / `offline`
- `POST /api/deliver/driver/connect/start` — Stripe Connect Account Link
- `GET /api/deliver/driver/connect/refresh` — re-check Connect status
- **`POST /api/deliver/driver/connect/dashboard`** — `createLoginLink` (NEW 2026-04-26)
- `POST /api/deliver/driver/lookup` — magic-link email
- `POST /api/deliver/webhook` — Stripe webhook (paid event)

### Data + libs
- `src/data/delivery-store.ts` — all DB access, schema migrations, transitions
- `src/data/delivery-types.ts` — `Order`, `OrderStatus`, etc.
- `src/data/delivery-restaurants.ts` — restaurant config (hours, pickupAddress, slug, id, markupPct), `getRestaurant`, `getRestaurantById`
- `src/data/delivery-drivers.ts` — adapter over DB driver store
- `src/data/delivery-pricing.ts` — `priceCart`, fee/markup constants
- `src/lib/runnerSession.ts` — `getCurrentRunner`, `getApiRunner`, cookie name + maxAge
- `src/lib/deliverStripe.ts` — defensive-trim Stripe singleton
- `src/lib/deliverDispatch.ts` — driver SMS+email dispatch, customer status SMS, Wheelhouse mirror
- `src/lib/deliverEmails.ts` — admin paid email, customer confirmation/picked-up/delivered
- `src/lib/twilioSms.ts` — `sendSms` (admin), `sendConsumerSms` (consent-gated)

### Components
- `src/app/deliver/driver/RunnerHub.tsx` — runner hub client component
- `src/app/deliver/driver/[orderId]/DriverActions.tsx` — order detail action buttons
- `src/components/Navigation.tsx` — Runner pill (desktop) + Runner home (mobile)

---

## Next Priorities

### Revenue / growth
1. **Onboard more runners.** Pipeline + onboarding works end-to-end. Need humans willing to drive.
2. **Onboard more restaurants.** Menu data is the bottleneck. Each new restaurant is one entry in `delivery-restaurants.ts` + a menu file.
3. **Customer comms preference UI.** After A2P clears, let customers choose SMS vs. email vs. both.

### Infra (passive waits)
4. **A2P 10DLC Campaign clearance** (TCR review). Flips on reliable customer SMS.
5. **Stripe Issuing reapply** (~30 days post Connect launch — Q3 2026 roughly).

### Polish
6. **Customer order tracking page UX.** `/deliver/success/[orderId]` shows real-time status — could feel more like a tracking app.
7. **Runner earnings history page.** Currently 3-stat summary; full per-order history would be nice (later).
8. **Optional: clean up 5 phantom 'placed/pending' rows** in DB (residue from pre-fix Stripe key bug; harmless).

### Bigger swings
9. **Beyond food: small-package + grocery + alcohol delivery** (later, as runner pool grows).
10. **Restaurant-facing portal** (later) — restaurants see their orders, prep, mark ready, view payouts.

---

## Reference

- Stripe platform: account `acct_1TLv2G…`, admin@theportalocal.com login
- Recovery code: stored in iCloud Keychain (Stripe entry, 2026-04-26)
- Connect documentation we leaned on: `accounts.create`, `accountLinks.create`, `accounts.retrieve`, `accounts.createLoginLink`, `transfers.create`
- Wheelhouse thread tag: `deliveries`
