/**
 * Port A Local — Event content
 *
 * Long-form, structured content for events that warrant a dedicated detail
 * page. Mirrors the dispatch-content / story-content shape so future events
 * can be added without changing the page layout.
 */

export interface EventLogEntry {
  /** ISO timestamp — when the update was posted */
  timestamp: string;
  /** Short headline (will render bold) */
  title: string;
  /** Body paragraph(s) */
  body: string;
  /** Optional kind for color/icon — info | conditions | photos | wrap */
  kind?: "info" | "conditions" | "photos" | "wrap";
}

export interface EventScheduleItem {
  time: string;
  label: string;
  body: string;
}

export interface EventFAQ {
  q: string;
  a: string;
}

export interface EventContent {
  /** Lede paragraph at the top of the article body */
  lede: string;
  /** What to expect — short prose paragraphs */
  whatToExpect: string[];
  /** Schedule blocks — one row per time block */
  schedule: EventScheduleItem[];
  /** Things to bring / good-to-know practical bullets */
  goodToKnow: { label: string; detail: string }[];
  /** FAQ items rendered as collapsibles */
  faq: EventFAQ[];
  /** About the host — narrative for the host card */
  hostBlurb: string[];
  /** Day-of liveblog entries — newest first. Empty until day-of. */
  liveLog: EventLogEntry[];
  /** Optional source citations — same shape as dispatch sources */
  sources: { label: string; url?: string }[];
}

