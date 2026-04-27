import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  approveLocalsOffer,
  getLocalsOffer,
} from "@/data/locals-store";
import { magicLinkQrDataUrl, qrEmailBlock } from "@/lib/qrEmail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * GET /api/locals/offer/approve?id=OFFER_ID&s=HMAC_SIGNATURE
 *
 * Magic-link admin approval for /locals/offer submissions. Mirrors
 * the runner-approval pattern (commit `66ce0bb` and beyond).
 *
 *   1. Verifies HMAC over offer ID
 *   2. Marks approved_at on the locals_offers row
 *   3. Emails the applicant a friendly "you're in, send photos" note
 *   4. Returns a styled HTML success page so Winston knows it landed
 *
 * Approval is intentionally photo-independent — Winston can approve
 * before photos arrive ("yes, list this guy") and use the separate
 * verify-photos magic link once photos land at hello@.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const offerId = url.searchParams.get("id") ?? "";
  const sig = url.searchParams.get("s") ?? "";
  const secret = process.env.ADMIN_APPROVAL_SECRET;
  if (!secret) {
    return htmlError(
      "Server is missing ADMIN_APPROVAL_SECRET — Winston needs to set it in Vercel env.",
    );
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(offerId)
    .digest("hex");
  if (!timingSafeEqual(sig, expected)) {
    return htmlError("Bad signature. This approval link is invalid or tampered with.");
  }

  const existing = await getLocalsOffer(offerId);
  if (!existing) {
    return htmlError("Offer not found.");
  }
  const wasAlreadyApproved = !!existing.approvedAt;

  const offer = await approveLocalsOffer(offerId, "winston");
  if (!offer) {
    return htmlError("Approval failed at the database step.");
  }

  // Send the applicant a "you're in" email — only if not already sent
  // (idempotency on re-clicks of approve link).
  if (!wasAlreadyApproved && offer.email) {
    await sendOfferApprovedEmail({
      name: offer.name,
      email: offer.email,
      mode: offer.mode,
      photosAcknowledged: offer.photosAcknowledged,
      photoUploadMailto: `mailto:hello@theportalocal.com?subject=${encodeURIComponent(
        `Locals listing photos — ${offer.businessName || offer.name}`,
      )}`,
    });
  }

  return htmlSuccess(offer.name, wasAlreadyApproved ? "already approved" : "approved");
}

interface ApprovedEmailInput {
  name: string;
  email: string;
  mode: "rent" | "hire" | "sell";
  photosAcknowledged: boolean;
  photoUploadMailto: string;
}

async function sendOfferApprovedEmail(i: ApprovedEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const first = i.name.split(" ")[0];
  const sendsPhotos = i.mode === "rent";
  // Verified = listed = live. Photos are an optimization, not a gate —
  // listings without photos still go live, they just convert worse.
  const subject = `You're in — PAL Locals verified your listing`;
  const qrDataUrl = sendsPhotos
    ? await magicLinkQrDataUrl(i.photoUploadMailto)
    : null;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Locals · Verified · You&apos;re live
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">You&apos;re in, ${escapeHtml(first)}.</h2>
      <p>We reviewed your submission and verified your listing on PAL Locals — locals only, vetted, no outsourcing. <strong>Customers can now find + request you.</strong></p>

      ${
        sendsPhotos
          ? `
      <div style="background:#fff5f0; padding:14px 16px; border-radius:8px; margin: 16px 0; border:1px solid #fde0d4;">
        <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">
          Want way more requests? Send photos.
        </p>
        <p style="margin: 4px 0 8px; font-size:13px; line-height:1.55;">
          Listings with photos convert dramatically better than listings
          without. You&apos;re live either way — but a wide shot + a
          couple detail shots gets your inbox a lot busier.
        </p>
        <p style="margin: 8px 0;">
          <a href="${i.photoUploadMailto}" style="display:inline-block; padding:10px 18px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:13px;">
            Email photos to hello@theportalocal.com
          </a>
        </p>
        <p style="margin: 6px 0 0; font-size:12px; color:#7d6e5a; font-style:italic;">
          Subject line auto-fills with your name when you tap the link.
        </p>
      </div>
      ${qrEmailBlock(qrDataUrl, "On laptop? Scan with phone to email photos directly from there.")}
      `
          : `
      <p>You&apos;re live — customers can now request your services through PAL Locals.</p>
      `
      }

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
      <p style="font-size: 13px;">Questions? Reply to this email or hit <a href="mailto:hello@theportalocal.com">hello@theportalocal.com</a>.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `You're in, ${first}.\n\n` +
    `PAL Locals reviewed and verified your listing — customers can now find + request you.\n\n` +
    (sendsPhotos
      ? `Want way more requests? Send photos. Listings with photos convert dramatically better. You're live either way — photos just get your inbox busier. Email them to hello@theportalocal.com when you can.\n\n`
      : ``) +
    `Questions? Reply or email hello@theportalocal.com.\n\n— The Port A Local`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Locals <bookings@theportalocal.com>",
        to: [i.email],
        reply_to: "hello@theportalocal.com",
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[locals offer approve] email failed:", err);
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function htmlSuccess(name: string, verb: string): NextResponse {
  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #e5dcc7; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#1f7a4d; margin:0 0 8px; font-weight:bold;">
          PAL Locals · Admin
        </p>
        <h1 style="margin:0 0 16px; font-size:28px;">${escapeHtml(name)} — ${escapeHtml(verb)} ✓</h1>
        <p style="font-family:Inter,system-ui,sans-serif; line-height:1.6; color:#1a2433; font-size:14px;">
          Approved on PAL Locals. Their "you&apos;re in" email is on the way.
        </p>
        <p style="font-family:Inter,system-ui,sans-serif; font-size:12px; color:#555; margin-top:16px;">
          Once photos land at hello@, hit the verify-photos link in the
          original admin email or add the listing to
          <code>src/data/locals-listings.ts</code> with isActive=true.
        </p>
      </div>
    `),
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function htmlError(msg: string): NextResponse {
  return new NextResponse(
    htmlPage(`
      <div style="max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #c83a3a; border-radius:16px; font-family:Georgia, serif;">
        <p style="text-transform:uppercase; letter-spacing:0.2em; font-size:11px; color:#c83a3a; margin:0 0 8px; font-weight:bold;">
          PAL Locals · Approval error
        </p>
        <h1 style="margin:0 0 16px; font-size:24px;">${escapeHtml(msg)}</h1>
      </div>
    `),
    {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
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

// Suppress unused-warning when ENABLE_APP_URL_LINKING is undefined
void APP_URL;
