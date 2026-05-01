/**
 * "Ask Havee" — natural-language post composer agent.
 *
 * Collie types a prompt like "fishing tournament season is here, link
 * to the events" and the agent drafts a caption + picks the right URL +
 * queues it as pending FB so she can review/edit/send.
 *
 * Model: Haiku 4.5 — same family as the SMS Havee agent. Cheap, fast.
 *
 * Tools available to the agent:
 *   - queue_post: insert a pending row into social_post_queue
 *   - clarify_question: return a Q to the UI when the prompt is too vague
 *   - decline: return a reason when the prompt is off-brand or impossible
 *
 * Brand voice + URL inventory seeded into system prompt so the agent
 * stays in Collie's voice + only links to real PAL surfaces.
 *
 * Mirrors insiderSmsAgent.ts pattern (multi-iteration tool loop) for
 * consistency. Volume will be low (~10/day max). Cost: pennies/month.
 */

import { events } from "@/data/events";
import { dispatches } from "@/data/dispatches";
import { stories } from "@/data/stories";
import { queuePost, type PostChannel } from "@/data/social-post-store";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_ITERATIONS = 4;

function getAnthropicKey(): string {
  return (process.env.ANTHROPIC_API_KEY || "").trim();
}

const SITE = "https://theportalocal.com";

/**
 * Build the URL inventory Claude can pick from. Pulled live from the
 * site's data files so it never gets stale. Includes published events
 * (with dates), recent dispatches + heritage, and the evergreen
 * tooling pages that drive site traffic.
 */
function buildUrlInventory(): string {
  const today = new Date();
  const upcomingEvents = events
    .filter((e) => e.published && new Date(e.endISO) >= today)
    .sort(
      (a, b) =>
        new Date(a.startISO).getTime() - new Date(b.startISO).getTime(),
    )
    .slice(0, 8)
    .map(
      (e) =>
        `  • /events/${e.slug} — "${e.name}" (${e.dateLabel}) · ${e.tagline}`,
    )
    .join("\n");

  const recentDispatches = dispatches
    .slice(0, 5)
    .map(
      (d) =>
        `  • /dispatch/${d.slug} — "${d.title}" · ${d.subtitle.slice(0, 100)}`,
    )
    .join("\n");

  const recentHeritage = stories
    .slice(0, 5)
    .map(
      (s) =>
        `  • /history/${s.slug} — "${s.title}" · ${s.subtitle.slice(0, 100)}`,
    )
    .join("\n");

  return `EVERGREEN TRAFFIC SURFACES (use the corresponding URL):
  • /live-music — Who's playing where this week (Gaff, Shorty's, Bron's, Sip Yard, etc.)
  • /fishing-report — Daily report: tide, water temp, wind, what's biting
  • /live — Live webcams, tide chart, surf, wind, ferry wait
  • /my-trip — Trip Planner — add eats/do/fish to a personal list (no login)
  • /guides — Curated guides (happy hours, pet-friendly, sunsets, family, date night, etc.)
  • /events — Full events calendar
  • /dispatch — Investigative + commentary
  • /history — Heritage pieces (long-form local history)
  • / — Homepage

UPCOMING EVENTS (link to specific event for max engagement):
${upcomingEvents || "  (none upcoming)"}

RECENT DISPATCH PIECES:
${recentDispatches}

RECENT HERITAGE PIECES:
${recentHeritage}`;
}

