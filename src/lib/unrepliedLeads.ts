/**
 * Unreplied-leads detection for the daily PAL Pulse.
 *
 * Problem this solves: "I'll watch that number for a reply" is a session
 * promise — it dies when the session ends. A lead we texted who never
 * replied AND never booked goes silently cold unless something automated
 * notices. This module notices.
 *
 * Method (computed fresh at Pulse time — no bookkeeping table to maintain):
 *   1. Pull the last 72h of outbound SMS from PAL's number via the Twilio
 *      Messages API (covers ad-hoc sends from operator sessions too, which
 *      never touch our DB).
 *   2. Drop known contacts: super-admins, insiders, cart + beach vendor
 *      rosters, and PAL's own number.
 *   3. Drop anyone with a beach or cart booking on file (they're a
 *      customer mid-flow, not a cold lead — day-before/setup SMSes land
 *      here and are correctly excluded).
 *   4. Whoever remains is a lead we texted. Unreplied = no inbound from
 *      them AFTER our latest outbound, and quiet for >= MIN_QUIET_HOURS
 *      (so this morning's live conversations don't get flagged).
 *
 * Fail-open: any Twilio/DB error returns [] so the Pulse never breaks on
 * this section.
 */

import { sql } from "@vercel/postgres";
import { superAdmins } from "@/data/super-admins";
import { insiders } from "@/data/insiders";
import { cartVendors } from "@/data/cart-vendors";
import { beachVendors } from "@/data/beach-vendors";

const LOOKBACK_HOURS = 72;
const MIN_QUIET_HOURS = 20;

export interface UnrepliedLead {
  /** Last 10 digits, e.g. "2816352476" */
  phone: string;
  /** Display form, e.g. "281-635-2476" */
  phoneDisplay: string;
  /** ISO timestamp of our latest outbound to them */
  lastOutboundAt: string;
  /** Whole hours since our latest outbound */
  quietHours: number;
  /** First ~80 chars of our latest outbound, for context in the digest */
  lastOutboundPreview: string;
}

/** Normalize any phone format to its last 10 digits. */
function tenDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

function display(phone10: string): string {
  return `${phone10.slice(0, 3)}-${phone10.slice(3, 6)}-${phone10.slice(6)}`;
}

function knownContactSet(): Set<string> {
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

/** Fetch up to ~400 messages touching PAL's number in the lookback window. */
async function fetchRecentMessages(): Promise<TwilioMessage[]> {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const palNumber = process.env.TWILIO_PHONE_NUMBER || "";
  if (!sid || !token || !palNumber) return [];

  const auth =
    "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
  const since = new Date(Date.now() - LOOKBACK_HOURS * 3_600_000);
  // Twilio's DateSent filter is date-granular; over-fetch a day and
  // filter precisely below.
  const sinceDate = new Date(since.getTime() - 24 * 3_600_000)
    .toISOString()
    .slice(0, 10);

  const messages: TwilioMessage[] = [];
  for (const dirParam of [`From=${encodeURIComponent(palNumber)}`, `To=${encodeURIComponent(palNumber)}`]) {
    const url =
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json` +
      `?${dirParam}&DateSent%3E=${sinceDate}&PageSize=200`;
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

/** Phones (10-digit) that have a beach or cart booking on file. */
async function bookedPhoneSet(phones: string[]): Promise<Set<string>> {
  const booked = new Set<string>();
  if (phones.length === 0) return booked;
  // customer_phone is stored in varying formats; compare on last 10 digits.
  const beach = await sql`
    SELECT customer_phone FROM beach_booking_claims WHERE customer_phone IS NOT NULL
  `;
  const cart = await sql`
    SELECT customer_phone FROM cart_bookings WHERE customer_phone IS NOT NULL
  `;
  const wanted = new Set(phones);
  for (const row of [...beach.rows, ...cart.rows]) {
    const p = tenDigits(String(row.customer_phone));
    if (wanted.has(p)) booked.add(p);
  }
  return booked;
}

export async function getUnrepliedLeads(): Promise<UnrepliedLead[]> {
  try {
    const messages = await fetchRecentMessages();
    if (messages.length === 0) return [];

    const known = knownContactSet();
    const lastOutbound = new Map<
      string,
      { at: number; body: string }
    >();
    const lastInbound = new Map<string, number>();

    for (const m of messages) {
      const when = new Date(m.date_sent ?? m.date_created).getTime();
      if (m.direction === "inbound") {
        const p = tenDigits(m.from);
        lastInbound.set(p, Math.max(lastInbound.get(p) ?? 0, when));
      } else {
        const p = tenDigits(m.to);
        if (known.has(p)) continue;
        const prev = lastOutbound.get(p);
        if (!prev || when > prev.at)
          lastOutbound.set(p, { at: when, body: m.body ?? "" });
      }
    }

    const candidates = [...lastOutbound.keys()];
    const booked = await bookedPhoneSet(candidates);

    const now = Date.now();
    const leads: UnrepliedLead[] = [];
    for (const [phone, out] of lastOutbound) {
      if (booked.has(phone)) continue;
      const replied = (lastInbound.get(phone) ?? 0) > out.at;
      if (replied) continue;
      const quietHours = Math.floor((now - out.at) / 3_600_000);
      if (quietHours < MIN_QUIET_HOURS) continue;
      leads.push({
        phone,
        phoneDisplay: display(phone),
        lastOutboundAt: new Date(out.at).toISOString(),
        quietHours,
        lastOutboundPreview: out.body.slice(0, 80),
      });
    }
    leads.sort((a, b) => b.quietHours - a.quietHours);
    return leads;
  } catch (err) {
    console.error("[unreplied-leads] failed (fail-open):", err);
    return [];
  }
}
