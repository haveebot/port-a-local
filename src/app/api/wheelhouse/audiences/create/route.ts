import { NextRequest, NextResponse } from "next/server";
import { createWebsiteCustomAudience } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "InitiateCheckout",
  "Purchase",
  "Lead",
] as const);

type AllowedEvent = "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead";

/**
 * Create a Website Custom Audience defined by a Pixel event filter.
 * Wheelhouse-authed (cookie or agent bearer checked by middleware).
 */
export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    event?: string;
    retentionDays?: number;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim();
  const event = (body.event ?? "") as AllowedEvent;
  const retentionDays = Number(body.retentionDays);

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "name required" },
      { status: 400 },
    );
  }
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json(
      { ok: false, error: `event must be one of ${Array.from(ALLOWED_EVENTS).join(", ")}` },
      { status: 400 },
    );
  }
  if (!Number.isFinite(retentionDays) || retentionDays < 1 || retentionDays > 180) {
    return NextResponse.json(
      { ok: false, error: "retentionDays must be a number between 1 and 180" },
      { status: 400 },
    );
  }

  const result = await createWebsiteCustomAudience({
    name,
    event,
    retentionDays,
    description: body.description?.trim() || undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "create failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    stubbed: result.stubbed ?? false,
    audienceId: result.audienceId,
  });
}
