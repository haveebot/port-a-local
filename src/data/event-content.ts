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
  /** Optional kind for color/icon — info | conditions | photos | weigh-in | wrap */
  kind?: "info" | "conditions" | "photos" | "weigh-in" | "wrap";
  /** Optional structured weigh-in data — surfaces a richer card when kind === "weigh-in" */
  weighIn?: {
    angler: string;
    boat?: string;
    species: string;
    weight?: string;
    length?: string;
    division?: string;
    photo?: string;
  };
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

export interface EventBeachCam {
  /** Display name */
  name: string;
  /** Short caption — what the camera shows */
  description: string;
  /** Approximate marker range or beach landmark */
  markerRange: string;
  /** External URL to the live stream (HDOnTap blocks iframe embeds) */
  url: string;
}

export interface EventTimelineEntry {
  /** Year or short period label, e.g. "1985", "1991–2022" */
  year: string;
  /** Headline phrase */
  title: string;
  /** One- or two-sentence detail */
  body: string;
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
  /** Curated subset of /live cams that cover this event's beach stretch */
  beachCams?: EventBeachCam[];
  /** Host history timeline — vertical-dot rendering on the page */
  hostTimeline?: EventTimelineEntry[];
  /** Optional source citations — same shape as dispatch sources */
  sources: { label: string; url?: string }[];
}

