import { NextRequest, NextResponse } from "next/server";
import {
  getExpiredPending,
  markExpired,
} from "@/data/cart-rental-first-look-store";
import { sendOpenBlastSms, compactCartLabel } from "@/lib/cartVendorSmsBlast";
import { sendSms } from "@/lib/twilioSms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: cart-rental first-look expiry processor.
 * Schedule: every minute (`* * * * *`) — configured in vercel.json.
 *
 * Scans `cart_rental_first_look_pending` for rows where
 *   status = 'pending' AND expires_at <= NOW()
 *
 * For each expired row:
 *   1. Atomic transition pending → expired (only one cron tick wins)
 *   2. Fire the open-blast SMS to the rest of the directory
 *      (excluding the priority vendor — they had their shot)
 *   3. Operator ping summarizing the timeout
 *
 * Idempotent — markExpired's WHERE status='pending' clause means
 * concurrent ticks racing on the same row produce one fan-out, not
 * duplicates.
 *
 * Auth: Vercel CRON_SECRET bearer.
 */

const OPERATOR_PHONE_E164 = "+15125681725"; // Winston

export async function GET(req: NextRequest) {
  // Vercel Cron auth — guards manual external triggers
  const authHeader = req.headers.get("authorization") || "";
  const expectedSecret = process.env.CRON_SECRET || "";
  const isVercelCron = authHeader === `Bearer ${expectedSecret}` && expectedSecret.length > 0;
  // Allow unauthenticated GET in dev / preview only — production requires the bearer
  if (!isVercelCron && process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const expired = await getExpiredPending();
  if (expired.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 });
  }

  const results: Array<{
    leadId: string;
    vendorSlug: string;
    won: boolean;
    blastedCount?: number;
  }> = [];

  for (const row of expired) {
    const won = await markExpired(row.id);
    if (!won) {
      // Race lost — vendor responded ACCEPT/PASS in the same tick.
      results.push({ leadId: row.leadId, vendorSlug: row.vendorSlug, won: false });
      continue;
    }

    // Fire the open-blast — exclude the priority vendor (they had
    // their head-start window and didn't act)
    let blastedCount = 0;
    try {
      blastedCount = await sendOpenBlastSms(
        {
          cartLabel: compactCartLabel(row.leadMetadata.cartLabel),
          pickupFormatted: row.leadMetadata.pickupShort,
          returnFormatted: row.leadMetadata.returnShort,
          numDays: row.leadMetadata.numDays,
        },
        { excludeSlugs: [row.vendorSlug] },
      );
    } catch (err) {
      console.error(
        `[first-look-expire] open-blast failed for lead ${row.leadId}:`,
        err,
      );
    }

    // Operator ping — let Winston see the timeout + auto-fanout fired
    sendSms(
      OPERATOR_PHONE_E164,
      `[first-look ⏰] ${row.vendorSlug} timed out on ${row.leadMetadata.cartLabel} — fan-out fired to ${blastedCount} other-vendor SMS`,
    ).catch((err) =>
      console.error("[first-look-expire] operator ping failed:", err),
    );

    results.push({
      leadId: row.leadId,
      vendorSlug: row.vendorSlug,
      won: true,
      blastedCount,
    });
  }

  console.log(
    `[first-look-expire] processed ${expired.length} expired rows, ${results.filter((r) => r.won).length} fan-outs fired`,
  );

  return NextResponse.json({ ok: true, expired: expired.length, results });
}
