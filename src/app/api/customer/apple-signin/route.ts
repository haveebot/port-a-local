import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/customer/apple-signin
 *
 * Body:
 *   - identityToken: Apple-issued JWT (from expo-apple-authentication)
 *   - authorizationCode: optional, used for refresh-token exchange
 *   - appleUserId: stable Apple user id (the JWT `sub`); we trust the
 *     client to also send it for convenience
 *   - email, displayName: only present on first sign-in
 *
 * Returns:
 *   { sessionToken, customerId }
 *
 * Security note (TODO before going live):
 *   We currently parse the identity token without verifying its
 *   signature against Apple's JWKS. This is fine for a v1 closed beta
 *   but MUST be hardened before public launch. Steps:
 *     1. Fetch Apple's public keys from
 *        https://appleid.apple.com/auth/keys (cache for ~24h)
 *     2. Verify the JWT signature using the matching `kid`
 *     3. Validate iss=https://appleid.apple.com,
 *        aud=co.portalocal.app, exp not expired
 *     4. Confirm the `sub` matches the body's appleUserId
 *   See https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user
 */

interface AppleSignInBody {
  identityToken?: string;
  authorizationCode?: string;
  appleUserId?: string;
  email?: string;
  displayName?: string;
}

interface AppleIdTokenPayload {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean | string;
}

function decodeJwtPayload(token: string): AppleIdTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as AppleIdTokenPayload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: AppleSignInBody;
  try {
    body = (await req.json()) as AppleSignInBody;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (!body.identityToken) {
    return NextResponse.json(
      { error: "identityToken is required" },
      { status: 400 }
    );
  }

  const payload = decodeJwtPayload(body.identityToken);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid identity token format" },
      { status: 400 }
    );
  }

  // Light-weight checks (full signature verification is the TODO above).
  if (payload.iss !== "https://appleid.apple.com") {
    return NextResponse.json(
      { error: "Token has unexpected issuer" },
      { status: 401 }
    );
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }
  const subject = payload.sub ?? body.appleUserId;
  if (!subject) {
    return NextResponse.json(
      { error: "Token missing subject" },
      { status: 400 }
    );
  }

  // TODO: persist a customer record here. For now we just mint a
  // session token bound to the apple user id. The customer-app keeps
  // this and sends it as Authorization: Bearer for future calls.
  // Switch to a real session table when /api/customer/orders ships.
  const sessionSecret = process.env.CUSTOMER_SESSION_SECRET ?? "dev-secret";
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60 * 24 * 30; // 30 days
  const sessionPayload = JSON.stringify({
    sub: subject,
    iat: issuedAt,
    exp: expiresAt,
    email: body.email ?? payload.email,
  });
  const sig = crypto
    .createHmac("sha256", sessionSecret)
    .update(sessionPayload)
    .digest("base64url");
  const sessionToken =
    Buffer.from(sessionPayload).toString("base64url") + "." + sig;

  return NextResponse.json({
    customerId: subject,
    sessionToken,
    email: body.email ?? payload.email,
    displayName: body.displayName,
    expiresAt,
  });
}
