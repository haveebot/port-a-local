import { NextRequest, NextResponse } from "next/server";
import {
  getThreadWithMessages,
  transitionThread,
} from "@/data/wheelhouse-store";
import type { ThreadState } from "@/data/wheelhouse-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const thread = getThreadWithMessages(id);
  if (!thread)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ thread });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { state?: ThreadState } | null;
  if (!body?.state)
    return NextResponse.json(
      { error: "Missing 'state' field." },
      { status: 400 },
    );
  const updated = transitionThread(id, body.state);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ thread: updated });
}
