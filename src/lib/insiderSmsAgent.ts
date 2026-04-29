/**
 * Inline Claude agent for insider SMS — Option B from the 2026-04-29
 * design discussion. When an insider (Winston, Collie, Nick) texts PAL,
 * the inbound webhook fires this agent. Claude reads the message,
 * decides an action, and executes via tools (reply, send, escalate).
 *
 * Model: Haiku 4.5 — cheap + fast (~1-2s per call). Volume is low
 * (~5 messages/day) so cost is trivial (~$0.05/day max).
 *
 * Tools available to the agent:
 *   - reply_to_sender: SMS reply back to the insider
 *   - send_sms_to_third_party: SMS from PAL to anyone else (Patricia case)
 *   - escalate_to_winston: surface to Winston for manual handling
 *
 * Hard rule: agent must escalate (not auto-act) for spending,
 * customer-policy decisions, destructive actions, published content,
 * payment actions, vendor-side decisions. See SYSTEM_PROMPT for the
 * full action permissions matrix.
 */

import { sendSms } from "./twilioSms";
import type { Insider } from "@/data/insiders";

// Read at invocation time (NOT module load) so env changes pick up
// without waiting for a function-instance cold-start.
function getAnthropicKey(): string {
  return (process.env.ANTHROPIC_API_KEY || "").trim();
}
const MODEL = "claude-haiku-4-5-20251001";
const MAX_ITERATIONS = 3;
const WINSTON_PHONE_E164 = "+15125681725";

const SYSTEM_PROMPT = `You are PAL Concierge — an AI assistant for Port A Local (theportalocal.com), invoked when an insider texts PAL's SMS line (+13614281706).

INSIDERS:
- Winston: PAL operator, owner, admin authority
- Collie: PAL marketing partner, brand voice, outreach
- Nick: Heye Lab founder, platform-tech / CityDeploy context

YOUR JOB: read the inbound text, decide an action, execute or escalate.

TOOLS:
- reply_to_sender(body): SMS reply to the insider who just texted (always do this to confirm what you did)
- send_sms_to_third_party(to_e164, body): SMS from PAL's number to anyone else (e.g. "send Patricia a note")
- escalate_to_winston(reason, summary): surface to Winston for manual handling

YOU CAN ACT AUTONOMOUSLY for:
- Sending benign brand-voice texts on insider request (e.g. "text my friend X this note")
- Confirming receipt / acknowledging
- Asking clarifying questions
- Looking up info from PAL public data (you don't have data tools yet, so for now: surface what you'd need to look up)

YOU MUST ESCALATE TO WINSTON for:
- Anything spending money or moving funds
- Anything customer-facing with policy implications
- Destructive actions (cancellations, refunds, deletes, removing vendors)
- Published content (web copy, social posts, press releases)
- Payment actions (Stripe, refunds, transfers)
- Vendor-side decisions (cart/beach vendor approvals, opt-outs, removals)
- Anything you're unsure about

BRAND VOICE:
- Customer-facing SMS: sign with "— The Port A Local"
- Insider replies (sender or escalation): "- Claude" sign-off is fine, signals automation transparency
- Compliance: include "STOP to opt out" only for recurring transactional content; one-off personal notes don't need it

PROCESS:
1. Read inbound carefully
2. If clearly actionable autonomously: call the appropriate tool, then reply_to_sender to confirm
3. If clearly an escalation: call escalate_to_winston, then reply_to_sender confirming you escalated
4. If ambiguous or just thanks/ack: reply_to_sender with brief acknowledgement only — don't loop
5. End your turn after action + confirmation

Keep replies tight (under 160 chars when possible). No emoji unless the insider used one first.`;

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

const TOOLS: ToolDefinition[] = [
  {
    name: "reply_to_sender",
    description:
      "Send an SMS reply back to the insider who just texted PAL. Use this to confirm what you did or to ask a clarifying question.",
    input_schema: {
      type: "object",
      properties: {
        body: { type: "string", description: "SMS body, ideally under 160 chars" },
      },
      required: ["body"],
    },
  },
  {
    name: "send_sms_to_third_party",
    description:
      "Send an SMS from PAL's number (+13614281706) to a third party (NOT the insider sender). Use for fulfilling requests like 'send my friend a note'. The recipient will see PAL as the sender.",
    input_schema: {
      type: "object",
      properties: {
        to_e164: {
          type: "string",
          description:
            "Recipient phone in E.164 format (must start with +1 followed by 10 digits)",
        },
        body: { type: "string", description: "SMS body" },
      },
      required: ["to_e164", "body"],
    },
  },
  {
    name: "escalate_to_winston",
    description:
      "Surface the inbound to Winston for manual handling. Use when the request requires authorization, judgment, or is outside autonomous-action permissions.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Why this needs Winston's attention",
        },
        summary: {
          type: "string",
          description: "Short summary of the inbound + relevant context",
        },
      },
      required: ["reason", "summary"],
    },
  },
];

