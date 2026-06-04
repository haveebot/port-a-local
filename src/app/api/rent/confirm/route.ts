import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { emailLayout } from "@/lib/emailLayout";
import {
  getBlastableVendors,
  getBlastCount,
  getFirstLookVendorsForSize,
  emailsFor,
} from "@/data/cart-vendors";
import { sendConsumerSms } from "@/lib/twilioSms";
import {
  sendOpenBlastSms,
  sendFirstLookSms,
  compactCartLabel,
} from "@/lib/cartVendorSmsBlast";
import { startFirstLookWindow } from "@/data/cart-rental-first-look-store";
import { sendPurchaseEvent } from "@/lib/metaConversions";
import { pingSuperAdmins, formatCustomerDisplay } from "@/lib/superAdminPing";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
const INTERNAL_RECIPIENTS = [INTERNAL_EMAIL, "bookings@theportalocal.com"]
  .map((r) => r.trim())
  .filter(Boolean);

async function sendEmail(to: string | string[], subject: string, html: string) {
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

    // Ad attribution captured at checkout (pal_attrib + _fbc/_fbp/ip →
    // Stripe metadata). Used here to fire the deduped Conversions API
    // Purchase. Best-effort parse.
    let attribution: Record<string, string | undefined> = {};
    try {
      if (m.attribution) attribution = JSON.parse(m.attribution);
    } catch {
      /* ignore malformed attribution blob */
    }
    // Customer's pickup/delivery choice — vendor is required to honor it.
    // Default to "delivery" for any pre-existing sessions without the field.
    const handoff: "delivery" | "pickup" =
      m.handoff === "pickup" ? "pickup" : "delivery";
    const handoffLabel =
      handoff === "pickup" ? "Pickup at vendor's shop" : "Delivery to customer";

    const pickupFormatted = formatDate(pickupDate);
    const returnFormatted = formatDate(returnDate);
    const cartLabel = `${cartSize}-Passenger Golf Cart`;
    const days = parseInt(numDays);
    const fee = parseInt(reservationFee);

    // Compact pickup/return labels for SMS — drops year + comma noise.
    const pickupShort = formatDate(pickupDate).replace(/, \d{4}$/, "").replace(/^([A-Za-z]+), /, "$1 ");
    const returnShort = formatDate(returnDate).replace(/, \d{4}$/, "").replace(/^([A-Za-z]+), /, "$1 ");

    // -------- Determine first-look vendors for this lead --------
    //
    // Any vendor with `firstLookMinutes > 0` AND cartSizes including the
    // requested size gets a parallel head-start window. The rest of the
    // directory waits for the longest first-look window to expire (or
    // for an ACCEPT/PASS reply) before they're blasted.
    //
    // For v1: Bron's Beach Carts is the only first-look-flagged vendor.
    // The pattern is generalized — any future preferred vendor just sets
    // the field and gets the same orchestration with no code change.
    const firstLookVendors = getFirstLookVendorsForSize(cartSize);
    const firstLookSlugs = firstLookVendors.map((v) => v.slug);
    const hasFirstLook = firstLookVendors.length > 0;

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
        <p><strong>Handoff:</strong> ${handoffLabel} <span style="color:#8896ab; font-size:12px;">(customer's choice — vendor must honor)</span></p>
        ${
          hasFirstLook
            ? `<p style="margin-top:12px; padding:10px; background:#fff7ed; border-left:3px solid #f59e0b; font-size:12px;">
              ⏱ <strong>First-look window active</strong> — ${firstLookVendors
                .map((v) => `${v.name} (${v.firstLookMinutes} min)`)
                .join(", ")}. Open-blast fires at expiry or on PASS.
            </p>`
            : ""
        }
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:16px;"><strong>Fee collected:</strong> $${fee}</p>
        <p style="font-size:11px; color:#8896ab; font-family:monospace; margin-top:12px;">Stripe session: ${session.id}</p>
      `,
    });

    const customerHtml = emailLayout({
      preheader: "Your golf cart reservation is confirmed.",
      bodyHtml: `
        <h2 style="margin:0 0 8px 0; font-size:22px; color:#0b1120;">Your cart is reserved</h2>
        <p style="margin:0 0 16px 0; color:#4a5568; font-size:14px;">Payment received. We&apos;re matching your reservation with a vetted local cart company now. You&apos;ll receive <strong>cart logistics 24–48 hours before your arrival date</strong> based on the handoff you chose at booking.</p>
        <p>Hi ${name},</p>
        <p><strong>Your reservation:</strong></p>
        <ul>
          <li><strong>Cart:</strong> ${cartLabel}</li>
          <li><strong>Pickup date:</strong> ${pickupFormatted}</li>
          <li><strong>Return date:</strong> ${returnFormatted}</li>
          <li><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</li>
          <li><strong>Handoff:</strong> ${handoff === "pickup" ? "Pickup at the vendor's shop" : "Delivery to your address"}</li>
          <li><strong>Reservation fee paid:</strong> $${fee}</li>
          <li><strong>${handoff === "pickup" ? "Pickup location" : "Delivery details"}:</strong> Sent 24–48 hours before arrival</li>
        </ul>
        <p><strong>What to bring:</strong> Valid photo ID (must be 18+).</p>
        <p><strong>Your savings:</strong> Every PAL reservation includes a guaranteed <strong>$20/day discount</strong> off the rental company's standard rate.</p>
        <p><strong>Our guarantee:</strong> If we're unable to source a cart for your dates, your reservation fee is fully refunded.</p>
        <p>Questions? Reply to this email.</p>
        <p style="margin-top:20px;">— The Port A Local</p>
      `,
    });

    console.log(`[Rent/Confirm] Payment confirmed — ${name} | ${cartLabel} | ${pickupDate} → ${returnDate}`);

    // -------- Vendor lead blast --------
    //
    // Email channel: ALWAYS simultaneous to all vendors with at least one
    // email, including first-look vendors. Email doesn't have the same
    // urgency-on-lock-screen dynamic as SMS, and a wider net at T+0 means
    // the lead has every realistic chance to land. First-look bias is
    // expressed via the SMS channel alone.
    //
    // SMS channel: branches on first-look. If first-look vendors exist
    // for this cart size, they get the priority SMS at T+0; everyone
    // else waits until window expiry (or PASS) for the open blast.
    const allEmailVendors = getBlastableVendors();
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
        <p><strong>Customer's handoff choice:</strong> ${handoff === "pickup" ? "Pickup at your shop" : "Delivery to customer's address"} <span style="color:#8896ab; font-size:12px;">(required — customer chose this at booking)</span></p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:13px; color:#4a5568;"><strong>By responding to claim this lead, you agree to:</strong></p>
        <ul style="font-size:13px; color:#4a5568; padding-left:20px;">
          <li>Have a clean, well-maintained ${cartSize}-passenger cart ready for the customer on <strong>${pickupFormatted}</strong> via <strong>${handoff === "pickup" ? "pickup at your shop" : "delivery to their address"}</strong> (the customer's choice — you are required to honor it)</li>
          <li>Provide the customer a <strong>minimum $20/day discount</strong> off your standard rental rate</li>
          <li>Adhere to your standard rental practices — including rental agreements, ID verification, deposit handling, customer service, and emergency maintenance support for the duration of the rental</li>
        </ul>
        <p style="font-size:13px; color:#4a5568;">Port A Local handles all customer comms — we'll relay handoff logistics to you closer to the date.</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:12px; color:#8896ab; font-style:italic;">This lead was sent to ${totalVendorCount} Port Aransas cart companies. First to respond wins.</p>
      `,
    });

    // Email blast — one Resend POST per email address (a vendor with
    // multiple emails like Bron's gets one POST per address so each can
    // independently succeed or bounce; we'll learn which addresses work)
    const vendorBlastPromises = allEmailVendors.flatMap((v) =>
      emailsFor(v).map((address) =>
        sendEmail(
          address,
          `🛺 New Cart Rental — ${cartLabel} — ${pickupDate} to ${returnDate} — Claim It`,
          vendorLeadHtml,
        ),
      ),
    );

    console.log(
      `[Rent/Blast] Sending lead email to ${vendorBlastPromises.length} addresses across ${allEmailVendors.length} vendors`,
    );

    const customerSMS = `Port A Local: Your ${cartLabel} is reserved for ${pickupFormatted}. ${handoff === "pickup" ? "Pickup details" : "Delivery details"} arrive 24-48 hours before your trip. Reply STOP to opt out.`;

    // SMS channel — branch on first-look
    const smsPromises: Array<Promise<unknown>> = [];

    if (hasFirstLook) {
      // First-look phase: SMS only the priority vendors. Open blast
      // deferred until window expiry (cron) OR a PASS reply (inbound webhook).
      console.log(
        `[Rent/Blast] First-look active — priority SMS to ${firstLookVendors.length} vendor(s): ${firstLookSlugs.join(", ")}`,
      );
      for (const v of firstLookVendors) {
        // Persist the pending row so the cron + webhook can find it
        const minutes = v.firstLookMinutes ?? 30;
        smsPromises.push(
          startFirstLookWindow({
            leadId: session.id,
            vendorSlug: v.slug,
            windowMinutes: minutes,
            metadata: {
              cartSize,
              cartLabel,
              pickupDate,
              returnDate,
              pickupFormatted,
              returnFormatted,
              pickupShort,
              returnShort,
              numDays: days,
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
              reservationFee: fee,
              handoff,
            },
          }).then((row) => {
            if (!row) {
              console.warn(
                `[first-look] startFirstLookWindow returned null for ${v.slug} (likely duplicate lead_id) — skipping SMS to avoid double-send`,
              );
              return;
            }
            return sendFirstLookSms(v, {
              cartLabel: compactCartLabel(cartLabel),
              pickupFormatted: pickupShort,
              returnFormatted: returnShort,
              numDays: days,
              windowMinutes: minutes,
              handoff,
            }).then((sent) =>
              console.log(
                `[first-look] sent priority SMS to ${sent} number(s) for ${v.slug}`,
              ),
            );
          }),
        );
      }
    } else {
      // No first-look match — standard simultaneous SMS blast
      smsPromises.push(
        sendOpenBlastSms({
          cartLabel: compactCartLabel(cartLabel),
          pickupFormatted: pickupShort,
          returnFormatted: returnShort,
          numDays: days,
          handoff,
        }).then((sent) =>
          console.log(`[Rent/Blast] SMS sent to ${sent} opted-in vendors`),
        ),
      );
    }

    await Promise.allSettled([
      sendEmail(INTERNAL_RECIPIENTS, `✅ Golf Cart PAID — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
      sendEmail(email, "Your Golf Cart is Reserved — Port A Local", customerHtml),
      sendConsumerSms(phone, customerSMS, smsConsent),
      // Server-side Conversions API Purchase — value is the reservation
      // fee actually transacted via Stripe. Deduped against the client
      // pixel by event_id = session.id. Fail-soft.
      sendPurchaseEvent({
        eventId: session.id,
        value: Number(reservationFee) || fee,
        email,
        phone,
        fbc: attribution.fbc,
        fbp: attribution.fbp,
        clientIp: attribution.ip,
        eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://theportalocal.com"}/rent`,
      }).then((r) => {
        if (r.ok) {
          console.log(`[Rent/CAPI] Purchase sent — event_id ${session.id}, received ${r.eventsReceived}`);
        } else if (!r.skipped) {
          console.error(`[Rent/CAPI] Purchase failed — ${r.error}`);
        }
      }),
      ...smsPromises,
      pingSuperAdmins({
        kind: "cart-rental",
        amountCents: fee * 100,
        summary: `${compactCartLabel(cartLabel)} · ${pickupShort} to ${returnShort} (${days} ${days === 1 ? "day" : "days"})${
          hasFirstLook ? ` · ⏱ first-look ${firstLookSlugs.join("/")}` : ""
        }`,
        customerDisplay: formatCustomerDisplay(name),
      }),
      ...vendorBlastPromises,
    ]);

    return NextResponse.json({ success: true, value: fee, currency: "USD" });
  } catch (err) {
    console.error("[Rent/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
