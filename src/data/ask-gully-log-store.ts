/**
 * Ask Gully analytics — every question that hits /api/gully/ask gets
 * logged here (anonymous, no PII). Two readers consume this:
 *
 * 1. Wheelhouse insights page (/wheelhouse/ask-gully) — shows top
 *    questions, content gaps (cited=0), top-cited businesses.
 * 2. Trending row on /gully + homepage — pulls top 3 most-asked
 *    questions from the last 24h (graceful-degrades to vetted chips
 *    when no data accumulated yet).
 *
 * Closes the tourist→ops loop: tourists tell us what they're searching
 * for, the gap report writes itself, Heritage/Dispatch fodder surfaces
 * naturally instead of getting invented.
 *
 * Privacy: query is the only field with potentially-identifying
 * content, but PAL's Ask Gully is server-rendered keyword search —
 * no auth, no session, no IP logged. The query alone is anonymous
 * by construction.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS ask_gully_log (
      id BIGSERIAL PRIMARY KEY,
      query TEXT NOT NULL,
      query_normalized TEXT NOT NULL,
      cited_count INTEGER NOT NULL DEFAULT 0,
      cited_slugs TEXT[] NOT NULL DEFAULT '{}',
      fuse_top_score NUMERIC(4,3),
      fallback_reason TEXT,
      inferred_category TEXT,
      answer_chars INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS ask_gully_log_created_idx ON ask_gully_log(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS ask_gully_log_normalized_idx ON ask_gully_log(query_normalized, created_at DESC)`;
  _schemaReady = true;
}

/**
 * Normalize a query for grouping: lowercase, collapse whitespace,
 * strip trailing punctuation. Keeps semantic content (so "what is
 * sandfest?" and "What Is Sandfest?" group together).
 */
export function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/[?!.,;:]+$/g, "")
    .replace(/\s+/g, " ");
}

export interface LogEntry {
  query: string;
  citedCount: number;
  citedSlugs: string[];
  fuseTopScore: number | null;
  fallbackReason: string | null;
  inferredCategory: string | null;
  answerChars: number | null;
}

export async function logAskGully(entry: LogEntry): Promise<void> {
  try {
    await ensureSchema();
    const norm = normalizeQuery(entry.query);
    await sql`
      INSERT INTO ask_gully_log
        (query, query_normalized, cited_count, cited_slugs, fuse_top_score, fallback_reason, inferred_category, answer_chars)
      VALUES
        (${entry.query}, ${norm}, ${entry.citedCount}, ${entry.citedSlugs as unknown as string}, ${entry.fuseTopScore}, ${entry.fallbackReason}, ${entry.inferredCategory}, ${entry.answerChars})
    `;
  } catch (err) {
    // Logging failure must not break the user-facing answer flow.
    console.error("[ask_gully_log] insert failed:", err);
  }
}

export interface TopQuestion {
  query: string;
  count: number;
  avgCited: number;
  lastAsked: string;
}

/**
 * Top N questions in the window (default 7 days), grouped by
 * normalized query. Excludes queries asked only once (noise floor).
 */
