/**
 * PAL Housekeeping → Wheelhouse mirror.
 *
 * Mirrors the localsDispatch + deliverDispatch pattern: every paid
 * housekeeping booking appends a markdown message into a pinned
 * "PAL Housekeeping" thread so ops see it via the activity ticker.
 *
 * v1 manual dispatch — Winston reads this thread, calls the cleaning
 * team, confirms the slot. v2 will fan out to the marketplace
 * (cart-rental pattern).
 */

import { sql as vercelSql } from "@vercel/postgres";
import { createMessage } from "@/data/wheelhouse-store";
import {
  formatUSD,
  type HousekeepingBooking,
} from "@/data/housekeeping-store";

const HK_TAG = "housekeeping";
const HK_TITLE = "PAL Housekeeping — paid bookings";

async function findOrCreateHousekeepingThread(): Promise<string> {
  const { rows } = await vercelSql`
    SELECT id FROM wheelhouse_threads
    WHERE tags ? ${HK_TAG}
    ORDER BY created_at ASC
    LIMIT 1
  `;
  if (rows[0]) return rows[0].id as string;

  const id = `thread-housekeeping-${Date.now().toString(36)}`;
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
      ${HK_TITLE},
      ${JSON.stringify([HK_TAG])}::jsonb,
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

export async function mirrorHousekeepingBookingToWheelhouse(
  b: HousekeepingBooking,
): Promise<void> {
  try {
    const threadId = await findOrCreateHousekeepingThread();
    const lines = [
      `**Paid booking** — ${b.customerName} · ${formatUSD(b.totalCents)}`,
      "",
      `**Phone:** ${b.customerPhone}`,
      `**Email:** ${b.customerEmail}`,
      "",
      `**Address:** ${b.propertyAddress}`,
      `**Sqft:** ${b.propertySqft.toLocaleString()}`,
      `**Estimated hours:** ${b.estimatedHours}`,
      ...(b.preferredDate ? [`**Preferred date:** ${b.preferredDate}`] : []),
      ...(b.preferredTime ? [`**Preferred time:** ${b.preferredTime}`] : []),
      ...(b.notes ? ["", `**Notes:**`, b.notes] : []),
      "",
      `Booking ID: \`${b.id}\``,
    ];
    await createMessage({
      threadId,
      authorId: "winston-claude",
      type: "fyi",
      body: lines.join("\n"),
    });
  } catch (err) {
    console.error("[housekeeping mirror] failed:", err);
  }
}
