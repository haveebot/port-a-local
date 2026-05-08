import { NextRequest, NextResponse } from "next/server";
import { cartVendors } from "@/data/cart-vendors";
import {
  recordOptIn,
  recordOptOut,
  toE164,
} from "@/data/cart-vendor-sms-store";
import { findInsider } from "@/data/insiders";
import { findBeachVendorByPhone } from "@/data/beach-vendors";
import {
  attemptClaim,
  getMostRecentUnclaimed,
} from "@/data/beach-claim-store";
import { sendSms } from "@/lib/twilioSms";
import {
  buildOptInConfirmSms,
  buildOptOutAckSms,
} from "@/lib/cartVendorSmsBlast";
import { notifyClaimResolution } from "@/lib/beachVendorBlast";
import { forwardInsiderSmsToAdmin } from "@/lib/insiderSmsForward";
import { forwardStrangerSmsToAdmin } from "@/lib/strangerSmsForward";
import { runInsiderAgent } from "@/lib/insiderSmsAgent";
import { checkWatch, recordNotification } from "@/data/sms-watch-store";

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
const OPERATOR_PHONE_E164 = "+15125681725"; // Winston — receives all surface pushes

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

    // Insider bridge: if this number is on the allowlist (Winston, Collie,
    // Nick, etc.), fire the email forward + the inline Claude agent.
    //
    // 1) forwardInsiderSmsToAdmin — email the message (with MMS attachments)
    //    to admin@theportalocal.com for the operator's inbox + Claude's
    //    next-session arnold drill. Fire-and-forget — single HTTP call,
    //    completes quickly enough that Vercel doesn't kill it.
    //
    // 2) runInsiderAgent — inline Claude (Haiku 4.5) reads the message,
    //    decides an action, and acts via tools (reply, send to third party,
    //    or escalate to Winston). AWAITED before returning TwiML — the
    //    multi-step loop (~3-5s typical) needs the function alive to
    //    complete; Vercel kills background work after response. Twilio's
    //    15s webhook budget covers it. Skipped instantly if
    //    ANTHROPIC_API_KEY isn't set.
    const insider = findInsider(fromE164);
    if (insider) {
      forwardInsiderSmsToAdmin(insider, body, messageSid).catch((err) =>
        console.error("[twilio/inbound] insider-forward failed:", err),
      );
      try {
        const agentResult = await runInsiderAgent(insider, body);
        console.log(
          `[twilio/inbound] insider-agent: ran=${agentResult.ran} iters=${agentResult.iterations ?? "-"} tools=${(agentResult.toolsCalled ?? []).join(",")} ${agentResult.reason ?? ""}`,
        );
      } catch (err) {
        console.error("[twilio/inbound] insider-agent threw:", err);
      }
      return twimlResponse();
    }

    // Beach vendor CLAIM matcher — check before cart-vendor matcher because
    // beach vendors (John, Tyler, Danny) may also receive non-CLAIM replies.
    // CLAIM intent + beach-vendor phone match → atomic claim attempt.
    const beachVendor = findBeachVendorByPhone(fromE164);
    if (beachVendor && intent === "claim") {
      const unclaimed = await getMostRecentUnclaimed();
      if (!unclaimed) {
        sendSms(
          fromRaw,
          `Port A Local: Thanks ${beachVendor.name} - no unclaimed beach booking right now. Next blast comes through automatically.`,
        ).catch((err) =>
          console.error("[twilio/inbound] beach no-lead reply failed:", err),
        );
        return twimlResponse();
      }
      const won = await attemptClaim(unclaimed.stripeSessionId, beachVendor.slug);
      if (!won) {
        // Lost the race — another vendor's CLAIM landed first.
        sendSms(
          fromRaw,
          `Port A Local: ${beachVendor.name} - sorry, that booking was just claimed by another vendor. Watch for the next one.`,
        ).catch((err) =>
          console.error("[twilio/inbound] beach lost-race reply failed:", err),
        );
        return twimlResponse();
      }
      // Won the claim — fan out confirmations to all parties.
      notifyClaimResolution({
        winner: beachVendor,
        customerName: unclaimed.customerName ?? "Customer",
        customerPhone: unclaimed.customerPhone ?? "",
        product: unclaimed.product ?? "setup",
        qty: unclaimed.qty ?? 1,
        setupDateFormatted: unclaimed.setupDate
          ? new Date(unclaimed.setupDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : "your scheduled date",
      }).catch((err) =>
        console.error("[twilio/inbound] notifyClaimResolution failed:", err),
      );
      return twimlResponse();
    }
    if (beachVendor && intent === "stop") {
      // STOP from a beach vendor — log; we can't easily un-stop without
      // them re-opting in, but Twilio handles delivery suppression. They
      // may want to be removed from beach vendor list manually.
      console.log(
        `[twilio/inbound] STOP from beach vendor ${beachVendor.slug} - flag for manual removal from beach vendor roster`,
      );
      return twimlResponse();
    }
    if (beachVendor) {
      // Non-CLAIM, non-STOP reply from a beach vendor — push to operator
      // (Winston) so a human can read the prose and act. Per Winston rule
      // 2026-04-29: "intake the message and do what we need to with it";
      // we don't try to parse free-form intent — surface to a human.
      sendSms(
        OPERATOR_PHONE_E164,
        `[${beachVendor.name} → PAL] ${body}`.slice(0, 1500),
      ).catch((err) =>
        console.error("[twilio/inbound] beach-vendor surface to operator failed:", err),
      );
      return twimlResponse();
    }

    // Match the inbound number to a known cart vendor (by phone).
    // cartVendors phones may be in various formats; normalize for compare.
    const vendor = cartVendors.find((v) => toE164(v.phone) === fromE164);

    if (!vendor) {
      // Stranger or unidentified inbound — surface via TWO channels:
      //
      // 1) SMS forward to operator's phone (immediate human notification).
      //    If the number is on the SMS watch list (we're expecting a reply
      //    from a recent outbound), the push is *elevated* with a 🔔 prefix
      //    + context label so it stands out from random stranger texts.
      //
      // 2) Email forward to admin@theportalocal.com (machine-readable shared
      //    state). Origin: 2026-05-04 — the SMS-only path pinned inbound
      //    state to Winston's physical phone, breaking hub-spoke architecture
      //    (`feedback_hub_spoke_architecture.md`).
      //
      // RACE FIX (2026-05-06): both calls are AWAITED before TwiML return.
      // Previously fire-and-forget — Bron Doyle's reply slipped through
      // because Vercel killed the function before sendSms's network call
      // completed. Twilio's 15s webhook budget easily covers both API
      // calls (typical ~500-1500ms total).
      const watch = await checkWatch(fromE164).catch((err) => {
        console.error("[twilio/inbound] checkWatch failed:", err);
        return null;
      });
      const operatorBody = watch
        ? `🔔 WATCHED [${watch.context}] ${fromE164} → PAL: ${body}`.slice(0, 1500)
        : `[unknown ${fromE164} → PAL] ${body}`.slice(0, 1500);
      const [operatorResult, adminResult] = await Promise.allSettled([
        sendSms(OPERATOR_PHONE_E164, operatorBody),
        forwardStrangerSmsToAdmin(fromE164, body, messageSid),
      ]);
      if (operatorResult.status === "rejected") {
        console.error(
          "[twilio/inbound] stranger surface to operator failed:",
          operatorResult.reason,
        );
      }
      if (adminResult.status === "rejected") {
        console.error(
          "[twilio/inbound] stranger forward to admin@ failed:",
          adminResult.reason,
        );
      }
      if (watch && operatorResult.status === "fulfilled") {
        recordNotification(fromE164).catch((err) =>
          console.error("[twilio/inbound] recordNotification failed:", err),
        );
      }
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

    // Other / unparseable from a cart vendor — push to operator so a human
    // can read + act. Per Winston rule 2026-04-29: intake + surface, don't
    // try to be clever with prose parsing.
    sendSms(
      OPERATOR_PHONE_E164,
      `[${vendor.name} → PAL] ${body}`.slice(0, 1500),
    ).catch((err) =>
      console.error("[twilio/inbound] cart-vendor surface to operator failed:", err),
    );
    return twimlResponse();
  } catch (err) {
    console.error("[twilio/inbound] unhandled:", err);
    return twimlResponse();
  }
}
