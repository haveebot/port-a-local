"use client";

import { useEffect, useRef } from "react";
import {
  trackViewContent,
  trackPurchase,
  trackLead,
} from "@/lib/metaPixel";

/**
 * MetaPixelEvent — drop-in client component that fires a Meta Pixel
 * event once on mount. Use for ViewContent on category landing pages,
 * Purchase on success pages, Lead on signup confirmation pages.
 *
 * For InitiateCheckout, do NOT use this component — fire it imperatively
 * from the form submit handler BEFORE the Stripe redirect (call
 * `trackInitiateCheckout` from src/lib/metaPixel).
 *
 * Example placement:
 *   // /beach/page.tsx
 *   <MetaPixelEvent event="ViewContent" contentName="Beach Setup" contentCategory="beach-booking" />
 *
 *   // /rent/success/page.tsx
 *   <MetaPixelEvent event="Purchase" contentName="Golf Cart Reservation" value={50} />
 *
 *   // /locals success page
 *   <MetaPixelEvent event="Lead" contentName="Locals signup" />
 */
type Props =
  | {
      event: "ViewContent";
      contentName: string;
      contentCategory?: string;
      contentIds?: string[];
      value?: number;
    }
  | {
      event: "Purchase";
      contentName: string;
      contentCategory?: string;
      contentIds?: string[];
      value: number;
      orderId?: string;
    }
  | {
      event: "Lead";
      contentName: string;
      contentCategory?: string;
    };

export default function MetaPixelEvent(props: Props) {
  // Guard against React strict-mode double-mount + repeated renders firing
  // duplicate events. Once per component instance is enough.
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (props.event === "ViewContent") {
      trackViewContent({
        contentName: props.contentName,
        contentCategory: props.contentCategory,
        contentIds: props.contentIds,
        value: props.value,
      });
    } else if (props.event === "Purchase") {
      trackPurchase({
        contentName: props.contentName,
        contentCategory: props.contentCategory,
        contentIds: props.contentIds,
        value: props.value,
        orderId: props.orderId,
      });
    } else if (props.event === "Lead") {
      trackLead({
        contentName: props.contentName,
        contentCategory: props.contentCategory,
      });
    }
  }, [props]);

  return null;
}
