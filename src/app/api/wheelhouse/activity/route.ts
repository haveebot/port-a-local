import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity } from "@/data/wheelhouse-store";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("hours");
  const parsed = raw ? Number(raw) : 24;
  const hours =
    Number.isFinite(parsed) && parsed > 0 && parsed <= 168 ? parsed : 24;
  const activity = await getRecentActivity(hours);
  return NextResponse.json({ activity });
}
