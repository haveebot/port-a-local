import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { approveDriver, getDriverById } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * GET /api/deliver/runner/approve?d=DRIVER_ID&s=HMAC_SIGNATURE
 *
 * One-click approval link, signed with ADMIN_APPROVAL_SECRET. Winston
 * receives this link in the application email; clicking it:
 *
 *   1. Verifies HMAC
 *   2. Flips is_active=true on the driver
 *   3. Emails the driver their two welcome links (on-duty toggle + Stripe
 *      Connect payout setup)
 *   4. Returns a friendly HTML success page so Winston knows it worked
 *
 * GET (not POST) on purpose — we want clickable email links to work
 * directly in any mail client. HMAC + low-stakes outcome (just flips a
 * bool) makes this acceptable.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const driverId = url.searchParams.get("d") ?? "";
  const sig = url.searchParams.get("s") ?? "";
  const secret = process.env.ADMIN_APPROVAL_SECRET;
  if (!secret) {
    return htmlError("Server is missing ADMIN_APPROVAL_SECRET — Winston needs to set it in Vercel env.");
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(driverId)
    .digest("hex");
  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(sig, "utf-8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return htmlError("Bad signature. This approval link is invalid or tampered with.");
  }

  const existing = await getDriverById(driverId);
  if (!existing) {
    return htmlError("Driver record not found.");
  }
  if (existing.isActive) {
    return htmlSuccess(
      existing.name,
      "already approved",
      `${APP_URL}/deliver/driver/online?t=${encodeURIComponent(existing.token)}`,
      `${APP_URL}/deliver/driver/payouts?t=${encodeURIComponent(existing.token)}`,
    );
  }

  const driver = await approveDriver(driverId, "winston");
  if (!driver) {
    return htmlError("Approval failed at the database step.");
  }

  // Welcome email to the driver — only sent if we have their email
  await sendDriverWelcomeEmail({
    name: driver.name,
    email: driver.email ?? null,
    phone: driver.phone,
    onDutyUrl: `${APP_URL}/deliver/driver/online?t=${encodeURIComponent(driver.token)}`,
    payoutsUrl: `${APP_URL}/deliver/driver/payouts?t=${encodeURIComponent(driver.token)}`,
  });

  return htmlSuccess(
    driver.name,
    "approved",
    `${APP_URL}/deliver/driver/online?t=${encodeURIComponent(driver.token)}`,
    `${APP_URL}/deliver/driver/payouts?t=${encodeURIComponent(driver.token)}`,
  );
}

interface WelcomeInput {
  name: string;
  email: string | null;
  phone: string;
  onDutyUrl: string;
  payoutsUrl: string;
}

async function sendDriverWelcomeEmail(i: WelcomeInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !i.email) return;
  const subject = `You're in. Welcome to PAL Delivery, ${i.name.split(" ")[0]}.`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Welcome, runner
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">You're approved, ${escapeHtml(i.name.split(" ")[0])}.</h2>
      <p>Welcome to PAL Delivery. Two things you need to do — both quick:</p>

      <h3 style="margin: 24px 0 6px; font-size: 16px;">1. Set up your bank for auto-payouts</h3>
      <p style="margin: 0;">Stripe-hosted form. ~5 minutes. Your bank info is held by Stripe, not us. After this, your delivery cuts auto-deposit to your bank in 1-2 business days.</p>
      <p style="margin: 12px 0;">
        <a href="${i.payoutsUrl}" style="display:inline-block; padding:12px 22px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          Set up payouts →
        </a>
      </p>

      <h3 style="margin: 24px 0 6px; font-size: 16px;">2. Bookmark your on-duty toggle</h3>
      <p style="margin: 0;">When you're ready to take orders, hit this link and tap "I'm here." When you're done for the day, tap off-duty. We only dispatch new orders to runners on-duty.</p>
      <p style="margin: 12px 0;">
        <a href="${i.onDutyUrl}" style="display:inline-block; padding:12px 22px; background:#0b1120; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          On/Off duty →
        </a>
      </p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 13px;"><strong>How orders work:</strong></p>
      <ol style="font-size: 13px; padding-left: 20px;">
        <li>You go on duty (link above)</li>
        <li>An order comes in — you get a text + email with pickup, drop, and what you'd earn</li>
        <li>First runner to tap the claim link wins. No bidding, no surge.</li>
        <li>Pick up at the restaurant (PAL pays the restaurant — you just drive). Drop at the customer's address.</li>
        <li>Tap "Delivered" — your cut auto-deposits to your bank.</li>
      </ol>

      <p style="font-size: 13px;">Questions, ping Winston: (361) 428-1706.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Welcome to PAL Delivery, ${i.name.split(" ")[0]}!\n\n` +
    `Two quick setup links:\n\n` +
    `1. Set up payouts (Stripe-hosted, ~5 min):\n   ${i.payoutsUrl}\n\n` +
    `2. Your on/off-duty toggle:\n   ${i.onDutyUrl}\n\n` +
    `Bookmark both. The on-duty link is what you tap before each shift.\n\n` +
    `Questions: text Winston at (361) 428-1706.\n\n` +
    `— The Port A Local`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
    console.error("[runner welcome] failed:", err);
  }
}

function htmlSuccess(
  name: string,
  verb: string,
  onDutyUrl: string,
  payoutsUrl: string,
): NextResponse {
  const body = `<!doctype html>
<html><head><title>Approved — PAL Delivery</title>
<style>body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 560px; margin: 60px auto; padding: 0 24px; color: #1a2433; line-height: 1.5; }
h1 { font-family: Georgia, serif; font-size: 32px; }
a.btn { display: inline-block; padding: 12px 22px; background: #e8656f; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 8px; }
a.btn.dark { background: #0b1120; }
.muted { color: #4a5568; font-size: 14px; }
code { background: #f5f0e8; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style></head><body>
<p style="text-transform:uppercase;letter-spacing:.15em;font-size:11px;color:#c84a2c;margin-bottom:4px;">PAL Delivery · Admin</p>
<h1>${escapeHtml(name)} — ${escapeHtml(verb)}.</h1>
<p>Welcome email sent (if they gave one). Their links are ready:</p>
<p>
  <a class="btn" href="${payoutsUrl}">Their payouts setup →</a>
  <a class="btn dark" href="${onDutyUrl}">Their on/off duty →</a>
</p>
<p class="muted">You can text these directly to the runner if their email bounced. Both are HMAC-protected against tampering.</p>
</body></html>`;
  return new NextResponse(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function htmlError(msg: string): NextResponse {
  const body = `<!doctype html>
<html><head><title>Approval error — PAL Delivery</title>
<style>body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 560px; margin: 60px auto; padding: 0 24px; color: #1a2433; }</style></head><body>
<h1 style="color:#c83a3a;font-family:Georgia,serif;">Approval problem</h1>
<p>${escapeHtml(msg)}</p>
</body></html>`;
  return new NextResponse(body, {
    status: 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