export interface AgentResult {
  ran: boolean;
  iterations?: number;
  toolsCalled?: string[];
  reason?: string;
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

export async function runInsiderAgent(
  insider: Insider,
  body: string,
): Promise<AgentResult> {
  const apiKey = getAnthropicKey();
  console.log(
    `[insider-agent] entry — keyPresent=${!!apiKey} keyLen=${apiKey.length} insider=${insider.name}`,
  );
  if (!apiKey) {
    console.log(
      "[insider-agent] ANTHROPIC_API_KEY not set — skipping inline Claude",
    );
    return { ran: false, reason: "ANTHROPIC_API_KEY not set" };
  }

  const messages: Array<{ role: string; content: unknown }> = [
    {
      role: "user",
      content: `Inbound SMS just received from ${insider.name} (${insider.role}):\n\n"${body}"`,
    },
  ];

  const toolsCalled: string[] = [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
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
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          messages,
        }),
      });
    } catch (err) {
      console.error("[insider-agent] fetch failed:", err);
      return { ran: false, reason: `fetch error: ${err}` };
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[insider-agent] Claude API ${res.status}: ${errText}`);
      return { ran: false, reason: `api ${res.status}` };
    }

    const data = (await res.json()) as ClaudeResponse;
    const stopReason = data.stop_reason;

    if (stopReason === "end_turn") {
      return { ran: true, iterations: i + 1, toolsCalled };
    }

    if (stopReason !== "tool_use") {
      console.warn(
        `[insider-agent] unexpected stop_reason ${stopReason} — ending`,
      );
      return {
        ran: true,
        iterations: i + 1,
        toolsCalled,
        reason: `stop_reason=${stopReason}`,
      };
    }

    // Execute tool calls in this turn
    const toolResults: Array<{
      type: string;
      tool_use_id: string;
      content: string;
    }> = [];
    for (const block of data.content) {
      if (block.type === "tool_use" && block.id && block.name) {
        toolsCalled.push(block.name);
        const result = await executeTool(
          block.name,
          (block.input ?? {}) as Record<string, unknown>,
          insider,
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    messages.push({ role: "assistant", content: data.content });
    messages.push({ role: "user", content: toolResults });
  }

  console.warn(
    `[insider-agent] hit MAX_ITERATIONS (${MAX_ITERATIONS}) — ending`,
  );
  return {
    ran: true,
    iterations: MAX_ITERATIONS,
    toolsCalled,
    reason: "max_iterations",
  };
}

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  insider: Insider,
): Promise<string> {
  if (name === "reply_to_sender") {
    const body = String(input.body || "").trim();
    if (!body) return "ERROR: empty body";
    if (body.length > 1500) return "ERROR: body too long (>1500 chars)";
    try {
      await sendSms(insider.phoneE164, body);
      return `Replied to ${insider.name} via SMS (${body.length} chars)`;
    } catch (err) {
      return `ERROR sending reply: ${err}`;
    }
  }

  if (name === "send_sms_to_third_party") {
    const to = String(input.to_e164 || "").trim();
    const body = String(input.body || "").trim();
    if (!/^\+1\d{10}$/.test(to)) {
      return "ERROR: to_e164 must be E.164 format like +13615551234";
    }
    if (!body) return "ERROR: empty body";
    if (body.length > 1500) return "ERROR: body too long (>1500 chars)";
    try {
      await sendSms(to, body);
      return `Sent SMS to ${to} (${body.length} chars)`;
    } catch (err) {
      return `ERROR sending: ${err}`;
    }
  }

  if (name === "escalate_to_winston") {
    const reason = String(input.reason || "").trim();
    const summary = String(input.summary || "").trim();
    if (!reason && !summary) return "ERROR: reason and summary required";
    const body =
      `[Claude → Winston] ESCALATION\n\n` +
      `From: ${insider.name}\n` +
      `Reason: ${reason}\n\n` +
      `Summary: ${summary}\n\n` +
      `Reply or start a Claude session to handle.`;
    try {
      await sendSms(WINSTON_PHONE_E164, body.slice(0, 1500));
      return `Escalated to Winston via SMS`;
    } catch (err) {
      return `ERROR escalating: ${err}`;
    }
  }

  return `ERROR: unknown tool ${name}`;
}
