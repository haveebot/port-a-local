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
  const thread = await getThreadWithMessages(id);
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
  // Per Winston rule 2026-04-29: instant-archive mental model. "Done" is
  // a momentary transition that immediately collapses to "archived".
  // Active board stays clean; the Archived filter holds the history.
  const targetState: ThreadState = body.state === "done" ? "archived" : body.state;
  const updated = await transitionThread(id, targetState);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ thread: updated });
}
