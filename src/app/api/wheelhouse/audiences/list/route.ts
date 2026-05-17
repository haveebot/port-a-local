import { NextResponse } from "next/server";
import { listCustomAudiences } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/wheelhouse/audiences/list
 *
 * Bearer-authed (middleware) JSON view of every Custom Audience on the
 * PAL ad account. Same shape returned by the helper that backs the
 * /wheelhouse/ads/audiences page — exposed as JSON for agent / cron /
 * external consumers.
 *
 * Stub-mode safe.
 */
export async function GET() {
  const result = await listCustomAudiences();

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "list failed",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    stubbed: result.stubbed ?? false,
    fetchedAt: new Date().toISOString(),
    audiences: result.audiences ?? [],
  });
}
