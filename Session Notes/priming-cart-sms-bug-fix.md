# Priming brief — cart-rental SMS routing fix (next session top priority)

_Paste-ready brief for the next session. Full context is in `handoff-2026-05-26.md` — this file is the focused fix plan._

---

## What's broken

**Every Bron's cart-claim SMS reply has been silently failing since ~5/9.** When a Bron's phone replies `ACCEPT` to a cart first-look SMS, the inbound webhook hits the **beach-vendor matcher first** (because all 3 Bron's phones are dual-registered as beach vendors), the catch-all for non-CLAIM/non-STOP replies fires a generic operator surface ping, and `return twimlResponse()` — the cart-vendor branch never runs. 30 minutes later, the first-look cron correctly times out (the DB row is still `status='pending'`) and fan-outs the lead to the rest of the directory.

**Confirmed live on Mon 5/25 19:54 UTC** — Ashlee S. 8-pass cart booking, Bron Doyle replied "Accept" within 62 seconds, system never processed it, cron fanned out to 13 other vendors 30 min later. Lead was manually recovered via direct Twilio sorry-SMS to the 13 vendors + lead-confirm to all 3 Bron's phones. **Full timeline in `handoff-2026-05-26.md`.**

There's also a collateral bug — `getFirstLookVendorsForSize(_cartSize)` ignores the cart size parameter (it's `_cartSize`), so Bron's gets first-look priority on 8-pass leads even though their `cartSizes` is `["4", "6"]`.

---

## Bug #1 — Inbound matcher order

**File:** `src/app/api/twilio/sms/inbound/route.ts`

**Current flow (lines 122–211):**
1. Insider check
2. Beach vendor check (`findBeachVendorByPhone`)
   - If `intent === "claim"` → process beach claim
   - If `intent === "stop"` → flag for manual removal
   - **Else (catch-all, lines 203–211) → generic operator surface ping → return** ← this swallows `accept` / `pass` from Bron's phones
3. Cart vendor check — **never reached for Bron's phones**

**The fix.** The cleanest patch is: when the sender phone matches a beach vendor AND the intent is `accept` / `pass`, check whether there's a pending cart first-look window before falling into the beach catch-all. If yes, route to cart. Two ways to structure it:

**Option A (minimal — recommended):** Move the cart-vendor matcher branch BEFORE the beach catch-all. The beach catch-all becomes a fallback only when cart didn't claim the reply.

```ts
// 1. Insider check (unchanged)
// 2. Beach vendor — only handle CLAIM and STOP explicitly
const beachVendor = findBeachVendorByPhone(fromE164);
if (beachVendor && intent === "claim") { /* existing */ }
if (beachVendor && intent === "stop") { /* existing */ }
// NOTE: removed the generic beach catch-all here

// 3. Cart vendor — runs for ACCEPT/PASS even on dual-registered phones
const matched = findVendorByPhoneE164(fromE164, toE164);
if (matched) { /* full ACCEPT/PASS/YES/NO logic — unchanged */ }

// 4. Now the beach catch-all (fallback for any other beach reply)
if (beachVendor) {
  sendSms(OPERATOR_PHONE_E164, `[${beachVendor.name} → PAL] ${body}`...)
  return twimlResponse();
}

// 5. Stranger path (unchanged)
```

**Option B (defensive):** Keep the beach catch-all in place but explicitly route to cart when the intent is `accept` / `pass` AND there's a pending cart first-look for that vendor's cart-side slug.

**Recommendation: Option A.** Simpler, fewer special-cases, and aligns with the data reality (a phone that's both a beach vendor AND a cart vendor should have its replies routed by intent, not by which matcher fires first).

**Edge case to verify:** Bron's beach-vendor side ALSO uses `claim` as the keyword (beach uses CLAIM, cart uses ACCEPT/PASS — CLAIM is also a backward-compat alias). The `intent === "claim"` branch should keep firing the beach handler first since cart leads have moved to ACCEPT. But verify: if Bron's replies CLAIM while a cart first-look is pending AND a beach lead is unclaimed, which wins? Probably beach since `claim` is the explicit beach keyword. Document the precedence rule in code comments either way.

---

## Bug #2 — Cart-size filter is a no-op

**File:** `src/data/cart-vendors.ts` line 467

**Current:**
```ts
export function getFirstLookVendorsForSize(
  _cartSize: string,          // ← unused
): CartVendor[] {
  return cartVendors.filter(
    (v) =>
      v.active &&
      typeof v.firstLookMinutes === "number" &&
      v.firstLookMinutes > 0,
  );
}
```

**Fix:**
```ts
export function getFirstLookVendorsForSize(
  cartSize: string,
): CartVendor[] {
  return cartVendors.filter(
    (v) =>
      v.active &&
      typeof v.firstLookMinutes === "number" &&
      v.firstLookMinutes > 0 &&
      v.cartSizes.includes(cartSize),  // ← add
  );
}
```

This means an 8-pass lead will skip Bron's first-look (they don't do 8-pass) and go straight to open-blast. If we eventually want Bron's to get first-look on sizes outside their fleet (sub-rent / referral), that's a separate product question — current data says don't.

---

## Test plan

**Unit-level (regression):**
1. New test for `getFirstLookVendorsForSize`: pass `"4"` → returns brons (active, has size 4); pass `"8"` → returns empty set.
2. Inbound webhook integration test: simulate POST from `+13619462766` (Bron Doyle's cell) with body `"Accept"` while a pending cart first-look row exists for `brons-beach-carts`. Assert: `markAccepted` was called, confirm SMS dispatched to all 3 Bron's phones.

**End-to-end (manual, on preview):**
1. Stub Stripe webhook to create a fake 4-pass cart booking
2. Confirm only Bron's gets the priority SMS (no Tarpon / Paradise / etc)
3. Reply `Accept` from a Bron's-registered phone (use Twilio sandbox or trust the unit test)
4. Confirm the row transitions to `accepted` and the cron doesn't fan out

**Production sanity:**
- After merge, watch the next Bron's cart lead end-to-end. If it claims cleanly, fix is confirmed.

---

## Out of scope for this PR (file separately if worth doing)

- **DB lock on the open-blast phase.** Today, once the cron times out, there's no application-layer claim mechanism — replies just go to operator surface. A future enhancement could add a `cart_rental_open_blast` table with a row per lead that gets `first-vendor-to-ACCEPT` semantics like beach claims. Punt — only matters when open-blast becomes common, which (with bug #1 fixed) should be rare.
- **Audit other dual-registered phones.** Bron's is the canonical case. If we ever add another vendor that operates both verticals, the matcher logic needs to handle it too — Option A above generalizes correctly.
- **Memorial Day ad post-mortem → HeyeDeploy MarketingDeploy doc.** Different scope.

---

## Acceptance criteria

- [ ] PR merged with both patches
- [ ] Vercel preview deployed + manual smoke test on inbound webhook with simulated Twilio POST
- [ ] Unit test coverage for `getFirstLookVendorsForSize` size filter
- [ ] Memory update — file `feedback_pal_dual_registered_phones.md` capturing the lesson (matcher-order matters when a phone belongs to two verticals)
- [ ] Next Bron's cart lead in production claims cleanly without operator intervention

---

**Paste this brief into the next PAL session after the arnold drill.** Full session context in `handoff-2026-05-26.md`.
