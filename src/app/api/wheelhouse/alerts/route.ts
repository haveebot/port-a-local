import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAlert,
  dismissAlert,
  getActiveAlert,
  getAlertHistory,
  type AlertSeverity,
} from "@/data/alerts-store";
import { pushSiteBanner } from "@/lib/emergencyPush";

async function getWheelhouseUser(req?: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("wheelhouse_who")?.value;
  if (cookie) return cookie;
  // Bearer-auth fallback — middleware injects x-wheelhouse-agent on valid
  // tokens, lets cross-project agents (Havee, etc.) activate alerts too.
  const agent = req?.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return null;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/wheelhouse/alerts
 * Returns the active alert (if any) + recent history. Cookie-gated
 * to wheelhouse users.
 *
 * POST /api/wheelhouse/alerts
 * Creates a new alert. Body: { severity, message, linkUrl?, linkLabel?,
 * expiresAt? }. Single-active invariant — creating a new one auto-
 * dismisses any prior active alert.
 *
 * DELETE /api/wheelhouse/alerts?id=ALERT_ID
 * Dismisses the named alert.
 */

export async function GET(req: NextRequest) {
  const user = await getWheelhouseUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  const [active, history] = await Promise.all([
    getActiveAlert(),
    getAlertHistory(20),
  ]);
  return NextResponse.json({ active, history });
}

export async function POST(req: NextRequest) {
  const user = await getWheelhouseUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  let body: {
    severity?: AlertSeverity;
    message?: string;
    linkUrl?: string;
    linkLabel?: string;
    expiresAt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const message = (body.message ?? "").trim();
  if (message.length < 3) {
    return NextResponse.json(
      { error: "Alert message is required (3+ chars)." },
      { status: 400 },
    );
  }
  const severity: AlertSeverity =
    body.severity === "info" ||
    body.severity === "warning" ||
    body.severity === "critical"
      ? body.severity
      : "warning";

  const alert = await createAlert({
    severity,
    message,
    linkUrl: body.linkUrl?.trim() || undefined,
    linkLabel: body.linkLabel?.trim() || undefined,
    expiresAt: body.expiresAt?.trim() || undefined,
    createdBy: user,
  });
  // Fan out push to every emergency-topic subscriber. Severity-gated
  // inside pushSiteBanner — info-tier announcements skip push.
  // Fire-and-forget so a push hiccup never rolls back the alert write.
  pushSiteBanner(alert).catch((err) =>
    console.error("[wh/alerts] push on create failed:", err),
  );
  return NextResponse.json({ ok: true, alert });
}

export async function DELETE(req: NextRequest) {
  const user = await getWheelhouseUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const alert = await dismissAlert(id, user);
  return NextResponse.json({ ok: true, alert });
}
