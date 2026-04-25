import { NextRequest, NextResponse } from "next/server";
import { emailLayout } from "@/lib/emailLayout";

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
const HELLO_EMAIL = "hello@theportalocal.com";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.log("[Email] Resend not configured — would send to", to, subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Port A Local <bookings@theportalocal.com>",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error("[Email] Resend error:", await res.text());
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ROLES = new Set([
  "organizer",
  "co-organizer",
  "host",
  "sponsor",
  "press",
  "vendor",
  "other",
]);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const eventSlug: string = (body.eventSlug ?? "").toString().trim();
  const eventName: string = (body.eventName ?? "").toString().trim();
  const name: string = (body.name ?? "").toString().trim();
  const email: string = (body.email ?? "").toString().trim();
  const role: string = (body.role ?? "other").toString().trim().toLowerCase();
  const message: string = (body.message ?? "").toString().trim();

  if (!eventSlug || name.length < 2 || !email.includes("@")) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Tell us a bit more — at least a sentence." },
      { status: 400 },
    );
  }

  const safeRole = ROLES.has(role) ? role : "other";

  const subject = `Event claim — ${eventName || eventSlug} (${safeRole})`;

  const escapedMessage = escape(message).replace(/\n/g, "<br/>");
  const escapedName = escape(name);
  const escapedEmail = escape(email);
  const escapedRole = escape(safeRole);
  const escapedEvent = escape(eventName || eventSlug);
  const eventUrl = `https://theportalocal.com/events/${encodeURIComponent(eventSlug)}`;

  const html = emailLayout({
    tone: "alert",
    preheader: `Event claim from ${name} (${safeRole}) on ${eventName || eventSlug}`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">Event claim — ${escapedEvent}</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Submitted via the "Are you the organizer?" form on the event page.</p>
      <p><strong>From:</strong> ${escapedName} &lt;${escapedEmail}&gt;</p>
      <p><strong>Role:</strong> ${escapedRole}</p>
      <p><strong>Event:</strong> <a href="${eventUrl}">${escapedEvent}</a></p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p><strong>Message:</strong></p>
      <p style="background:#f5f0e8; padding:14px; border-radius:8px; border:1px solid #e4dccc; white-space:pre-wrap;">${escapedMessage}</p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p style="font-size:12px; color:#4a5568;">Reply directly to ${escapedEmail} to respond.</p>
    `,
  });

  console.log(
    `[Event Claim] ${name} (${safeRole}) on ${eventSlug} — ${message.length} chars`,
  );

  const targets =
    INTERNAL_EMAIL && INTERNAL_EMAIL !== HELLO_EMAIL
      ? [INTERNAL_EMAIL, HELLO_EMAIL]
      : [HELLO_EMAIL];

  await Promise.allSettled(targets.map((to) => sendEmail(to, subject, html)));

  return NextResponse.json({ success: true });
}
