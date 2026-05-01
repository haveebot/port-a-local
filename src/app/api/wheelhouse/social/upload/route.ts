import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/wheelhouse/social/upload
 *
 * Accepts a multipart form with a single "file" field, uploads to Vercel
 * Blob under pal/social/uploads/, returns the public URL. Operator's
 * /wheelhouse/social card uses this when Collie attaches a custom image
 * for a post (photo mode instead of OG link card).
 *
 * Auth: wheelhouse middleware (cookie or bearer).
 *
 * Constraints:
 *   - PNG, JPG, WEBP only
 *   - 8MB max
 *   - Filename randomized via timestamp + slug to avoid collisions
 *
 * Vercel Blob requires BLOB_READ_WRITE_TOKEN env var (auto-injected
 * when a Blob store is created on the project in the Vercel dashboard).
 * If unset, returns a clear setup error so operators know to provision.
 */

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

function safeSlug(name: string): string {
  const dot = name.lastIndexOf(".");
  const stem = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "img";
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  return `${stem}${ext}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "blob_not_configured",
        detail:
          "BLOB_READ_WRITE_TOKEN not set. Create a Blob store in the Vercel dashboard (Storage → Create Blob Store) and the token is auto-injected.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "unsupported_type", got: file.type, accepted: [...ALLOWED] },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", maxBytes: MAX_BYTES, got: file.size },
      { status: 413 },
    );
  }

  const stamp = Date.now();
  const path = `pal/social/uploads/${stamp}-${safeSlug(file.name)}`;
  try {
    const blob = await put(path, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      sizeBytes: file.size,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "upload_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
