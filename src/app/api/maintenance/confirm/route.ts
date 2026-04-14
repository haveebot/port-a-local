import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const JOHN_PHONE = process.env.JOHN_BROWN_PHONE || "(361) 455-8606";
const JOHN_EMAIL = process.env.JOHN_BROWN_EMAIL || "";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || "";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

async function sendSMS(to: string, body: string) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log("[SMS] Twilio not configured — would send to", to, ":", body);
    return;
  }
  const toClean = to.replace(/\D/g, "").replace(/^1/, "");
  const toFormatted = `+1${toClean}`;
  if (toClean.length !== 10) {
    console.error(`[SMS] Invalid phone number: ${to}`);
    return;
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: TWILIO_FROM, To: toFormatted, Body: body }),
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

    // --- Priority email to John ---
    const vendorHtml = `
      <h2 style="color:#e55a2b;">🚨 PRIORITY DISPATCH — $${dispatchFee} PAID</h2>
      <p style="font-size:16px;font-weight:bold;">Respond within 2-4 hours (7AM–8PM window)</p>
      <hr/>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Preferred Contact:</strong> ${contactPref}</p>
      <hr/>
      <p><strong>Property Address:</strong> ${address}</p>
      <p><strong>Service Type:</strong> ${serviceType}</p>
      <p><strong>Urgency:</strong> ${urgency}</p>
      <p><strong>Description:</strong></p>
      <p style="background:#fff3f0;padding:12px;border-radius:8px;border-left:4px solid #e55a2b;">${description}</p>
      <hr/>
      <p><strong>Dispatch Fee Collected:</strong> $${dispatchFee}</p>
      <p><strong>Stripe Session:</strong> ${session.id}</p>
      <p style="color:#888;font-size:12px;">Submitted via Port A Local</p>
    `;

    // --- Customer confirmation ---
    const customerHtml = `
      <h2>Priority Dispatch Confirmed — Port A Local</h2>
      <p>Hi ${name},</p>
      <p>Your $${dispatchFee} priority dispatch fee has been received. Our local service team has been notified and will be in touch within <strong>2-4 hours</strong> (7AM–8PM).</p>
      <p><strong>Your request:</strong></p>
      <ul>
        <li><strong>Service:</strong> ${serviceType}</li>
        <li><strong>Property:</strong> ${address}</li>
        <li><strong>Priority Dispatch Fee:</strong> $${dispatchFee}</li>
      </ul>
      <p>Questions? Reply to this email or call us directly.</p>
      <br/>
      <p>— Port A Local Team</p>
    `;

    const customerSMS = `Port A Local: Priority dispatch confirmed! $${dispatchFee} received. Our team will contact you within 2-4 hours about your ${serviceType} request at ${address}.`;

    console.log(`[Maintenance/Priority] Paid dispatch confirmed — ${name} (${phone}) — ${serviceType}`);

    await Promise.allSettled([
      sendSMS(JOHN_PHONE, smsPriority),
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
