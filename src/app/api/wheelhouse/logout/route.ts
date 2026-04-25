import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("wheelhouse_auth");
  res.cookies.delete("wheelhouse_who");
  return res;
}
