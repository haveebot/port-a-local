import { NextRequest, NextResponse } from "next/server";
import { mirrorRestaurantSignup } from "@/lib/vendorPipelineDispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RestaurantBody {
  restaurantName?: string;
  contactName?: string;
  contactRole?: string;
  phone?: string;
  email?: string;
  address?: string;
  hoursSummary?: string;
  menuUrl?: string;
  posSystem?: string;
  closedLoopOptIn?: boolean;
  termsAcknowledged?: boolean;
  notes?: string;
}

/**
 * POST /api/deliver/restaurant — restaurant signup for PAL Delivery
 *
 * Captures restaurant details + the optional closed-loop runner toggle
 * (their employees can be PAL drivers exclusive to their restaurant —
 * full schema for runner.restaurant_lock_id is a future build per
 * Strategy Notes Batch 2; this endpoint just captures the intent).
 *
 * Fires admin email with [RESTAURANT] subject tag, mirrors to Wheelhouse
 * "PAL Delivery — restaurant pipeline" thread. No Stripe, no DB.
 */
export async function POST(req: NextRequest) {
  let body: RestaurantBody;
  try {
    body = (await req.json()) as RestaurantBody;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const restaurantName = (body.restaurantName ?? "").trim();
  const contactName = (body.contactName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const address = (body.address ?? "").trim();

  if (
    restaurantName.length < 2 ||
    contactName.length < 2 ||
    phone.replace(/\D/g, "").length < 10 ||
    address.length < 5
  ) {
    return NextResponse.json(
      {
        error:
          "Need restaurant name, contact name, real phone, and address before we can review.",
      },
      { status: 400 },
    );
  }
  if (body.termsAcknowledged !== true) {
    return NextResponse.json(
      {
        error:
          "Please confirm you're 18+ and represent a legitimate, licensed food-service operation.",
      },
      { status: 400 },
    );
  }

  const closedLoopOptIn = body.closedLoopOptIn === true;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const subject = `[RESTAURANT] ${restaurantName} — ${contactName}${closedLoopOptIn ? " · closed-loop runner opt-in" : ""}`;
    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
        <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
          PAL Delivery · Restaurant pipeline
        </p>
        <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(restaurantName)}</h2>
        <p style="margin: 0 0 4px;"><strong>Contact:</strong> ${escapeHtml(contactName)}${body.contactRole ? ` <span style="color:#7d6e5a;">(${escapeHtml(body.contactRole.trim())})</span>` : ""}</p>
        <p style="margin: 0 0 4px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>
        ${email ? `<p style="margin: 0 0 4px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : ""}
        <p style="margin: 0 0 4px;"><strong>Address:</strong> ${escapeHtml(address)}</p>
        ${body.hoursSummary ? `<p style="margin: 0 0 4px;"><strong>Hours:</strong> ${escapeHtml(body.hoursSummary.trim())}</p>` : ""}
        ${body.menuUrl ? `<p style="margin: 0 0 4px;"><strong>Menu:</strong> <a href="${escapeHtml(body.menuUrl.trim())}">${escapeHtml(body.menuUrl.trim())}</a></p>` : ""}
        ${body.posSystem ? `<p style="margin: 0 0 4px;"><strong>POS / order tech:</strong> ${escapeHtml(body.posSystem.trim())}</p>` : ""}

        <div style="background:${closedLoopOptIn ? "#f0f7f1" : "#f5f0e8"}; padding:14px; border-radius:8px; margin: 20px 0; border:1px solid ${closedLoopOptIn ? "#1f7a4d40" : "#e5dcc7"};">
          <p style="margin: 0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:${closedLoopOptIn ? "#1f7a4d" : "#7d6e5a"}; font-weight:bold;">Closed-loop runner option</p>
          <p style="margin: 4px 0; font-size:13px;">
            ${closedLoopOptIn ? "✓ <strong>YES</strong> — wants their employees eligible as PAL runners exclusive to this restaurant. Same pay structure as regular runners." : "Not opted in this time."}
          </p>
        </div>

        ${body.notes ? `<h3 style="margin: 20px 0 6px; font-size: 14px;">Notes</h3><p style="margin: 0; white-space: pre-wrap;">${escapeHtml(body.notes.trim())}</p>` : ""}

        <p style="margin: 16px 0 0; font-size: 12px; color: #5b4d3a;"><strong>Attestation:</strong> ✓ 18+ &amp; legitimate-business acknowledged</p>

        <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
        <p style="font-size: 11px; color: #888;">— The Port A Local · Restaurant pipeline</p>
      </div>
    `;
    const text =
      `[RESTAURANT] ${restaurantName} — ${contactName}\n\n` +
      `Phone: ${phone}\n` +
      (email ? `Email: ${email}\n` : "") +
      `Address: ${address}\n` +
      (body.hoursSummary ? `Hours: ${body.hoursSummary.trim()}\n` : "") +
      (body.menuUrl ? `Menu: ${body.menuUrl.trim()}\n` : "") +
      (body.posSystem ? `POS: ${body.posSystem.trim()}\n` : "") +
      `\nClosed-loop runner opt-in: ${closedLoopOptIn ? "YES" : "no"}\n` +
      (body.notes ? `\nNotes: ${body.notes.trim()}\n` : "") +
      `\n— PAL Restaurant pipeline`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PAL Delivery <bookings@theportalocal.com>",
          to: ["admin@theportalocal.com", "hello@theportalocal.com"],
          reply_to: email || undefined,
          subject,
          html,
          text,
        }),
      });
    } catch (err) {
      console.error("[restaurant signup] email failed:", err);
    }
  }

  await mirrorRestaurantSignup({
    restaurantName,
    contactName,
    contactRole: body.contactRole?.trim() || undefined,
    phone,
    email: email || undefined,
    address,
    hoursSummary: body.hoursSummary?.trim() || undefined,
    menuUrl: body.menuUrl?.trim() || undefined,
    posSystem: body.posSystem?.trim() || undefined,
    closedLoopOptIn,
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
