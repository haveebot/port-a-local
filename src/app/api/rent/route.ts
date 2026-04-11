import { NextRequest, NextResponse } from "next/server";

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
  const body = await req.json();
  const {
    name,
    phone,
    email,
    cartSize,
    pickupDate,
    returnDate,
    delivery,
    deliveryAddress,
    numDays,
    reservationFee,
  } = body;

  if (!name || !phone || !email || !cartSize || !pickupDate || !returnDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pickupFormatted = formatDate(pickupDate);
  const returnFormatted = formatDate(returnDate);
  const cartLabel = `${cartSize}-Passenger Golf Cart`;
  const deliveryLabel =
    delivery === "delivery"
      ? `Delivery to: ${deliveryAddress}`
      : "Self-Pickup";

  // --- Internal alert ---
  const internalHtml = `
    <h2>New Golf Cart Reservation Request — Port A Local</h2>
    <hr/>
    <p><strong>Customer:</strong> ${name}</p>
    <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <hr/>
    <p><strong>Cart:</strong> ${cartLabel}</p>
    <p><strong>Pickup:</strong> ${pickupFormatted}</p>
    <p><strong>Return:</strong> ${returnFormatted}</p>
    <p><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</p>
    <p><strong>Pickup/Delivery:</strong> ${deliveryLabel}</p>
    <hr/>
    <p><strong>Reservation Fee (to collect):</strong> $${reservationFee}</p>
    <p style="color:#888;font-size:12px;">Submitted via Port A Local — port-a-local.vercel.app/rent</p>
  `;

  // --- Customer confirmation ---
  const customerHtml = `
    <h2>Your Golf Cart Reservation Request — Port A Local</h2>
    <p>Hi ${name},</p>
    <p>We received your request and our local team is reviewing availability. We&apos;ll follow up within a few hours to confirm your cart and collect the reservation fee.</p>
    <p><strong>Your request summary:</strong></p>
    <ul>
      <li><strong>Cart:</strong> ${cartLabel}</li>
      <li><strong>Pickup:</strong> ${pickupFormatted}</li>
      <li><strong>Return:</strong> ${returnFormatted}</li>
      <li><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</li>
      <li><strong>Pickup/Delivery:</strong> ${deliveryLabel}</li>
    </ul>
    <p>Questions? Reply to this email or call us and we&apos;ll sort it out.</p>
    <br/>
    <p>— Port A Local Team</p>
    <p style="color:#888;font-size:12px;">port-a-local.vercel.app</p>
  `;

  console.log(`[Rent] New request — ${name} | ${cartLabel} | ${pickupDate} → ${returnDate} | ${delivery}`);

  await Promise.allSettled([
    sendEmail(INTERNAL_EMAIL, `Golf Cart Request — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
    sendEmail(email, "Your Golf Cart Reservation Request — Port A Local", customerHtml),
  ]);

  return NextResponse.json({ success: true });
}
