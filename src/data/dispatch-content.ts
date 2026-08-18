/**
 * Dispatch content — current-events editorial, analysis, and investigation.
 * Each dispatch is keyed by slug and renders through /dispatch/[slug].
 */

export interface DispatchSection {
  /** Optional section heading */
  heading?: string;
  /** Body paragraphs (rendered as <p>) */
  body: string[];
  /** Optional pull quote */
  pullQuote?: { text: string; attribution?: string };
  /** Optional stat callout — rendered as a boxed fact list */
  callout?: { label: string; items: { label: string; value: string }[] };
  /**
   * Optional data table — for record-level detail the prose can't carry.
   * Scrolls horizontally on phones; `note` prints under it as a source or
   * qualifier line.
   */
  table?: {
    caption?: string;
    columns: string[];
    rows: string[][];
    note?: string;
  };
  /**
   * Optional figure — a chart or map built from the piece's own records.
   * Rendered full-bleed within the column, horizontally scrollable on narrow
   * screens so wide charts stay legible.
   */
  figure?: {
    /** Phone-first image (tall). Also the fallback for browsers without <picture>. */
    src: string;
    /** Optional wide/landscape version, used from the md breakpoint up. */
    srcWide?: string;
    alt: string;
    caption?: string;
    minWidth?: number;
  };
}

export interface DispatchContent {
  /** Opening paragraph — set larger on the page, no heading */
  lede: string;
  /** Structured body sections */
  sections: DispatchSection[];
  /** Source list — shown in a collapsible footer */
  sources: { label: string; url?: string }[];
}

