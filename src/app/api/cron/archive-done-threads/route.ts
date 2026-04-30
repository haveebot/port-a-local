import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: backstop archive of any 'done' threads
 * Schedule: daily at 9am CT (configured in vercel.json)
 *
 * Per Winston rule 2026-04-29 (instant-archive model): "done" is no
 * longer a parking state — the API auto-coerces done→archived on every
 * PATCH (see /api/wheelhouse/threads/[id]/route.ts). This cron is a
 * backstop to catch any thread that ends up in 'done' through a code
 * path that bypasses the API (legacy data, direct SQL, etc.).
 *
 * Logic: SET state='archived' WHERE state='done'. No time threshold
 * because there's no in-between state anymore.
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
    const { rows: candidates } = await sql`
      SELECT id, title FROM wheelhouse_threads WHERE state = 'done'
    `;
    if (candidates.length === 0) {
      return NextResponse.json({ ok: true, archived: 0 });
    }
    await sql`
      UPDATE wheelhouse_threads
      SET state = 'archived', updated_at = NOW()
      WHERE state = 'done'
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
