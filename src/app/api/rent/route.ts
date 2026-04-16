import { NextRequest, NextResponse } from "next/server";
import { emailLayout } from "@/lib/emailLayout";

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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    phone,
    email,
    cartSize,
    pickupDate,
    returnDate,
    numDays,
    reservationFee,
  } = body;

  if (!name || !phone || !email || !cartSize || !pickupDate || !returnDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pickupFormatted = formatDate(pickupDate);
  const returnFormatted = formatDate(returnDate);
  const cartLabel = `${cartSize}-Passenger Golf Cart`;

  const internalHtml = emailLayout({
    tone: "alert",
    preheader: `Golf cart reservation request from ${name}`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">New Golf Cart Reservation</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Review and follow up to collect the reservation fee.</p>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}" style="color:#e8656f;">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#e8656f;">${email}</a></p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p><strong>Cart:</strong> ${cartLabel}</p>
      <p><strong>Pickup:</strong> ${pickupFormatted}</p>
      <p><strong>Return:</strong> ${returnFormatted}</p>
      <p><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</p>
      <p><strong>Pickup:</strong> In Port Aransas (location TBD — sourcing vendor)</p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p style="font-size:16px;"><strong>Reservation fee to collect:</strong> $${reservationFee}</p>
    `,
  });

  const customerHtml = emailLayout({
    preheader: "Your golf cart reservation request is in.",
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Your cart reservation is confirmed</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">We&apos;re matching your reservation with a vetted local cart company now. You&apos;ll receive <strong>pickup details 24–48 hours before your arrival date</strong> — including location, hours, and what to bring.</p>
      <p>Hi ${name},</p>
      <p><strong>Your reservation:</strong></p>
      <ul>
        <li><strong>Cart:</strong> ${cartLabel}</li>
        <li><strong>Pickup:</strong> ${pickupFormatted}</li>
        <li><strong>Return:</strong> ${returnFormatted}</li>
        <li><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</li>
      </ul>
      <p><strong>What to bring:</strong> Valid photo ID (must be 18+).</p>
      <p><strong>Our guarantee:</strong> If we&apos;re unable to source a cart for your dates, your reservation fee is fully refunded — no questions asked.</p>
      <p>Questions? Reply to this email.</p>
      <p style="margin-top:20px;">— the Port A Local team</p>
    `,
  });

  console.log(`[Rent] New request — ${name} | ${cartLabel} | ${pickupDate} → ${returnDate}`);

  await Promise.allSettled([
    sendEmail(INTERNAL_EMAIL, `Golf Cart Request — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
    sendEmail(email, "Your Golf Cart Reservation Request — Port A Local", customerHtml),
  ]);

  return NextResponse.json({ success: true });
}
