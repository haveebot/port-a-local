import { NextRequest, NextResponse } from "next/server";
import { getDriverByToken } from "@/data/delivery-drivers";
import { getDriverStatus, setDriverOffline } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/offline?t=<driver_token>
 * Marks the driver off-duty immediately.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const driver = await getDriverByToken(token);
  if (!driver) {
    return NextResponse.json({ error: "Invalid driver token" }, { status: 403 });
  }
  await setDriverOffline(driver.id);
  const status = await getDriverStatus(driver.id);
  return NextResponse.json({ ok: true, status });
}
