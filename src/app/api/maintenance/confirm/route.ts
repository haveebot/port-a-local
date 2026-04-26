import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { emailLayout } from "@/lib/emailLayout";
import { sendSms, sendConsumerSms } from "@/lib/twilioSms";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const JOHN_PHONE = process.env.JOHN_BROWN_PHONE || "(361) 455-8606";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

// Maintenance vendor is SMS-only by design — doesn't take email.
// All maintenance internal emails go to INTERNAL_ALERT_EMAIL for records.

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
  if (!res.ok) console.error("[Email] Resend error:", await res.text());
}

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const m = session.metadata || {};
    const { name, phone, email, address, serviceType, description, urgency, contactPref, dispatchFee, smsConsent } = m;

    // --- Priority SMS to maintenance vendor — marked clearly as paid dispatch ---
    const smsPriority = `🚨 PRIORITY DISPATCH — PORT A LOCAL\n$${dispatchFee} paid. Respond within 4 hours.\n\nFrom: ${name}\nPhone: ${phone}\nAddress: ${address}\nService: ${serviceType}\n\n"${description?.slice(0, 100)}${(description?.length || 0) > 100 ? "..." : ""}"\n\nPreferred contact: ${contactPref}`;

    const vendorHtml = emailLayout({
      tone: "alert",
      preheader: `PRIORITY DISPATCH — $${dispatchFee} PAID — ${name}`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:20px; color:#e8656f;">🚨 Priority Dispatch — $${dispatchFee} PAID</h2>
        <p style="margin:0 0 16px 0; color:#0b1120; font-size:14px; font-weight:600;">Respond within 4 hours (7 AM–8 PM window)</p>
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Phone:</strong> <a href="tel:${phone}" style="color:#e8656f;">${phone}</a></p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#e8656f;">${email}</a></p>
        <p><strong>Preferred contact:</strong> ${contactPref}</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p><strong>Property:</strong> ${address}</p>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Urgency:</strong> ${urgency}</p>
        <p><strong>Description:</strong></p>
        <p style="background:#fdecee; padding:12px; border-radius:8px; border-left:4px solid #e8656f;">${description}</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:16px;"><strong>Dispatch fee collected:</strong> $${dispatchFee}</p>
        <p style="font-size:11px; color:#8896ab; font-family:monospace; margin-top:12px;">Stripe session: ${session.id}</p>
      `,
    });

    const customerHtml = emailLayout({
      preheader: `Priority dispatch confirmed — you'll hear back within 4 hours.`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Priority dispatch confirmed</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Our local service team has been notified. You will hear back within <strong>4 hours</strong> (7 AM–8 PM).</p>
        <p>Hi ${name},</p>
        <p>Your $${dispatchFee} priority dispatch fee has been received.</p>
        <p><strong>Your request:</strong></p>
        <ul>
          <li><strong>Service:</strong> ${serviceType}</li>
          <li><strong>Property:</strong> ${address}</li>
          <li><strong>Priority dispatch fee:</strong> $${dispatchFee}</li>
        </ul>
        <p>Questions? Reply to this email or give us a call.</p>
        <p style="margin-top:20px;">— The Port A Local</p>
      `,
    });

    const customerSMS = `Port A Local: Priority dispatch confirmed! $${dispatchFee} received. Our team will contact you within 4 hours about your ${serviceType} request at ${address}. Reply STOP to opt out.`;

    console.log(`[Maintenance/Priority] Paid dispatch confirmed — ${name} (${phone}) — ${serviceType} | smsConsent: ${smsConsent}`);

    await Promise.allSettled([
      sendSms(JOHN_PHONE, smsPriority),
      ADMIN_PHONE ? sendSms(ADMIN_PHONE, smsPriority) : Promise.resolve(),
      sendConsumerSms(phone, customerSMS, smsConsent),
      INTERNAL_EMAIL ? sendEmail(INTERNAL_EMAIL, `🚨 PRIORITY DISPATCH — ${name} — ${serviceType}`, vendorHtml) : Promise.resolve(),
      sendEmail(email, "Priority Dispatch Confirmed — Port A Local", customerHtml),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Maintenance/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
