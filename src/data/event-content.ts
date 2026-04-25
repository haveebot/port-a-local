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
      headline: "Got a TWAT photo? We want it.",
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
