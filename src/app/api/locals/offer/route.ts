import { NextRequest, NextResponse } from "next/server";
import {
  CATEGORIES,
  type ListingMode,
  type LocalsCategory,
} from "@/data/locals-types";
import { mirrorLocalsInquiryToWheelhouse } from "@/lib/localsDispatch";

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

  const cat = CATEGORIES.find((c) => c.id === body.category);
  const apiKey = process.env.RESEND_API_KEY;

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

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 12px; color: #555;">
        Phone for fit check. If approved, add to <code>src/data/locals-listings.ts</code>
        with category id <code>${escapeHtml(body.category)}</code> and isActive=true.
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
