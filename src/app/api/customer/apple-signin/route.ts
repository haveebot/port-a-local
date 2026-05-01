import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { upsertCustomerOnSignIn } from "@/data/customers-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/customer/apple-signin
 *
 * Body:
 *   - identityToken: Apple-issued JWT (from expo-apple-authentication)
 *   - authorizationCode: optional, used for refresh-token exchange
 *   - email, displayName: only present on first sign-in
 *
 * Returns:
 *   { customerId, sessionToken, email?, displayName?, expiresAt }
 *
 * Verification flow (RFC-compliant):
 *   1. Fetch Apple's public keys from
 *      https://appleid.apple.com/auth/keys (cached 24h by jose)
 *   2. Verify the JWT signature using the matching `kid`
 *   3. Validate iss=https://appleid.apple.com, exp not expired,
 *      aud matches the iOS bundle id
 *   4. Mint a 30-day HMAC-signed session token
 *
 * Reference:
 *   https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user
 */

const APPLE_BUNDLE_ID =
  process.env.APPLE_APP_BUNDLE_ID ?? "co.portalocal.app";

// jose's createRemoteJWKSet handles caching, retries, and key rotation.
const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

interface AppleSignInBody {
  identityToken?: string;
  authorizationCode?: string;
  email?: string;
  displayName?: string;
}

interface ApplePayload extends JWTPayload {
  email?: string;
  email_verified?: boolean | string;
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

  let payload: ApplePayload;
  try {
    const { payload: verified } = await jwtVerify<ApplePayload>(
      body.identityToken,
      APPLE_JWKS,
      {
        issuer: "https://appleid.apple.com",
        audience: APPLE_BUNDLE_ID,
      }
    );
    payload = verified;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Invalid identity token";
    return NextResponse.json(
      { error: `Identity token verification failed: ${message}` },
      { status: 401 }
    );
  }

  const subject = payload.sub;
  if (!subject) {
    return NextResponse.json(
      { error: "Token missing subject" },
      { status: 400 }
    );
  }

  const sessionSecret = process.env.CUSTOMER_SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json(
      {
        error:
          "Server misconfigured: CUSTOMER_SESSION_SECRET is not set. Generate one with `openssl rand -base64 48` and add it to the Vercel env.",
      },
      { status: 500 }
    );
  }

  // Persist the customer. Apple only sends email + displayName on the
  // first sign-in; the store COALESCEs so we keep what we previously
  // captured on returning sign-ins. Best-effort — falls back to a
  // synthetic record if Postgres isn't configured (returns null).
  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";
  const customer = await upsertCustomerOnSignIn({
    appleSub: subject,
    email: body.email ?? payload.email ?? null,
    displayName: body.displayName ?? null,
    emailVerified,
  });

  // Authoritative identity: prefer the persisted record (which carries
  // forward email/name from the FIRST sign-in if Apple omitted them
  // this time). Fall back to whatever the client / Apple gave us.
  const sessionEmail =
    customer?.email ?? body.email ?? payload.email ?? null;
  const sessionName = customer?.displayName ?? body.displayName ?? null;

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60 * 24 * 30; // 30 days
  const sessionPayload = JSON.stringify({
    sub: subject,
    iat: issuedAt,
    exp: expiresAt,
    email: sessionEmail,
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
    email: sessionEmail,
    displayName: sessionName,
    expiresAt,
    signInCount: customer?.signInCount ?? null,
  });
}
