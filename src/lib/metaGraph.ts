/**
 * Meta Graph API wrapper — Facebook Page + Instagram Business posting.
 *
 * Stub mode: when META_PAGE_ACCESS_TOKEN is unset, the wrapper logs
 * what it would have posted and returns a fake-success response with
 * a "stub:" prefixed external_post_id. Lets us build + verify the
 * full review queue + UI flow before live tokens land.
 *
 * Phase 0 (Winston) provides:
 *   META_PAGE_ID                 — FB Page numeric ID
 *   META_PAGE_ACCESS_TOKEN       — long-lived Page token (60d → permanent)
 *   META_INSTAGRAM_ACCOUNT_ID    — IG Business Account ID (linked to Page)
 *
 * API references:
 *   FB Page feed:    POST /{page_id}/feed
 *                    {message, link, access_token}
 *   IG Business:     Two-step (1) POST /{ig_user_id}/media w/ image_url
 *                    + caption  (2) POST /{ig_user_id}/media_publish w/
 *                    creation_id. IG photo posts REQUIRE a public image_url
 *                    (FB scrapes OG fine but IG needs explicit image).
 */

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

export interface PostResult {
  ok: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
  stubbed?: boolean;
}

function getToken(): string | null {
  const t = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  return t.length > 0 ? t : null;
}

