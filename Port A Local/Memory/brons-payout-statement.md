# Bron's — beach payout statement

_Generated 2026-09-05 from the PAL Stripe live account (`acct_1TLv2G3vsEAQBhKa`) and `beach_booking_claims`. Figures verified against Stripe balance transactions, not estimated. **Negotiation hold stands — nothing here has been paid or offered.**_

## Bottom line

| | |
|---|---|
| Completed work accrued to Bron's (20 bookings) | **$2,482.50** |
| Less chargebacks and their service fees | **−$630.00** |
| **Net payable** | **$1,852.50** |

Per operator call 2026-09-05: PAL satisfied its obligations on every booking; the crash-outs below were crew errors that produced customer chargebacks. The refunded amounts **and** the card-network service fees come off the payout. This reflects the standing agreement, not a new position.

## The chargebacks

There are **no refunds** on this account — PAL has never issued one. All three losses are **chargebacks** filed by the customer's bank.

| Date | Customer | Booking | Charged back | Fee | Total cost | Stripe dispute ID | Status |
|---|---|---|---|---|---|---|---|
| 2026-06-28 | Moriah Aveidi | Shibumi, Jun 27, Sandcastle | $205.00 | $15.00 | **$220.00** | `du_1TnJyV3vsEAQBhKaD838Przu` | Lost (product not received) |
| 2026-08-01 | Kelly Crocker | Chairs, Jul 10, Gulf Waters | $80.00 | $15.00 | **$95.00** | `du_1TzSpN3vsEAQBhKavC45ar2u` | Lost (product not received) |
| 2026-08-19 | Stephanie Simon | Cabana, May 9, Access Rd 1A | $300.00 | $15.00 | **$315.00** | `du_1U5yHX3vsEAQBhKadi1ieI7p` | Under review — treated as lost |
| | | | **$585.00** | **$45.00** | **$630.00** | | |

Stephanie's is still formally open. It is counted as lost here because these consistently resolve for the cardholder, and because the evidence window closed 2026-09-03 with no evidence attached. If it is somehow won, **$315.00 returns to the payable total** ($2,167.50).

**No upcoming chargebacks are visible** — Stripe shows zero early-fraud warnings, which is the leading indicator. Any new one gets deducted the same way.

## How it is reflected in the system

The **entire cost of each chargeback** comes off Bron's total — the amount charged back, the $15 card-network fee, and the margin PAL would have kept. A job that gets charged back earns nobody anything.

Recorded in two places, both in the database:

1. **`beach_booking_claims`** — the three charged-back bookings have `vendor_amount_cents` set to **0**, each with an audit note carrying the dispute ID and the prior value. The payout engine (`src/lib/beachPayouts.ts`) skips any zero-amount claim, so these can never pay out even if the hold is lifted. Removes **$403.75**.
2. **`beach_payout_adjustments`** (new table) — three ledger lines for the balance of each chargeback: PAL's margin plus the service fee. Removes **$226.25**.

| Booking | Full cost to PAL | Zeroed on the row | Adjustment line |
|---|---|---|---|
| Moriah Aveidi | $220.00 | $158.75 | −$61.25 |
| Kelly Crocker | $95.00 | $60.00 | −$35.00 |
| Stephanie Simon | $315.00 | $185.00 | −$130.00 |
| | **$630.00** | **$403.75** | **−$226.25** |

The authoritative figure, straight from the database:

```sql
WITH earned AS (
  SELECT COALESCE(SUM(vendor_amount_cents),0) AS c
  FROM beach_booking_claims
  WHERE claimed_by_slug LIKE 'brons%' AND paid_out_at IS NULL
), adj AS (
  SELECT COALESCE(SUM(amount_cents),0) AS c
  FROM beach_payout_adjustments WHERE vendor_slug='brons'
)
SELECT (earned.c + adj.c)/100.0 AS net_payable FROM earned, adj;
--  $1,852.50
```

## The 20 bookings behind the accrued figure

Sum of `vendor_amount_cents` where `claimed_by_slug LIKE 'brons%'` and `paid_out_at IS NULL`, before the zeroing above: $2,482.50 across setups from 2026-05-09 to 2026-09-19. Full line detail is in the table; the three above are now zeroed.

## Standing note

Two of the three chargebacks were lost by **deadline, not by argument** — the evidence windows closed with nothing submitted. A dispute alert that fires the day one opens, so the setup photo and delivery thread go in, is the cheap fix. Not built yet.
