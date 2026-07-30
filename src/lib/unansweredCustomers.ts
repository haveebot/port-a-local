/**
 * Unanswered-customer detection — the inbound mirror of unrepliedLeads.
 *
 * Why this exists: `unrepliedLeads` deliberately EXCLUDES anyone with a
 * booking on file ("they're a customer mid-flow, not a cold lead"), so
 * booked customers who text US and get no reply had no watchdog at all.
 * That gap cost us twice (2026-07-30 review):
 *   - a customer asked about her weather-teardown refund on 7/24, again
 *     on 7/28, and got silence for six days;
 *   - a customer asked for an extra chair 17h before her setup and the
 *     crew was never told.
 * Both alerts reached the operator's phone once and then died there.
 *
 * Method (computed fresh, no bookkeeping table):
 *   1. Pull recent messages both directions from PAL's Twilio number.
 *   2. Drop roster phones (super-admins, insiders, cart + beach vendors,
 *      PAL itself) — those streams have their own handling.
 *   3. For each remaining phone, find its latest inbound and the latest
 *      HUMAN outbound (automated confirmations/reminders don't count as
 *      an answer — they're what people are usually replying TO).
 *   4. Unanswered = latest inbound is newer than the last human reply and
 *      has been waiting >= MIN_WAIT_MINUTES. Pure acknowledgments
 *      ("thanks!", iOS tapbacks) never count as needing a reply.
 *   5. Attach booking context when the phone matches a booking.
 *
 * Fail-open: any Twilio/DB error returns [] so the cron never breaks.
 */

import { superAdmins } from "@/data/super-admins";
import { insiders } from "@/data/insiders";
import { cartVendors } from "@/data/cart-vendors";
import { beachVendors } from "@/data/beach-vendors";
import {
  findBookingCustomer,
  type CustomerBookingContext,
} from "@/lib/customerLookup";

const LOOKBACK_HOURS = 168; // 7 days — long enough to keep surfacing a stale miss
const MIN_WAIT_MINUTES = 120;

/**
 * Outbound templates that are automated sends TO customers. These must
 * NOT count as "we replied" — a customer's question followed by an
 * automated day-before reminder would otherwise look answered.
 */
const AUTOMATED_OUTBOUND = [
  /^Port A Local: Your .+ is booked for/i,
  /^Port A Local - Your beach setup is tomorrow/i,
];

/** Inbound that needs no reply: short acks and iOS tapback reactions. */
const NO_REPLY_NEEDED = [
  /^(thanks|thank you|ty|ok|okay|k|got it|sounds good|perfect|great|awesome|yes|no|yep|nope|will do)[\s!.,]*$/i,
  /^(liked|loved|laughed at|emphasized|disliked|questioned)\s+[""]/i,
];

export interface UnansweredCustomer {
  /** Last 10 digits */
  phone: string;
  /** Display form, e.g. "303-915-2383" */
  phoneDisplay: string;
  /** ISO timestamp of their latest inbound */
  lastInboundAt: string;
  /** Whole hours they've been waiting */
  waitHours: number;
  /** First ~80 chars of what they asked */
  lastInboundPreview: string;
  /** Booking context when the phone matches a beach/cart booking */
  booking: CustomerBookingContext | null;
}

function tenDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

function display(phone10: string): string {
  return `${phone10.slice(0, 3)}-${phone10.slice(3, 6)}-${phone10.slice(6)}`;
}

function rosterPhones(): Set<string> {
  const known = new Set<string>();
  for (const a of superAdmins) known.add(tenDigits(a.phoneE164));
  for (const i of insiders) known.add(tenDigits(i.phoneE164));
  for (const v of cartVendors)
    for (const p of v.phones) known.add(tenDigits(p.number));
  for (const v of beachVendors) known.add(tenDigits(v.phone));
  const palNumber = process.env.TWILIO_PHONE_NUMBER || "";
  if (palNumber) known.add(tenDigits(palNumber));
  return known;
}

interface TwilioMessage {
  to: string;
  from: string;
  direction: string;
  date_sent: string | null;
  date_created: string;
  body: string;
}

async function fetchRecentMessages(): Promise<TwilioMessage[]> {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const palNumber = process.env.TWILIO_PHONE_NUMBER || "";
  if (!sid || !token || !palNumber) return [];

  const auth = "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
  const since = new Date(Date.now() - LOOKBACK_HOURS * 3_600_000);
  // Twilio's DateSent filter is date-granular; over-fetch a day and filter
  // precisely below.
  const sinceDate = new Date(since.getTime() - 24 * 3_600_000)
    .toISOString()
    .slice(0, 10);

  const messages: TwilioMessage[] = [];
  for (const dirParam of [
    `From=${encodeURIComponent(palNumber)}`,
    `To=${encodeURIComponent(palNumber)}`,
  ]) {
    const url =
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json` +
      `?${dirParam}&DateSent%3E=${sinceDate}&PageSize=500`;
    const res = await fetch(url, { headers: { Authorization: auth } });
    if (!res.ok) continue;
    const json = (await res.json()) as { messages?: TwilioMessage[] };
    for (const m of json.messages ?? []) {
      const when = new Date(m.date_sent ?? m.date_created);
      if (when.getTime() >= since.getTime()) messages.push(m);
    }
  }
  return messages;
}

export async function getUnansweredCustomers(): Promise<UnansweredCustomer[]> {
  try {
    const messages = await fetchRecentMessages();
    if (messages.length === 0) return [];

    const roster = rosterPhones();
    const lastInbound = new Map<string, { at: number; body: string }>();
    const lastHumanOutbound = new Map<string, number>();

    for (const m of messages) {
      const when = new Date(m.date_sent ?? m.date_created).getTime();
      if (m.direction === "inbound") {
        const p = tenDigits(m.from);
        if (roster.has(p)) continue;
        const prev = lastInbound.get(p);
        if (!prev || when > prev.at)
          lastInbound.set(p, { at: when, body: m.body ?? "" });
      } else {
        const p = tenDigits(m.to);
        if (roster.has(p)) continue;
        const body = m.body ?? "";
        if (AUTOMATED_OUTBOUND.some((re) => re.test(body))) continue;
        lastHumanOutbound.set(p, Math.max(lastHumanOutbound.get(p) ?? 0, when));
      }
    }

    const now = Date.now();
    const waiting: UnansweredCustomer[] = [];
    for (const [phone, inb] of lastInbound) {
      const body = inb.body.trim();
      if (NO_REPLY_NEEDED.some((re) => re.test(body))) continue;
      if ((lastHumanOutbound.get(phone) ?? 0) > inb.at) continue;
      const waitMinutes = (now - inb.at) / 60_000;
      if (waitMinutes < MIN_WAIT_MINUTES) continue;
      waiting.push({
        phone,
        phoneDisplay: display(phone),
        lastInboundAt: new Date(inb.at).toISOString(),
        waitHours: Math.floor(waitMinutes / 60),
        lastInboundPreview: body.slice(0, 80),
        booking: await findBookingCustomer(`+1${phone}`),
      });
    }
    waiting.sort((a, b) => b.waitHours - a.waitHours);
    return waiting;
  } catch (err) {
    console.error("[unanswered-customers] failed (fail-open):", err);
    return [];
  }
}
