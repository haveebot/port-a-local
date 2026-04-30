import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import {
  beachVendors,
  beachVendorPhone,
  findBeachVendorByPhone,
} from "@/data/beach-vendors";
import {
  getBeachVendorStatus,
  markBeachVendorDashboardVisit,
} from "@/data/beach-vendor-status";
import { attemptBeachPayout } from "@/lib/beachPayouts";
import { sql } from "@vercel/postgres";
import { sendSms } from "@/lib/twilioSms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

/**
 * Wheelhouse-only admin endpoint for beach vendor payouts:
 *   - manual-payout (per claim) — fires Stripe transfer for an eligible claim
 *   - dashboard-link (per vendor) — returns one-time Stripe Express dashboard URL
 *   - send-onboarding-sms (per vendor) — texts vendor their /beach/vendor/<slug>/connect link
 *
 * Auth: cookie (wheelhouse_who) OR bearer (x-wheelhouse-agent header from middleware).
 * Same pattern as /api/wheelhouse/cart-vendor-sms.
 */
async function authorize(req: NextRequest): Promise<string | null> {
  const who = (await cookies()).get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return null;
}

interface PostBody {
  action: "manual-payout" | "dashboard-link" | "send-onboarding-sms";
  slug?: string;
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  const who = await authorize(req);
  if (!who) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.action === "manual-payout") {
    if (!body.sessionId) {
      return NextResponse.json({ error: "missing_sessionId" }, { status: 400 });
    }
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims WHERE stripe_session_id = ${body.sessionId} LIMIT 1
    `;
    if (!rows[0]) {
      return NextResponse.json({ error: "claim_not_found" }, { status: 404 });
    }
    const claim = {
      stripeSessionId: rows[0].stripe_session_id as string,
      claimedBySlug: (rows[0].claimed_by_slug as string) ?? null,
      claimedAt: rows[0].claimed_at
        ? new Date(rows[0].claimed_at as string).toISOString()
        : null,
      blastedAt: new Date(rows[0].blasted_at as string).toISOString(),
      customerPhone: (rows[0].customer_phone as string) ?? null,
      customerName: (rows[0].customer_name as string) ?? null,
      product: (rows[0].product as string) ?? null,
      qty: rows[0].qty as number | null,
      setupDate: (rows[0].setup_date as string) ?? null,
      numDays: rows[0].num_days as number | null,
      notes: (rows[0].notes as string) ?? null,
      paidOutAt: rows[0].paid_out_at
        ? new Date(rows[0].paid_out_at as string).toISOString()
        : null,
      transferId: (rows[0].transfer_id as string) ?? null,
      vendorAmountCents: rows[0].vendor_amount_cents as number | null,
    };
    const result = await attemptBeachPayout(claim);
    return NextResponse.json({ ok: result.ok, result });
  }

  if (body.action === "dashboard-link") {
    if (!body.slug) {
      return NextResponse.json({ error: "missing_slug" }, { status: 400 });
    }
    const vendor = beachVendors.find((v) => v.slug === body.slug);
    if (!vendor) {
      return NextResponse.json({ error: "vendor_not_found" }, { status: 404 });
    }
    const status = await getBeachVendorStatus(body.slug);
    if (!status.stripeAccountId) {
      return NextResponse.json(
        { error: "vendor_not_onboarded" },
        { status: 400 },
      );
    }
    try {
      const link = await getStripe().accounts.createLoginLink(
        status.stripeAccountId,
      );
      await markBeachVendorDashboardVisit(body.slug);
      return NextResponse.json({ ok: true, url: link.url });
    } catch (err) {
      console.error("[wh/beach-payouts] dashboard link failed:", err);
      return NextResponse.json(
        { error: "stripe_error", detail: String(err) },
        { status: 502 },
      );
    }
  }

  if (body.action === "send-onboarding-sms") {
    if (!body.slug) {
      return NextResponse.json({ error: "missing_slug" }, { status: 400 });
    }
    const vendor = beachVendors.find((v) => v.slug === body.slug);
    if (!vendor) {
      return NextResponse.json({ error: "vendor_not_found" }, { status: 404 });
    }
    const phone = beachVendorPhone(vendor);
    if (!phone) {
      return NextResponse.json({ error: "vendor_has_no_phone" }, { status: 400 });
    }
    const url = `${APP_URL}/beach/vendor/${body.slug}/connect`;
    const sms = `Port A Local: Hi ${vendor.name.split(" ")[0]} - quick one-time setup so we can auto-pay you for beach setups: ${url}\n\n3-5 min via Stripe (identity + bank). Once done, your $275/cabana share lands in your account 1-2 days after each setup. - Havee`;
    try {
      await sendSms(phone, sms);
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[wh/beach-payouts] onboarding sms failed:", err);
      return NextResponse.json(
        { error: "sms_failed", detail: String(err) },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

// silence unused warning — used by a future enhancement
export { findBeachVendorByPhone };
