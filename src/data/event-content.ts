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
  /** Pointer to the full Heritage piece for this event, if any */
  relatedHistory?: {
    href: string;
    title: string;
    blurb: string;
  };
  /** Per-event photo submission CTA copy (falls back to a sensible default) */
  photoCTA?: {
    headline: string;
    body: string;
    secondaryBody?: string;
    /** Subject line for the mailto: */
    mailSubject: string;
  };
  /** Per-event copy for the day-of liveblog header + empty state */
  liveCoverage?: {
    /** Section heading shown above the liveblog (e.g. "Live from the dock") */
    heading: string;
    /** Empty-state copy shown when liveLog is empty */
    emptyState: string;
  };
  /** Optional merch spotlight — for events where the merch is part of the cultural footprint */
  merchSpotlight?: {
    headline: string;
    body: string[];
    pullQuote?: string;
    storeUrl?: string;
    proceedsTo?: string;
    sightingSubject: string;
  };
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
    photoCTA: {
      headline: "Got a photo from a past festival?",
      body: "We're collecting photos from previous Spring, Fall, and Winter flies — anything from the past few years that captures what this weekend actually looks like. They'll feature in the gallery on this page leading up to May 9.",
      secondaryBody: "Day-of, the same inbox loads photos in real time. Tag your kite, the year, and your name (or stay anonymous).",
      mailSubject: "Kite Festival photo — Fly It Port A's 2026 Spring Kite Festival",
    },
    liveCoverage: {
      heading: "Live from the beach",
      emptyState:
        "This page goes live the morning of the festival. Photos, conditions, kite-of-the-hour highlights, and any schedule updates will land here in real time. If you're on the beach and want a kite featured, email hello@theportalocal.com with a photo.",
    },
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
    relatedHistory: {
      href: "/history/deep-sea-roundup",
      title: "Texas's Oldest Fishing Tournament",
      blurb:
        "The full Heritage piece — from the 1932 Tarpon Rodeo through North Millican, Dorothy Fair, the WWII pause, and the post-war rename. Eight minutes, sourced.",
    },
    photoCTA: {
      headline: "Got a Roundup photo? Send it.",
      body: "Dock weigh-ins, big fish, your kid at the Piggy Perch contest, three generations of your family at the same scale — anything from past Roundups that captures what these four days actually look like. We'll feature them in the gallery leading up to July 9.",
      secondaryBody: "Day-of, the same inbox loads weigh-in photos in real time. Tag the angler, the boat, the year — anonymous is fine too.",
      mailSubject: "Deep Sea Roundup photo — DSR 2026",
    },
    liveCoverage: {
      heading: "Live from the dock",
      emptyState:
        "This page goes live as the first boats hit the scale Friday evening. Real-time leaderboard updates, weigh-in photos, biggest-fish-of-the-hour highlights, and any wind-or-weather changes from the captain's stand will land here through Saturday night. If you're at the pavilion with a phone, send weigh-in shots to hello@theportalocal.com — they go straight into the feed with credit.",
    },
  },

  "texas-legends-billfish-2026": {
    lede:
      "Eight hundred thousand dollars in prize money. The biggest billfish tournament in Port Aransas. One of three legs of the Texas Triple Crown Billfish Series — with Lone Star Shootout in Port O'Connor and the Texas International Fishing Tournament (TIFT) in South Padre Island — that crowns the Grand Champion of the Texas Gulf Coast at the end of August. Boats can depart from any Texas port, but every weigh-in and every video-verified billfish release runs through Fisherman's Wharf in Port Aransas. Dee Wallace, who showed up as an eight-year-old Woody's dock boy in 1963 and was a licensed captain by twenty, runs it as co-tournament director. He also wrote the billfish release verification protocol that most tournaments on this coast now use.",
    whatToExpect: [
      "The Texas Legends format is offshore-only, billfish-focused, and pool-driven. Boats fish for blue marlin (weighed or released), white marlin (release), and sailfish (release) across three full days. Mandatory $1,000 billfish pool plus optional $2K / $4K / $6K billfish pools and matching $2K / $4K / $6K blue marlin pools — anglers stack their own jackpot exposure to whatever level they want.",
      "Wednesday is the registration evening at Fisherman's Wharf — the captain's meeting plus a kickoff reception. Thursday morning is lines-in for the first fishing day. Friday and Saturday are the long days on the water; weigh-ins happen at the wharf each evening as boats return to verify their videos and put any blue marlin on the scale. Sunday is awards.",
      "What you watch from shore: the Wharf in late afternoon as the offshore fleet pulls back into the channel, the live leaderboard ticking over as releases get logged via the official app, and the cleanest billfish-release verification operation on the Texas coast — Wallace's protocol, in motion. Every billfish caught requires video proof, frame-by-frame, before the points hit the board.",
    ],
    schedule: [
      {
        time: "Wed Aug 5 · evening",
        label: "Registration + captain's meeting + kickoff reception",
        body:
          "Fisherman's Wharf headquarters. Boats register, pools are paid, captains review the year's rules with the tournament committee. Public welcome to the reception.",
      },
      {
        time: "Thu Aug 6 · pre-dawn",
        label: "Day 1 — lines in the water",
        body:
          "Boats may depart from any Texas port. Lines-in is set per the official rules — typically before sunrise. Long offshore day in pursuit of billfish.",
      },
      {
        time: "Thu Aug 6 · evening",
        label: "Day 1 weigh-in / video review",
        body:
          "Boats return to Fisherman's Wharf. Any blue marlin weighed; releases verified by video against the Wallace protocol. Leaderboard goes live on the app.",
      },
      {
        time: "Fri Aug 7 + Sat Aug 8",
        label: "Day 2 + Day 3 fishing + weigh-ins",
        body:
          "Same rhythm. Some boats run further offshore each day; others work the same proven grounds. Saturday evening is the most-watched weigh-in — final chance to climb the leaderboard before the cutoff.",
      },
      {
        time: "Sun Aug 9 · 1 PM",
        label: "Awards ceremony at Fisherman's Wharf",
        body:
          "Top boat, top angler, individual species champions, pool payouts, Triple Crown points awarded. Public welcome.",
      },
    ],
    goodToKnow: [
      {
        label: "Watching is free",
        detail:
          "Fisherman's Wharf weigh-ins each evening are open to the public. Saturday evening is peak — most points scored, most boats returning. Bring a chair, walk the dock.",
      },
      {
        label: "How the pools work",
        detail:
          "Mandatory billfish pool ($1,000) is required for all entries. Optional billfish pools at $2K / $4K / $6K and optional blue marlin pools at $2K / $4K / $6K stack on top — anglers pick their exposure level. The bigger pools pay the bigger checks.",
      },
      {
        label: "Triple Crown points carry forward",
        detail:
          "Texas Legends is one of three legs (Lone Star Shootout in Port O'Connor + TIFT in South Padre Island). Cumulative points across all three crown the Grand Champion of the Texas Gulf Coast at the end of the season.",
      },
      {
        label: "Where to watch",
        detail:
          "Fisherman's Wharf, 900 Tarpon St. Plan to be there by 5 PM Saturday for the most action. Roberts Point Park is right next door — easy parking and a short walk to the dock.",
      },
      {
        label: "Tournament app",
        detail:
          "Live leaderboard runs through the Reel Time Apps platform — Texas Legends Billfish app on iOS + Android. Same backbone as TWAT and several other major billfish tournaments.",
      },
      {
        label: "Video verification",
        detail:
          "Every billfish released must be verified by video — that's the Wallace protocol. No video, no points. The protocol is the standard most coastal tournaments now use.",
      },
    ],
    faq: [
      {
        q: "Can I just show up to watch?",
        a: "Yes. Weigh-ins at Fisherman's Wharf are public Wednesday evening through Saturday evening, and the Sunday awards ceremony is open to anyone who shows up. Bring a chair, a hat, and time.",
      },
      {
        q: "Do all boats fish out of Port Aransas?",
        a: "No. Boats may depart from any Texas port. Some run from Port O'Connor, Galveston, or even South Padre. But every catch — weighed or released — has to make it to Fisherman's Wharf in Port A for video verification or the scale. That's where points get scored.",
      },
      {
        q: "What's the Wallace protocol?",
        a: "Dee Wallace, the tournament's co-director, wrote the billfish release verification protocol that most Gulf Coast tournaments now use. Frame-by-frame video review of every billfish release — angler, fish, leader, hook position — before points are awarded. Fish swims away; the points get earned honestly.",
      },
      {
        q: "What's the prize purse?",
        a: "$800,000+ in recent editions, split across mandatory and optional pools. The pools stack — anglers pay into whichever pools they want exposure to, and the payouts grow with participation.",
      },
      {
        q: "How does Triple Crown work?",
        a: "Three Texas tournaments — Lone Star Shootout (Port O'Connor, July), Texas Legends (Port Aransas, early August), and TIFT (South Padre Island, late August) — joined forces in 2020. Cumulative points across all three name the Grand Champion of the Texas Gulf Coast at season's end.",
      },
      {
        q: "How do I register to fish?",
        a: "Through the official site at txlegends.com. Registration typically opens in spring; spots fill on a rolling basis.",
      },
    ],
    hostBlurb: [
      "Dee Wallace got off the boat in Port Aransas at age eight. His family arrived in 1963. By the time he was twenty he had a licensed captain's ticket — having worked his way up from a Woody's dock boy to a deckhand to the helm. He fished offshore for the next several decades and learned every named ledge and unnamed structure between Port A and the deepwater shelf.",
      "In 2002 he came back home — full-time — to do three things: broker boats, direct tournaments, and keep fishing. He's now a board member of the Texas Legends Billfish Tournament and serves as its co-tournament director, with the tournament headquartered at Fisherman's Wharf where he holds the weighmaster role year over year. He's been inducted into the Texas Saltwater Fishing Hall of Fame.",
      "His most consequential contribution might be invisible to anyone who hasn't fished a tournament: he wrote the billfish release verification protocol that's now standard practice across the Texas coast and beyond. Frame-by-frame video review of every billfish release — angler in frame, leader visible, hook position confirmed. He saw what was needed (the fish needed to swim away with the integrity of the release verifiable) and built the rules. Twenty-one years on the Deep Sea Roundup has given him the throughline; Texas Legends is where that work scales.",
      "If you're standing on the wharf at 6 PM during tournament week and you see somebody quietly running the operation while everyone else is excited — that's probably Dee.",
    ],
    liveLog: [],
    hostTimeline: [
      {
        year: "1963",
        title: "Wallace family arrives in Port Aransas",
        body:
          "Dee is eight. Spends the rest of his childhood on the docks, in the channel, learning the island.",
      },
      {
        year: "Teens",
        title: "Woody's dock boy → deckhand",
        body:
          "Worked Woody's Last Stand from kid jobs up. The family-friend connection that runs through Port A's working waterfront.",
      },
      {
        year: "Age 20",
        title: "Licensed captain",
        body:
          "Earned the ticket. Started running offshore charters out of Port Aransas.",
      },
      {
        year: "~Mid-1980s on",
        title: "Deep Sea Roundup volunteer + organizer",
        body:
          "Twenty-one years of contribution. Took catch-release identification from Polaroid shots to video recording — the start of the verification protocol.",
      },
      {
        year: "2002",
        title: "Returns to Port Aransas full-time",
        body:
          "Boat broker, tournament director, weighmaster. Three jobs, one island.",
      },
      {
        year: "Recent",
        title: "Texas Saltwater Fishing Hall of Fame inductee",
        body:
          "Big Game Fishing track. The release-verification protocol is the contribution most-cited in the induction case.",
      },
      {
        year: "Today",
        title: "Co-tournament director, Texas Legends Billfish",
        body:
          "Board member + day-of director at Fisherman's Wharf. Three years running the tournament's tournament-week operations.",
      },
    ],
    relatedHistory: {
      href: "/history/deep-sea-roundup",
      title: "Texas's Oldest Fishing Tournament",
      blurb:
        "The Heritage piece on the 1932 Tarpon Rodeo through today's Deep Sea Roundup. Wallace's twenty-one years inside DSR are part of why the modern release-verification protocol exists at all. Eight minutes, sourced.",
    },
    photoCTA: {
      headline: "Got a Texas Legends photo? Send it.",
      body: "Past tournaments, your boat at Fisherman's Wharf, a billfish video frame, the awards-night crowd, captain spotlights, anything that shows what tournament week actually looks like on the dock. We'll feature them leading up to August 6.",
      secondaryBody: "Day-of, the same inbox loads release videos and weigh-in photos in real time. Tag the boat, the species, the day.",
      mailSubject: "Texas Legends photo — TXL 2026",
    },
    liveCoverage: {
      heading: "Live from the wharf",
      emptyState:
        "This page goes live as the first boats return to Fisherman's Wharf Thursday evening. Real-time leaderboard updates, billfish-release video stills as they're verified, top boat / top angler ticking over, and the Triple Crown points-implications all land here as they happen. If you're on the dock with a phone, send shots to hello@theportalocal.com — they go straight into the feed with credit.",
    },
    sources: [
      {
        label: "Texas Legends Billfish Tournament — official site",
        url: "https://www.txlegends.com/",
      },
      {
        label: "Texas Legends Billfish — official Facebook",
        url: "https://www.facebook.com/txlegends/",
      },
      {
        label: "Reel Time Apps — 2025 leaderboards + rules",
        url: "https://www.reeltimeapps.com/live/tournaments/2025-texas-legends-billfish",
      },
      {
        label: "Fisherman's Wharf — tournament HQ",
        url: "https://www.fishermanswharfporta.com/tournaments/texas-legends-billfish-tournament/",
      },
      {
        label:
          "Dee Wallace — Texas Saltwater Fishing Hall of Fame profile",
        url: "https://txswfhof.com/dee-wallace/",
      },
      {
        label:
          "Port Aransas South Jetty — Wallace HOF coverage",
        url: "https://www.portasouthjetty.com/articles/wallaces-experience-expertise-earn-him-place-in-hall-of-fame/",
      },
      {
        label:
          "Capt. Dee Wallace at Port Aransas Museum (PAPHA) — talk on fishing + sportfishing",
        url: "https://portaransasmuseum.org/capt-dee-wallace-fishing-sportfishing/",
      },
    ],
  },

  "billfish-pachanga-2026": {
    lede:
      "Forty boats fish for three days, but the actual Pachanga is what happens after the lines come out of the water. Virginia's on the Bay shuts down its entire parking lot, brings in a headline band, and throws a real party for the awards ceremony — the kind that pulls Port A out of its houses on a Saturday night in July. \"Pachanga\" is Spanish for party, and the people running this one are locals who treat the name as a promise. The fishing is catch-and-release-only inside a 100-nautical-mile fence; co-founder Gabe Goodman launched it in 2019 from his own restaurant; eight years in, the purse hit $845K and roughly $50K a year goes to Harte Research Institute for Sportfish Science and the Port Aransas Scholarship Fund. The tournament that funds the science of the fish it chases — and the awards night that earns the name on the truck.",
    whatToExpect: [
      "Wednesday is check-in and registration at Virginia's on the Bay — the dockside restaurant that is also the tournament's full-time HQ. Cocktails and appetizers upstairs, captain's meeting on the deck, last pool entries paid. Most of the boats are already at the harbor for sea trials.",
      "Thursday, Friday, and Saturday are the three fishing days. Boats fish the 100-mile fence — no farther than 100 nautical miles from the tip of the south jetty. Lines-in is per the official rules. Every billfish caught is released and verified by video; sailfish, white marlin, and blue marlin all release-only. Each evening boats return to Virginia's where the Sport Fishing Championship live-update coverage rolls in real time.",
      "What's distinct on the water: the field cap. Texas Legends pays a bigger purse but doesn't cap the field. TWAT runs ~70 boats. DSR runs hundreds of fishermen across all divisions. Pachanga is intentionally smaller — meaning fewer boats fishing the same water, more accountable competition, and the tournament team can actually keep their arms around the operation. Most years it sells out.",
      "What's distinct on shore: the awards night earns the name. Virginia's shuts down the entire parking lot Saturday for a full block-party setup — stage, headline band brought in for the night, food, drinks, and the boats' crews mixing with everyone in town who came for the music. It's hosted by locals, not a circuit production company, and it shows: less corporate, more actual party. The check presentations to Harte Research Institute and the Port Aransas Scholarship Fund happen on the same stage between sets.",
    ],
    schedule: [
      {
        time: "Wed afternoon",
        label: "Check-in + registration at Virginia's on the Bay",
        body:
          "5–7 PM under a tent on Virginia's deck, then upstairs for cocktails and appetizers. Captain's meeting closes the night.",
      },
      {
        time: "Thu morning",
        label: "Day 1 — lines in the water",
        body:
          "Boats depart for the 100-mile fishing fence. Lines-in per official rules; release-only for all billfish; video required.",
      },
      {
        time: "Thu evening",
        label: "Day 1 wrap + Sport Fishing Championship live-update",
        body:
          "Boats return to Virginia's. Releases verified, leaderboard updates live on the Sport Fishing Championship platform.",
      },
      {
        time: "Fri + Sat",
        label: "Day 2 + Day 3 fishing + evening updates",
        body:
          "Same rhythm. Saturday is the most-watched evening at Virginia's — final pushes for points, last billfish releases of the tournament.",
      },
      {
        time: "Sat night",
        label: "The actual Pachanga — headline band + awards in the parking lot",
        body:
          "Virginia's shuts down its whole parking lot. A headline band is brought in for the night. Stage goes up, food and drinks flow, the crews mix with the town. Awards announced + check presentations to Harte Research Institute and the Port Aransas Scholarship Fund happen between sets. Open to anyone who shows up — this is the part you tell your friends about.",
      },
    ],
    goodToKnow: [
      {
        label: "Field is capped at 40 boats",
        detail:
          "The only marquee Tournament Season tournament that turns boats away. Entries fill first-come; early registration discount typically through mid-June. If you're thinking about it, you're already late.",
      },
      {
        label: "100-mile fence",
        detail:
          "All fishing must happen within 100 nautical miles of the south jetty's tip. Geographic boundary keeps the field on the same waters and the boats accountable to each other.",
      },
      {
        label: "Catch-and-release only",
        detail:
          "Every billfish — blue marlin, white marlin, sailfish — is released. Video verification required. No fish goes to the scale.",
      },
      {
        label: "Where to watch",
        detail:
          "Virginia's on the Bay, 815 Trout St. Each evening as boats return is the show — live updates on the screens, captains comparing notes, and the cooking is excellent (catch your own and Virginia's prepares it).",
      },
      {
        label: "Saturday night is the actual Pachanga",
        detail:
          "Virginia's shuts down the entire parking lot for the awards night — full stage, headline band brought in, the kind of party that pulls the rest of Port A out of their houses for a Saturday in July. Awards announced + charity check presentations happen between sets. Open to anyone — this is the part most fishing tournaments don't have.",
      },
      {
        label: "Sport Fishing Championship circuit",
        detail:
          "Pachanga is part of the Sport Fishing Championship platform — same live-update infrastructure used by major billfish tournaments across Florida and the Caribbean. Live coverage at sportfishingchampionship.com.",
      },
      {
        label: "Where the money goes",
        detail:
          "Half of the tournament's giving goes to Harte Research Institute for Sportfish Science (Texas A&M University-Corpus Christi). The other half funds the Port Aransas Scholarship Fund. 2023 alone: $25K to Harte + $20K to PA Scholarship.",
      },
    ],
    faq: [
      {
        q: "Can I just show up to watch?",
        a: "Yes. Virginia's on the Bay is a public restaurant — the upstairs deck and bar are open during tournament evenings, and the live updates run on the screens. Get there by 5 PM Friday or Saturday for the best vibe.",
      },
      {
        q: "Why is the field capped at 40?",
        a: "Smaller field = more accountable competition + the team can actually run the operation tightly. Bigger tournaments with 80+ boats (Texas Legends) trade tightness for purse size; Pachanga goes the other way. Both choices work; Pachanga's choice is what makes it Pachanga.",
      },
      {
        q: "What does 'Pachanga' mean?",
        a: "Spanish for 'party.' The tournament has the energy to match — Virginia's deck, music, food, captains rotating in and out as the boats come back. Different tone from the Triple Crown gravity of Texas Legends; closer to TWAT's spectacle without the costumes.",
      },
      {
        q: "Can I fish if I'm not from Texas?",
        a: "Yes. Boats register from across the Gulf Coast and beyond. The 100-mile fence applies regardless of home port, but you have to register early — the cap is real.",
      },
      {
        q: "Where do the donations actually go?",
        a: "Harte Research Institute for Sportfish Science (Texas A&M University-Corpus Christi) — they study the same billfish populations Pachanga catches. And the Port Aransas Scholarship Fund — local kids going to college. Documented donation totals in the milestones panel below.",
      },
      {
        q: "How do I register to fish?",
        a: "Through billfishpachanga.com. Spots fill on a rolling basis once registration opens; early-bird discount usually runs through mid-June.",
      },
    ],
    hostBlurb: [
      "Pachanga is run by locals — not a circuit production company, not a national tournament series, not anyone parachuting in for a week. Virginia's on the Bay co-owner Gabe Goodman launched the inaugural edition July 17–20, 2019, and the team that has built it edition over edition is the same team running the restaurant year-round. That distinction shows up in the operations: tournament week feels like the staff hosting a big party at their own house, because that is functionally what is happening.",
      "Virginia's itself has been a Port A waterfront fixture since 1996 — two-story open-air deck, harbor views, lighthouse and channel in the frame, and the bring-your-own-catch tradition that built its reputation. For three days a year, the deck becomes tournament HQ; for one Saturday night a year, the parking lot becomes a concert venue.",
      "The two-beneficiary structure (Harte Research Institute for Sportfish Science + Port Aransas Scholarship Fund) is unusual on this coast — most tournaments pick one cause and stay there. Goodman's argument: the science protects the fishery; the scholarship protects the next generation of locals. Both are obligations the tournament owes to the place it runs in.",
    ],
    liveLog: [],
    hostTimeline: [
      {
        year: "1996",
        title: "Virginia's on the Bay opens",
        body:
          "The two-story waterfront restaurant at 815 Trout St becomes a Port A fixture. Bring-your-catch is a cornerstone of the menu from the start.",
      },
      {
        year: "2019 (Jul 17–20)",
        title: "Inaugural Billfish Pachanga",
        body:
          "Gabe Goodman launches the tournament out of Virginia's deck. Field capped at 40 boats, catch-and-release-only format, 100-mile fence — all from the start.",
      },
      {
        year: "2023",
        title: "$45K split to two beneficiaries",
        body:
          "$25,000 to Harte Research Institute for Sportfish Science. $20,000 to the Port Aransas Scholarship Fund. The two-charity model proves out at scale.",
      },
      {
        year: "2024 (Jul 17–20)",
        title: "Record $845K payout · Sigsbee Deep wins",
        body:
          "Anglers caught and released 187 billfish across 3 days (9 BM, 8 WM, 170 sailfish). Sigsbee Deep wins overall with 14 sailfish + 1 BM + 1 tuna + 1 dorado. Vamonos 2nd at 1,641 pts.",
      },
      {
        year: "2026 (8th annual)",
        title: "Mid-July (TBD on official site)",
        body:
          "Eighth edition. Same format. Same restaurant. Same 40-boat cap. Same two beneficiaries.",
      },
    ],
    relatedHistory: undefined,
    photoCTA: {
      headline: "Got a Pachanga photo? Send it.",
      body: "Virginia's deck during tournament week, your boat coming back at sunset, a billfish video frame, the awards-night check-presentation — anything from past Pachangas. We'll feature them leading up to July.",
      secondaryBody: "Day-of, the same inbox loads release videos and dock-return shots in real time. Tag the boat, the species, the day.",
      mailSubject: "Pachanga photo — Billfish Pachanga 2026",
    },
    liveCoverage: {
      heading: "Live from Virginia's",
      emptyState:
        "This page goes live as the first boats return to Virginia's Thursday evening. Real-time leaderboard updates, billfish-release video stills as they're verified through the Sport Fishing Championship platform, and the deck-side energy at the restaurant all land here as they happen. If you're at Virginia's with a phone, send shots to hello@theportalocal.com — they go straight into the feed with credit.",
    },
    sources: [
      {
        label: "The Billfish Pachanga — official site",
        url: "https://www.billfishpachanga.com/",
      },
      {
        label: "Sport Fishing Championship — Pachanga 2025",
        url: "https://sportfishingchampionship.com/events/billfish-pachanga-2025",
      },
      {
        label: "Sport Fishing Championship — live updates feed",
        url: "https://sportfishingchampionship.com/news/pachanga25-liveupdates",
      },
      {
        label: "Virginia's on the Bay (host restaurant)",
        url: "https://virginiasonthebay.com",
      },
      {
        label: "Harte Research Institute for Sportfish Science",
        url: "https://www.tamucc.edu/harte-research-institute/",
      },
      {
        label:
          "Port Aransas South Jetty — 'Sigsbee Deep is Pachanga champ' (2024 coverage)",
        url: "https://www.portasouthjetty.com/articles/sigsbee-deep-is-pachanga-champ/",
      },
      {
        label: "Port Aransas South Jetty — Pachanga set July 17–20 (founding-era coverage)",
        url: "https://www.portasouthjetty.com/articles/billfish-pachanga-set-july-17-20/",
      },
    ],
  },

  "texas-women-anglers-tournament-2026": {
    lede:
      "Dozens of boats. Hundreds of women. One shelter. Pete Fox started the Texas Women Anglers Tournament in 1984 with the same idea his family still runs it on today — women fishing for women, with every dollar that doesn't go to the winners going to The Purple Door, the Coastal Bend's shelter for survivors of domestic violence and sexual assault. Forty-plus years and $130,000 later, the fishing is still real and the community is still the point. The Saturday weigh-in at Fisherman's Wharf — themed boats parading in (Candy Land, Wizard of Oz, Mardi Gras), full costumes, money sprayers, smoke machines, multi-million-dollar yachts turned into parade floats, beads thrown to the crowd, the kind of cheering you'd expect at actual Mardi Gras — pulls a bigger audience than several mega-money tournaments on this coast. The shirts are everywhere for a reason.",
    whatToExpect: [
      "Friday evening is the warm-up: registration, dinner, a concert, and the cash-pot announcements at the downtown reception venue (we'll list the spot once it's publicly announced). Boats depart at 8 PM. The room fills with women who've been coming for years, women fishing their first tournament, daughters who've graduated from the dock to the deck, and the families that built this thing in the 1980s.",
      "Saturday morning is the long day on the water. Lines in at 6:30 AM. Boats fish offshore for billfish (blue marlin, white marlin, sailfish — release only) and bring back dolphin, tuna, and wahoo for the scale. The overall trophy is points from billfish plus 1 point per pound across the other three. Out-of-town anglers are gone before most spectators are awake.",
      "Here's what you don't see at every other tournament: the boats leave the docks at sunrise looking like the tournament boats they are. Towers up, outriggers stowed, crew in shorts and team shirts, electronics fired up. All business. The transformation happens on the run home. By the time they blast through the little jetties before the 7:30 PM cutoff, the props are deployed, crews are in full costume, smoke machines are armed. Then the harbor fills with decorated boats — circling, idling, finishing the decor, getting their timing right — sometimes for an hour before they back into the dock. That harbor-circle window is the spectacle before the spectacle. Boats from the Aransas Pass channel out to Roberts Point Park, all themed up, all waiting their turn. Worth getting to the wharf by 6 to see it.",
      "When the boats finally back into Fisherman's Wharf, what arrives doesn't really resemble a fishing tournament weigh-in. Crews fully themed — Candy Land, Wizard of Oz, Mariachi, Disney, Mardi Gras, whatever the team committed to in March. Money sprayers. Smoke machines. Beads tossed to the crowd onshore. Balloons and beach balls flying between boats and the dock. Mariachi bands and brass sections appearing out of nowhere on the foredecks. Singers up on the captain's bridge. The crowd cheers like it's actual Mardi Gras. And all of it is happening on multi-million-dollar offshore sportfishers — the same boats that pulled out of the harbor at sunrise as tournament rigs, no decor, all business. Awards go to best-decorated boat, most-original theme, and best costumes, separate from the catches. This is the part that makes the crowd here bigger than at several Triple-Crown-circuit tournaments.",
      "Sunday is the awards ceremony, a check presentation to The Purple Door, and the moment you remember why this tournament exists. The 2025 edition handed out $403,809 in prizes across 14 money winners — and an undisclosed-but-substantial figure to the shelter. Both numbers are the point.",
    ],
    schedule: [
      {
        time: "Fri Aug 21 · 4 PM",
        label: "Registration + dinner + concert (downtown reception)",
        body:
          "Doors open at the downtown reception venue (location announced closer to the event). Anglers check in, pay cash-pot entries, the room fills up. Public welcome to the dinner and concert.",
      },
      {
        time: "Fri Aug 21 · 8 PM",
        label: "Boats depart",
        body:
          "Tournament boats leave the harbor for their staging anchorages. No fishing yet — official lines-in is Saturday morning.",
      },
      {
        time: "Sat Aug 22 · 6:30 AM",
        label: "Lines in the water",
        body:
          "Official tournament start. Bay and offshore divisions fish until the weigh-in deadline. Long day. Friendly competition.",
      },
      {
        time: "Sat Aug 22 · 5 PM",
        label: "Scale opens at Fisherman's Wharf",
        body:
          "Public, free to watch. First boats start trickling in. Bay-division boats often arrive first — shorter run home from the inshore grounds.",
      },
      {
        time: "Sat Aug 22 · ~6 PM – 7:30 PM",
        label: "Harbor circle (the spectacle before the spectacle)",
        body:
          "Boats blast through the little jetties before the 7:30 PM cutoff, having transformed during the run home — props out, crews in costume, smoke machines armed. Then they circle and idle in the harbor finishing decor and waiting their turn at the dock. Best viewing window for the spectacle before the docking parade. Get to the wharf by 6.",
      },
      {
        time: "Sat Aug 22 · 7:30 PM hard cutoff",
        label: "All boats inside the little jetties",
        body:
          "No boat that hasn't crossed the jetties by 7:30 PM is eligible to weigh in. Hard line. Then the themed parade docking begins — boats back into Fisherman's Wharf one by one.",
      },
      {
        time: "Sat Aug 22 · evening",
        label: "Cash pot reveals + costume/decor awards",
        body:
          "After the scale closes, the cash-pot winners get called along with awards for best-decorated boat, most-original theme, and best costumes — separate categories from the catches. Then the post-weigh-in social rolls into the night.",
      },
      {
        time: "Sun Aug 23 · morning",
        label: "Awards ceremony + shelter check presentation",
        body:
          "Division winners, top boat, top angler. Then the moment that makes this tournament what it is — the check handover to The Purple Door, with someone from the shelter on stage.",
      },
    ],
    goodToKnow: [
      {
        label: "Watching is free",
        detail:
          "Friday's downtown reception and Saturday's Fisherman's Wharf weigh-in are open to the public. Bring a chair, a hat, and cash for the bar.",
      },
      {
        label: "Awards beyond the fish",
        detail:
          "Best-decorated boat, most-original theme, and best costumes are real award categories. Anglers commit. Past themes include Candy Land, Wizard of Oz, Mariachi, Mardi Gras, and full Disney production numbers.",
      },
      {
        label: "Women only on the boats",
        detail:
          "All anglers must be women. Captains can be any gender — many are dads, husbands, brothers running the boat for a daughter / wife / sister. Don't underestimate the number of mom-daughter teams that win money.",
      },
      {
        label: "Especially for daughters",
        detail:
          "Bring the kids — Saturday's weigh-in is the loudest, most fun part of the weekend if you have small humans, beads-catching gear recommended. But the bigger thing: Texas girls who spend a weekend at TWAT grow up knowing that women run multi-million-dollar offshore boats, fight billfish, work the scale, and headline the whole spectacle. The next-generation pipeline is the quiet engine of this whole tournament.",
      },
      {
        label: "Best viewing window",
        detail:
          "Get to Fisherman's Wharf by 6 PM Saturday. The harbor-circle hour (decorated boats blasting in through the jetties, then circling and idling while they finish their costumes) is its own show before the docking parade kicks off after the 7:30 PM cutoff.",
      },
      {
        label: "Where to park",
        detail:
          "Fisherman's Wharf weigh-in lot fills fast Saturday around 4:30 PM — get there earlier or walk from downtown. Friday reception parking will be listed once the venue is publicly announced.",
      },
      {
        label: "Tournament app",
        detail:
          "Live leaderboards run through the Reel Time Apps platform — Texas Women Angler Tournament app on iOS + Android. Download before Saturday.",
      },
      {
        label: "Date is tentative",
        detail:
          "We've slotted Aug 21–23 based on the 2025 pattern (4th weekend of August). Will update as soon as the official site posts confirmed 2026 dates.",
      },
    ],
    faq: [
      {
        q: "Can men fish?",
        a: "No. Anglers are women only. Men can captain, crew, mate, or watch from the dock — many do.",
      },
      {
        q: "How much goes to the shelter?",
        a: "The tournament is family-run and the shelter check is presented at the Sunday awards. Past totals have been substantial but the exact figure varies year to year. The 2025 prize purse alone was over $403K — the engine that funds the giving.",
      },
      {
        q: "What's The Purple Door?",
        a: "The Coastal Bend's shelter and crisis intervention organization for survivors of domestic violence and sexual assault. Formerly called the Women's Shelter of South Texas. Based in Corpus Christi. All services confidential and free.",
      },
      {
        q: "I'm not a fishing person — should I still come?",
        a: "Yes — and especially for Saturday's weigh-in. Themed boats, costumes, beads thrown from the deck, money sprayers, beach balls bouncing across the crowd. People come for the spectacle and stay for the cause. The Friday-evening reception is also open to the public — music, food, a real community on the floor.",
      },
      {
        q: "How do I register to fish?",
        a: "Through the official site at texaswomenanglers.org. Registration usually opens in late spring / early summer.",
      },
      {
        q: "Can I donate to The Purple Door directly?",
        a: "Yes — purpledoortx.org. The tournament's check is one source; ongoing donations matter equally.",
      },
    ],
    hostBlurb: [
      "Pete Fox formed the Texas Women Anglers Tournament in 1984. He'd grown up fishing and surfing in Port Aransas after his family moved to Corpus Christi from Ohio in 1958, built Marine Surveyors Inc. and Fox Yacht Sales (the family yacht dealership at 203 W Cotter Ave, exclusive Texas Hatteras dealer since 1989), and was instrumental in starting nearly every modern Port A sportfishing tournament that still runs today — Texas Women Anglers, Dean Hawn Billfish, Texas Legends Billfish, the Masters. Inducted into the Texas Saltwater Fishing Hall of Fame in 2021.",
      "When Pete Fox started this one in 1984, women-only fishing tournaments weren't really a category — they were an exception. Forty-plus years on, with women-only tournaments multiplying up and down the Gulf and across the country, TWAT is the matriarch of the category. The original. The longest-running. The one that proved the model could work at scale, on offshore boats, with real money and a real cause attached.",
      "The Fox family still runs TWAT today. Chris Fox lives on the island and operates Fox Yacht Sales — it's the family's primary local presence, and the most direct way to connect with the tournament organizers in person. The format hasn't changed since 1984: women fishing for women, prize purse and charity check growing in lockstep.",
      "Collie Caraker (PAL co-founder) is dear friends with the Fox family. We're covering this tournament because we want it covered better than anyone else — and because the cause behind the prize purse is one we'd cover even if there were no fish involved.",
    ],
    liveLog: [],
    hostTimeline: [
      {
        year: "1958",
        title: "Pete Fox arrives on the Texas coast",
        body:
          "The Fox family moves from Sandusky, Ohio to Corpus Christi. Pete spends his adolescent summers fishing and surfing in Port Aransas — the foundation for everything that follows.",
      },
      {
        year: "1984",
        title: "Pete Fox forms the Texas Women Anglers Tournament",
        body:
          "Built the same idea the Fox family runs it on today: women fishing for women, with proceeds-after-prizes going to the Women's Shelter of South Texas (now The Purple Door).",
      },
      {
        year: "1989",
        title: "Eighteen boats. Fifty-plus women.",
        body:
          "Documented early-edition scale. The format proves out and the tournament becomes a fixture of August.",
      },
      {
        year: "Through the 2010s",
        title: "Steady growth into one of Port A's signature summer events",
        body:
          "Boat count and angler count compound year over year. The Fox family keeps the format intact: small enough to feel like family, big enough to write a substantial check at the end.",
      },
      {
        year: "Recent",
        title: "Women's Shelter of South Texas rebrands as The Purple Door",
        body:
          "Same mission, new name. Tournament beneficiary continues unchanged.",
      },
      {
        year: "2021",
        title: "Pete Fox inducted into the Texas Saltwater Fishing Hall of Fame",
        body:
          "Big Game Fishing Inductee, recognized for founding TWAT and being instrumental in starting many of the Port Aransas tournaments that make this an offshore destination.",
      },
      {
        year: "2025",
        title: "$403,809 in prize money across 14 money winners",
        body:
          "Modern scale. Sea Senora wins overall ($128,527). Jordan Soechting takes top angler. The shelter check is the loudest cheer of the night.",
      },
      {
        year: "2026 cumulative",
        title: "Over $130,000 contributed to The Purple Door",
        body:
          "Forty-plus years of writing checks to the same cause. The number compounds each August.",
      },
    ],
    relatedHistory: undefined,
    photoCTA: {
      headline: "Got a Texas Women Anglers photo? We want it.",
      body: "Past tournaments, your team's themed boat in the parade, your kid on the dock, costumes, the check presentation to The Purple Door — anything from past years that shows what this weekend actually feels like. We'll feature them in the gallery leading up to August.",
      secondaryBody: "Day-of, the same inbox loads weigh-in photos in real time. Tag the team, the boat, the year — anonymous is fine.",
      mailSubject: "TWAT photo — Texas Women Anglers Tournament 2026",
    },
    liveCoverage: {
      heading: "Live from the wharf",
      emptyState:
        "This page goes live as the first themed boat parades into Fisherman's Wharf Saturday evening. Real-time leaderboard updates, weigh-in photos, costume + boat-decor highlights, and the check presentation to The Purple Door all land here as they happen. If you're at the wharf with a phone, send shots to hello@theportalocal.com — they go straight into the feed with credit.",
    },
    merchSpotlight: {
      headline: "No online store. The merch tent is the merch.",
      body: [
        "TWAT shirts have shown up at high school football games in Houston, on the docks in the Florida Keys, and in family photos from three different states. The reason they're a flex isn't a marketing budget — it's that there's no online store. You either know somebody who got one, or you were at the tournament. That's the whole supply chain.",
        "Day one of the tournament weekend, the merch tent draws a crowd before the first cast hits the water. It's the same energy as Masters week or a sold-out tour stop: this gear exists for these three days, on this stretch of dock, and after Sunday it's done. Every shirt sold is another beat for The Purple Door.",
      ],
      pullQuote:
        "Wearing one is like saying 'I was at the Masters' — except when somebody asks where you got it, the answer opens a much better conversation.",
      proceedsTo: "The Purple Door (Coastal Bend shelter)",
      sightingSubject: "TWAT shirt sighting",
    },
    sources: [
      {
        label: "Texas Women Anglers Tournament — official site",
        url: "https://texaswomenanglers.org/",
      },
      {
        label: "TWAT — official Facebook",
        url: "https://www.facebook.com/texaswomenanglerstournament/",
      },
      {
        label: "TWAT — official Instagram",
        url: "https://www.instagram.com/texas_women_anglers_tournament/",
      },
      {
        label: "Reel Time Apps — 2025 leaderboards + payouts",
        url: "https://www.reeltimeapps.com/live/tournaments/2025-texas-women-angler-tournament/leaderboards",
      },
      {
        label: "The Purple Door — beneficiary",
        url: "https://purpledoortx.org/",
      },
      {
        label: "Port Aransas CVB — Texas Women Anglers Tournament",
        url: "https://www.portaransas.org/blog/stories/post/texas-women-anglers-tournament/",
      },
    ],
  },
};
