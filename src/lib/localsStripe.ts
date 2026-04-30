/**
 * Stripe key resolver for /locals routes.
 *
 * /locals uses STRIPE_SECRET_KEY (PAL's main account). No alternate-
 * key escape hatch like /deliver has — locals sell-mode runs on the
 * same live account that /rent, /beach, and /maintenance share.
 *
 * Defensive `.trim()` because Vercel preserves trailing whitespace
 * on env vars pasted from clipboards (Notes, 1Password, Drive). The
 * Node fetch client rejects non-ASCII chars in the Authorization
 * header (ERR_INVALID_CHAR) — burned us once on STRIPE_SECRET_KEY
 * already and once on WHEELHOUSE_TOKEN_WINSTON_CLAUDE.
 */

import Stripe from "stripe";

export function getLocalsStripeKey(): string | undefined {
  const raw = process.env.STRIPE_SECRET_KEY;
  return raw?.trim() || undefined;
}

export function getLocalsStripe(): Stripe {
  const key = getLocalsStripeKey();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY missing — set it in Vercel for /locals routes.",
    );
  }
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}
