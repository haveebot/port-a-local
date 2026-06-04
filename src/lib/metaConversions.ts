/**
 * Meta Conversions API (server-side events).
 *
 * The client Meta Pixel fires Purchase from the browser on the success
 * page — but that signal is lossy (iOS, ad-blockers, cookie expiry, the
 * user closing the tab before the success page loads). This module sends
 * the SAME Purchase from our server the moment Stripe confirms payment,
 * so attribution survives even when the browser event doesn't.
 *
 * Dedup: every server event carries `event_id = Stripe session id`, the
 * exact eventID the client pixel sends (see metaPixel.ts trackPurchase).
 * Meta collapses the browser + server pair into ONE conversion by
 * (event_name, event_id). Without this they'd double-count.
 *
 * Match quality: we hash the customer's email + phone (SHA-256, the
 * format Meta requires) and pass Meta's own _fbc / _fbp cookies + the
 * client IP captured at checkout. Email + phone + fbc is already a strong
 * match set.
 *
 * Best-effort: every function fail-soft returns a result object and never
 * throws — a Conversions API hiccup must never break a booking confirm.
 *
 * Token: prefers META_CONVERSIONS_API_TOKEN (a dedicated Events-Manager
 * token) when set, else falls back to META_PAGE_ACCESS_TOKEN (which today
 * carries the ads permissions the rest of metaAds.ts uses). Pixel id is
 * NEXT_PUBLIC_META_PIXEL_ID.
 */

import crypto from "crypto";

const GRAPH = "https://graph.facebook.com/v21.0";

function getToken(): string | null {
  const t = (
    process.env.META_CONVERSIONS_API_TOKEN ||
    process.env.META_PAGE_ACCESS_TOKEN ||
    ""
  ).trim();
  return t.length > 0 ? t : null;
}

function getPixelId(): string | null {
  const id = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

/** SHA-256 hex of a normalized string — Meta's required PII hash. */
function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Email → trimmed + lowercased → sha256. */
function hashEmail(email: string): string | undefined {
  const norm = email.trim().toLowerCase();
  return norm ? hash(norm) : undefined;
}

/**
 * Phone → digits only, US country code prepended when a bare 10-digit
 * number, → sha256. Meta wants E.164 without the leading '+'.
 */
function hashPhone(phone: string): string | undefined {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length === 10) digits = `1${digits}`;
  return hash(digits);
}

export interface PurchaseEventInput {
  /** Stripe session id — the dedup key shared with the client pixel. */
  eventId: string;
  /** order value in decimal dollars */
  value: number;
  currency?: string;
  email?: string;
  phone?: string;
  /** Meta _fbc cookie (click id), captured at checkout */
  fbc?: string;
  /** Meta _fbp cookie (browser id), captured at checkout */
  fbp?: string;
  /** customer IP captured at checkout (x-forwarded-for) */
  clientIp?: string;
  /** page the conversion is attributed to, e.g. https://theportalocal.com/beach */
  eventSourceUrl?: string;
}

export interface ConversionsResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  eventsReceived?: number;
  error?: string;
}

/**
 * Send a server-side Purchase to the Conversions API. Returns a result
 * object; never throws. No-op (skipped) when token/pixel aren't set or
 * there's no usable identifier to match on.
 */
export async function sendPurchaseEvent(
  input: PurchaseEventInput,
): Promise<ConversionsResult> {
  const token = getToken();
  const pixelId = getPixelId();
  if (!token || !pixelId) {
    return { ok: false, skipped: true, reason: "conversions API not configured" };
  }

  const userData: Record<string, unknown> = {};
  if (input.email) {
    const em = hashEmail(input.email);
    if (em) userData.em = [em];
  }
  if (input.phone) {
    const ph = hashPhone(input.phone);
    if (ph) userData.ph = [ph];
  }
  if (input.fbc) userData.fbc = input.fbc;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.clientIp) userData.client_ip_address = input.clientIp;

  // No identifier → Meta can't match it to a person; don't bother.
  if (Object.keys(userData).length === 0) {
    return { ok: false, skipped: true, reason: "no user identifiers to match on" };
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
        user_data: userData,
        custom_data: {
          value: input.value,
          currency: input.currency ?? "USD",
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `${GRAPH}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const json = (await res.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        error: json.error?.message ?? `HTTP ${res.status}`,
      };
    }
    return { ok: true, eventsReceived: json.events_received ?? 1 };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
