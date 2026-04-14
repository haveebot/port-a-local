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
  const internalHtml = emailLayout({
    tone: "alert",
    preheader: `Beach rental request from ${name} — ${productLabel}`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">New Beach Rental Request</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Review and follow up to collect payment.</p>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}" style="color:#e8656f;">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#e8656f;">${email}</a></p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p><strong>Setup:</strong> ${productLabel}</p>
      <p><strong>Quantity:</strong> ${qty || quantity}</p>
      <p><strong>Start:</strong> ${startFormatted}</p>
      <p><strong>End:</strong> ${endFormatted}</p>
      <p><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</p>
      <p><strong>Beach Location:</strong> ${deliveryAddress}</p>
      <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
      <p style="font-size:16px;"><strong>Total to collect:</strong> $${totalPrice}</p>
    `,
  });

  // --- Customer confirmation ---
  const customerHtml = emailLayout({
    preheader: "Your Port A Local beach setup request is in.",
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Your beach setup request is in</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Our local team is reviewing availability. We will follow up shortly to confirm your booking and collect payment before your first day.</p>
      <p>Hi ${name},</p>
      <p><strong>Your request:</strong></p>
      <ul>
        <li><strong>Setup:</strong> ${productLabel}</li>
        <li><strong>Quantity:</strong> ${qty || quantity}</li>
        <li><strong>Start:</strong> ${startFormatted}</li>
        <li><strong>End:</strong> ${endFormatted}</li>
        <li><strong>Duration:</strong> ${numDays} day${numDays !== 1 ? "s" : ""}</li>
        <li><strong>Beach location:</strong> ${deliveryAddress}</li>
        <li><strong>Total:</strong> $${totalPrice}</li>
      </ul>
      <p>Questions? Reply to this email.</p>
      <p style="margin-top:20px;">— the Port A Local team</p>
    `,
  });

  console.log(`[Beach] New request — ${name} | ${productLabel} x${qty || quantity} | ${pickupDate} → ${returnDate} | $${totalPrice}`);

  await Promise.allSettled([
    sendEmail(INTERNAL_EMAIL, `Beach Rental Request — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
    sendEmail(email, "Your Beach Rental Request — Port A Local", customerHtml),
  ]);

  return NextResponse.json({ success: true });
}
