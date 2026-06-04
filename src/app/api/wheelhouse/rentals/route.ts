import { NextRequest, NextResponse } from "next/server";
import {
  listRentals,
  buildVendorUpdateSms,
  vendorPhonesForRental,
  type RentalSource,
} from "@/data/rentals-calendar";
import { sendSms } from "@/lib/twilioSms";
import { assignCartVendor } from "@/data/cart-booking-store";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/wheelhouse/rentals — operator actions on a single rental.
 * Bearer/cookie-authed via middleware.
 *
 *   { action: "send-update", source, sessionId }       — SMS the assigned
 *       vendor an update for THIS booking only (scoped — one rental, one
 *       vendor, never the full list).
 *   { action: "reassign", source, sessionId, vendorSlug } — move the
 *       booking to a different vendor (records the new owner).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    source?: RentalSource;
    sessionId?: string;
    vendorSlug?: string;
  };
  const { action, source, sessionId, vendorSlug } = body;
  if (!action || !sessionId || !source) {
    return NextResponse.json({ error: "missing action/source/sessionId" }, { status: 400 });
  }

  if (action === "send-update") {
    const rentals = await listRentals();
    const r = rentals.find((x) => x.sessionId === sessionId && x.source === source);
    if (!r) return NextResponse.json({ ok: false, error: "rental_not_found" }, { status: 404 });
    if (!r.vendorSlug) {
      return NextResponse.json({ ok: false, error: "no_vendor_assigned" }, { status: 400 });
    }
    const phones = vendorPhonesForRental(r);
    if (phones.length === 0) {
      return NextResponse.json({ ok: false, error: "no_textable_vendor_phone" }, { status: 400 });
    }
    const msg = buildVendorUpdateSms(r);
    let sent = 0;
    for (const p of phones) {
      try {
        await sendSms(p, msg);
        sent++;
      } catch (err) {
        console.error("[wh/rentals] send-update failed:", err);
      }
      await new Promise((res) => setTimeout(res, 600));
    }
    console.log(`[wh/rentals] update sent to ${r.vendorName} (${sent} phone(s)) for ${sessionId}`);
    return NextResponse.json({ ok: sent > 0, result: { sent, vendor: r.vendorName } });
  }

  if (action === "reassign") {
    if (!vendorSlug) {
      return NextResponse.json({ ok: false, error: "missing_vendorSlug" }, { status: 400 });
    }
    if (source === "cart") {
      await assignCartVendor(sessionId, vendorSlug);
    } else if (source === "beach") {
      await sql`
        UPDATE beach_booking_claims
        SET claimed_by_slug = ${vendorSlug}, claimed_at = NOW()
        WHERE stripe_session_id = ${sessionId}
      `;
    } else {
      return NextResponse.json({ ok: false, error: "bad_source" }, { status: 400 });
    }
    console.log(`[wh/rentals] ${source} ${sessionId} reassigned to ${vendorSlug}`);
    return NextResponse.json({ ok: true, result: { reassignedTo: vendorSlug } });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
