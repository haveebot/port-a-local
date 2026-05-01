/**
 * PAL image library — single source of truth for any image asset
 * (social posts, future Dispatch covers, Heritage heroes, brand
 * collateral). Backed by Vercel Blob (public URLs); this DB table is
 * the catalog with operator-editable metadata + usage tracking.
 *
 * Two entry points, one store:
 *   - Direct upload at /wheelhouse/library
 *   - Upload from a social post card (writes to library + selects on post)
 *
 * Soft delete: hidden=true marks an image gone from the picker but
 * keeps the row + Blob intact, since FB posts that already shipped
 * still need the URL to live.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS pal_image_library (
      id BIGSERIAL PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      pathname TEXT,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      usage_count INTEGER NOT NULL DEFAULT 0,
      last_used_at TIMESTAMPTZ,
      hidden BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pal_image_library_visible_idx ON pal_image_library(hidden, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS pal_image_library_url_idx ON pal_image_library(url)`;
  _schemaReady = true;
}

export interface LibraryImage {
  id: number;
  url: string;
  pathname: string | null;
  filename: string;
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  hidden: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
}

function rowToImage(row: Record<string, unknown>): LibraryImage {
  return {
    id: Number(row.id),
    url: row.url as string,
    pathname: (row.pathname as string) ?? null,
    filename: row.filename as string,
    contentType: row.content_type as string,
    sizeBytes: Number(row.size_bytes ?? 0),
    width: row.width != null ? Number(row.width) : null,
    height: row.height != null ? Number(row.height) : null,
    altText: (row.alt_text as string) ?? null,
    usageCount: Number(row.usage_count ?? 0),
    lastUsedAt: row.last_used_at
      ? new Date(row.last_used_at as string).toISOString()
      : null,
    hidden: row.hidden === true,
    createdAt: new Date(row.created_at as string).toISOString(),
    createdBy: (row.created_by as string) ?? null,
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export interface InsertImageInput {
  url: string;
  pathname?: string | null;
  filename: string;
  contentType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  createdBy?: string | null;
}

/**
 * Insert a new image row. If a row with this URL already exists
 * (idempotency for re-uploads of identical content), returns existing.
 */
export async function insertImage(p: InsertImageInput): Promise<LibraryImage> {
  await ensureSchema();
  const existing = await sql`
    SELECT * FROM pal_image_library WHERE url = ${p.url} LIMIT 1
  `;
  if (existing.rows.length > 0) {
    return rowToImage(existing.rows[0]);
  }
  const result = await sql`
    INSERT INTO pal_image_library
      (url, pathname, filename, content_type, size_bytes, width, height, alt_text, created_by)
    VALUES
      (${p.url}, ${p.pathname ?? null}, ${p.filename}, ${p.contentType},
       ${p.sizeBytes}, ${p.width ?? null}, ${p.height ?? null},
       ${p.altText ?? null}, ${p.createdBy ?? null})
    RETURNING *
  `;
  return rowToImage(result.rows[0]);
}

export async function listImages(
  opts: { limit?: number; includeHidden?: boolean } = {},
): Promise<LibraryImage[]> {
  await ensureSchema();
  const limit = opts.limit ?? 200;
  if (opts.includeHidden) {
    const r = await sql`
      SELECT * FROM pal_image_library
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return r.rows.map(rowToImage);
  }
  const r = await sql`
    SELECT * FROM pal_image_library
    WHERE hidden = FALSE
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return r.rows.map(rowToImage);
}

export async function getImage(id: number): Promise<LibraryImage | null> {
  await ensureSchema();
  const r = await sql`SELECT * FROM pal_image_library WHERE id = ${id}`;
  return r.rows.length > 0 ? rowToImage(r.rows[0]) : null;
}

export async function findImageByUrl(url: string): Promise<LibraryImage | null> {
  await ensureSchema();
  const r = await sql`SELECT * FROM pal_image_library WHERE url = ${url} LIMIT 1`;
  return r.rows.length > 0 ? rowToImage(r.rows[0]) : null;
}

export async function updateImageAlt(id: number, altText: string | null): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE pal_image_library
    SET alt_text = ${altText}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

/**
 * Soft delete — hides from picker + library page but keeps the row +
 * Blob, since FB posts that already shipped still need the URL.
 * Restorable via setHidden(id, false).
 */
export async function setHidden(id: number, hidden: boolean): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE pal_image_library
    SET hidden = ${hidden}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

/**
 * Bump usage_count + last_used_at for the image with this URL.
 * Called when a post is sent with this image — gives the library page
 * "most-used" / "recently used" signal for organizing collateral.
 * No-op if no row matches (image was set on a post via direct URL,
 * not via the library).
 */
export async function recordImageUsed(url: string): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE pal_image_library
    SET usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE url = ${url}
  `;
}
