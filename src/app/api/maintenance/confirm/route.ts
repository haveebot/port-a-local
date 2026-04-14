import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { emailLayout } from "@/lib/emailLayout";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const JOHN_PHONE = process.env.JOHN_BROWN_PHONE || "(361) 455-8606";
const JOHN_EMAIL = process.env.JOHN_BROWN_EMAIL || "";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || "";
const TWILIO_MESSAGING_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

async function sendSMS(to: string, body: string) {
  if (!TWILIO_SID || !TWILIO_TOKEN || (!TWILIO_MESSAGING_SID && !TWILIO_FROM)) {
    console.log("[SMS] Twilio not configured — would send to", to, ":", body);
    return;
  }
  const toClean = to.replace(/\D/g, "").replace(/^1/, "");
  const toFormatted = `+1${toClean}`;
  if (toClean.length !== 10) {
    console.error(`[SMS] Invalid phone number: ${to}`);
    return;
  }
  const params: Record<string, string> = { To: toFormatted, Body: body };
  if (TWILIO_MESSAGING_SID) params.MessagingServiceSid = TWILIO_MESSAGING_SID;
  else params.From = TWILIO_FROM;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const result = await res.json();
  if (!res.ok) console.error("[SMS] Twilio error:", JSON.stringify(result));
  else console.log("[SMS] Sent. SID:", result.sid);
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
    const { name, phone, email, address, serviceType, description, urgency, contactPref, dispatchFee } = m;

    // --- Priority SMS to John — marked clearly as paid dispatch ---
    const smsPriority = `🚨 PRIORITY DISPATCH — PORT A LOCAL\n$${dispatchFee} paid. Respond within 2-4 hours.\n\nFrom: ${name}\nPhone: ${phone}\nAddress: ${address}\nService: ${serviceType}\n\n"${description?.slice(0, 100)}${(description?.length || 0) > 100 ? "..." : ""}"\n\nPreferred contact: ${contactPref}`;

    const vendorHtml = emailLayout({
      tone: "alert",
      preheader: `PRIORITY DISPATCH — $${dispatchFee} PAID — ${name}`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:20px; color:#e8656f;">🚨 Priority Dispatch — $${dispatchFee} PAID</h2>
        <p style="margin:0 0 16px 0; color:#0b1120; font-size:14px; font-weight:600;">Respond within 2–4 hours (7 AM–8 PM window)</p>
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
      preheader: `Priority dispatch confirmed — you'll hear back within 2–4 hours.`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Priority dispatch confirmed</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Our local service team has been notified. You will hear back within <strong>2–4 hours</strong> (7 AM–8 PM).</p>
        <p>Hi ${name},</p>
        <p>Your $${dispatchFee} priority dispatch fee has been received.</p>
        <p><strong>Your request:</strong></p>
        <ul>
          <li><strong>Service:</strong> ${serviceType}</li>
          <li><strong>Property:</strong> ${address}</li>
          <li><strong>Priority dispatch fee:</strong> $${dispatchFee}</li>
        </ul>
        <p>Questions? Reply to this email or give us a call.</p>
        <p style="margin-top:20px;">— the Port A Local team</p>
      `,
    });

    const customerSMS = `Port A Local: Priority dispatch confirmed! $${dispatchFee} received. Our team will contact you within 2-4 hours about your ${serviceType} request at ${address}.`;

    console.log(`[Maintenance/Priority] Paid dispatch confirmed — ${name} (${phone}) — ${serviceType}`);

    await Promise.allSettled([
      sendSMS(JOHN_PHONE, smsPriority),
      ADMIN_PHONE ? sendSMS(ADMIN_PHONE, smsPriority) : Promise.resolve(),
      sendSMS(phone, customerSMS),
      JOHN_EMAIL ? sendEmail(JOHN_EMAIL, `🚨 PRIORITY DISPATCH — ${name} — ${serviceType}`, vendorHtml) : Promise.resolve(),
      sendEmail(email, "Priority Dispatch Confirmed — Port A Local", customerHtml),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Maintenance/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
