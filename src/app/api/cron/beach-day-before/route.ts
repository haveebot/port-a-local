import { NextResponse } from "next/server";
import { getClaimsForSetupDate } from "@/data/beach-claim-store";
import { sendBeachDayBeforeComms } from "@/lib/beachDayBefore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: beach day-before comms.
 * Schedule: daily ~9am CT (configured in vercel.json).
 *
 * Finds claimed beach setups happening TOMORROW (America/Chicago) that
 * haven't had their day-before comms sent yet, and for each fires:
 *   - a formal setup reminder to the claiming crew (no customer contact)
 *   - a confirmation to the customer (consent-gated; vendor never named)
 * then stamps day_before_sent_at (idempotent — safe to re-run).
 *
 * Auth: Vercel CRON_SECRET bearer (matches the other crons).
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Tomorrow's date in the setup timezone (America/Chicago), YYYY-MM-DD.
  const tomorrow = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

  const claims = await getClaimsForSetupDate(tomorrow);
  const results = [];
  for (const claim of claims) {
    results.push(await sendBeachDayBeforeComms(claim));
  }
  return NextResponse.json({
    ok: true,
    date: tomorrow,
    count: claims.length,
    results,
  });
}
