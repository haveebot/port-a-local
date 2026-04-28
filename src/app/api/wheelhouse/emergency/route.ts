import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createEvent,
  createUpdate,
  getEventById,
  getEventList,
  updateEvent,
  type EventKind,
  type EventSeverity,
  type EventStatus,
  type UpdateKind,
} from "@/data/emergency-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getWheelhouseUser(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("wheelhouse_who")?.value ?? null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * GET /api/wheelhouse/emergency
 * Returns the event list (admin view, all statuses).
 *
 * POST /api/wheelhouse/emergency
 * Body: { action: "create-event", ... } | { action: "patch-event", id, ... } |
 *       { action: "post-update", eventId, body, ... }
 */
export async function GET() {
  const user = await getWheelhouseUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  const events = await getEventList(50);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const user = await getWheelhouseUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const action = body.action as string;

  if (action === "create-event") {
    const title = ((body.title as string) ?? "").trim();
    const summary = ((body.summary as string) ?? "").trim();
    let slug = ((body.slug as string) ?? "").trim();
    if (title.length < 2) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 },
      );
    }
    if (summary.length < 5) {
      return NextResponse.json(
        { error: "Event summary is required" },
        { status: 400 },
      );
    }
    if (!slug) slug = slugify(title);
    const severity = normalizeSeverity(body.severity as string);
    const kind = normalizeKind(body.kind as string);
    const startedAt = (body.startedAt as string) || undefined;
    const event = await createEvent({
      slug,
      title,
      summary,
      severity,
      kind,
      startedAt,
      createdBy: user,
    });
    return NextResponse.json({ ok: true, event });
  }

  if (action === "patch-event") {
    const id = (body.id as string) ?? "";
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const status = body.status
      ? normalizeStatus(body.status as string)
      : undefined;
    const severity = body.severity
      ? normalizeSeverity(body.severity as string)
      : undefined;
    const summary = body.summary as string | undefined;
    const resolvedAt =
      status === "resolved" && !body.resolvedAt
        ? new Date().toISOString()
        : (body.resolvedAt as string | undefined);
    const event = await updateEvent(id, {
      status,
      severity,
      summary,
      resolvedAt,
    });
    return NextResponse.json({ ok: true, event });
  }

  if (action === "post-update") {
    const eventId = (body.eventId as string) ?? "";
    const updateBody = ((body.body as string) ?? "").trim();
    if (!eventId || !updateBody) {
      return NextResponse.json(
        { error: "eventId + body required" },
        { status: 400 },
      );
    }
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const update = await createUpdate({
      eventId,
      kind: normalizeUpdateKind(body.kind as string),
      title: ((body.title as string) ?? "").trim() || undefined,
      body: updateBody,
      sourceUrl: ((body.sourceUrl as string) ?? "").trim() || undefined,
      sourceLabel: ((body.sourceLabel as string) ?? "").trim() || undefined,
      authorId: user,
    });
    return NextResponse.json({ ok: true, update });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

function normalizeSeverity(s?: string): EventSeverity {
  return s === "info" || s === "warning" || s === "critical" ? s : "warning";
}
function normalizeKind(s?: string): EventKind {
  const allowed: EventKind[] = [
    "weather",
    "evacuation",
    "road-closure",
    "water-advisory",
    "fire",
    "general",
  ];
  return (allowed as string[]).includes(s ?? "")
    ? (s as EventKind)
    : "general";
}
function normalizeStatus(s?: string): EventStatus {
  return s === "active" || s === "watching" || s === "resolved"
    ? s
    : "active";
}
function normalizeUpdateKind(s?: string): UpdateKind {
  const allowed: UpdateKind[] = [
    "info",
    "conditions",
    "decision",
    "warning",
    "all-clear",
  ];
  return (allowed as string[]).includes(s ?? "") ? (s as UpdateKind) : "info";
}
