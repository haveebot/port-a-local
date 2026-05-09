import { NextRequest, NextResponse } from "next/server";
import {
  cartVendors,
  smsPhonesFor,
  findVendorByPhoneE164,
} from "@/data/cart-vendors";
import {
  recordOptIn,
  recordOptOut,
  toE164,
} from "@/data/cart-vendor-sms-store";
import {
  getMostRecentPendingForVendor,
  markAccepted,
  markPassed,
} from "@/data/cart-rental-first-look-store";
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
  sendOpenBlastSms,
  compactCartLabel,
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
 *   1. Match From phone against insiders / beach vendors / cart vendors.
 *   2. For cart vendors: parse Body for YES/NO/STOP/ACCEPT/PASS intent.
 *      ACCEPT/PASS only matter when the vendor has a pending first-look
 *      window (cart_rental_first_look_pending). CLAIM is accepted as a
 *      synonym for ACCEPT (backward compat).
 *   3. If NOT matched, surface to operator + admin@.
 *
 * Compliance: Twilio handles STOP at the carrier level automatically
 * (auto-blocks all outbound to that number). We mirror it in our DB
 * so we never even attempt to send to opted-out numbers.
 */

const TWIML_OK = '<?xml version="1.0" encoding="UTF-8"?><Response/>';
const OPERATOR_PHONE_E164 = "+15125681725"; // Winston — receives all surface pushes

