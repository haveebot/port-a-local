import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, type LocalsCategory } from "@/data/locals-types";
import { mirrorLocalsInquiryToWheelhouse } from "@/lib/localsDispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface InquiryBody {
  name?: string;
  phone?: string;
  email?: string;
  category?: LocalsCategory;
  listingId?: string;
  details?: string;
  when?: string;
}

/**
 * POST /api/locals/inquiry — customer requests a quote / asks PAL to find
 * a local for what they need. Emails admin@ + hello@ + mirrors to the
 * pinned PAL Locals Wheelhouse thread for ops visibility.
 */
export async function POST(req: NextRequest) {
  let body: InquiryBody;
  try {
    body = (await req.json()) as InquiryBody;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const details = (body.details ?? "").trim();
  if (
    name.length < 2 ||
    phone.replace(/\D/g, "").length < 10 ||
    details.length < 4
  ) {
    return NextResponse.json(
      { error: "Name, phone, and details are required." },
      { status: 400 },
    );
  }

  const cat = CATEGORIES.find((c) => c.id === body.category);
  const apiKey = process.env.RESEND_API_KEY;

  const subject = `PAL Locals — inquiry: ${name}${cat ? ` (${cat.label})` : ""}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Locals · Inquiry
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(name)}</h2>

      <p style="margin: 0 0 4px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>
      ${body.email ? `<p style="margin: 0 0 4px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>` : ""}
      ${cat ? `<p style="margin: 0 0 4px;"><strong>Category:</strong> ${escapeHtml(cat.label)} <span style="color:#888;">(${cat.mode})</span></p>` : ""}
      ${body.listingId ? `<p style="margin: 0 0 4px;"><strong>Listing:</strong> <code>${escapeHtml(body.listingId)}</code></p>` : ""}
      ${body.when ? `<p style="margin: 0 0 4px;"><strong>When:</strong> ${escapeHtml(body.when)}</p>` : ""}

      <h3 style="margin: 20px 0 6px; font-size: 14px;">What they need</h3>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(details)}</p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 12px; color: #555;">
        Connect them to the right local within 24 hours. Reply-to is the
        customer&apos;s email.
      </p>
    </div>
  `;
  const text =
    `PAL Locals inquiry from ${name}\n\n` +
    `Phone: ${phone}\n` +
    (body.email ? `Email: ${body.email}\n` : "") +
    (cat ? `Category: ${cat.label} (${cat.mode})\n` : "") +
    (body.listingId ? `Listing: ${body.listingId}\n` : "") +
    (body.when ? `When: ${body.when}\n` : "") +
    `\nDetails:\n${details}`;

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
      console.error("[locals inquiry] email failed:", err);
    }
  }

  // Wheelhouse mirror — best effort
  await mirrorLocalsInquiryToWheelhouse({
    kind: "inquiry",
    name,
    phone,
    email: body.email,
    category: cat?.label,
    mode: cat?.mode,
    listingId: body.listingId,
    when: body.when,
    details,
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
