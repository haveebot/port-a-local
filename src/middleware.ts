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
  // Vercel Cron destinations — auth via CRON_SECRET Bearer header,
  // not cookie or token. Each cron route checks its own auth.
  "/api/wheelhouse/cron/pulse",
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

/**
 * Multi-tenant host routing.
 *
 * When the incoming Host header matches one of our tenant domains
 * (e.g. bronsbeach.com), rewrite the pathname into the tenant's
 * route prefix so the same Next.js app serves a clean, PAL-chrome-free
 * surface at that domain.
 *
 *   bronsbeach.com/           → /brons
 *   bronsbeach.com/checkout/* → /brons/checkout/*
 *   bronsbeach.com/anything   → /brons/anything
 *
 * Implementation note: API routes (/api/*) are NOT rewritten — they're
 * the same code regardless of host. The browser hits bronsbeach.com/api/
 * brons/checkout, the request reaches /api/brons/checkout, the response
 * routes back. No rewrite needed because the path already matches.
 */
const TENANT_HOST_REWRITES: Record<string, string> = {
  "bronsbeach.com": "/brons",
  "www.bronsbeach.com": "/brons",
};

function tenantPrefixForHost(host: string | null): string | null {
  if (!host) return null;
  const cleanHost = host.split(":")[0].toLowerCase();
  return TENANT_HOST_REWRITES[cleanHost] ?? null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host");
  const tenantPrefix = tenantPrefixForHost(host);

  // Tenant host routing — bronsbeach.com etc.
  if (tenantPrefix) {
    // Don't rewrite API routes (they live under /api/* regardless of host)
    // Don't rewrite Next.js internals or static assets
    if (
      !pathname.startsWith("/api/") &&
      !pathname.startsWith("/_next/") &&
      !pathname.startsWith("/brons") && // already prefixed
      pathname !== "/favicon.ico"
    ) {
      const url = req.nextUrl.clone();
      // Map "/" → "/brons", "/foo" → "/brons/foo"
      url.pathname = pathname === "/" ? tenantPrefix : `${tenantPrefix}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

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
  // Matcher must include both the wheelhouse-gated routes AND the
  // tenant-host-routed paths (everything under /, /brons, /checkout etc.
  // when the request hits bronsbeach.com). The negative lookahead skips
  // Next internals + static assets so we don't rewrite those.
  matcher: [
    "/wheelhouse/:path*",
    "/api/wheelhouse/:path*",
    // Tenant-routing matcher — runs middleware on top-level paths
    // (everything except _next/, api/, favicon, static files)
    "/((?!_next/|api/|favicon\\.ico|.*\\..*).*)",
  ],
};
