/**
 * PAL Locals → Wheelhouse mirror.
 *
 * Mirrors the deliverDispatch + Pulse pattern: every Locals event
 * (inquiry from a customer, signup from a provider) appends a markdown
 * message into a pinned "PAL Locals" thread so the ops team sees it
 * via the activity ticker without a separate dashboard.
 */

import { sql as vercelSql } from "@vercel/postgres";
import { createMessage } from "@/data/wheelhouse-store";

const LOCALS_TAG = "locals";
const LOCALS_TITLE = "PAL Locals — inquiries + signups";

async function findOrCreateLocalsThread(): Promise<string> {
  const { rows } = await vercelSql`
    SELECT id FROM wheelhouse_threads
    WHERE tags ? ${LOCALS_TAG}
    ORDER BY created_at ASC
    LIMIT 1
  `;
  if (rows[0]) return rows[0].id as string;

  const id = `thread-locals-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const participants = [
    "winston",
    "collie",
    "nick",
    "winston-claude",
    "collie-claude",
    "nick-claude",
  ];
  await vercelSql`
    INSERT INTO wheelhouse_threads (
      id, title, tags, state, participants, author_id,
      created_at, updated_at, context, pinned
    ) VALUES (
      ${id},
      ${LOCALS_TITLE},
      ${JSON.stringify([LOCALS_TAG])}::jsonb,
      'open',
      ${JSON.stringify(participants)}::jsonb,
      'winston-claude',
      ${now},
      ${now},
      NULL,
      true
    )
  `;
  return id;
}

export interface LocalsMirrorInput {
  kind: "inquiry" | "offer";
  name: string;
  phone: string;
  email?: string;
  category?: string;
  mode?: string;
  listingId?: string;
  when?: string;
  pricing?: string;
  availability?: string;
  details: string;
}

export async function mirrorLocalsInquiryToWheelhouse(
  i: LocalsMirrorInput,
): Promise<void> {
  try {
    const threadId = await findOrCreateLocalsThread();
    const titleVerb =
      i.kind === "inquiry" ? "Inquiry" : "Provider signup";
    const lines = [
      `**${titleVerb}** — ${i.name}`,
      "",
      `**Phone:** ${i.phone}`,
      ...(i.email ? [`**Email:** ${i.email}`] : []),
      ...(i.category
        ? [`**Category:** ${i.category}${i.mode ? ` (${i.mode})` : ""}`]
        : []),
      ...(i.listingId ? [`**Listing:** \`${i.listingId}\``] : []),
      ...(i.when ? [`**When:** ${i.when}`] : []),
      ...(i.pricing ? [`**Pricing:** ${i.pricing}`] : []),
      ...(i.availability ? [`**Availability:** ${i.availability}`] : []),
      "",
      i.kind === "inquiry"
        ? `**They need:**`
        : `**Description:**`,
      i.details,
    ];
    await createMessage({
      threadId,
      authorId: "winston-claude",
      type: i.kind === "inquiry" ? "request" : "fyi",
      body: lines.join("\n"),
    });
  } catch (err) {
    console.error("[locals mirror] failed:", err);
  }
}
