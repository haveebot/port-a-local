/**
 * Wheelhouse Glossary — Collie's interactive workspace storage.
 *
 * Aligns with the design in:
 *   Port A Local/Features/Wheelhouse Glossary — Collie Workspace.md
 *
 * Each entry = one PAL feature/product. Collie owns:
 *   - marketing_status (active / queued / parked / do-not-surface)
 *   - collaborator_notes (her annotations)
 *   - display_order (her sort)
 * Claude / codebase owns:
 *   - feature_name / one_liner / lives_at / notable_bullets
 *
 * Codebase-sync (auto-update of feature_name etc.) is deferred — for
 * v1 the seed is hand-curated and entries are updated manually. The
 * "pending review" bucket from the parking doc is also v2.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS wheelhouse_glossary_entries (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      feature_name TEXT NOT NULL,
      one_liner TEXT,
      lives_at TEXT,
      notable_bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
      marketing_status TEXT NOT NULL DEFAULT 'queued',
      collaborator_notes TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS glossary_category_order_idx ON wheelhouse_glossary_entries(category, display_order)`;
  _schemaReady = true;
}

export type MarketingStatus =
  | "active"
  | "queued"
  | "parked"
  | "do-not-surface";

export interface GlossaryEntry {
  id: string;
  category: string;
  featureName: string;
  oneLiner: string | null;
  livesAt: string | null;
  notableBullets: string[];
  marketingStatus: MarketingStatus;
  collaboratorNotes: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

function rowToRec(row: Record<string, unknown>): GlossaryEntry {
  return {
    id: row.id as string,
    category: row.category as string,
    featureName: row.feature_name as string,
    oneLiner: (row.one_liner as string) ?? null,
    livesAt: (row.lives_at as string) ?? null,
    notableBullets: Array.isArray(row.notable_bullets)
      ? (row.notable_bullets as string[])
      : [],
    marketingStatus: (row.marketing_status as MarketingStatus) ?? "queued",
    collaboratorNotes: (row.collaborator_notes as string) ?? null,
    displayOrder: Number(row.display_order ?? 0),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    updatedBy: (row.updated_by as string) ?? null,
  };
}

export async function getAllGlossaryEntries(): Promise<GlossaryEntry[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM wheelhouse_glossary_entries
      ORDER BY category, display_order, created_at
    `;
    return rows.map(rowToRec);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[glossary] getAllGlossaryEntries failed:", err);
    }
    return [];
  }
}

export async function getGlossaryEntry(id: string): Promise<GlossaryEntry | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM wheelhouse_glossary_entries WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

export interface UpsertGlossaryInput {
  id: string;
  category: string;
  featureName: string;
  oneLiner?: string;
  livesAt?: string;
  notableBullets?: string[];
  marketingStatus?: MarketingStatus;
  collaboratorNotes?: string | null;
  displayOrder?: number;
  updatedBy?: string;
}

/**
 * Upsert by id. INSERT-only fields preserved if entry already exists
 * (collaborator_notes, marketing_status, display_order are NEVER
 * overwritten by upsert — those are Collie's domain).
 */
export async function upsertGlossaryEntry(
  input: UpsertGlossaryInput,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO wheelhouse_glossary_entries (
      id, category, feature_name, one_liner, lives_at,
      notable_bullets, marketing_status, collaborator_notes,
      display_order, updated_at, updated_by
    ) VALUES (
      ${input.id},
      ${input.category},
      ${input.featureName},
      ${input.oneLiner ?? null},
      ${input.livesAt ?? null},
      ${JSON.stringify(input.notableBullets ?? [])}::jsonb,
      ${input.marketingStatus ?? "queued"},
      ${input.collaboratorNotes ?? null},
      ${input.displayOrder ?? 0},
      ${now},
      ${input.updatedBy ?? null}
    )
    ON CONFLICT (id) DO UPDATE
    SET category = EXCLUDED.category,
        feature_name = EXCLUDED.feature_name,
        one_liner = EXCLUDED.one_liner,
        lives_at = EXCLUDED.lives_at,
        notable_bullets = EXCLUDED.notable_bullets,
        updated_at = EXCLUDED.updated_at,
        updated_by = EXCLUDED.updated_by
        -- NOTE: marketing_status, collaborator_notes, display_order
        -- intentionally NOT overwritten — those are Collie's domain.
  `;
}

/** Update collaborator-owned fields only (status, notes). */
export async function updateGlossaryCollaboratorFields(
  id: string,
  fields: {
    marketingStatus?: MarketingStatus;
    collaboratorNotes?: string | null;
  },
  updatedBy: string,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  if (fields.marketingStatus !== undefined && fields.collaboratorNotes !== undefined) {
    await sql`
      UPDATE wheelhouse_glossary_entries
      SET marketing_status = ${fields.marketingStatus},
          collaborator_notes = ${fields.collaboratorNotes},
          updated_at = ${now},
          updated_by = ${updatedBy}
      WHERE id = ${id}
    `;
  } else if (fields.marketingStatus !== undefined) {
    await sql`
      UPDATE wheelhouse_glossary_entries
      SET marketing_status = ${fields.marketingStatus},
          updated_at = ${now},
          updated_by = ${updatedBy}
      WHERE id = ${id}
    `;
  } else if (fields.collaboratorNotes !== undefined) {
    await sql`
      UPDATE wheelhouse_glossary_entries
      SET collaborator_notes = ${fields.collaboratorNotes},
          updated_at = ${now},
          updated_by = ${updatedBy}
      WHERE id = ${id}
    `;
  }
}

/**
 * Move an entry up or down within its category. Uses display_order
 * swap with adjacent entry. Both rows update in a single transaction.
 */
export async function moveGlossaryEntry(
  id: string,
  direction: "up" | "down",
  updatedBy: string,
): Promise<void> {
  await ensureSchema();
  const entry = await getGlossaryEntry(id);
  if (!entry) return;
  const cmp = direction === "up" ? "<" : ">";
  const orderDir = direction === "up" ? "DESC" : "ASC";
  const { rows } = await sql.query(
    `SELECT id, display_order FROM wheelhouse_glossary_entries
     WHERE category = $1 AND display_order ${cmp} $2
     ORDER BY display_order ${orderDir} LIMIT 1`,
    [entry.category, entry.displayOrder],
  );
  const neighbor = rows[0] as { id: string; display_order: number } | undefined;
  if (!neighbor) return;
  const now = new Date().toISOString();
  // Two-step swap (no transaction needed; momentary inconsistency is ok)
  await sql`
    UPDATE wheelhouse_glossary_entries
    SET display_order = ${neighbor.display_order}, updated_at = ${now}, updated_by = ${updatedBy}
    WHERE id = ${id}
  `;
  await sql`
    UPDATE wheelhouse_glossary_entries
    SET display_order = ${entry.displayOrder}, updated_at = ${now}, updated_by = ${updatedBy}
    WHERE id = ${neighbor.id}
  `;
}

/**
 * Bulk seed (idempotent — only inserts missing entries; preserves
 * any existing collaborator state). Called once on first page load
 * if the table is empty.
 */
export async function seedGlossaryIfEmpty(
  entries: UpsertGlossaryInput[],
): Promise<{ seeded: number }> {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM wheelhouse_glossary_entries`;
  const existing = Number(rows[0]?.n ?? 0);
  if (existing > 0) return { seeded: 0 };
  for (const e of entries) {
    await upsertGlossaryEntry(e);
  }
  return { seeded: entries.length };
}
