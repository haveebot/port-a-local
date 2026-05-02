import { NextRequest, NextResponse } from "next/server";
import {
  getSentPostsToCheck,
  markRemovedFromFb,
} from "@/data/social-post-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Detect FB-deleted posts and mark them in our DB.
 *
 * For every sent post with an externalPostId, hit Graph API to check it
 * still exists. If FB returns "Object does not exist" (error subcode 33,
 * code 100), stamp removed_from_fb_at on the row. Idempotent — already-
 * marked rows are skipped via the WHERE clause in getSentPostsToCheck.
 *
 * Triggered by:
 *   - POST from /wheelhouse/social UI ("Sweep cleanup" button)
 *   - Scheduled cron (added to vercel.json — daily)
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */

interface CheckResult {
  id: number;
  externalPostId: string;
  status: "alive" | "removed" | "error";
  error?: string;
}

async function checkPostExists(
  externalPostId: string,
  token: string,
): Promise<CheckResult["status"] | { error: string }> {
  const url = `https://graph.facebook.com/v21.0/${externalPostId}?fields=id&access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      id?: string;
      error?: { code?: number; error_subcode?: number; message?: string };
    };
    if (res.ok && data.id) return "alive";
    // Code 100 + subcode 33 = "Object with ID does not exist"
    // Code 100 alone with "does not exist" message is the same case
    const msg = data.error?.message ?? "";
    if (
      data.error?.error_subcode === 33 ||
      msg.includes("does not exist") ||
      msg.includes("cannot be loaded")
    ) {
      return "removed";
    }
    return { error: msg || `HTTP ${res.status}` };
  } catch (err) {
    return {
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function POST(_req: NextRequest) {
  const token = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  if (!token) {
    return NextResponse.json(
      { error: "META_PAGE_ACCESS_TOKEN not set" },
      { status: 500 },
    );
  }

  const posts = await getSentPostsToCheck();
  const results: CheckResult[] = [];

  for (const p of posts) {
    if (!p.externalPostId) continue;
    const r = await checkPostExists(p.externalPostId, token);
    if (typeof r === "string") {
      if (r === "removed") {
        await markRemovedFromFb(p.id);
      }
      results.push({
        id: p.id,
        externalPostId: p.externalPostId,
        status: r,
      });
    } else {
      results.push({
        id: p.id,
        externalPostId: p.externalPostId,
        status: "error",
        error: r.error,
      });
    }
    // Tiny delay to avoid Graph API rate-limiting on burst checks
    await new Promise((r) => setTimeout(r, 100));
  }

  const alive = results.filter((r) => r.status === "alive").length;
  const removed = results.filter((r) => r.status === "removed").length;
  const errored = results.filter((r) => r.status === "error").length;

  return NextResponse.json({
    ok: true,
    checked: results.length,
    alive,
    removed,
    errored,
    results,
  });
}
