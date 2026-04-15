import { NextRequest, NextResponse } from "next/server";
import { emailLayout } from "@/lib/emailLayout";

const JOHN_PHONE = process.env.JOHN_BROWN_PHONE || "(361) 455-8606";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || "";
const TWILIO_MESSAGING_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

// John Brown is SMS-only by design — vendor doesn't take email.
// All maintenance internal emails go to INTERNAL_ALERT_EMAIL for records.

function urgencyLabel(u: string) {
  if (u === "emergency") return "🚨 EMERGENCY — ASAP";
  if (u === "urgent") return "⚡ URGENT — Within 48 hrs";
  return "📋 Routine — Within a week";
}

async function sendSMS(to: string, body: string) {
  if (!TWILIO_SID || !TWILIO_TOKEN || (!TWILIO_MESSAGING_SID && !TWILIO_FROM)) {
    console.log("[SMS] Twilio not configured — would send to", to, ":", body);
    return;
  }
  const toClean = to.replace(/\D/g, "").replace(/^1/, ""); // strip leading 1 if present
  const toFormatted = `+1${toClean}`;
  if (toClean.length !== 10) {
    console.error(`[SMS] Invalid phone number: ${to} → ${toFormatted}`);
    return;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const params: Record<string, string> = { To: toFormatted, Body: body };
  if (TWILIO_MESSAGING_SID) {
    params.MessagingServiceSid = TWILIO_MESSAGING_SID;
    console.log(`[SMS] Sending to ${toFormatted} via Messaging Service ${TWILIO_MESSAGING_SID}`);
  } else {
    params.From = TWILIO_FROM;
    console.log(`[SMS] Sending to ${toFormatted} from ${TWILIO_FROM}`);
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const result = await res.json();
  if (!res.ok) {
    console.error("[SMS] Twilio error:", JSON.stringify(result));
  } else {
    console.log("[SMS] Sent successfully. SID:", result.sid, "Status:", result.status);
  }
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
  const { name, phone, email, address, serviceType, description, urgency, contactPref } = body;

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
      <p style="margin-top:20px;">— the Port A Local team</p>
    `,
  });

  // SMS confirmation to customer
  const customerSMS = `Port A Local: We received your maintenance request for "${serviceType}" at ${address}. Our team is reviewing it and will be in touch shortly.`;

  console.log(`[Maintenance] Customer phone raw: "${phone}" | John phone: "${JOHN_PHONE}"`);

  // Fire all in parallel — always send both email AND SMS to customer
  // Internal record email goes to INTERNAL_ALERT_EMAIL (admin@theportalocal.com)
  await Promise.allSettled([
    sendSMS(JOHN_PHONE, smsBody),
    ADMIN_PHONE ? sendSMS(ADMIN_PHONE, smsBody) : Promise.resolve(),
    sendSMS(phone, customerSMS),
    INTERNAL_EMAIL ? sendEmail(INTERNAL_EMAIL, `[${urgency.toUpperCase()}] Maintenance Request — ${name} — ${serviceType}`, vendorHtml) : Promise.resolve(),
    sendEmail(email, "We received your maintenance request — Port A Local", customerHtml),
  ]);

  console.log(`[Maintenance] New request from ${name} (${phone}) — ${serviceType} — ${urgency}`);

  return NextResponse.json({ success: true });
}
