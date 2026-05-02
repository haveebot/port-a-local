/**
 * Social post queue — every auto-triggered post lands here in PENDING
 * status. Wheelhouse /social review queue lets the operator
 * Send / Edit / Skip before it fires to Meta. Once approved + sent,
 * stores the FB/IG post ID for delete-after capability.
 *
 * Per Winston 2026-04-30: full FB automation, review queue first
 * (auto-fire later once template trust earned). FB primary, IG
 * secondary, X later. "Posts per day plus all available features
 * = steady stream of content."
 *
 * Trigger types:
 *   - event_published       New event added to events.ts (manual)
 *   - event_milestone_30d   30 days before event start
 *   - event_milestone_14d   14 days
 *   - event_milestone_7d    7 days
 *   - event_milestone_1d    Day before
 *   - event_today           Day of
 *   - event_wrap            Day after end
 *   - heritage_published    New Heritage piece
 *   - dispatch_published    New Dispatch piece
 *   - business_added        New directory listing (curated subset)
 *   - manual                Hand-queued from Wheelhouse
 *
 * Channels: facebook (always), instagram (if linked), twitter (later).
 * One queue row = one (channel × post). A trigger usually creates 1-2
 * rows (FB + IG) so each can be approved/edited independently.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS social_post_queue (
      id BIGSERIAL PRIMARY KEY,
      trigger_type TEXT NOT NULL,
      trigger_ref TEXT,
      channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      caption TEXT NOT NULL,
      link_url TEXT,
      image_url TEXT,
      scheduled_for TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      sent_by TEXT,
      external_post_id TEXT,
      external_post_url TEXT,
      error_msg TEXT,
      metadata JSONB
    )
  `;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS auto_send_at TIMESTAMPTZ`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0`;
  // FB Marketing API boost columns. boost_status: 'none' (default) | 'stub'
  // | 'active' | 'complete' | 'failed' | 'disabled' (operator skip).
  // boost_insights stores the full Marketing-API response so we can extract
  // reach/impressions/clicks/CTR/demographics later without re-pulling.
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_status TEXT DEFAULT 'none'`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_campaign_id TEXT`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_adset_id TEXT`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_ad_id TEXT`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_creative_id TEXT`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_spend_cents INTEGER`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_created_at TIMESTAMPTZ`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_insights_synced_at TIMESTAMPTZ`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_insights JSONB`;
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS boost_error TEXT`;
  // FB deletion tracking. When a post is deleted on FB (manual cleanup, OG-bug
  // refire cycle, etc.), our DB still has it as 'sent' until we notice. The
  // /api/cron/social-removed-sweep cron polls FB and stamps this when the
  // Graph API returns "Object does not exist" for an externalPostId. UI fades
  // these rows + hides the 🚀 boost button.
  await sql`ALTER TABLE social_post_queue ADD COLUMN IF NOT EXISTS removed_from_fb_at TIMESTAMPTZ`;
  await sql`CREATE INDEX IF NOT EXISTS social_post_status_idx ON social_post_queue(status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS social_post_trigger_idx ON social_post_queue(trigger_type, trigger_ref, channel)`;
  await sql`CREATE INDEX IF NOT EXISTS social_post_auto_send_idx ON social_post_queue(status, auto_send_at) WHERE auto_send_at IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS social_post_pending_order_idx ON social_post_queue(status, display_order) WHERE status = 'pending'`;
  await sql`CREATE INDEX IF NOT EXISTS social_post_boost_active_idx ON social_post_queue(boost_status, boost_created_at) WHERE boost_status = 'active'`;
  // Backfill display_order for existing rows that have it at default 0 —
  // idempotent (no-op once set). Mirrors the row id so the natural sort
  // preserves existing order without disturbing already-reordered rows.
  await sql`UPDATE social_post_queue SET display_order = id WHERE display_order = 0`;
  _schemaReady = true;
}

export type PostChannel = "facebook" | "instagram" | "twitter";
export type PostStatus = "pending" | "sent" | "skipped" | "failed";
/**
 * FB Marketing API boost lifecycle:
 *   none      — default, no boost ever requested
 *   stub      — boost requested but META_AD_ACCOUNT_ID unset (logged only)
 *   active    — campaign+adset+ad created, currently spending
 *   complete  — boost duration ended, final insights synced
 *   failed    — Marketing API rejected the request, see boost_error
 *   disabled  — operator opted out (won't auto-fire even if global flag on)
 */
