import { NextResponse } from "next/server";
import { backendStatus, initSchemaAndSeed } from "@/data/wheelhouse-store";

/**
 * One-time bootstrap for the Wheelhouse Postgres database.
 *
 * Auth: gated by the same cookie auth as the rest of /api/wheelhouse/*
 * (handled by middleware.ts).
 *
 * Idempotent — safe to call multiple times. If tables already have data,
 * the seed step is skipped and existing counts are returned.
 *
 * POST /api/wheelhouse/init
 */
export async function POST() {
  const { backend } = backendStatus();
  if (backend !== "postgres") {
    return NextResponse.json(
      {
        error:
          "Postgres backend not active. Provision a Vercel Postgres database first; POSTGRES_URL env var must be set.",
      },
      { status: 400 },
    );
  }
  try {
    const result = await initSchemaAndSeed();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(backendStatus());
}
