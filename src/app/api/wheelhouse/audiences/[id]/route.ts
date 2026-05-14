import { NextRequest, NextResponse } from "next/server";
import { deleteCustomAudience } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Delete a Custom Audience. Wheelhouse-authed (cookie or agent bearer
 * checked by middleware). Idempotent — re-deleting returns ok:true.
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "audience id required" },
      { status: 400 },
    );
  }

  const result = await deleteCustomAudience(id);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "delete failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    stubbed: result.stubbed ?? false,
    audienceId: result.audienceId,
  });
}
