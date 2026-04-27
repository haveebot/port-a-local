/**
 * Housekeeping email senders — admin alert on paid booking +
 * customer confirmation. Reply-to hello@ so customer responses
 * land in a real inbox.
 */

import type { HousekeepingBooking } from "@/data/housekeeping-store";
import { formatUSD } from "@/data/housekeeping-store";
import { emailLayout } from "@/lib/emailLayout";

const SITE = "https://theportalocal.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendHousekeepingAdminEmail(
  b: HousekeepingBooking,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const subject = `🧹 Housekeeping booking — ${b.customerName} · ${formatUSD(b.totalCents)}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Housekeeping · New paid booking
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(b.customerName)}</h2>

      <div style="background:#f5f0e8; padding:14px; border-radius:8px; margin-bottom:16px; border:1px solid #e5dcc7;">
        <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#7d6e5a; font-weight:bold;">Customer</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(b.customerPhone.replace(/[^\d+]/g, ""))}">${escapeHtml(b.customerPhone)}</a></p>
        <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(b.customerEmail)}">${escapeHtml(b.customerEmail)}</a></p>
      </div>

      <div style="background:#f5f0e8; padding:14px; border-radius:8px; margin-bottom:16px; border:1px solid #e5dcc7;">
        <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#7d6e5a; font-weight:bold;">Property</p>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(b.propertyAddress)}</p>
        <p style="margin: 4px 0;"><strong>Square footage:</strong> ${b.propertySqft.toLocaleString()} sqft</p>
        <p style="margin: 4px 0;"><strong>Estimated hours:</strong> ${b.estimatedHours} hr</p>
      </div>

      <div style="background:#f5f0e8; padding:14px; border-radius:8px; margin-bottom:16px; border:1px solid #e5dcc7;">
        <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#7d6e5a; font-weight:bold;">Timing</p>
        <p style="margin: 4px 0;"><strong>Preferred date:</strong> ${b.preferredDate ? escapeHtml(b.preferredDate) : "Not specified"}</p>
        <p style="margin: 4px 0;"><strong>Preferred time:</strong> ${b.preferredTime ? escapeHtml(b.preferredTime) : "Not specified"}</p>
      </div>

      ${
        b.notes
          ? `<div style="background:#fff5f0; padding:14px; border-radius:8px; margin-bottom:16px; border:1px solid #fde0d4;">
              <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">Customer notes</p>
              <p style="margin: 4px 0; white-space: pre-wrap;">${escapeHtml(b.notes)}</p>
            </div>`
          : ""
      }

      <div style="background:#ecfdf5; padding:14px; border-radius:8px; margin-bottom:16px; border:1px solid #6ee7b7;">
        <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#047857; font-weight:bold;">Paid</p>
        <p style="margin: 4px 0; font-size:18px; font-weight:bold; color:#047857;">${formatUSD(b.totalCents)}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 12px; color: #555;">
        <strong>Next:</strong> coordinate with cleaning team, confirm timing
        with customer via text/email, dispatch. v1 manual; v2 will fan
        out to the marketplace.
      </p>
      <p style="font-size: 11px; color: #888;">
        Booking ID: <code>${escapeHtml(b.id)}</code>
      </p>
    </div>
  `;
  const text =
    `New paid housekeeping booking — ${b.customerName}\n\n` +
    `Phone: ${b.customerPhone}\nEmail: ${b.customerEmail}\n\n` +
    `Address: ${b.propertyAddress}\n` +
    `Sqft: ${b.propertySqft}\nHours: ${b.estimatedHours}\n\n` +
    `Date: ${b.preferredDate ?? "not specified"}\n` +
    `Time: ${b.preferredTime ?? "not specified"}\n\n` +
    (b.notes ? `Notes:\n${b.notes}\n\n` : "") +
    `Paid: ${formatUSD(b.totalCents)}\n\n` +
    `Booking ID: ${b.id}\nView: ${SITE}/housekeeping/success/${b.id}`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Housekeeping <bookings@theportalocal.com>",
        to: ["admin@theportalocal.com", "hello@theportalocal.com"],
        reply_to: b.customerEmail,
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[housekeeping admin email] failed:", err);
  }
}

/**
 * Housekeeping customer confirmation — fires alongside the admin email
 * when a booking transitions placed → paid. Receipt + what to expect.
 * Reply-to hello@ so customer questions land in our inbox, not in a
 * black-hole transactional address.
 */
