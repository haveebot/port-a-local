import { NextRequest, NextResponse } from "next/server";
import { emailLayout } from "@/lib/emailLayout";
import { sendSms, sendConsumerSms } from "@/lib/twilioSms";

const JOHN_PHONE = process.env.JOHN_BROWN_PHONE || "(361) 455-8606";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

// Maintenance vendor is SMS-only by design — doesn't take email.
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

// Reject anything that isn't a small image data URI — keeps the JSON
// payload bounded and the email assembler defensive against junk input.
const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 1_500_000; // ~1.5MB per photo before base64 overhead
function sanitizePhotos(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is string => typeof p === "string")
    .filter((p) => /^data:image\/(jpeg|jpg|png|heic|heif|webp);base64,/i.test(p))
    .filter((p) => p.length < MAX_PHOTO_BYTES * 1.4) // base64 overhead
    .slice(0, MAX_PHOTOS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, address, serviceType, description, urgency, contactPref, smsConsent } = body;
  const photos = sanitizePhotos(body.photos);

  if (!name || !phone || !email || !address || !serviceType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const urgencyText = urgencyLabel(urgency);
  const photosHtml = photos.length
    ? `
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p><strong>Photos from the customer:</strong></p>
      ${photos
        .map(
          (uri, i) =>
            `<img src="${uri}" alt="Photo ${i + 1}" style="display:block; max-width:100%; border-radius:8px; margin:0 0 10px 0; border:1px solid #e4dccc;" />`
        )
        .join("")}
    `
    : "";

  // --- SMS to maintenance vendor ---
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
      ${photosHtml}
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

  console.log(`[Maintenance] Customer phone raw: "${phone}" | vendor phone: "${JOHN_PHONE}" | smsConsent: ${smsConsent}`);

  // Vendor / internal-ops SMS (maintenance vendor + admin) always fires — internal B2B, not consumer.
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
