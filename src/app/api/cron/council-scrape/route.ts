import { NextRequest, NextResponse } from "next/server";
import { runCouncilScrape } from "@/lib/councilScraper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/cron/council-scrape
 *
 * Vercel cron handler — registered in vercel.json to run weekly.
 * Pulls Port Aransas civicweb.net schedule, upserts meetings into
 * the council_meetings table. Idempotent.
 *
 * Auth: Vercel adds an `Authorization: Bearer <CRON_SECRET>` header
 * when triggering the cron. We verify this when CRON_SECRET is set;
 * absent the env var, the route is open (useful for manual local
 * triggering).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startedAt = new Date().toISOString();
  const result = await runCouncilScrape();
  return NextResponse.json({
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    ...result,
  });
}
