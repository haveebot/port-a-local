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
  const body = await req.json();
  const {
    name,
    phone,
    email,
    product,
    quantity,
    pickupDate,
    returnDate,
    deliveryAddress,
    numDays,
    totalPrice,
    qty,
  } = body;

  if (!name || !phone || !email || !product || !pickupDate || !returnDate || !deliveryAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const startFormatted = formatDate(pickupDate);
  const endFormatted = formatDate(returnDate);
  const productLabel = PRODUCT_LABELS[product] || product;

  // --- Internal alert ---
  const internalHtml = `
    <h2>New Beach Rental Request — Port A Local</h2>
    <hr/>
    <p><strong>Customer:</strong> ${name}</p>
    <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <hr/>
    <p><strong>Setup:</strong> ${productLabel}</p>
    <p><strong>Quantity:</strong> ${qty || quantity}</p>
    <p><strong>Start:</strong> ${startFormatted}</p>
    <p><strong>End:</strong> ${endFormatted}</p>
    <p><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</p>
    <p><strong>Beach Location:</strong> ${deliveryAddress}</p>
    <hr/>
    <p><strong>Total (to collect):</strong> $${totalPrice}</p>
    <p style="color:#888;font-size:12px;">Submitted via Port A Local — theportalocal.com/beach</p>
  `;

  // --- Customer confirmation ---
  const customerHtml = `
    <h2>Your Beach Rental Request — Port A Local</h2>
    <p>Hi ${name},</p>
    <p>We received your request and our local team is reviewing availability. We'll follow up shortly to confirm your booking and collect payment before your first day.</p>
    <p><strong>Your request summary:</strong></p>
    <ul>
      <li><strong>Setup:</strong> ${productLabel}</li>
      <li><strong>Quantity:</strong> ${qty || quantity}</li>
      <li><strong>Start:</strong> ${startFormatted}</li>
      <li><strong>End:</strong> ${endFormatted}</li>
      <li><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</li>
      <li><strong>Beach Location:</strong> ${deliveryAddress}</li>
      <li><strong>Total:</strong> $${totalPrice}</li>
    </ul>
    <p>Questions? Reply to this email and we'll sort it out.</p>
    <br/>
    <p>— Port A Local Team</p>
    <p style="color:#888;font-size:12px;">theportalocal.com</p>
  `;

  console.log(`[Beach] New request — ${name} | ${productLabel} x${qty || quantity} | ${pickupDate} → ${returnDate} | $${totalPrice}`);

  await Promise.allSettled([
    sendEmail(INTERNAL_EMAIL, `Beach Rental Request — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
    sendEmail(email, "Your Beach Rental Request — Port A Local", customerHtml),
  ]);

  return NextResponse.json({ success: true });
}