export const dispatchContent: Record<string, DispatchContent> = {
  "highway-361-fatal-crashes": {
    lede:
      "On Monday evening, a southbound driver crossed the centerline of State Highway 361 at Beach Access Road 2 and hit an oncoming vehicle head-on. The driver of that vehicle, a 59-year-old man, died at the scene. The highway was closed for more than four hours. Investigators said they did not suspect alcohol. On Friday afternoon, four miles north, a southbound car was rear-ended, shoved into the northbound lane, and hit head-on by an oncoming vehicle; a fourth car struck the wreck. A 55-year-old man and a 46-year-old woman were killed. Investigators said alcohol was not a factor there either.",

    sections: [
      {
        heading: "What the record shows",
        body: [
          "Three people died on the island road in five days. That is the news. What follows is the record underneath it.",
          "Port A Local pulled the crash file for State Highway 361 from the Texas Department of Transportation's Crash Records Information System — every reportable crash in Nueces County on that highway from 2016 through August 15, 2026, with coordinates, severity, contributing factors and the roadway's own design attributes attached. Filtered to TxDOT's project corridor, Beach Access Road 1 in Port Aransas south to Park Road 22: 421 crashes, 12 fatal crashes, 14 deaths, 18 crashes with a suspected serious injury, 278 people injured. This week's two crashes have not been processed into the state file yet. With them, the corridor's toll since 2016 is 14 fatal crashes and 17 deaths.",
          "Read those crashes by location and the road stops looking uniform.",
        ],
        callout: {
          label: "SH 361 · Beach Access Road 1 to Park Road 22 · 2016 – Aug 15, 2026",
          items: [
            { label: "Crashes", value: "421" },
            { label: "Fatal crashes", value: "14" },
            { label: "People killed", value: "17" },
            { label: "Serious-injury crashes", value: "18" },
            { label: "Fatal crashes in the funded stretch", value: "0" },
            { label: "Signals on the 15 miles", value: "2" },
          ],
        },
      },
      {
        heading: "Fender-benders at the ends. Funerals in the middle.",
        body: [
          "The busiest crash locations on the corridor are its two ends. The southern end — from Access Road 3 past Newport Pass and Zahn Road to the signal at Park Road 22 — recorded 212 crashes in ten and a half years, more than any comparable stretch of the highway. Seven of them involved a serious injury. None of them killed anybody.",
          "Every fatal crash on the corridor since 2016 happened north of Access Road 3.",
          "They are spread across the middle: near Cinnamon Shore, near Gulf Waters, at La Concha Boulevard, at Sea Way Drive, near the Mayan Princess, at Beach Access Road 2, near the state park. All fourteen fall between mile 21.5 and mile 31 on TxDOT's own mile posts — the segment where the highway is two lanes, undivided, no median, posted at 60.",
          "The ends have signals, turn bays and, at the Port Aransas end, a curbed median. The middle has a painted stripe.",
        ],
        figure: {
          src: "/images/sh361-crash-map.png",
          srcWide: "/images/sh361-crash-map-desktop.png",
          alt: "Vertical map of State Highway 361 from Port Aransas down to Park Road 22. Bars show crashes per half-mile; red diamonds mark every fatal crash. The fatal crashes fall in the shaded middle section, which has no median, while the heaviest crash volume is at the two ends. A right-hand column marks every development entrance meeting the highway.",
          caption:
            "Every reportable crash on SH 361 between Beach Access Road 1 and Park Road 22, 2016 – August 2026, placed on TxDOT's mile posts (source: TxDOT CRIS). Bars are crashes per half-mile; solid diamonds are fatal crashes; hollow diamonds are this week's two, which are not yet in the state file. The shaded band is the undivided, 60-mph section. Arrows on the right are development entrances and subdivision streets meeting the highway.",
          minWidth: 620,
        },
      },
      {
        heading: "Fewer crashes than a normal highway. Nearly twice the deaths.",
        body: [
          "Raw counts flatter a quiet road and damn a busy one, so we converted them. Using TxDOT's own traffic counters at each end of the island — average daily traffic running between roughly 5,800 and 12,100 vehicles depending on the segment and the year — the corridor carried about 504 million vehicle-miles between 2016 and 2025.",
          "Against that exposure, SH 361 recorded 76.6 crashes per hundred million vehicle-miles. The statewide rate for a rural two-lane, two-way road in 2024 was 100.5. For a rural state highway, 94.0. By the ordinary measure of how dangerous a road is, the island road is safer than the Texas average.",
          "Its death rate is 2.58 per hundred million vehicle-miles. The Texas rate across the same decade was 1.38. Nationally, rural roads run about 1.68.",
          "The middle seven miles are sharper still: about half the crash rate of a normal Texas two-lane, and 3.49 deaths per hundred million vehicle-miles — two and a half times the state.",
          "Put plainly: fewer people crash here than you would expect, and more of them die. On this road, 1 crash in 30 kills someone. Statewide the figure is about 1 in 140; on rural Texas roads, about 1 in 80. That ratio is not a story about how often drivers make mistakes. It is a story about what happens to an ordinary mistake once it is made.",
        ],
      },
      {
        heading: "What kills people here",
        body: [
          "Head-on collisions are under 6 percent of the crashes on this corridor and more than 40 percent of its deaths. Statewide, head-on crashes account for about 15 percent of traffic deaths. And that count is from before this week: both of this week's fatal crashes were vehicles that ended up in the oncoming lane — one by drifting, one by being pushed there from behind.",
          "A third of all crashes on the corridor were logged as intersection, intersection-related or driveway-access crashes. Turning conflicts run through the contributing-factor field: failure to yield turning left, turning when unsafe, failure to yield at a stop sign, failure to yield from a private drive. In its own analysis presented at the 2024 public meeting, TxDOT ranked the corridor's top five contributing factors as failure to control speed, failure to yield turning left, failure to drive in a single lane, failure to yield at a stop sign, and driving under the influence. Two of the agency's own top five are access conflicts.",
          "There is no mystery about the remedy, because TxDOT has already named it. Its proposal for this corridor is to widen to four lanes with raised center medians and left-turn lanes as needed. Its public information officer for the Corpus Christi district, Rickey Dailey, put the mechanism in one sentence.",
        ],
        pullQuote: {
          text: "The raised median tends to cut down on head-on crashes.",
          attribution:
            "Rickey Dailey, TxDOT Corpus Christi public information officer · KRIS 6 · September 2024",
        },
      },
      {
        heading: "The corridor already ran the experiment",
        body: [
          "This is not a theory anyone has to take on faith, because the same highway has already been treated at one end and left alone at the other.",
          "In March 2011, TxDOT held a citizens' meeting at Port Aransas City Hall on a proposal for the town section: one additional travel lane in each direction and, in the agency's words, \"a raised median along the 2.8 mile project length creating a boulevard-type roadway,\" with left-turn bays where warranted. The stated purpose was to improve safety and reduce congestion, and the stated reason was growth: \"As growth on North Padre Island and Mustang Island accelerates and traffic increases, congestion and safety are growing concerns.\"",
          "That was 2011. The town boulevard was registered for construction in February 2016 at an estimated $5.8 million and completed in May 2017.",
          "The result is visible in the crash file. The curbed-median section at the south edge of Port Aransas has the highest crash rate on the whole island — it is an urban stretch with signals, driveways and stop-and-go summer traffic — and for ten straight years, from 2016 through 2025, it did not kill anyone. Its first fatal crash in the file is from March 2026, a rear-end collision in a 45-mph zone during Spring Break.",
          "High crash rate, near-zero death rate. That is what a median does. Fifteen miles of the same highway south of it did not get one.",
        ],
      },
      {
        heading: "A road built as a way through, used as a way in",
        body: [
          "SH 361 down Mustang Island was built as a conduit: a beginning and an end, with a state park and open dune in between. It carries no port traffic, no distribution traffic, no industrial traffic. Nearly everyone on it is going to or from the beach, a rental, or a house.",
          "It now has roughly 78 driveways, subdivision streets and public access roads meeting it between Beach Access Road 1A and Zahn Road — 52 on the beach side, 26 on the bay side — according to a count of the road's mapped connections. About a third of them have been added since 2005. Six to eight have been added since 2020.",
          "The densest cluster of new entrances — Royal Sands, Mustang Royale, Beachwalk, the six Cinnamon Shore North connections, Cinnamon Shore South's four streets, Sunrise Beach, Spoonbill Bay, Gulf Waters, the new Beach Access Road 1-B — sits on the northern half of the fatal cluster. The southern half of the fatal cluster is the older turning node around La Concha Boulevard, Sea Way Drive, the Mayan Princess and Beach Access Road 2, where five fatal crashes have happened since 2019 — four of them in the last four years, two of them this week.",
          "More is coming, and the developers have said so in writing. In comments filed to TxDOT during the 2024 public meeting, a development team wrote: \"Our Development team represents approximately 1,000 acres on Mustang Island, which represents over 3 miles of HWY 361 Frontage. We can share land plans and development intent to help plan locations of culverts, traffic lights, decel lanes, and other turns and intersections.\" A resort project asked for a traffic light at its entrance for a 135-lot RV park, a four-story hotel, a gas station and 35 residential lots. Sea Oats Group's 2017 announcement of its $1.3 billion Phase II described a community that \"will lie on both sides of State Highway 361 … with a golf cart bridge enabling residents to easily access amenities on both sides of the highway.\"",
          "Other people who use the road filed comments in the same record.",
        ],
        pullQuote: {
          text:
            "The increased congestion near all the new development around Cinnamon Shores is where I see the most \"near misses,\" whether it is folks pulling into or out of various driveways.",
          attribution:
            "Public comment to TxDOT · SH 361 Mustang Island Project · September 2024",
        },
      },
      {
        heading: "The stoplight that was planned",
        body: [
          "The clearest illustration of how access gets added to this highway is the city's own newest road.",
          "On March 21, 2024, the Port Aransas City Council voted unanimously to vacate a 40-foot city easement running to the beach along the south side of Cinnamon Shore North, and to accept in its place a 60-foot easement 165 feet farther south, dedicated to the city by Sea Oats Group, the subdivision's developer. The resolution states the exchange is beneficial because \"the alternative location is preferable, can be effected now rather than waiting for the future platting of the adjacent land.\" The city had negotiated with the developer for about a year and a half; the 165-foot shift was the developer's idea.",
          "Reporting the vote, the Port Aransas South Jetty described the design at the highway: a two-lane road widening to three lanes where it meets SH 361, with a center left-turn lane, a right-turn lane and an entering lane, and — in the paper's words — \"A stoplight also is planned for the intersection of the road and the highway.\" Sea Oats Group's chief executive, Jeff Lamkin, said the road would \"provide access from the bay properties on that whole side of the island to get safely across 361 at a stoplight.\" The company has plans for a subdivision with a marina on the bay side.",
          "The road was bid in April 2025. Its 217-page construction specification lists, at the SH 361 intersection, one R1-1 stop sign and one stop bar. It contains no traffic signal, no signal foundation, no illumination, and no signal item of any kind. In August 2025 the Council approved a $162,771 change order for a northbound turn lane on SH 361 that TxDOT required — and, in the minutes of the same meeting, \"briefly discussed a potential traffic signal installation for Access Road B,\" with the city manager to verify with TxDOT whether the city would bear cost-sharing obligations.",
          "Beach Access Road 1-B opened on March 2, 2026, at a cost of about $1.3 million. For Spring Break, the police department set up portable, officer-operated traffic lights at Access Road 1 and at the new road — signals a patrol officer switches by hand. In April, Council discussed permanent signals and deferred: the record has the mayor emphasizing \"the importance of gathering additional traffic data before considering permanent signal installations, particularly after full implementation and usage of Beach Access Road 1B during the upcoming summer season.\"",
          "There is a reason the stoplight is not simply a city decision. SH 361 is a state highway, and signals on it are TxDOT's call, granted on a warrant study. When a developer asked TxDOT for one in 2024, the agency's written answer was to follow its Access Management Manual, request driveway access, and work with the area office to determine whether a traffic engineering study or a traffic impact analysis is needed \"to determine if a signal is warranted based on future volumes.\"",
          "No signal has been warranted anywhere on the fifteen miles. There are two on the corridor: one at each end.",
        ],
      },
      {
        heading: "Where the money is",
        body: [
          "TxDOT's SH 361 Mustang Island Project — four lanes, raised center medians, turn lanes, a shared-use path, from Access Road 1 to Park Road 22 — held its first public meeting in September 2024. The fact sheet gives a construction start of 2030, with an asterisk: \"Project advancement is contingent upon results of environmental process and funding availability.\" A second public meeting was slated for summer 2025. TxDOT's hearings pages list none.",
          "The agency's own public project tracker, checked this week, shows what has actually been programmed. It is not one fifteen-mile project. It is two pieces at the two ends, and a gap.",
          "The southern piece — Access Road 3 to Park Road 22, 2.5 miles, about $60 million — is in the state's Unified Transportation Program, inside the Corpus Christi metropolitan planning boundary, with an estimated letting date of August 2032. The northern piece — Access Road 1 to Mariners Drive, 3.6 miles, about $54 million — is listed as planning, ten-plus years out, with an estimated letting of October 2036, and is not in the UTP. Between Mariners Drive and Access Road 3 — roughly eight miles — there is no widening project at all.",
          "That unprogrammed middle contains nine of the corridor's fourteen fatal crashes and twelve of its seventeen deaths.",
          "The funded-first piece contains none. In ten and a half years, the stretch TxDOT has programmed soonest recorded 212 crashes and zero deaths.",
          "The corridor is also split administratively. About half of it lies inside the Corpus Christi Metropolitan Planning Organization's boundary and half outside; Port Aransas is not an MPO member. In December 2024, TxDOT's district representative asked the MPO's policy committee whether SH 361 could be added to that year's UTP list so evaluation could begin. The technical committee did not recommend it, no member proposed removing another project to make room, and the list was approved without it. In March 2025 the same TxDOT representative told the committee flatly that SH 361 \"is not currently funded and has no construction dollars.\" In February 2026, discussing whether Port Aransas should join, the committee's minutes record that \"none of those improvements have been prioritized by the MPO at this time.\"",
          "There is one funded, near-term item on the whole corridor: a $10.5 million safety-improvement project, Access Road 1 to Park Road 22, estimated to let in July 2027. Its scope is not a median.",
        ],
        callout: {
          label: "What TxDOT has programmed · agency project tracker, August 2026",
          items: [
            {
              label: "Access Rd 3 → PR 22 · 2.5 mi · in the state program",
              value: "$60M · let 2032 · 0 deaths since 2016",
            },
            {
              label: "Access Rd 1 → Mariners Dr · 3.6 mi · not in the program",
              value: "$54M · let 2036 · 5 deaths since 2016",
            },
            {
              label: "Mariners Dr → Access Rd 3 · ~8 mi",
              value: "no widening project · 12 deaths since 2016",
            },
            {
              label: "Safety improvements, Access Rd 1 → PR 22 (not a median)",
              value: "$10.5M · let 2027",
            },
          ],
        },
      },
      {
        heading: "What gets engineered instead",
        body: [
          "It would be unfair to say the city has done nothing about traffic. It would also be inaccurate to say it has pressed the state hard on the artery. Both statements can be checked, because both live in the same public record.",
          "Since 2018, the Council's formal actions touching SH 361 are these: a January 2023 resolution asking TxDOT to study the turn-lane alignment in town near the Whataburger and CVS entrances, because \"confusion with designated turn lanes creates increased risk for a head-on accident\"; a February 2023 resolution supporting a second causeway to the island; a line in the 2023 and 2024 legislative priorities reading \"TxDOT – Support for St. Hwy 361 and ferry improvements\"; a July 2023 request to meet with TxDOT about the speed limit after a run of crashes, which produced temporary flashing speed signs; an agreement to host license-plate readers in TxDOT right-of-way; participation as an agency in the second-causeway environmental study; and recurring workshop discussions about lighting, pursued with the area's state representative.",
          "There is no Council resolution supporting the SH 361 Mustang Island Project. No letter or resolution to the Texas Transportation Commission asking that it be accelerated or funded. No joint resolution with Nueces County or Corpus Christi. No delegation to the MPO — the body that declined to add the project to the funding list — and no action on the city's own 2023 comprehensive plan recommendation to \"investigate the potential for the City to join the CCMPO.\" When TxDOT collected seventy public comments on the project in fall 2024, none came from the City of Port Aransas.",
          "Meanwhile, in town, the engineering has been concrete and funded. A warrant study for the intersection of Avenue G and Station Street was commissioned, found three signal warrants met, and produced a signal: $400,000 budgeted in the 2024-25 city budget, awarded in September 2025 at $315,267.52, energized in late June 2026. At the June 2026 goal-setting workshop, the Council took up a roundabout at Avenue G, Sixth Street and Cut Off Road. That item came from TxDOT — staff described the agency as enthusiastic about the concept and possibly holding money for it — and Cut Off Road is itself SH 361, the in-town leg.",
          "That is the shape of it. Where the state has money and a project, the city moves. On the fifteen miles where the state has no construction dollars, the city has a line in a legislative priorities list.",
        ],
      },
      {
        heading: "What this piece is not saying",
        body: [
          "It is not saying that developments cause these crashes. Drivers cause crashes, and the record is blunt about how.",
          "Of the fifteen fatal crashes on and immediately around this corridor since 2016, ten involved alcohol or drugs, according to the state and federal crash files and the arrests that followed. One driver is serving twenty years for intoxication manslaughter for a 2024 crash that killed two people. Another was charged in April with intoxication manslaughter in a 2025 crash that killed a 21-year-old nursing student. Failure to control speed is the most common contributing factor on the corridor by a wide margin. The Port Aransas police chief and a department lieutenant have both said publicly that impatient passing — using the center turn lane to get around slower traffic — is a recurring cause of head-on crashes here.",
          "All of that is true, and none of it is unusual. Impairment and speed are constants on every road in Texas. What differs from road to road is what happens next: whether a drifting vehicle meets a raised median, a wide shoulder and a turn bay, or an oncoming car at a combined hundred and twenty miles an hour.",
          "This week made the point without alcohol, at least on the record so far: investigators said alcohol was not a contributing factor in either crash, and both investigations remained open as this was published. Monday's was a driver who crossed the line. Friday's was a rear-end collision — the most ordinary crash there is — that became a head-on because there was nowhere else for the struck car to go.",
        ],
      },
      {
        heading: "The arithmetic of waiting",
        body: [
          "Crash counts on this corridor have been flat for a decade: 197 in the five years through 2020, 189 in the five years through 2025, while traffic on the island rose by roughly a quarter. On a per-mile-driven basis, crashes went down.",
          "Deaths went the other way. Three fatal crashes and three deaths in 2016 through 2020. Eight fatal crashes and ten deaths in 2021 through 2025. Three fatal crashes and four deaths so far in 2026 — with four and a half months left in the year, already the deadliest year in the record.",
          "TxDOT's timeline for the fix, as published, is 2030 at the earliest, contingent on funding. Its own project tracker now shows the funded end piece letting in 2032 and the northern piece in 2036, with the eight miles in between unscheduled. The agency told commenters in 2024 that \"if additional interim safety solutions are identified that can fit within the existing right of way, then TxDOT could advance those solutions earlier than 2030 if funding is available.\" The interim measures delivered so far are passing lanes, rumble strips, and safety lighting at four locations — the state park entrance, Beach Access Road 2, La Concha Boulevard and the Gulf Waters entrance. Every one of them is an access point.",
          "The people who live here have been describing the mechanism to the state for years, in the state's own comment forms.",
        ],
        pullQuote: {
          text:
            "361 is an incredibly dangerous and deadly highway … oftentimes driving half-way in the shoulder in fear of a head on collision.",
          attribution:
            "Public comment to TxDOT · SH 361 Mustang Island Project · September 19, 2024",
        },
      },
      {
        heading: "Close",
        body: [
          "The island road was built as a way through. It is being used as a way in — by roughly 78 driveways and streets, a third of them added in the last twenty years, with a thousand acres of frontage in planning and a developer asking for a signal.",
          "That transformation is not illegal, hidden or even unusual. It is the ordinary way a rural highway becomes a suburban one. What is unusual here is the gap between the change and the engineering: a road acquiring driveways at the pace of a boom, with the median that a road with driveways requires scheduled for the two ends and unscheduled for the middle where the people die.",
          "TxDOT named the growth problem on this island in 2011, applied the remedy to the town in 2017, and has the island's remedy split into a funded end, an unfunded end, and eight unprogrammed miles. The city has a resolution asking the state to study a turn lane by the Whataburger, and a new signal downtown. The developer's promised stoplight is a stop sign and a portable light a police officer runs by hand during Spring Break.",
          "Three people died on that road this week, in two crashes investigators say did not involve alcohol, both of them ending up in the oncoming lane.",
          "The next set of decisions is at the Council's August 25 meeting, at the Corpus Christi MPO, and in the next legislative session.",
        ],
      },
      {
        heading: "How we did this",
        body: [
          "The crash figures in this piece come from the Texas Department of Transportation's Crash Records Information System, queried for every reportable crash on SH 361 in Nueces County from 2016 through August 15, 2026, with crash-level coordinates, severity, contributing factors, roadway design attributes and TxDOT's attached traffic counts. Crashes were assigned to the corridor by TxDOT's own mile posts. Fatal crashes were cross-checked one by one against the federal Fatality Analysis Reporting System, which matched the state file for every year it covers. Exposure came from TxDOT's published annual average daily traffic counters at each end of the island; benchmark rates come from TxDOT's own Texas Motor Vehicle Traffic Crash Facts tables. Funding status comes from TxDOT's public project tracker, the Unified Transportation Program, and the Corpus Christi MPO's meeting minutes. Council actions come from the city's agendas, packets and minutes.",
          "The data file and a full method note are published alongside this piece. Anyone can check the arithmetic.",
          "This week's two crashes are not yet in the state file; they are counted here from police accounts as reported, including the finding on alcohol, and both investigations were open at publication. Port A Local does not publish the names of people killed in crashes.",
        ],
      },
    ],

    sources: [
      {
        label:
          "TxDOT — Crash Records Information System (CRIS) public query, SH 361, Nueces County, 2016–2026",
        url: "https://cris.dot.state.tx.us/public/Query/app/home",
      },
      {
        label:
          "Port A Local — SH 361 crash extract (CSV: every crash with coordinates, severity and contributing factors)",
        url: "/data/sh361/sh361-crashes-2016-2026.csv",
      },
      {
        label: "Port A Local — method note for this analysis",
        url: "/data/sh361/METHOD.md",
      },
      {
        label:
          "Port A Local — full-size corridor chart (crashes, fatal crashes and every access point, mile by mile)",
        url: "/images/sh361-crash-map-wide.png",
      },
      {
        label:
          "TxDOT — SH 361 Mustang Island Project (Access Road 1 to Park Road 22, CSJ 2263-03-024)",
        url: "https://www.txdot.gov/projects/projects-studies/corpus-christi/sh361-mustang-island-project.html",
      },
      {
        label: "TxDOT — SH 361 Mustang Island Project fact sheet, September 2024",
        url: "https://ftp.txdot.gov/pub/txdot/get-involved/crp/sh361/091924-fact-sheet.pdf",
      },
      {
        label:
          "TxDOT — SH 361 public meeting documentation and comment responses, September–October 2024",
        url: "https://ftp.txdot.gov/pub/txdot/get-involved/crp/sh361/091924-public-meeting-summary.pdf",
      },
      {
        label:
          "TxDOT — media advisory, SH 361 proposed improvements citizens' meeting, March 28, 2011 (town boulevard, raised median)",
        url: "https://ftp.txdot.gov/pub/txdot-info/crp/notices/sh361.pdf",
      },
      {
        label:
          "TxDOT — Texas Motor Vehicle Traffic Crash Facts 2024: statewide crash rates by highway system and road type",
        url: "https://www.txdot.gov/content/dam/docs/division/trf/crash-records/2024/02.pdf",
      },
      {
        label:
          "TxDOT — Comparison of motor vehicle traffic deaths, vehicle miles and death rates, 2003–2025",
        url: "https://www.txdot.gov/content/dam/docs/division/trf/crash-records/final-compares-2003-2025.pdf",
      },
      {
        label:
          "TxDOT — annual average daily traffic counters, SH 361 (TxDOT Annual AADT public data)",
        url: "https://www.txdot.gov/data-maps/traffic-count-data.html",
      },
      {
        label: "TxDOT — public project tracker (CSJ 2263-03 projects, retrieved August 15, 2026)",
        url: "https://apps3.txdot.gov/apps-cq/project_tracker/",
      },
      {
        label:
          "Texas Department of Licensing and Regulation — SH 361 town section, widen two-lane rural to four-lane urban with raised median, 2016–2017",
        url: "https://www.tdlr.texas.gov/TABS/Search/Print/EABPRJB6809588",
      },
      {
        label: "NHTSA — Fatality Analysis Reporting System (FARS), Nueces County, 2014–2024",
        url: "https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars",
      },
      {
        label:
          "Corpus Christi MPO — Transportation Policy Committee minutes, December 5, 2024 (SH 361 not added to the 2026 UTP list)",
        url: "https://www.corpuschristi-mpo.org/03_tpc_agendas/2024/20241205_tpcminutes.pdf",
      },
      {
        label:
          "Corpus Christi MPO — Transportation Policy Committee minutes, March 6, 2025 (\"SH 361 is not currently funded\")",
        url: "https://www.corpuschristi-mpo.org/03_tpc_agendas/2025/20250306_tpcminutes.pdf",
      },
      {
        label:
          "Corpus Christi MPO — Transportation Policy Committee minutes, February 5, 2026 (boundary and prioritization)",
        url: "https://www.corpuschristi-mpo.org/03_tpc_agendas/2026/20260205_tpcminutes.pdf",
      },
      {
        label:
          "City of Port Aransas — Beach Access Road 1-B construction specifications, April 2025",
        url: "https://cityofportaransas.org/wp-content/uploads/2025/04/Beach-Access-Road-1-B-Specifications.pdf",
      },
      {
        label:
          "City of Port Aransas City Council — agenda and packet, March 21, 2024 (Resolution 2024-R18, beach access easement exchange)",
        url: "https://cityofportaransas.civicweb.net/document/152071/",
      },
      {
        label:
          "City of Port Aransas City Council — agenda and packet, January 19, 2023 (resolution requesting TxDOT turn-lane study)",
        url: "https://cityofportaransas.civicweb.net/document/30815/",
      },
      {
        label:
          "City of Port Aransas City Council — agenda and packet, August 11, 2025 (Resolution 2025-R38, SH 361 turn lane change order)",
        url: "https://cityofportaransas.civicweb.net/document/163775/",
      },
      {
        label:
          "City of Port Aransas City Council — minutes, September 18, 2025 and April 21, 2026 (signal award; deferral on permanent signals)",
        url: "https://cityofportaransas.civicweb.net/document/171047/",
      },
      {
        label:
          "City of Port Aransas — Priorities and Strategies goals workshop packet, June 30, 2026 (roundabout and SH 361 lighting items)",
        url: "https://cityofportaransas.civicweb.net/document/170525/",
      },
      {
        label:
          "City of Port Aransas — Moving Forward Port A Comprehensive Plan, adopted April 20, 2023",
        url: "https://cityofportaransas.org/wp-content/uploads/2023/06/Moving-Forward-Port-A-Comprehensive-Plan-Adopted-2023.04.20.pdf",
      },
      {
        label:
          "City of Corpus Christi — Padre/Mustang Island Mobility Plan, existing conditions memorandum",
        url: "https://www.corpuschristitx.gov/media/iroft2nf/mustang-padre-island-mobility-existing-conditions.pdf",
      },
      {
        label:
          "Port Aransas South Jetty — \"City decides on different spot for access road,\" March 27, 2024",
        url: "https://www.portasouthjetty.com/articles/city-decides-on-different-spot-for-access-road/",
      },
      {
        label: "Port Aransas South Jetty — \"New beach access road opens,\" March 4, 2026",
        url: "https://www.portasouthjetty.com/articles/new-beach-access-road-opens/",
      },
      {
        label:
          "KRIS 6 — \"Fatal head-on collision on Highway 361 in Port Aransas kills one, injures another,\" August 11, 2026",
        url: "https://www.kristv.com/news/local-news/in-your-neighborhood/corpus-christi/padre-island/fatal-head-on-collision-on-highway-361-in-port-aransas-kills-one-injures-another",
      },
      {
        label:
          "KRIS 6 — \"UPDATE: New details on Friday's fatal wreck on Hwy 361,\" August 14, 2026",
        url: "https://www.kristv.com/news/local-news/in-your-neighborhood/corpus-christi/padre-island/2-dead-several-hospitalized-in-4-vehicle-crash-on-highway-361-near-corpus-christi",
      },
      {
        label:
          "KRIS 6 — \"FACING DANGER: TxDOT's plan for SH 361; is it enough to reduce fatal crashes?\" December 16, 2024",
        url: "https://www.kristv.com/news/local-news/in-your-neighborhood/corpus-christi/padre-island/facing-danger-txdots-plan-for-sh-361-is-it-enough-to-reduce-fatal-crashes",
      },
      {
        label:
          "KRIS 6 — \"TxDOT releases plans to improve safety on HWY 361 with construction starting in 2030,\" September 2024",
        url: "https://www.kristv.com/news/local-news/in-your-neighborhood/nueces-county/port-aransas/txdot-releases-plans-to-improve-safety-on-hwy-361-with-construction-starting-in-2030",
      },
      {
        label:
          "Corpus Christi Caller-Times — \"Plans underway to widen State Highway 361 as crashes add up,\" August 16, 2024",
        url: "https://eu.caller.com/story/news/local/2024/08/16/plans-underway-to-widen-state-highway-361-as-crashes-add-up/74796020007/",
      },
      {
        label:
          "Sea Oats Group — announcement of $1.3 billion Phase II expansion of Cinnamon Shore, June 13, 2017",
        url: "https://www.globenewswire.com/news-release/2017/06/13/1018389/0/en/Sea-Oats-Group-Announces-1-3-Billion-Phase-II-Expansion-of-Cinnamon-Shore-on-the-Texas-Gulf-Coast.html",
      },
    ],
  },

  "highway-361-after-dark": {
    lede:
      "After Saturday's piece on the crash record for State Highway 361, several readers asked the same question in different words: does the file show a difference between day and night? It does — and it is larger than the difference between most of the other things people argue about on that road.",

    sections: [
      {
        heading: "What was asked, and what we did",
        body: [
          "Every crash report filed in Texas records the light condition at the scene: daylight, dark with street lighting, dark with none, dawn, dusk. That field was already in the file we pulled for Saturday's piece — 421 crashes on the corridor between Beach Access Road 1 and Park Road 22, 2016 through August 15. Nobody had asked it to sort itself by light before. Readers asked, so we sorted it.",
          "One framing note, because it decides what the numbers mean. Counting crashes by time of day mostly measures traffic: fewer cars run at 3 a.m., so fewer crashes happen at 3 a.m. That tells you little. The useful question is not how many crashes happen after dark, but how many of the crashes that do happen end with someone dead. That is what the chart below measures.",
        ],
        callout: {
          label: "How often a crash on SH 361 kills someone",
          items: [
            { label: "In daylight", value: "1.7% — 5 of 293" },
            { label: "After dark, with street lighting", value: "2.4% — 1 of 42" },
            { label: "After dark, no lighting", value: "7.0% — 5 of 71" },
            { label: "Crashes between 8pm and 6am", value: "22% of all crashes" },
            { label: "Deaths between 8pm and 6am", value: "58% of all fatal crashes" },
          ],
        },
        figure: {
          src: "/images/sh361-night-map.png",
          srcWide: "/images/sh361-night-map-desktop.png",
          alt: "Three panels of SH 361 crash data. First, how often a crash kills someone by light condition: 1.7% in daylight, 2.4% after dark with street lighting, 7.0% after dark with none. Second, crashes by hour of day, with the portion involving recorded alcohol or drugs shaded and each fatal crash marked. Third, the corridor from Port Aransas to Park Road 22 showing every fatal crash by day or night, circled where an impaired driver was involved, against the sections TxDOT has lit.",
          caption:
            "SH 361 between Beach Access Road 1 and Park Road 22, 2016 through August 15, 2026. Updated August 18 with the impairment layer. Sources: TxDOT Crash Records Information System; NHTSA Fatality Analysis Reporting System, Nueces County court records and DPS lab results for impairment in the fatal crashes. The underlying file is published with Saturday's piece.",
          minWidth: 620,
        },
      },
      {
        heading: "What the sorted file shows",
        body: [
          "Darkness accounts for 27 percent of the crashes on the corridor and half of the fatal ones. Between 8 p.m. and 6 a.m. — 22 percent of the crashes — the road produces 58 percent of its deaths.",
          "The gradient inside darkness is the part that surprised us. On stretches with street lighting, a crash after dark kills someone 2.4 percent of the time, which is close to the daylight figure of 1.7 percent. On stretches with no lighting, it is 7.0 percent. A crash on an unlit stretch of this road after dark is about four times as likely to kill as the same crash in daylight.",
          "Geographically, every fatal crash after dark in the file is at or north of Access Road 2 — in the same unlit, undivided middle where Saturday's piece found the deaths concentrated regardless of light.",
        ],
      },
      {
        heading: "What it does not show",
        body: [
          "It does not show that lighting would have prevented those deaths. The southern miles TxDOT lit in 2023 and 2024 have had 65 crashes after dark in this ten-year window and none of them killed anyone — but that was true before the lights went in as well as after. The lit section is also the section with the signals, the lower speeds near Park Road 22 and the shortest distance to a hospital. Untangling those would take more than a crash file.",
          "Twelve fatal crashes is a small number. One additional death in the wrong cell moves these percentages several points. Read the gaps as direction, not precision — and note that neither of the two crashes that killed three people on August 10 and August 14 happened after dark. The couple killed Friday died at 3:40 in the afternoon.",
          "What the file does support is narrower and still useful: on this road, darkness and the absence of lighting travel with a much higher chance that a crash turns fatal, and both conditions are concentrated in the miles that have no median and no funded project.",
        ],
        pullQuote: {
          text: "It is important to address Hwy 361 now.",
          attribution:
            "State Rep. Todd Hunter, in a text message to KRIS 6 News, August 17, 2026",
        },
      },
      {
        heading: "Why the timing matters",
        body: [
          "On Wednesday afternoon, the full Nueces County state legislative delegation — Rep. Todd Hunter, Rep. Denise Villalobos and Senators Juan \"Chuy\" Hinojosa and Adam Hinojosa — meets TxDOT about this highway. Rep. Villalobos told KRIS 6 News that this is not the first time the delegation has met about it.",
          "The widening those meetings are ultimately about is expensive and distant. TxDOT's public project tracker puts the southern piece at $60 million with a 2032 letting date and the northern piece at $54 million in 2036, and programs nothing at all for the roughly eight miles in between — the miles where most of the deaths are.",
          "Lighting is a different order of cost. The three lighting jobs TxDOT has already awarded on this corridor — one near Gulf Waters, one at La Concha Boulevard, and five miles running south toward Park Road 22 — came to about $483,000 combined. That is less than one percent of either widening piece. The argument that has kept more of it from happening is not primarily engineering; it is who pays. TxDOT has taken the position that continuous lighting inside a city is a city expense, which is why the phrase turns up in Port Aransas council workshops alongside the mayor's remark that the state ought to pay for its own highway.",
          "We are not in a position to say what the delegation should ask for on Wednesday. We are in a position to say what is in the file, which is this: the deadliest condition on the island road, after the missing median, is the dark.",
        ],
      },
      {
        heading: "Update, August 18: the alcohol layer, and why the file undercounts it",
        body: [
          "A reader asked us to add impairment to the day-and-night view. The chart above now carries it: the shaded portion of each hour is the share of those crashes with alcohol or drugs recorded, and every fatal crash circled in the bottom panel involved an impaired driver. Adding the layer turned up two findings — one about the road, one about the record itself.",
          "Sorted by light, the corridor's crash reports record alcohol or drugs in 4.4 percent of daylight crashes, 16.3 percent of crashes after dark on lit stretches, and 18.3 percent after dark with no lighting. Impairment shows up roughly four times as often in crashes after dark. That is thirty-three flagged crashes out of 421, so treat it as direction rather than a precise rate.",
          "Then we checked that field against the federal fatality file, which carries actual laboratory results, and it does not hold up. Of the corridor's twelve fatal crashes in the state file, the contributing-factor field flags six as involving alcohol or drugs. The federal file, court outcomes and DPS lab work establish impairment in nine.",
          "The clearest example is the crash that killed a 35-year-old Corpus Christi man in August 2024. The federal record puts the at-fault driver's blood alcohol at 0.200 — two and a half times the legal limit. The state crash report's contributing-factor field for that crash says only \"failed to drive in single lane.\"",
          "The reason is procedural, not anybody's fault: the officer's crash report is filed within days, and toxicology comes back weeks or months later. Nothing goes back to update that field. In one case here, the intoxication-manslaughter arrest came eight months after the crash.",
          "That matters for how anyone reads the alcohol numbers above. If the file misses a third of the impaired crashes among fatalities — the crashes that get the most investigation — it certainly misses more among the four hundred non-fatal crashes, where blood is rarely drawn at all. The real share of impaired crashes on this road is higher than the file says, in daylight and after dark both. We would rather tell you the number is soft than hand you a clean-looking figure we cannot stand behind.",
        ],
        table: {
          caption: "Every fatal crash on the corridor since 2016, with light condition and impairment as established by the best available record",
          columns: ["Date", "Light", "Impairment (source)", "What happened"],
          rows: [
            ["Jan 13, 2016", "Daylight", "Drinking recorded, no test given (federal file)", "Motorcycle overturned, single vehicle"],
            ["Mar 17, 2018", "Dark, no lighting", "Drugs recorded; alcohol 0.000 (federal file)", "Pedestrian struck in heavy fog"],
            ["Jan 25, 2019", "Dark, no lighting", "None established, no test given", "Motorcycle left the road into water"],
            ["Jun 16, 2022", "Daylight", "None recorded", "Head-on"],
            ["Aug 13, 2022", "Dark, no lighting", "0.060 BAC; charged with intoxication manslaughter", "Head-on — two killed"],
            ["Jun 30, 2023", "Dark, no lighting", "0.179 BAC (federal file)", "Head-on while passing"],
            ["Jul 3, 2023", "Dark, lit", "0.040 BAC (federal file)", "Left turn across traffic at a driveway"],
            ["Nov 2, 2023", "Daylight", "Drugs recorded; speeding (federal file)", "Motorcycle passing struck a left-turning pickup"],
            ["May 14, 2024", "Daylight", "0.200 BAC; 20-year sentence", "Passing crash pushed a vehicle into oncoming traffic — two killed"],
            ["Aug 9, 2024", "Dusk", "0.200 BAC (federal file) — not flagged in the state file", "Crossed the centerline, struck two vehicles"],
            ["Aug 15, 2025", "Dark, no lighting", "Methamphetamine, DPS lab; charged eight months later", "Head-on"],
            ["Mar 2, 2026", "Daylight", "None recorded", "Cyclist struck"],
            ["Aug 10, 2026", "Daylight", "Not suspected (investigators)", "Head-on at Access Road 2"],
            ["Aug 14, 2026", "Daylight", "Not a factor (investigators)", "Rear-end pushed a car into oncoming traffic — two killed"],
          ],
          note: "Impairment refers to any driver involved in the crash, which in several of these was not the person who died. The 2025 and 2026 crashes are not yet in the state file and are recorded here from lab results, court records and police accounts; the two August 2026 investigations remain open. Sources: TxDOT Crash Records Information System, NHTSA Fatality Analysis Reporting System, Nueces County court records, DPS.",
        },
      },
      {
        heading: "What the two layers say together",
        body: [
          "Impairment is in nine of these fourteen crashes. Darkness and missing lighting travel with a much higher chance that a crash turns fatal. Both are true, and neither is the whole picture.",
          "What the fourteen rows have in common is not the driver. It is the geometry. Eight of them ended with a vehicle in the oncoming lane on a road with nothing in the middle to stop it — whether the driver was drunk, high, distracted, or simply unlucky enough to be rear-ended, as the couple killed on August 14 were, at 3:40 in the afternoon, stone sober.",
          "That is the value of putting the layers on one page. A road cannot stop people from drinking. It can decide what happens to everyone else when they do.",
        ],
      },
      {
        heading: "How this was done",
        body: [
          "Same file, same corridor, same method as Saturday. Crashes were pulled from TxDOT's Crash Records Information System for SH 361 in Nueces County, filtered to the segment between Beach Access Road 1 and Park Road 22 using the state's own distance-from-origin measure, and grouped by the light condition recorded on each report. Dawn and dusk are counted separately from dark, which is why the panels show fourteen markers where the corridor total is twelve fatal crashes plus the two from last week that the state file has not yet ingested.",
          "The spreadsheet and the method note are published with Saturday's piece. If you find an error in this, tell us and we will correct it in public.",
        ],
      },
    ],

    sources: [
      {
        label:
          "Port A Local — \"Three Dead in Five Days on the “Island Road”,\" August 15, 2026 (the underlying analysis, data file and method note)",
        url: "https://theportalocal.com/dispatch/highway-361-fatal-crashes",
      },
      {
        label:
          "TxDOT Crash Records Information System — public crash query, SH 361, Nueces County, 2016–2026",
        url: "https://cris.dot.state.tx.us/public/Query/app/home",
      },
      {
        label:
          "Port A Local — SH 361 crash file (CSV, 421 crashes with light condition, location and severity)",
        url: "/data/sh361/sh361-crashes-2016-2026.csv",
      },
      {
        label:
          "KRIS 6 News — \"Couple killed in Highway 361 crash identified; lawmakers to meet with TxDOT this week,\" August 17, 2026",
        url: "https://www.kristv.com/news/local-news/in-your-neighborhood/corpus-christi/padre-island/couple-killed-in-highway-361-crash-identified-lawmakers-to-meet-with-txdot-this-week",
      },
      {
        label:
          "TxDOT Project Tracker — control-section-job records for SH 361 (2263-03), retrieved August 15, 2026",
        url: "https://apps3.txdot.gov/apps-cq/project_tracker/",
      },
      {
        label:
          "TxDOT — SH 361 Mustang Island Project, public meeting materials, September 19, 2024",
        url: "https://www.txdot.gov/projects/projects-studies/corpus-christi/sh361-mustang-island-project.html",
      },
    ],
  },

  "closed-session-66-million": {
    lede:
      "This Wednesday at 5:00 PM, the Port Aransas City Council will vote to consent to a $66 million hotel-and-convention center at Palmilla Beach Resort.",

    sections: [
      {
        heading: "What's on the agenda",
        body: [
          "The applicant is KM Beach, LLC — a Texas company headquartered at the same San Antonio address as McCombs Properties, the family business of San Antonio billionaire Red McCombs and the named owner of Palmilla Beach Resort. The financing is structured as a Tax Increment Reinvestment Zone and a Municipal Management District: two mechanisms by which public revenue is captured to fund private development on a particular parcel. The City Manager is empowered, by the same resolution, to appoint staff and legal counsel to a three-member Council working group that will negotiate the Master Development Agreement over the next ninety days.",
          "The deliberation of the District's boundaries and the MDA's financial terms occurs in closed executive session.",
          "The staff memos describing both are listed on the Council's public agenda. They are not downloadable from the City's public-facing website.",
          "Three weeks ago, on April 21, the same Council voted 5-2 to enter a Memorandum of Understanding and Professional Services Agreement with the same KM Beach, LLC. The packet for that meeting carried no posted action item for the agreement. The deliberation occurred in closed executive session. The vote was reported afterward by the Port Aransas South Jetty.",
        ],
      },
      {
        heading: "Seven years ago",
        body: [
          "Seven years and four months ago, the same Council voted 7-0 to award a different hotel-and-conference center contract — the city's first attempt at the project. That earlier deliberation was also held outside the public packet. The procedural mechanism that kept it off the public record fit in seven words.",
          "They appeared on page 71 of the meeting agenda packet, in the commentary line for the contract.",
          "That is the entire substantive content, in the public packet, of the deliberation that resulted in the 7-0 vote.",
          "The grading rubric the City has since confirmed was used to evaluate the two bidders is not in the packet. A full-text search of the 413 pages returns zero hits for the words \"rubric,\" \"175,\" \"182,\" \"71.5,\" or \"74%.\" The resolution template lists the wrong opponent — McCombs Properties rather than Palmilla Beach — and leaves the awardee field blank.",
        ],
        pullQuote: {
          text: "INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW",
          attribution:
            "Port Aransas City Council agenda packet · January 17, 2019 · page 71",
        },
      },
      {
        heading: "Exactly once",
        body: [
          "A full-text search of the eleven publicly-available 2019 council packets — roughly 2,800 pages combined — returns the verbatim phrase \"INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW\" exactly once. Not on a routine consent item. Not on a budget line. On the hotel-and-conference center contract.",
          "The rubric, since produced under a Texas Public Information Act request, shows the bidder receiving the 7-0 votes — Cinnamon Shore, with ZJZ Hospitality as hospitality partner — scored 175 of 245 possible points. The losing bidder — Palmilla Beach — scored 182. The category the lower-scoring bidder won most decisively was \"minimal impact of future tax revenue to the City.\"",
          "Two of the seven council members who cast that 7-0 vote had personally helped develop and apply the rubric. The other five had not seen the rubric in any publicly distributed materials.",
          "Both members who served on the grading committee still hold Council seats. Both voted in favor of the April 21, 2026 agreement with KM Beach, LLC. The bidder the 2019 rubric had winning is the bidder on Wednesday's vote.",
          "The parcel is the same parcel. The family is the same family. The City Manager is the same City Manager.",
        ],
      },
      {
        heading: "What is in KM Beach, LLC",
        body: [
          "KM Beach, LLC has been the named applicant on Palmilla Beach Planned Unit Development replats with the City since at least 2022. Its officers — Marsha Shields, Harry Ben Adams IV, and Steve L. Cummings — are filed with the State of Texas. Its assumed-name certificates trade as \"Palmilla Beach Golf Club\" and \"Black Marlin Bar & Grill.\" Its parent, McCombs Properties, describes Palmilla Beach Resort on its own marketing site as \"owned and being built by McCombs Properties, the real estate development company owned by famed San Antonio businessman Red McCombs.\"",
          "The 2019 procurement was awarded to Cinnamon Shore, which sits inside a different Port Aransas Planned Unit Development across the island. As of May 2026, that conference center has not been constructed. The Cinnamon Shore award was relocated by Council to a third parcel in 2020, then transferred to a third entity, then allowed to expire when no construction broke ground by the December 2022 deadline in the developer's filed timeline.",
          "Wednesday's vote is the procurement's third attempt — at the parcel of the 2019 procurement's higher-scoring bidder, under the family that owns it.",
        ],
      },
      {
        heading: "Wednesday",
        body: [
          "The May 20 agenda lists two itemized actions. The first is a resolution \"Conditionally Consenting to the Creation of a Municipal Management District… with KM Beach, LLC.\" The second is the authorization of the three-member Council working group, for up to 90 days, to negotiate the Master Development Agreement.",
          "The deliberation, again, occurs in closed executive session. The staff memos describing the District's geographic boundaries and the MDA's financial terms are listed in the public agenda but are gated behind a portal-account login at the City's civicweb portal. They are not on the City's public-facing website. The January 17, 2019 packet — the one that contains the seven words on page 71 — is, by comparison, freely downloadable from the City's public website. The newer documents do not appear there.",
        ],
      },
      {
        heading: "The City Manager",
        body: [
          "The City Manager who served on the 2019 grading committee — David Parsons — remains the City Manager today. He recommended the March 2025 contract awarded 7-0 to Weaver and Jacobs Constructors, for $9.575 million, to expand the City Hall and Civic Center — with Turner Ramirez Architects as the project's architect, the same firm that was on Cinnamon Shore's 2019 winning conference-center bid team. He recommended the April 21, 2026 agreement with KM Beach, LLC. He is the official Wednesday's working-group resolution empowers to appoint staff and legal counsel to support the MDA negotiations.",
        ],
      },
      {
        heading: "Records requests",
        body: [
          "Port A Local will file two records requests with the City Secretary after the May 20 vote.",
          "The first will ask whether any conflict-of-interest filing naming KM Beach, LLC; Palmilla Beach Resort; McCombs Properties; Marsha Shields; Harry Ben Adams IV; or Steve L. Cummings is on file with the City from 2017 through 2026. (The City Secretary's earlier response to a parallel request — naming Sea Oats Group, ZJZ Hospitality, and the named principals of the 2019 winning bid — produced zero records.)",
          "The second will ask the City Secretary to identify every agenda item in the same nine-year period in which deliberative materials were sent to Council outside the publicly-distributed agenda packet — by any mechanism — and to provide the records that document those routings. The responses will be published in a follow-up Dispatch.",
        ],
      },
      {
        heading: "Close",
        body: [
          "The Council that voted 7-0 in January 2019 — on a rubric the public packet did not contain — is largely the same Council voting Wednesday. The bidder the 2019 rubric had winning is the bidder on Wednesday's vote, financed by mechanisms that capture public revenue on the parcel the development will be built on, deliberated in closed session, with the staff memos that explain the terms gated behind a login the public cannot enter.",
          "This case is one decision. The wider pattern it sits inside — five governance bodies the city presents as independent, in practice run by the same network of households; the body that drafts the rules with terms now lapsed; the disclosure-form regime that does not surface the architecture — is the subject of a forthcoming Dispatch.",
          "The records describe an architecture. The architecture was decided.",
          "The next set of decisions is on this Wednesday's agenda.",
        ],
      },
    ],

    sources: [
      {
        label:
          "City of Port Aransas — Agenda Packet, January 17, 2019, p. 71",
        url: "https://cityofportaransas.org/wp-content/uploads/2020/01/Agenda-Packet-1-17-19.pdf",
      },
      {
        label:
          "City of Port Aransas City Council — Agenda, April 21, 2026 (civicweb)",
        url: "https://cityofportaransas.civicweb.net/document/167877/",
      },
      {
        label:
          "City of Port Aransas City Council — Agenda, May 20, 2026 (civicweb)",
        url: "https://cityofportaransas.civicweb.net/document/169505/",
      },
      {
        label:
          "Port Aransas South Jetty — \"Council advances conference center talks\" (April 30, 2026)",
        url: "https://www.portasouthjetty.com/articles/council-advances-conference-center-talks/",
      },
      {
        label:
          "Port Aransas South Jetty — \"Port Aransas City Council to discuss proposed hotel conference center, more\" (May 16, 2026)",
        url: "https://www.portasouthjetty.com/articles/port-aransas-city-council-to-discuss-proposed-hotel-conference-center-more/",
      },
      {
        label:
          "Port Aransas South Jetty — \"Public hearing on replat at Palmilla Beach PUD\" (January 6, 2022)",
        url: "https://www.portasouthjetty.com/articles/public-hearing-on-replat-at-palmilla-beach-pud-set-on-jan-20/",
      },
      {
        label:
          "Texas Secretary of State — KM Beach, LLC (via OpenCorporates)",
        url: "https://opencorporates.com/companies/us_tx/0801727123",
      },
      {
        label: "McCombs Properties — Palmilla Beach Resort category page",
        url: "https://www.mccombsproperties.com/category/palmilla-beach-resort",
      },
      {
        label: "Palmilla Beach Resort & Golf Community — Developer page",
        url: "https://www.palmillabeach.com/developer/",
      },
      {
        label:
          "City of Port Aransas — Texas Public Information Act response, May 6, 2026, from City Secretary Francisca Nixon",
      },
      {
        label:
          "Full-text search of eleven publicly-available 2019 council packets (cityofportaransas.org/wp-content/uploads/2020/01/) — verbatim phrase \"INFORMATION SENT SEPARATE BY CITY MANAGER FOR REVIEW\" appears exactly once",
      },
    ],
  },

  "nueces-drought-disaster-2026": {
    lede:
      "On Thursday, April 30, 2026, Nueces County Commissioners Court declared a local disaster over the deepening drought and water shortage. The order is effective immediately and remains in place until the county judge formally lifts it. Port Aransas — on the same water system as Corpus Christi — is on the inside of that declaration.",

    sections: [
      {
        heading: "What the declaration does",
        body: [
          "A local disaster declaration is a procedural unlock. It lets the county activate emergency plans, coordinate response across cities and water utilities, and access state and federal aid more quickly. By itself, it does not change what comes out of your tap. The City of Corpus Christi — Nueces County's main water provider, and the source for Port Aransas — is already operating under Stage 3 water restrictions.",
          "The State of Texas had already issued a drought-related disaster proclamation that includes Nueces County. Governor Abbott amended and renewed that proclamation in April 2026. The county's local declaration accelerates the response on the ground.",
        ],
      },
      {
        heading: "The numbers",
        body: [
          "As of April 2026, combined storage at Choke Canyon Reservoir and Lake Corpus Christi — the two reservoirs that supply the city's water system — sits at roughly 8.7 percent of capacity. That is among the lowest readings ever recorded.",
          "Choke Canyon alone is below 8 percent. The reservoir fell from 47 percent capacity to 11 percent between October 2021 and October 2025 — a four-year decline driven by a five-year drought. The trajectory has not turned.",
          "Corpus Christi Water serves roughly 500,000 people across seven counties, plus one of the largest petrochemical corridors in the country. Industrial demand accounts for more than half of the region's water use.",
        ],
        callout: {
          label: "By the numbers · April 2026",
          items: [
            { label: "Combined reservoir storage", value: "8.7%" },
            { label: "Choke Canyon alone", value: "<8%" },
            { label: "Decline since Oct 2021", value: "47% → 11%" },
            { label: "People on the system", value: "~500,000" },
            { label: "Industrial share of demand", value: ">50%" },
          ],
        },
      },
      {
        heading: "What's coming",
        body: [
          "The city's own water models project a Level 1 Water Emergency by September 2026. At Level 1, all customers — residential, commercial, industrial — would be required to reduce water use by 25 percent. The Corpus Christi City Council was scheduled to consider that plan in late April and delayed the vote.",
          "In parallel, the city is drilling a new wellfield, pursuing groundwater purchases from outside utilities, and bringing reclaimed-water reuse online — the latter beginning December 2026 at the earliest. None of those measures, individually, replace the missing reservoir storage. They buy time.",
        ],
        pullQuote: {
          text: "September unless significant rain falls.",
          attribution: "City of Corpus Christi water emergency projection",
        },
      },
      {
        heading: "Why Harbor Island matters here",
        body: [
          "The Harbor Island desalination plant has been the long-term play for years. The proposed siting is the single most consequential thing about it for anyone who lives on the island: directly on the ship channel, next to the ferry landing, across the water from Roberts Point Park. The original application contemplated discharging up to 95.6 million gallons per day of hypersaline effluent into the channel — water that, on the wrong tides, moves into the surrounding wetlands. Those wetlands are spawning grounds for shrimp, crabs, and the species that make the local fishing industry possible. The proposed seawater intake — 150 million gallons a day — would also pull through one of the most ecologically important larval-fish corridors on the Texas coast.",
          "The project hit another setback this spring when the Nueces River Authority's $140 million low-interest loan application to the Texas Water Development Board was denied. The TWDB had more qualifying projects than money; the Harbor Island request ranked thirteenth, and only the top nine to ten projects received funding. A separate $1.2 billion Inner Harbor desal project was voted down 6-3 by the Corpus Christi City Council in September 2025 after public opposition over cost and brine-discharge concerns. The council reversed in November and began moving forward with a different vendor. Governor Abbott, for his part, has publicly accused Corpus Christi of \"squandering\" some $750 million in state water funds.",
        ],
        callout: {
          label: "The five plants Corpus Christi has weighed",
          items: [
            { label: "Harbor Island (Port A's door)", value: "$802M · 95.6 MGD brine" },
            { label: "Inner Harbor", value: "$236M · 45 MGD brine" },
            { label: "La Quinta", value: "$457M" },
            { label: "Five-plant total", value: "~$2.6B" },
            { label: "Industrial share of CC water", value: "60–80%" },
          ],
        },
      },
      {
        heading: "The names already on record",
        body: [
          "Port Aransas has not been quiet about Harbor Island. The opposition has been on record — at council meetings, in TCEQ filings, in contested-case testimony — for the better part of a decade.",
          "Mayor Charles Bujan filed the formal TCEQ request that triggered the 2018 public meeting on the Port of Corpus Christi Authority's permit. After hundreds of complaints, TCEQ referred the discharge permit to the State Office of Administrative Hearings — a contested case before two administrative law judges. On February 5, 2021, the SOAH judges recommended that TCEQ deny the permit. Their finding, in the language of the ruling: the Port Authority \"has not met its burden to prove that the proposed discharge will not adversely impact the marine environment, aquatic life, and wildlife, including spawning eggs and larval migration.\"",
          "The Port Aransas Conservancy was the local muscle behind the contested case. PAC president James King called the SOAH ruling \"a huge victory for the city of Port Aransas, our coastal ecosystem, and the folks who love this part of Texas.\" PAC spokesperson Dan Pecore had warned earlier that \"even assuming that tidal action could dissipate much of the excess salinity, the effect on Port Aransas' thriving fishing industry could still be catastrophic.\" PAC filed a Petition for Judicial Review after the contested case concluded; closing arguments on remand ran into 2022.",
          "At the July 19, 2018 city council hearing, the room was already loaded with locals on the record. Scott Holt, a retired fisheries biologist, called the seawater intake \"a serious potential problem\" and warned about larval fish being drawn into the lines. Joan Holt, a marine biologist who served on city council, said of the channel: \"This channel is a really important avenue\" for the species the local economy depends on. Resident Cathy Fulton spoke against the proposal. Council member Beverly Bolner relayed constituent concerns. Councilman Bruce Clark suggested that if the discharge had to go somewhere, it should go offshore into the Gulf — not into the bay.",
          "Port Aransas homeowner Tammy King reminded the room of something older: the 1970s opposition to Deeport, an earlier proposal to make this same channel an industrial deepwater port. Port A had fought a siting fight on this water before. She wasn't quoting it as nostalgia. She was quoting it as precedent.",
        ],
        pullQuote: {
          text: "The facts are the facts. You can't go around those. It's the wrong place.",
          attribution: "James King, Port Aransas Conservancy president",
        },
      },
      {
        heading: "The bay has been here before",
        body: [
          "The deepest local memory in this fight belongs to a man who's been dead for decades. Barney Farley — the tarpon guide who took FDR fishing in 1937 and ran charters out of Port Aransas for more than half a century — wrote it down before he died. The book, \"Fishing Yesterday's Gulf Coast,\" published posthumously by Texas A&M, opens with a line every Port A regular eventually meets:",
          "\"A blindfolded angler could push-pole a rowboat into the bay near Port Aransas in 1910 and catch a hundred pounds or more of trout and redfish within a few hours, using a 20-foot cane pole.\"",
          "Farley arrived in 1910. By the early 1910s he was watching shrimp trawlers move into the Gulf in numbers that would, within a generation, deplete shrimp populations in the bays. By the mid-1960s he was no longer just lamenting the loss — he was on record about the need for conservation, the kind of voice the era didn't yet have a vocabulary for.",
          "The point is not that the bay is the same now as it was in 1910. The point is that the people who fish it, work on it, and live next to it have a hundred-year case file on what happens when industrial decisions get made about this water without their voices in the room. That's the file the Conservancy has been adding to since 2018. It's the file Tammy King invoked when she brought up Deeport. It's the file that will sit underneath every conversation about water on this island as the reservoirs run lower.",
        ],
        pullQuote: {
          text: "A blindfolded angler could push-pole a rowboat into the bay near Port Aransas in 1910 and catch a hundred pounds or more of trout and redfish within a few hours, using a 20-foot cane pole.",
          attribution: "Barney Farley, Fishing Yesterday's Gulf Coast (Texas A&M Press)",
        },
      },
      {
        heading: "What it means for the island",
        body: [
          "Port Aransas is in Nueces County, on the Corpus Christi water system, and inside today's declaration. Stage 3 restrictions apply here: limits on landscape irrigation, vehicle washing, pool refills, and a list of commercial water uses. Hotels, vacation rentals, restaurants, golf cart rental washdowns — all on the inside of those rules.",
          "This is not a tap shutoff. It is a tightening. Visitors arriving for Mother's Day weekend or any time over the coming months should expect drought signage, conservation reminders at properties, and — if September comes without significant rain — the possibility of mandatory 25 percent cuts across all uses.",
          "Port A has been on the dry end of these cycles before. The difference this time is the depth of the reservoirs, the timeline to the next emergency level, and how few of the alternatives — desalination first among them — are anywhere close to ready. The locals who have spent the last several years fighting the wrong-place version of that answer were never wrong about the water needing somewhere to go. They were arguing about where.",
        ],
      },
    ],

    sources: [
      {
        label: "KIII-TV — Nueces County declares local disaster over severe drought and water shortage",
        url: "https://www.kiiitv.com/article/news/local/nueces-county-disaster-declaration-drought-water-shortage-2026/503-ed975d22-72bf-4e3b-a667-7cc95a9d104e",
      },
      {
        label: "Texas Tribune — Corpus Christi delays action on plan to cut water use by 25% if emergency is declared",
        url: "https://www.texastribune.org/2026/04/28/texas-corpus-christi-emergency-water-restrictions/",
      },
      {
        label: "City of Corpus Christi — Water Supply Dashboard",
        url: "https://www.corpuschristitx.gov/department-directory/corpus-christi-water/water-supply-dashboard/",
      },
      {
        label: "KRIS 6 News — Draft presentation projects Corpus Christi water emergency by September",
        url: "https://www.kristv.com/running-dry/draft-presentation-obtained-by-kris-6-projects-corpus-christi-water-emergency-by-september",
      },
      {
        label: "Texas Observer — The Corpus Christi Water Crisis Isn't Exceptional. It's Early",
        url: "https://www.texasobserver.org/corpus-christi-water-crisis-climate-projections/",
      },
      {
        label: "KIII-TV — Corpus Christi Harbor Island water project faces setback after $140M loan denial",
        url: "https://www.kiiitv.com/article/life/local-life/corpus-christi-harbor-island-water-project-faces-setback-after-140m-loan-denial/503-af351e1c-f4bf-4167-9cd0-7f537b22bab0",
      },
      {
        label: "Inside Climate News — Corpus Christi Folds on Its Desalination Gamble",
        url: "https://insideclimatenews.org/news/03092025/corpus-christi-folds-on-its-desalination-gamble/",
      },
      {
        label: "Texas Tribune — Corpus Christi's water supply is uncertain after City Council ends water treatment plans",
        url: "https://www.texastribune.org/2025/09/03/corpus-christi-desalination-water-plans-canceled/",
      },
      {
        label: "KRIS 6 News — Abbott says Corpus Christi 'squandered' $750 million in state water funds",
        url: "https://www.kristv.com/news/local-news/in-your-neighborhood/corpus-christi/abbott-says-corpus-christi-squandered-750-million-in-state-water-funds-heres-what-the-money-actually-is",
      },
      {
        label: "Office of the Governor — Governor Abbott Amends, Renews Drought Disaster Proclamation In April 2026",
        url: "https://gov.texas.gov/news/post/governor-abbott-amends-renews-drought-disaster-proclamation-in-april-2026",
      },
      {
        label: "Port Aransas Conservancy — Desalination Plant",
        url: "https://portaransasconservancy.com/desalination-plant",
      },
      {
        label: "PR Newswire — Port Aransas Conservancy Wins Contested Case Hearing (Feb 5, 2021)",
        url: "https://www.prnewswire.com/news-releases/port-aransas-conservancy-wins-contested-case-hearing-301223355.html",
      },
      {
        label: "KRIS 6 News — Port Aransas Conservancy fighting to block Port of Corpus Christi desalination plant",
        url: "https://www.kristv.com/news/local-news/port-aransas-conservancy-fighting-to-block-port-of-corpus-christi-desalination-plant",
      },
      {
        label: "Sierra Club — In Corpus Christi, Texas, Environmentalists Are Fighting a Slate of Proposed Desalination Plants",
        url: "https://www.sierraclub.org/sierra/2023-2-summer/feature/corpus-christi-texas-environmentalists-are-fighting-desalination",
      },
      {
        label: "Coastal Bend Business News — Harbor Island Desal Plant Now Contested Case",
        url: "https://www.ccbiznews.com/news/harbor-island-desal-plant-now-contested-case",
      },
      {
        label: "Port Aransas South Jetty — Council hears desalination plant proposal (July 19, 2018 hearing)",
        url: "https://www.portasouthjetty.com/articles/council-hears-desalination-plant-proposal/",
      },
      {
        label: "Texas A&M University Press — Fishing Yesterday's Gulf Coast (Barney Farley)",
        url: "https://www.tamupress.com/book/9781603440462/fishing-yesterdays-gulf-coast/",
      },
      {
        label: "Port Aransas Preservation and Historical Association — Fishing Yesterday's Gulf Coast",
        url: "https://portaransasmuseum.org/product/fishing-yesterdays-gulf-coast/",
      },
    ],
  },
  "the-two-port-aransases": {
    lede:
      "On December 30, 2025, the Sonic Drive-In at 1735 State Highway 361 closed for good. The Barnett Group, the franchisee that had opened the location in September 2022, declined to elaborate on the decision. The manager, Christal Pena, put it plainly to the Port Aransas South Jetty: sales weren't strong enough during non-summer months. Ten people lost their jobs.",

    sections: [
      {
        body: [
          "It's easy to read a single closure as bad luck — a franchisee miscalculating, a building in the wrong spot, the peculiar economics of an island. But a national chain with three years of sales history and corporate-grade analytics doesn't pull a drive-thru lightly. When The Barnett Group ran the shoulder-season math, Port Aransas did not pencil.",
          "That is worth paying attention to, because the official story of Port A is that things are good. Hotel occupancy tax revenue in 2023 — the Tourism Bureau's most recent headline — crossed $10.5 million, about a million dollars above 2022. Ferry passengers broke 1.86 million. Website traffic jumped 54 percent. Brett Stawar, the Bureau's president and CEO, told the South Jetty, \u201ceverything was up.\u201d",
          "Both things are true. The Tourism Bureau is not wrong about its numbers. The franchisee is not wrong about its numbers. They are measuring two different places.",
        ],
      },
      {
        heading: "The Frame",
        body: [
          "The Port Aransas that shows up in the Bureau's dashboards — the one marketed to San Antonio, Austin, and Dallas — is growing. Cinnamon Shore North, the planned unit development on the south end of the island, has sold more than $250 million worth of homes and is nearly complete. Sea Oats Group, its developer, announced a $1.3 billion second phase that will eventually stretch the PUD footprint across 300 acres. Phase 5 at Cinnamon Shore South opened to what the developer's press release called \u201csurging demand.\u201d",
          "That same PUD model — a walkable enclave with its own retail, its own amenities, its own brand identity, pitched to buyers from elsewhere — has been replicated twice more on the island. Palmilla Beach, wrapped around an Arnold Palmer\u2013designed golf course, and Sunflower Beach, directly across the street, are built on the same template. All three were master-planned by the same person: Mark Schnell, a land planner headquartered in Santa Rosa Beach, Florida, along Scenic Highway 30A. Schnell's firm imported the 30A aesthetic — the one that transformed that stretch of the Florida panhandle over the last two decades — to the Texas coast, beginning with Cinnamon Shore in 2006. Industry press has already given the result a name: \u201cthe new Texas coast.\u201d",
          "That phrase, repeated in developer marketing, tells you what is being built. It isn't Port Aransas. It's 30A, with Port Aransas in its backyard.",
          "None of that touches the Port Aransas that had a Sonic in it. Or the Port Aransas that has local restaurants, local retail, local rental companies, and local workers driving in from Aransas Pass and Ingleside because they can no longer afford to live on the island they serve. Those two Port Aransases are now far enough apart that the dashboards designed to measure one cannot tell you what is happening in the other.",
          "And when you look at the dashboards that can see both — the ones that measure actual dollars spent at actual businesses — a different picture emerges.",
        ],
        pullQuote: {
          text: "It isn't Port Aransas. It's 30A, with Port Aransas in its backyard.",
        },
      },
      {
        heading: "What the sales tax says",
        body: [
          "The cleanest in-town spending indicator available is the monthly sales tax allocation the Texas Comptroller sends back to the city. Retail, restaurants, bars, services — if a customer pays sales tax at a Port Aransas register, it eventually shows up here. The city's own finances run on this number. The Port Aransas South Jetty publishes the monthly changes.",
          "The year-over-year headlines in 2025 look fine on their face: April 2025 came in 10.89 percent higher than April 2024 ($347,570). May was up 13.28 percent ($387,826). December 2024 jumped more than 25 percent over December 2023 ($268,050). October 2024 was up 12.15 percent ($273,581).",
          "But the trend is not linear. September 2024 came in 13.18 percent below September 2023, at $300,695. And the year-to-date figure the South Jetty cited at that point was minus 0.75 percent — essentially flat.",
          "Flat. While a $1.3 billion development was pouring construction material and contractor purchases through the local tax base. Those purchases — lumber, hardware, equipment rentals, subcontractor supply runs — show up in sales tax allocations the same as a tourist buying a T-shirt. Strip the construction spend out, and the in-town retail economy is not flat. It is shrinking.",
          "That is consistent with what The Barnett Group's spreadsheet showed when it closed Sonic. It is consistent with what property managers on the main drag will tell you about foot traffic. It is consistent with the shoulder-season data every independent restaurant owner watches nervously every winter.",
          "It is not the story the Tourism Bureau is telling. But it is the story the Texas Comptroller is.",
        ],
        callout: {
          label: "Port Aransas sales tax allocation (Texas Comptroller)",
          items: [
            { label: "Sept 2024", value: "$300,695 — down 13.18% YoY" },
            { label: "Oct 2024", value: "$273,581 — up 12.15% YoY" },
            { label: "Dec 2024", value: "$268,050 — up 25.4% YoY" },
            { label: "Apr 2025", value: "$347,570 — up 10.89% YoY" },
            { label: "May 2025", value: "$387,826 — up 13.28% YoY" },
            { label: "YTD through Sept 2024", value: "\u22120.75% (flat)" },
          ],
        },
      },
      {
        heading: "What the HOT tax misses",
        body: [
          "The Tourism Bureau's flagship indicator — the $10.5 million in HOT revenue for 2023 — is collected on every room night in the city. That includes hotels. It also includes short-term rentals at Cinnamon Shore, Palmilla Beach, and Sunflower Beach, every condo in the PUDs, every vacation home on the island. A week booked at a Cinnamon Shore house counts in HOT exactly the same as a week at a locally-owned inn downtown.",
          "So when HOT is up, the Bureau is technically correct that tourism is up. But the Bureau does not break out which portion of that revenue came from PUD lodging and which came from town lodging. It does not need to, for its purposes. It is selling the island as a single product.",
          "For the businesses that don't live inside a PUD — the restaurants, the shops, the service providers — the distinction is everything. A guest staying at Cinnamon Shore has a private beach, a restaurant on property, a pool, a bike share, a marina. A guest staying downtown walks out the door onto Alister Street. One of those guests is very likely to spend money at a Port Aransas business. The other is not required to.",
          "HOT does not see the difference. Sales tax does.",
        ],
      },
      {
        heading: "What the housing market is doing",
        body: [
          "The same split shows up in the housing numbers.",
          "Listing data pulled in April 2026 shows a median list price of $649,000 in Port Aransas — down roughly 7 percent year over year, with a median 89 days on market. And yet the median sale price figure, as reported by Redfin earlier in 2025, climbed more than 20 percent year over year, with sales volume up materially — 696 homes sold in July 2025 against 519 the year before.",
          "Those two statements do not contradict each other. They describe two different inventories.",
          "The sales are happening in the PUDs. At Cinnamon Shore, a captive brokerage runs its own sales team, its own events, its own release schedule. Palmilla Beach and Sunflower Beach operate the same way. When Sea Oats opens a new phase and moves two dozen lots in a weekend, that shows up in county records as closed volume. It inflates the median sale price because PUD product is, on average, newer, bigger, and more expensive than what else sells on the island.",
          "The listings, meanwhile, are sitting. Town houses and condos are on the market for three months. Sellers are holding out for pandemic-era prices. Buyers are not biting. The market is not correcting — it is stuck. Prices are slowly easing on paper, but the velocity required for real price discovery isn't there. That stuck market, not the headline median, is the real condition of in-town real estate.",
          "A town can survive a flat housing market. A town survives a frozen one for a while, and then it doesn't.",
        ],
      },
      {
        heading: "What the school enrollment says",
        body: [
          "Port Aransas Independent School District is a small, high-performing district of three campuses. Its most recent reported enrollment is 524 to 527 students, essentially flat over the past several years.",
          "That number is the single best proxy we have for the year-round, family-holding population of the island. Second homes don't bring students. Short-term rentals don't bring students. Vacation buyers at Cinnamon Shore, overwhelmingly, do not enroll their kids in H.G. Olsen Elementary.",
          "When a $1.3 billion development expansion is underway on your city's edge and your school enrollment is flat, you are not growing. You are rotating. Permanent residents — the ones who spend every paycheck here, who serve on boards, who attend council meetings, who patronize the Sonic and the hardware store and the hair salon — are being replaced at roughly the same rate by second-home owners who spend their paychecks somewhere else.",
          "PAISD has responded the way any small district must: it accepts out-of-district transfers to meet enrollment thresholds. That is not a failing; it is a reasonable administrative move. But it is a tell. A growing town fills its school from within.",
        ],
      },
      {
        heading: "What the ferry tells us, and what it doesn't",
        body: [
          "The Bureau cites 1.86 million ferry passengers as a tourism win, and it is one. But ferry traffic measures arrivals, not spending. A day-tripper drives across, parks on the beach, pays whatever the city's parking regime charges that day, eats the sandwich they brought from home, drives back across. They do not appear in sales tax. They do not book a hotel room. They do not patronize the businesses that are closing.",
          "This is not a new phenomenon. It is what happens when the cost of staying in a place climbs faster than the cost of visiting it for an afternoon. Port Aransas has become, in the aggregate, a place you beach at, not a place you shop at. That shift is measurable in the gap between a booming ferry number and a flat in-town sales tax receipt.",
        ],
      },
      {
        heading: "The Historical Pattern",
        body: [
          "Port Aransas has been through this before. The island has been built, destroyed, and rebuilt repeatedly — in the great storms of 1875 and 1919, in Hurricane Celia in 1970, through the 2000s cycle of named storms, and again after Harvey in 2017. Each rebuild has one thing in common. The capital that comes in to rebuild does not flow back to the same people who were there before. Prices reset. The town changes hands. The workers who put the roofs back on increasingly cannot live under those roofs.",
          "The current cycle began with Harvey's reported $45 million in municipal damage and the insurance and federal capital that followed. Cinnamon Shore's South expansion accelerated in its wake. The PUD model — insulated from town infrastructure, sold to buyers from elsewhere, operated by captive realtors and captive amenities — fits the post-disaster rebuild incentive structure almost too neatly.",
          "What is new is the scale. $1.3 billion is not a cycle of rebuilding. It is a different order of development. And the lag between when that capital arrives and when the local economy it displaces starts to visibly fail is roughly what we are watching now: a Sonic shuttering on a Tuesday after the Christmas week crowd leaves, while a few miles south, a fifth phase of new construction breaks ground.",
        ],
      },
      {
        heading: "What the numbers will not tell the Bureau",
        body: [
          "The Tourism Bureau's job is to bring people to the island. It is measurably doing that. By its own metrics, it is succeeding: ferry counts up, website traffic up, social reach up, HOT up. None of those numbers are fabricated. None of them are even misleading, for the purpose they are designed to serve.",
          "But a tourism bureau — any tourism bureau — cannot be the body that notices when the economic life of the town it advertises is being hollowed out behind the storefronts. Its dashboards were not built for that. It is not equipped for that. This is not a failure of its leadership. It is a structural limit of what a chamber-and-bureau is designed to measure, and of the questions a tourism job is paid to answer.",
          "The number that would tell us the most — sales tax per capita in Port Aransas, adjusted to remove construction material purchases, compared against in-town commercial vacancy and PAISD enrollment — does not exist in any public dashboard. It would have to be assembled. It would take work. It would raise uncomfortable questions.",
          "Someone should do it.",
        ],
      },
      {
        heading: "The stakes",
        body: [
          "The question Port Aransas is actually answering right now, slowly and in small increments, is this: does a town exist when the houses on its streets are owned by people who don't live there, when the businesses on its main drag can't cover their rent, when the school keeps its lights on by importing students from the mainland, and when the headline metrics all look fine?",
          "Plenty of places on the Texas coast have already answered no. A handful have answered yes — but only because they noticed in time.",
          "Port Aransas has noticed the Sonic. It has not yet, collectively, noticed the pattern the Sonic is part of. That is partly because the pattern is hard to see in the indicators everyone is used to watching. And it is partly because the people whose professional job is to watch the island's fortunes are watching a different Port Aransas than the one the town's residents actually live in.",
          "Both islands are real. But only one of them has children in the school.",
        ],
      },
    ],

    sources: [
      {
        label:
          "Port Aransas South Jetty — \u201cSonic shuts down\u201d (closure details, Christal Pena and Barnett Group attribution)",
        url: "https://www.portasouthjetty.com/articles/sonic-shuts-down/",
      },
      {
        label:
          "Port Aransas South Jetty — \u201cPort A tourism strong in 2023\u201d (Brett Stawar quotes, HOT revenue, ferry and visitor figures)",
        url: "https://www.portasouthjetty.com/articles/port-a-tourism-strong-in-2023/",
      },
      {
        label:
          "Port Aransas South Jetty — \u201cSales tax allocation drops\u201d (Sept 2024 data, YTD \u22120.75%)",
        url: "https://www.portasouthjetty.com/articles/sales-tax-allocation-drops-2/",
      },
      {
        label:
          "Port Aransas South Jetty — \u201cSales tax allocation rises\u201d (May 2025 data)",
        url: "https://www.portasouthjetty.com/articles/sales-tax-allocation-rises-2/",
      },
      {
        label:
          "Port Aransas South Jetty — \u201cSales tax allocation increases\u201d (April 2025 data)",
        url: "https://www.portasouthjetty.com/articles/sales-tax-allocation-increases/",
      },
      {
        label:
          "Port Aransas South Jetty — \u201cPort A sales tax revenue leaps\u201d (Dec 2024 data)",
        url: "https://www.portasouthjetty.com/articles/port-a-sales-tax-revenue-leaps/",
      },
      {
        label:
          "Port Aransas South Jetty — \u201cOctober sales generate increase in allocation for Port A coffers\u201d (Oct 2024 data)",
        url: "https://www.portasouthjetty.com/articles/october-sales-generate-increase-in-allocation-for-port-a-coffers/",
      },
      {
        label: "Texas Comptroller of Public Accounts — Sales Tax Allocation Payment Distribution",
        url: "https://comptroller.texas.gov/transparency/local/allocations/sales-tax/distribution-schedule.php",
      },
      {
        label:
          "PR Newswire via CityBuzz — \u201cSea Oats Group Announces $1.3 Billion Phase II Expansion of Cinnamon Shore\u201d",
        url: "https://houston.citybuzz.co/article/424454/sea-oats-group-announces-13-billion-phase-ii-expansion-of-cinnamon-shore-on-the-texas-gulf-coast",
      },
      {
        label:
          "PR Newswire — \u201cBrand-New Phase 5 Now Open at Cinnamon Shore South To Meet Surging Demand\u201d",
        url: "https://www.prnewswire.com/news-releases/brand-new-phase-5-now-open-at-cinnamon-shore-south-to-meet-surging-demand-301303597.html",
      },
      {
        label:
          "Schnell Urban Design (Mark Schnell's firm, Santa Rosa Beach, FL \u2014 30A)",
        url: "https://schnellurbandesign.com/about/",
      },
      {
        label:
          "Palmilla Beach \u2014 Developer & Builders page (Mark Schnell planning credit)",
        url: "https://www.palmillabeach.com/developer-builders/",
      },
      {
        label:
          "Texas Island Properties \u2014 \u201cThe New Texas Coast on Mustang Island\u201d (Cinnamon Shore, Palmilla Beach, Sunflower Beach framing)",
        url: "https://www.texasislandproperties.com/the-new-texas-coast",
      },
      {
        label:
          "Redfin \u2014 Port Aransas Housing Market (April 2026 snapshot; July 2025 volume)",
        url: "https://www.redfin.com/city/15223/TX/Port-Aransas/housing-market",
      },
      {
        label:
          "Texas Tribune \u2014 Port Aransas ISD enrollment and district data",
        url: "https://schools.texastribune.org/districts/port-aransas-isd/",
      },
      {
        label:
          "Port A Local Heritage \u2014 \u201cBuilt, Destroyed, Rebuilt\u201d (historical rebuild cycles and displacement)",
        url: "https://theportalocal.com/history/storms-of-port-aransas",
      },
      {
        label:
          "Port A Local Heritage \u2014 \u201cThe Development Question\u201d (Cinnamon Shore Phase II, Beach Access 1B, Harvey context)",
        url: "https://theportalocal.com/history/cinnamon-shore-tension",
      },
    ],
  },
};
