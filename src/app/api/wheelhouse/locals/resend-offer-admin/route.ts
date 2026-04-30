import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  CATEGORIES,
  type ListingMode,
  type LocalsCategory,
} from "@/data/locals-types";
import { createLocalsOffer } from "@/data/locals-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * POST /api/wheelhouse/locals/resend-offer-admin
 *
 * Wheelhouse-only admin tool — takes offer details (from a real
 * applicant who submitted before the locals_offers table existed,
 * or any case where Winston needs to re-fire the admin email),
 * inserts into DB, and sends the admin email with the magic-link
 * approve/reject/verify-photos buttons.
 *
 * Does NOT send the applicant a confirmation — they presumably got
 * one already (otherwise we'd just point them at /locals/offer).
 *
 * Auth: cookie-gated on wheelhouse_who. Same gate as the rest of
 * /wheelhouse — internal-only, not for public use.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }

  let body: {
    name?: string;
    phone?: string;
    email?: string;
    businessName?: string;
    mode?: ListingMode;
    category?: LocalsCategory;
    description?: string;
    pricing?: string;
    availability?: string;
    photosAcknowledged?: boolean;
  };
  try {
    body = await req.json();
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

  const cat = CATEGORIES.find((c) => c.id === body.category);
  if (!cat) {
    return NextResponse.json(
      { error: `Unknown category: ${body.category}` },
      { status: 400 },
    );
  }

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

  // Generate the same HMAC magic-links the regular submission flow
  // does. Distinct verify-photos sig from approve sig.
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

  const apiKey = process.env.RESEND_API_KEY;
  const subject = `[Re-fire] PAL Locals admin actions — ${body.businessName || name}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Locals · Admin re-fire (by ${escapeHtml(who)})
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(body.businessName || name)}</h2>

      <p style="background:#fff5f0; padding:10px 14px; border-radius:6px; border:1px solid #fde0d4; font-size:12px; color:#7d6e5a; margin: 0 0 16px;">
        This admin email was re-fired from the Wheelhouse for an offer that
        already came in. Same magic-link buttons as the original system —
        just for an offer that landed before the buttons existed.
      </p>

      <p style="margin: 0 0 4px;"><strong>Person:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 0 0 4px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>
      ${body.email ? `<p style="margin: 0 0 4px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>` : ""}
      <p style="margin: 0 0 4px;"><strong>Type:</strong> ${escapeHtml(body.mode)} · ${escapeHtml(cat.label)}</p>
      ${body.pricing ? `<p style="margin: 0 0 4px;"><strong>Pricing:</strong> ${escapeHtml(body.pricing)}</p>` : ""}
      ${body.availability ? `<p style="margin: 0 0 4px;"><strong>Availability:</strong> ${escapeHtml(body.availability)}</p>` : ""}

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Description</h3>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(description)}</p>

      ${
        body.mode === "rent"
          ? `
      <div style="background:#fff5f0; padding:12px 14px; border-radius:8px; margin:16px 0; border:1px solid #fde0d4;">
        <p style="margin: 0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">Photos (quality signal — optional)</p>
        <p style="margin: 4px 0; font-size:13px;">
          ${body.photosAcknowledged ? "✓ Acknowledged at signup" : "✗ Not acknowledged"}
        </p>
        ${
          verifyPhotosUrl
            ? `<p style="margin: 12px 0 0; font-size:11px; color:#7d6e5a; font-style:italic;">When photos arrive at hello@ and look good, click below to mark photo-verified. Listings WITHOUT photos still go live on Verify — they just convert worse.</p>
               <p style="margin: 6px 0 0;"><a href="${verifyPhotosUrl}" style="display:inline-block; padding:8px 14px; background:#fff; color:#1f7a4d; text-decoration:none; border-radius:6px; font-weight:bold; font-size:12px; border:1px solid #1f7a4d;">✓ Mark photos verified</a></p>`
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
          ✓ Verify ${escapeHtml(body.businessName || name)}
        </a>
        <a href="${rejectUrl}" style="display:inline-block; padding:14px 28px; background:#fff; color:#8a3a3a; text-decoration:none; border-radius:8px; font-weight:bold; border:1px solid #c83a3a;">
          Reject
        </a>
      </div>
      <p style="font-size:12px; color:#555; margin: 0 0 16px;">
        <strong>Verify</strong> = listed and live on PAL Locals. Auto-emails
        them: <em>"You're verified — listing is in."</em>
        <strong>Reject</strong> is silent (no email to the applicant).
        ${
          body.mode === "rent"
            ? `<br/><br/>Photos are optional but boost conversion. Mark them verified above once they arrive at hello@ — quality signal, not a gate.`
            : ""
        }
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
    `[Re-fire by ${who}] PAL Locals admin actions — ${body.businessName || name}\n\n` +
    `Person: ${name}\nPhone: ${phone}\n` +
    (body.email ? `Email: ${body.email}\n` : "") +
    `Type: ${body.mode} · ${cat.label}\n` +
    (body.pricing ? `Pricing: ${body.pricing}\n` : "") +
    (body.availability ? `Availability: ${body.availability}\n` : "") +
    `\nDescription:\n${description}\n\n` +
    (approveUrl && rejectUrl
      ? `Approve: ${approveUrl}\nReject:  ${rejectUrl}\n${verifyPhotosUrl ? `Verify photos: ${verifyPhotosUrl}\n` : ""}`
      : `(Set ADMIN_APPROVAL_SECRET in Vercel for magic-links.)\n`) +
    `\nOffer ID: ${offer.id}`;

  if (apiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PAL Locals <bookings@theportalocal.com>",
          to: ["admin@theportalocal.com", "hello@theportalocal.com"],
          reply_to: body.email || "hello@theportalocal.com",
          subject,
          html,
          text,
        }),
      });
    } catch (err) {
      console.error("[wheelhouse locals resend] email failed:", err);
      return NextResponse.json(
        { error: `Email send failed: ${err instanceof Error ? err.message : err}` },
        { status: 500 },
      );
    }
  }

  console.log(
    `[wheelhouse locals resend] re-fired admin email for ${body.businessName || name} — offer ${offer.id} — by ${who}`,
  );

  return NextResponse.json({
    ok: true,
    offerId: offer.id,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
