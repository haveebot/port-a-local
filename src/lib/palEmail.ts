/**
 * PAL transactional email transport.
 *
 * Prefers Google Workspace — sends as admin@theportalocal.com over Gmail SMTP
 * when PAL_ADMIN_EMAIL + PAL_ADMIN_APP_PASSWORD are present, so every send
 * lands in the admin@ "Sent" folder and replies come back to that inbox
 * (reviewable in Gmail, and readable by the operator pal_mail.py tool).
 *
 * Falls back to Resend when the Workspace creds aren't configured — so the
 * migration is zero-downtime: shipping this changes nothing until the two
 * env vars are added to the deployment, then it flips to Workspace
 * automatically. Once Workspace is verified, the RESEND_API_KEY can be
 * removed and this collapses to Workspace-only.
 *
 * Fail-soft — never throws; logs and returns false on any failure so it can
 * run alongside SMS and other side effects without blocking a booking flow.
 */

import nodemailer, { type Transporter } from "nodemailer";

export interface PalEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

function toList(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to])
    .map((a) => (a ?? "").trim())
    .filter((a) => a.includes("@"));
}

/** Cheap HTML→text fallback for the multipart body (deliverability). */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

let _transport: Transporter | null = null;
function workspaceTransport(): Transporter | null {
  const user = process.env.PAL_ADMIN_EMAIL?.trim();
  const pass = process.env.PAL_ADMIN_APP_PASSWORD?.trim();
  if (!user || !pass) return null;
  if (!_transport) {
    _transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS upgrade on 587
      requireTLS: true,
      auth: { user, pass },
    });
  }
  return _transport;
}

async function sendViaWorkspace(opts: PalEmailInput, to: string[]): Promise<boolean> {
  const t = workspaceTransport();
  if (!t) return false;
  const user = (process.env.PAL_ADMIN_EMAIL as string).trim();
  await t.sendMail({
    // Gmail SMTP can only send as the authenticated mailbox, so the address
    // is always admin@; the display name stays "Port A Local".
    from: `Port A Local <${user}>`,
    to,
    replyTo: opts.replyTo ?? user,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? htmlToText(opts.html),
  });
  return true;
}

async function sendViaResend(opts: PalEmailInput, to: string[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from ?? "Port A Local <bookings@theportalocal.com>",
      to,
      reply_to: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? htmlToText(opts.html),
    }),
  });
  if (!res.ok) {
    console.error("[palEmail] resend non-200:", await res.text());
    return false;
  }
  return true;
}

export async function sendPalEmail(opts: PalEmailInput): Promise<boolean> {
  const to = toList(opts.to);
  if (to.length === 0) return false;
  try {
    if (await sendViaWorkspace(opts, to)) return true;
  } catch (err) {
    console.error("[palEmail] workspace send failed, falling back to Resend:", err);
  }
  try {
    if (await sendViaResend(opts, to)) return true;
  } catch (err) {
    console.error("[palEmail] resend send failed:", err);
  }
  console.warn("[palEmail] no transport available — skipped:", opts.subject);
  return false;
}
