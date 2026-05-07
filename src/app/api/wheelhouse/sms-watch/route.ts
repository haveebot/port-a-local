import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  addWatch,
  removeWatch,
  listActiveWatches,
} from "@/data/sms-watch-store";

/**
 * Wheelhouse admin endpoint for the SMS watch list.
 *
 * Auth: cookie (wheelhouse_who) OR header (x-wheelhouse-agent) — same
 * pattern as cart-vendor-sms.
 *
 * GET                                 — list all active watch entries
 * POST { action, phoneE164, context, ttlHours? }
 *   action="add"    — add or refresh a watch entry
 *   action="remove" — explicit remove
 */

async function authorize(req: NextRequest): Promise<string | null> {
  const who = (await cookies()).get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return null;
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "").replace(/^1/, "");
  if (digits.length !== 10) {
    throw new Error(`invalid phone: ${input} (need 10 digits after country code)`);
  }
  return `+1${digits}`;
}

export async function GET(req: NextRequest) {
  const who = await authorize(req);
  if (!who) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const watches = await listActiveWatches();
  return NextResponse.json({ watches });
}

export async function POST(req: NextRequest) {
  const who = await authorize(req);
  if (!who) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    action: "add" | "remove";
    phoneE164?: string;
    phone?: string;
    context?: string;
    ttlHours?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const phoneRaw = body.phoneE164 || body.phone;
  if (!phoneRaw) {
    return NextResponse.json(
      { error: "phoneE164 (or phone) required" },
      { status: 400 },
    );
  }
  let phoneE164: string;
  try {
    phoneE164 = normalizePhone(phoneRaw);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }

  if (body.action === "add") {
    if (!body.context || body.context.trim().length === 0) {
      return NextResponse.json(
        { error: "context required for add" },
        { status: 400 },
      );
    }
    await addWatch(phoneE164, body.context.trim(), body.ttlHours);
    return NextResponse.json({ ok: true, phoneE164, action: "add" });
  }

  if (body.action === "remove") {
    await removeWatch(phoneE164);
    return NextResponse.json({ ok: true, phoneE164, action: "remove" });
  }

  return NextResponse.json(
    { error: 'action must be "add" or "remove"' },
    { status: 400 },
  );
}
