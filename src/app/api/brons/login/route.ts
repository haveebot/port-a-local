import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/brons/login — shared Bron's-team login for the bronsbeach.com
 * dashboard. Single shared password (env BRONS_DASHBOARD_PASSWORD); on success
 * sets the brons_auth cookie. Mirrors the Wheelhouse cookie-auth pattern but is
 * FULLY SEPARATE — a Bron's cookie never grants Wheelhouse (operator) access,
 * and vice versa.
 *
 * Body: { password: string }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // Defensive trim on both sides — Vercel env vars don't auto-strip a trailing
  // newline from a stray paste (same failure that burned STRIPE_SECRET_KEY).
  const password = (body.password ?? "").toString().trim();
  const expected = (process.env.BRONS_DASHBOARD_PASSWORD ?? "").trim();

  if (!expected) {
    return NextResponse.json(
      {
        error:
          "BRONS_DASHBOARD_PASSWORD env var not set on the server. Set it in Vercel project env vars (or .env.local for dev) and redeploy.",
      },
      { status: 500 },
    );
  }
  if (password !== expected) {
    // Log lengths only — never the value.
    console.warn(
      `[brons/login] password mismatch — submitted len=${password.length}, expected len=${expected.length}`,
    );
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("brons_auth", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
