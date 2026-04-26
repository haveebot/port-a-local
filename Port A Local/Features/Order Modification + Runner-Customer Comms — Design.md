# Order Modification + Runner ↔ Customer Comms — Design Notes
_Status: Deferred design | Flagged 2026-04-26 by Winston_

---

## The Problem (Winston's flag)

> "We need to factor in the increase or decrease in cost of order upon
> immediate availability and order changes — the customer will need to
> text the runner directly and/or vice versa. There will be charges
> that are less than the initial online purchase and some that increase
> as substitutions are made."

Real-world scenarios that today's system doesn't handle:

1. **Item unavailable at restaurant** — runner arrives, "we're out of jalapeño poppers." Customer needs to know + pick a substitute or scratch the item.
2. **Substitution at a price difference** — customer wants the next-tier item. Cost goes up. Stripe needs a top-up charge.
3. **Item removed entirely** — runner forgets, kitchen drops it, customer no longer wants it. Cost goes down. Stripe needs a partial refund.
4. **Convenience-store nuance** — Lowe's Market essentials especially: "they only have Coke 12-pack, not Diet Coke." Customer-side decision needed.
5. **Customer-runner direct comms** — runner needs to ask a question; customer needs to answer. Today: only the order metadata is shared.

---

## Today's Reality

- Customer pays the initial online total at Stripe Checkout
- Runner gets dispatch SMS/email with customer phone + order details
- Customer gets confirmation/update emails + SMS at each transition
- **No mid-flight communication channel built into PAL.** Runner has customer phone (in dispatch); customer doesn't have runner phone.
- **No mid-flight charge/refund mechanism.** Stripe charge is locked at checkout; substitutions aren't tracked.

---

## Three Architecture Options

### Option A — Direct phone-to-phone (low-cost, most-immediate v1)

Surface the runner's phone to the customer once their order is claimed. Runner already has customer's phone via dispatch.

- ✅ Zero new infrastructure
- ✅ Both parties have native SMS — works on any phone
- ✅ Matches the small-town vibe ("you can just call them")
- ✅ Deployable in 30 minutes
- ❌ No audit trail in PAL
- ❌ No structured refund/top-up — has to be processed manually after the fact
- ❌ Reveals real phone numbers (not anonymized)

**Implementation v1:**
- Customer order tracking page shows runner's phone once claimed
- Runner hub already shows customer phone on order detail page
- Both parties text natively
- Refunds/top-ups processed manually via Stripe dashboard or custom payouts admin

### Option B — In-app messaging (higher-touch but auditable)

PAL hosts the messaging layer. Both parties communicate within PAL.

- ✅ Full audit trail
- ✅ Anonymizes phone numbers (PAL is the proxy)
- ✅ Sets up for automated substitution flows later
- ❌ Real-time messaging is a non-trivial build (websockets or polling)
- ❌ Both parties need to keep PAL open
- ❌ No native push — would lean on email/SMS for new-message pings

### Option C — Twilio proxy phone numbers (hybrid)

Twilio rents a unique phone number per order; both parties text "the order" not each other. Phone numbers are masked.

- ✅ Audit trail (Twilio logs)
- ✅ Anonymized phone numbers
- ✅ Native SMS — both parties' default app
- ✅ Used by DoorDash, Uber, etc. (proven pattern)
- ❌ Twilio rental cost (~$1/month per active number, freed when order completes)
- ❌ Requires A2P 10DLC clearance (we're already in TCR review)

---

## Substitution + Charge Adjustment

Independent of the comms layer, we need a mechanism for adjusting the order amount mid-flight.

### Suggested model

1. **Runner-side action:** "Adjust order" button on `/deliver/driver/[orderId]` page
2. Form lets runner mark items unavailable, swap items, add items, or change quantities
3. **System computes new total** (using same priceCart logic)
4. **Customer is notified** of the change (SMS + email) and given a window to accept/reject
5. **Stripe action:**
   - If new total < original: partial refund the difference
   - If new total > original: charge the difference (requires customer confirmation — Stripe may need a setup intent saved at original checkout for future-charge capability)
6. **Order ledger updates** with the new totals

### Stripe wrinkle

Future-charge against the same payment method requires either:
- **Saved card** (we'd need to ask customer to "save card for future charges" at checkout)
- **Setup intent** (off-session future charges — same UX as Uber)
- **Manual customer-confirmation flow** — they tap a link to confirm the upcharge

The cleanest UX is the saved-card path, but that's a checkout-flow change. Probably worth it long-term.

### Refund-only v0

Easiest first version:
- Allow runner to mark items unavailable / reduce order
- System fires partial refund automatically via Stripe
- **No upcharges yet** — for substitutions that increase price, runner pays out of pocket and PAL reimburses (or runner declines + escalates to Winston)
- Top-up charges come later when the saved-card path is in place

---

## Recommendation

**Phase 1 (next sprint):**
- Surface runner's phone to customer post-claim (Option A — direct phone-to-phone)
- Surface customer's phone to runner more visibly on the order detail page
- Add runner-side "Adjust order" → refund-only flow (item removal / quantity reduction)

**Phase 2 (after A2P 10DLC clears):**
- Twilio proxy numbers (Option C) — masked phone-to-phone
- Saved card / setup intent at checkout for upcharge support
- Full add-substitute-or-remove order modification flow

**Phase 3 (later):**
- In-app messaging if Twilio proxy doesn't cut it (most platforms find it doesn't need to escalate this far)

---

## Adjacent considerations

- **Restaurant communication.** Today the runner is the only PAL-side touchpoint at the restaurant. If a restaurant says "we're out of X but we'll throw in Y," the runner has to relay. Future: a restaurant-facing portal that sees orders + can mark items unavailable proactively.
- **Tip adjustment.** If the order changes meaningfully (especially decreases), should the customer have a chance to re-set their tip? Today the tip is locked at checkout.
- **Runner liability.** If a runner makes a substitution decision badly, who eats it? Today: PAL would need to absorb. With proper customer notify-and-confirm, the customer eats their own choice.

---

## Pickup-here

When this thread comes back:
- [ ] Phase 1.A — surface runner phone on customer tracking page (15 min)
- [ ] Phase 1.B — runner-side "Adjust order" button + refund-only flow (~3 hours)
- [ ] Decide: stick with direct phone-to-phone, or pre-build for Twilio proxy?
- [ ] Coordinate with A2P 10DLC clearance timeline — gates the proxy option
- [ ] Save-card-at-checkout migration plan (Stripe setup intent)
