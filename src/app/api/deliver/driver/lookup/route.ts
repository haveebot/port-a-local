import { NextRequest, NextResponse } from "next/server";
import { sql as vercelSql } from "@vercel/postgres";
import type { DriverRecord } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * POST /api/deliver/driver/lookup
 * Body: { phone: "..." }
 *
 * Looks up an active driver by phone, emails them their on-duty toggle
 * URL + Stripe payouts setup URL. Returns matched: true if we found
 * them and sent the email, matched: false if not.
 *
 * Doesn't reveal whether a phone is in the system to the response —
 * just success/no-match — so this isn't a phone-enumeration vector.
 */
export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const phoneRaw = (body.phone ?? "").trim();
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  // Match by last 10 digits — accommodates +1 prefix variation
  const last10 = phoneDigits.slice(-10);
  const { rows } = await vercelSql`
    SELECT id, name, phone, email, token, is_active
    FROM delivery_drivers
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE ${"%" + last10}
      AND is_active = TRUE
    LIMIT 1
  `;

  if (!rows[0]) {
    return NextResponse.json({ ok: true, matched: false });
  }

  const driver: Partial<DriverRecord> = {
    id: rows[0].id as string,
    name: rows[0].name as string,
    phone: rows[0].phone as string,
    email: (rows[0].email as string) ?? null,
    token: rows[0].token as string,
  };

  if (!driver.email) {
    // Active driver but no email on file — can't deliver the magic link
    return NextResponse.json({
      ok: true,
      matched: false,
      reason: "no-email-on-file",
    });
  }

  const onDutyUrl = `${APP_URL}/deliver/driver/online?t=${encodeURIComponent(driver.token!)}`;
  const payoutsUrl = `${APP_URL}/deliver/driver/payouts?t=${encodeURIComponent(driver.token!)}`;
  await sendDriverLinkEmail({
    name: driver.name!,
    email: driver.email,
    onDutyUrl,
    payoutsUrl,
  });

  return NextResponse.json({ ok: true, matched: true });
}

interface LinkEmailInput {
  name: string;
  email: string;
  onDutyUrl: string;
  payoutsUrl: string;
}

async function sendDriverLinkEmail(i: LinkEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[driver lookup] RESEND_API_KEY not set");
    return;
  }
  const subject = `Your PAL Delivery driver links`;
  const first = i.name.split(" ")[0];
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Driver
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">Here you go, ${escapeHtml(first)}.</h2>
      <p>Two links to bookmark — same as your welcome email:</p>

      <h3 style="margin: 24px 0 6px; font-size: 16px;">Set up payouts (one-time)</h3>
      <p style="margin: 0;">If you haven't finished Stripe Connect onboarding, do it now. ~5 minutes.</p>
      <p style="margin: 12px 0;">
        <a href="${i.payoutsUrl}" style="display:inline-block; padding:12px 22px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          Set up / update payouts →
        </a>
      </p>

      <h3 style="margin: 24px 0 6px; font-size: 16px;">On / off duty toggle</h3>
      <p style="margin: 0;">Tap before each shift. Auto-off after 4 hours so you don&apos;t forget.</p>
      <p style="margin: 12px 0;">
        <a href="${i.onDutyUrl}" style="display:inline-block; padding:12px 22px; background:#0b1120; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          On / off duty →
        </a>
      </p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
      <p style="font-size: 13px;">Anything else? Just reply.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Here you go, ${first}.\n\nTwo links to bookmark:\n\n` +
    `Set up payouts (Stripe-hosted, ~5 min):\n  ${i.payoutsUrl}\n\n` +
    `On / off duty toggle (tap before each shift):\n  ${i.onDutyUrl}\n\n` +
    `Anything else? Just reply.\n\n— The Port A Local`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: [i.email],
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[driver lookup] email failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
