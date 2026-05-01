import { NextRequest, NextResponse } from "next/server";
import {
  getImage,
  updateImageAlt,
  setHidden,
} from "@/data/image-library-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Per-image actions.
 *
 * GET    /api/wheelhouse/library/[id]
 * PATCH  /api/wheelhouse/library/[id]  — { altText?, hidden? }
 * DELETE /api/wheelhouse/library/[id]  — soft delete (sets hidden=true)
 */

interface PatchBody {
  altText?: string | null;
  hidden?: boolean;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const image = await getImage(id);
  if (!image) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ image });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  if (body.altText !== undefined) {
    if (body.altText !== null && typeof body.altText !== "string") {
      return NextResponse.json({ error: "invalid_altText" }, { status: 400 });
    }
    await updateImageAlt(id, body.altText);
  }
  if (body.hidden !== undefined) {
    if (typeof body.hidden !== "boolean") {
      return NextResponse.json({ error: "invalid_hidden" }, { status: 400 });
    }
    await setHidden(id, body.hidden);
  }
  const image = await getImage(id);
  return NextResponse.json({ image });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  await setHidden(id, true);
  return NextResponse.json({ ok: true, softDeleted: true });
}
