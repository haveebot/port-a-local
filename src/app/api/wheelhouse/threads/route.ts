import { NextRequest, NextResponse } from "next/server";
import {
  getThreads,
  createThread,
  type CreateThreadInput,
} from "@/data/wheelhouse-store";
import type { ParticipantId } from "@/data/wheelhouse-types";

export async function GET() {
  const threads = await getThreads();
  return NextResponse.json({ threads });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<
    CreateThreadInput
  > | null;

  // Agent token auth overrides body authorId (security: prevent impersonation)
  const agentFromHeader = req.headers.get("x-wheelhouse-agent") as
    | ParticipantId
    | null;
  const authorId = agentFromHeader ?? body?.authorId;

  if (
    !body ||
    !body.title ||
    !authorId ||
    !Array.isArray(body.participants)
  ) {
    return NextResponse.json(
      { error: "Missing required fields (title, authorId or token, participants)." },
      { status: 400 },
    );
  }
  const created = await createThread({
    title: body.title,
    tags: body.tags ?? [],
    participants: body.participants,
    authorId,
    initialMessage: body.initialMessage,
    state: body.state,
    context: body.context,
  });
  return NextResponse.json({ thread: created }, { status: 201 });
}
