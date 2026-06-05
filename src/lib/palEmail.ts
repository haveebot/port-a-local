/**
 * PAL transactional email via Resend — the shared PAL email transport
 * (same provider + verified `theportalocal.com` sender as deliverEmails.ts).
 *
 * Generic, fail-soft sender used for operator/vendor notifications such as
 * the wheelhouse rentals "Send update" vendor email. Never throws — logs
 * and returns false on any failure so it can run alongside SMS without
 * blocking the action.
 */

export interface PalEmailInput {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  from?: string;
}

export async function sendPalEmail(opts: PalEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[palEmail] RESEND_API_KEY not set — skip");
    return false;
  }
  const to = opts.to.filter((a) => a && a.includes("@"));
  if (to.length === 0) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? "Port A Local <bookings@theportalocal.com>",
        to,
        reply_to: opts.replyTo,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("[palEmail] resend non-200:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[palEmail] send failed:", err);
    return false;
  }
}
