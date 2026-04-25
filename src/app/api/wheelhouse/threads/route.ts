import { NextRequest, NextResponse } from "next/server";
import {
  getThreads,
  createThread,
  type CreateThreadInput,
} from "@/data/wheelhouse-store";

export async function GET() {
  return NextResponse.json({ threads: getThreads() });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<
    CreateThreadInput
  > | null;
  if (
    !body ||
    !body.title ||
    !body.authorId ||
    !Array.isArray(body.participants)
  ) {
    return NextResponse.json(
      { error: "Missing required fields (title, authorId, participants)." },
      { status: 400 },
    );
  }
  const created = createThread({
    title: body.title,
    tags: body.tags ?? [],
    participants: body.participants,
    authorId: body.authorId,
    initialMessage: body.initialMessage,
    state: body.state,
    context: body.context,
  });
  return NextResponse.json({ thread: created }, { status: 201 });
}
