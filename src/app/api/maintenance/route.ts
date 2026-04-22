import { NextRequest, NextResponse } from "next/server";
import { emailLayout } from "@/lib/emailLayout";
import { sendSms, sendConsumerSms } from "@/lib/twilioSms";

const JOHN_PHONE = process.env.JOHN_BROWN_PHONE || "(361) 455-8606";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

// John Brown is SMS-only by design — vendor doesn't take email.
// All maintenance internal emails go to INTERNAL_ALERT_EMAIL for records.

function urgencyLabel(u: string) {
  if (u === "emergency") return "🚨 EMERGENCY — ASAP";
  if (u === "urgent") return "⚡ URGENT — Within 48 hrs";
  return "📋 Routine — Within a week";
}

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
    const err = await res.text();
    console.error("[Email] Resend error:", err);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, address, serviceType, description, urgency, contactPref, smsConsent } = body;

  if (!name || !phone || !email || !address || !serviceType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const urgencyText = urgencyLabel(urgency);

  // --- SMS to John Brown ---
  const smsBody = `PORT A LOCAL — New Maintenance Request\n${urgencyText}\n\nFrom: ${name}\nPhone: ${phone}\nAddress: ${address}\nService: ${serviceType}\n\n"${description.slice(0, 120)}${description.length > 120 ? "..." : ""}"\n\nReply or call customer directly.`;

  const vendorHtml = emailLayout({
    tone: "alert",
    preheader: `Maintenance request — ${urgencyText} — ${name}`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">New Maintenance Request</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;"><strong>Urgency:</strong> ${urgencyText}</p>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}" style="color:#e8656f;">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#e8656f;">${email}</a></p>
      <p><strong>Preferred contact:</strong> ${contactPref}</p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p><strong>Property:</strong> ${address}</p>
      <p><strong>Service:</strong> ${serviceType}</p>
      <p><strong>Description:</strong></p>
      <p style="background:#f5f0e8; padding:12px; border-radius:8px; border:1px solid #e4dccc;">${description}</p>
    `,
  });

  const customerHtml = emailLayout({
    preheader: "We received your maintenance request.",
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">We received your maintenance request</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Our local service team is reviewing the details. Someone will be in touch shortly to confirm availability and schedule the work.</p>
      <p>Hi ${name},</p>
      <p><strong>Your request:</strong></p>
      <ul>
        <li><strong>Service:</strong> ${serviceType}</li>
        <li><strong>Property:</strong> ${address}</li>
        <li><strong>Urgency:</strong> ${urgencyText}</li>
      </ul>
      <p>Questions? Reply to this email.</p>
      <p style="margin-top:20px;">— The Port A Local</p>
    `,
  });

  // SMS confirmation to customer — only if they opted in via the form checkbox.
  const customerSMS = `Port A Local: We received your maintenance request for "${serviceType}" at ${address}. Our team will be in touch shortly. Reply STOP to opt out.`;

  console.log(`[Maintenance] Customer phone raw: "${phone}" | John phone: "${JOHN_PHONE}" | smsConsent: ${smsConsent}`);

  // Vendor / internal-ops SMS (John Brown + admin) always fires — internal B2B, not consumer.
  // Customer SMS is gated on smsConsent === true (collected via the opt-in checkbox).
  await Promise.allSettled([
    sendSms(JOHN_PHONE, smsBody),
    ADMIN_PHONE ? sendSms(ADMIN_PHONE, smsBody) : Promise.resolve(),
    sendConsumerSms(phone, customerSMS, smsConsent),
    INTERNAL_EMAIL ? sendEmail(INTERNAL_EMAIL, `[${urgency.toUpperCase()}] Maintenance Request — ${name} — ${serviceType}`, vendorHtml) : Promise.resolve(),
    sendEmail(email, "We received your maintenance request — Port A Local", customerHtml),
  ]);

  console.log(`[Maintenance] New request from ${name} (${phone}) — ${serviceType} — ${urgency}`);

  return NextResponse.json({ success: true });
}
