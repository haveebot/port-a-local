import { NextResponse } from "next/server";
import { getPalStats } from "@/data/wheelhouse-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getPalStats();
  return NextResponse.json({ stats });
}
