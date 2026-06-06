/**
 * Forward an inbound SMS from an UNKNOWN sender (not insider, not cart vendor,
 * not beach vendor) to admin@theportalocal.com via Resend, so it lands in the
 * same inbox Claude reads on session start.
 *
 * Origin (2026-05-04): the only place stranger inbounds previously surfaced
 * was an SMS forward to Winston's phone (`[unknown +1xxx → PAL] body`). That
 * pinned inbound state to a single physical device, violating the hub-spoke
 * architecture rule (`feedback_hub_spoke_architecture.md` — state must live
 * in shared comms, not on one machine). Worse, it blocked the "just text PAL"
 * marketing pitch — strangers couldn't actually reach the agent layer.
 *
 * This module closes that gap by mirroring `insiderSmsForward.ts` for
 * non-allowlisted phone numbers. Strangers now also land in admin@ where:
 *   - pal_mail.py inbox surfaces the message on next operator session
 *   - future Gully / agent layers can read + act
 *   - mobile/desktop email is a usable shared surface beyond Winston's phone
 *
 * No agent loop here yet — strangers stay human-reviewed by default. The
 * future "just text PAL" autonomous-reply flow gates behind operator setup.
 *
 * MMS media handling: identical pattern to insiderSmsForward — fetch each
 * Twilio Media item, base64-encode, attach to Resend payload. Stranger MMS
 * (a screenshot, a property photo, a contact-form clip) has the same value
 * as insider MMS for context.
 *
 * TODO: consolidate fetchMmsMedia + email shape into a single shared helper
 * once a third caller appears. Two callers = duplication is fine.
 */

import { emailLayout } from "./emailLayout";
import { sendPalEmail } from "./palEmail";

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
 *
 * Mirrors the helper in insiderSmsForward.ts. Will be consolidated when
 * a third caller appears.
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
      console.warn(`[stranger-sms] media list ${listRes.status} for ${messageSid}`);
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
        const mediaRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages/${messageSid}/Media/${m.sid}`,
          { headers: { Authorization: auth }, redirect: "follow" },
        );
        if (!mediaRes.ok) {
          console.warn(`[stranger-sms] media fetch ${mediaRes.status} for ${m.sid}`);
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
        console.warn(`[stranger-sms] media item failed:`, err);
      }
    }
    return results;
  } catch (err) {
    console.warn(`[stranger-sms] media fetch failed:`, err);
    return [];
  }
}

/**
 * Forward a stranger SMS to admin@. Fire-and-forget from the Twilio
 * webhook — the webhook returns TwiML immediately and lets this complete
 * in the background (Twilio gives us 15s; Resend + media fetch typically
 * finishes well within that).
 *
 * @param fromE164  E.164-formatted sender phone (already normalized by
 *                  the inbound route).
 * @param body      Raw SMS body.
 * @param sid       Twilio MessageSid (for media lookup + audit trail).
 */
export async function forwardStrangerSmsToAdmin(
  fromE164: string,
  body: string,
  sid: string,
): Promise<void> {
  // Fetch any attached MMS media in parallel with composing the email.
  const mediaPromise = fetchMmsMedia(sid);

  const previewSlice = body.slice(0, 60).replace(/\s+/g, " ").trim();
  const subject = `[SMS from ${fromE164}] ${previewSlice}${body.length > 60 ? "…" : ""}`;

  const html = emailLayout({
    tone: "alert",
    preheader: `Unknown number ${fromE164} just texted PAL`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">📱 SMS from unknown number</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Sender is not in the insider, cart-vendor, or beach-vendor allowlists. Treat as a customer / lead inquiry until classified.</p>
      <blockquote style="border-left:4px solid #e8656f; padding:14px 18px; margin:16px 0; background:#faf8f3; border-radius:6px;">
        <p style="margin:0; font-size:16px; line-height:1.6; color:#0b1120; white-space:pre-wrap;">${escapeHtml(body)}</p>
      </blockquote>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p style="font-size:12px; color:#8896ab; margin:4px 0;"><strong>From:</strong> <a href="sms:${escapeHtml(fromE164)}" style="color:#e8656f;">${escapeHtml(fromE164)}</a></p>
      <p style="font-size:12px; color:#8896ab; margin:4px 0;"><strong>Twilio SID:</strong> <code>${escapeHtml(sid)}</code></p>
      <p style="font-size:12px; color:#8896ab; margin:12px 0 0 0;">Reply via SMS from your phone, or surface to Claude on next session — admin@ is the bridge. Add this number to <code>data/insiders.ts</code> if it should bypass this surface.</p>
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
