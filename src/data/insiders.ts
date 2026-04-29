/**
 * Insider phone allowlist for inbound SMS.
 *
 * When the Twilio inbound webhook receives a message from one of these
 * phones, it forwards the message to admin@theportalocal.com (and
 * optionally other channels) instead of running the cart-vendor matcher.
 * Lets PAL collaborators (Collie, Nick, Winston himself) text the PAL
 * number and have the message land in admin@ where Claude reads it on
 * session start via pal_mail.py.
 *
 * Phone numbers are stored in E.164 (+1XXXXXXXXXX) format to match the
 * webhook's normalized From field. Add a new insider by appending an
 * entry — no other code changes required.
 */

export interface Insider {
  phoneE164: string;
  name: string;
  role: string;
  notes?: string;
}

export const insiders: Insider[] = [
  {
    phoneE164: "+15125681725",
    name: "Winston",
    role: "PAL operator",
    notes: "Owner — admin everything",
  },
  {
    phoneE164: "+12107095771",
    name: "Collie",
    role: "PAL marketing partner",
    notes: "Brand voice + Live Music + outreach",
  },
  {
    phoneE164: "+15122015353",
    name: "Nick",
    role: "Heye Lab founder",
    notes: "CityDeploy / platform-tech context",
  },
];

export function findInsider(phoneE164: string): Insider | null {
  return insiders.find((i) => i.phoneE164 === phoneE164) ?? null;
}
