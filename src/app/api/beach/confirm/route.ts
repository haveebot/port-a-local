import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "haveebot@gmail.com";

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
      from: "Port A Local <onboarding@resend.dev>",
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
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const m = session.metadata || {};
    const { name, phone, email, product, quantity, pickupDate, returnDate, deliveryAddress, numDays, totalPrice } = m;

    const startFormatted = formatDate(pickupDate);
    const endFormatted = formatDate(returnDate);
    const productLabel = PRODUCT_LABELS[product] || product;
    const qty = parseInt(quantity);
    const days = parseInt(numDays);
    const total = parseInt(totalPrice);

    const internalHtml = `
      <h2>✅ Beach Rental PAID — Port A Local</h2>
      <hr/>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr/>
      <p><strong>Setup:</strong> ${productLabel}</p>
      <p><strong>Quantity:</strong> ${qty}</p>
      <p><strong>Start:</strong> ${startFormatted}</p>
      <p><strong>End:</strong> ${endFormatted}</p>
      <p><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
      <p><strong>Beach Location:</strong> ${deliveryAddress}</p>
      <hr/>
      <p><strong>Total Collected:</strong> $${total}</p>
      <p><strong>Stripe Session:</strong> ${session.id}</p>
      <p style="color:#888;font-size:12px;">Submitted via Port A Local</p>
    `;

    const customerHtml = `
      <h2>Your Beach Setup is Booked — Port A Local</h2>
      <p>Hi ${name},</p>
      <p>Payment received! Your beach setup is confirmed. Our local team will have everything ready for you on the sand.</p>
      <p><strong>Your booking:</strong></p>
      <ul>
        <li><strong>Setup:</strong> ${productLabel}</li>
        <li><strong>Quantity:</strong> ${qty}</li>
        <li><strong>Start:</strong> ${startFormatted}</li>
        <li><strong>End:</strong> ${endFormatted}</li>
        <li><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</li>
        <li><strong>Beach Location:</strong> ${deliveryAddress}</li>
        <li><strong>Total Paid:</strong> $${total}</li>
      </ul>
      <p>Questions? Reply to this email and we'll sort it out.</p>
      <br/>
      <p>— Port A Local Team</p>
    `;

    console.log(`[Beach/Confirm] Payment confirmed — ${name} | ${productLabel} x${qty} | ${pickupDate} → ${returnDate} | $${total}`);

    await Promise.allSettled([
      sendEmail(INTERNAL_EMAIL, `✅ Beach Rental PAID — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
      sendEmail(email, "Your Beach Setup is Booked — Port A Local", customerHtml),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Beach/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
