import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  upsertSubscription,
  type SubscriberKind,
} from "@/data/push-subscriptions-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_KINDS: SubscriberKind[] = [
  "wheelhouse-participant",
  "cart-vendor",
  "locals-seller",
  "restaurant",
  "housekeeping-vendor",
  "customer-topic",
];

/**
 * POST /api/push/subscribe
 *
 * Body: {
 *   subscriberKind: "wheelhouse-participant" | "cart-vendor" | ...,
 *   subscriberId: <participant id, vendor slug, listing id, topic name>,
 *   subscription: <PushSubscriptionJSON from browser registration>,
 * }
 *
 * Auth: depends on subscriberKind
 *   - wheelhouse-participant: cookie-gated (wheelhouse_who must match)
 *   - cart-vendor / locals-seller / restaurant / housekeeping-vendor:
 *     open (vendor's already in our network; no auth gate makes
 *     the install flow easier — the subscriberId itself is a
 *     vendor-network-membership token in practice)
 *   - customer-topic: open
 *
 * Returns the persisted subscription record (id + bookkeeping
 * fields; subscription_json itself is opaque on the way out).
 */
export async function POST(req: NextRequest) {
  let body: {
    subscriberKind?: string;
    subscriberId?: string;
    subscription?: object;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const kind = body.subscriberKind as SubscriberKind | undefined;
  const subscriberId = (body.subscriberId ?? "").trim();
  const sub = body.subscription as
    | { endpoint?: string; [k: string]: unknown }
    | undefined;

  if (!kind || !ALLOWED_KINDS.includes(kind)) {
    return NextResponse.json(
      { error: `Unknown subscriberKind. Expected one of: ${ALLOWED_KINDS.join(", ")}` },
      { status: 400 },
    );
  }
  if (!subscriberId) {
    return NextResponse.json(
      { error: "subscriberId required" },
      { status: 400 },
    );
  }
  if (!sub?.endpoint) {
    return NextResponse.json(
      { error: "subscription.endpoint required (browser PushSubscription)" },
      { status: 400 },
    );
  }

  // Wheelhouse participants gate on cookie auth — the subscriberId
  // must match the signed-in wheelhouse_who. Prevents one user from
  // hijacking another's subscription.
  if (kind === "wheelhouse-participant") {
    const cookieStore = await cookies();
    const who = cookieStore.get("wheelhouse_who")?.value;
    if (!who) {
      return NextResponse.json({ error: "Not signed in" }, { status: 403 });
    }
    if (who !== subscriberId) {
      return NextResponse.json(
        { error: "subscriberId must match signed-in wheelhouse_who" },
        { status: 403 },
      );
    }
  }

  const ua = req.headers.get("user-agent") ?? undefined;
  const record = await upsertSubscription({
    subscriberKind: kind,
    subscriberId,
    endpoint: sub.endpoint,
    subscriptionJson: JSON.stringify(sub),
    userAgent: ua,
  });

  return NextResponse.json({
    ok: true,
    id: record.id,
    subscriberKind: record.subscriberKind,
    subscriberId: record.subscriberId,
    createdAt: record.createdAt,
  });
}
