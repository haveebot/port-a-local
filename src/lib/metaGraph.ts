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

/**
 * Post to the FB Page feed. Two modes:
 *
 * - **Link mode** (default): POST /{page_id}/feed with message + link.
 *   FB scrapes the link's OG metadata for the preview card.
 *
 * - **Photo mode** (when imageUrl is set): POST /{page_id}/photos with
 *   url + caption. Higher organic reach historically; no link preview
 *   card (link still goes in caption text). Used when operator uploads
 *   a custom image.
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

  // LINK MODE — original behavior
  const params = new URLSearchParams();
  params.set("message", p.message);
  if (p.link) params.set("link", p.link);
  params.set("access_token", token);

  try {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
      method: "POST",
      body: params,
    });
    const data = (await res.json()) as { id?: string; error?: { message?: string } };
    if (!res.ok || !data.id) {
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
