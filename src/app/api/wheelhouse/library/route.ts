import { NextRequest, NextResponse } from "next/server";
import { listImages } from "@/data/image-library-store";
import {
  uploadAndCatalog,
  validateUploadEnv,
  validateFile,
} from "@/lib/imageUpload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET  /api/wheelhouse/library — list images (visible by default)
 * POST /api/wheelhouse/library — upload new image to library
 *
 * Auth: wheelhouse middleware (cookie or bearer).
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeHidden = url.searchParams.get("hidden") === "true";
  const limit = Number(url.searchParams.get("limit") ?? 200);
  const images = await listImages({
    limit: Number.isFinite(limit) ? limit : 200,
    includeHidden,
  });
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const envCheck = validateUploadEnv();
  if (!envCheck.ok) {
    return NextResponse.json(
      { error: envCheck.error, detail: envCheck.detail },
      { status: envCheck.status },
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
  const fileCheck = validateFile(file);
  if (!fileCheck.ok) {
    return NextResponse.json(
      { error: fileCheck.error, detail: fileCheck.detail },
      { status: fileCheck.status },
    );
  }
  const who = req.headers.get("x-wheelhouse-agent") ?? null;
  const result = await uploadAndCatalog(file, who);
  if (!result.ok || !result.image) {
    return NextResponse.json(
      { error: result.error ?? "upload_failed" },
      { status: result.status ?? 500 },
    );
  }
  return NextResponse.json({ image: result.image }, { status: 201 });
}
