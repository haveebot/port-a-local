import { NextRequest, NextResponse } from "next/server";
import { getById } from "@/data/social-post-store";
import { inspectFacebookPost } from "@/lib/metaGraph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Diagnostic: GET /api/wheelhouse/social/inspect-fb-post?id=NUMERIC|extId=FBID
 *
 * Returns the FB Graph API view of a previously-published post:
 *   is_published, is_hidden, privacy, targeting, feed_targeting,
 *   reactions/comments/shares, permalink. Used to diagnose "why can't
 *   X see this post" cases — a clean public post with no targeting +
 *   non-zero reactions confirms the visibility issue is on the
 *   viewer's side (algo, follow status, mute), not ours.
 *
 * Pass either id (our queue row id) or extId (FB's "page_post" ID).
 *
 * Auth: wheelhouse middleware (cookie or bearer).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const queueId = url.searchParams.get("id");
  const extId = url.searchParams.get("extId");

  let externalPostId: string | null = null;
  let queueRow: Awaited<ReturnType<typeof getById>> | null = null;

  if (extId) {
    externalPostId = extId;
  } else if (queueId) {
    const id = Number(queueId);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: "invalid_queue_id" },
        { status: 400 },
      );
    }
    queueRow = await getById(id);
    if (!queueRow) {
      return NextResponse.json({ error: "queue_row_not_found" }, { status: 404 });
    }
    if (!queueRow.externalPostId) {
      return NextResponse.json(
        { error: "queue_row_has_no_external_id", row: queueRow },
        { status: 409 },
      );
    }
    externalPostId = queueRow.externalPostId;
  } else {
    return NextResponse.json(
      { error: "missing_param", required: "id or extId" },
      { status: 400 },
    );
  }

  if (externalPostId.startsWith("stub:")) {
    return NextResponse.json({
      ok: true,
      stubbed: true,
      detail:
        "This post was queued in stub mode (no live FB token at send time). No real FB post exists to inspect.",
      externalPostId,
      queueRow,
    });
  }

  const result = await inspectFacebookPost(externalPostId);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        externalPostId,
        queueRow,
        likely_causes: [
          "Token missing /pages_read_user_content scope",
          "Post belongs to a different Page than META_PAGE_ID",
          "Post was deleted on FB",
        ],
      },
      { status: 502 },
    );
  }

  // Quick interpretation flags so the operator gets a one-glance read
  const d = result.data ?? {};
  const interp = {
    is_published: d.is_published === true ? "yes ✅" : `no ❌ (${String(d.is_published)})`,
    is_hidden: d.is_hidden === true ? "HIDDEN ⚠️" : "not hidden ✅",
    privacy_value: typeof d.privacy === "object" && d.privacy !== null
      ? (d.privacy as Record<string, unknown>).value
      : "(unknown)",
    has_targeting: d.targeting != null && Object.keys(d.targeting as object).length > 0
      ? "yes — restricts visibility ⚠️"
      : "none ✅",
    has_feed_targeting:
      d.feed_targeting != null && Object.keys(d.feed_targeting as object).length > 0
        ? "yes — restricts feed visibility ⚠️"
        : "none ✅",
  };

  return NextResponse.json({
    ok: true,
    externalPostId,
    queueRow,
    fb: result.data,
    summary: interp,
    diagnostic_note:
      "If is_published=yes, is_hidden=no, privacy=EVERYONE, no targeting, " +
      "and reactions/comments are nonzero — the post is fully public. A " +
      "specific viewer not seeing it is on their side: feed algo, follow " +
      "status, account mute, or location/age restrictions on their account.",
  });
}
