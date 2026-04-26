import { NextRequest, NextResponse } from "next/server";
import { getDriverByToken } from "@/data/delivery-drivers";
import { getDriverStatus, setDriverOnline } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/online?t=<driver_token>
 * Marks the driver on-duty for the next 4 hours (auto-off after).
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const driver = getDriverByToken(token);
  if (!driver) {
    return NextResponse.json({ error: "Invalid driver token" }, { status: 403 });
  }
  await setDriverOnline(driver.id, 4);
  const status = await getDriverStatus(driver.id);
  return NextResponse.json({ ok: true, status });
}
