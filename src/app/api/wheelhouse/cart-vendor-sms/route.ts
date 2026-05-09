import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  cartVendors,
  getSmsCapableVendors,
  smsPhoneFor,
  hasSmsCapablePhone,
} from "@/data/cart-vendors";
import {
  getAllConsents,
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
  slug: string; // vendor slug, or "all-active" for bulk invite (action: "invite" only)
  notes?: string;
}

interface BulkResult {
  slug: string;
  ok: boolean;
  error?: string;
}

/**
 * Auth: handled by /src/middleware.ts. Cookie path forwards
 * `wheelhouse_who` cookie; bearer path forwards x-wheelhouse-agent header.
 * If neither is present, middleware would have already 401'd — but defend
 * here anyway so a misconfigured matcher can't silently expose the route.
 */
async function authorize(req: NextRequest): Promise<string | null> {
  const who = (await cookies()).get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return null;
}

export async function POST(req: NextRequest) {
  const who = await authorize(req);
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

  // Bulk: invite every active vendor with a phone, in sequence with 800ms
  // pacing (under AT&T 1.25 mps for LOW_VOLUME tier). Idempotent — re-running
  // re-fires the invite SMS but the DB stays consistent.
  if (slug === "all-active" && action === "invite") {
    // Bulk = SMS-capable AND not yet invited. Re-fire is safe but we don't
    // want to re-poke vendors we already messaged (avoids confusion when a
    // template change is rolling out). Use per-vendor "Re-invite" button
    // for that case.
    const consents = await getAllConsents();
    const inviterMap = new Map(consents.map((c) => [c.vendorSlug, c]));
    const eligible = getSmsCapableVendors().filter((v) => {
      const c = inviterMap.get(v.slug);
      return !c || !c.invitedAt;
    });
    const results: BulkResult[] = [];
    for (const v of eligible) {
      const phone = smsPhoneFor(v);
      const phoneE164 = toE164(phone);
      try {
        await recordInvite(v.slug, phoneE164);
        await sendSms(phone, buildOptInInviteSms(v.name));
        results.push({ slug: v.slug, ok: true });
      } catch (err) {
        results.push({ slug: v.slug, ok: false, error: String(err) });
      }
      if (results.length < eligible.length) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
    return NextResponse.json({
      ok: true,
      action: "invite-all",
      total: eligible.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  }

  const vendor = cartVendors.find((v) => v.slug === slug);
  if (!vendor) {
    return NextResponse.json({ error: "vendor_not_found" }, { status: 404 });
  }
  const phone = smsPhoneFor(vendor);
  if (!phone || phone.trim().length === 0) {
    return NextResponse.json({ error: "vendor_has_no_phone" }, { status: 400 });
  }

  const phoneE164 = toE164(phone);

  if (action === "invite") {
    if (!hasSmsCapablePhone(vendor)) {
      return NextResponse.json(
        { error: "vendor_landline_only", detail: "No SMS-capable phone on file (all numbers marked smsCapable:false / 30006 landline)." },
        { status: 400 },
      );
    }
    await recordInvite(slug, phoneE164);
    try {
      await sendSms(phone, buildOptInInviteSms(vendor.name));
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
