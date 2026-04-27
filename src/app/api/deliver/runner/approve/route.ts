import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { approveDriver, getDriverById } from "@/data/delivery-store";
import { magicLinkQrDataUrl, qrEmailBlock } from "@/lib/qrEmail";

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

  // Welcome email — single magic-link to their runner home. The login
  // route sets the cookie and redirects them to the hub. From there
  // they bookmark and never need a token again.
  await sendDriverWelcomeEmail({
    name: driver.name,
    email: driver.email ?? null,
    phone: driver.phone,
    signInUrl: `${APP_URL}/api/deliver/driver/login?t=${encodeURIComponent(driver.token)}&next=${encodeURIComponent("/deliver/driver")}`,
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
  signInUrl: string;
}

async function sendDriverWelcomeEmail(i: WelcomeInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !i.email) return;
  const subject = `You're in. Welcome to PAL Delivery, ${i.name.split(" ")[0]}.`;
  // Generate QR for cross-device sign-in. If reading email on desktop
  // and want to sign in on phone, scan with phone camera → done.
  const qrDataUrl = await magicLinkQrDataUrl(i.signInUrl);
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Welcome, runner
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">You're approved, ${escapeHtml(i.name.split(" ")[0])}.</h2>
      <p>One tap and you&apos;re in your runner home — where you&apos;ll set up payouts, toggle on/off duty, and see new orders.</p>

      <p style="margin: 24px 0;">
        <a href="${i.signInUrl}" style="display:inline-block; padding:14px 28px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
          Open my runner home →
        </a>
      </p>

      <p style="font-size: 13px; color: #555;">
        Tap once, and your phone stays signed in for 30 days. Bookmark the
        page after — no more sign-in links unless you clear cookies.
      </p>

      ${qrEmailBlock(
        qrDataUrl,
        "Reading this on your laptop? Scan with your phone camera to sign in there.",
      )}

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px 16px; margin: 0 0 20px;">
        <p style="margin: 0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#a07a18; font-weight:bold;">
          Do this first
        </p>
        <p style="margin: 4px 0; font-size:13px; line-height:1.55;">
          <strong>Wrap up Stripe payouts before your first run</strong> so
          your earnings auto-deposit the second you tap Delivered. Takes
          about 5 minutes, one time. Stripe holds the bank info — we never
          see it.
        </p>
        <p style="margin: 8px 0 0; font-size:12px; color:#7d6e5a; font-style:italic;">
          If you run before finishing, no stress — we&apos;ll backfill
          your earnings once you&apos;re set up.
        </p>
      </div>

      <p style="font-size: 13px;"><strong>How it works:</strong></p>
      <ol style="font-size: 13px; padding-left: 20px;">
        <li>Set up Stripe payouts (one-time, ~5 min) — <em>before your first run for immediate auto-deposit</em>.</li>
        <li>Tap "I&apos;m here" before each shift. Auto-off after 4 hours so you can&apos;t accidentally leave it on.</li>
        <li>New orders show up live in your runner home + send a text/email. First runner to tap claim wins.</li>
        <li>Pick up at the restaurant, drop at the customer&apos;s address. Tap "Delivered" — your cut auto-deposits to your bank in 1-2 days.</li>
      </ol>

      <p style="font-size: 13px;">Questions? Hit reply, or email <a href="mailto:hello@theportalocal.com">hello@theportalocal.com</a>.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Welcome to PAL Delivery, ${i.name.split(" ")[0]}!\n\n` +
    `Open your runner home → ${i.signInUrl}\n\n` +
    `One tap and your phone stays signed in for 30 days. Bookmark the page after.\n\n` +
    `* DO THIS FIRST *\n` +
    `Wrap up Stripe payouts BEFORE your first run so your earnings\n` +
    `auto-deposit the second you tap Delivered. Takes ~5 minutes,\n` +
    `one time. Stripe holds the bank info — we never see it.\n` +
    `If you run before finishing, no stress — we'll backfill once\n` +
    `you're set up.\n\n` +
    `How it works:\n` +
    `1. Set up Stripe payouts (one-time, ~5 min) — before run #1 for immediate auto-deposit\n` +
    `2. Tap "I'm here" before each shift\n` +
    `3. Claim new orders as they arrive\n` +
    `4. Pickup → drop → tap "Delivered" → auto-deposit\n\n` +
    `Questions? Reply or email hello@theportalocal.com.\n\n` +
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
