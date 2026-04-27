import { NextRequest, NextResponse } from "next/server";
import { getApiRunner } from "@/lib/runnerSession";
import { setDriverPushSubscription } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/push/unsubscribe
 *
 * Clears the runner's stored push subscription. Called when:
 *   - Runner explicitly toggles off notifications on the hub
 *   - Browser detects the subscription is no longer valid (rare)
 *
 * Server-side only operation; browser-side unsubscribe is handled
 * separately via subscription.unsubscribe() on the client.
 */
export async function POST(req: NextRequest) {
  const driver = await getApiRunner(req);
  if (!driver) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  await setDriverPushSubscription(driver.id, null);
  console.log(`[push/unsubscribe] driver ${driver.id} (${driver.name})`);
  return NextResponse.json({ ok: true });
}
