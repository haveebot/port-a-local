import { NextRequest, NextResponse } from "next/server";
import { pauseCampaign } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Pause a Meta ad campaign. Wheelhouse-authed (cookie or agent bearer
 * checked by middleware). Idempotent — calling pause on an already-paused
 * campaign is a Meta no-op success.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "campaign id required" },
      { status: 400 },
    );
  }

  const result = await pauseCampaign(id);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "pause failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    stubbed: result.stubbed ?? false,
    campaignId: result.campaignId,
    newStatus: result.newStatus,
  });
}
