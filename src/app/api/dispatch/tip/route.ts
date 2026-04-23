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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tip: string = (body.tip ?? "").toString().trim();
  const name: string = (body.name ?? "").toString().trim();
  const contact: string = (body.contact ?? "").toString().trim();

  if (tip.length < 10) {
    return NextResponse.json({ error: "Tip too short" }, { status: 400 });
  }

  const preview = tip.slice(0, 80).replace(/\s+/g, " ");
  const subject = `Dispatch Tip — ${preview}${tip.length > 80 ? "..." : ""}`;

  const escapedTip = escape(tip).replace(/\n/g, "<br/>");
  const escapedName = name ? escape(name) : "<em>Anonymous</em>";
  const escapedContact = contact ? escape(contact) : "<em>Not provided</em>";

  const html = emailLayout({
    tone: "alert",
    preheader: `Dispatch tip from ${name || "Anonymous"}`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">New Dispatch Tip</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Submitted via the /dispatch tip form.</p>
      <p><strong>From:</strong> ${escapedName}</p>
      <p><strong>Contact:</strong> ${escapedContact}</p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p><strong>Tip:</strong></p>
      <p style="background:#f5f0e8; padding:14px; border-radius:8px; border:1px solid #e4dccc; white-space:pre-wrap;">${escapedTip}</p>
    `,
  });

  console.log(`[Dispatch Tip] Received from ${name || "anon"} — ${tip.length} chars`);

  const targets = INTERNAL_EMAIL && INTERNAL_EMAIL !== HELLO_EMAIL
    ? [INTERNAL_EMAIL, HELLO_EMAIL]
    : [HELLO_EMAIL];

  await Promise.allSettled(targets.map((to) => sendEmail(to, subject, html)));

  return NextResponse.json({ success: true });
}
