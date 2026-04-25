import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ingestAnalyticsEvents,
  type DrainAnalyticsEvent,
} from "@/data/wheelhouse-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Web Analytics Drain destination.
 * Vercel POSTs JSON or NDJSON arrays of events here. We verify the
 * x-vercel-signature header (HMAC-SHA1 of raw body, hex), parse, and
 * persist to wheelhouse_analytics_events.
 *
 * Configure in Vercel: Team Settings → Drains → Add Drain → Web Analytics
 *   Endpoint: https://theportalocal.com/api/wheelhouse/analytics-ingest
 *     (Note: apex, not www. The www→apex 307 redirect breaks Vercel's
 *     drain test and would also drop signed payloads in flight.)
 *   Signature secret: paste the value of WHEELHOUSE_DRAIN_SECRET
 *   Format: JSON or NDJSON (we accept both)
 */
export async function POST(req: Request) {
  const secret = process.env.WHEELHOUSE_DRAIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "WHEELHOUSE_DRAIN_SECRET not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("x-vercel-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const rawBody = await req.text();
  const computed = crypto
    .createHmac("sha1", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(computed, "utf-8");
  const b = Buffer.from(signature, "utf-8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json(
      { error: "Signature mismatch" },
      { status: 403 },
    );
  }

  let events: DrainAnalyticsEvent[];
  try {
    events = parseDrainBody(rawBody);
  } catch (err) {
    return NextResponse.json(
      { error: "Bad payload", detail: String(err) },
      { status: 400 },
    );
  }

  const result = await ingestAnalyticsEvents(events);
  return NextResponse.json({ ok: true, ...result });
}

function parseDrainBody(body: string): DrainAnalyticsEvent[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed) as DrainAnalyticsEvent[];
  }
  return trimmed
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as DrainAnalyticsEvent);
}
