import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  CATEGORIES,
  type ListingMode,
  type LocalsCategory,
} from "@/data/locals-types";
import { mirrorLocalsInquiryToWheelhouse } from "@/lib/localsDispatch";
import { createLocalsOffer } from "@/data/locals-store";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface OfferBody {
  name?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  mode?: ListingMode;
  category?: LocalsCategory;
  description?: string;
  pricing?: string;
  availability?: string;
  /** Required for rent-mode listings — applicant attests they'll
      email photos of their listing to hello@theportalocal.com. */
  photosAcknowledged?: boolean;
}

/**
 * POST /api/locals/offer — provider signup. Sends to admin@ + hello@,
 * mirrors into the PAL Locals Wheelhouse thread.
 *
 * Winston follows up by phone for fit check, then adds approved
 * listings to src/data/locals-listings.ts.
 */
export async function POST(req: NextRequest) {
  let body: OfferBody;
  try {
    body = (await req.json()) as OfferBody;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const description = (body.description ?? "").trim();
  if (
    name.length < 2 ||
    phone.replace(/\D/g, "").length < 10 ||
    description.length < 10 ||
    !body.mode ||
    !body.category
  ) {
    return NextResponse.json(
      {
        error:
          "Name, phone, mode, category, and a real description are required.",
      },
      { status: 400 },
    );
  }
  // Rent-mode listings require photo attestation. Hire-mode (skills)
  // is photo-optional — a description usually carries the listing.
  if (body.mode === "rent" && body.photosAcknowledged !== true) {
    return NextResponse.json(
      {
        error:
          "Rent listings need the photo acknowledgement — confirm you'll email photos to hello@theportalocal.com.",
      },
      { status: 400 },
    );
  }

  const cat = CATEGORIES.find((c) => c.id === body.category);
  const apiKey = process.env.RESEND_API_KEY;

  // Persist the offer so admin can approve/reject via magic links and
  // we have a durable record beyond the email inbox. Same shape as
  // runner application -> approval flow.
  const offer = await createLocalsOffer({
    name,
    phone,
    email: body.email?.trim() || undefined,
    businessName: body.businessName?.trim() || undefined,
    mode: body.mode,
    category: body.category,
    description,
    pricing: body.pricing?.trim() || undefined,
    availability: body.availability?.trim() || undefined,
    photosAcknowledged: body.photosAcknowledged === true,
  });

  // HMAC-signed magic links for one-click admin actions. Distinct sigs
  // per kind so a leaked approve link can't be replayed against verify
  // or reject.
  const adminSecret = process.env.ADMIN_APPROVAL_SECRET;
  let approveUrl: string | null = null;
  let rejectUrl: string | null = null;
  let verifyPhotosUrl: string | null = null;
  if (adminSecret) {
    const sigApprove = crypto
      .createHmac("sha256", adminSecret)
      .update(offer.id)
      .digest("hex");
    const sigVerifyPhotos = crypto
      .createHmac("sha256", adminSecret)
      .update(`${offer.id}:verify-photos`)
      .digest("hex");
    approveUrl = `${APP_URL}/api/locals/offer/approve?id=${offer.id}&s=${sigApprove}`;
    rejectUrl = `${APP_URL}/api/locals/offer/reject?id=${offer.id}&s=${sigApprove}`;
    verifyPhotosUrl = `${APP_URL}/api/locals/offer/verify-photos?id=${offer.id}&s=${sigVerifyPhotos}`;
  }

  const subject = `PAL Locals — provider signup: ${body.businessName || name} (${cat?.label ?? body.category})`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Locals · Provider signup
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(body.businessName || name)}</h2>

      <p style="margin: 0 0 4px;"><strong>Person:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 0 0 4px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>
      ${body.email ? `<p style="margin: 0 0 4px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>` : ""}
      <p style="margin: 0 0 4px;"><strong>Type:</strong> ${escapeHtml(body.mode)} · ${escapeHtml(cat?.label ?? body.category)}</p>
      ${body.pricing ? `<p style="margin: 0 0 4px;"><strong>Pricing:</strong> ${escapeHtml(body.pricing)}</p>` : ""}
      ${body.availability ? `<p style="margin: 0 0 4px;"><strong>Availability:</strong> ${escapeHtml(body.availability)}</p>` : ""}

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Description</h3>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(description)}</p>

      ${
        body.mode === "rent"
          ? `
      <div style="background:#fff5f0; padding:12px 14px; border-radius:8px; margin:16px 0; border:1px solid #fde0d4;">
        <p style="margin: 0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">Photos pending</p>
        <p style="margin: 4px 0; font-size:13px;">
          ${body.photosAcknowledged ? "✓ Acknowledged — applicant said they'll email photos to hello@" : "✗ Not acknowledged"}
        </p>
        ${
          verifyPhotosUrl
            ? `<p style="margin: 8px 0 0;"><a href="${verifyPhotosUrl}" style="display:inline-block; padding:8px 14px; background:#fff; color:#1f7a4d; text-decoration:none; border-radius:6px; font-weight:bold; font-size:12px; border:1px solid #1f7a4d;">✓ Mark photos verified</a></p>`
            : ""
        }
      </div>
      `
          : ""
      }

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      ${
        approveUrl && rejectUrl
          ? `
      <div style="margin: 24px 0;">
        <a href="${approveUrl}" style="display:inline-block; padding:14px 28px; background:#1f7a4d; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; margin-right:8px;">
          ✓ Approve ${escapeHtml(body.businessName || name)}
        </a>
        <a href="${rejectUrl}" style="display:inline-block; padding:14px 28px; background:#fff; color:#8a3a3a; text-decoration:none; border-radius:8px; font-weight:bold; border:1px solid #c83a3a;">
          Reject
        </a>
      </div>
      <p style="font-size:12px; color:#555; margin: 0 0 16px;">
        Approve = list this provider${body.mode === "rent" ? " (photos can land later — mark verified above when they do)" : ""}.
        Approval auto-emails them they're in.
        Reject is silent (no email to the applicant).
      </p>
      `
          : `<p style="font-size:12px; color:#c83a3a;">Set ADMIN_APPROVAL_SECRET in Vercel to enable one-click approval.</p>`
      }

      <p style="font-size: 12px; color: #888;">
        Offer ID: <code>${escapeHtml(offer.id)}</code>
      </p>
    </div>
  `;
  const text =
    `PAL Locals provider signup — ${body.businessName || name}\n\n` +
    `Person: ${name}\nPhone: ${phone}\n` +
    (body.email ? `Email: ${body.email}\n` : "") +
    `Type: ${body.mode} · ${cat?.label ?? body.category}\n` +
    (body.pricing ? `Pricing: ${body.pricing}\n` : "") +
    (body.availability ? `Availability: ${body.availability}\n` : "") +
    (body.mode === "rent"
      ? `Photos: ${body.photosAcknowledged ? "Acknowledged — applicant emailing to hello@" : "NOT acknowledged"}\n`
      : "") +
    `\nDescription:\n${description}`;

  if (apiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PAL Locals <bookings@theportalocal.com>",
          to: ["admin@theportalocal.com", "hello@theportalocal.com"],
          reply_to: body.email,
          subject,
          html,
          text,
        }),
      });
    } catch (err) {
      console.error("[locals offer] email failed:", err);
    }
  }

  await mirrorLocalsInquiryToWheelhouse({
    kind: "offer",
    name: body.businessName || name,
    phone,
    email: body.email,
    category: cat?.label,
    mode: body.mode,
    pricing: body.pricing,
    availability: body.availability,
    details: description,
  });

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
