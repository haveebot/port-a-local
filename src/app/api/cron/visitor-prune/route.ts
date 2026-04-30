import { NextResponse } from "next/server";
import { pruneOldHeartbeats } from "@/data/visitor-heartbeats";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: prune old visitor heartbeats + ask_gully_log entries
 * Schedule: hourly (configured in vercel.json)
 *
 * Two cleanups in one cron — both anonymous high-volume tables that
 * grow linearly without intervention:
 *
 * 1. visitor_heartbeats — keeps last 6 hours. The table only needs
 *    enough data for the 3-min "active visitor" window. Anything
 *    older than a few hours is dead weight.
 *
 * 2. ask_gully_log — keeps last 90 days. Long enough for trend
 *    analysis + content gap reports without unbounded growth. PAL
 *    volume at ~20-50 questions/day means ~1500-4500 rows in the
 *    window; tiny.
 *
 * Idempotent. Auth: CRON_SECRET bearer.
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const heartbeatsPruned = await pruneOldHeartbeats(6);

    let askGullyPruned = 0;
    try {
      const { rowCount } = await sql`
        DELETE FROM ask_gully_log
        WHERE created_at < NOW() - INTERVAL '90 days'
      `;
      askGullyPruned = rowCount ?? 0;
    } catch (err) {
      // Don't fail the whole cron if ask_gully_log doesn't exist yet
      // (table is created lazily on first ensureSchema call).
      console.warn("[cron/visitor-prune] ask_gully_log prune skipped:", err);
    }

    return NextResponse.json({
      ok: true,
      heartbeatsPruned,
      askGullyPruned,
    });
  } catch (err) {
    console.error("[cron/visitor-prune] failed:", err);
    return NextResponse.json(
      { error: "server_error", detail: String(err) },
      { status: 500 },
    );
  }
}