export const eventContent: Record<string, EventContent> = {
  "spring-kite-festival-2026": {
    lede:
      "Forty years on, Port Aransas's longest-running grassroots beach event still doesn't charge admission, doesn't sell vendor space, and doesn't post a setlist. Just a flag line in the sand on Mother's Day weekend, a few hundred kites, and whoever shows up.",
    whatToExpect: [
      "By 10 AM Saturday, Fly It Port A's flying line goes up between beach markers 1 and 20 — the south-end stretch of beach closest to the south jetty. Resident kite fliers from across the Gulf coast and beyond — Houston, Dallas, San Antonio, Louisiana, sometimes farther — set up large display kites, banners, line laundry, and rotating stunt demonstrations through the afternoon.",
      "It's a watch-or-fly event by design. Bring your own kite and you have the same flag-line real estate as anyone. Bring nothing and the show is just as good from a beach chair. Last year drew several hundred fliers at the peak; the 2026 Facebook event is already showing 443 going and 3,400+ interested.",
      "Weather permitting, the line stays up all day Saturday and rolls into Sunday morning for an additional informal session. Some years the conditions are good enough that fliers stay through dusk for illuminated night kites — call Fly It on Friday for the call.",
    ],
    schedule: [
      {
        time: "Friday, May 8",
        label: "Early arrivals fly",
        body:
          "Out-of-town fliers begin arriving and putting up display kites informally through the afternoon. Not the main day, but a soft start.",
      },
      {
        time: "Saturday, May 9 · 10 AM",
        label: "Setup begins",
        body:
          "Flying line goes up at the marker 1 end of the beach. Bring kites, sand stakes, sunscreen.",
      },
      {
        time: "Saturday · 11 AM – 4 PM",
        label: "Main fly + demonstrations",
        body:
          "Display kites in the air, rotating stunt demos, line laundry. Watch from anywhere along the beach behind the flag line.",
      },
      {
        time: "Saturday · evening (weather permitting)",
        label: "Night kites",
        body:
          "Some years the wind cooperates and illuminated kites stay up after dark. Call (361) 749-4190 Friday for the night-kite call.",
      },
      {
        time: "Sunday, May 10",
        label: "Informal Sunday fly",
        body:
          "Lighter, less structured than Saturday — often the best wind window of the weekend.",
      },
    ],
    goodToKnow: [
      {
        label: "Beach parking permit",
        detail:
          "$12 annual permit required to park on the beach. Buy at the Port Aransas Welcome Center, most local convenience stores, or the H-E-B / IGA grocery.",
      },
      {
        label: "No vendors on the beach",
        detail:
          "By design — bring your beach essentials. Water, sunscreen, snacks, chairs, hats. Stop in town first.",
      },
      {
        label: "Where on the beach",
        detail:
          "Markers 1–20 — the south end of Mustang Island closest to the south jetty. Drive on at any beach access between Beach Access 1 and Access 1A.",
      },
      {
        label: "Bring your own kite",
        detail:
          "Walk-up fliers welcome. Or buy at Fly It Port A on Avenue G before driving to the beach — staff can rig you for the wind that day.",
      },
      {
        label: "Wind conditions",
        detail:
          "Best fly windows are typically 10 AM–2 PM as the onshore breeze freshens. Check Port A Local's live conditions page before heading out.",
      },
      {
        label: "Family friendly",
        detail:
          "All ages, no admission, no entry list. Stroller and wagon friendly on packed sand near the flag line.",
      },
    ],
    faq: [
      {
        q: "Do I need to RSVP?",
        a: "No. The Facebook event tracks interest but there's no entry list, no ticketing, no gate. Just show up.",
      },
      {
        q: "Can my kids fly a kite there?",
        a: "Yes. The whole point. Walk up and start flying anywhere along the public stretch of beach behind the flag line.",
      },
      {
        q: "What if it's not windy?",
        a: "Fliers will still be there — many of the display kites can fly in surprisingly light wind. If conditions are completely flat, the event becomes more social. Sunday morning often has the best wind window of the weekend.",
      },
      {
        q: "Is there a rain plan?",
        a: "Light rain — fly continues. Storms — Fly It will post a call on their Facebook page Friday and Saturday morning.",
      },
      {
        q: "Where can I buy a kite?",
        a: "Fly It Port A's shop at 405 W Ave G stocks beginner through expert kites and can match you to the day's wind. Open 9 AM–6 PM, walk-in only.",
      },
      {
        q: "Is this related to the Fall Kite Festival?",
        a: "Same host, different weekend. Fly It runs three a year — Winter, Spring (Mother's Day), and Fall (Indigenous People Day weekend).",
      },
    ],
    hostBlurb: [
      "Fly It Port A — known locally as Fly-It! — has been on Avenue G since 1985, when Jean Yocum opened the original shop. The Pyle family bought it from Jean in 1991 and ran it for 31 years. In 2022, Jeremy and Courtney Timms took over and have kept the festivals, the inventory, and the no-admission, no-vendor format intact.",
      "Three festivals a year is the rhythm: Winter (around Presidents' Day weekend), Spring (Mother's Day weekend), and Fall (around Indigenous People Day weekend). The festivals have never been monetized — they exist because the Timms (and the Pyles before them) wanted other fliers to have a reason to come to the island.",
    ],
    liveLog: [],
    sources: [
      {
        label: "Fly It Port A — official site",
        url: "https://flyitporta.com/",
      },
      {
        label: "Fly It Port A — Facebook event (Spring 2026)",
        url: "https://www.facebook.com/people/Fly-It-Port-A-Kite-Shop/",
      },
      {
        label:
          "Port Aransas CVB event listing — Fly It Port A's Spring Kite Festival",
        url: "https://www.portaransas.org/event/fly-it-port-a%E2%80%99s-spring-kite-festival/5655/",
      },
      {
        label:
          "Port Aransas South Jetty — Fly-It! kite shop celebrates 30 years (2021)",
        url: "https://www.portasouthjetty.com/articles/fly-it-kite-shop-to-celebrate-30-years/",
      },
      {
        label:
          "Port Aransas CVB — Q&A with the new owners of Fly It! Port A Kite Shop (2022)",
        url: "https://www.portaransas.org/blog/stories/post/meet-the-new-owners-of-fly-it-port-a-kite-shop/",
      },
    ],
  },
};
