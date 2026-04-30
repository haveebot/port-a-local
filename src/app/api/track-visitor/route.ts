import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeat } from "@/data/visitor-heartbeats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/track-visitor
 * Body: { session_id: string, path: string }
 *
 * Public endpoint — anyone can post. Heartbeat records what page a
 * (random, client-generated) session is on. Used to count active
 * visitors via /wheelhouse live-counter.
 *
 * Validation: session_id must be 8-64 chars, path must start with /
 * — defensive against accidental flooding from a misbehaving client.
 *
 * Rate limit: not enforced server-side. Each visitor's client throttles
 * to one POST per 30s. Bad actor flooding would hit the table but
 * pruneOldHeartbeats keeps it bounded.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.session_id || "").trim();
    const path = String(body?.path || "/").trim();
    if (!sessionId || sessionId.length < 8 || sessionId.length > 64) {
      return NextResponse.json({ error: "invalid_session" }, { status: 400 });
    }
    if (!path.startsWith("/") || path.length > 200) {
      return NextResponse.json({ error: "invalid_path" }, { status: 400 });
    }
    await recordHeartbeat(sessionId, path);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[track-visitor] error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
