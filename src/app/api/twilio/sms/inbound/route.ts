import { NextRequest, NextResponse } from "next/server";
import {
  smsPhonesFor,
  findVendorByPhoneE164,
  type CartVendor,
  type CartVendorPhone,
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
import { assignCartVendor } from "@/data/cart-booking-store";
import { findInsider } from "@/data/insiders";
import {
  findBeachVendorByPhone,
  findBeachVendorBySlug,
  beachVendorsAreTeammates,
  type BeachVendor,
} from "@/data/beach-vendors";
import {
  attemptClaim,
  getClaim,
  getMostRecentUnclaimed,
  type BeachBookingClaim,
} from "@/data/beach-claim-store";
import { sendSms } from "@/lib/twilioSms";
import {
  buildOptInConfirmSms,
  buildOptOutAckSms,
  sendOpenBlastSms,
  compactCartLabel,
} from "@/lib/cartVendorSmsBlast";
import { notifyClaimResolution } from "@/lib/beachVendorBlast";
import { formatCustomerDisplay } from "@/lib/superAdminPing";
import { forwardInsiderSmsToAdmin } from "@/lib/insiderSmsForward";
import { forwardStrangerSmsToAdmin } from "@/lib/strangerSmsForward";
import { runInsiderAgent } from "@/lib/insiderSmsAgent";
import { checkWatch, recordNotification } from "@/data/sms-watch-store";

/**
 * Twilio inbound SMS webhook — one number, two SEPARATE revenue streams.
 *
 * Beach and cart rentals share PAL's single number (+13614281706) and this
 * one webhook, and Bron's three phones are registered as BOTH beach AND
 * cart vendors. So we must route by the INTENT of the reply, not by "which
 * roster matched first." The old order checked the beach roster first and
 * let its catch-all (operator ping + return) swallow cart ACCEPT/PASS from
 * Bron's dual-registered phones — every cart claim silently died.
 *
 * Dispatch (this is the separation):
 *   ACCEPT / PASS  -> CART  (cart-only keywords)
 *   CLAIM          -> BEACH if a beach booking is waiting; otherwise the
 *                     pending CART first-look (CLAIM is a legacy cart alias)
 *   YES / NO       -> CART  (SMS opt-in)
 *   STOP           -> BOTH  (flag beach roster + cart opt-out)
 * The beach/cart "catch-all -> operator" branches are FALLBACKS that run
 * only after the stream handlers, so neither stream can short-circuit the
 * other.
 *
 * Compliance: Twilio handles STOP at the carrier level automatically; we
 * mirror it in our DB so we never attempt to send to opted-out numbers.
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
  // ACCEPT / CLAIM both map to "take it". CLAIM kept for backward compat
  // with vendors who learned the old keyword. ACCEPT is the new canonical
  // (per 2026-05-09 keyword UX softening).
  if (/^(accept|take|takeit|i'?ll take it)\b/.test(trimmed)) return "accept";
  if (/\bclaim\b/.test(trimmed)) return "claim";
  // PASS = "release this lead to other vendors". Distinct from NO (opt-out).
  if (/^(pass|skip|decline|release|no thanks|not me|cant|can'?t)\b/.test(trimmed)) return "pass";
  if (/^(yes|y|yeah|yep|sure|opt[ -]?in|ok|okay)\b/.test(trimmed)) return "yes";
  if (/^(no|nope|nah|opt[ -]?out|email[ -]?only)\b/.test(trimmed)) return "no";
  return "other";
}

/* =====================================================================
 * BEACH STREAM handler
 * ===================================================================== */

/**
 * Resolve a beach CLAIM against the most-recent unclaimed booking. Atomic
 * claim, teammate race-loss suppression, winner confirm + claim-lost fan
 * out (inside notifyClaimResolution), AND an operator alert so the
 * operator knows a booking was grabbed (this alert was previously missing
 * — Winston wasn't being told when Bron's claimed a beach setup).
 */
async function handleBeachClaim(
  beachVendor: BeachVendor,
  unclaimed: BeachBookingClaim,
  fromRaw: string,
  fromE164: string,
): Promise<void> {
  const won = await attemptClaim(unclaimed.stripeSessionId, beachVendor.slug);
  if (!won) {
    // Race-lost. If the winner is a teammate, the team was already told via
    // notifyClaimResolution's claim-lost fan-out — suppress the redundant
    // SMS. Cross-vendor race: name the winner so the loser knows it's gone.
    const winningClaim = await getClaim(unclaimed.stripeSessionId);
    const winnerSlug = winningClaim?.claimedBySlug ?? null;
    const winnerVendor = winnerSlug ? findBeachVendorBySlug(winnerSlug) : null;
    if (winnerVendor && beachVendorsAreTeammates(beachVendor, winnerVendor)) {
      console.log(
        `[twilio/inbound beach] race-lost suppressed: ${beachVendor.slug} (${fromE164}) is on same team as winner ${winnerVendor.slug}`,
      );
      return;
    }
    const winnerName = winnerVendor?.name ?? "another vendor";
    sendSms(
      fromRaw,
      `Port A Local: ${beachVendor.name} - sorry, ${winnerName} already claimed that booking. Watch for the next one.`,
    ).catch((err) =>
      console.error("[twilio/inbound] beach lost-race reply failed:", err),
    );
    return;
  }

  const setupDateFormatted = unclaimed.setupDate
    ? new Date(unclaimed.setupDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "your scheduled date";

  notifyClaimResolution({
    winner: beachVendor,
    customerName: unclaimed.customerName ?? "Customer",
    product: unclaimed.product ?? "setup",
    qty: unclaimed.qty ?? 1,
    setupDateFormatted,
    setupLocation: unclaimed.setupLocation,
  }).catch((err) =>
    console.error("[twilio/inbound] notifyClaimResolution failed:", err),
  );

  // Operator alert — beach parity with the cart accept ping. The operator
  // now hears when a beach booking is claimed (and by which team member).
  const qtyLabel = unclaimed.qty && unclaimed.qty > 1 ? ` ×${unclaimed.qty}` : "";
  sendSms(
    OPERATOR_PHONE_E164,
    `[beach ✅] ${beachVendor.name} claimed ${unclaimed.product ?? "setup"}${qtyLabel} — ${setupDateFormatted} — ${unclaimed.customerName ?? "customer"}`,
  ).catch((err) =>
    console.error("[twilio/inbound] beach claim operator ping failed:", err),
  );
}

/* =====================================================================
 * CART STREAM handler
 * ===================================================================== */

/**
 * Resolve a cart ACCEPT / PASS (or legacy CLAIM) against the vendor's
 * pending first-look window. ACCEPT confirms to the whole team + pings the
 * operator; PASS releases the lead + fires the open-blast. No pending
 * window -> surface to operator.
 */
async function handleCartFirstLook(
  vendor: CartVendor,
  matchedPhone: CartVendorPhone,
  intent: "accept" | "pass" | "claim",
  body: string,
): Promise<void> {
  const pending = await getMostRecentPendingForVendor(vendor.slug);

  if (!pending) {
    console.log(
      `[twilio/inbound] ${intent.toUpperCase()} from ${vendor.slug} (${vendor.name}) — no pending first-look; routing manually`,
    );
    sendSms(
      OPERATOR_PHONE_E164,
      `[${vendor.name} → PAL] ${intent.toUpperCase()}: ${body}`.slice(0, 1500),
    ).catch((err) =>
      console.error("[twilio/inbound] no-pending surface failed:", err),
    );
    return;
  }

  if (intent === "pass") {
    const won = await markPassed(pending.id);
    if (!won) {
      // Race-lost on a row fetched for THIS vendor -> a teammate already
      // resolved it + got the team alert. Don't pile on. Silently log.
      console.log(
        `[twilio/inbound] pass race-lost suppressed for ${vendor.slug} (${matchedPhone.number}) — same-team resolution already announced`,
      );
      return;
    }
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
    sendOpenBlastSms(
      {
        cartLabel: compactCartLabel(pending.leadMetadata.cartLabel),
        pickupFormatted: pending.leadMetadata.pickupShort,
        returnFormatted: pending.leadMetadata.returnShort,
        numDays: pending.leadMetadata.numDays,
        handoff: pending.leadMetadata.handoff,
      },
      { excludeSlugs: [vendor.slug] },
    )
      .then((sent) =>
        console.log(`[first-look] PASS triggered open-blast to ${sent} vendors`),
      )
      .catch((err) => console.error("[first-look] PASS open-blast failed:", err));
    return;
  }

  // ACCEPT / CLAIM
  const won = await markAccepted({
    id: pending.id,
    acceptedViaPhone: matchedPhone.number,
  });
  if (!won) {
    console.log(
      `[twilio/inbound] accept race-lost suppressed for ${vendor.slug} (${matchedPhone.number}) — same-team resolution already announced`,
    );
    return;
  }

  // Record the vendor on the durable booking row (the rentals calendar's
  // source of truth). lead_id is the Stripe session id. Fail-soft.
  assignCartVendor(pending.leadId, vendor.slug).catch((err) =>
    console.error("[twilio/inbound] assignCartVendor failed:", err),
  );

  const md = pending.leadMetadata;
  const acceptingContact = matchedPhone.contactName ?? "team";
  const handoffLabel =
    md.handoff === "pickup"
      ? "pickup at your shop"
      : "delivery to their address";

  // ONE merged alert to ALL of vendor's phones. Customer phone + email are
  // intentionally NOT included (PAL stays the listed provider; PAL relays
  // handoff details before the rental date).
  const confirmBody = [
    `Port A Local: ✅ ${vendor.name} claimed the ${md.cartLabel} lead`,
    `Claimed by ${acceptingContact}.`,
    `Booking name: ${formatCustomerDisplay(md.customerName) ?? md.customerName}`,
    `Date: ${md.pickupShort}`,
    `Return: ${md.returnShort}`,
    `Method: Customer chose ${handoffLabel}`,
    `We'll confirm the reservation with you 24–48 hours before the trip — PAL handles all customer comms until then. Reply here if you need anything from us.`,
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
  sendSms(
    OPERATOR_PHONE_E164,
    `[first-look ✅] ${vendor.name} (${acceptingContact}) claimed ${md.cartLabel} — ${md.pickupShort} to ${md.returnShort} for ${md.customerName} — ${md.handoff}`,
  ).catch((err) =>
    console.error("[twilio/inbound] operator ping on accept failed:", err),
  );
}

/* =====================================================================
 * Webhook — thin dispatcher
 * ===================================================================== */

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

    // Insider bridge (Winston, Collie, Nick, etc.) — runs before the
    // vendor streams since insiders aren't vendors.
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

    // Which stream(s) does this phone belong to? A Bron's number is in both.
    const beachVendor = findBeachVendorByPhone(fromE164);
    const cartMatch = findVendorByPhoneE164(fromE164, toE164);

    // ---- STOP — applies to whichever stream(s) this phone belongs to ----
    if (intent === "stop") {
      if (beachVendor) {
        console.log(
          `[twilio/inbound] STOP from beach vendor ${beachVendor.slug} - flag for manual removal from beach vendor roster`,
        );
      }
      if (cartMatch) {
        await recordOptOut(cartMatch.vendor.slug, {
          inboundSid: messageSid,
          inboundBody: body,
        });
      }
      return twimlResponse();
    }

    // ---- CART STREAM: ACCEPT / PASS (cart-only keywords) ----
    // This is the fix: these route straight to cart even when the sender is
    // ALSO a beach vendor, so the beach catch-all can't swallow them.
    if ((intent === "accept" || intent === "pass") && cartMatch) {
      await handleCartFirstLook(cartMatch.vendor, cartMatch.phone, intent, body);
      return twimlResponse();
    }

    // ---- BEACH STREAM: CLAIM ----
    if (intent === "claim" && beachVendor) {
      const unclaimed = await getMostRecentUnclaimed();
      if (unclaimed) {
        await handleBeachClaim(beachVendor, unclaimed, fromRaw, fromE164);
        return twimlResponse();
      }
      // No beach booking waiting. If this phone is also a cart vendor with a
      // pending first-look, CLAIM means the cart lead (legacy alias).
      if (cartMatch) {
        const pending = await getMostRecentPendingForVendor(cartMatch.vendor.slug);
        if (pending) {
          await handleCartFirstLook(cartMatch.vendor, cartMatch.phone, "claim", body);
          return twimlResponse();
        }
      }
      sendSms(
        fromRaw,
        `Port A Local: Thanks ${beachVendor.name} - no unclaimed beach booking right now. Next blast comes through automatically.`,
      ).catch((err) =>
        console.error("[twilio/inbound] beach no-lead reply failed:", err),
      );
      return twimlResponse();
    }

    // ---- CART STREAM: CLAIM from a cart-only vendor (not a beach vendor) ----
    if (intent === "claim" && cartMatch) {
      await handleCartFirstLook(cartMatch.vendor, cartMatch.phone, "claim", body);
      return twimlResponse();
    }

    // ---- CART STREAM: SMS opt-in (YES / NO) ----
    if (intent === "yes" && cartMatch) {
      await recordOptIn(cartMatch.vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      sendSms(cartMatch.phone.number, buildOptInConfirmSms(cartMatch.vendor.name)).catch((err) =>
        console.error("[twilio/inbound] confirm-send failed:", err),
      );
      return twimlResponse();
    }
    if (intent === "no" && cartMatch) {
      await recordOptOut(cartMatch.vendor.slug, {
        inboundSid: messageSid,
        inboundBody: body,
      });
      sendSms(cartMatch.phone.number, buildOptOutAckSms(cartMatch.vendor.name)).catch((err) =>
        console.error("[twilio/inbound] optout-ack-send failed:", err),
      );
      return twimlResponse();
    }

    // ---- BEACH catch-all (fallback: any other beach-vendor reply) ----
    if (beachVendor) {
      sendSms(
        OPERATOR_PHONE_E164,
        `[${beachVendor.name} → PAL] ${body}`.slice(0, 1500),
      ).catch((err) =>
        console.error("[twilio/inbound] beach-vendor surface to operator failed:", err),
      );
      return twimlResponse();
    }

    // ---- CART catch-all (fallback: any other cart-vendor reply) ----
    if (cartMatch) {
      sendSms(
        OPERATOR_PHONE_E164,
        `[${cartMatch.vendor.name} (${cartMatch.phone.label ?? "phone"}) → PAL] ${body}`.slice(0, 1500),
      ).catch((err) =>
        console.error("[twilio/inbound] cart-vendor surface to operator failed:", err),
      );
      return twimlResponse();
    }

    // ---- STRANGER — unknown number: surface to operator + admin@ ----
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
  } catch (err) {
    console.error("[twilio/inbound] unhandled:", err);
    return twimlResponse();
  }
}
