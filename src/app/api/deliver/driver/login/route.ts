import { NextRequest, NextResponse } from "next/server";
import { getDriverByToken } from "@/data/delivery-drivers";
import {
  RUNNER_COOKIE_MAX_AGE,
  RUNNER_COOKIE_NAME,
} from "@/lib/runnerSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/deliver/driver/login?t=<driver_token>&next=<path>
 *
 * Token-to-cookie exchange. Email/dispatch links land here first.
 * If the token validates to an active driver, we set the pal_runner
 * cookie (driver_id) and redirect to the `next` path with a clean
 * URL — no more token in the address bar. From that moment on, the
 * runner is a logged-in session on this device.
 *
 * If the token is invalid, we redirect to the lookup page with a
 * helpful query param.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const next = sanitizeNext(url.searchParams.get("next"));

  const driver = await getDriverByToken(token);
  if (!driver || !driver.isActive) {
    const lookup = new URL("/deliver/driver/lookup", url.origin);
    lookup.searchParams.set("from", "expired");
    return NextResponse.redirect(lookup);
  }

  const dest = new URL(next, url.origin);
  const res = NextResponse.redirect(dest);
  res.cookies.set(RUNNER_COOKIE_NAME, driver.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: RUNNER_COOKIE_MAX_AGE,
  });
  return res;
}

/** Only allow internal redirect targets — never an external URL */
function sanitizeNext(next: string | null): string {
  if (!next) return "/deliver/driver";
  if (!next.startsWith("/")) return "/deliver/driver";
  if (next.startsWith("//")) return "/deliver/driver";
  return next;
}
