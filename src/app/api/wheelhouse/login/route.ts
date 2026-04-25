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
  const password = (body.password ?? "").toString();
  const who = (body.who ?? "").toString();

  const expected = process.env.WHEELHOUSE_PASSWORD;
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