export async function sendHousekeepingCustomerEmail(
  b: HousekeepingBooking,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const firstName = b.customerName.split(" ")[0] || b.customerName;
  const subject = `Cleaning booked — ${b.propertyAddress}`;

  const bodyHtml = `
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #047857; margin: 0 0 4px; font-weight: 700;">
      Booking confirmed ✓
    </p>
    <h1 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 26px; line-height: 1.2;">
      Thanks, ${escapeHtml(firstName)}.
    </h1>
    <p style="margin: 0 0 18px; font-size: 15px; color: #1e3a5f;">
      Your cleaning is booked. We'll text or email within a day to
      confirm exact timing — no need to do anything until then.
    </p>

    <div style="background:#f5f0e8; padding:14px 16px; border-radius:10px; margin-bottom:18px; border:1px solid #e5dcc7;">
      <p style="margin: 0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#7d6e5a; font-weight:bold;">
        Your booking
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%; font-size:14px;">
        <tr><td style="padding: 3px 0; color: #555;">Address</td><td style="padding: 3px 0; text-align: right;">${escapeHtml(b.propertyAddress)}</td></tr>
        <tr><td style="padding: 3px 0; color: #555;">Square footage</td><td style="padding: 3px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace;">${b.propertySqft.toLocaleString()} sqft</td></tr>
        <tr><td style="padding: 3px 0; color: #555;">Estimated time</td><td style="padding: 3px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace;">${b.estimatedHours} hr</td></tr>
        ${b.preferredDate ? `<tr><td style="padding: 3px 0; color: #555;">Preferred date</td><td style="padding: 3px 0; text-align: right;">${escapeHtml(b.preferredDate)}</td></tr>` : ""}
        ${b.preferredTime ? `<tr><td style="padding: 3px 0; color: #555;">Preferred time</td><td style="padding: 3px 0; text-align: right;">${escapeHtml(b.preferredTime)}</td></tr>` : ""}
        <tr><td colspan="2" style="padding: 4px 0;"><div style="border-top: 1px dashed #d4c8a8;"></div></td></tr>
        <tr><td style="padding: 3px 0; font-weight: 700;">Total paid</td><td style="padding: 3px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace; font-weight: 700;">${formatUSD(b.totalCents)}</td></tr>
      </table>
    </div>

    ${
      b.notes
        ? `<div style="background:#fff5f0; padding:12px 14px; border-radius:8px; margin-bottom:18px; border:1px solid #fde0d4;">
             <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">Your notes</p>
             <p style="margin: 4px 0; white-space: pre-wrap; font-style: italic; color:#4a5a73;">${escapeHtml(b.notes)}</p>
           </div>`
        : ""
    }

    <p style="margin: 18px 0 6px; font-size: 14px;"><strong>What happens next:</strong></p>
    <ol style="margin: 0 0 8px; padding-left: 22px; font-size: 14px; line-height: 1.7;">
      <li>We'll text or email to confirm your slot within 24 hours.</li>
      <li>Cleaning team arrives at the agreed time.</li>
      <li>You don't need to be there — leave a key or door code in your reply.</li>
    </ol>

    <p style="margin-top: 24px; font-size: 12px; color: #8896ab;">
      Booking ID: <code>${escapeHtml(b.id)}</code>
    </p>

    <p style="margin-top: 28px; font-size: 14px; color: #1e3a5f;">
      Reply to this email if anything changes — date, time, special
      access, anything. We'll make it work.
    </p>

    <p style="margin-top: 16px; font-size: 14px; color: #1e3a5f;">
      — The Port A Local
    </p>
  `;

  const text = [
    `Booking confirmed — ${b.propertyAddress}`,
    "",
    `Thanks, ${firstName}.`,
    "Your cleaning is booked. We'll text or email within a day to confirm exact timing.",
    "",
    "Booking:",
    `  Address:  ${b.propertyAddress}`,
    `  Sqft:     ${b.propertySqft.toLocaleString()}`,
    `  Time:     ${b.estimatedHours} hr`,
    b.preferredDate ? `  Date:     ${b.preferredDate}` : "",
    b.preferredTime ? `  Time:     ${b.preferredTime}` : "",
    `  Total:    ${formatUSD(b.totalCents)}`,
    "",
    b.notes ? `Your notes:\n${b.notes}\n` : "",
    "Reply to this email if anything changes.",
    "",
    `Booking ID: ${b.id}`,
    "",
    "— The Port A Local",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Housekeeping <bookings@theportalocal.com>",
        to: [b.customerEmail],
        reply_to: "hello@theportalocal.com",
        subject,
        html: emailLayout({
          preheader: `Cleaning booked at ${b.propertyAddress} · ${formatUSD(b.totalCents)}`,
          bodyHtml,
        }),
        text,
      }),
    });
  } catch (err) {
    console.error("[housekeeping customer email] failed:", err);
  }
}