export type BoostStatus =
  | "none"
  | "stub"
  | "active"
  | "complete"
  | "failed"
  | "disabled";
export type TriggerType =
  | "event_published"
  | "event_milestone_30d"
  | "event_milestone_14d"
  | "event_milestone_7d"
  | "event_milestone_1d"
  | "event_today"
  | "event_wrap"
  | "heritage_published"
  | "dispatch_published"
  | "business_added"
  | "glossary_active"
  | "manual";

export interface SocialPost {
  id: number;
  triggerType: TriggerType;
  triggerRef: string | null;
  channel: PostChannel;
  status: PostStatus;
  caption: string;
  linkUrl: string | null;
  imageUrl: string | null;
  scheduledFor: string | null;
  /**
   * If set, the social-auto-send cron will fire this post when NOW >= autoSendAt.
   * Operator-set in /wheelhouse/social. NULL = manual-only.
   */
  autoSendAt: string | null;
  /**
   * Operator-controlled order within the pending list. Lower = earlier.
   * Defaults to row id; ↑/↓ buttons in the UI swap this with the
   * adjacent pending row.
   */
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  sentBy: string | null;
  externalPostId: string | null;
  externalPostUrl: string | null;
  errorMsg: string | null;
  metadata: Record<string, unknown> | null;
  // Boost lifecycle — populated after POST /api/wheelhouse/social/boost
  // creates a Marketing API campaign+adset+ad on this post.
  boostStatus: BoostStatus;
  boostCampaignId: string | null;
  boostAdsetId: string | null;
  boostAdId: string | null;
  boostCreativeId: string | null;
  boostSpendCents: number | null;
  boostCreatedAt: string | null;
  boostInsightsSyncedAt: string | null;
  boostInsights: Record<string, unknown> | null;
  boostError: string | null;
  /** ISO timestamp set by sweep cron when FB Graph API returns "doesn't exist" for the externalPostId */
  removedFromFbAt: string | null;
}