const BRAND_VOICE_RULES = `BRAND VOICE (Collie-locked, applies to every caption):
- Tone: knowledgeable local giving recommendations · curated guide · clean tool
- NOT: tourism board, travel blog, corporate directory, hype-bro, content marketer
- Short, clear, minimal fluff, no hype
- Specific over generic — name the venue, name the time, name the dish
- No ALL CAPS (except wordmarks). No exclamation spam.
- BANNED words: "amazing", "must-see", "incredible", "MUST-TRY", "epic", "ultimate", "unforgettable", "you won't believe", "stunning"
- Emoji: only when the source content already uses one (e.g. an event with 🪁 in its data). Do NOT add emoji decoratively.
- FB caption: lead with the hook, close with the URL on its own line
- Length: 60-200 words ideal. Sometimes shorter is better.

CAPTION SHAPE EXAMPLES (good):

Example 1 — Live music:
"Seven spots, seven acts, one Friday night.

The Gaff · Aaron Boultinghouse · 7pm
Bron's · Harmonx · 7pm
[etc]

https://theportalocal.com/live-music"

Example 2 — Feature spotlight:
"Building a trip to PA?

We made a planner for that. Add the spots that catch your eye — eat, drink, fish, do — and we'll keep them in one place. No login, no account.

https://theportalocal.com/my-trip"

Example 3 — Event:
"One week from today —

Fly It Port A's 2026 Spring Kite Festival.

A free Mother's Day weekend kite fly on the south end of Mustang Island.

May 8–10 · main flying day Saturday May 9.

https://theportalocal.com/events/spring-kite-festival-2026"

Example 4 — Editorial follow-up:
"8.7%.

That's how full the Nueces reservoirs are as of April. Lowest combined capacity on record.

What it means for the island, the bay, and the people who make a living on the water.

https://theportalocal.com/dispatch/nueces-drought-disaster-2026"`;

const SYSTEM_PROMPT_BASE = `You are Havee — Port A Local's marketing assistant. When Collie (or Winston) gives you a prompt for a social post, you draft the caption + pick the right link + queue it as a PENDING FB post for them to review.

YOUR JOB:
1. Read the prompt
2. Pick the right destination URL from the inventory below
3. Draft a caption that matches PAL's brand voice (also below)
4. Call queue_post with the caption + URL
5. End your turn

RULES:
- Always call queue_post exactly once if the prompt is clear
- If the prompt is genuinely vague (e.g. "do a post" with no topic), call clarify_question once
- If the prompt is off-brand (e.g. asking for hype-marketing language, asking to link to a competitor) call decline
- One post per prompt — don't queue multiple variants
- channel is always "facebook" (IG isn't wired up yet)
- triggerRef should be a short slug like "askhavee:fishing-report" or "askhavee:kite-festival"
- The operator will edit + send manually, so being slightly imperfect is fine. Being inaccurate (wrong dates, wrong URLs, made-up details) is NOT fine.

${BRAND_VOICE_RULES}`;

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

const TOOLS: ToolDefinition[] = [
  {
    name: "queue_post",
    description:
      "Queue a new pending social post for operator review. Caption is the full FB post text. linkUrl is the destination on theportalocal.com. triggerRef is a short tracking slug.",
    input_schema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          enum: ["facebook"],
          description: "Channel to post to (always 'facebook' for now)",
        },
        caption: {
          type: "string",
          description:
            "Full FB caption — hook → body → URL on its own line. Brand voice rules apply strictly.",
        },
        linkUrl: {
          type: "string",
          description:
            "Destination URL on theportalocal.com. Must be a real surface from the inventory.",
        },
        triggerRef: {
          type: "string",
          description:
            "Short tracking slug like 'askhavee:fishing-report' or 'askhavee:kite-festival'",
        },
      },
      required: ["channel", "caption", "linkUrl", "triggerRef"],
    },
  },
  {
    name: "clarify_question",
    description:
      "Ask the operator for clarification when the prompt is genuinely vague. Use sparingly — most prompts can be acted on with a sensible interpretation.",
    input_schema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question to ask the operator",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "decline",
    description:
      "Decline to queue a post when the prompt is off-brand, impossible (no matching URL), or otherwise can't be fulfilled.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Plain-English reason — operator will see this",
        },
      },
      required: ["reason"],
    },
  },
];

export interface ComposeResult {
  ok: boolean;
  status: "drafted" | "clarify" | "declined" | "error";
  postId?: number;
  caption?: string;
  linkUrl?: string;
  question?: string;
  reason?: string;
  iterations?: number;
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface ClaudeResponse {
  content: ClaudeContentBlock[];
  stop_reason: string;
}

export async function runSocialComposer(
  prompt: string,
  who: string,
): Promise<ComposeResult> {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    return {
      ok: false,
      status: "error",
      reason: "ANTHROPIC_API_KEY not set on server",
    };
  }

