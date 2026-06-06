/**
 * Forward an inbound SMS from a known insider to admin@theportalocal.com
 * via Resend, so it lands in the same inbox Claude reads on session start.
 *
 * Subject line is brackets-prefixed for fast inbox skim:
 *   [SMS from Collie] First couple words of the message...
 *
 * Body is rendered with PAL's emailLayout for brand consistency.
 *
 * MMS media: when an MMS arrives (e.g. Winston texts a screenshot),
 * Twilio attaches one or more media items. We fetch each via the
 * authenticated Media URL, base64-encode the bytes, and attach to the
 * Resend email so the receiver gets the image inline.
 */

import { emailLayout } from "./emailLayout";
import { sendPalEmail } from "./palEmail";
import type { Insider } from "@/data/insiders";

const ADMIN_EMAIL =
  process.env.INTERNAL_ALERT_EMAIL || "admin@theportalocal.com";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface MediaAttachment {
  filename: string;
  content: string; // base64
  contentType: string;
}

/**
 * Fetch all MMS media items attached to a Twilio message and return
 * Resend-compatible attachment objects. Best-effort — any fetch error
 * is logged and that item is skipped (the email still goes out).
 */
async function fetchMmsMedia(messageSid: string): Promise<MediaAttachment[]> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !messageSid) return [];
  try {
    const auth =
      "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
    const listRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages/${messageSid}/Media.json`,
      { headers: { Authorization: auth } },
    );
    if (!listRes.ok) {
      console.warn(`[insider-sms] media list ${listRes.status} for ${messageSid}`);
      return [];
    }
    const data = await listRes.json();
    const items = (data.media_list ?? []) as Array<{
      sid: string;
      content_type: string;
    }>;
    if (items.length === 0) return [];

    const results: MediaAttachment[] = [];
    for (const m of items) {
      try {
        // Twilio Media URLs return 302 to a temporary S3 link; fetch follows.
        const mediaRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages/${messageSid}/Media/${m.sid}`,
          { headers: { Authorization: auth }, redirect: "follow" },
        );
        if (!mediaRes.ok) {
          console.warn(`[insider-sms] media fetch ${mediaRes.status} for ${m.sid}`);
          continue;
        }
        const buf = Buffer.from(await mediaRes.arrayBuffer());
        const ext = m.content_type.split("/")[1] || "bin";
        results.push({
          filename: `${m.sid}.${ext}`,
          content: buf.toString("base64"),
          contentType: m.content_type,
        });
      } catch (err) {
        console.warn(`[insider-sms] media item failed:`, err);
      }
    }
    return results;
  } catch (err) {
    console.warn(`[insider-sms] media fetch failed:`, err);
    return [];
  }
}

export async function forwardInsiderSmsToAdmin(
  insider: Insider,
  body: string,
  sid: string,
): Promise<void> {
  // Fetch any attached MMS media in parallel with composing the email.
  const mediaPromise = fetchMmsMedia(sid);

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

  const media = await mediaPromise;
  const attachments = media.map((m) => ({
    filename: m.filename,
    content: m.content,
    contentType: m.contentType,
  }));

  // Append a hint to the body if media is attached so admin@ readers
  // (and Claude on session start) know to look for the file(s).
  const finalHtml =
    media.length > 0
      ? html.replace(
          "</blockquote>",
          `</blockquote><p style="font-size:12px; color:#8896ab; margin:8px 0 0 0;">📎 ${media.length} attachment${media.length === 1 ? "" : "s"} (see below): ${media.map((m) => m.filename).join(", ")}</p>`,
        )
      : html;

  await sendPalEmail({
    from: "Port A Local <bookings@theportalocal.com>",
    to: ADMIN_EMAIL,
    subject,
    html: finalHtml,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}
