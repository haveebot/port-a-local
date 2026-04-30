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
