import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDriverById, rejectDriver } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/deliver/runner/reject?d=DRIVER_ID&s=HMAC_SIGNATURE
 *
 * One-click rejection. Marks the driver rejected (no email sent to
 * them — manual decision how to communicate). HMAC-protected, same
 * pattern as approve.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const driverId = url.searchParams.get("d") ?? "";
  const sig = url.searchParams.get("s") ?? "";
  const secret = process.env.ADMIN_APPROVAL_SECRET;
  if (!secret) {
    return htmlError("Server is missing ADMIN_APPROVAL_SECRET.");
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(driverId)
    .digest("hex");
  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(sig, "utf-8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return htmlError("Bad signature.");
  }

  const existing = await getDriverById(driverId);
  if (!existing) {
    return htmlError("Driver record not found.");
  }
  await rejectDriver(driverId, "admin-rejected-via-link");

  return new NextResponse(
    `<!doctype html>
<html><head><title>Rejected — PAL Delivery</title>
<style>body { font-family: -apple-system, sans-serif; max-width: 560px; margin: 60px auto; padding: 0 24px; color: #1a2433; }</style></head><body>
<p style="text-transform:uppercase;letter-spacing:.15em;font-size:11px;color:#c84a2c;margin-bottom:4px;">PAL Delivery · Admin</p>
<h1 style="font-family:Georgia,serif;">${escapeHtml(existing.name)} — rejected.</h1>
<p>Marked rejected in the database. No email was sent to them. If you want to communicate, do it directly.</p>
<p style="color:#4a5568;font-size:14px;">If this was a mistake, you can re-approve them via a fresh approval link (the original link still works because the HMAC signature is stable).</p>
</body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function htmlError(msg: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:sans-serif;max-width:560px;margin:60px auto;padding:0 24px;"><h1 style="color:#c83a3a;">Rejection problem</h1><p>${escapeHtml(msg)}</p></body></html>`,
    { status: 400, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
