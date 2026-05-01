import { NextResponse } from "next/server";
import {
  getDueForAutoSend,
  markSent,
  markFailed,
  type SocialPost,
} from "@/data/social-post-store";
import { postToFacebook, postToInstagram } from "@/lib/metaGraph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: social post auto-fire
 * Schedule: every 15 minutes (configured in vercel.json)
 *
 * Picks up pending posts whose auto_send_at has passed and fires them
 * to Meta Graph API. Each post's send is awaited; the cron exits with
 * a per-post results array so failures show up in cron logs.
 *
 * Auth: Vercel CRON_SECRET bearer (matches other crons).
 *
 * Race-window note: if two cron invocations overlap (very unlikely at
 * 15-min cadence — sends take ~2s), markSent's status='sent' transition
 * blocks the second send via the queue's existing idempotency. If we
 * ever see a double-post in production, add a 'sending' intermediate
 * status with an atomic UPDATE WHERE status='pending' claim. Not
 * pre-engineering it.
 */
async function sendPost(post: SocialPost): Promise<{
  ok: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
  stubbed?: boolean;
}> {
  if (post.channel === "facebook") {
    return postToFacebook({
      message: post.caption,
      link: post.linkUrl ?? undefined,
    });
  }
  if (post.channel === "instagram") {
    if (!post.imageUrl) {
      return {
        ok: false,
        error: "Instagram requires image_url — none set on this post",
      };
    }
    return postToInstagram({
      caption: post.caption,
      imageUrl: post.imageUrl,
    });
  }
  return { ok: false, error: `unsupported channel: ${post.channel}` };
}

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const due = await getDueForAutoSend(25);
  if (due.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, sent: 0 });
  }

  const results: Array<{
    id: number;
    channel: string;
    triggerRef: string | null;
    ok: boolean;
    stubbed?: boolean;
    externalPostId?: string;
    error?: string;
  }> = [];

  let sentCount = 0;
  let failedCount = 0;
  for (const post of due) {
    const r = await sendPost(post);
    if (!r.ok || !r.externalPostId) {
      await markFailed(post.id, r.error ?? "unknown error");
      results.push({
        id: post.id,
        channel: post.channel,
        triggerRef: post.triggerRef,
        ok: false,
        error: r.error,
      });
      failedCount++;
      continue;
    }
    await markSent({
      id: post.id,
      sentBy: "cron:social-auto-send",
      externalPostId: r.externalPostId,
      externalPostUrl: r.externalPostUrl ?? null,
    });
    results.push({
      id: post.id,
      channel: post.channel,
      triggerRef: post.triggerRef,
      ok: true,
      stubbed: r.stubbed,
      externalPostId: r.externalPostId,
    });
    sentCount++;
  }

  return NextResponse.json({
    ok: true,
    scanned: due.length,
    sent: sentCount,
    failed: failedCount,
    results,
  });
}
