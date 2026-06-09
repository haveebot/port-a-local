import { NextRequest, NextResponse } from "next/server";
import {
  listRentals,
  buildVendorUpdateSms,
  buildVendorUpdateEmail,
  vendorPhonesForRental,
  vendorEmailsForRental,
  type RentalSource,
} from "@/data/rentals-calendar";
import { sendSms } from "@/lib/twilioSms";
import { sendPalEmail } from "@/lib/palEmail";
import { assignCartVendor, setCartBookingNote } from "@/data/cart-booking-store";
import { setClaimNote } from "@/data/beach-claim-store";
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
 *   { action: "set-note", source, sessionId, note }     — store a customer
 *       note on the booking (post-booking details like arrival time); flows
 *       into every subsequent vendor comm. Empty note clears it.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    source?: RentalSource;
    sessionId?: string;
    vendorSlug?: string;
    note?: string;
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
    const emails = vendorEmailsForRental(r);
    if (phones.length === 0 && emails.length === 0) {
      return NextResponse.json({ ok: false, error: "no_vendor_contact" }, { status: 400 });
    }
    const msg = buildVendorUpdateSms(r);
    let sent = 0;
    for (const p of phones) {
      try {
        await sendSms(p, msg);
        sent++;
      } catch (err) {
        console.error("[wh/rentals] send-update SMS failed:", err);
      }
      await new Promise((res) => setTimeout(res, 600));
    }
    let emailed = 0;
    if (emails.length > 0) {
      const { subject, html, text } = buildVendorUpdateEmail(r);
      const ok = await sendPalEmail({ to: emails, subject, html, text });
      if (ok) emailed = emails.length;
    }
    console.log(
      `[wh/rentals] update sent to ${r.vendorName} (${sent} sms, ${emailed} email) for ${sessionId}`,
    );
    return NextResponse.json({
      ok: sent > 0 || emailed > 0,
      result: { sent, emailed, vendor: r.vendorName },
    });
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

  if (action === "set-note") {
    // Notes ride along inside vendor SMS — keep them SMS-sized.
    const trimmed = (body.note ?? "").trim();
    if (trimmed.length > 300) {
      return NextResponse.json({ ok: false, error: "note_too_long" }, { status: 400 });
    }
    const note = trimmed.length > 0 ? trimmed : null;
    let updated = false;
    if (source === "beach") {
      updated = await setClaimNote(sessionId, note);
    } else if (source === "cart") {
      updated = await setCartBookingNote(sessionId, note);
    } else {
      return NextResponse.json({ ok: false, error: "bad_source" }, { status: 400 });
    }
    if (!updated) {
      return NextResponse.json({ ok: false, error: "rental_not_found" }, { status: 404 });
    }
    console.log(`[wh/rentals] ${source} ${sessionId} note ${note ? "set" : "cleared"}`);
    return NextResponse.json({ ok: true, result: { note } });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
