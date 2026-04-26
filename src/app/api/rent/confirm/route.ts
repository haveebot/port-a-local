import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { emailLayout } from "@/lib/emailLayout";
import { getBlastableVendors, getBlastCount } from "@/data/cart-vendors";
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
    const { name, phone, email, cartSize, pickupDate, returnDate, numDays, reservationFee, smsConsent } = m;

    const pickupFormatted = formatDate(pickupDate);
    const returnFormatted = formatDate(returnDate);
    const cartLabel = `${cartSize}-Passenger Golf Cart`;
    const days = parseInt(numDays);
    const fee = parseInt(reservationFee);

    const internalHtml = emailLayout({
      tone: "alert",
      preheader: `Golf cart PAID — ${name} — $${fee}`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">✅ Golf Cart Reservation — PAID</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Reservation fee collected. Prep the cart.</p>
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Phone:</strong> <a href="tel:${phone}" style="color:#e8656f;">${phone}</a></p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#e8656f;">${email}</a></p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p><strong>Cart:</strong> ${cartLabel}</p>
        <p><strong>Pickup:</strong> ${pickupFormatted}</p>
        <p><strong>Return:</strong> ${returnFormatted}</p>
        <p><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
        <p><strong>Handoff:</strong> Pickup or delivery — vendor's call</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:16px;"><strong>Fee collected:</strong> $${fee}</p>
        <p style="font-size:11px; color:#8896ab; font-family:monospace; margin-top:12px;">Stripe session: ${session.id}</p>
      `,
    });

    const customerHtml = emailLayout({
      preheader: "Your golf cart reservation is confirmed.",
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Your cart is reserved</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Payment received. We&apos;re matching your reservation with a vetted local cart company now. You&apos;ll receive <strong>cart logistics 24–48 hours before your arrival date</strong> — pickup or delivery, vendor&apos;s call.</p>
        <p>Hi ${name},</p>
        <p><strong>Your reservation:</strong></p>
        <ul>
          <li><strong>Cart:</strong> ${cartLabel}</li>
          <li><strong>Pickup date:</strong> ${pickupFormatted}</li>
          <li><strong>Return date:</strong> ${returnFormatted}</li>
          <li><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</li>
          <li><strong>Reservation fee paid:</strong> $${fee}</li>
          <li><strong>Pickup location:</strong> Sent 24–48 hours before arrival</li>
        </ul>
        <p><strong>What to bring:</strong> Valid photo ID (must be 18+).</p>
        <p><strong>Your savings:</strong> Every PAL reservation includes a guaranteed <strong>$20 discount</strong> off the rental company's standard rate.</p>
        <p><strong>Our guarantee:</strong> If we're unable to source a cart for your dates, your reservation fee is fully refunded.</p>
        <p>Questions? Reply to this email.</p>
        <p style="margin-top:20px;">— The Port A Local</p>
      `,
    });

    console.log(`[Rent/Confirm] Payment confirmed — ${name} | ${cartLabel} | ${pickupDate} → ${returnDate}`);

    // --- Vendor lead blast ---
    const vendors = getBlastableVendors();
    const totalVendorCount = getBlastCount();

    const vendorLeadHtml = emailLayout({
      tone: "alert",
      preheader: `New cart rental lead — ${cartLabel} — ${pickupDate} to ${returnDate}`,
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">🛺 New Cart Rental Lead</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">A customer just reserved a golf cart through Port A Local. Reply to this email to claim this rental. <strong>First response wins.</strong></p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p><strong>Cart:</strong> ${cartLabel}</p>
        <p><strong>Pickup:</strong> ${pickupFormatted}</p>
        <p><strong>Return:</strong> ${returnFormatted}</p>
        <p><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:13px; color:#4a5568;"><strong>By responding to claim this lead, you agree to:</strong></p>
        <ul style="font-size:13px; color:#4a5568; padding-left:20px;">
          <li>Have a clean, well-maintained ${cartSize}-passenger cart ready for the customer on <strong>${pickupFormatted}</strong> — <strong>pickup at your shop OR delivery to their address, your call</strong> (whichever you offer)</li>
          <li>Provide the customer a <strong>minimum $20 discount</strong> off your standard rental rate</li>
          <li>Adhere to your standard rental practices — including rental agreements, ID verification, deposit handling, customer service, and emergency maintenance support for the duration of the rental</li>
        </ul>
        <p style="font-size:13px; color:#4a5568;">Customer contact info is shared after you claim.</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:12px; color:#8896ab; font-style:italic;">This lead was sent to ${totalVendorCount} Port Aransas cart companies. First to respond wins.</p>
      `,
    });

    const vendorBlastPromises = vendors.map((v) =>
      sendEmail(
        v.email,
        `🛺 New Cart Rental — ${cartLabel} — ${pickupDate} to ${returnDate} — Claim It`,
        vendorLeadHtml
      )
    );

    console.log(`[Rent/Blast] Sending lead to ${vendors.length} vendors (${totalVendorCount} total on list)`);

    const customerSMS = `Port A Local: Your ${cartLabel} is reserved for ${pickupFormatted}. Cart logistics (pickup or delivery, vendor's call) arrive 24-48 hours before your trip. Reply STOP to opt out.`;

    await Promise.allSettled([
      sendEmail(INTERNAL_EMAIL, `✅ Golf Cart PAID — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
      sendEmail(email, "Your Golf Cart is Reserved — Port A Local", customerHtml),
      sendConsumerSms(phone, customerSMS, smsConsent),
      ...vendorBlastPromises,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Rent/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
