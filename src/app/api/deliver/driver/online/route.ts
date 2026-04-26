import { NextRequest, NextResponse } from "next/server";
import { getDriverStatus, setDriverOnline } from "@/data/delivery-store";
import { getApiRunner } from "@/lib/runnerSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/online (cookie-based, falls back to ?t=<token>)
 * Marks the driver on-duty for the next 4 hours (auto-off after).
 */
export async function POST(req: NextRequest) {
  const driver = await getApiRunner(req);
  if (!driver) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  await setDriverOnline(driver.id, 4);
  const status = await getDriverStatus(driver.id);
  return NextResponse.json({ ok: true, status });
}
