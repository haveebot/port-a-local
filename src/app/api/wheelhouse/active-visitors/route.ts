import { NextResponse } from "next/server";
import { getActiveVisitors } from "@/data/visitor-heartbeats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/wheelhouse/active-visitors
 *
 * Returns the count of distinct sessions seen on the site in the
 * last 3 minutes plus a path breakdown.
 *
 * Auth: handled by middleware (cookie or bearer). Lives under
 * /api/wheelhouse/* so the gate is automatic.
 */
export async function GET() {
  const info = await getActiveVisitors(180);
  return NextResponse.json(info);
}