export const eventContent: Record<string, EventContent> = {
  "spring-kite-festival-2026": {
    lede:
      "It's the third year of Port A's Mother's Day kite weekend in its current three-festivals-a-year shape, and the formula is the same one that worked the first time: a flag line in the sand, a few hundred kites, no admission, no vendor row, and whoever shows up.",
    whatToExpect: [
      "By 10 AM Saturday, Fly It Port A's flying line goes up between beach markers 1 and 20 — the south-end stretch of beach closest to the south jetty. Resident kite fliers from across the Gulf coast and beyond — Houston, Dallas, San Antonio, Louisiana, sometimes farther — set up large display kites, banners, line laundry, and rotating stunt demonstrations through the afternoon.",
      "It's a watch-or-fly event by design. Bring your own kite and you have the same flag-line real estate as anyone. Bring nothing and the show is just as good from a beach chair. Last year drew several hundred fliers at the peak; the 2026 Facebook event is already showing 443 going and 3,400+ interested.",
      "Weather permitting, the line stays up all day Saturday and rolls into Sunday morning for an additional informal session. Some years the conditions are good enough that fliers stay through dusk for illuminated night kites — call Fly It on Friday for the call.",
    ],
    schedule: [
      {
        time: "Fri May 8 · afternoon",
        label: "Out-of-town fliers arrive",
        body:
          "Fliers from Houston, Dallas, San Antonio, and Louisiana begin arriving and putting display kites up informally. Not the main day, but worth driving the beach for a preview.",
      },
      {
        time: "Sat May 9 · 8 AM",
        label: "Park early — beach access fills",
        body:
          "South-end beach access (Access 1A) fills fastest. By 9 AM the closest parking is gone. Either roll in by 8 or plan to walk a quarter-mile.",
      },
      {
        time: "Sat · 10 AM",
        label: "Setup begins",
        body:
          "Flying line goes up at the marker 1 end of the beach. Display kites are rigged, sand anchors driven, banners raised.",
      },
      {
        time: "Sat · 11 AM – 12 PM",
        label: "First kites in the air",
        body:
          "First wave of large display kites and banners up. Onshore breeze typically freshens around this hour. Best photo window of the morning.",
      },
      {
        time: "Sat · 12 PM – 2 PM",
        label: "Peak attendance + stunt demos",
        body:
          "Peak crowd. Rotating stunt-kite demonstrations, dual-line and quad-line teams, line laundry. Bring shade — limited natural cover.",
      },
      {
        time: "Sat · 2 PM – 4 PM",
        label: "Sustained fly + family hour",
        body:
          "Crowd thins slightly mid-afternoon. Best window for kids to walk up with their own kite — more flag-line space, friendlier wind.",
      },
      {
        time: "Sat · 4 PM – sunset",
        label: "Wind-down or night kites",
        body:
          "Either the line packs up around 5 PM or — if conditions hold — illuminated night kites stay up after dark. Call Fly It at (361) 749-4190 Friday for the night-kite call.",
      },
      {
        time: "Sun May 10 · morning",
        label: "Informal Sunday session",
        body:
          "Lighter and less structured than Saturday. Often the best wind window of the weekend — dawn-into-mid-morning onshore is reliably clean. Worth the early drive if Saturday's crowd was too much.",
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
      "The kite shop on Avenue G has been a Port Aransas constant for four decades. Jean Yocum opened the original Fly It around 1985, sponsoring competitive flyers in the early years. The Pyle family bought it from Jean in 1991 and ran it as Fly-It! for 31 years — the long Pyle era is what most locals remember as the shop's identity. In July 2022, Jeremy and Courtney Timms took over.",
      "The current three-festivals-a-year cadence — Winter (Presidents' Day weekend), Spring (Mother's Day weekend), and Fall (Indigenous People Day weekend) — is a Timms-era addition. Informal kite flies happened under the Pyles, but the structured Spring/Fall/Winter pattern is roughly three years old. The festivals have never been monetized: no admission, no vendor row, no sponsor logos. They exist because the shop wants other flyers to have a reason to come to the island.",
    ],
    liveLog: [],
    beachCams: [
      {
        name: "Aransas Princess Beach Cam",
        description: "Beach and Gulf — closest cam to the festival flag line",
        markerRange: "On the beach at Access 1A · approx. marker 5",
        url: "https://hdontap.com/stream/167516/aransas-princess-port-aransas-beach-live-webcam/",
      },
      {
        name: "Casa Condos Beach Cam",
        description: "Rotating shoreline and surf views from the south stretch",
        markerRange: "South end · approx. markers 8–15",
        url: "https://hdontap.com/stream/831616/casa-condos-port-aransas-beach-live-webcam/",
      },
      {
        name: "Sandpiper Beach Cam",
        description: "Panoramic southeast-facing beach view",
        markerRange: "South end · approx. markers 10–18",
        url: "https://hdontap.com/stream/518728/port-aransas-beach-live-webvam/",
      },
      {
        name: "Sea Gull Beach Cam",
        description: "Northeast surf and shoreline on the south stretch",
        markerRange: "South end · approx. markers 15–20",
        url: "https://hdontap.com/stream/814199/port-aransas-beach-seagull-condos-live-webcam/",
      },
      {
        name: "Gulf Shores Beach Cam",
        description: "East-southeast — waves, horizon, often picks up flying line",
        markerRange: "South end · approx. markers 6–12",
        url: "https://hdontap.com/stream/776400/gulf-shores-port-aransas-live-beach-cam/",
      },
      {
        name: "The Dunes (PTZ)",
        description: "Pan/tilt/zoom — operator can scan south to catch the line",
        markerRange: "Mid-island PTZ · scans south end",
        url: "https://hdontap.com/stream/259405/the-dunes-port-aransas-live-beach-cam/",
      },
    ],
    hostTimeline: [
      {
        year: "~1985",
        title: "Jean Yocum opens the original Fly It",
        body:
          "First incarnation of the kite shop on the south end of Avenue G. Sponsored competitive kite flyers including Ralph Pyle in the early years.",
      },
      {
        year: "1991",
        title: "Ralph & Suanne Pyle buy the shop (July 13)",
        body:
          "Jean retires and asks the Pyles if they want to take it over. They say yes. The 31-year Pyle era — Fly-It! as the island knows it — begins.",
      },
      {
        year: "1997",
        title: "Move to 405 W Ave G (current location)",
        body:
          "Bigger building, room for expanded inventory. Avenue G stays the spine of the shop's identity through every owner.",
      },
      {
        year: "2022",
        title: "Jeremy & Courtney Timms take over",
        body:
          "The Pyles retire after 31 years. The Timms inherit the inventory, the location, and the kite-flier community that drives across two states for it.",
      },
      {
        year: "~2023",
        title: "Three-festivals-a-year cadence begins",
        body:
          "Winter (Presidents' Day weekend), Spring (Mother's Day weekend), Fall (Indigenous People Day weekend). Free, unmonetized, by design — same as the informal flies the Pyles ran before.",
      },
    ],
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

  "deep-sea-roundup-2026": {
    lede:
      "Ninety years ago this summer, Barney Farley and twenty-four other charter captains pulled up to the docks for a three-day tournament they called the Tarpon Rodeo. North Millican took home the first trophy — though everyone in town quietly knew it was his wife Totsy who landed the fish. Two world wars and a pandemic have come and gone since. The Roundup hasn't.",
    whatToExpect: [
      "Friday and Saturday are the fishing days. Six divisions run simultaneously across the bay, the surf, the jetties, and offshore as far as boats want to push. Tarpon and billfish are catch-and-release; everything else gets weighed at the Fred Rhodes Pavilion in Roberts Point Park starting around 5 PM each evening — and the pavilion is open to the public, free, no entry fee for spectators.",
      "Sunday is the awards day. Civic Center fish fry starts at noon, awards ceremony and raffle at 1 PM. The community shows up. The trophies get handed out. The same names show up on the perpetual hardware year after year — but every year there's also a new junior angler holding a fish that's bigger than they are.",
      "Three things make this tournament different from every other Texas billfish stop: it's been running continuously since 1932 (only WWII and 2020 caused a gap), the kids' Piggy Perch contest is a real award category not a sideshow, and the sanctioning org — Port Aransas Boatmen, Inc. — has been the same Boatmen Association since the first cast.",
    ],
    schedule: [
      {
        time: "Thu Jul 9 · evening",
        label: "Captain's meeting + opening reception",
        body:
          "Mandatory captain's meeting for registered boats. Public welcome to the reception — it's the night to catch up with the captains before they're too busy to talk.",
      },
      {
        time: "Fri Jul 10 · before sunrise",
        label: "Boats depart",
        body:
          "First light. Offshore boats are gone before most spectators are awake. Fly, kayak, and bay-surf anglers can start anytime — they're scored by their best single fish either day.",
      },
      {
        time: "Fri Jul 10 · 5 PM – 8 PM",
        label: "Day 1 weigh-in (public)",
        body:
          "Roberts Point Park · Fred Rhodes Pavilion. Free to watch. The first leaderboards post here. Bay-Surf and Offshore divisions are usually the most-watched — biggest fish, biggest crowd at the scale.",
      },
      {
        time: "Sat Jul 11 · morning",
        label: "Piggy Perch (kids)",
        body:
          "The only fishing contest where the smallest fish is a trophy. Bait and tackle provided. Awards: Most Fish · Smallest Fish · Largest Fish · Best Sportsmanship. Free to enter. Best photo op of the weekend.",
      },
      {
        time: "Sat Jul 11 · 5 PM – 8 PM",
        label: "Day 2 weigh-in (public) + final standings",
        body:
          "Final official weigh-in. Last chance to overtake a Day 1 leader. The leaderboards we're posting here finalize tonight pending official ratification.",
      },
      {
        time: "Sun Jul 12 · 12 PM",
        label: "Public fish fry",
        body:
          "Civic Center. Open to the public. The best deal in Port A on a July Sunday.",
      },
      {
        time: "Sun Jul 12 · 1 PM",
        label: "Awards ceremony + raffle",
        body:
          "Civic Center. All division winners, Junior winners, Top Woman Angler, Piggy Perch. Raffle drawings follow.",
      },
    ],
    goodToKnow: [
      {
        label: "Watching is free",
        detail:
          "Spectators don't register or pay. Roberts Point Park weigh-ins are public both Friday and Saturday evenings. Show up around 5 PM either night.",
      },
      {
        label: "Where the boats live",
        detail:
          "Most offshore boats berth at Port Aransas Marina or Fisherman's Wharf — both walkable from the weigh-in pavilion. Worth a stroll Friday afternoon to see what's about to fish.",
      },
      {
        label: "Parking",
        detail:
          "Roberts Point Park has a lot but it fills early on weigh-in nights. Walking from downtown is faster than circling. Golf carts welcome.",
      },
      {
        label: "Ferry timing",
        detail:
          "Tournament weekend is a high-traffic ferry weekend. Plan a 30–60 minute ferry wait Friday evening and Sunday morning. AM 530 has the live status.",
      },
      {
        label: "Junior anglers",
        detail:
          "Bay-Surf and Offshore each have a separate Junior bracket. Awarded alongside the adult divisions.",
      },
      {
        label: "Top Woman Angler",
        detail:
          "Cross-division award. Eligible across every division. Honors a lineage that goes back to Dorothy Fair, who was the first woman champion in 1934.",
      },
    ],
    faq: [
      {
        q: "Can I just show up to watch?",
        a: "Yes. Weigh-ins at Roberts Point Park are public Friday and Saturday evenings — no ticket, no entry fee. Sunday awards at the Civic Center are also open to the public.",
      },
      {
        q: "Do I have to be local to fish?",
        a: "No. Anyone can register through deepsearoundup.org. The tournament draws boats from across the Texas coast, plus regulars from Louisiana and as far as Florida.",
      },
      {
        q: "What's a 'release' division?",
        a: "Tarpon Release and Billfish Release are catch-and-release only. Length is recorded on tarpon; billfish are scored by count (weighted per species). The fish swims away — modern conservation grafted onto the 1932 tradition.",
      },
      {
        q: "Is the Piggy Perch only for kids?",
        a: "Yes. It's the kids' contest — the only one where the smallest fish wins a trophy. Adults can spectate from the dock.",
      },
      {
        q: "What if it storms?",
        a: "Tournament fishing continues unless the Coast Guard pulls everyone in. Weigh-ins move under cover but stay on schedule. Check the official board for any storm-driven changes.",
      },
      {
        q: "How do I know who's winning right now?",
        a: "We post live leaderboards on this page from each weigh-in. Refresh during the 5–8 PM windows. Official board posts at the pavilion are the source of truth — we cite them.",
      },
      {
        q: "Where does the money go?",
        a: "Port Aransas Boatmen, Inc. runs scholarship + community programs year-round. The tournament is the org's main annual fundraiser.",
      },
    ],
    hostBlurb: [
      "Port Aransas Boatmen, Inc. is the organization that became the Boatmen Association in 1932 — twenty-five charter and commercial captains who decided their fishing waters needed protection, their community needed support, and their tournament needed running. They've been doing all three ever since.",
      "The Roundup is their main annual event. Proceeds fund scholarships and community programs that touch nearly every kid who grows up on this island.",
    ],
    liveLog: [],
    hostTimeline: [
      {
        year: "1932",
        title: "Barney Farley organizes the first Tarpon Rodeo",
        body:
          "Twenty-five charter and commercial captains form the Boatmen Association. Three-day shotgun start. Tarpon-focused. North Millican wins the first perpetual trophy — though locals say his wife Totsy actually caught the fish.",
      },
      {
        year: "1934",
        title: "Dorothy Fair becomes the first woman champion",
        body:
          "Two years in. The Top Woman Angler award still carried in her lineage today.",
      },
      {
        year: "1942–1945",
        title: "WWII pause",
        body:
          "The only break in nine decades that wasn't a pandemic. Charter boats were doing other work.",
      },
      {
        year: "Post-war",
        title: "Renamed Deep Sea Roundup",
        body:
          "Tarpon populations had collapsed by mid-century. The tournament expanded beyond tarpon, the divisions multiplied, and the name changed with the catch list.",
      },
      {
        year: "2020",
        title: "COVID pause",
        body: "Second and only other interruption in 90 years.",
      },
      {
        year: "2026",
        title: "90th annual edition",
        body:
          "Six divisions, the Piggy Perch contest, the same Boatmen Association at the helm. Run continuously every July except for the war and the pandemic.",
      },
    ],
    sources: [
      {
        label: "Deep Sea Roundup — official site",
        url: "https://deepsearoundup.org",
      },
      {
        label: "Deep Sea Roundup — Port Aransas South Jetty edition",
        url: "https://roundup.portasouthjetty.com",
      },
      {
        label: "Port Aransas Boatmen, Inc.",
        url: "https://paboatmen.org/",
      },
      {
        label:
          "Port Aransas CVB — Texas's Oldest Fishing Tournament",
        url: "https://www.portaransas.org/blog/stories/post/deep-sea-roundup/",
      },
      {
        label:
          "PAL Heritage — Texas's Oldest Fishing Tournament (1932 → today)",
        url: "https://theportalocal.com/history/deep-sea-roundup",
      },
      {
        label:
          "Tournament History — Deep Sea Roundup (Boatmen Association origin)",
        url: "https://deepsearoundup.org/tournament-history/",
      },
    ],
  },
};
