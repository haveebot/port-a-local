import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { emailLayout } from "@/lib/emailLayout";
import { sendConsumerSms } from "@/lib/twilioSms";
import { sendBeachLeadBlast } from "@/lib/beachVendorBlast";
import { recordBlast } from "@/data/beach-claim-store";
import { sendPurchaseEvent } from "@/lib/metaConversions";
import { sendPalEmail } from "@/lib/palEmail";
import { pingSuperAdmins, formatCustomerDisplay } from "@/lib/superAdminPing";
import {
  getBeachProductLabel,
  getBeachAddon,
  addonsSmsSummary,
  type BeachAddonSelection,
} from "@/data/beach-products";

/** Parse the JSON-encoded add-on selection from Stripe metadata. */
function parseAddons(raw: string | undefined): BeachAddonSelection {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: BeachAddonSelection = {};
    for (const [slug, q] of Object.entries(obj)) {
      const n = Number(q);
      if (Number.isFinite(n) && n > 0 && getBeachAddon(slug)) {
        out[slug] = n;
      }
    }
    return out;
  } catch {
    return {};
  }
}

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const INTERNAL_EMAIL = process.env.INTERNAL_ALERT_EMAIL || "";
// Internal alerts CC bookings@ for transactional record-keeping per
// Winston rule 2026-04-29 (the same alias that's already the FROM
// address — receives transactional copies for the booking ledger).
const INTERNAL_RECIPIENTS = [INTERNAL_EMAIL, "bookings@theportalocal.com"]
  .map((r) => r.trim())
  .filter(Boolean);

