import { NextResponse } from "next/server";
import { findInsider, insiders } from "@/data/insiders";
import { filterUnseen, markSeen } from "@/data/insider-sms-seen";
import { sendSms } from "@/lib/twilioSms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: insider SMS watcher
 * Schedule: every minute (configured in vercel.json)
 *
 * Polls Twilio for recent inbound SMS to PAL's number. For each new
 * message from a known insider (Winston, Collie, Nick), broadcasts a
 * push SMS notification to the OTHER super-admins so the team sees
 * it on lock screen within ~1 minute of arrival — without anyone
 * having to refresh email or open Wheelhouse.
 *
 * Why this AND the inbound webhook + admin@ forward?
 *   - Inbound webhook fires immediately on each SMS, but it forwards
 *     to admin@ email (slower to surface on a lock screen than SMS).
 *   - This cron makes sure no insider SMS sits unnoticed for hours
 *     even if the team is heads-down on something else.
 *   - Sender themselves is excluded from the broadcast (no duplicate
 *     to the person who just sent the message).
 *
 * Auth: Vercel sends Authorization: Bearer <CRON_SECRET>. Same pattern
 * as /api/wheelhouse/cron/pulse.
 *
 * Idempotency: filterUnseen + markSeen against insider_sms_seen.
 * Even if Vercel re-fires this cron (network blip, retry), each
 * message only broadcasts once.
 */

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

  // For each new insider message, broadcast to OTHER insiders.
  // 600ms pacing inside the per-message loop to stay under AT&T 1.25 mps.
  let broadcastCount = 0;
  for (const m of toBroadcast) {
    const sender = m.insider!;
    const others = insiders.filter((i) => i.phoneE164 !== sender.phoneE164);
    const mediaHint = parseInt(m.num_media || "0") > 0 ? ` 📎 (${m.num_media} attachment${m.num_media === "1" ? "" : "s"} — see admin@ email)` : "";
    const body = `[${sender.name} → PAL] ${m.body}${mediaHint}`.slice(0, 1500);
    for (const target of others) {
      try {
        await sendSms(target.phoneE164, body);
        broadcastCount++;
      } catch (err) {
        console.error(
          `[insider-sms-watch] broadcast to ${target.name} failed:`,
          err,
        );
      }
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  // Mark all candidate SIDs (whether they got broadcast successfully or
  // not — we don't want to retry a failed-send forever; logs catch the err)
  await markSeen(toBroadcast.map((m) => ({ sid: m.sid, from: m.from })));

  return NextResponse.json({
    ok: true,
    scanned: recent.length,
    from_insiders: insiderMessages.length,
    new: toBroadcast.length,
    broadcast: broadcastCount,
  });
}