  const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\nTODAY: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}\n\n${buildUrlInventory()}`;

  const messages: Array<{ role: string; content: unknown }> = [
    {
      role: "user",
      content: `${who} asks: "${prompt}"`,
    },
  ];

  type DraftedShape = { postId: number; caption: string; linkUrl: string };
  let drafted: DraftedShape | null = null;
  let clarify: string | null = null;
  let declined: string | null = null;
  let lastIteration = 0;

  function buildResult(): ComposeResult {
    if (drafted) {
      return {
        ok: true,
        status: "drafted",
        postId: drafted.postId,
        caption: drafted.caption,
        linkUrl: drafted.linkUrl,
        iterations: lastIteration,
      };
    }
    if (clarify) {
      return {
        ok: true,
        status: "clarify",
        question: clarify,
        iterations: lastIteration,
      };
    }
    if (declined) {
      return {
        ok: true,
        status: "declined",
        reason: declined,
        iterations: lastIteration,
      };
    }
    return {
      ok: false,
      status: "error",
      reason: "agent ended without action",
      iterations: lastIteration,
    };
  }

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    lastIteration = i + 1;
    let res: Response;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          tools: TOOLS,
          messages,
        }),
      });
    } catch (err) {
      return {
        ok: false,
        status: "error",
        reason: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        status: "error",
        reason: `api ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as ClaudeResponse;
    const stopReason = data.stop_reason;

    if (stopReason !== "tool_use") {
      return buildResult();
    }

    const toolResults: Array<{
      type: string;
      tool_use_id: string;
      content: string;
    }> = [];

    for (const block of data.content) {
      if (block.type === "tool_use" && block.id && block.name) {
        const result = await executeTool(
          block.name,
          (block.input ?? {}) as Record<string, unknown>,
          who,
        );
        if (result.kind === "drafted") {
          drafted = {
            postId: result.postId,
            caption: result.caption,
            linkUrl: result.linkUrl,
          };
        } else if (result.kind === "clarify") {
          clarify = result.question;
        } else if (result.kind === "declined") {
          declined = result.reason;
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result.message,
        });
      }
    }

    messages.push({ role: "assistant", content: data.content });
    messages.push({ role: "user", content: toolResults });

    if (drafted || clarify || declined) {
      return buildResult();
    }
  }

  return buildResult();
}

type ToolExecution =
  | {
      kind: "drafted";
      postId: number;
      caption: string;
      linkUrl: string;
      message: string;
    }
  | { kind: "clarify"; question: string; message: string }
  | { kind: "declined"; reason: string; message: string }
  | { kind: "error"; message: string };

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  who: string,
): Promise<ToolExecution> {
  if (name === "queue_post") {
    const channel = String(input.channel || "facebook") as PostChannel;
    const caption = String(input.caption || "").trim();
    const linkUrl = String(input.linkUrl || "").trim();
    const triggerRef = String(input.triggerRef || `askhavee:${Date.now()}`);
    if (!caption) {
      return { kind: "error", message: "ERROR: caption is empty" };
    }
    if (!linkUrl) {
      return { kind: "error", message: "ERROR: linkUrl is empty" };
    }
    try {
      new URL(linkUrl);
    } catch {
      return { kind: "error", message: "ERROR: linkUrl is not a valid URL" };
    }
    if (!linkUrl.startsWith(SITE) && linkUrl !== SITE) {
      return {
        kind: "error",
        message: `ERROR: linkUrl must start with ${SITE} (got ${linkUrl})`,
      };
    }
    try {
      const post = await queuePost({
        triggerType: "manual",
        triggerRef,
        channel,
        caption,
        linkUrl,
        metadata: { source: "askhavee", composedBy: who },
      });
      return {
        kind: "drafted",
        postId: post.id,
        caption,
        linkUrl,
        message: `Queued post #${post.id} (${channel}, link=${linkUrl})`,
      };
    } catch (err) {
      return {
        kind: "error",
        message: `ERROR queuing post: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  if (name === "clarify_question") {
    const q = String(input.question || "").trim();
    if (!q) return { kind: "error", message: "ERROR: question is empty" };
    return { kind: "clarify", question: q, message: `Asked: "${q}"` };
  }

  if (name === "decline") {
    const r = String(input.reason || "").trim();
    if (!r) return { kind: "error", message: "ERROR: reason is empty" };
    return { kind: "declined", reason: r, message: `Declined: ${r}` };
  }

  return { kind: "error", message: `ERROR: unknown tool ${name}` };
}
