import { NextRequest, NextResponse } from "next/server";
import {
  getPending,
  getRecent,
  getStats,
  queuePost,
  type PostChannel,
  type PostStatus,
  type TriggerType,
} from "@/data/social-post-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Wheelhouse social queue list + manual-queue endpoint.
 *
 * GET  /api/wheelhouse/social?status=pending|sent|skipped|failed
 * POST /api/wheelhouse/social — manual queue (bypasses triggers)
 *
 * Auth: gated by Wheelhouse middleware (cookie + bearer). Endpoint
 * itself doesn't re-check auth.
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as PostStatus | null;

  const [pending, recent, stats] = await Promise.all([
    getPending(50),
    status ? getRecent(50, status) : getRecent(50),
    getStats(),
  ]);

  return NextResponse.json({
    pending,
    recent,
    stats,
  });
}

interface ManualQueueBody {
  channel?: PostChannel;
  caption?: string;
  linkUrl?: string;
  imageUrl?: string;
  scheduledFor?: string;
  triggerRef?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ManualQueueBody | null;
  if (!body?.caption || !body.channel) {
    return NextResponse.json(
      { error: "missing_fields", required: ["channel", "caption"] },
      { status: 400 },
    );
  }
  if (!["facebook", "instagram"].includes(body.channel)) {
    return NextResponse.json(
      { error: "invalid_channel", channel: body.channel },
      { status: 400 },
    );
  }
  const post = await queuePost({
    triggerType: "manual" as TriggerType,
    triggerRef: body.triggerRef ?? null,
    channel: body.channel,
    caption: body.caption,
    linkUrl: body.linkUrl ?? null,
    imageUrl: body.imageUrl ?? null,
    scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
  });
  return NextResponse.json({ post }, { status: 201 });
}
