import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Boost permissions diagnostic — surfaces the current state of:
 *   - The Meta Page access token (validity, scopes, expiry)
 *   - The user/page permissions granted to the token
 *   - The Page's tasks (CREATE_CONTENT, MANAGE_ADS, etc.) for the
 *     token holder
 *   - The Ad Account's name + status
 *
 * Use when boost create fails with "creative: Permissions error" or
 * any other vague Meta API rejection. Distinguishes:
 *
 *   - Token expired
 *   - Token missing required scope (e.g., ads_management)
 *   - Page-level access tasks revoked (e.g., MANAGE_ADS removed)
 *   - Ad account disabled / inactive
 *   - Wrong app_id on the token (token came from a different app)
 *
 * Origin: 2026-05-06. Boost #29 failed mid-day with
 * "creative: Permissions error" with no ad_id. The standard diagnose
 * endpoint can't go deeper because there's no ad to inspect. This
 * endpoint inspects the credentials side of the system instead.
 *
 * GET /api/wheelhouse/social/boost/debug-perms
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getToken(): string | null {
  const t = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  return t.length > 0 ? t : null;
}

function getAdAccountId(): string | null {
  const id = (process.env.META_AD_ACCOUNT_ID ?? "").trim();
  if (!id) return null;
  return id.startsWith("act_") ? id.slice(4) : id;
}

function getPageId(): string | null {
  const id = (process.env.META_PAGE_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

interface MetaError {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  error_user_title?: string;
  error_user_msg?: string;
}

async function fetchGraph(
  url: string,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: MetaError }> {
  try {
    const res = await fetch(url, { method: "GET" });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const err = (json.error ?? {}) as MetaError;
      return { ok: false, error: err };
    }
    return { ok: true, data: json };
  } catch (err) {
    return {
      ok: false,
      error: { message: (err as Error).message },
    };
  }
}

export async function GET() {
  const token = getToken();
  const adAccountId = getAdAccountId();
  const pageId = getPageId();

  if (!token) {
    return NextResponse.json(
      { error: "META_PAGE_ACCESS_TOKEN not configured" },
      { status: 500 },
    );
  }

  // Fire all four diagnostic calls in parallel
  const [debugRes, permsRes, pageRes, accountRes] = await Promise.all([
    // 1. /debug_token — uses the token to inspect itself (works for
    //    short-lived + long-lived user/page tokens)
    fetchGraph(
      `${GRAPH_BASE}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`,
    ),
    // 2. /me/permissions — shows which user-level perms have been
    //    granted (relevant for user tokens; page tokens return /me as
    //    the page itself)
    fetchGraph(
      `${GRAPH_BASE}/me/permissions?access_token=${encodeURIComponent(token)}`,
    ),
    // 3. Page details — tasks tells us what this token can do on the
    //    page (CREATE_CONTENT, MANAGE_ADS, MANAGE, ANALYZE, etc.)
    pageId
      ? fetchGraph(
          `${GRAPH_BASE}/${pageId}?fields=id,name,tasks,access_token&access_token=${encodeURIComponent(token)}`,
        )
      : Promise.resolve({
          ok: false as const,
          error: { message: "META_PAGE_ID not configured" },
        }),
    // 4. Ad account state — disabled/inactive accounts cause
    //    "Permissions error" on creative create
    adAccountId
      ? fetchGraph(
          `${GRAPH_BASE}/act_${adAccountId}?fields=id,name,account_status,disable_reason,funding_source_details&access_token=${encodeURIComponent(token)}`,
        )
      : Promise.resolve({
          ok: false as const,
          error: { message: "META_AD_ACCOUNT_ID not configured" },
        }),
  ]);

  // Synthesize a top-line diagnosis
  const issues: string[] = [];

  // Token type matters: PAGE tokens don't carry user-level scopes the
  // same way USER tokens do (they inherit perms from the source user
  // token + the page-task assignment), and the page `tasks` field on a
  // page-token-fetched /pageId response isn't populated in the same
  // shape. Running USER-token-style scope/task checks against PAGE
  // tokens produced two false positives in production diagnostics
  // (2026-05-07 boost-create incident).
  const debugData = debugRes.ok
    ? ((debugRes.data.data ?? {}) as Record<string, unknown>)
    : null;
  const tokenType = (debugData?.type as string | undefined) ?? "USER";

  if (!debugRes.ok) {
    issues.push(
      `debug_token failed: ${debugRes.error.message ?? JSON.stringify(debugRes.error)}`,
    );
  } else {
    const d = debugData!;
    if (d.is_valid === false) {
      issues.push(`token is_valid=false (likely expired or revoked)`);
    }
    if (typeof d.expires_at === "number" && d.expires_at !== 0) {
      const expiresMs = (d.expires_at as number) * 1000;
      const daysLeft = Math.floor((expiresMs - Date.now()) / 86_400_000);
      if (daysLeft < 7) {
        issues.push(`token expires in ${daysLeft} day(s) — rotate soon`);
      }
    }
    // Scope check: only meaningful for USER tokens. PAGE tokens derive
    // permissions from the source user; their `scopes` array is shaped
    // differently and tripped a false-positive "missing scopes" issue.
    if (tokenType === "USER") {
      const scopes = (d.scopes as string[] | undefined) ?? [];
      const required = ["ads_management", "ads_read", "pages_manage_ads", "pages_read_engagement"];
      const missing = required.filter((s) => !scopes.includes(s));
      if (missing.length > 0) {
        issues.push(`token missing required scopes: ${missing.join(", ")}`);
      }
    }
  }

  if (pageRes.ok) {
    // Page-tasks check: also only meaningful for USER tokens. PAGE
    // tokens fetching their own /pageId record return `tasks` in a
    // shape that doesn't reliably include MANAGE_ADS / CREATE_CONTENT
    // even when the underlying user has them, producing a false-positive
    // "page tasks missing" issue. Skip for PAGE tokens.
    if (tokenType === "USER") {
      const tasks = (pageRes.data.tasks as string[] | undefined) ?? [];
      const requiredPageTasks = ["MANAGE_ADS", "CREATE_CONTENT"];
      const missingTasks = requiredPageTasks.filter((t) => !tasks.includes(t));
      if (missingTasks.length > 0) {
        issues.push(
          `page tasks missing: ${missingTasks.join(", ")} — token does not have ad-manage rights on the page`,
        );
      }
    }
  } else {
    issues.push(
      `page fetch failed: ${pageRes.error.message ?? JSON.stringify(pageRes.error)}`,
    );
  }

  if (accountRes.ok) {
    const status = accountRes.data.account_status;
    if (status !== 1) {
      issues.push(
        `ad account status=${status} (1=active; other values mean disabled/closed/pending)`,
      );
    }
  } else {
    issues.push(
      `ad account fetch failed: ${accountRes.error.message ?? JSON.stringify(accountRes.error)}`,
    );
  }

  return NextResponse.json({
    diagnosis: issues.length === 0 ? "no_issues_detected" : "issues_detected",
    issues,
    debug_token: debugRes.ok ? debugRes.data : { error: debugRes.error },
    permissions: permsRes.ok ? permsRes.data : { error: permsRes.error },
    page: pageRes.ok ? pageRes.data : { error: pageRes.error },
    ad_account: accountRes.ok ? accountRes.data : { error: accountRes.error },
    env_set: {
      META_PAGE_ACCESS_TOKEN: !!token,
      META_PAGE_ID: !!pageId,
      META_AD_ACCOUNT_ID: !!adAccountId,
    },
  });
}
