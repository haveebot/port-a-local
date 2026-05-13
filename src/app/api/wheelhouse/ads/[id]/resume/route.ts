import { NextRequest, NextResponse } from "next/server";
import { resumeCampaign } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Resume (un-pause) a Meta ad campaign. Wheelhouse-authed.
 * Idempotent.
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

  const result = await resumeCampaign(id);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "resume failed" },
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
