/**
 * Meta Pixel — client-side event tracking helpers.
 *
 * The Pixel base script loads via <Script> in src/app/layout.tsx and
 * fires PageView automatically on every page render. The helpers below
 * fire specific standard events from page-level client components when
 * the relevant user action happens.
 *
 * Pixel ID lives in NEXT_PUBLIC_META_PIXEL_ID (Vercel Production +
 * Preview). When unset, the base script doesn't render and the
 * helpers below silently no-op (no console noise, no errors).
 *
 * Reference: https://developers.facebook.com/docs/meta-pixel/reference
 */

type FbqArgs =
  | [event: "init", pixelId: string]
  | [
      event: "track",
      eventName: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ]
  | [
      event: "trackCustom",
      eventName: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ];

declare global {
  interface Window {
    fbq?: (...args: FbqArgs) => void;
    _fbq?: unknown;
  }
}

function pixelEnabled(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/** Standard Meta event names we use. Typed so misspellings caught at compile time. */
export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "Search"
  | "CompleteRegistration";

/**
 * Generic fire-an-event helper. Use the named helpers below for the
 * common cases; reach for this only if a custom event params shape is
 * needed.
 */
export function trackEvent(
  event: MetaStandardEvent,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
): void {
  if (!pixelEnabled()) return;
  try {
    // Pass eventID (4th fbq arg) when supplied so Meta can dedupe this
    // browser event against the matching server-side Conversions API
    // event that shares the same event_id. Without an eventID we keep
    // the 3-arg call to avoid sending an empty options object.
    if (options?.eventID) {
      window.fbq!("track", event, params, options);
    } else {
      window.fbq!("track", event, params);
    }
  } catch (err) {
    console.error(`[meta-pixel] trackEvent(${event}) threw:`, err);
  }
}

/**
 * ViewContent — fires when a user lands on a "content" page (a beach
 * booking page, cart rental page, restaurant detail, event detail, etc.)
 * Use the page-level client component <MetaPixelViewContent /> rather
 * than calling this directly.
 */
export function trackViewContent(params: {
  contentName: string;
  contentCategory?: string;
  contentIds?: string[];
  value?: number;
  currency?: string;
}): void {
  trackEvent("ViewContent", {
    content_name: params.contentName,
    content_category: params.contentCategory,
    content_ids: params.contentIds,
    value: params.value,
    currency: params.currency ?? "USD",
  });
}

/**
 * InitiateCheckout — fires when a user submits a booking form that
 * redirects them to Stripe Checkout. Called from the form submit
 * handler BEFORE the redirect.
 */
export function trackInitiateCheckout(params: {
  value: number; // USD, decimal dollars
  contentName: string;
  contentCategory?: string;
  numItems?: number;
}): void {
  trackEvent("InitiateCheckout", {
    content_name: params.contentName,
    content_category: params.contentCategory,
    num_items: params.numItems ?? 1,
    value: params.value,
    currency: "USD",
  });
}

/**
 * Purchase — fires on the post-Stripe success page once payment is
 * confirmed server-side. Highest-value event for ad optimization;
 * conversions objective optimizes against this.
 */
export function trackPurchase(params: {
  value: number; // USD, decimal dollars
  contentName: string;
  contentCategory?: string;
  contentIds?: string[];
  orderId?: string;
}): void {
  trackEvent(
    "Purchase",
    {
      content_name: params.contentName,
      content_category: params.contentCategory,
      content_ids: params.contentIds,
      value: params.value,
      currency: "USD",
      order_id: params.orderId,
    },
    // eventID = the Stripe session id (same key the server Conversions
    // API Purchase uses) so the two events dedupe to one conversion.
    params.orderId ? { eventID: params.orderId } : undefined,
  );
}

/**
 * Lead — fires when a user submits a non-purchase form that captures
 * intent (locals signup, contact form, newsletter, etc.).
 */
export function trackLead(params: {
  contentName: string;
  contentCategory?: string;
}): void {
  trackEvent("Lead", {
    content_name: params.contentName,
    content_category: params.contentCategory,
  });
}

/**
 * Read-only check used by debug UIs / health dashboards. Returns true
 * if the base Pixel script is loaded + the env var was set.
 */
export function isMetaPixelLive(): boolean {
  return pixelEnabled();
}
