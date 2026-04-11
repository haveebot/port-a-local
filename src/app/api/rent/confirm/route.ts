import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
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
    const { name, phone, email, cartSize, pickupDate, returnDate, delivery, deliveryAddress, numDays, reservationFee } = m;

    const pickupFormatted = formatDate(pickupDate);
    const returnFormatted = formatDate(returnDate);
    const cartLabel = `${cartSize}-Passenger Golf Cart`;
    const deliveryLabel = delivery === "delivery" ? `Delivery to: ${deliveryAddress}` : "Self-Pickup";
    const days = parseInt(numDays);
    const fee = parseInt(reservationFee);

    const internalHtml = `
      <h2>✅ Golf Cart Reservation PAID — Port A Local</h2>
      <hr/>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr/>
      <p><strong>Cart:</strong> ${cartLabel}</p>
      <p><strong>Pickup:</strong> ${pickupFormatted}</p>
      <p><strong>Return:</strong> ${returnFormatted}</p>
      <p><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
      <p><strong>Pickup/Delivery:</strong> ${deliveryLabel}</p>
      <hr/>
      <p><strong>Reservation Fee Collected:</strong> $${fee}</p>
      <p><strong>Stripe Session:</strong> ${session.id}</p>
      <p style="color:#888;font-size:12px;">Submitted via Port A Local</p>
    `;

    const customerHtml = `
      <h2>Your Golf Cart is Reserved — Port A Local</h2>
      <p>Hi ${name},</p>
      <p>Payment received! Your golf cart reservation is confirmed. Our local team will be in touch with pickup details.</p>
      <p><strong>Your reservation:</strong></p>
      <ul>
        <li><strong>Cart:</strong> ${cartLabel}</li>
        <li><strong>Pickup:</strong> ${pickupFormatted}</li>
        <li><strong>Return:</strong> ${returnFormatted}</li>
        <li><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</li>
        <li><strong>Pickup/Delivery:</strong> ${deliveryLabel}</li>
        <li><strong>Reservation Fee Paid:</strong> $${fee}</li>
      </ul>
      <p>Questions? Reply to this email and we'll sort it out.</p>
      <br/>
      <p>— Port A Local Team</p>
    `;

    console.log(`[Rent/Confirm] Payment confirmed — ${name} | ${cartLabel} | ${pickupDate} → ${returnDate}`);

    await Promise.allSettled([
      sendEmail(INTERNAL_EMAIL, `✅ Golf Cart PAID — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
      sendEmail(email, "Your Golf Cart is Reserved — Port A Local", customerHtml),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Rent/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
