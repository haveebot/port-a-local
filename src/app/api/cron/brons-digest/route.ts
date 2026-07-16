import { NextResponse } from "next/server";
import { sendBronsDigest } from "@/lib/bronsDigest";

/**
 * GET /api/cron/brons-digest
 *
 * Fires the Bron's setup digest twice daily (see vercel.json, 0 11,23 UTC):
 *   - Morning run (6 AM CT) → day-of digest (today's setups)
 *   - Evening run (6 PM CT) → day-before digest (tomorrow's setups)
 *
 * Mode is chosen by the Chicago-local hour so a single route handles both.
 * Auth: Vercel CRON_SECRET bearer (matches the other crons).
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hour = Number(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      hour: "2-digit",
      hour12: false,
    }),
  );
  const mode = hour < 12 ? "day-of" : "day-before";

  try {
    const result = await sendBronsDigest(mode);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/brons-digest] failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
