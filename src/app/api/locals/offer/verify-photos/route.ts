import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getLocalsOffer,
  markLocalsOfferPhotosVerified,
} from "@/data/locals-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/locals/offer/verify-photos?id=OFFER_ID&s=HMAC_SIGNATURE
 *
 * Magic-link verification — Winston clicks after photos arrive at
 * hello@. Marks photos_verified_at on the offer; idempotent. Distinct
 * sig from approve (HMAC over `${id}:verify-photos`) so a leaked
 * approve link can't be replayed against this endpoint.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const offerId = url.searchParams.get("id") ?? "";
  const sig = url.searchParams.get("s") ?? "";
  const secret = process.env.ADMIN_APPROVAL_SECRET;
  if (!secret) {
    return htmlError(
      "Server is missing ADMIN_APPROVAL_SECRET — set it in Vercel env.",
    );
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${offerId}:verify-photos`)
    .digest("hex");
  if (!timingSafeEqual(sig, expected)) {
    return htmlError("Bad signature on verify-photos link.");
  }

  const existing = await getLocalsOffer(offerId);
  if (!existing) {
    return htmlError("Offer not found.");
  }

  const offer = await markLocalsOfferPhotosVerified(offerId, "admin-magic-link");
  if (!offer) {
    return htmlError("Couldn't update photo verification.");
  }

  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #e5dcc7; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#1f7a4d; margin:0 0 8px; font-weight:bold;">
          PAL Locals · Photos verified
        </p>
        <h1 style="margin:0 0 16px; font-size:28px;">${escapeHtml(offer.name)} — photos verified ✓</h1>
        <div style="background:#f5f0e8; padding:12px 14px; border-radius:8px; margin:16px 0; font-family:Inter,system-ui,sans-serif; font-size:13px;">
          <p style="margin:4px 0;"><strong>Approved:</strong> ${offer.approvedAt ? "✓ " + new Date(offer.approvedAt).toLocaleString() : "Pending — approve via the original admin email"}</p>
          <p style="margin:4px 0;"><strong>Photos:</strong> ✓ Verified ${new Date(offer.photosVerifiedAt!).toLocaleString()}</p>
        </div>
        <p style="font-family:Inter,system-ui,sans-serif; line-height:1.6; color:#1a2433; font-size:14px;">
          ${
            offer.approvedAt
              ? "Fully ready — add to <code>src/data/locals-listings.ts</code> with isActive=true to make it live for customers."
              : "Photos are in. Now click the Approve button in the original admin email to send the applicant their welcome notification."
          }
        </p>
      </div>
    `),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
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
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>PAL Locals Admin</title></head><body style="background:#f5f0e8; margin:0;">${inner}</body></html>`;
}

function htmlError(msg: string): NextResponse {
  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #c83a3a; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#c83a3a; margin:0 0 8px; font-weight:bold;">
          PAL Locals · Verify-photos error
        </p>
        <h1 style="margin:0 0 16px; font-size:24px;">${escapeHtml(msg)}</h1>
      </div>
    `),
    { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
