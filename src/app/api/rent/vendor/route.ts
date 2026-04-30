import { NextRequest, NextResponse } from "next/server";
import { mirrorCartVendorSignup } from "@/lib/vendorPipelineDispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface VendorBody {
  businessName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  fleetSummary?: string;
  serviceArea?: string;
  handoff?: "delivery" | "pickup" | "both";
  insuranceCarrier?: string;
  pricingApproach?: string;
  termsAcknowledged?: boolean;
  notes?: string;
}

/**
 * POST /api/rent/vendor — golf-cart vendor signup
 *
 * Captures business + contact + fleet + handoff + insurance, fires
 * an admin email with a [CART VENDOR] subject tag, mirrors to the
 * Wheelhouse "PAL Carts — vendor pipeline" thread.
 *
 * No Stripe, no DB persistence at v1 — the email + Wheelhouse thread
 * is the inbox-as-CRM. Add a `cart_vendors` table when volume justifies.
 */
export async function POST(req: NextRequest) {
  let body: VendorBody;
  try {
    body = (await req.json()) as VendorBody;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const businessName = (body.businessName ?? "").trim();
  const contactName = (body.contactName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const fleetSummary = (body.fleetSummary ?? "").trim();
  const handoff: "delivery" | "pickup" | "both" =
    body.handoff === "pickup" || body.handoff === "both"
      ? body.handoff
      : "delivery";

  if (
    businessName.length < 2 ||
    contactName.length < 2 ||
    phone.replace(/\D/g, "").length < 10 ||
    fleetSummary.length < 10
  ) {
    return NextResponse.json(
      {
        error:
          "Need business name, contact name, real phone, and a sentence about your fleet.",
      },
      { status: 400 },
    );
  }
  if (body.termsAcknowledged !== true) {
    return NextResponse.json(
      {
        error:
          "Please confirm you're 18+ and represent a legitimate, insured cart-rental operation.",
      },
      { status: 400 },
    );
  }

  // Admin email — [CART VENDOR] tag for Gmail filter routing.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const subject = `[CART VENDOR] ${businessName} — ${contactName}`;
    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
        <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
          PAL Carts · Vendor pipeline
        </p>
        <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(businessName)}</h2>
        <p style="margin: 0 0 4px;"><strong>Contact:</strong> ${escapeHtml(contactName)}</p>
        <p style="margin: 0 0 4px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>
        ${email ? `<p style="margin: 0 0 4px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : ""}
        <p style="margin: 0 0 4px;"><strong>Handoff:</strong> ${escapeHtml(handoff)}</p>
        ${body.serviceArea ? `<p style="margin: 0 0 4px;"><strong>Service area:</strong> ${escapeHtml(body.serviceArea.trim())}</p>` : ""}
        ${body.insuranceCarrier ? `<p style="margin: 0 0 4px;"><strong>Insurance:</strong> ${escapeHtml(body.insuranceCarrier.trim())}</p>` : ""}
        ${body.pricingApproach ? `<p style="margin: 0 0 4px;"><strong>Pricing:</strong> ${escapeHtml(body.pricingApproach.trim())}</p>` : ""}

        <h3 style="margin: 20px 0 6px; font-size: 14px;">Fleet</h3>
        <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(fleetSummary)}</p>

        ${body.notes ? `<h3 style="margin: 20px 0 6px; font-size: 14px;">Notes</h3><p style="margin: 0; white-space: pre-wrap;">${escapeHtml(body.notes.trim())}</p>` : ""}

        <p style="margin: 16px 0 0; font-size: 12px; color: #5b4d3a;"><strong>Attestation:</strong> ✓ 18+ &amp; legitimate-business acknowledged</p>

        <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
        <p style="font-size: 11px; color: #888;">— The Port A Local · Cart vendor pipeline</p>
      </div>
    `;
    const text =
      `[CART VENDOR] ${businessName} — ${contactName}\n\n` +
      `Phone: ${phone}\n` +
      (email ? `Email: ${email}\n` : "") +
      `Handoff: ${handoff}\n` +
      (body.serviceArea ? `Service area: ${body.serviceArea.trim()}\n` : "") +
      (body.insuranceCarrier ? `Insurance: ${body.insuranceCarrier.trim()}\n` : "") +
      (body.pricingApproach ? `Pricing: ${body.pricingApproach.trim()}\n` : "") +
      `\nFleet:\n${fleetSummary}\n` +
      (body.notes ? `\nNotes: ${body.notes.trim()}\n` : "") +
      `\n— PAL Cart vendor pipeline`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PAL Carts <bookings@theportalocal.com>",
          to: ["admin@theportalocal.com", "hello@theportalocal.com"],
          reply_to: email || undefined,
          subject,
          html,
          text,
        }),
      });
    } catch (err) {
      console.error("[cart vendor signup] email failed:", err);
    }
  }

  await mirrorCartVendorSignup({
    businessName,
    contactName,
    phone,
    email: email || undefined,
    fleetSummary,
    serviceArea: body.serviceArea?.trim() || undefined,
    handoff,
    insuranceCarrier: body.insuranceCarrier?.trim() || undefined,
    pricingApproach: body.pricingApproach?.trim() || undefined,
    notes: body.notes?.trim() || undefined,
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