function rowToPost(row: Record<string, unknown>): SocialPost {
  return {
    id: Number(row.id),
    triggerType: row.trigger_type as TriggerType,
    triggerRef: (row.trigger_ref as string) ?? null,
    channel: row.channel as PostChannel,
    status: row.status as PostStatus,
    caption: row.caption as string,
    linkUrl: (row.link_url as string) ?? null,
    imageUrl: (row.image_url as string) ?? null,
    scheduledFor: row.scheduled_for
      ? new Date(row.scheduled_for as string).toISOString()
      : null,
    autoSendAt: row.auto_send_at
      ? new Date(row.auto_send_at as string).toISOString()
      : null,
    displayOrder: Number(row.display_order ?? 0),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    sentAt: row.sent_at
      ? new Date(row.sent_at as string).toISOString()
      : null,
    sentBy: (row.sent_by as string) ?? null,
    externalPostId: (row.external_post_id as string) ?? null,
    externalPostUrl: (row.external_post_url as string) ?? null,
    errorMsg: (row.error_msg as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
    boostStatus: (row.boost_status as BoostStatus) ?? "none",
    boostCampaignId: (row.boost_campaign_id as string) ?? null,
    boostAdsetId: (row.boost_adset_id as string) ?? null,
    boostAdId: (row.boost_ad_id as string) ?? null,
    boostCreativeId: (row.boost_creative_id as string) ?? null,
    boostSpendCents:
      row.boost_spend_cents !== null && row.boost_spend_cents !== undefined
        ? Number(row.boost_spend_cents)
        : null,
    boostCreatedAt: row.boost_created_at
      ? new Date(row.boost_created_at as string).toISOString()
      : null,
    boostInsightsSyncedAt: row.boost_insights_synced_at
      ? new Date(row.boost_insights_synced_at as string).toISOString()
      : null,
    boostInsights: (row.boost_insights as Record<string, unknown>) ?? null,
    boostError: (row.boost_error as string) ?? null,
    removedFromFbAt: row.removed_from_fb_at
      ? new Date(row.removed_from_fb_at as string).toISOString()
      : null,
  };
}

export interface QueueParams {
  triggerType: TriggerType;
  triggerRef?: string | null;
  channel: PostChannel;
  caption: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  scheduledFor?: Date | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Idempotency: if a row already exists for the same
 * (trigger_type, trigger_ref, channel) tuple in PENDING or SENT
 * status, return that row instead of inserting a new one. Prevents
 * the milestone cron from queuing duplicate "7 days out" posts on
 * subsequent runs.
 */
export async function queuePost(p: QueueParams): Promise<SocialPost> {
  await ensureSchema();
  if (p.triggerRef) {
    const existing = await sql`
      SELECT * FROM social_post_queue
      WHERE trigger_type = ${p.triggerType}
        AND trigger_ref = ${p.triggerRef}
        AND channel = ${p.channel}
        AND status IN ('pending', 'sent')
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (existing.rows.length > 0) {
      return rowToPost(existing.rows[0]);
    }
  }
  const result = await sql`
    INSERT INTO social_post_queue
      (trigger_type, trigger_ref, channel, caption, link_url, image_url, scheduled_for, metadata)
    VALUES
      (${p.triggerType}, ${p.triggerRef ?? null}, ${p.channel}, ${p.caption},
       ${p.linkUrl ?? null}, ${p.imageUrl ?? null},
       ${p.scheduledFor ? p.scheduledFor.toISOString() : null},
       ${p.metadata ? JSON.stringify(p.metadata) : null}::jsonb)
    RETURNING *
  `;
  return rowToPost(result.rows[0]);
}

export async function getPending(limit = 50): Promise<SocialPost[]> {
  await ensureSchema();
  const result = await sql`
    SELECT * FROM social_post_queue
    WHERE status = 'pending'
    ORDER BY
      display_order ASC,
      id ASC
    LIMIT ${limit}
  `;
  return result.rows.map(rowToPost);
}

/**
 * Jump a pending post to the top of the queue (display_order =
 * current_min - 10). Different from moveQueueEntry("up") — that
 * swaps with the immediate neighbor; this skips everything.
 * No-op if the post isn't pending or is already at the top.
 */
export async function moveQueueEntryToTop(id: number): Promise<void> {
  await ensureSchema();
  const entry = await getById(id);
  if (!entry || entry.status !== "pending") return;
  const { rows } = await sql`
    SELECT MIN(display_order) AS min_order
    FROM social_post_queue
    WHERE status = 'pending' AND id != ${id}
  `;
  const minOrder = rows[0]?.min_order;
  if (minOrder === null || minOrder === undefined) return; // only post in queue
  const newOrder = Number(minOrder) - 10;
  await sql`
    UPDATE social_post_queue
    SET display_order = ${newOrder}, updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
  `;
}

/**
 * Swap a pending post with the adjacent pending row (up or down) by
 * display_order. Mirrors moveGlossaryEntry's two-step swap pattern.
 * Operator clicks ↑/↓ on a SocialPostCard.
 *
 * If there's no neighbor in that direction (already first / last),
 * no-op silently. Status filter restricts to pending so a sent row
 * doesn't intervene in the swap chain.
 */
export async function moveQueueEntry(
  id: number,
  direction: "up" | "down",
): Promise<void> {
  await ensureSchema();
  const entry = await getById(id);
  if (!entry) return;
  if (entry.status !== "pending") return;
  const cmp = direction === "up" ? "<" : ">";
  const orderDir = direction === "up" ? "DESC" : "ASC";
  const { rows } = await sql.query(
    `SELECT id, display_order FROM social_post_queue
     WHERE status = 'pending' AND display_order ${cmp} $1
     ORDER BY display_order ${orderDir} LIMIT 1`,
    [entry.displayOrder],
  );
  const neighbor = rows[0] as
    | { id: string | number; display_order: number }
    | undefined;
  if (!neighbor) return;
  const neighborId = Number(neighbor.id);
  await sql`
    UPDATE social_post_queue
    SET display_order = ${neighbor.display_order}, updated_at = NOW()
    WHERE id = ${id}
  `;
  await sql`
    UPDATE social_post_queue
    SET display_order = ${entry.displayOrder}, updated_at = NOW()
    WHERE id = ${neighborId}
  `;
}

export async function getRecent(
  limit = 30,
  status?: PostStatus,
): Promise<SocialPost[]> {
  await ensureSchema();
  if (status) {
    const result = await sql`
      SELECT * FROM social_post_queue
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows.map(rowToPost);
  }
  const result = await sql`
    SELECT * FROM social_post_queue
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result.rows.map(rowToPost);
}

export async function getById(id: number): Promise<SocialPost | null> {
  await ensureSchema();
  const result = await sql`
    SELECT * FROM social_post_queue WHERE id = ${id}
  `;
  return result.rows.length > 0 ? rowToPost(result.rows[0]) : null;
}

export interface UpdateCaptionParams {
  id: number;
  caption: string;
}

export async function updateCaption(p: UpdateCaptionParams): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET caption = ${p.caption}, updated_at = NOW()
    WHERE id = ${p.id} AND status = 'pending'
  `;
}

export interface MarkSentParams {
  id: number;
  sentBy: string;
  externalPostId: string;
  externalPostUrl?: string | null;
}

export async function markSent(p: MarkSentParams): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET status = 'sent',
        sent_at = NOW(),
        sent_by = ${p.sentBy},
        external_post_id = ${p.externalPostId},
        external_post_url = ${p.externalPostUrl ?? null},
        error_msg = NULL,
        updated_at = NOW()
    WHERE id = ${p.id}
  `;
}

export async function markSkipped(id: number, sentBy: string): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET status = 'skipped',
        sent_by = ${sentBy},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function markFailed(id: number, errorMsg: string): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET status = 'failed',
        error_msg = ${errorMsg.slice(0, 500)},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

/**
 * Duplicate a sent/skipped/failed post back into pending. Used by the
 * Resend button on the Recent list — operator-side fix when a post was
 * sent but needs to be redone (e.g. broken FB OG cache, deleted on FB,
 * caption typo caught after send). Always creates a new row (never
 * idempotent against the source) so resend-after-resend works.
 */
export async function duplicatePost(sourceId: number): Promise<SocialPost | null> {
  await ensureSchema();
  const src = await getById(sourceId);
  if (!src) return null;
  const stamp = Date.now().toString(36);
  const newRef = src.triggerRef
    ? `${src.triggerRef}:resend-${stamp}`
    : `resend-${stamp}`;
  const result = await sql`
    INSERT INTO social_post_queue
      (trigger_type, trigger_ref, channel, caption, link_url, image_url, metadata)
    VALUES
      ('manual', ${newRef}, ${src.channel}, ${src.caption},
       ${src.linkUrl}, ${src.imageUrl},
       ${JSON.stringify({ resend_of: sourceId })}::jsonb)
    RETURNING *
  `;
  return rowToPost(result.rows[0]);
}

/**
 * Set or clear the custom image URL on a pending post. When set, the
 * Send path uses Facebook PHOTO mode (POST /photos with url+caption)
 * instead of LINK mode (POST /feed with message+link). Operator picks
 * via the /wheelhouse/social UI's image-mode toggle.
 */
export async function setImageUrl(
  id: number,
  urlOrNull: string | null,
): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET image_url = ${urlOrNull}, updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
  `;
}

/**
 * Set or clear the auto-send time on a pending post. Pass null to revert
 * to manual-only. No-ops on non-pending posts (status check).
 */
export async function setAutoSendAt(
  id: number,
  isoOrNull: string | null,
): Promise<void> {
  await ensureSchema();
  if (isoOrNull === null) {
    await sql`
      UPDATE social_post_queue
      SET auto_send_at = NULL, updated_at = NOW()
      WHERE id = ${id} AND status = 'pending'
    `;
    return;
  }
  await sql`
    UPDATE social_post_queue
    SET auto_send_at = ${isoOrNull}::timestamptz, updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
  `;
}

/**
 * Pick up pending posts whose auto_send_at is in the past — the
 * /api/cron/social-auto-send cron loops over these and fires them.
 * Limit prevents a single cron run from overwhelming Meta if a
 * batch of scheduled times all came due at once.
 */
export async function getDueForAutoSend(limit = 25): Promise<SocialPost[]> {
  await ensureSchema();
  const result = await sql`
    SELECT * FROM social_post_queue
    WHERE status = 'pending'
      AND auto_send_at IS NOT NULL
      AND auto_send_at <= NOW()
    ORDER BY auto_send_at ASC
    LIMIT ${limit}
  `;
  return result.rows.map(rowToPost);
}

export interface QueueStats {
  pending: number;
  sent24h: number;
  failed7d: number;
  totalSent: number;
}

export async function getStats(): Promise<QueueStats> {
  await ensureSchema();
  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS sent_24h,
      COUNT(*) FILTER (WHERE status = 'failed' AND updated_at >= NOW() - INTERVAL '7 days')::int AS failed_7d,
      COUNT(*) FILTER (WHERE status = 'sent')::int AS total_sent
    FROM social_post_queue
  `;
  const row = result.rows[0] ?? {};
  return {
    pending: Number(row.pending ?? 0),
    sent24h: Number(row.sent_24h ?? 0),
    failed7d: Number(row.failed_7d ?? 0),
    totalSent: Number(row.total_sent ?? 0),
  };
}

/**
 * Mark a post as having a boost in flight. Status transitions to 'active'
 * (real campaign created) or 'stub' (META_AD_ACCOUNT_ID unset, logged-only).
 */
export async function markBoostCreated(p: {
  id: number;
  status: BoostStatus;
  campaignId?: string | null;
  adsetId?: string | null;
  adId?: string | null;
  creativeId?: string | null;
  spendCents?: number | null;
}): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET boost_status = ${p.status},
        boost_campaign_id = ${p.campaignId ?? null},
        boost_adset_id = ${p.adsetId ?? null},
        boost_ad_id = ${p.adId ?? null},
        boost_creative_id = ${p.creativeId ?? null},
        boost_spend_cents = ${p.spendCents ?? null},
        boost_created_at = NOW(),
        boost_error = NULL,
        updated_at = NOW()
    WHERE id = ${p.id}
  `;
}

export async function markBoostFailed(
  id: number,
  error: string,
): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET boost_status = 'failed',
        boost_error = ${error},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function markBoostInsights(p: {
  id: number;
  status: BoostStatus;
  insights: Record<string, unknown>;
  spendCents?: number | null;
}): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET boost_status = ${p.status},
        boost_insights = ${JSON.stringify(p.insights)}::jsonb,
        boost_insights_synced_at = NOW(),
        boost_spend_cents = ${p.spendCents ?? null},
        updated_at = NOW()
    WHERE id = ${p.id}
  `;
}

/**
 * Set boost_status to 'disabled' (operator opts this post OUT of any future
 * auto-boost). Idempotent.
 */
export async function disableBoost(id: number): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET boost_status = 'disabled', updated_at = NOW()
    WHERE id = ${id} AND boost_status = 'none'
  `;
}

