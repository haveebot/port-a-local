import { NextRequest, NextResponse } from "next/server";

/** POST /api/brons/logout — clears the Bron's session cookie, back to login. */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/brons/login", req.url), {
    status: 303,
  });
  res.cookies.set("brons_auth", "", { path: "/", maxAge: 0 });
  return res;
}
