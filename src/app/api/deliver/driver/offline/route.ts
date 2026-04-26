import { NextRequest, NextResponse } from "next/server";
import { getDriverStatus, setDriverOffline } from "@/data/delivery-store";
import { getApiRunner } from "@/lib/runnerSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/offline (cookie-based, falls back to ?t=<token>)
 * Marks the driver off-duty immediately.
 */
export async function POST(req: NextRequest) {
  const driver = await getApiRunner(req);
  if (!driver) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  await setDriverOffline(driver.id);
  const status = await getDriverStatus(driver.id);
  return NextResponse.json({ ok: true, status });
}
