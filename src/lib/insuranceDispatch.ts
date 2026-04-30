/**
 * PAL Delivery → insurance agent dispatcher.
 *
 * When a runner is approved (flips is_active=true), the insurance agent
 * gets a structured "please add this person to the umbrella policy"
 * email. PAL admin@ is CC'd for paper trail.
 *
 * Trigger point: on approval, NOT on signup. Reason: signups include
 * applicants we won't vet through. Sending PII to a third-party policy
 * carrier for un-vetted applicants creates privacy + compliance churn.
 * The moment they're approved, they're live and taking orders — that's
 * when umbrella coverage becomes load-bearing.
 *
 * Idempotency: the approve endpoint already short-circuits if the
 * driver is already active, so this fires exactly once per approval.
 *
 * Setup:
 *   INSURANCE_AGENT_EMAIL — set in Vercel once Winston has the address
 *
 * Until that env var is set, this function logs but doesn't send. No
 * 500s, no broken approval flow.
 */

import type { DriverRecord } from "@/data/delivery-store";

interface InsuranceEmailContext {
  approvedAt: string;
}

export async function sendInsuranceAddRunnerEmail(
  driver: DriverRecord,
  ctx: InsuranceEmailContext,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const agentEmail = process.env.INSURANCE_AGENT_EMAIL?.trim();
  if (!apiKey) {
    console.warn("[insurance dispatch] RESEND_API_KEY not set — skipping");
    return;
  }
  if (!agentEmail) {
    console.warn(
      "[insurance dispatch] INSURANCE_AGENT_EMAIL not set — skipping. Set in Vercel env to wire this up.",
    );
    console.log("[insurance dispatch] would have sent for:", {
      driverId: driver.id,
      name: driver.name,
      plate: driver.licensePlate,
      state: driver.licensePlateState,
    });
    return;
  }

  const approvedDate = new Date(ctx.approvedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `PAL Delivery — Add runner to umbrella policy: ${driver.name}`;

  const photoVerifiedNote =
    driver.licenseVerifiedAt && driver.insuranceVerifiedAt
      ? "✓ License + insurance card photos verified by PAL admin"
      : driver.licenseVerifiedAt
        ? "License photo verified · insurance photo pending"
        : driver.insuranceVerifiedAt
          ? "Insurance photo verified · license photo pending"
          : "Photos pending — applicant attested to current license + insurance at signup; will email photos to hello@ for our verification";

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5; max-width: 640px;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Umbrella policy add request
      </p>
      <h2 style="margin: 0 0 8px; font-family: Georgia, serif;">Please add to policy: ${escapeHtml(driver.name)}</h2>
      <p style="margin: 0 0 16px; color:#5b4d3a; font-size:13px;">
        Approved as an active PAL Delivery runner on <strong>${escapeHtml(approvedDate)}</strong>. They&apos;re live and taking orders — please add to the umbrella liability policy at your earliest.
      </p>

      <table style="border-collapse: collapse; width: 100%; font-size: 13px; margin: 16px 0;">
        <tbody>
          <tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7; width:160px;"><strong>Full name</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7;">${escapeHtml(driver.name)}</td></tr>
          <tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>Phone</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7;">${escapeHtml(driver.phone)}</td></tr>
          ${driver.email ? `<tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>Email</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7;">${escapeHtml(driver.email)}</td></tr>` : ""}
          ${driver.vehicle ? `<tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>Vehicle</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7;">${escapeHtml(driver.vehicle)}</td></tr>` : ""}
          <tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>License plate</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7; font-family: monospace;">${escapeHtml(driver.licensePlate ?? "—")} · ${escapeHtml(driver.licensePlateState ?? "—")}</td></tr>
          ${driver.insuranceCarrier ? `<tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>Their carrier</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7;">${escapeHtml(driver.insuranceCarrier)} <span style="color:#7d6e5a; font-size:11px;">(personal — primary; PAL umbrella sits on top)</span></td></tr>` : ""}
          <tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>PAL driver ID</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7; font-family: monospace; font-size:12px;">${escapeHtml(driver.id)}</td></tr>
          <tr><td style="padding:6px 10px; background:#f5f0e8; border:1px solid #e5dcc7;"><strong>Status</strong></td><td style="padding:6px 10px; border:1px solid #e5dcc7; color:#1f7a4d;"><strong>ACTIVE</strong> · approved ${escapeHtml(approvedDate)}</td></tr>
        </tbody>
      </table>

      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px 14px; margin: 16px 0; font-size:12px;">
        <p style="margin: 0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#a07a18; font-weight:bold;">Verification status</p>
        <p style="margin: 4px 0;">${escapeHtml(photoVerifiedNote)}</p>
      </div>

      <p style="font-size: 12px; color: #5b4d3a; margin-top: 20px;">
        Anything missing or any fields you&apos;d like added to future intake (DOB, address, license number, etc.)? Reply to this email — we can extend the runner signup form to capture it.
      </p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
      <p style="font-size: 11px; color: #888; margin: 0;">— The Port A Local</p>
    </div>
  `;

  const text =
    `PAL Delivery — Add runner to umbrella policy: ${driver.name}\n\n` +
    `Approved as active runner on ${approvedDate}. They're live and taking orders — please add to the umbrella liability policy.\n\n` +
    `Full name:    ${driver.name}\n` +
    `Phone:        ${driver.phone}\n` +
    (driver.email ? `Email:        ${driver.email}\n` : "") +
    (driver.vehicle ? `Vehicle:      ${driver.vehicle}\n` : "") +
    `Plate:        ${driver.licensePlate ?? "—"} · ${driver.licensePlateState ?? "—"}\n` +
    (driver.insuranceCarrier
      ? `Their carrier: ${driver.insuranceCarrier} (personal — primary; PAL umbrella sits on top)\n`
      : "") +
    `Driver ID:    ${driver.id}\n` +
    `Status:       ACTIVE · approved ${approvedDate}\n\n` +
    `Verification: ${photoVerifiedNote}\n\n` +
    `Anything missing? Reply to extend the intake form.\n\n` +
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
        to: [agentEmail],
        cc: ["admin@theportalocal.com"],
        reply_to: "hello@theportalocal.com",
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[insurance dispatch] email failed:", err);
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
