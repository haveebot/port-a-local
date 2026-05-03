import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Diagnostic: GET /api/wheelhouse/social/diagnose-og?url=<encoded-url>
 *
 * Read-only evidence-gathering endpoint for the FB OG cache mechanism.
 * Gives us:
 *   1. What FB currently has cached for the URL (BEFORE scrape)
 *   2. What FB's Sharing Debugger returns when we ask it to re-scrape
 *   3. What FB has cached AFTER the scrape
 *   4. What our own server returns for that URL right now (for comparison)
 *
 * No side effects beyond calling FB's documented Sharing Debugger — same
 * call our preScrapeLinkUrl makes during normal post-firing. This endpoint
 * just makes the responses VISIBLE so we can stop guessing about whether
 * scrape works.
 *
 * Auth: wheelhouse middleware (bearer or cookie).
 */

const GRAPH_BASE = "https://graph.facebook.com/v23.0";

function getToken(): string | null {
  const t = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  return t.length > 0 ? t : null;
}

async function queryFbCache(url: string, token: string) {
  // share field deprecated v2.9+, removed it. og_object includes image
  // which is what we actually need anyway.
  const fields = "og_object{id,type,title,description,image,updated_time,site_name,url}";
  const queryUrl = `${GRAPH_BASE}/?id=${encodeURIComponent(url)}&fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(queryUrl, { cache: "no-store" });
  const data = await res.json().catch(() => ({ parseError: true }));
  return { httpStatus: res.status, body: data };
}

async function scrapeFb(url: string, token: string) {
  const params = new URLSearchParams();
  params.set("id", url);
  params.set("scrape", "true");
  params.set("access_token", token);
  const res = await fetch(`${GRAPH_BASE}/`, { method: "POST", body: params });
  const data = await res.json().catch(() => ({ parseError: true }));
  return { httpStatus: res.status, body: data };
}

async function fetchOurServerResponse(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const headers = Object.fromEntries(res.headers.entries());
    const isImage = headers["content-type"]?.startsWith("image/");
    const body = isImage
      ? `<image bytes ${headers["content-length"] ?? "?"}>`
      : (await res.text()).slice(0, 500);
    return {
      httpStatus: res.status,
      headers: {
        "content-type": headers["content-type"],
        "content-length": headers["content-length"],
        "cache-control": headers["cache-control"],
        etag: headers["etag"],
        "last-modified": headers["last-modified"],
      },
      body,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET(req: NextRequest) {
  const token = getToken();
  if (!token) {
    return NextResponse.json(
      { error: "no_token", detail: "META_PAGE_ACCESS_TOKEN not set in env" },
      { status: 503 },
    );
  }

  const reqUrl = new URL(req.url);
  const target = reqUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json(
      { error: "missing_url", required: "?url=<encoded-url>" },
      { status: 400 },
    );
  }

  const skipScrape = reqUrl.searchParams.get("noscrape") === "1";

  const before = await queryFbCache(target, token);
  const ourServer = await fetchOurServerResponse(target);

  let scrapeResult: Awaited<ReturnType<typeof scrapeFb>> | null = null;
  let after: Awaited<ReturnType<typeof queryFbCache>> | null = null;

  if (!skipScrape) {
    scrapeResult = await scrapeFb(target, token);
    // Brief delay so FB's cache layer settles
    await new Promise((r) => setTimeout(r, 1000));
    after = await queryFbCache(target, token);
  }

  return NextResponse.json({
    target,
    before: {
      httpStatus: before.httpStatus,
      body: before.body,
      summary: {
        ogImage: before.body?.og_object?.image,
        updatedTime: before.body?.og_object?.updated_time,
        ogId: before.body?.og_object?.id,
      },
    },
    scrape: scrapeResult && {
      httpStatus: scrapeResult.httpStatus,
      body: scrapeResult.body,
    },
    after: after && {
      httpStatus: after.httpStatus,
      body: after.body,
      summary: {
        ogImage: after.body?.og_object?.image,
        updatedTime: after.body?.og_object?.updated_time,
        ogId: after.body?.og_object?.id,
      },
    },
    ourServer,
    diff: scrapeResult && after && {
      ogImageChanged:
        JSON.stringify(before.body?.og_object?.image) !==
        JSON.stringify(after.body?.og_object?.image),
      updatedTimeChanged:
        before.body?.og_object?.updated_time !==
        after.body?.og_object?.updated_time,
      ogIdChanged:
        before.body?.og_object?.id !== after.body?.og_object?.id,
    },
  });
}
