import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getById, getRecent, type SocialPost } from "@/data/social-post-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Per-post traffic — joins social_post_queue to wheelhouse_analytics_events
 * to surface "did this post drive any traffic" since Meta no longer exposes
 * organic post impressions/reach via Graph API.
 *
 *   GET /api/wheelhouse/social/post-traffic?id=N    one post (full hourly + totals)
 *   GET /api/wheelhouse/social/post-traffic         all sent posts (totals only)
 *
 * Counts pageviews to the post's linkUrl path:
 *   - in the 7-day window after sentAt
 *   - with referrer matching FB hosts (or fbclid in query string)
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */

interface PostTraffic {
  id: number;
  caption: string;
  linkUrl: string | null;
  path: string | null;
  sentAt: string | null;
  externalPostUrl: string | null;
  fbClicks: number;
  fbUniqueSessions: number;
  totalClicks: number;
  totalUniqueSessions: number;
  baselineDailyAvg: number | null;
}

interface PostTrafficDetail extends PostTraffic {
  hourlyFbClicks: { hour: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

function pathFromUrl(linkUrl: string | null): string | null {
  if (!linkUrl) return null;
  try {
    return new URL(linkUrl).pathname;
  } catch {
    return null;
  }
}

const FB_REFERRER_CLAUSE = `(
  referrer ILIKE '%facebook.com%'
  OR referrer ILIKE '%fb.com%'
  OR referrer ILIKE '%fb.me%'
  OR referrer ILIKE '%lm.facebook.com%'
  OR referrer ILIKE '%m.facebook.com%'
  OR query_params ILIKE '%fbclid=%'
)`;

async function getPostTraffic(
  post: SocialPost,
  detail: boolean,
): Promise<PostTraffic | PostTrafficDetail> {
  const path = pathFromUrl(post.linkUrl);
  const base: PostTraffic = {
    id: post.id,
    caption: post.caption,
    linkUrl: post.linkUrl,
    path,
    sentAt: post.sentAt,
    externalPostUrl: post.externalPostUrl,
    fbClicks: 0,
    fbUniqueSessions: 0,
    totalClicks: 0,
    totalUniqueSessions: 0,
    baselineDailyAvg: null,
  };

  if (!path || !post.sentAt) {
    if (detail) {
      return { ...base, hourlyFbClicks: [], topReferrers: [] };
    }
    return base;
  }

  const sent = new Date(post.sentAt);
  const sevenAfter = new Date(sent.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dayAfter = new Date(sent.getTime() + 24 * 60 * 60 * 1000);
  const baselineStart = new Date(sent.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 7-day post-window FB-only counts
  const fbResult = await sql.query(
    `
    SELECT
      COUNT(*)::int AS clicks,
      COUNT(DISTINCT session_id)::int AS unique_sessions
    FROM wheelhouse_analytics_events
    WHERE path = $1
      AND event_type = 'pageview'
      AND ts >= $2::timestamptz
      AND ts < $3::timestamptz
      AND ${FB_REFERRER_CLAUSE}
    `,
    [path, sent.toISOString(), sevenAfter.toISOString()],
  );

  // 7-day post-window total (any source)
  const totalResult = await sql.query(
    `
    SELECT
      COUNT(*)::int AS clicks,
      COUNT(DISTINCT session_id)::int AS unique_sessions
    FROM wheelhouse_analytics_events
    WHERE path = $1
      AND event_type = 'pageview'
      AND ts >= $2::timestamptz
      AND ts < $3::timestamptz
    `,
    [path, sent.toISOString(), sevenAfter.toISOString()],
  );

  // 7d baseline before the post (for comparison)
  const baselineResult = await sql.query(
    `
    SELECT COUNT(*)::int AS clicks
    FROM wheelhouse_analytics_events
    WHERE path = $1
      AND event_type = 'pageview'
      AND ts >= $2::timestamptz
      AND ts < $3::timestamptz
    `,
    [path, baselineStart.toISOString(), sent.toISOString()],
  );

  base.fbClicks = fbResult.rows[0]?.clicks ?? 0;
  base.fbUniqueSessions = fbResult.rows[0]?.unique_sessions ?? 0;
  base.totalClicks = totalResult.rows[0]?.clicks ?? 0;
  base.totalUniqueSessions = totalResult.rows[0]?.unique_sessions ?? 0;
  base.baselineDailyAvg =
    Math.round(((baselineResult.rows[0]?.clicks ?? 0) / 7) * 10) / 10;

  if (!detail) return base;

  // Hourly FB breakdown for first 24h
  const hourlyResult = await sql.query(
    `
    SELECT
      to_char(date_trunc('hour', ts), 'YYYY-MM-DD HH24:00') AS hour,
      COUNT(*)::int AS count
    FROM wheelhouse_analytics_events
    WHERE path = $1
      AND event_type = 'pageview'
      AND ts >= $2::timestamptz
      AND ts < $3::timestamptz
      AND ${FB_REFERRER_CLAUSE}
    GROUP BY 1
    ORDER BY 1
    `,
    [path, sent.toISOString(), dayAfter.toISOString()],
  );

  // Top referrers (any source, 7d window)
  const refResult = await sql.query(
    `
    SELECT referrer, COUNT(*)::int AS count
    FROM wheelhouse_analytics_events
    WHERE path = $1
      AND event_type = 'pageview'
      AND ts >= $2::timestamptz
      AND ts < $3::timestamptz
      AND referrer IS NOT NULL
      AND referrer != ''
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 10
    `,
    [path, sent.toISOString(), sevenAfter.toISOString()],
  );

  return {
    ...base,
    hourlyFbClicks: hourlyResult.rows.map((r) => ({
      hour: r.hour as string,
      count: r.count as number,
    })),
    topReferrers: refResult.rows.map((r) => ({
      referrer: r.referrer as string,
      count: r.count as number,
    })),
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");

  if (idParam) {
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "invalid_id" }, { status: 400 });
    }
    const post = await getById(id);
    if (!post) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!post.sentAt) {
      return NextResponse.json(
        { error: "post_not_sent", post },
        { status: 409 },
      );
    }
    const traffic = await getPostTraffic(post, true);
    return NextResponse.json(traffic);
  }

  // No id — return summary for all sent posts
  const sentPosts = await getRecent(50, "sent");
  const trafficData = await Promise.all(
    sentPosts.map((p) => getPostTraffic(p, false)),
  );
  return NextResponse.json({ posts: trafficData });
}