export async function getTopQuestions(
  windowDays = 7,
  limit = 10,
  minCount = 2,
): Promise<TopQuestion[]> {
  await ensureSchema();
  const result = await sql`
    SELECT
      query_normalized AS query,
      COUNT(*)::int AS count,
      AVG(cited_count)::numeric(10,2) AS avg_cited,
      MAX(created_at) AS last_asked
    FROM ask_gully_log
    WHERE created_at >= NOW() - (${windowDays} || ' days')::interval
    GROUP BY query_normalized
    HAVING COUNT(*) >= ${minCount}
    ORDER BY count DESC, last_asked DESC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => ({
    query: r.query as string,
    count: Number(r.count),
    avgCited: Number(r.avg_cited),
    lastAsked: new Date(r.last_asked as string).toISOString(),
  }));
}

export interface ContentGap {
  query: string;
  count: number;
  inferredCategory: string | null;
  lastAsked: string;
}

/**
 * Content gaps — questions in the window that consistently returned
 * cited=0 (Claude punted to portal-fallback). These are the questions
 * whose answers aren't in our index. Highest-priority Heritage/Dispatch
 * targets.
 */
export async function getContentGaps(
  windowDays = 14,
  limit = 15,
): Promise<ContentGap[]> {
  await ensureSchema();
  const result = await sql`
    SELECT
      query_normalized AS query,
      COUNT(*)::int AS count,
      MODE() WITHIN GROUP (ORDER BY inferred_category) AS inferred_category,
      MAX(created_at) AS last_asked
    FROM ask_gully_log
    WHERE created_at >= NOW() - (${windowDays} || ' days')::interval
      AND cited_count = 0
    GROUP BY query_normalized
    ORDER BY count DESC, last_asked DESC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => ({
    query: r.query as string,
    count: Number(r.count),
    inferredCategory: (r.inferred_category as string) ?? null,
    lastAsked: new Date(r.last_asked as string).toISOString(),
  }));
}

export interface BusinessCitation {
  slug: string;
  count: number;
}

/**
 * Most-cited businesses in the window — Ask Gully sent N customers
 * their way. Real marketing data per vendor.
 */
export async function getTopCitations(
  windowDays = 30,
  limit = 20,
): Promise<BusinessCitation[]> {
  await ensureSchema();
  const result = await sql`
    SELECT slug, COUNT(*)::int AS count
    FROM (
      SELECT UNNEST(cited_slugs) AS slug
      FROM ask_gully_log
      WHERE created_at >= NOW() - (${windowDays} || ' days')::interval
    ) sub
    GROUP BY slug
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => ({
    slug: r.slug as string,
    count: Number(r.count),
  }));
}

export interface AskGullyTotals {
  totalQuestions: number;
  uniqueQuestions: number;
  citedRate: number; // % with cited_count >= 1
  fallbackRate: number; // % with fallback_reason IS NOT NULL
}

export async function getTotals(windowDays = 7): Promise<AskGullyTotals> {
  await ensureSchema();
  const result = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(DISTINCT query_normalized)::int AS unique_count,
      COUNT(*) FILTER (WHERE cited_count >= 1)::int AS cited_total,
      COUNT(*) FILTER (WHERE fallback_reason IS NOT NULL)::int AS fallback_total
    FROM ask_gully_log
    WHERE created_at >= NOW() - (${windowDays} || ' days')::interval
  `;
  const row = result.rows[0] ?? {};
  const total = Number(row.total ?? 0);
  return {
    totalQuestions: total,
    uniqueQuestions: Number(row.unique_count ?? 0),
    citedRate: total > 0 ? Number(row.cited_total ?? 0) / total : 0,
    fallbackRate: total > 0 ? Number(row.fallback_total ?? 0) / total : 0,
  };
}

/**
 * Trending row data — top questions in the last 24h, with the original
 * (non-normalized) query text from the most recent ask. Used by the
 * /gully page + homepage to show "What people are asking right now."
 *
 * Returns empty array if not enough data accumulated. Caller falls back
 * to the static vetted-chip set in that case.
 */
export interface TrendingQuestion {
  query: string;
  count: number;
}
export async function getTrending(
  hours = 24,
  limit = 5,
  minCount = 2,
): Promise<TrendingQuestion[]> {
  await ensureSchema();
  const result = await sql`
    SELECT DISTINCT ON (query_normalized)
      query_normalized,
      query AS display_query,
      COUNT(*) OVER (PARTITION BY query_normalized)::int AS group_count,
      created_at
    FROM ask_gully_log
    WHERE created_at >= NOW() - (${hours} || ' hours')::interval
      AND cited_count >= 1
    ORDER BY query_normalized, created_at DESC
  `;
  const grouped = result.rows
    .map((r) => ({
      query: r.display_query as string,
      count: Number(r.group_count),
    }))
    .filter((r) => r.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return grouped;
}
