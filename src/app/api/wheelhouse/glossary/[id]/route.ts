import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getGlossaryEntry,
  type MarketingStatus,
  moveGlossaryEntry,
  updateGlossaryCollaboratorFields,
} from "@/data/glossary-store";
import { queuePost } from "@/data/social-post-store";
import { glossaryActiveDraft } from "@/lib/socialPostTemplates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function authorize(req: NextRequest): Promise<string | null> {
  const who = (await cookies()).get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return null;
}

const VALID_STATUSES: MarketingStatus[] = [
  "active",
  "queued",
  "parked",
  "do-not-surface",
];

interface PatchBody {
  marketingStatus?: string;
  collaboratorNotes?: string | null;
  move?: "up" | "down";
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const who = await authorize(req);
  if (!who) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.move === "up" || body.move === "down") {
    await moveGlossaryEntry(id, body.move, who);
    return NextResponse.json({ ok: true, action: "moved", direction: body.move });
  }

  const fields: {
    marketingStatus?: MarketingStatus;
    collaboratorNotes?: string | null;
  } = {};
  if (typeof body.marketingStatus === "string") {
    if (!VALID_STATUSES.includes(body.marketingStatus as MarketingStatus)) {
      return NextResponse.json(
        { error: "invalid_status", valid: VALID_STATUSES },
        { status: 400 },
      );
    }
    fields.marketingStatus = body.marketingStatus as MarketingStatus;
  }
  if (body.collaboratorNotes !== undefined) {
    fields.collaboratorNotes = body.collaboratorNotes;
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "no_updatable_fields" }, { status: 400 });
  }

  // Capture pre-update state so we can detect status transitions.
  const before = await getGlossaryEntry(id);

  await updateGlossaryCollaboratorFields(id, fields, who);

  // Glossary → Social trigger: when an entry flips to "active" from
  // anything else, auto-queue a feature-spotlight draft to /wheelhouse/social.
  // Idempotent via (trigger_type, trigger_ref, channel) on queuePost —
  // same entry won't be re-queued if it bounces active → queued → active.
  let queuedSocialPostId: number | null = null;
  if (
    fields.marketingStatus === "active" &&
    before?.marketingStatus !== "active"
  ) {
    const after = await getGlossaryEntry(id);
    if (after) {
      try {
        const draft = glossaryActiveDraft(after);
        const linkUrl = after.livesAt
          ? after.livesAt.startsWith("http")
            ? after.livesAt
            : `https://theportalocal.com${after.livesAt.startsWith("/") ? "" : "/"}${after.livesAt}`
          : "https://theportalocal.com";
        const queued = await queuePost({
          triggerType: "glossary_active",
          triggerRef: after.id,
          channel: "facebook",
          caption: draft.facebook,
          linkUrl,
          metadata: {
            featureName: after.featureName,
            oneLiner: after.oneLiner,
            triggeredBy: who,
          },
        });
        queuedSocialPostId = queued.id;
      } catch (err) {
        // Trigger failure shouldn't block the glossary update —
        // operator can manually queue if this drops.
        console.error("[glossary→social] queue failed:", err);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    action: "updated",
    fields,
    ...(queuedSocialPostId !== null
      ? { queuedSocialPostId }
      : {}),
  });
}
