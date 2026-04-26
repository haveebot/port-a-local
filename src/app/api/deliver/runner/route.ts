import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RunnerSignup {
  name?: string;
  phone?: string;
  email?: string;
  vehicle?: string;
  availability?: string;
  why?: string;
}

/**
 * POST /api/deliver/runner — runner signup form destination.
 *
 * Sends an email to admin@ + hello@ with the applicant details. Winston
 * follows up by phone/SMS, validates fit, then adds them to
 * src/data/delivery-drivers.ts with a fresh token.
 *
 * (When volume justifies, we'll persist applicants to a Postgres table +
 * surface them in Wheelhouse instead of just emailing.)
 */
export async function POST(req: NextRequest) {
  let body: RunnerSignup;
  try {
    body = (await req.json()) as RunnerSignup;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Name and a real phone number are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[runner signup] RESEND_API_KEY not set — logging only");
    console.log("[runner signup]", body);
    return NextResponse.json({ ok: true, mode: "logged" });
  }

  const subject = `PAL Runner application — ${name}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Runner application
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(name)}</h2>
      <p style="margin: 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>
      ${body.email ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>` : ""}
      ${body.vehicle ? `<p style="margin: 4px 0;"><strong>Vehicle:</strong> ${escapeHtml(body.vehicle)}</p>` : ""}
      ${body.availability ? `<p style="margin: 4px 0;"><strong>Availability:</strong> ${escapeHtml(body.availability)}</p>` : ""}
      ${body.why ? `<p style="margin: 12px 0 0;"><strong>Why PAL:</strong><br/>${escapeHtml(body.why).replace(/\n/g, "<br/>")}</p>` : ""}

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 12px; color: #555;">
        Reach out by phone or SMS within 24-48 hours. If they're a fit, add
        an entry to <code>src/data/delivery-drivers.ts</code> with a fresh
        token (any random string), set <code>isActive: true</code>, and
        send them their dispatch link.
      </p>
    </div>
  `;
  const text =
    `PAL Delivery — runner application from ${name}\n\n` +
    `Phone: ${phone}\n` +
    (body.email ? `Email: ${body.email}\n` : "") +
    (body.vehicle ? `Vehicle: ${body.vehicle}\n` : "") +
    (body.availability ? `Availability: ${body.availability}\n` : "") +
    (body.why ? `\nWhy PAL:\n${body.why}\n` : "") +
    `\nFollow up within 24-48 hours.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: ["admin@theportalocal.com", "hello@theportalocal.com"],
        reply_to: body.email,
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[runner signup] resend non-200:", await res.text());
      return NextResponse.json(
        { error: "Could not send. Try again or text Winston directly." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[runner signup] email failed:", err);
    return NextResponse.json(
      { error: "Could not send. Try again or text Winston directly." },
      { status: 500 },
    );
  }

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
