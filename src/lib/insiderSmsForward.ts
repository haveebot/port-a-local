/**
 * Forward an inbound SMS from a known insider to admin@theportalocal.com
 * via Resend, so it lands in the same inbox Claude reads on session start.
 *
 * Subject line is brackets-prefixed for fast inbox skim:
 *   [SMS from Collie] First couple words of the message...
 *
 * Body is rendered with PAL's emailLayout for brand consistency.
 */

import { emailLayout } from "./emailLayout";
import type { Insider } from "@/data/insiders";

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const ADMIN_EMAIL =
  process.env.INTERNAL_ALERT_EMAIL || "admin@theportalocal.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function forwardInsiderSmsToAdmin(
  insider: Insider,
  body: string,
  sid: string,
): Promise<void> {
  if (!RESEND_KEY) {
    console.log(
      `[insider-sms] Resend not configured — would forward "${body}" from ${insider.name}`,
    );
    return;
  }

  const previewSlice = body.slice(0, 60).replace(/\s+/g, " ").trim();
  const subject = `[SMS from ${insider.name}] ${previewSlice}${body.length > 60 ? "…" : ""}`;

  const html = emailLayout({
    tone: "alert",
    preheader: `${insider.name} (${insider.role}) just texted PAL`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">📱 SMS from ${escapeHtml(insider.name)}</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">${escapeHtml(insider.role)}${insider.notes ? ` · ${escapeHtml(insider.notes)}` : ""}</p>
      <blockquote style="border-left:4px solid #e8656f; padding:14px 18px; margin:16px 0; background:#faf8f3; border-radius:6px;">
        <p style="margin:0; font-size:16px; line-height:1.6; color:#0b1120; white-space:pre-wrap;">${escapeHtml(body)}</p>
      </blockquote>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p style="font-size:12px; color:#8896ab; margin:4px 0;"><strong>From:</strong> ${escapeHtml(insider.phoneE164)}</p>
      <p style="font-size:12px; color:#8896ab; margin:4px 0;"><strong>Twilio SID:</strong> <code>${escapeHtml(sid)}</code></p>
      <p style="font-size:12px; color:#8896ab; margin:12px 0 0 0;">Reply via SMS to <a href="sms:${escapeHtml(insider.phoneE164)}" style="color:#e8656f;">${escapeHtml(insider.phoneE164)}</a> from your phone, or surface to Claude on next session — admin@ is the bridge.</p>
    `,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Port A Local <bookings@theportalocal.com>",
        to: ADMIN_EMAIL,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[insider-sms] Resend error:", err);
    }
  } catch (err) {
    console.error("[insider-sms] forward failed:", err);
  }
}
