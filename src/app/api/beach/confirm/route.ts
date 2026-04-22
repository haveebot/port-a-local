import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { emailLayout } from "@/lib/emailLayout";
import { sendConsumerSms } from "@/lib/twilioSms";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";

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

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const PRODUCT_LABELS: Record<string, string> = {
  cabana: "Cabana Setup",
  chairs: "Chair & Umbrella Setup",
};

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
    const { name, phone, email, product, quantity, pickupDate, returnDate, deliveryAddress, numDays, totalPrice, smsConsent } = m;

    const startFormatted = formatDate(pickupDate);
    const endFormatted = formatDate(returnDate);
    const productLabel = PRODUCT_LABELS[product] || product;
    const qty = parseInt(quantity);
    const days = parseInt(numDays);
    const total = parseInt(totalPrice);

    const internalHtml = emailLayout({
      tone: "alert",
      preheader: `Beach rental PAID — ${name} — $${total}`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">✅ Beach Rental — PAID</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Payment received via Stripe. Deliver on schedule.</p>
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Phone:</strong> <a href="tel:${phone}" style="color:#e8656f;">${phone}</a></p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#e8656f;">${email}</a></p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p><strong>Setup:</strong> ${productLabel}</p>
        <p><strong>Quantity:</strong> ${qty}</p>
        <p><strong>Start:</strong> ${startFormatted}</p>
        <p><strong>End:</strong> ${endFormatted}</p>
        <p><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
        <p><strong>Beach location:</strong> ${deliveryAddress}</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:16px;"><strong>Total collected:</strong> $${total}</p>
        <p style="font-size:11px; color:#8896ab; font-family:monospace; margin-top:12px;">Stripe session: ${session.id}</p>
      `,
    });

    const customerHtml = emailLayout({
      preheader: "Your beach setup is booked — we'll have it ready on the sand.",
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Your beach setup is booked</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Payment received. Our local team will have everything ready for you on the sand.</p>
        <p>Hi ${name},</p>
        <p><strong>Your booking:</strong></p>
        <ul>
          <li><strong>Setup:</strong> ${productLabel}</li>
          <li><strong>Quantity:</strong> ${qty}</li>
          <li><strong>Start:</strong> ${startFormatted}</li>
          <li><strong>End:</strong> ${endFormatted}</li>
          <li><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</li>
          <li><strong>Beach location:</strong> ${deliveryAddress}</li>
          <li><strong>Total paid:</strong> $${total}</li>
        </ul>
        <p>Questions? Reply to this email.</p>
        <p style="margin-top:20px;">— The Port A Local</p>
      `,
    });

    console.log(`[Beach/Confirm] Payment confirmed — ${name} | ${productLabel} x${qty} | ${pickupDate} → ${returnDate} | $${total}`);

    const customerSMS = `Port A Local: Your ${productLabel} (${days} day${days !== 1 ? "s" : ""}) is booked for ${startFormatted}. Delivered to: ${deliveryAddress}. Reply STOP to opt out.`;

    await Promise.allSettled([
      sendEmail(INTERNAL_EMAIL, `✅ Beach Rental PAID — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
      sendEmail(email, "Your Beach Setup is Booked — Port A Local", customerHtml),
      sendConsumerSms(phone, customerSMS, smsConsent),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Beach/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
