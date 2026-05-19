import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getBeachProduct,
  getBeachAddon,
  dailyTotalCents,
  type BeachAddonSelection,
} from "@/data/beach-products";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://theportalocal.com";

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
    qty,
    smsConsent,
    addons: rawAddons,
  } = body;

  // Validate required fields. Note: we INTENTIONALLY ignore any
  // totalPrice / vendorBaseCentsPerDay / palFeeCentsPerDay the client
  // sends — those are computed server-side from the trusted catalog
  // so a manipulated request body can't underpay.
  if (!name || !phone || !email || !product || !pickupDate || !returnDate || !deliveryAddress || !numDays) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const catalog = getBeachProduct(product);
  if (!catalog) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const days = Number(numDays);
  const actualQty = Number(qty || quantity || 1);
  if (!Number.isFinite(days) || days < 1 || days > 60) {
    return NextResponse.json({ error: "Invalid numDays" }, { status: 400 });
  }
  if (!Number.isFinite(actualQty) || actualQty < 1 || actualQty > 20) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  // Validate add-on selection — keys must match known add-on slugs (NOT
  // primary products, so customers can't sneak a base product through the
  // add-on path), qty in [1, 20].
  const addonSelection: BeachAddonSelection = {};
  if (rawAddons && typeof rawAddons === "object") {
    for (const [slug, qRaw] of Object.entries(rawAddons)) {
      const q = Number(qRaw);
      if (!Number.isFinite(q) || q < 1) continue;
      if (q > 20) {
        return NextResponse.json({ error: `Invalid add-on quantity for ${slug}` }, { status: 400 });
      }
      const addon = getBeachAddon(slug);
      if (!addon) {
        return NextResponse.json({ error: `Unknown add-on: ${slug}` }, { status: 400 });
      }
      addonSelection[slug] = q;
    }
  }

  // SERVER-COMPUTED amounts. Never trust client.
  const baseTotalCents = dailyTotalCents(catalog) * days * actualQty;
  const baseVendorCents = catalog.vendorBaseCents * days * actualQty;
  const basePalFeeCents = catalog.palFeeCents * days * actualQty;

  let addonTotalCents = 0;
  let addonVendorCents = 0;
  let addonPalFeeCents = 0;
  for (const [slug, q] of Object.entries(addonSelection)) {
    const a = getBeachAddon(slug)!;
    addonTotalCents += dailyTotalCents(a) * days * q;
    addonVendorCents += a.vendorBaseCents * days * q;
    addonPalFeeCents += a.palFeeCents * days * q;
  }

  const totalCents = baseTotalCents + addonTotalCents;
  const vendorTotalCents = baseVendorCents + addonVendorCents;
  const palFeeTotalCents = basePalFeeCents + addonPalFeeCents;

  // Single-day setup is the new default (returnDate === pickupDate).
  // Format the Stripe line_item description accordingly — avoid showing
  // "May 24 → May 24" which reads as broken.
  const isSingleDay = pickupDate === returnDate;
  const dateSpan = isSingleDay ? pickupDate : `${pickupDate} → ${returnDate}`;
  const durationLabel = isSingleDay
    ? "1 day"
    : `${days} day${days !== 1 ? "s" : ""}`;

  // Build the Stripe line items: one for the base product, one per add-on.
  // Each line is priced PER UNIT × quantity so the dashboard reads cleanly
  // ("Cabana × 2" / "Boogie Board × 3"). PAL keeps a single Stripe session
  // so all charges share the booking metadata.
  type StripeLineItem = NonNullable<Stripe.Checkout.SessionCreateParams["line_items"]>[number];
  const lineItems: StripeLineItem[] = [
    {
      price_data: {
        currency: "usd",
        unit_amount: dailyTotalCents(catalog) * days,
        product_data: {
          name: `Beach Rental — ${catalog.label}`,
          description: `${durationLabel} · ${dateSpan} · ${deliveryAddress} · Free cancellation up to 72 hours before setup date`,
        },
      },
      quantity: actualQty,
    },
  ];
  for (const [slug, q] of Object.entries(addonSelection)) {
    const a = getBeachAddon(slug)!;
    lineItems.push({
      price_data: {
        currency: "usd",
        unit_amount: dailyTotalCents(a) * days,
        product_data: {
          name: `Add-on — ${a.label}`,
          description: `${durationLabel} · attached to ${catalog.label} booking`,
        },
      },
      quantity: q,
    });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      metadata: {
        type: "beach",
        name,
        phone,
        email,
        product,
        quantity: String(actualQty),
        pickupDate,
        returnDate,
        deliveryAddress,
        numDays: String(days),
        totalPrice: String(totalCents / 100),
        smsConsent: smsConsent ? "true" : "false",
        vendor_total_cents: String(vendorTotalCents),
        pal_fee_total_cents: String(palFeeTotalCents),
        addons: JSON.stringify(addonSelection),
      },
      success_url: `${APP_URL}/beach/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/beach`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout/Beach] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
