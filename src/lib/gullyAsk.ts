/**
 * Ask Gully — Claude-augmented search synthesis on top of Fuse.js
 * results. Per memory: "Build 'Ask Gully' augmented search — Option
 * A. Fuse returns matches as usual; if query is a question, Claude
 * Haiku synthesizes a short answer from top-N matches with inline
 * citations."
 *
 * Flow:
 *   1. Client detects question → POST to /api/gully/ask
 *   2. Server passes query + top Fuse results to Claude Haiku 4.5
 *   3. Returns short, cited answer in PAL brand voice
 *
 * Brand voice: locals-know, anti-Tourism Bureau platitudes, dry +
 * specific. Citations as [Name] markers — client renders as links
 * to the source slug.
 */

import type { GullyItem } from "./gullySearch";

const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY || "").trim();
const MODEL = "claude-haiku-4-5-20251001";
const MAX_OUTPUT_TOKENS = 600;

const SYSTEM_PROMPT = `You are Ask Gully, the Port A Local site search assistant. PAL (theportalocal.com) is a Port Aransas, TX local guide + services platform. Your job: when someone searches with a question, give a short, useful, brand-voiced answer grounded in the search results provided.

VOICE:
- Locals-know-this-place tone, NOT Tourism Bureau platitudes
- Specific over generic ("the docking parade hits the wharf around 7:30pm" not "you'll love it")
- Dry, observational, helpful
- 2-4 sentences max for most questions; one-liner when possible
- Never invent businesses, prices, or facts — stay grounded in the search results

CITATION FORMAT:
When you mention a specific listing/article from the search results, cite it like:
  [Name of thing](slug-here)
The slug is the result's "slug" field. The client renders these as links.

Example output for "where to eat with kids":
  Tortuga Saltwater Grill is the easy pick — kid menu, outside seating, harbor view: [Tortuga Saltwater Grill](tortuga-saltwater-grill). For something quick: [Wendy's](wendys-port-a) or [DQ](dairy-queen-port-a).

Example for "what is sandfest":
  Sandfest is Port A's annual sand-sculpture festival, late April on the beach near Beach Access 1. It's free, family-friendly, and the master carvers come from all over: [Heritage piece on Sandfest](sandfest-heritage).

If no results are useful: "I don't have something specific on that — try [Heritage](history) for context, or browse [Eat](eat) / [Do](do) directly." (Use the portal slugs.)

Stay grounded. Keep it tight. PAL's voice is "we know this place" — write like it.`;

export interface AskGullyResult {
  ok: boolean;
  answer?: string;
  reason?: string;
  usage?: { inputTokens?: number; outputTokens?: number };
}

/** Heuristic question detector. Server-side double-check (client also checks). */
export function looksLikeQuestion(q: string): boolean {
  const trimmed = q.trim().toLowerCase();
  if (trimmed.length < 4) return false;
  if (trimmed.endsWith("?")) return true;
  return /^(what|who|where|when|why|how|can|could|should|would|is|are|do|does|will|which|whose|tell me|find me|recommend|suggest|show me)\b/.test(
    trimmed,
  );
}

/**
 * Render a compact list of search results for the model context.
 * Cap at top 8 to keep input tokens reasonable.
 */
function renderResultsForContext(items: GullyItem[]): string {
  return items
    .slice(0, 8)
    .map((it, i) => {
      const lines = [
        `[${i + 1}] ${it.name}`,
        `  type: ${it.type} · category: ${it.category} · slug: ${it.slug}`,
      ];
      if (it.tagline) lines.push(`  tagline: ${it.tagline}`);
      if (it.description) {
        const desc = it.description.length > 200
          ? it.description.slice(0, 200) + "…"
          : it.description;
        lines.push(`  description: ${desc}`);
      }
      if (it.tags && it.tags.length) {
        lines.push(`  tags: ${it.tags.slice(0, 8).join(", ")}`);
      }
      if (it.hours) lines.push(`  hours: ${it.hours}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

interface ClaudeMessageResponse {
  content: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export async function askGully(
  query: string,
  topResults: GullyItem[],
): Promise<AskGullyResult> {
  if (!ANTHROPIC_API_KEY) {
    return { ok: false, reason: "ANTHROPIC_API_KEY not set" };
  }
  if (!query || query.trim().length < 3) {
    return { ok: false, reason: "query too short" };
  }
  if (!looksLikeQuestion(query)) {
    return { ok: false, reason: "not a question" };
  }

  const context =
    topResults.length === 0
      ? "(no search results matched — answer with portal-direction fallback only)"
      : renderResultsForContext(topResults);

  const userMessage = `Question: ${query.trim()}

Search results (Fuse.js top matches):
${context}

Answer the question using ONLY the results above. Cite specific items via [Name](slug). Keep it tight.`;

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    return { ok: false, reason: `fetch error: ${err}` };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { ok: false, reason: `api ${res.status}: ${txt.slice(0, 200)}` };
  }

  const data = (await res.json()) as ClaudeMessageResponse;
  const text = data.content?.find((c) => c.type === "text")?.text?.trim();
  if (!text) {
    return { ok: false, reason: "no text in response" };
  }
  return {
    ok: true,
    answer: text,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    },
  };
}
