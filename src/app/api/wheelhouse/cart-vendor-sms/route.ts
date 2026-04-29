import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cartVendors } from "@/data/cart-vendors";
import {
  recordInvite,
  recordOptIn,
  recordOptOut,
  toE164,
} from "@/data/cart-vendor-sms-store";
import { sendSms } from "@/lib/twilioSms";
import { buildOptInInviteSms } from "@/lib/cartVendorSmsBlast";

/**
 * Wheelhouse-only admin endpoint for the cart-vendor SMS opt-in flow.
 *
 * Auth: same cookie gate as the rest of /wheelhouse — wheelhouse_who
 * cookie must be set.
 *
 * Actions (passed as JSON body { action, slug, notes? }):
 *   invite    — sends the opt-in invite SMS to the vendor's phone
 *               and records invited_at. Idempotent re-invite OK.
 *   opt-in    — manually marks vendor as opted in (for verbal consent)
 *   opt-out   — manually marks vendor as opted out
 */

interface Body {
  action: "invite" | "opt-in" | "opt-out";
  slug: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  const who = (await cookies()).get("wheelhouse_who")?.value;
  if (!who) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { action, slug } = body;
  if (!action || !slug) {
    return NextResponse.json({ error: "missing_action_or_slug" }, { status: 400 });
  }

  const vendor = cartVendors.find((v) => v.slug === slug);
  if (!vendor) {
    return NextResponse.json({ error: "vendor_not_found" }, { status: 404 });
  }
  if (!vendor.phone || vendor.phone.trim().length === 0) {
    return NextResponse.json({ error: "vendor_has_no_phone" }, { status: 400 });
  }

  const phoneE164 = toE164(vendor.phone);

  if (action === "invite") {
    await recordInvite(slug, phoneE164);
    try {
      await sendSms(vendor.phone, buildOptInInviteSms(vendor.name));
    } catch (err) {
      console.error("[wh/cart-vendor-sms] invite send failed:", err);
      return NextResponse.json(
        { error: "send_failed", detail: String(err) },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, action: "invite", slug });
  }

  if (action === "opt-in") {
    // Manual override — for verbal consent. recordInvite first so the
    // row exists with the right phone before we flip status.
    await recordInvite(slug, phoneE164);
    await recordOptIn(slug, { manual: true });
    return NextResponse.json({ ok: true, action: "opt-in", slug });
  }

  if (action === "opt-out") {
    await recordInvite(slug, phoneE164);
    await recordOptOut(slug, { manual: true });
    return NextResponse.json({ ok: true, action: "opt-out", slug });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
