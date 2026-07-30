import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { sendSms } from "@/lib/twilioSms";
import {
  getUnansweredCustomers,
  type UnansweredCustomer,
} from "@/lib/unansweredCustomers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPERATOR_PHONE_E164 = "+15125681725"; // Winston — receives all surface pushes

/** Max customers itemized in one SMS; the rest roll into a "+N more". */
const MAX_LINES = 3;
/** Re-alert cadence while a customer is STILL waiting. */
const REALERT_HOURS = 12;

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS unanswered_customer_alerts (
      phone TEXT PRIMARY KEY,
      last_inbound_at TIMESTAMPTZ NOT NULL,
      alerted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      alert_count INTEGER NOT NULL DEFAULT 1
    );
  `;
  _schemaReady = true;
}

/**
 * Vercel Cron: unanswered-customer watchdog.
 * Schedule: hourly (configured in vercel.json).
 *
 * Closes the gap that let a customer's refund question sit unanswered for
 * six days (2026-07-30 review): the unreplied-leads detector excludes
 * anyone with a booking, so booked customers texting US had no watchdog.
 * The operator gets ONE SMS per pass listing everyone waiting, and —
 * unlike a single fire-and-forget push — it KEEPS re-alerting every
 * REALERT_HOURS until someone actually replies.
 *
 * Auth: Vercel CRON_SECRET bearer (matches the other crons).
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const waiting = await getUnansweredCustomers();
  if (waiting.length === 0) {
    // Nobody waiting — clear the ledger so a future silence alerts fresh.
    try {
      await ensureSchema();
      await sql`DELETE FROM unanswered_customer_alerts`;
    } catch (err) {
      console.error("[unanswered-customers] ledger clear failed:", err);
    }
    return NextResponse.json({ ok: true, waiting: 0, alerted: 0 });
  }

  let alerted = 0;
  try {
    await ensureSchema();

    // Alert when this is a NEWER inbound than we last alerted on, or when
    // they're still waiting and the re-alert window has elapsed.
    const due: UnansweredCustomer[] = [];
    for (const c of waiting) {
      const { rows } = await sql`
        SELECT last_inbound_at, alerted_at FROM unanswered_customer_alerts
        WHERE phone = ${c.phone}
      `;
      if (rows.length === 0) {
        due.push(c);
        continue;
      }
      const prevInbound = new Date(rows[0].last_inbound_at as Date).getTime();
      const prevAlert = new Date(rows[0].alerted_at as Date).getTime();
      const isNewer = new Date(c.lastInboundAt).getTime() > prevInbound;
      const staleEnough = Date.now() - prevAlert >= REALERT_HOURS * 3_600_000;
      if (isNewer || staleEnough) due.push(c);
    }

    if (due.length > 0) {
      const shown = due.slice(0, MAX_LINES);
      const lines = shown.map((c) => {
        const who = c.booking
          ? `${c.booking.nameDisplay} (${c.booking.what}${c.booking.date ? `, ${c.booking.date}` : ""})`
          : c.phoneDisplay;
        return `${who} · waiting ${c.waitHours}h · "${c.lastInboundPreview.slice(0, 40)}"`;
      });
      const overflow =
        due.length > shown.length ? `\n+${due.length - shown.length} more` : "";
      const body =
        `[⚠️ customer waiting] ${due.length} unanswered:\n` +
        lines.join("\n") +
        overflow +
        `\nReply to them from your phone — this repeats every ${REALERT_HOURS}h until answered.`;

      await sendSms(OPERATOR_PHONE_E164, body);
      alerted = due.length;

      for (const c of due) {
        await sql`
          INSERT INTO unanswered_customer_alerts (phone, last_inbound_at, alerted_at, alert_count)
          VALUES (${c.phone}, ${c.lastInboundAt}, NOW(), 1)
          ON CONFLICT (phone) DO UPDATE SET
            last_inbound_at = EXCLUDED.last_inbound_at,
            alerted_at = NOW(),
            alert_count = unanswered_customer_alerts.alert_count + 1;
        `;
      }
    }

    // Drop ledger rows for anyone no longer waiting (they got a reply).
    const stillWaiting = waiting.map((c) => c.phone);
    await sql`
      DELETE FROM unanswered_customer_alerts
      WHERE phone <> ALL(${stillWaiting as unknown as string})
    `;
  } catch (err) {
    console.error("[unanswered-customers] alert failed (fail-open):", err);
  }

  return NextResponse.json({ ok: true, waiting: waiting.length, alerted });
}
