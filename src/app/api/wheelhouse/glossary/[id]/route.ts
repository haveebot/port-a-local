import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  type MarketingStatus,
  moveGlossaryEntry,
  updateGlossaryCollaboratorFields,
} from "@/data/glossary-store";

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
  await updateGlossaryCollaboratorFields(id, fields, who);
  return NextResponse.json({ ok: true, action: "updated", fields });
}
