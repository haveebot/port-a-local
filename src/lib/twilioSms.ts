/**
 * Twilio SMS helper — single source of truth for outbound SMS from PAL APIs.
 *
 * Consent model:
 * - Consumer SMS must be gated on an explicit opt-in (`smsConsent === true`) collected
 *   via the separate unchecked-by-default checkbox on the maintenance/rent/beach forms.
 * - "Vendor / internal-ops SMS" (John Brown dispatch, admin alerts, driver dispatch)
 *   gets the same plumbing but is NOT magically exempt from carrier filtering
 *   pre-A2P 10DLC — AT&T and Verizon have been blocking or heavily throttling
 *   unregistered long-code A2P traffic to consumer mobile numbers since ~2024,
 *   regardless of B2B vs B2C intent. Twilio reports "delivered" even when the
 *   carrier silently drops it. Treat ALL SMS as best-effort until A2P 10DLC is
 *   approved at TCR. Always pair with email backup for any flow that ACTUALLY
 *   has to reach someone (e.g. driver dispatch — see deliverDispatch.ts).
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || "";
const TWILIO_MESSAGING_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || "";

export async function sendSms(to: string, body: string): Promise<void> {
  if (!TWILIO_SID || !TWILIO_TOKEN || (!TWILIO_MESSAGING_SID && !TWILIO_FROM)) {
    console.log("[SMS] Twilio not configured — would send to", to, ":", body);
    return;
  }

  const toClean = to.replace(/\D/g, "").replace(/^1/, "");
  const toFormatted = `+1${toClean}`;
  if (toClean.length !== 10) {
    console.error(`[SMS] Invalid phone number: ${to} → ${toFormatted}`);
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const params: Record<string, string> = { To: toFormatted, Body: body };
  if (TWILIO_MESSAGING_SID) {
    params.MessagingServiceSid = TWILIO_MESSAGING_SID;
  } else {
    params.From = TWILIO_FROM;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error("[SMS] Twilio error:", JSON.stringify(result));
  } else {
    console.log("[SMS] Sent. SID:", result.sid, "Status:", result.status);
  }
}

/**
 * Send consumer SMS only if the user affirmatively opted in via the form checkbox.
 * Pass the `smsConsent` value as-received (may be boolean from direct POST or the
 * string "true"/"false" after round-tripping through Stripe metadata).
 */
export async function sendConsumerSms(
  to: string,
  body: string,
  smsConsent: unknown,
): Promise<void> {
  const consented = smsConsent === true || smsConsent === "true";
  if (!consented) {
    console.log("[SMS] Consumer SMS skipped — no consent recorded for", to);
    return;
  }
  return sendSms(to, body);
}
