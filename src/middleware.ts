import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate The Wheelhouse. Two auth paths:
 *
 * 1. HUMAN — cookie-based. Set by /wheelhouse/login. Used by browser sessions.
 * 2. AGENT — Bearer token. Set as env vars per agent. Used by Claude sessions
 *    (Winston's, Collie's, Nick's) calling the API directly without a browser.
 *
 * Either path satisfies the gate. Authenticated agent identity is forwarded
 * to the route handlers via the `x-wheelhouse-agent` request header so the
 * handlers know who's posting (without trusting the body).
 *
 * Allow-list: /wheelhouse/login + /api/wheelhouse/login + /api/wheelhouse/logout.
 */

const PUBLIC_WHEELHOUSE_PATHS = [
  "/wheelhouse/login",
  "/api/wheelhouse/login",
  "/api/wheelhouse/logout",
  // Vercel Web Analytics Drain destination — auth via x-vercel-signature HMAC,
  // not cookie or token.
  "/api/wheelhouse/analytics-ingest",
];

/**
 * Token-to-participant map. Each agent has its own env var so revoking
 * one doesn't affect the others. Falsy entries mean "not configured" —
 * the corresponding agent simply can't authenticate.
 */
function tokenToAgent(token: string): string | null {
  if (
    process.env.WHEELHOUSE_TOKEN_WINSTON_CLAUDE &&
    token === process.env.WHEELHOUSE_TOKEN_WINSTON_CLAUDE
  ) {
    return "winston-claude";
  }
  if (
    process.env.WHEELHOUSE_TOKEN_COLLIE_CLAUDE &&
    token === process.env.WHEELHOUSE_TOKEN_COLLIE_CLAUDE
  ) {
    return "collie-claude";
  }
  if (
    process.env.WHEELHOUSE_TOKEN_NICK_CLAUDE &&
    token === process.env.WHEELHOUSE_TOKEN_NICK_CLAUDE
  ) {
    return "nick-claude";
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_WHEELHOUSE_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const isProtected =
    pathname === "/wheelhouse" ||
    pathname.startsWith("/wheelhouse/") ||
    pathname.startsWith("/api/wheelhouse/");
  if (!isProtected) return NextResponse.next();

  // Path 2 — agent Bearer token (API only)
  if (pathname.startsWith("/api/wheelhouse/")) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length).trim();
      const agentId = tokenToAgent(token);
      if (agentId) {
        // Forward authenticated agent identity to the route handler
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-wheelhouse-agent", agentId);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      return NextResponse.json(
        { error: "Invalid Bearer token" },
        { status: 401 },
      );
    }
  }

  // Path 1 — cookie auth (browser sessions)
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