function twimlResponse() {
  return new NextResponse(TWIML_OK, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

type Intent =
  | "yes"
  | "no"
  | "stop"
  | "accept"
  | "pass"
  | "claim"
  | "other";

function classifyBody(body: string): Intent {
  const trimmed = body.trim().toLowerCase();
  if (/\b(stop|stopall|cancel|end|quit|unsubscribe|revoke|optout)\b/.test(trimmed)) return "stop";
  // ACCEPT / CLAIM both map to "accept" intent. CLAIM kept for backward
  // compat with vendors who learned the old keyword. ACCEPT is the new
  // canonical (per 2026-05-09 keyword UX softening).
  if (/^(accept|take|takeit|i'?ll take it)\b/.test(trimmed)) return "accept";
  if (/\bclaim\b/.test(trimmed)) return "claim";
  // PASS is the new explicit "release this lead to other vendors"
  // keyword. Distinct from NO (which is opt-out of SMS entirely).
  if (/^(pass|skip|decline|release|no thanks|not me|cant|can'?t)\b/.test(trimmed)) return "pass";
  if (/^(yes|y|yeah|yep|sure|opt[ -]?in|ok|okay)\b/.test(trimmed)) return "yes";
  if (/^(no|nope|nah|opt[ -]?out|email[ -]?only)\b/.test(trimmed)) return "no";
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

    // Insider bridge (Winston, Collie, Nick, etc.) — unchanged
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

    // Beach vendor matcher (separate roster, unchanged)
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
        sendSms(
          fromRaw,
          `Port A Local: ${beachVendor.name} - sorry, that booking was just claimed by another vendor. Watch for the next one.`,
        ).catch((err) =>
          console.error("[twilio/inbound] beach lost-race reply failed:", err),
        );
        return twimlResponse();
      }
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
      console.log(
        `[twilio/inbound] STOP from beach vendor ${beachVendor.slug} - flag for manual removal from beach vendor roster`,
      );
      return twimlResponse();
    }
    if (beachVendor) {
      sendSms(
        OPERATOR_PHONE_E164,
        `[${beachVendor.name} → PAL] ${body}`.slice(0, 1500),
      ).catch((err) =>
        console.error("[twilio/inbound] beach-vendor surface to operator failed:", err),
      );
      return twimlResponse();
    }

    // Cart vendor matcher — checks ALL phones in the multi-phone array
    // (not just primary). Bron's three numbers all match back to the
    // brons-beach-carts vendor record.
    const matched = findVendorByPhoneE164(fromE164, toE164);

    if (!matched) {
      // Stranger — surface via operator SMS + admin@ email forward (unchanged)
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
        console.error("[twilio/inbound] stranger surface to operator failed:", operatorResult.reason);
      }
      if (adminResult.status === "rejected") {
        console.error("[twilio/inbound] stranger forward to admin@ failed:", adminResult.reason);
      }
      if (watch && operatorResult.status === "fulfilled") {
        recordNotification(fromE164).catch((err) =>
          console.error("[twilio/inbound] recordNotification failed:", err),
        );
      }
      return twimlResponse();
    }

    const { vendor, phone: matchedPhone } = matched;

    // -------- ACCEPT / PASS for first-look priority leads --------
    //
    // ACCEPT (or CLAIM, kept as alias): vendor is taking the lead.
    // PASS: vendor is releasing the lead to the rest of the directory.
    //
    // Both require an active pending first-look row. If none, ACCEPT
    // falls back to legacy CLAIM-routing (manual log) and PASS is
    // logged + surfaced to operator.
    if (intent === "accept" || intent === "claim" || intent === "pass") {
      const pending = await getMostRecentPendingForVendor(vendor.slug);

      if (!pending) {
        // No active first-look window — log + surface
        console.log(
          `[twilio/inbound] ${intent.toUpperCase()} from ${vendor.slug} (${vendor.name}) — no pending first-look; routing manually`,
        );
        sendSms(
          OPERATOR_PHONE_E164,
          `[${vendor.name} → PAL] ${intent.toUpperCase()}: ${body}`.slice(0, 1500),
        ).catch((err) =>
          console.error("[twilio/inbound] no-pending surface failed:", err),
        );
        return twimlResponse();
      }

      if (intent === "pass") {
        const won = await markPassed(pending.id);
        if (!won) {
          // Race lost — already accepted/passed/expired. Acknowledge + bail.
          sendSms(
            matchedPhone.number,
            `Port A Local: That lead was already resolved. No further action needed.`,
          ).catch((err) =>
            console.error("[twilio/inbound] pass race-lost ack failed:", err),
          );
          return twimlResponse();
        }
        // Acknowledge to all of vendor's phones (whoever passed, the
        // others see the resolution)
        const ackBody = `Port A Local: ${vendor.name} passed on the ${pending.leadMetadata.cartLabel} lead — released to the rest of the directory.`;
        const allPhones = smsPhonesFor(vendor);
        for (const p of allPhones) {
          try {
            await sendSms(p, ackBody);
          } catch (err) {
            console.error(`[twilio/inbound] pass ack to ${p} failed:`, err);
          }
          await new Promise((r) => setTimeout(r, 600));
        }
        // Fire open-blast to the rest of the directory immediately
        sendOpenBlastSms(
          {
            cartLabel: compactCartLabel(pending.leadMetadata.cartLabel),
            pickupFormatted: pending.leadMetadata.pickupShort,
            returnFormatted: pending.leadMetadata.returnShort,
            numDays: pending.leadMetadata.numDays,
          },
          { excludeSlugs: [vendor.slug] },
        )
          .then((sent) =>
            console.log(`[first-look] PASS triggered open-blast to ${sent} vendors`),
          )
          .catch((err) =>
            console.error("[first-look] PASS open-blast failed:", err),
          );
        return twimlResponse();
      }

      // ACCEPT / CLAIM
      const won = await markAccepted({
        id: pending.id,
        acceptedViaPhone: matchedPhone.number,
      });
      if (!won) {
        sendSms(
          matchedPhone.number,
          `Port A Local: That lead was already resolved. No further action needed.`,
        ).catch((err) =>
          console.error("[twilio/inbound] accept race-lost ack failed:", err),
        );
        return twimlResponse();
      }

      const md = pending.leadMetadata;
      const acceptingContact = matchedPhone.contactName ?? "team";

      // Confirmation to all of vendor's phones — whoever accepted, the
      // others see who took it
      const confirmBody = [
        `Port A Local: ✅ ${vendor.name} accepted the ${md.cartLabel} lead`,
        `Accepted by ${acceptingContact} (${matchedPhone.number}).`,
        `Customer info follows in the next message.`,
      ].join("\n\n");

      // Customer-info follow-up — only sent to the accepting number to
      // avoid spamming the team's other phones with the customer's
      // contact details
      const customerInfoBody = [
        `Port A Local: 🛺 Lead details — ${md.cartLabel}`,
        `Customer: ${md.customerName}`,
        `Phone: ${md.customerPhone}`,
        `Email: ${md.customerEmail}`,
        `Pickup: ${md.pickupFormatted}`,
        `Return: ${md.returnFormatted}`,
        `Reach out directly. PAL is hands-off from here.`,
      ].join("\n\n");

      const allPhones = smsPhonesFor(vendor);
      for (const p of allPhones) {
        try {
          await sendSms(p, confirmBody);
        } catch (err) {
          console.error(`[twilio/inbound] accept confirm to ${p} failed:`, err);
        }
        await new Promise((r) => setTimeout(r, 600));
      }
      // Customer info to accepting number only
      sendSms(matchedPhone.number, customerInfoBody).catch((err) =>
        console.error(`[twilio/inbound] accept customer-info to ${matchedPhone.number} failed:`, err),
      );
      // Operator ping — let Winston know the recovery worked
      sendSms(
        OPERATOR_PHONE_E164,
        `[first-look ✅] ${vendor.name} (${acceptingContact}) accepted ${md.cartLabel} — ${md.pickupShort} to ${md.returnShort} for ${md.customerName}`,
      ).catch((err) =>
        console.error("[twilio/inbound] operator ping on accept failed:", err),
      );
      return twimlResponse();
    }

    // -------- Existing opt-in flow (YES / NO / STOP) --------
    if (intent === "yes") {
      await recordOptIn(vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      sendSms(matchedPhone.number, buildOptInConfirmSms(vendor.name)).catch((err) =>
        console.error("[twilio/inbound] confirm-send failed:", err),
      );
      return twimlResponse();
    }

    if (intent === "no") {
      await recordOptOut(vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      sendSms(matchedPhone.number, buildOptOutAckSms(vendor.name)).catch((err) =>
        console.error("[twilio/inbound] optout-ack-send failed:", err),
      );
      return twimlResponse();
    }

    if (intent === "stop") {
      await recordOptOut(vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      return twimlResponse();
    }

    // Other / unparseable from a cart vendor — push to operator
    sendSms(
      OPERATOR_PHONE_E164,
      `[${vendor.name} (${matchedPhone.label ?? "phone"}) → PAL] ${body}`.slice(0, 1500),
    ).catch((err) =>
      console.error("[twilio/inbound] cart-vendor surface to operator failed:", err),
    );
    return twimlResponse();
  } catch (err) {
    console.error("[twilio/inbound] unhandled:", err);
    return twimlResponse();
  }
}
