import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { runSocialComposer } from "@/lib/socialComposerAgent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/wheelhouse/social/compose
 *
 * Body: { prompt: string }
 *
 * Runs the inline Claude composer agent. Returns one of:
 *   - drafted: post queued, includes postId + caption + linkUrl
 *   - clarify: agent needs more info, includes question
 *   - declined: prompt was off-brand or impossible, includes reason
 *   - error: agent or API failure, includes reason
 *
 * Auth: wheelhouse middleware (cookie or bearer).
 */

interface ComposeBody {
  prompt?: string;
}

async function getCurrentUser(req: NextRequest): Promise<string> {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (who) return who;
  const agent = req.headers.get("x-wheelhouse-agent");
  if (agent) return agent;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ComposeBody | null;
  const prompt = body?.prompt?.trim() ?? "";
  if (!prompt) {
    return NextResponse.json(
      { error: "missing_prompt" },
      { status: 400 },
    );
  }
  if (prompt.length > 800) {
    return NextResponse.json(
      { error: "prompt_too_long", maxChars: 800 },
      { status: 413 },
    );
  }

  const who = await getCurrentUser(req);
  const result = await runSocialComposer(prompt, who);
  const status =
    result.status === "drafted"
      ? 201
      : result.status === "clarify"
        ? 200
        : result.status === "declined"
          ? 200
          : 500;
  return NextResponse.json(result, { status });
}
