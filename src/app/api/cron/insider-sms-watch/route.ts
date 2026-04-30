import { NextResponse } from "next/server";
import { findInsider } from "@/data/insiders";
import { filterUnseen, markSeen } from "@/data/insider-sms-seen";
import { sendSms } from "@/lib/twilioSms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: insider SMS watcher (operator-only notification)
 * Schedule: every minute (configured in vercel.json)
 *
 * Polls Twilio for recent inbound SMS to PAL's number. For each new
 * message from Collie or Nick, fires a single push SMS notification
 * to Winston (operator) so his lock screen surfaces the message within
 * ~1 minute of arrival.
 *
 * IMPORTANT — design decision (Winston 2026-04-29):
 *   Insiders' communications with PAL/Claude are PRIVATE per-insider.
 *   We do NOT cross-broadcast between insiders (Nick doesn't see
 *   Collie's texts to PAL, and vice versa). Only the operator
 *   (Winston) gets the surface, and only when the inbound is FROM
 *   Nick or Collie — never from Winston himself.
 *
 * Pairs with the existing inbound webhook:
 *   - Webhook fires immediately on each SMS, forwarding to admin@
 *     email (richer + threaded surface; lives in Winston's inbox)
 *   - This cron fires a faster lock-screen SMS to Winston so even
 *     if email push lags, the message surfaces inside ~60 seconds
 *
 * Auth: Vercel sends Authorization: Bearer <CRON_SECRET>. Same
 * pattern as /api/wheelhouse/cron/pulse.
 *
 * Idempotency: filterUnseen + markSeen against insider_sms_seen.
 * Even if Vercel re-fires this cron (network blip, retry), each
 * message only triggers Winston's notification once.
 */

const OPERATOR_PHONE_E164 = "+15125681725"; // Winston

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || "";

interface TwilioMessage {
  sid: string;
  from: string;
  body: string;
  date_sent: string | null;
  num_media: string;
}

async function fetchRecentInbound(): Promise<TwilioMessage[]> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) return [];
  // Pull inbound for last hour — safe overshoot for a 1-minute cron.
  const auth =
    "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
  const url = new URL(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
  );
  url.searchParams.set("To", TWILIO_PHONE);
  url.searchParams.set("PageSize", "30");
  const res = await fetch(url.toString(), { headers: { Authorization: auth } });
  if (!res.ok) {
    console.error(`[insider-sms-watch] twilio list ${res.status}`);
    return [];
  }
  const data = await res.json();
  return (data.messages ?? []) as TwilioMessage[];
}

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const recent = await fetchRecentInbound();
  if (recent.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, broadcast: 0 });
  }

  // Filter to messages from known insiders.
  const insiderMessages = recent
    .map((m) => ({ ...m, insider: findInsider(m.from) }))
    .filter((m) => m.insider !== null);

  if (insiderMessages.length === 0) {
    return NextResponse.json({
      ok: true,
      scanned: recent.length,
      from_insiders: 0,
      broadcast: 0,
    });
  }

  // Dedupe — only broadcast SIDs we haven't seen yet.
  const candidateSids = insiderMessages.map((m) => m.sid);
  const newSids = await filterUnseen(candidateSids);
  const newSet = new Set(newSids);
  const toBroadcast = insiderMessages.filter((m) => newSet.has(m.sid));

  if (toBroadcast.length === 0) {
    return NextResponse.json({
      ok: true,
      scanned: recent.length,
      from_insiders: insiderMessages.length,
      broadcast: 0,
      reason: "all already seen",
    });
  }

  // Operator-only notification path: fire ONE SMS to Winston for each
  // new inbound that's FROM Nick or Collie (NOT from Winston himself).
  // Sender's own messages are tracked (markSeen) but no notification.
  // Recency filter: skip anything older than 5 minutes so first deploy
  // / restart doesn't backfill notifications for stale messages.
  const fiveMinutesAgoMs = Date.now() - 5 * 60 * 1000;
  let notified = 0;
  for (const m of toBroadcast) {
    const sender = m.insider!;
    if (sender.phoneE164 === OPERATOR_PHONE_E164) {
      // Winston's own SMS to PAL — track but don't self-notify
      continue;
    }
    const sentMs = m.date_sent ? new Date(m.date_sent).getTime() : 0;
    if (sentMs && sentMs < fiveMinutesAgoMs) {
      // Stale on first-seen; mark + skip notify so we don't blast old SIDs
      continue;
    }
    const mediaHint =
      parseInt(m.num_media || "0") > 0
        ? ` 📎 (${m.num_media} attachment${m.num_media === "1" ? "" : "s"} — see admin@ email)`
        : "";
    const body = `[${sender.name} → PAL] ${m.body}${mediaHint}`.slice(0, 1500);
    try {
      await sendSms(OPERATOR_PHONE_E164, body);
      notified++;
    } catch (err) {
      console.error(
        `[insider-sms-watch] operator-notify failed for sid ${m.sid}:`,
        err,
      );
    }
    // 600ms gap between sends to stay under AT&T 1.25 mps
    await new Promise((r) => setTimeout(r, 600));
  }

  // Mark all candidate SIDs (including Winston's own) as seen so we
  // don't reprocess them on the next minute's tick.
  await markSeen(toBroadcast.map((m) => ({ sid: m.sid, from: m.from })));

  return NextResponse.json({
    ok: true,
    scanned: recent.length,
    from_insiders: insiderMessages.length,
    new: toBroadcast.length,
    operator_notified: notified,
  });
}
