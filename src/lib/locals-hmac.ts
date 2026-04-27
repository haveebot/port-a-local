/**
 * Shared HMAC magic-link helpers for /locals admin + vendor flows.
 *
 * One secret (ADMIN_APPROVAL_SECRET) signs distinct payload kinds —
 * each kind gets its own suffix so a leaked link of one kind can't
 * be replayed against another endpoint.
 *
 *   - admin           : HMAC(offerId)                  ← approve + reject share
 *   - verify-photos   : HMAC(`${id}:verify-photos`)
 *   - vendor-connect  : HMAC(`${id}:vendor-connect`)   ← vendor portal
 *
 * Approve + reject share a sig because they're the same admin trust
 * domain — anyone Winston forwards the email to gets one or the
 * other, never both. Verify-photos and vendor-connect each get
 * their own suffix because they unlock different surfaces.
 */

import crypto from "crypto";

export type LocalsHmacKind = "admin" | "verify-photos" | "vendor-connect";

function payloadFor(kind: LocalsHmacKind, offerId: string): string {
  switch (kind) {
    case "admin":
      return offerId;
    case "verify-photos":
      return `${offerId}:verify-photos`;
    case "vendor-connect":
      return `${offerId}:vendor-connect`;
  }
}

/**
 * Sign a magic-link token. Returns null if ADMIN_APPROVAL_SECRET isn't
 * set — callers should handle that case (typically by skipping the
 * link in admin emails and surfacing a setup hint).
 */
export function signLocalsToken(
  kind: LocalsHmacKind,
  offerId: string,
): string | null {
  const secret = process.env.ADMIN_APPROVAL_SECRET;
  if (!secret) return null;
  return crypto
    .createHmac("sha256", secret)
    .update(payloadFor(kind, offerId))
    .digest("hex");
}

/**
 * Constant-time verify a magic-link signature against the expected
 * payload. Returns false when ADMIN_APPROVAL_SECRET is missing,
 * inputs differ in length, or the HMACs don't match.
 */
export function verifyLocalsToken(
  kind: LocalsHmacKind,
  offerId: string,
  sig: string,
): boolean {
  const expected = signLocalsToken(kind, offerId);
  if (!expected) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
