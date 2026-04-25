import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/data/wheelhouse-store";
import type { MessageType, ParticipantId } from "@/data/wheelhouse-types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    authorId?: ParticipantId;
    type?: MessageType;
    body?: string;
  } | null;

  if (!body?.authorId || !body?.type || !body?.body) {
    return NextResponse.json(
      { error: "Missing required fields (authorId, type, body)." },
      { status: 400 },
    );
  }

  const created = await createMessage({
    threadId: id,
    authorId: body.authorId,
    type: body.type,
    body: body.body,
  });
  if (!created)
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  return NextResponse.json({ message: created }, { status: 201 });
}
