/**
 * Operator SMS alert for NEW unreplied leads.
 *
 * The daily Pulse renders every currently-quiet lead, but the Pulse is a
 * pull surface — it only helps if the operator opens the Wheelhouse. This
 * is the push side: when the Pulse computes the quiet-leads list, any lead
 * we haven't alerted on yet gets rolled into ONE operator SMS.
 *
 * Dedupe: `unreplied_lead_alerts` is keyed on the lead's phone and stores
 * the last_outbound_at we alerted on. A lead re-alerts only when a NEWER
 * outbound to that number goes quiet again — fresh conversation, fresh
 * silence, fresh signal. A lead that simply stays quiet keeps showing in
 * the Pulse but never re-texts the operator.
 *
 * Deliberately alert-only: no automated follow-up ever goes to the lead.
 * The operator decides who gets nudged (2026-07-18 call — the detector
 * watches, humans choose recovery).
 *
 * Fail-open like the detector: any error logs and returns 0 so the Pulse
 * never breaks on this section.
 */

import { sql } from "@vercel/postgres";
import { sendSms } from "@/lib/twilioSms";
import type { UnrepliedLead } from "@/lib/unrepliedLeads";

const OPERATOR_PHONE_E164 = "+15125681725"; // Winston — receives all surface pushes

/** Max leads itemized in the SMS body; the rest roll into a "+N more". */
const MAX_LINES = 3;

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS unreplied_lead_alerts (
      phone TEXT PRIMARY KEY,
      last_outbound_at TIMESTAMPTZ NOT NULL,
      alerted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  _schemaReady = true;
}

/**
 * Send the operator one SMS covering every lead in `leads` that hasn't
 * been alerted on yet. Returns how many leads were newly alerted.
 */
export async function alertNewUnrepliedLeads(
  leads: UnrepliedLead[],
): Promise<number> {
  try {
    if (leads.length === 0) return 0;
    await ensureSchema();

    // NEW = never alerted on this phone, or its latest outbound is newer
    // than the one we alerted on (a fresh touch went quiet again).
    const fresh: UnrepliedLead[] = [];
    for (const lead of leads) {
      const { rows } = await sql`
        SELECT last_outbound_at FROM unreplied_lead_alerts
        WHERE phone = ${lead.phone}
      `;
      const prev = rows[0]?.last_outbound_at
        ? new Date(rows[0].last_outbound_at as Date).getTime()
        : 0;
      if (new Date(lead.lastOutboundAt).getTime() > prev) fresh.push(lead);
    }
    if (fresh.length === 0) return 0;

    const shown = fresh.slice(0, MAX_LINES);
    const lines = shown.map(
      (l) => `${l.phoneDisplay} · ${l.quietHours}h · "${l.lastOutboundPreview.slice(0, 40)}"`,
    );
    const overflow =
      fresh.length > shown.length ? `\n+${fresh.length - shown.length} more` : "";
    const body =
      `[leads 🔕] ${fresh.length} unreplied lead${fresh.length === 1 ? "" : "s"}:\n` +
      lines.join("\n") +
      overflow +
      `\nFull list in today's Pulse.`;

    await sendSms(OPERATOR_PHONE_E164, body);

    // Record after the send attempt — sendSms is log-on-error, and the
    // Pulse digest remains the backstop surface if a carrier drops it.
    for (const lead of fresh) {
      await sql`
        INSERT INTO unreplied_lead_alerts (phone, last_outbound_at, alerted_at)
        VALUES (${lead.phone}, ${lead.lastOutboundAt}, NOW())
        ON CONFLICT (phone) DO UPDATE SET
          last_outbound_at = EXCLUDED.last_outbound_at,
          alerted_at = NOW();
      `;
    }
    return fresh.length;
  } catch (err) {
    console.error("[unreplied-lead-alert] failed (fail-open):", err);
    return 0;
  }
}