/**
 * Mark a post as deleted on FB (Graph API returned "Object does not exist"
 * for its externalPostId). Idempotent — sets removed_from_fb_at to NOW only
 * if it's currently NULL.
 */
export async function markRemovedFromFb(id: number): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE social_post_queue
    SET removed_from_fb_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND removed_from_fb_at IS NULL
  `;
}

/**
 * All sent posts with an externalPostId that haven't been marked as removed
 * yet. Used by the sweep cron + manual cleanup endpoint to check FB existence.
 */
export async function getSentPostsToCheck(): Promise<SocialPost[]> {
  await ensureSchema();
  const result = await sql`
    SELECT * FROM social_post_queue
    WHERE status = 'sent'
      AND external_post_id IS NOT NULL
      AND external_post_id NOT LIKE 'stub:%'
      AND removed_from_fb_at IS NULL
    ORDER BY sent_at DESC
    LIMIT 100
  `;
  return result.rows.map(rowToPost);
}

/**
 * Active boosts due for an insights pull — boost is 'active' AND was created
 * more than 1 hour ago (gives Meta time to populate metrics) AND was either
 * never synced OR last synced > 1hr ago.
 */
export async function getActiveBoosts(): Promise<SocialPost[]> {
  await ensureSchema();
  const result = await sql`
    SELECT * FROM social_post_queue
    WHERE boost_status = 'active'
      AND boost_created_at IS NOT NULL
      AND boost_created_at < NOW() - INTERVAL '1 hour'
      AND (
        boost_insights_synced_at IS NULL
        OR boost_insights_synced_at < NOW() - INTERVAL '1 hour'
      )
    ORDER BY boost_created_at ASC
    LIMIT 50
  `;
  return result.rows.map(rowToPost);
}
