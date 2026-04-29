import { NextRequest, NextResponse } from "next/server";
import { cartVendors } from "@/data/cart-vendors";
import {
  getConsentByPhone,
  recordOptIn,
  recordOptOut,
  toE164,
} from "@/data/cart-vendor-sms-store";
import { sendSms } from "@/lib/twilioSms";
import {
  buildOptInConfirmSms,
  buildOptOutAckSms,
} from "@/lib/cartVendorSmsBlast";

/**
 * Twilio inbound SMS webhook.
 *
 * Configured at the Messaging Service level (MG197b...) via the
 * "Inbound Settings" tab in Twilio Console — set this URL as the
 * "A message comes in" webhook. Twilio POSTs application/x-www-form-
 * urlencoded with these fields:
 *
 *   From              — sender E.164 (e.g. +13615551234)
 *   To                — PAL's number (+13614281706)
 *   Body              — raw message text
 *   MessageSid        — Twilio's ID for this inbound message
 *   MessagingServiceSid — MG197b... (our service)
 *
 * What we do here:
 *   1. Match From phone against a known cart vendor.
 *   2. If matched, parse Body for YES/NO/STOP intent and flip the
 *      consent record accordingly. Send an acknowledgement SMS.
 *   3. If NOT matched, log and ignore — could be a customer reply
 *      (CLAIM, STOP) or stranger. Future builds will dispatch
 *      CLAIM-from-known-vendor to the lead-claim flow.
 *
 * Compliance: Twilio handles STOP at the carrier level automatically
 * (auto-blocks all outbound to that number). We mirror it in our DB
 * so we never even attempt to send to opted-out numbers and so the
 * admin tool reflects accurate state.
 *
 * Returns TwiML (empty <Response/>) — Twilio expects an XML response.
 * Sending an actual reply via TwiML is one option; we instead use the
 * Messages API for the ack so we can use the Messaging Service.
 */

const TWIML_OK = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

function twimlResponse() {
  return new NextResponse(TWIML_OK, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

type Intent = "yes" | "no" | "stop" | "claim" | "other";

function classifyBody(body: string): Intent {
  const trimmed = body.trim().toLowerCase();
  if (/\b(stop|stopall|cancel|end|quit|unsubscribe|revoke|optout)\b/.test(trimmed)) return "stop";
  if (/^(yes|y|yeah|yep|sure|opt[ -]?in|ok|okay)\b/.test(trimmed)) return "yes";
  if (/^(no|nope|nah|opt[ -]?out|email[ -]?only)\b/.test(trimmed)) return "no";
  if (/\bclaim\b/.test(trimmed)) return "claim";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fromRaw = String(form.get("From") || "");
    const body = String(form.get("Body") || "");
    const messageSid = String(form.get("MessageSid") || "");

    if (!fromRaw || !body) {
      console.warn("[twilio/inbound] missing From or Body — ignoring");
      return twimlResponse();
    }

    const fromE164 = toE164(fromRaw);
    const intent = classifyBody(body);

    console.log(
      `[twilio/inbound] from=${fromE164} intent=${intent} sid=${messageSid} body=${JSON.stringify(body)}`,
    );

    // Match the inbound number to a known cart vendor (by phone).
    // cartVendors phones may be in various formats; normalize for compare.
    const vendor = cartVendors.find((v) => toE164(v.phone) === fromE164);

    if (!vendor) {
      // Could be a stranger, a customer (e.g. CLAIM from a customer is
      // out-of-flow), or someone we should follow up with manually.
      // Log and respond OK; STOP is still honored by Twilio at carrier level.
      console.log(`[twilio/inbound] no vendor match for ${fromE164}`);
      return twimlResponse();
    }

    if (intent === "yes") {
      await recordOptIn(vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      // Confirmation reply (best-effort, don't block the webhook on send)
      sendSms(vendor.phone, buildOptInConfirmSms(vendor.name)).catch((err) =>
        console.error("[twilio/inbound] confirm-send failed:", err),
      );
      return twimlResponse();
    }

    if (intent === "no") {
      await recordOptOut(vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      sendSms(vendor.phone, buildOptOutAckSms(vendor.name)).catch((err) =>
        console.error("[twilio/inbound] optout-ack-send failed:", err),
      );
      return twimlResponse();
    }

    if (intent === "stop") {
      // Twilio auto-blocks outbound after STOP. Mirror in our record.
      // No ack-send (Twilio handles STOP confirm automatically).
      await recordOptOut(vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      return twimlResponse();
    }

    if (intent === "claim") {
      // Lead-claim flow not yet wired (deferred). For now, log so admin
      // can manually route. Future: match against the most recent
      // unblasted lead and assign.
      console.log(
        `[twilio/inbound] CLAIM from ${vendor.slug} (${vendor.name}) — manual routing required for now`,
      );
      return twimlResponse();
    }

    // Other / unparseable — log for admin review. No auto-response.
    console.log(
      `[twilio/inbound] unparseable reply from ${vendor.slug}: ${JSON.stringify(body)}`,
    );
    return twimlResponse();
  } catch (err) {
    console.error("[twilio/inbound] unhandled:", err);
    return twimlResponse();
  }
}
