/**
 * PAL vendor-pipeline → Wheelhouse mirror.
 *
 * Mirrors the localsDispatch pattern. Each vendor pipeline gets its own
 * pinned thread in the Wheelhouse so signups don't collide with the
 * existing /locals provider stream. Subject-line tags on admin email
 * separately handle Gmail filtering.
 *
 * Currently supports:
 *   - cart-vendor   → "PAL Carts — vendor pipeline" thread
 *   - restaurant    → "PAL Delivery — restaurant pipeline" thread
 *
 * Add a new kind: append a new entry to PIPELINES below + import the
 * new mirror function from your route handler.
 */

import { sql as vercelSql } from "@vercel/postgres";
import { createMessage } from "@/data/wheelhouse-store";

type PipelineKind = "cart-vendor" | "restaurant";

interface PipelineConfig {
  tag: string;
  title: string;
}

const PIPELINES: Record<PipelineKind, PipelineConfig> = {
  "cart-vendor": {
    tag: "cart-vendors",
    title: "PAL Carts — vendor pipeline",
  },
  restaurant: {
    tag: "restaurants",
    title: "PAL Delivery — restaurant pipeline",
  },
};

async function findOrCreatePipelineThread(
  kind: PipelineKind,
): Promise<string> {
  const cfg = PIPELINES[kind];
  const { rows } = await vercelSql`
    SELECT id FROM wheelhouse_threads
    WHERE tags ? ${cfg.tag}
    ORDER BY created_at ASC
    LIMIT 1
  `;
  if (rows[0]) return rows[0].id as string;

  const id = `thread-${cfg.tag}-${Date.now().toString(36)}`;
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
      ${cfg.title},
      ${JSON.stringify([cfg.tag])}::jsonb,
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

export interface CartVendorMirrorInput {
  businessName: string;
  contactName: string;
  phone: string;
  email?: string;
  fleetSummary: string;
  serviceArea?: string;
  handoff: "delivery" | "pickup" | "both";
  insuranceCarrier?: string;
  pricingApproach?: string;
  notes?: string;
}

export async function mirrorCartVendorSignup(
  i: CartVendorMirrorInput,
): Promise<void> {
  try {
    const threadId = await findOrCreatePipelineThread("cart-vendor");
    const lines = [
      `**Cart vendor signup** — ${i.businessName}`,
      "",
      `**Contact:** ${i.contactName}`,
      `**Phone:** ${i.phone}`,
      ...(i.email ? [`**Email:** ${i.email}`] : []),
      `**Handoff:** ${i.handoff}`,
      ...(i.serviceArea ? [`**Service area:** ${i.serviceArea}`] : []),
      ...(i.insuranceCarrier
        ? [`**Insurance:** ${i.insuranceCarrier}`]
        : []),
      ...(i.pricingApproach ? [`**Pricing:** ${i.pricingApproach}`] : []),
      "",
      `**Fleet:**`,
      i.fleetSummary,
      ...(i.notes ? ["", `**Notes:** ${i.notes}`] : []),
    ];
    await createMessage({
      threadId,
      authorId: "winston-claude",
      type: "fyi",
      body: lines.join("\n"),
    });
  } catch (err) {
    console.error("[cart vendor mirror] failed:", err);
  }
}

export interface RestaurantSignupMirrorInput {
  restaurantName: string;
  contactName: string;
  contactRole?: string;
  phone: string;
  email?: string;
  address: string;
  hoursSummary?: string;
  menuUrl?: string;
  posSystem?: string;
  notes?: string;
}

export async function mirrorRestaurantSignup(
  i: RestaurantSignupMirrorInput,
): Promise<void> {
  try {
    const threadId = await findOrCreatePipelineThread("restaurant");
    const lines = [
      `**Restaurant signup** — ${i.restaurantName}`,
      "",
      `**Contact:** ${i.contactName}${i.contactRole ? ` (${i.contactRole})` : ""}`,
      `**Phone:** ${i.phone}`,
      ...(i.email ? [`**Email:** ${i.email}`] : []),
      `**Address:** ${i.address}`,
      ...(i.hoursSummary ? [`**Hours:** ${i.hoursSummary}`] : []),
      ...(i.menuUrl ? [`**Menu:** ${i.menuUrl}`] : []),
      ...(i.posSystem ? [`**POS / order tech:** ${i.posSystem}`] : []),
      ...(i.notes ? ["", `**Notes:** ${i.notes}`] : []),
    ];
    await createMessage({
      threadId,
      authorId: "winston-claude",
      type: "fyi",
      body: lines.join("\n"),
    });
  } catch (err) {
    console.error("[restaurant signup mirror] failed:", err);
  }
}
