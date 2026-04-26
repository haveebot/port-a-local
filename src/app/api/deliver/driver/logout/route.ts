import { NextRequest, NextResponse } from "next/server";
import { RUNNER_COOKIE_NAME } from "@/lib/runnerSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/logout
 *
 * Clears the runner session cookie. Used by the "Sign out" button on
 * the runner hub, e.g. when a runner uses a public/shared device or
 * just wants to clear their session.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const dest = new URL("/deliver/driver/lookup", url.origin);
  const res = NextResponse.redirect(dest);
  res.cookies.delete(RUNNER_COOKIE_NAME);
  return res;
}
