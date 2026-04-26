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

  // Single sign-in link — sets cookie on first click and lands them on
  // their runner home. After that they bookmark and don't need the link
  // again until they clear cookies or switch devices.
  const signInUrl = `${APP_URL}/api/deliver/driver/login?t=${encodeURIComponent(driver.token!)}&next=${encodeURIComponent("/deliver/driver")}`;
  await sendDriverLinkEmail({
    name: driver.name!,
    email: driver.email,
    signInUrl,
  });

  return NextResponse.json({ ok: true, matched: true });
}

interface LinkEmailInput {
  name: string;
  email: string;
  signInUrl: string;
}

async function sendDriverLinkEmail(i: LinkEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[driver lookup] RESEND_API_KEY not set");
    return;
  }
  const subject = `Your PAL Delivery sign-in link`;
  const first = i.name.split(" ")[0];
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Runner
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">Tap to sign in, ${escapeHtml(first)}.</h2>
      <p>One tap and you&apos;re back in your runner home — toggle on/off duty, see new orders, claim, run.</p>

      <p style="margin: 24px 0;">
        <a href="${i.signInUrl}" style="display:inline-block; padding:14px 28px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
          Open my runner home →
        </a>
      </p>

      <p style="font-size: 13px; color: #555;">
        After this tap, your phone stays signed in for 30 days. Just bookmark
        the page — no more sign-in links unless you clear cookies or switch
        devices.
      </p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
      <p style="font-size: 13px;">Didn&apos;t request this? Ignore it — the link only works for you.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Tap to sign in, ${first}.\n\n` +
    `Open your runner home → ${i.signInUrl}\n\n` +
    `After that, bookmark the page — your phone stays signed in for 30 days.\n\n` +
    `Didn't request this? Ignore it.\n\n— The Port A Local`;
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
