/**
 * PAL Delivery — launch flag.
 *
 * Single source of truth for whether real orders are accepted. While
 * false: menu pages render with a preview banner and checkout is blocked
 * at the UI AND the API (defense in depth).
 *
 * Flip to live: set DELIVER_PUBLIC_LAUNCH=true in Vercel env vars.
 */

export function isDeliveryLive(): boolean {
  return process.env.DELIVER_PUBLIC_LAUNCH === "true";
}
