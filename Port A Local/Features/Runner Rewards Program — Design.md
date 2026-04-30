# Runner Rewards Program — Design Notes
_Status: Tier 1 ($5 first-delivery) LIVE | Higher tiers deferred | 2026-04-26_

---

## What's live

**$5 first-delivery welcome bonus** (auto-fired via Stripe Connect):
- Triggers on first ever delivered order per runner
- Idempotent — uses synthetic order_id `bonus-first-{driverId}` in
  `delivery_driver_transfers` so it can never fire twice
- Fires automatically alongside the order payout in
  `/api/deliver/order/[id]/status/route.ts`
- Skips silently if runner isn't yet payouts-enabled (Winston can backfill
  via custom payouts admin tool later)

**Marketing surfaces showing the bonus:**
- Homepage tile (`RunnerLeaderboardTile`) — "+$5 welcome bonus on your first delivery"
- `/deliver/runners` (public leaderboard) — emerald hero callout
- `/deliver/runner` (application form) — emerald callout below the typical-run economics
- Runner hub (`RunnerHub.tsx`) — "Welcome bonus pending" callout shown until earned

---

## Higher tiers (Collie's full proposal — deferred)

Per Collie's recommendation + Winston's "love the whole rewards system" approval, these are PARKED for revisit:

| Milestone | Reward | PAL cost | Why this milestone |
|-----------|--------|----------|---------------------|
| ✅ **First delivery** | $5 cash bonus | $5 | Activation (LIVE 2026-04-26) |
| **10 deliveries** | PAL-branded T-shirt + $25 cash | ~$50 | Mid-engagement. Walking-billboard brand reach. |
| **50 deliveries** | $100 cash bonus | $100 | Real loyalty signal. |
| **250 deliveries** | Apple Watch SE (or equivalent ~$300) | ~$300 | Aspirational apex. Story-worthy. |
| **Refer a runner** (who completes 5+ runs) | $25 cash bonus per | $25 | Viral growth loop. |

### Implementation when picked back up

1. **Schema:** New `delivery_runner_rewards` table tracking earned + claimed rewards per runner. Or extend `delivery_driver_transfers` with another synthetic-order-id pattern.
2. **Achievements section** on `RunnerHub.tsx` showing progress to next tier with a visible ladder ("23 / 50 deliveries to your $100 bonus").
3. **Auto-fire logic** for cash-tier rewards (mirrors first-delivery bonus pattern).
4. **Manual fulfillment tracking** for non-cash rewards (T-shirt, Watch) — admin Wheelhouse view to ship.
5. **Referral tracking** — `referred_by_driver_id` on `delivery_drivers`; cron job at end of week to fire referral bonuses for any newly-qualified referrals.

### Open questions for revisit

- T-shirt design + supplier lined up? (Could tie into the broader PAL merch effort Collie's prepping.)
- Apple Watch alternative options if cost is an issue: AirPods Pro (~$250), Yeti cooler (~$300), Patagonia jacket (~$300)
- Greenlight referral bonus immediately or wait for a few "v1 runners" to be in place first?
- Do we want a "rewards catalog" (runner picks what they want at each tier) or fixed rewards?

---

## Why we shipped just Tier 1 first

- $5 is trivial cost — sustainable even at high failure rate
- Activates the first-run muscle (most-important conversion)
- Gives us a working "bonus auto-fire" pattern to extend later
- Larger tiers benefit from real signal (e.g., is 50 deliveries a realistic mid-tier? or too low? watch for a few months)

---

## Pickup-here

When someone returns to this:
- [ ] Decide if Tier 2 ($25 + shirt at 10 deliveries) is right next to ship
- [ ] Source PAL-branded shirt design + low-MOQ printer
- [ ] Add a "rewards" or "achievements" section to `RunnerHub.tsx`
- [ ] Wire referral mechanism — `referred_by` on driver record, payout cron
- [ ] Decide cash-only vs catalog-style for higher tiers
