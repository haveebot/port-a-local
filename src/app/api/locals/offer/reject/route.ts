import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getLocalsOffer, rejectLocalsOffer } from "@/data/locals-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/locals/offer/reject?id=OFFER_ID&s=HMAC_SIGNATURE
 *
 * Magic-link rejection — silent (no email to applicant). Mirrors the
 * runner-reject pattern. Same HMAC sig as approve (HMAC over offerId
 * alone) — anyone with one has both, by design (same admin trust).
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
    .update(offerId)
    .digest("hex");
  if (!timingSafeEqual(sig, expected)) {
    return htmlError("Bad signature on reject link.");
  }

  const existing = await getLocalsOffer(offerId);
  if (!existing) {
    return htmlError("Offer not found.");
  }

  await rejectLocalsOffer(offerId, "rejected via admin magic link");

  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #e5dcc7; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#7d6e5a; margin:0 0 8px; font-weight:bold;">
          PAL Locals · Admin
        </p>
        <h1 style="margin:0 0 16px; font-size:28px;">${escapeHtml(existing.name)} — rejected</h1>
        <p style="font-family:Inter,system-ui,sans-serif; line-height:1.6; color:#1a2433; font-size:14px;">
          No email sent to the applicant. Marked rejected in our records;
          they won&apos;t be added to the live listings.
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
          PAL Locals · Reject error
        </p>
        <h1 style="margin:0 0 16px; font-size:24px;">${escapeHtml(msg)}</h1>
      </div>
    `),
    { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
