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
