import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  queuePost,
  setAutoSendAt,
  setImageUrl,
} from "@/data/social-post-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/wheelhouse/social/create
 *
 * Direct-create endpoint for the "Write it yourself" composer at
 * /wheelhouse/social. Operator writes the caption directly — no
 * LLM mediation (that's what /compose is for). Caption is required,
 * everything else optional. Drops into the pending queue exactly
 * like an LLM-drafted post, so the rest of the queue UI (edit /
 * schedule / send / boost) works identically.
 *
 * Body:
 *   caption     string  required — at least 1 char of content
 *   linkUrl     string  optional — http/https only
 *   imageUrl    string  optional — URL of an image (Bank or upload)
 *   autoSendAt  string  optional — ISO timestamp for auto-fire,
 *                                  null/missing = stockpile/manual-fire
 *
 * Returns:
 *   201 { ok: true, id, post }       on success
 *   400 { ok: false, error, detail } on validation failure
 *   500 { ok: false, error, detail } on insert failure
 *
 * Auth: wheelhouse middleware (cookie or bearer).
 */

interface CreateBody {
  caption?: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  autoSendAt?: string | null;
}

async function getCurrentUser(req: NextRequest): Promise<string> {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CreateBody | null;
  const caption = body?.caption?.trim() ?? "";
  if (!caption) {
    return NextResponse.json(
      { ok: false, error: "missing_caption" },
      { status: 400 },
    );
  }
  if (caption.length > 5000) {
    return NextResponse.json(
      {
        ok: false,
        error: "caption_too_long",
        detail: "Captions over 5000 chars rarely render well on FB.",
      },
      { status: 413 },
    );
  }

  const rawLink = body?.linkUrl?.trim() || null;
  let linkUrl: string | null = null;
  if (rawLink) {
    try {
      const parsed = new URL(rawLink);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json(
          {
            ok: false,
            error: "invalid_link_protocol",
            detail: "Link must be http:// or https://",
          },
          { status: 400 },
        );
      }
      linkUrl = parsed.toString();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_link_url",
          detail: `Couldn't parse "${rawLink}" as a URL.`,
        },
        { status: 400 },
      );
    }
  }

  const rawImage = body?.imageUrl?.trim() || null;
  let imageUrl: string | null = null;
  if (rawImage) {
    try {
      const parsed = new URL(rawImage);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json(
          { ok: false, error: "invalid_image_protocol" },
          { status: 400 },
        );
      }
      imageUrl = parsed.toString();
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_image_url" },
        { status: 400 },
      );
    }
  }

  let autoSendIso: string | null = null;
  if (body?.autoSendAt) {
    const t = Date.parse(body.autoSendAt);
    if (Number.isNaN(t)) {
      return NextResponse.json(
        { ok: false, error: "unparseable_autoSendAt" },
        { status: 400 },
      );
    }
    // 60s grace for clock skew — datetime-local rounds to the minute.
    if (t < Date.now() - 60_000) {
      return NextResponse.json(
        { ok: false, error: "autoSendAt_in_past" },
        { status: 400 },
      );
    }
    autoSendIso = new Date(t).toISOString();
  }

  const who = await getCurrentUser(req);
  // Unique trigger_ref so queuePost's dedup-by-(trigger_type, trigger_ref,
  // channel) check always inserts a new row — direct posts aren't deduped.
  const triggerRef = `direct:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  try {
    const post = await queuePost({
      triggerType: "manual",
      triggerRef,
      channel: "facebook",
      caption,
      linkUrl,
      imageUrl,
      metadata: { source: "direct_create", composedBy: who },
    });
    // queuePost doesn't take autoSendAt — patch it in afterwards (mirrors
    // how the per-post schedule action works).
    if (autoSendIso) {
      await setAutoSendAt(post.id, autoSendIso);
    }
    // imageUrl is passed through queuePost already, but if it ever
    // becomes a separate step (mirroring autoSendAt) we'd patch here.
    // For now this is a no-op safety net.
    if (imageUrl && !post.imageUrl) {
      await setImageUrl(post.id, imageUrl);
    }
    return NextResponse.json(
      { ok: true, id: post.id, post },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "insert_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
