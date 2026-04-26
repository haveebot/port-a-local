import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  createDriverApplication,
  getDriverByPhone,
} from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

interface RunnerSignup {
  name?: string;
  phone?: string;
  email?: string;
  vehicle?: string;
  availability?: string;
  why?: string;
}

/**
 * POST /api/deliver/runner — runner signup → DB record + admin approval email
 *
 * 1. Validates the form
 * 2. Creates a delivery_drivers row with is_active=false
 * 3. Generates an HMAC magic link Winston can click to approve
 * 4. Emails admin@/hello@ with applicant detail + approve link
 *
 * Once Winston clicks approve, /api/deliver/runner/approve flips
 * is_active=true and emails the runner their welcome links (on/off-duty
 * + payouts setup) so they're ready to go.
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

  // Block duplicate applications — same phone shouldn't create two rows.
  // Direct them to the lookup flow instead so they can recover their links.
  const existing = await getDriverByPhone(phone);
  if (existing) {
    const status = existing.isActive
      ? "already-active"
      : existing.rejectedAt
        ? "previously-rejected"
        : "pending-review";
    return NextResponse.json(
      {
        error:
          status === "already-active"
            ? "We've already got an active runner with that phone. Use the lookup page to recover your driver links."
            : status === "pending-review"
              ? "We've already got your application — give us a day or two to get back to you. If you've lost your follow-up email, use the lookup page."
              : "There was an issue with a prior application from this phone. Email hello@theportalocal.com so we can sort it out.",
        status,
      },
      { status: 409 },
    );
  }

  const driver = await createDriverApplication({
    name,
    phone,
    email: body.email?.trim() || undefined,
    vehicle: body.vehicle?.trim() || undefined,
    availability: body.availability?.trim() || undefined,
    why: body.why?.trim() || undefined,
  });

  // HMAC-signed magic link Winston (or anyone with admin secret) can click
  // to approve without needing to log in to a dashboard.
  const adminSecret = process.env.ADMIN_APPROVAL_SECRET;
  let approveUrl: string | null = null;
  let rejectUrl: string | null = null;
  if (adminSecret) {
    const sig = crypto
      .createHmac("sha256", adminSecret)
      .update(driver.id)
      .digest("hex");
    approveUrl = `${APP_URL}/api/deliver/runner/approve?d=${driver.id}&s=${sig}`;
    rejectUrl = `${APP_URL}/api/deliver/runner/reject?d=${driver.id}&s=${sig}`;
  }

  await sendAdminApplicationEmail({
    driverId: driver.id,
    name: driver.name,
    phone: driver.phone,
    email: driver.email ?? undefined,
    vehicle: driver.vehicle ?? undefined,
    availability: driver.availability ?? undefined,
    why: driver.why ?? undefined,
    approveUrl,
    rejectUrl,
  });

  // Confirmation email to the applicant — only if they gave us an email.
  // Lets them know we received it; sets expectation for next steps.
  if (driver.email) {
    await sendApplicantReceivedEmail({
      name: driver.name,
      email: driver.email,
    });
  }

  return NextResponse.json({ ok: true });
}

async function sendApplicantReceivedEmail(i: {
  name: string;
  email: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const first = i.name.split(" ")[0];
  const subject = `Got your runner application — PAL Delivery`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Runner application
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">Got it, ${escapeHtml(first)}.</h2>

      <p>Your application landed. Here&apos;s what happens next:</p>

      <ol style="margin: 12px 0 16px; padding-left: 20px;">
        <li>We review your info — usually within a day or two.</li>
        <li>If you&apos;re a fit, we&apos;ll text or call for a quick chat.</li>
        <li>Once approved, you&apos;ll get a welcome email with your two driver links: Stripe payout setup + on-duty toggle.</li>
        <li>Set up payouts (5 min, Stripe-hosted) and you&apos;re ready to take orders.</li>
      </ol>

      <p>Quality over volume on our end — we keep PAL Delivery to actual locals we trust. Hang tight.</p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 13px;">Anything urgent? Reply to this email — we read every one.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Got it, ${first}.\n\n` +
    `Your runner application landed. Here's what happens next:\n\n` +
    `1. We review your info — usually within a day or two.\n` +
    `2. If you're a fit, we'll text or call for a quick chat.\n` +
    `3. Once approved, you'll get a welcome email with your two driver links: Stripe payout setup + on-duty toggle.\n` +
    `4. Set up payouts (5 min, Stripe-hosted) and you're ready to take orders.\n\n` +
    `Quality over volume on our end. Hang tight.\n\n` +
    `Anything urgent? Reply to this email.\n\n` +
    `— The Port A Local`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: [i.email],
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[applicant received] email failed:", err);
  }
}

interface AdminEmailInput {
  driverId: string;
  name: string;
  phone: string;
  email?: string;
  vehicle?: string;
  availability?: string;
  why?: string;
  approveUrl: string | null;
  rejectUrl: string | null;
}

async function sendAdminApplicationEmail(i: AdminEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[runner signup] RESEND_API_KEY not set — logging only");
    console.log("[runner signup]", i);
    return;
  }

  const subject = `🚗 PAL Runner application — ${i.name}`;
  const approveBlock = i.approveUrl
    ? `
      <div style="margin: 24px 0;">
        <a href="${i.approveUrl}" style="display:inline-block; padding:14px 28px; background:#1f7a4d; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; margin-right:8px;">
          ✓ Approve ${escapeHtml(i.name)}
        </a>
        ${
          i.rejectUrl
            ? `<a href="${i.rejectUrl}" style="display:inline-block; padding:14px 28px; background:#fff; color:#8a3a3a; text-decoration:none; border-radius:8px; font-weight:bold; border:1px solid #c83a3a;">Reject</a>`
            : ""
        }
      </div>
      <p style="font-size:12px; color:#888;">
        Approval auto-emails them their on-duty toggle link + Stripe payout
        setup link. Reject just marks them rejected (no email sent).
        ADMIN_APPROVAL_SECRET protects these links.
      </p>
    `
    : `<p style="font-size:12px; color:#c83a3a;">Set ADMIN_APPROVAL_SECRET in Vercel to enable one-click approval.</p>`;

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Runner application
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(i.name)}</h2>
      <p style="margin: 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(i.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(i.phone)}</a></p>
      ${i.email ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(i.email)}">${escapeHtml(i.email)}</a></p>` : ""}
      ${i.vehicle ? `<p style="margin: 4px 0;"><strong>Vehicle:</strong> ${escapeHtml(i.vehicle)}</p>` : ""}
      ${i.availability ? `<p style="margin: 4px 0;"><strong>Availability:</strong> ${escapeHtml(i.availability)}</p>` : ""}
      ${i.why ? `<p style="margin: 12px 0 0;"><strong>Why PAL:</strong><br/>${escapeHtml(i.why).replace(/\n/g, "<br/>")}</p>` : ""}

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      ${approveBlock}

      <p style="font-size: 11px; color: #888;">
        Driver ID: <code>${escapeHtml(i.driverId)}</code>
      </p>
    </div>
  `;
  const text =
    `PAL Runner application — ${i.name}\n\n` +
    `Phone: ${i.phone}\n` +
    (i.email ? `Email: ${i.email}\n` : "") +
    (i.vehicle ? `Vehicle: ${i.vehicle}\n` : "") +
    (i.availability ? `Availability: ${i.availability}\n` : "") +
    (i.why ? `\nWhy PAL:\n${i.why}\n` : "") +
    (i.approveUrl
      ? `\nApprove: ${i.approveUrl}\nReject:  ${i.rejectUrl}\n`
      : "\n(Set ADMIN_APPROVAL_SECRET to enable one-click approval.)\n") +
    `\nDriver ID: ${i.driverId}`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: ["admin@theportalocal.com", "hello@theportalocal.com"],
        reply_to: i.email,
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[runner signup] email failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
