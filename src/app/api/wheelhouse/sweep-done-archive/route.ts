import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * One-shot admin endpoint to archive any threads currently in 'done'
 * state. Same SQL as /api/cron/archive-done-threads but uses Wheelhouse
 * cookie/bearer auth (vs CRON_SECRET) so an operator can trigger the
 * sweep on demand without waiting for the next daily cron tick.
 *
 * Idempotent — re-runs return zero archived if nothing's left in 'done'.
 */
async function authorize(req: NextRequest): Promise<string | null> {
  const who = (await cookies()).get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return null;
}

export async function POST(req: NextRequest) {
  const who = await authorize(req);
  if (!who) {
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
      triggered_by: who,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "server_error", detail: String(err) },
      { status: 500 },
    );
  }
}
