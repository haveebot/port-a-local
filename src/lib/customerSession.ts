/**
 * Customer session token verification.
 *
 * Tokens are minted by /api/customer/apple-signin in the format:
 *   base64url(JSON_payload) + "." + base64url(HMAC_sha256(JSON_payload, secret))
 *
 * Where JSON_payload = { sub, iat, exp, email }.
 *
 * This module is the inverse — verify a presented token, return the payload
 * if valid, null if not. Constant-time signature comparison.
 */

import crypto from "node:crypto";

export interface CustomerSessionPayload {
  /** Apple "sub" — stable per-app user id */
  sub: string;
  /** Issued-at, seconds since epoch */
  iat: number;
  /** Expiry, seconds since epoch */
  exp: number;
  /** Email captured at first sign-in (Apple omits on later sign-ins) */
  email?: string | null;
}

export function readBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function verifyCustomerSession(
  token: string | null
): CustomerSessionPayload | null {
  if (!token) return null;
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  let payloadJson: string;
  try {
    payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadJson)
    .digest("base64url");

  // Constant-time comparison — prevents timing oracles on the signature.
  const presented = Buffer.from(sigB64);
  const expected = Buffer.from(expectedSig);
  if (presented.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(presented, expected)) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.sub !== "string" || typeof p.exp !== "number") return null;
  if (p.exp < Math.floor(Date.now() / 1000)) return null; // expired

  return {
    sub: p.sub,
    iat: typeof p.iat === "number" ? p.iat : 0,
    exp: p.exp,
    email: typeof p.email === "string" ? p.email : null,
  };
}
