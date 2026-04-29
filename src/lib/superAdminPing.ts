/**
 * Super-admin revenue ping — fan-out SMS notification to Winston, Nick,
 * Collie (or whoever's in `super-admins.ts`) the moment PAL collects a
 * dollar. Wired into every paid event endpoint.
 *
 * Format:
 *   PAL 💰 $135 - Cart rental booked
 *   4-pass cart · May 12-16 (5 days)
 *   J. Smith
 *
 * Block-spaced like Collie's lead-blast revisions for fast skim. Includes
 * STOP for compliance even though the campaign description covers
 * operator-side transactional. Sequential 600ms pacing under AT&T 1.25 mps.
 */

import { sendSms } from "./twilioSms";
import {
  getSuperAdminsFor,
  REVENUE_EMOJI,
  REVENUE_LABEL,
  type RevenueKind,
} from "@/data/super-admins";

export interface RevenuePingInput {
  kind: RevenueKind;
  amountCents: number;
  /** One-line summary, e.g. "4-pass cart · May 12-16 (5 days)" */
  summary: string;
  /** Optional customer initial / display, e.g. "J. Smith" or "Tony R." */
  customerDisplay?: string;
}

function fmtAmount(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function buildSuperAdminPingSms(input: RevenuePingInput): string {
  const { kind, amountCents, summary, customerDisplay } = input;
  const emoji = REVENUE_EMOJI[kind];
  const label = REVENUE_LABEL[kind];
  const lines = [
    `PAL ${emoji} ${fmtAmount(amountCents)} - ${label}`,
    summary,
  ];
  if (customerDisplay) lines.push(customerDisplay);
  return lines.join("\n\n");
}

/**
 * Fire the super-admin ping. Sequential 600ms pacing. Best-effort —
 * caller should NOT await blocking on this in a customer-facing flow.
 * Any error is logged and swallowed so a Twilio hiccup doesn't crash
 * the order-confirmation cascade.
 */
export async function pingSuperAdmins(input: RevenuePingInput): Promise<void> {
  const recipients = getSuperAdminsFor(input.kind);
  if (recipients.length === 0) return;
  const body = buildSuperAdminPingSms(input);
  let i = 0;
  for (const sa of recipients) {
    try {
      await sendSms(sa.phoneE164, body);
    } catch (err) {
      console.error(
        `[super-admin-ping] send failed for ${sa.slug} (${input.kind}):`,
        err,
      );
    }
    i++;
    if (i < recipients.length) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

/**
 * Format a customer name as "First L." for the ping line — privacy-light
 * but recognizable. Falls back to first name only or "(no name)".
 */
export function formatCustomerDisplay(fullName: string | null | undefined): string | undefined {
  const name = (fullName || "").trim();
  if (!name) return undefined;
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}