function getPageId(): string | null {
  const id = (process.env.META_PAGE_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

function getInstagramAccountId(): string | null {
  const id = (process.env.META_INSTAGRAM_ACCOUNT_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

export function isMetaConfigured(): {
  fb: boolean;
  ig: boolean;
} {
  const hasToken = !!getToken();
  return {
    fb: hasToken && !!getPageId(),
    ig: hasToken && !!getInstagramAccountId(),
  };
}

interface PostToFacebookParams {
  message: string;
  link?: string;
  /**
   * If set, post as a PHOTO (with caption) instead of a link card.
   * Photo mode: caption is the message, image_url uploaded to FB,
   * link goes in caption text only (no OG card preview).
   * Link mode (default): FB scrapes OG image from the link URL.
   */
  imageUrl?: string;
}

async function scrapeUrl(url: string, token: string): Promise<void> {
  const params = new URLSearchParams();
  params.set("id", url);
  params.set("scrape", "true");
  params.set("access_token", token);
  await fetch(`${GRAPH_BASE}/`, { method: "POST", body: params });
}

/**
 * Force FB to re-scrape a URL's OG metadata + og:image, BEFORE we use that
 * URL in a post. Without this, a post that links to a page whose OG was
 * recently changed gets a stale link card — FB caches OG per-URL, and
 * once a post snapshots that URL into a link card, the card is frozen.
 *
 * Two FB caches to bust, not one:
 *   1. Page URL → OG metadata cache. Refreshed by scraping the page URL.
 *   2. og:image URL → image bytes cache. Refreshed by scraping the
 *      EXACT og:image URL from the page HTML. Critical because Next.js's
 *      og:image URL hash (`?<hash>`) is build-stable — when underlying
 *      data changes but the route doesn't rebuild, the URL stays the
 *      same, FB sees same URL, FB serves cached bytes (which may be
 *      from a previous data state). The May 3 Sunday-slow-roll incident
 *      was caused by this: force-dynamic made our server return fresh
 *      PNG, but FB's image cache for the stable URL stayed stale across
 *      two re-fires.
 *
 * Failure on either step is non-fatal — we still post; worst case the
 * link card is stale on this one post.
 *
 * Small delay after gives FB's cache layer a beat to land the new OG
 * before the /feed call snapshots it.
 */
async function preScrapeLinkUrl(linkUrl: string, token: string): Promise<void> {
  // Step 1: scrape the page URL itself
  try {
    await scrapeUrl(linkUrl, token);
  } catch {
    // Non-fatal
  }

  // Step 2: fetch the page HTML, extract the og:image URL (with whatever
  // hash Next.js auto-appended), and scrape THAT URL too — the og:image
  // bytes cache is independent of the page metadata cache.
  try {
    const pageRes = await fetch(linkUrl, { cache: "no-store" });
    const html = await pageRes.text();
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    );
    if (ogImageMatch) {
      const ogImageUrl = ogImageMatch[1].replace(/&amp;/g, "&");
      await scrapeUrl(ogImageUrl, token);
    }
  } catch {
    // Non-fatal
  }

  // Brief grace period so FB's caches propagate before /feed snapshots
  await new Promise((r) => setTimeout(r, 500));
}

/**
 * Find a recently-published post on the Page that matches the given
 * message body. Defends against a Graph API race we hit 2026-05-19:
 * the /feed POST returns an error like "Please reduce the amount of
 * data you're asking for" AFTER the post has actually been created
 * (the downstream link-scrape step is what failed, not the post
 * itself). Without this check, callers mark the post failed → resend
 * → double-post on the feed.
 *
 * Strategy: query /{pageId}/feed?since=<unixSec>&limit=10 within the
 * race window and look for a post whose `message` matches verbatim.
 * Returns the matched post or null.
 */
async function findRecentMatchingPost(
  message: string,
  sinceUnixSec: number,
  pageId: string,
  token: string,
): Promise<{ id: string } | null> {
  try {
    const url = new URL(`${GRAPH_BASE}/${pageId}/feed`);
    url.searchParams.set("since", String(sinceUnixSec));
    url.searchParams.set("fields", "id,message,created_time");
    url.searchParams.set("limit", "10");
    url.searchParams.set("access_token", token);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: Array<{ id?: string; message?: string }>;
    };
    const trimmed = message.trim();
    const match = (data.data ?? []).find(
      (p) => typeof p.message === "string" && p.message.trim() === trimmed,
    );
    return match?.id ? { id: match.id } : null;
  } catch {
    return null;
  }
}

/**
 * Post to the FB Page feed. Two modes:
 *
 * - **Link mode** (default): POST /{page_id}/feed with message + link.
 *   FB scrapes the link's OG metadata for the preview card. Pre-scrape
 *   step forces a fresh OG fetch right before publish so the link card
 *   captures the latest title/image/description (vs. whatever FB had
 *   cached from a prior visit).
 *
 * - **Photo mode** (when imageUrl is set): POST /{page_id}/photos with
 *   url + caption. Higher organic reach historically; no link preview
 *   card (link still goes in caption text). Used when operator uploads
 *   a custom image.
 *
 * Both modes guard against the "post-created-but-API-errored" race
 * (see findRecentMatchingPost): on any non-OK response from the create
 * call, we query the Page's recent feed for a verbatim message match
 * before declaring failure. If found, return success with the matched
 * post ID — prevents the caller from resending into a duplicate.
 */
export async function postToFacebook(
  p: PostToFacebookParams,
): Promise<PostResult> {
  const token = getToken();
  const pageId = getPageId();

  if (!token || !pageId) {
    console.log("[metaGraph] FB stub mode — would post:", {
      mode: p.imageUrl ? "photo" : "link",
      message: p.message.slice(0, 80) + "…",
      link: p.link,
      imageUrl: p.imageUrl,
    });
    return {
      ok: true,
      stubbed: true,
      externalPostId: `stub:fb:${Date.now()}`,
      externalPostUrl: undefined,
    };
  }

  // PHOTO MODE — POST /{page_id}/photos with url + caption
  if (p.imageUrl) {
    const params = new URLSearchParams();
    params.set("url", p.imageUrl);
    params.set("caption", p.message);
    params.set("published", "true");
    params.set("access_token", token);
    // Capture race-window start BEFORE the create call so the recovery
    // query covers anything FB may have created between our request and
    // its error response.
    const sinceUnixSec = Math.floor(Date.now() / 1000) - 5;
    try {
      const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
        method: "POST",
        body: params,
      });
      const data = (await res.json()) as {
        id?: string;
        post_id?: string;
        error?: { message?: string };
      };
      if (!res.ok || !data.post_id) {
        // Recovery: FB sometimes returns an error after the post landed
        // (downstream step failed, post itself is live). Check the Page
        // feed before declaring failure → prevents double-posts.
        const recovered = await findRecentMatchingPost(
          p.message,
          sinceUnixSec,
          pageId,
          token,
        );
        if (recovered) {
          const postPath = recovered.id.includes("_")
            ? recovered.id.split("_")[1]
            : recovered.id;
          console.warn(
            `[metaGraph] PHOTO POST returned error but post ${recovered.id} exists — recovering as success.`,
            { error: data.error?.message },
          );
          return {
            ok: true,
            externalPostId: recovered.id,
            externalPostUrl: `https://www.facebook.com/${pageId}/posts/${postPath}`,
          };
        }
        return {
          ok: false,
          error:
            data.error?.message ?? `FB photo post failed (HTTP ${res.status})`,
        };
      }
      const postId = data.post_id;
      const postPath = postId.includes("_") ? postId.split("_")[1] : postId;
      return {
        ok: true,
        externalPostId: postId,
        externalPostUrl: `https://www.facebook.com/${pageId}/posts/${postPath}`,
      };
    } catch (err) {
      return {
        ok: false,
        error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // LINK MODE — pre-scrape the linkUrl so FB has fresh OG cached, THEN
  // post. Without this, a post whose linkUrl had its OG image updated
  // recently gets a stale link card (FB snapshots whatever it had
  // cached at /feed call time, not whatever the page currently serves).
  if (p.link) {
    await preScrapeLinkUrl(p.link, token);
  }
  const params = new URLSearchParams();
  params.set("message", p.message);
  if (p.link) params.set("link", p.link);
  params.set("access_token", token);

  // Capture race-window start BEFORE the create call so the recovery
  // query covers anything FB may have created between our request and
  // its error response.
  const sinceUnixSec = Math.floor(Date.now() / 1000) - 5;
  try {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
      method: "POST",
      body: params,
    });
    const data = (await res.json()) as { id?: string; error?: { message?: string } };
    if (!res.ok || !data.id) {
      // Recovery: FB sometimes returns an error after the post has
      // actually been published (the downstream link-scrape step is what
      // failed — repro 2026-05-19 with "Please reduce the amount of data
      // you're asking for"). Check the Page feed before declaring
      // failure → prevents the caller from resending into a duplicate.
      const recovered = await findRecentMatchingPost(
        p.message,
        sinceUnixSec,
        pageId,
        token,
      );
      if (recovered) {
        const postPath = recovered.id.includes("_")
          ? recovered.id.split("_")[1]
          : recovered.id;
        console.warn(
          `[metaGraph] FEED POST returned error but post ${recovered.id} exists — recovering as success.`,
          { error: data.error?.message },
        );
        return {
          ok: true,
          externalPostId: recovered.id,
          externalPostUrl: `https://www.facebook.com/${pageId}/posts/${postPath}`,
        };
      }
      return {
        ok: false,
        error: data.error?.message ?? `FB post failed (HTTP ${res.status})`,
      };
    }
    // FB returns "{page_id}_{post_id}" — that's the canonical post ID
    const postId = data.id;
    const postPath = postId.includes("_") ? postId.split("_")[1] : postId;
    return {
      ok: true,
      externalPostId: postId,
      externalPostUrl: `https://www.facebook.com/${pageId}/posts/${postPath}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Inspect a previously-published FB post — returns its current visibility,
 * privacy, targeting, and engagement metrics. Used by the Wheelhouse
 * diagnostic endpoint when an operator wants to know why a post isn't
 * visible to a specific viewer.
 */
export async function inspectFacebookPost(externalPostId: string): Promise<{
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const token = getToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };
  const fields = [
    "id",
    "is_published",
    "is_hidden",
    "is_expired",
    "privacy",
    "targeting",
    "feed_targeting",
    "permalink_url",
    "created_time",
    "shares",
    "reactions.summary(true)",
    "comments.summary(true)",
  ].join(",");
  try {
    const res = await fetch(
      `${GRAPH_BASE}/${externalPostId}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`,
    );
    const data = (await res.json()) as Record<string, unknown> & {
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        error:
          (data.error?.message as string | undefined) ?? `HTTP ${res.status}`,
      };
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

interface PostToInstagramParams {
  caption: string;
  imageUrl: string;
}

/**
 * Two-step IG publish flow. Image must be a public, FB-reachable URL
 * — feeding our /events/[slug]/opengraph-image works since it's
 * public + 1200×630 PNG (IG accepts square + landscape; landscape
 * gets cropped on feed to 1080×608, which is close to 1200×630
 * proportions — fine for our needs).
 */
export async function postToInstagram(
  p: PostToInstagramParams,
): Promise<PostResult> {
  const token = getToken();
  const igId = getInstagramAccountId();

  if (!token || !igId) {
    console.log("[metaGraph] IG stub mode — would post:", {
      caption: p.caption.slice(0, 80) + "…",
      imageUrl: p.imageUrl,
    });
    return {
      ok: true,
      stubbed: true,
      externalPostId: `stub:ig:${Date.now()}`,
    };
  }

  // Step 1: create media container
  const createParams = new URLSearchParams();
  createParams.set("image_url", p.imageUrl);
  createParams.set("caption", p.caption);
  createParams.set("access_token", token);

  let creationId: string;
  try {
    const createRes = await fetch(`${GRAPH_BASE}/${igId}/media`, {
      method: "POST",
      body: createParams,
    });
    const createData = (await createRes.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!createRes.ok || !createData.id) {
      return {
        ok: false,
        error:
          createData.error?.message ??
          `IG media create failed (HTTP ${createRes.status})`,
      };
    }
    creationId = createData.id;
  } catch (err) {
    return {
      ok: false,
      error: `IG create fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Step 2: publish container
  const publishParams = new URLSearchParams();
  publishParams.set("creation_id", creationId);
  publishParams.set("access_token", token);
  try {
    const pubRes = await fetch(`${GRAPH_BASE}/${igId}/media_publish`, {
      method: "POST",
      body: publishParams,
    });
    const pubData = (await pubRes.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!pubRes.ok || !pubData.id) {
      return {
        ok: false,
        error:
          pubData.error?.message ??
          `IG publish failed (HTTP ${pubRes.status})`,
      };
    }
    return {
      ok: true,
      externalPostId: pubData.id,
      externalPostUrl: `https://www.instagram.com/p/${pubData.id}/`,
    };
  } catch (err) {
    return {
      ok: false,
      error: `IG publish fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Self-check helper — calls /me on the token to verify it's valid +
 * authorized for the Page. Used by /api/social/test endpoint to give
 * Winston a green/red signal during Phase 0 setup.
 */
export async function pingMeta(): Promise<{
  ok: boolean;
  pageName?: string;
  error?: string;
  stubbed?: boolean;
}> {
  const token = getToken();
  const pageId = getPageId();
  if (!token || !pageId) {
    return { ok: false, stubbed: true, error: "META_PAGE_ACCESS_TOKEN or META_PAGE_ID not set" };
  }
  try {
    const res = await fetch(
      `${GRAPH_BASE}/${pageId}?fields=id,name&access_token=${encodeURIComponent(token)}`,
    );
    const data = (await res.json()) as {
      id?: string;
      name?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        error: data.error?.message ?? `HTTP ${res.status}`,
      };
    }
    return { ok: true, pageName: data.name };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
