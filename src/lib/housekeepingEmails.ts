/**
 * Housekeeping email senders — admin alert on paid booking +
 * customer confirmation. Reply-to hello@ so customer responses
 * land in a real inbox.
 */

import type { HousekeepingBooking } from "@/data/housekeeping-store";
import { formatUSD } from "@/data/housekeeping-store";

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
