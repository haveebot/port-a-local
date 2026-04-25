import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate The Wheelhouse — admin pages and admin API behind a simple cookie
 * check. Push 2 swaps this for Clerk; Push 1 just checks a cookie set by
 * the password login page.
 *
 * The Wheelhouse routes:
 *   - /wheelhouse/*       → page routes
 *   - /api/wheelhouse/*   → API routes
 *
 * Allow-list: /wheelhouse/login + /api/wheelhouse/login + /api/wheelhouse/logout
 * (so users can sign in / out without infinite redirects).
 */

const PUBLIC_WHEELHOUSE_PATHS = [
  "/wheelhouse/login",
  "/api/wheelhouse/login",
  "/api/wheelhouse/logout",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_WHEELHOUSE_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Only gate /wheelhouse and /api/wheelhouse paths
  const isProtected =
    pathname === "/wheelhouse" ||
    pathname.startsWith("/wheelhouse/") ||
    pathname.startsWith("/api/wheelhouse/");
  if (!isProtected) return NextResponse.next();

  const authed = req.cookies.get("wheelhouse_auth")?.value === "ok";
  const who = req.cookies.get("wheelhouse_who")?.value;
  if (!authed || !who) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/wheelhouse/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wheelhouse/:path*", "/api/wheelhouse/:path*"],
};
