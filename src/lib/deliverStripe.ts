/**
 * Stripe key resolver for /deliver routes.
 *
 * /deliver uses STRIPE_DELIVER_SECRET_KEY when set, otherwise falls back
 * to the global STRIPE_SECRET_KEY. This lets us run /deliver on TEST
 * keys (during Stripe Connect testing) WITHOUT touching the live keys
 * that /rent, /beach, and /maintenance need to keep working.
 *
 * To run /deliver in test mode:
 *   - Set STRIPE_DELIVER_SECRET_KEY to your sk_test_... key in Vercel
 * To go live:
 *   - Set STRIPE_DELIVER_SECRET_KEY to sk_live_... (or remove it to
 *     fall back to STRIPE_SECRET_KEY)
 */

import Stripe from "stripe";

export function getDeliverStripeKey(): string | undefined {
  // Defensive trim — Vercel env vars can pick up trailing whitespace/newlines
  // when pasted, and Node fetch rejects any non-ASCII char in the
  // Authorization header (ERR_INVALID_CHAR). Burned us once.
  const raw =
    process.env.STRIPE_DELIVER_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  return raw?.trim() || undefined;
}

/** Build a Stripe instance using the /deliver-scoped key (or fallback). */
export function getDeliverStripe(): Stripe {
  const key = getDeliverStripeKey();
  if (!key) {
    throw new Error(
      "No Stripe key configured for /deliver — set STRIPE_DELIVER_SECRET_KEY or STRIPE_SECRET_KEY in Vercel.",
    );
  }
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

/** Are we currently running /deliver on a TEST key? Useful for warnings/UI. */
export function isDeliverStripeInTestMode(): boolean {
  const key = getDeliverStripeKey();
  return !!key && key.startsWith("sk_test_");
}
