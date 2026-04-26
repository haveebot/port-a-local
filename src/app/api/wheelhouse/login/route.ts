import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/wheelhouse/login
 *
 * Body: { password: string, who: "winston" | "collie" }
 * Sets two cookies on success: wheelhouse_auth=ok, wheelhouse_who=<id>.
 *
 * Push 1 — single shared password (env var WHEELHOUSE_PASSWORD), identity
 * picked at login. Push 2 swaps this for Clerk, where each user has their
 * own credentials.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // Defensive trim on both sides — same Vercel-env-var-with-trailing-
  // newline failure mode that burned us on STRIPE_SECRET_KEY (commit
  // 4923918). Vercel doesn't auto-strip whitespace on env var saves;
  // a stray paste of "password\n" would silently 401 every login.
  // Trimming here doesn't materially weaken the password — passwords
  // with leading/trailing whitespace are vanishingly rare in practice.
  const password = (body.password ?? "").toString().trim();
  const who = (body.who ?? "").toString();

  const expected = (process.env.WHEELHOUSE_PASSWORD ?? "").trim();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "WHEELHOUSE_PASSWORD env var not set on the server. Set it in Vercel project env vars (or .env.local for dev) and redeploy.",
      },
      { status: 500 },
    );
  }
  if (password !== expected) {
    // Log lengths only (not values) — helps diagnose mismatches without
    // leaking the password. If lengths differ, it's a typo or pasted
    // junk; if lengths match but compare fails, it's a content issue.
    console.warn(
      `[wheelhouse/login] password mismatch — submitted len=${password.length}, expected len=${expected.length}`,
    );
    return NextResponse.json(
      { error: "Wrong password." },
      { status: 401 },
    );
  }
  if (who !== "winston" && who !== "collie" && who !== "nick") {
    return NextResponse.json(
      { error: "Invalid identity selection." },
      { status: 400 },
    );
  }

  const res = NextResponse.json({ success: true });
  const sevenDays = 60 * 60 * 24 * 7;
  res.cookies.set("wheelhouse_auth", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sevenDays,
  });
  res.cookies.set("wheelhouse_who", who, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sevenDays,
  });
  return res;
}
