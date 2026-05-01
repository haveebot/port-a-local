import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getById,
  markSent,
  markSkipped,
  markFailed,
  updateCaption,
  setAutoSendAt,
  setImageUrl,
  duplicatePost,
  type SocialPost,
} from "@/data/social-post-store";
import { postToFacebook, postToInstagram } from "@/lib/metaGraph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Per-post actions. PATCH with { action }.
 *
 * action=send: fires to Meta Graph API. Stub mode if no token.
 * action=skip: marks as skipped (kept for audit, not sent).
 * action=edit: { action: "edit", caption: "..." } updates draft.
 * action=schedule: { action: "schedule", autoSendAt: ISO | null } sets
 *   the auto-send time. Cron at /api/cron/social-auto-send fires it.
 *   Pass null to revert to manual-only.
 */

interface PatchBody {
  action?: "send" | "skip" | "edit" | "schedule" | "image" | "resend";
  caption?: string;
  autoSendAt?: string | null;
  imageUrl?: string | null;
}

async function getCurrentUser(req: NextRequest): Promise<string> {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (who) return who;
  // Bearer-auth path (agent flows) — middleware injects x-wheelhouse-agent
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return "unknown";
}

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
      imageUrl: post.imageUrl ?? undefined,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body?.action) {
    return NextResponse.json(
      { error: "missing_action", required: ["action"] },
      { status: 400 },
    );
  }

  const post = await getById(id);
  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Resend works on non-pending posts — operator-side fix for sent rows
  // that need to be redone (broken FB OG cache, deleted on FB, etc.).
  // Other actions require pending status.
  if (body.action === "resend") {
    if (post.status === "pending") {
      return NextResponse.json(
        { error: "source_already_pending", detail: "Just send/edit it directly." },
        { status: 409 },
      );
    }
    const dup = await duplicatePost(id);
    if (!dup) {
      return NextResponse.json({ error: "duplicate_failed" }, { status: 500 });
    }
    return NextResponse.json({ post: dup, sourceId: id }, { status: 201 });
  }

  if (post.status !== "pending") {
    return NextResponse.json(
      { error: "not_pending", currentStatus: post.status },
      { status: 409 },
    );
  }

  const who = await getCurrentUser(req);

  if (body.action === "edit") {
    if (typeof body.caption !== "string" || body.caption.trim().length < 1) {
      return NextResponse.json(
        { error: "invalid_caption" },
        { status: 400 },
      );
    }
    await updateCaption({ id, caption: body.caption.trim() });
    const updated = await getById(id);
    return NextResponse.json({ post: updated });
  }

  if (body.action === "skip") {
    await markSkipped(id, who);
    const updated = await getById(id);
    return NextResponse.json({ post: updated });
  }

  if (body.action === "image") {
    if (body.imageUrl !== null && typeof body.imageUrl !== "string") {
      return NextResponse.json(
        { error: "invalid_imageUrl" },
        { status: 400 },
      );
    }
    if (typeof body.imageUrl === "string") {
      try {
        new URL(body.imageUrl);
      } catch {
        return NextResponse.json(
          { error: "imageUrl_not_a_url" },
          { status: 400 },
        );
      }
    }
    await setImageUrl(id, body.imageUrl);
    const updated = await getById(id);
    return NextResponse.json({ post: updated });
  }

  if (body.action === "schedule") {
    if (body.autoSendAt !== null && typeof body.autoSendAt !== "string") {
      return NextResponse.json(
        { error: "invalid_autoSendAt", expected: "ISO string or null" },
        { status: 400 },
      );
    }
    if (body.autoSendAt) {
      const t = Date.parse(body.autoSendAt);
      if (Number.isNaN(t)) {
        return NextResponse.json(
          { error: "unparseable_autoSendAt" },
          { status: 400 },
        );
      }
      await setAutoSendAt(id, new Date(t).toISOString());
    } else {
      await setAutoSendAt(id, null);
    }
    const updated = await getById(id);
    return NextResponse.json({ post: updated });
  }

  if (body.action === "send") {
    const result = await sendPost(post);
    if (!result.ok || !result.externalPostId) {
      await markFailed(id, result.error ?? "unknown error");
      const updated = await getById(id);
      return NextResponse.json(
        { post: updated, error: result.error },
        { status: 502 },
      );
    }
    await markSent({
      id,
      sentBy: who,
      externalPostId: result.externalPostId,
      externalPostUrl: result.externalPostUrl ?? null,
    });
    const updated = await getById(id);
    return NextResponse.json({
      post: updated,
      stubbed: result.stubbed ?? false,
    });
  }

  return NextResponse.json(
    { error: "unknown_action", action: body.action },
    { status: 400 },
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const post = await getById(id);
  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