async function sendEmail(to: string | string[], subject: string, html: string) {
  await sendPalEmail({ to, subject, html });
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
    const { name, phone, email, product, quantity, pickupDate, returnDate, deliveryAddress, numDays, totalPrice, smsConsent } = m;

    // Ad attribution captured at checkout (pal_attrib cookie → Stripe
    // metadata). Parsed best-effort; absent/malformed just means the
    // booking has no traceable campaign (organic/direct).
    let attribution: Record<string, string | undefined> = {};
    try {
      if (m.attribution) attribution = JSON.parse(m.attribution);
    } catch {
      /* ignore malformed attribution blob */
    }

    const vendorTotalCents = parseInt(m.vendor_total_cents || "0") || 0;
    const palFeeTotalCents = parseInt(m.pal_fee_total_cents || "0") || 0;
    const vendorTotalUsd = vendorTotalCents > 0 ? `$${(vendorTotalCents / 100).toFixed(2)}` : "(not split)";
    const palFeeTotalUsd = palFeeTotalCents > 0 ? `$${(palFeeTotalCents / 100).toFixed(2)}` : "(not split)";

    const startFormatted = formatDate(pickupDate);
    const endFormatted = formatDate(returnDate);
    const productLabel = getBeachProductLabel(product);
    const qty = parseInt(quantity);
    const days = parseInt(numDays);
    const total = parseInt(totalPrice);
    const addonSelection = parseAddons(m.addons);
    const addonEntries = Object.entries(addonSelection);
    const addonsHtmlRows = addonEntries
      .map(([slug, q]) => {
        const a = getBeachAddon(slug);
        return a ? `<li><strong>${a.label}:</strong> ${q}</li>` : "";
      })
      .filter(Boolean)
      .join("");
    const addonsInlineSummary = addonsSmsSummary(addonSelection); // "" when empty

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
        ${addonsHtmlRows ? `<p style="margin:8px 0 4px 0;"><strong>Add-ons:</strong></p><ul style="margin:0 0 8px 0; padding-left:20px;">${addonsHtmlRows}</ul>` : ""}
        <p><strong>Start:</strong> ${startFormatted}</p>
        <p><strong>End:</strong> ${endFormatted}</p>
        <p><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
        <p><strong>Setup location:</strong> ${deliveryAddress}</p>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:16px;"><strong>Total collected:</strong> $${total}</p>
        <p style="margin:4px 0; font-size:13px;"><strong>Vendor payout (owed):</strong> ${vendorTotalUsd}</p>
        <p style="margin:4px 0; font-size:13px;"><strong>PAL booking fee (retained):</strong> ${palFeeTotalUsd}</p>
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
          ${addonsHtmlRows ? `<li><strong>Add-ons:</strong><ul>${addonsHtmlRows}</ul></li>` : ""}
          <li><strong>Start:</strong> ${startFormatted}</li>
          <li><strong>End:</strong> ${endFormatted}</li>
          <li><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</li>
          <li><strong>Setup location:</strong> ${deliveryAddress}</li>
          <li><strong>Total paid:</strong> $${total}</li>
        </ul>
        <hr style="border:none; border-top:1px solid #e4dccc; margin:16px 0;"/>
        <p style="font-size:13px; color:#4a5568;"><strong>Cancellation policy</strong></p>
        <p style="font-size:12px; color:#4a5568; line-height:1.5;">Free cancellation up to <strong>72 hours before your setup date</strong>. After that, the booking is non-refundable — your local vendor has held the slot. To cancel, reply to this email.</p>
        <p style="margin-top:20px;">A <strong>vetted local Port Aransas beach crew</strong> handles your setup — Port A Local stays your single point of contact start to finish. Questions or changes? Reply to this email or text us at <a href="tel:+13614281706" style="color:#e8656f;">(361) 428-1706</a>.</p>
        <p style="margin-top:20px;">— The Port A Local</p>
      `,
    });

    console.log(`[Beach/Confirm] Payment confirmed — ${name} | ${productLabel} x${qty} | ${pickupDate} → ${returnDate} | $${total}`);

    const customerSMS = `Port A Local: Your ${productLabel}${addonsInlineSummary ? ` + ${addonsInlineSummary}` : ""} (${days} day${days !== 1 ? "s" : ""}) is booked for ${startFormatted}. Delivered to: ${deliveryAddress}. Reply STOP to opt out.`;

    // Beach vendor blast — short ID is the last 6 chars of session ID,
    // friendly to vendors who reply CLAIM. Format compact for SMS.
    const shortId = session.id.slice(-6).toUpperCase();
    const startCompact = startFormatted
      .replace(/, \d{4}$/, "")
      .replace(/^([A-Za-z]+), /, "$1 ");

    await Promise.allSettled([
      sendEmail(INTERNAL_RECIPIENTS, `✅ Beach Rental PAID — ${name} — ${pickupDate} to ${returnDate}`, internalHtml),
      sendEmail(email, "Your Beach Setup is Booked — Port A Local", customerHtml),
      sendConsumerSms(phone, customerSMS, smsConsent),
      // Server-side Conversions API Purchase — deduped against the client
      // pixel via event_id = session.id. Fire-and-forget; fail-soft so a
      // CAPI hiccup never affects the booking confirmation.
      sendPurchaseEvent({
        eventId: session.id,
        value: Number(totalPrice) || total,
        email,
        phone,
        fbc: attribution.fbc,
        fbp: attribution.fbp,
        clientIp: attribution.ip,
        eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://theportalocal.com"}/beach`,
      }).then((r) => {
        if (r.ok) {
          console.log(`[Beach/CAPI] Purchase sent — event_id ${session.id}, received ${r.eventsReceived}`);
        } else if (!r.skipped) {
          console.error(`[Beach/CAPI] Purchase failed — ${r.error}`);
        }
      }),
      pingSuperAdmins({
        kind: "beach-rental",
        amountCents: total * 100,
        summary: `${productLabel} ×${qty}${addonsInlineSummary ? ` + ${addonsInlineSummary}` : ""} · ${startFormatted.replace(/, \d{4}$/,"").replace(/^([A-Za-z]+), /,"$1 ")} (${days} ${days === 1 ? "day" : "days"}) · ${deliveryAddress}\n\nVendor: ${vendorTotalUsd} · PAL fee: ${palFeeTotalUsd}`,
        customerDisplay: formatCustomerDisplay(name),
      }),
      // Record the blast in claim store (idempotent on session ID), then fan
      // out to active beach vendors. Sequential 800ms pacing inside the
      // helper. recordBlast first so a CLAIM reply landing fast still finds
      // the row.
      (async () => {
        try {
          await recordBlast({
            stripeSessionId: session.id,
            customerPhone: phone,
            customerName: name,
            product,
            qty,
            setupDate: pickupDate,
            numDays: days,
            vendorAmountCents: vendorTotalCents,
            setupLocation: deliveryAddress,
            utmSource: attribution.utm_source,
            utmMedium: attribution.utm_medium,
            utmCampaign: attribution.utm_campaign,
            utmContent: attribution.utm_content,
            fbclid: attribution.fbclid,
          });
          const sent = await sendBeachLeadBlast({
            product,
            qty,
            addons: addonSelection,
            setupDateFormatted: startCompact,
            numDays: days,
            customerName: name,
            shortId,
          });
          console.log(`[Beach/Blast] SMS sent to ${sent} active beach vendors (ref ${shortId})`);
        } catch (err) {
          console.error("[Beach/Blast] failed:", err);
        }
      })(),
    ]);

    return NextResponse.json({ success: true, value: total, currency: "USD" });
  } catch (err) {
    console.error("[Beach/Confirm] Error:", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
