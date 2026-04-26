import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDriverById, markDriverVerified } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/deliver/runner/verify?d=<driverId>&kind=<license|insurance>&s=<sig>
 *
 * Magic-link admin verification for license OR insurance. Triggered by
 * Winston clicking the button in the runner-application admin email
 * after he's seen the photo of the driver's license / insurance card
 * (received via hello@theportalocal.com).
 *
 * HMAC sig formula: HMAC-SHA256(`${driverId}:verify-${kind}`, ADMIN_APPROVAL_SECRET).
 * Distinct from the approve/reject sig (which is HMAC over driverId alone) so
 * an approve link can't be replayed against the verify endpoint if it leaks.
 *
 * Idempotent — re-clicking just refreshes the timestamp.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const driverId = url.searchParams.get("d");
  const kindRaw = url.searchParams.get("kind");
  const sig = url.searchParams.get("s");

  if (!driverId || !sig) {
    return htmlError("Missing parameters.");
  }
  if (kindRaw !== "license" && kindRaw !== "insurance") {
    return htmlError("Bad verification kind.");
  }
  const kind = kindRaw;

  const adminSecret = process.env.ADMIN_APPROVAL_SECRET;
  if (!adminSecret) {
    return htmlError(
      "Server is missing ADMIN_APPROVAL_SECRET — admin can't verify yet.",
    );
  }

  const expected = crypto
    .createHmac("sha256", adminSecret)
    .update(`${driverId}:verify-${kind}`)
    .digest("hex");
  if (!timingSafeEqual(sig, expected)) {
    return htmlError("Bad signature on verify link.");
  }

  const before = await getDriverById(driverId);
  if (!before) {
    return htmlError("Runner not found.");
  }

  const updated = await markDriverVerified(driverId, kind, "admin-magic-link");
  if (!updated) {
    return htmlError("Couldn't update verification.");
  }

  // Pull both verification timestamps so the success page reflects the
  // full state (e.g. "license verified, insurance still pending").
  const licenseVerified = !!updated.licenseVerifiedAt;
  const insuranceVerified = !!updated.insuranceVerifiedAt;
  const fullyVerified = licenseVerified && insuranceVerified;

  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #e5dcc7; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#1f7a4d; margin:0 0 8px; font-weight:bold;">
          PAL Delivery · Verification
        </p>
        <h1 style="margin:0 0 16px; font-size:28px;">${kind === "license" ? "License" : "Insurance"} verified ✓</h1>
        <p style="font-family:Inter,system-ui,sans-serif; line-height:1.6; color:#1a2433;">
          Marked <strong>${escapeHtml(updated.name)}</strong>&apos;s ${kind} as verified.
        </p>
        <div style="background:#f5f0e8; padding:12px 14px; border-radius:8px; margin:16px 0; font-family:Inter,system-ui,sans-serif; font-size:13px;">
          <p style="margin:4px 0;"><strong>License:</strong> ${licenseVerified ? "✓ Verified" : "Pending"}</p>
          <p style="margin:4px 0;"><strong>Insurance:</strong> ${insuranceVerified ? "✓ Verified" : "Pending"}</p>
          ${fullyVerified ? `<p style="margin:8px 0 0; color:#1f7a4d; font-weight:bold;">Fully verified — runner is good to roll.</p>` : `<p style="margin:8px 0 0; color:#7d6e5a;">Still need ${licenseVerified ? "insurance" : "license"} to fully verify.</p>`}
        </div>
        <p style="font-family:Inter,system-ui,sans-serif; font-size:12px; color:#888;">
          Driver ID: <code>${escapeHtml(driverId)}</code>
        </p>
      </div>
    `),
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlPage(inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>PAL Verification</title></head><body style="background:#f5f0e8; margin:0;">${inner}</body></html>`;
}

function htmlError(message: string): NextResponse {
  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #c83a3a; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#c83a3a; margin:0 0 8px; font-weight:bold;">
          PAL Delivery · Verification error
        </p>
        <h1 style="margin:0 0 16px; font-size:24px;">${escapeHtml(message)}</h1>
        <p style="font-family:Inter,system-ui,sans-serif; line-height:1.6; color:#1a2433; font-size:13px;">
          Try the link again or email <a href="mailto:hello@theportalocal.com" style="color:#e8656f;">hello@theportalocal.com</a>.
        </p>
      </div>
    `),
    {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
