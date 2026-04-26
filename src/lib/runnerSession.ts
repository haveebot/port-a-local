/**
 * Runner session — cookie-based auth so runners never deal with tokens.
 *
 * Pattern:
 *   1. Email/dispatch link contains ?t=<driver_token>
 *   2. /api/deliver/driver/login validates the token + sets a cookie
 *      with the driver_id (not the token — token is the secret, id is
 *      the reference). Then redirects to the clean target URL.
 *   3. Subsequent visits use the cookie. Zero token in URL.
 *
 * Cookie config:
 *   - name: pal_runner
 *   - httpOnly: true (no JS access — defense against XSS)
 *   - secure: prod only
 *   - sameSite: lax (so links from emails set the cookie)
 *   - maxAge: 30 days, refreshed on each visit
 *
 * Recovery: if cookies are cleared or device switches, runner uses
 * /deliver/driver/lookup (phone → email → click → fresh cookie set).
 */

import { cookies } from "next/headers";
import { getDriverByToken, getDriver } from "@/data/delivery-drivers";
import type { DeliveryDriver } from "@/data/delivery-types";

const COOKIE_NAME = "pal_runner";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Get the current runner from request context.
 *
 * Priority order:
 *   1. Cookie (pal_runner = driver_id) — primary path after first login
 *   2. URL token — for first-visit email/dispatch link clicks
 *
 * Both must resolve to an active driver in the database.
 *
 * Note: this DOES NOT set the cookie if only a token is found — that's
 * done by /api/deliver/driver/login (a route handler, since server
 * components can't set cookies during render).
 */
export async function getCurrentRunner(
  tokenFromUrl?: string,
): Promise<DeliveryDriver | null> {
  // 1. Cookie path
  const cookieStore = await cookies();
  const driverId = cookieStore.get(COOKIE_NAME)?.value;
  if (driverId) {
    const driver = await getDriver(driverId);
    if (driver?.isActive) return driver;
  }

  // 2. URL token fallback (first-visit-from-link)
  if (tokenFromUrl) {
    const driver = await getDriverByToken(tokenFromUrl);
    if (driver?.isActive) return driver;
  }

  return null;
}

export const RUNNER_COOKIE_NAME = COOKIE_NAME;
export const RUNNER_COOKIE_MAX_AGE = MAX_AGE_SECONDS;

/**
 * For API route handlers — same priority as getCurrentRunner but pulls
 * the URL token from a NextRequest's searchParams instead of a
 * server-component searchParams prop.
 */
export async function getApiRunner(
  req: { url: string } | URL,
): Promise<DeliveryDriver | null> {
  const url = typeof req === "string" ? new URL(req) : req instanceof URL ? req : new URL(req.url);
  const token = url.searchParams.get("t") ?? undefined;
  return getCurrentRunner(token);
}
