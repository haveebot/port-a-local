import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/push/unsubscribe
 *
 * Body: { endpoint: <PushSubscription endpoint> }
 *
 * Mirrors /api/push/subscribe — keyed on endpoint, not (kind, id),
 * because endpoint is the unique device-channel identifier. Idempotent:
 * deleting a row that doesn't exist is a no-op success.
 *
 * Auth note: open by design. The endpoint is the device's own channel
 * ID; you can only delete a subscription you have the endpoint for,
 * which means it's your own device. Mirrors how every push service
 * itself authenticates — possession of the endpoint URL = ownership.
 */
export async function POST(req: NextRequest) {
  let body: { endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const endpoint = (body.endpoint ?? "").trim();
  if (!endpoint) {
    return NextResponse.json(
      { error: "endpoint required" },
      { status: 400 },
    );
  }
  try {
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
  } catch (err) {
    console.error("[push unsubscribe] db error:", err);
    return NextResponse.json(
      { error: "db error" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
