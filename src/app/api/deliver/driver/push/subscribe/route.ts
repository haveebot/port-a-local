import { NextRequest, NextResponse } from "next/server";
import { getApiRunner } from "@/lib/runnerSession";
import { setDriverPushSubscription } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/push/subscribe
 * Body: { subscription: PushSubscriptionJSON }
 *
 * Stores the runner's web push subscription (browser-generated JSON
 * blob containing endpoint + p256dh + auth keys) so the dispatch
 * flow can ping their phone when new orders land.
 *
 * One subscription per runner — re-enabling on a new device or
 * different browser overwrites the old. Stripe-Connect-style: works
 * on whichever device they last enabled from.
 */
export async function POST(req: NextRequest) {
  const driver = await getApiRunner(req);
  if (!driver) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  let body: { subscription?: object };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.subscription || typeof body.subscription !== "object") {
    return NextResponse.json(
      { error: "Missing subscription" },
      { status: 400 },
    );
  }
  // Light validation — every web push subscription has these top-level
  // properties. Don't deep-validate; the browser builds it.
  const sub = body.subscription as { endpoint?: unknown; keys?: unknown };
  if (typeof sub.endpoint !== "string" || !sub.keys) {
    return NextResponse.json(
      { error: "Subscription missing endpoint or keys" },
      { status: 400 },
    );
  }

  await setDriverPushSubscription(driver.id, body.subscription);
  console.log(`[push/subscribe] driver ${driver.id} (${driver.name}) enabled`);
  return NextResponse.json({ ok: true });
}
