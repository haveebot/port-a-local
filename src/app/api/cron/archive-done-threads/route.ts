import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: auto-archive done Wheelhouse threads
 * Schedule: daily at 9am CT (configured in vercel.json)
 *
 * Per Winston rule 2026-04-29: threads marked `done` and untouched
 * for 7+ days get auto-archived. Reduces noise in the active board
 * without losing history (archived threads still queryable).
 *
 * Logic: SET state='archived', updated_at=NOW() WHERE state='done'
 *        AND updated_at < NOW() - INTERVAL '7 days'.
 *
 * Idempotent: re-runs are no-ops once a thread is already archived.
 *
 * Auth: CRON_SECRET bearer (matches /api/wheelhouse/cron/pulse).
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
    // Pull the soon-to-be-archived list first so we can return what changed.
    const { rows: candidates } = await sql`
      SELECT id, title FROM wheelhouse_threads
      WHERE state = 'done'
        AND updated_at < NOW() - INTERVAL '7 days'
    `;
    if (candidates.length === 0) {
      return NextResponse.json({ ok: true, archived: 0 });
    }
    await sql`
      UPDATE wheelhouse_threads
      SET state = 'archived', updated_at = NOW()
      WHERE state = 'done'
        AND updated_at < NOW() - INTERVAL '7 days'
    `;
    return NextResponse.json({
      ok: true,
      archived: candidates.length,
      ids: candidates.map((r) => ({ id: r.id, title: r.title })),
    });
  } catch (err) {
    console.error("[cron/archive-done-threads] failed:", err);
    return NextResponse.json(
      { error: "server_error", detail: String(err) },
      { status: 500 },
    );
  }
}
