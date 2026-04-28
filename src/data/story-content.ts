/**
 * Story content for Port A Heritage pages.
 * Each story is keyed by slug and contains structured sections
 * that the [slug] page renders into a long-form editorial layout.
 */

export interface StorySection {
  /** Optional section heading */
  heading?: string;
  /** Body paragraphs (rendered as <p> tags) */
  body: string[];
  /** Optional pull quote displayed between paragraphs */
  pullQuote?: { text: string; attribution?: string };
  /** Optional fact sidebar */
  fact?: { label: string; value: string }[];
}

export interface StoryContent {
  /** Opening hook paragraph — larger text, no heading */
  lede: string;
  /** Structured body sections */
  sections: StorySection[];
  /** Sources for the story */
  sources: { label: string; url?: string }[];
  /** "What to see today" — connecting history to the present */
  visitToday?: { place: string; detail: string; slug?: string }[];
}

export const storyContent: Record<string, StoryContent> = {
  "fdr-tarpon-port-aransas": {
    lede: "On the afternoon of May 8, 1937, President Franklin Delano Roosevelt sat in the fighting chair of a wooden fishing boat off the coast of Port Aransas, Texas. His guide was Barney Farley, the island's most famous tarpon man. At exactly 3:27 PM, Roosevelt landed a five-foot, 77-pound silver king — and the photograph that followed would become one of the most iconic images in American sport fishing history. The signed tarpon scale still hangs in the Tarpon Inn lobby today.",

    sections: [
      {
        heading: "Why FDR Came to Port Aransas",
        body: [
          "Roosevelt needed to disappear. Back in Washington, his Judicial Procedures Reform Bill — the infamous \"court-packing\" plan to expand the Supreme Court from 9 to 15 justices — was generating fierce political headwinds. Despite winning a landslide reelection in 1936, FDR was losing the public relations battle. His staff arranged 10 days of fishing on the Texas coast. The official story was recreation. The real story was survival.",
          "His son Elliott Roosevelt had visited Port Aransas in 1936, likely scouting it for exactly this purpose. The island had everything FDR needed: world-class tarpon fishing, distance from the press corps, and a community that knew how to host famous visitors without making a fuss.",
        ],
      },
      {
        heading: "The Journey South",
        body: [
          "FDR left the White House on the evening of April 27, 1937. His special train departed Washington the next morning, heading south. On April 29, the party stopped in New Orleans for lunch at Antoine's Restaurant with Louisiana Governor Richard Leche and Mayor Robert Maestri. The famous anecdote from that meal: Mayor Maestri, lacking the polish of Washington dinners, supposedly asked the President of the United States, \"How ya like dem ersters?\"",
          "That evening the presidential party boarded the destroyer USS Moffett, anchored in the Mississippi River. Escorted by the USS Decatur, they steamed into the Gulf of Mexico. On May 1, they arrived off Aransas Pass and transferred to the presidential yacht USS Potomac, which anchored in the mouth of the Lydia Ann Channel.",
        ],
      },
      {
        heading: "The Fishing",
        body: [
          "The first few days produced mixed results. The party caught 12 tarpon on May 3, and FDR hooked his first off the south jetty. But the real problem was the boat. FDR's own 35-foot vessel was too large and unwieldy for the choppy Aransas Pass conditions. A local captain suggested what every Port Aransas guide already knew: you needed a Farley boat.",
          "Barney Farley's nephew Don brought a Farley-built craft to the presidential fleet. The boats the Farley family built were designed specifically for these waters — V-bottom hulls with a hard chine that handled chop, low sides for landing fish, and high bows to combat the surf. They were the right tool for the job.",
        ],
        pullQuote: {
          text: "No blueprints. No formal plans. The Farleys sketched their designs directly on the wood flooring of their shop using colored carpenter's crayon.",
        },
      },
      {
        heading: "3:27 PM, May 8, 1937",
        body: [
          "On his final fishing day, FDR went out with two of Port Aransas's finest: Ted Mathews at the helm and Barney Farley Sr. handling the boat. They worked the waters about half a mile off the bow of the Potomac.",
          "At 3:27 in the afternoon, Roosevelt hooked and landed a five-foot, 77-pound tarpon. Newsreel photographers and press in a nearby boat captured the moment. The iconic photograph shows Barney Farley in the boat with Elliott Roosevelt behind him, holding up the silver king. The fish was a trophy. But for Port Aransas, it was something more — it was proof, in the national press, that this little island on the Texas coast was a world-class fishing destination.",
          "Sid Richardson, the Texas oil wildcatter who owned St. Joseph Island across the channel, paid the guide fees for the day.",
        ],
      },
      {
        heading: "The Bull Chute",
        body: [
          "The trip wasn't all fishing. On May 7, FDR toured Sid Richardson's game preserve on St. Joseph Island, which featured longhorn cattle, buffalo, and hunting grounds. The problem: there was no proper dock. Richardson proposed using a cattle loading chute to get the wheelchair-bound president onto the island.",
          "FDR looked at the chute and said: \"What in the world, Sid; do you mean you're going to roll me down that bull chute?\" Richardson replied: \"Why, Mr. President, you're the biggest bull that ever went down that chute!\"",
          "After St. Joseph Island, the group crossed Cedar Bayou at low tide to Clint Murchison's 13,000-square-foot home on Matagorda Island for mint juleps on the veranda.",
        ],
      },
      {
        heading: "A Young Congressman on the Dock",
        body: [
          "On May 11, the Potomac arrived in Galveston to a 21-gun salute from Fort Crockett. Waiting on the dock was a freshly elected 28-year-old Congressman from Texas named Lyndon Baines Johnson. LBJ had just won a special election running on a pro-court-packing platform — one of the few candidates in the country willing to publicly support FDR's embattled plan.",
          "Johnson rode with Roosevelt on the train from Galveston to College Station. It was the beginning of a political relationship that would shape Texas and American politics for the next three decades. Two future presidents, linked by a fishing trip to a barrier island.",
        ],
      },
      {
        heading: "The Scale That Survived Everything",
        body: [
          "Following the local custom, FDR signed a tarpon scale from his May 8 catch. That scale was mounted in the lobby of the Tarpon Inn, joining over 7,000 others — a tradition stretching back to at least 1892.",
          "FDR never actually slept at the Tarpon Inn. He stayed aboard the USS Potomac in the Lydia Ann Channel. But his signed scale became the most famous artifact in the building. It has survived Hurricane Celia in 1970, which closed the Inn for five years, and Hurricane Harvey in 2017, which flooded the bottom floor with an 8-foot storm surge. The lobby walls held. The scales survived. Roosevelt's signature is still there.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas South Jetty — \"Fishing with the President\"", url: "https://www.portasouthjetty.com/articles/fishing-with-the-president/" },
      { label: "USS Potomac Association — FDR's Texas Fishing Trip", url: "https://usspotomac.org/fdrs-texas-fishing-trip-may-1937/" },
      { label: "Sid Richardson Museum — Sid Richardson Hosts the President", url: "https://sidrichardsonmuseum.org/sid-richardson-hosts-the-president/" },
      { label: "FDR Presidential Library Blog", url: "https://fdr.blogs.archives.gov/2011/08/16/from-the-museum-19/" },
      { label: "Texas Archive of the Moving Image — FDR Battles Big Tarpon (1937)", url: "https://texasarchive.org/2006_00043" },
      { label: "Barney Farley, Fishing Yesterday's Gulf Coast (Texas A&M University Press, 2008)" },
      { label: "Hart Stilwell, Glory of the Silver King (Texas A&M University Press, 2011)" },
    ],

    visitToday: [
      { place: "Tarpon Inn", detail: "FDR's signed tarpon scale is displayed in the lobby. The 7,000+ scale collection survives from the 1890s through today." },
      { place: "Farley Boat Works", detail: "The shop where FDR's fishing boat was built. Now a working museum and boat-building school at 716 W. Avenue C." },
      { place: "Port Aransas Museum", detail: "Houses the Tarpon Era exhibit, 1920s film footage, and the Fresnel lens from the Lydia Ann Lighthouse." },
    ],
  },

  "farley-boat-works": {
    lede: "In 1914, a master craftsman from Birmingham, Alabama named Fred Farley moved his wife Mabel and their sons to a barrier island on the Texas coast. His brother Barney, already a tarpon fishing guide, had written to him about the untapped market: local guides desperately needed reliable powerboats for the choppy waters of Aransas Pass, and nobody was building them. Fred set up shop on the waterfront. He never drew a blueprint. He sketched his designs directly on the wood flooring with colored carpenter's crayon. For the next sixty years, three generations of Farleys built what many consider the first production sport fishing boats in America.",

    sections: [
      {
        heading: "The Brothers from Alabama",
        body: [
          "The Farley brothers traveled from Alabama to the Gulf Coast — at least four brothers in all, though only Fred and Barney are prominently associated with Port Aransas. Barney arrived around 1910 as an aspiring tarpon fishing guide. He was sixteen years old. Within a few years he had become one of the island's most skilled guides and a civic leader.",
          "Fred was the craftsman. Before Port Aransas, he'd lived in Rockport, building utility boats, lighthouses, and ornate bars. He was an experienced woodworker who could look at a piece of water and design a hull to match it. When Barney described the conditions at Aransas Pass — the chop, the current, the size of the tarpon — Fred knew exactly what to build.",
        ],
        fact: [
          { label: "Founded", value: "1914" },
          { label: "First boat launched", value: "1915" },
          { label: "Business name", value: "Farley and Son, Boat Builders" },
          { label: "Closed", value: "~1973-1975" },
          { label: "Revived", value: "2011 by PAPHA" },
        ],
      },
      {
        heading: "No Blueprints",
        body: [
          "The Farleys never created formal plans. Designs were sketched directly on the wood flooring of their shop using colored carpenter's crayon. When a prospective buyer came in, they'd walk them across plywood sheets laid on the floor with the boat's lines drawn out in full scale. Custom modifications were demonstrated through hand-carved half-models — small wooden boat halves that showed exactly how the finished hull would look.",
          "Each Farley boat was essentially custom-built. The signature design was an 18-footer for two people, but they built everything from 16-foot tarpon boats to 28-foot offshore cruisers. In the 1920s, they even built a speedboat for Gail Borden Munsill of the Borden dairy empire — capable of 60 miles per hour.",
        ],
        pullQuote: {
          text: "God wanted fiberglass boats, He would have made fiberglass trees.",
          attribution: "The Farley family, on why they never switched materials",
        },
      },
      {
        heading: "Built for Aransas Pass",
        body: [
          "Farley boats were designed for one specific set of conditions: the choppy, current-driven waters at the mouth of Aransas Pass where the tarpon ran. The hulls were V-bottomed with a hard chine — angular, not rounded. The chine didn't touch water until well aft of the bow. Low sides with rounded tumblehomes made it easier to lean over and land a fighting tarpon. High bows combated the choppy seas. Open cockpits with stern-facing fighting chairs. Front windshields with opening hatches.",
          "The materials evolved with the times. Before World War II, Farley used 5/8-inch-thick top-grade cypress planks — light and incredibly durable. When cypress became scarce after the war, they switched to Honduran and Philippine mahogany. The engines were never marine motors. They were converted automobile engines: Chrysler flatheads, Fords, Chevrolets. Some customers supplied their own.",
        ],
      },
      {
        heading: "Four Locations, Four Disasters",
        body: [
          "The boat works operated from four different locations over sixty years, and the reason for each move tells its own story. The original waterfront shop, southeast of the Coast Guard station, was destroyed by the devastating 1919 hurricane that brought a 12-to-15-foot storm surge and essentially wiped out the entire town.",
          "After 1919, the Farleys rebuilt inland, east of the Tarpon Inn, fortifying the new shop with shellcrete siding. Post-World War II, operations moved to White Street and Mercer Street, where Jim Farley built the Tina. The final location, 716 West Avenue C, operated from about 1968 until the family closed the business.",
        ],
      },
      {
        heading: "A President's Boat",
        body: [
          "In May 1937, President Franklin Roosevelt came to Port Aransas to fish for tarpon. After unsuccessful outings on his own 35-foot vessel, a local captain suggested switching to a Farley boat. On May 8, fishing with Barney Farley Sr. as guide, FDR landed a 77-pound tarpon at 3:27 PM. He was reportedly so pleased that he returned later that same year.",
          "The FDR connection cemented the Farley reputation. But the boats had already earned their place. They were widely regarded as the first production sport fishing boats built on the Gulf Coast, if not the first in the United States. No formal dispute of that claim has ever been found.",
        ],
      },
      {
        heading: "The Tina's Fifty-Year Journey",
        body: [
          "The Tina is the only complete original Farley hull known to survive. Jim Farley built it around 1947 for Sam Cone, a wealthy angler, who named it after his wife. After Sam and Tina divorced, Cone stored the boat in a barn at Avenue B and Trojan Street. It sat there for nearly fifty years.",
          "The Tina then passed through five owners: Rick Pratt, David Loese in Buda, Steve Loese in Bastrop, Jeff Morehouse in San Antonio (who commissioned a restoration by Ron Blue in Rockport), and Ned Teller. Keith Farley — Fred's grandnephew, who traces the Farley family in America back to 1622 — located the boat in Rockport. On May 26, 2007, Keith, Barney Farley III, John Studeman, and Thomas Teller transported it back to Port Aransas. It was refurbished in 2012 and now sits on display at Farley Boat Works.",
        ],
      },
      {
        heading: "The End of an Era",
        body: [
          "The Farleys closed sometime between 1973 and 1975. The cause was simple and irreversible: fiberglass. Mass-produced synthetic boats were cheaper, faster to build, and required less maintenance. The Farleys could not compete with factories. They never tried. They never switched materials.",
          "After the Farleys closed, the Avenue C building housed Steve's Boat Works, then Camric Boats. By 2011, the building was deteriorating.",
        ],
      },
      {
        heading: "The Revival",
        body: [
          "In 2011, the Port Aransas Preservation and Historical Association purchased 716 West Avenue C for $200,000 — the largest purchase in PAPHA's history. They renovated the building, retooled the machine shop, and gathered volunteers.",
          "The key to the revival was a man named Doyle Marek. Born in 1932 in Robstown, Marek had taught at Port Aransas ISD for 36 years. During the 1970s through 1990, he'd created a boat-building program at the local schools where students built 51 wooden boats and won 15 awards. In 2012, at the age of 80, Marek came out of retirement to provide inaugural instruction at the revived Farley Boat Works, free of charge, to over 40 volunteers. He and his friend Will Mayfield built two skiffs. The \"Marek Skiff\" — now called the \"Port A Skiff\" — became the signature boat of the revival.",
          "Since 2011, over 130 wooden boats have been built at Farley Boat Works. The core builders are volunteers — many of them Winter Texans whose spouses describe the shop as a \"husband daycare center.\" The shop charges for space and materials but provides free instruction. It is, in every sense, a living museum.",
        ],
        pullQuote: {
          text: "Doyle Marek taught boat building at Port Aransas schools for 36 years. His students built 51 wooden boats and won 15 awards. Then, at 80, he came out of retirement to relaunch Farley Boat Works.",
        },
      },
      {
        heading: "What's Being Built Now",
        body: [
          "Today Farley Boat Works builds Port A Skiffs (flat-bottomed plywood fishing boats, 14 to 20 feet), kayaks, paddleboards, rowboats, kit boats, Core Sound 20 sailboats, and Scamp sailboats. The annual Wooden Boat Festival — held every October at Roberts Point Park since 2014 — features a competition where five families race to build a 14-foot Port A Skiff in three days.",
          "On the grounds, a 60-foot replica scow schooner named the Lydia Ann has been under construction since 2015. When completed, it will be the only Texas scow schooner in existence. It survived Hurricane Harvey in 2017 nearly unscathed. The Preserve — a 6,000-square-foot maritime museum on the same campus — is nearing completion and will house the Tina, the Starfish (a 28-foot original Farley from the late 1960s), and the McKee Collection of antique fishing tackle.",
        ],
      },
    ],

    sources: [
      { label: "PAPHA — History of Farley Boat Works", url: "https://portaransasmuseum.org/history-of-farley-boat-works/" },
      { label: "Farley Boats — Wikipedia", url: "https://en.wikipedia.org/wiki/Farley_Boats" },
      { label: "Port Aransas South Jetty — Most Historical Boat", url: "https://www.portasouthjetty.com/articles/most-historical-boat-farley-boat-works/" },
      { label: "Port Aransas South Jetty — Tina Comes Home", url: "https://www.portasouthjetty.com/articles/tina-comes-home/" },
      { label: "Port Aransas South Jetty — Beloved Mentor (Doyle Marek)", url: "https://www.portasouthjetty.com/articles/beloved-mentor/" },
      { label: "Texas Highways — Farley Boat Works Maritime Museum Expansion", url: "https://texashighways.com/travel-news/farley-boat-works-a-historic-link-to-port-aransas-tarpon-fishing-heyday-is-expanding-into-a-maritime-museum/" },
      { label: "Austin Chronicle — Rick Pratt School of Wooden Boat Building", url: "https://www.austinchronicle.com/columns/2019-10-25/day-trips-rick-pratt-school-of-wooden-boat-building-port-aransas/" },
    ],

    visitToday: [
      { place: "Farley Boat Works", detail: "716 W. Avenue C. Open Tue-Fri 9AM-4PM, Sat 10AM-2PM. Watch volunteers build boats, see the Tina on display." },
      { place: "The Preserve (opening soon)", detail: "6,000 sq ft maritime museum adjacent to the boat works. Will house the McKee tackle collection and historic Farley boats." },
      { place: "Wooden Boat Festival", detail: "Annual three-day event at Roberts Point Park every October. Five families compete to build a boat in three days." },
    ],
  },

  "hurricane-celia": {
    lede: "At approximately 4:00 PM on August 3, 1970, the eye of Hurricane Celia passed directly over Port Aransas. What followed was not a typical hurricane. Celia's worst damage came from a series of microbursts and downbursts — most packed into a 15-minute span — that survivors independently compared to rocket shells exploding. When it was over, 75% of Port Aransas homes and businesses were damaged. One-third of the town had simply ceased to exist. The Tarpon Inn closed for five years. The fishing fleet was scattered across the county. And the community that rebuilt itself in the aftermath set the template for how Port Aransas would respond to every storm that followed.",

    sections: [
      {
        heading: "The Storm That Fooled Everyone",
        body: [
          "Celia formed as a tropical depression west of the Cayman Islands on July 30. By August 1, it had become a tropical storm entering the Gulf after clipping western Cuba. It rapidly intensified — the pressure dropped 25 millibars in just eight hours. Then it weakened in wind shear, dropping to 90 mph, and forecasters predicted it would turn northward. Some families on the island decided to stay.",
          "They were wrong. On the morning of August 3, Celia underwent a second rapid intensification that was virtually unprecedented. The pressure plummeted 44 millibars in 15 hours — from 988 to 944 millibars. By the time it made landfall near Aransas Pass, it carried sustained winds between 125 and 140 miles per hour, with gusts estimated at 180 mph.",
        ],
        fact: [
          { label: "Category", value: "3-4 (debated; NOAA reanalysis says Cat 4)" },
          { label: "Sustained winds", value: "125-140 mph" },
          { label: "Gusts", value: "Up to 180 mph" },
          { label: "Storm surge", value: "9.2 feet at Port Aransas Beach" },
          { label: "Total damage", value: "$930 million (1970) / ~$3.1 billion (2020)" },
          { label: "Deaths", value: "15 in South Texas; 28 total" },
        ],
      },
      {
        heading: "The Microbursts",
        body: [
          "What made Celia scientifically unique — and personally terrifying — were the microbursts. Dr. Robert Simpson, director of the National Hurricane Center, later described them as \"a succession of long streaks of heavy damage\" with \"small pockets of high energy winds radially spaced from north to south at interval lengths of a mile or more\" that \"raked across Corpus Christi from west to east.\"",
          "This is why one house was completely gone while the house next door stood untouched. Survivors independently compared the experience to tornado strikes rather than typical hurricane damage. Jim Cole described the damage pattern as \"two tornadoes went across town, like an X.\" Bill Behrens put it more simply: about one-third of the town had minor damage, one-third had major damage, and in the last third, \"all that was left was just pilings, the deck, and the commode.\"",
        ],
        pullQuote: {
          text: "About one-third of the town had minor damage. In the last third, all that was left was just pilings, the deck, and the commode.",
          attribution: "Bill Behrens, Port Aransas resident",
        },
      },
      {
        heading: "The Island After the Eye",
        body: [
          "The damage was staggering. The roof of Family Center IGA was completely torn away. The exterior wall of Port Aransas Mercantile was destroyed — but merchandise still sat on the shelves inside. The Seahorse Lodge cottages were stripped of their roofs. Aluminum boats were found wrapped around power poles. A 55-gallon drum of oil crashed through Totsy Belcher's front door.",
          "The Marlin Queen, a 65-foot party boat, was blown from her moorings, floated over a parking lot on the surge, and was impaled on pilings as the water receded. Annetta Milina's father's charter boat was split in half across Cut-off Road — the bow on one side, the stern on the other. Boats were blown as far as the Portland Causeway.",
          "The Tarpon Inn, built by James M. Ellis in 1925 with pine poles sunk in 16 to 20 feet of concrete, survived but was badly damaged. It would take five years and a change of ownership before it reopened in 1975. The famous tarpon scales in the lobby — including FDR's — survived.",
        ],
      },
      {
        heading: "What the Survivors Remember",
        body: [
          "Dee Wallace was 15 years old. She sheltered under a mattress in the bathroom with water up to her chin, holding her floating brother's head above the water, glass embedded in her back.",
          "Macky Ward was 9. He remembered the eye: \"Just a gray color to the sky, there were no clouds and it was perfectly calm and eerie.\"",
          "Billy Gaskins was 14. He was inside the IGA grocery store when the roof lifted off. After the storm, he found his dog and his monkey alive.",
          "DeLana Littleton was 18. Her home was reduced to \"just a concrete slab.\" But in another house nearby, a whiskey cup sat undisturbed on a pool table despite the roof being gone.",
          "Johnny Roberts watched his roof \"beginning to breathe up and down\" before retreating to an underground garage called Summer Place.",
        ],
      },
      {
        heading: "Pearl Beer and Community Barbecues",
        body: [
          "In the days after Celia, Port Aransas had no electricity, no potable water, and no air conditioning in the Texas August heat. Sand covered every street. Mosquitoes were relentless. Residents slept outdoors.",
          "The Pearl Beer brewery in San Antonio bottled drinking water in beer bottles and shipped them to the island. Volunteers at the ferry landing appeared to be drinking beer but were actually drinking water from Pearl bottles.",
          "The Red Cross set up at the Community Center distributing ice, water, and meals. The Seventh-day Adventist Church served free hot meals every night. The National Guard deployed for search and rescue. And across the island, families pulled freezer food outside and cooked it communally before it spoiled — the first of many community barbecues that would become a Port Aransas tradition in the aftermath of every storm.",
          "The ferries had been relocated to Corpus Christi for protection before landfall. With no ferry service and bridges along Island Road washed out, the island was cut off. Butch Ousley piloted his headboat Lady Lorene from Port Aransas to Harbor Island to ferry stranded evacuees back — the island's lifeline in those first critical days.",
        ],
      },
      {
        heading: "The Cost of Coming Back",
        body: [
          "Celia caused $930 million in damage in 1970 dollars — approximately $3.1 billion adjusted to 2020. At the time, it was the costliest tropical cyclone in Texas history. President Nixon declared a dozen counties disaster areas.",
          "Many Port Aransas residents could not afford to rebuild. Properties were abandoned. Federal trailers were distributed — Jane Thompson, a first-grade teacher, lived in a Mobile Scout camper for five months. Returning residents were required to get vaccinations before re-entry. The town generally stabilized by 1972, two full years after the storm.",
          "Dan Parker was 9 years old during Celia. He still lives in the same house. Alex Porter was 13 — he grew up to become one of Port Aransas's most respected fishing guides.",
        ],
      },
      {
        heading: "Hurricane Junction",
        body: [
          "Port Aransas has experienced 43 hurricanes since 1930. The book \"Hurricane Junction: A History of Port Aransas\" by Cyril Matthew Kuehne takes its title from this fact. The major destructive sequence runs: 1916, 1919, 1961 (Carla), 1970 (Celia), and 2017 (Harvey).",
          "The 1919 hurricane was worse by every measure. The surge reached 12 to 15 feet. Oil tanks ruptured and victims were swept into the bay coated in heavy crude oil. The death toll may have exceeded 1,000. The town was depopulated and had to be resettled from scratch.",
          "Hurricane Harvey in 2017 damaged 100% of Port Aransas businesses and 85% of homes. But the pattern Celia established — community barbecues, neighbor helping neighbor, the refusal to leave permanently — held. Each rebuilding cycle, though, comes with a cost that isn't measured in dollars: the destruction of affordable housing pushes low-income residents off the island for good, making the town a little wealthier, a little less diverse, and a little less like the place it used to be.",
        ],
        pullQuote: {
          text: "Everyone pulled together, neighbors jumped in and helped each other.",
          attribution: "Jane Thompson, Celia survivor",
        },
      },
    ],

    sources: [
      { label: "NWS Corpus Christi — Hurricane Celia", url: "https://www.weather.gov/crp/hurricanecelia" },
      { label: "Port Aransas South Jetty — \"Celia: Blown Away\"", url: "https://www.portasouthjetty.com/articles/celia-blown-away/" },
      { label: "Port Aransas South Jetty — \"Celia recalled 50 years later\"", url: "https://www.portasouthjetty.com/articles/celia-recalled-50-years-later/" },
      { label: "Port Aransas South Jetty — \"Surviving Hurricane Celia\"", url: "https://www.portasouthjetty.com/articles/surviving-hurricane-celia/" },
      { label: "Wikipedia — Hurricane Celia", url: "https://en.wikipedia.org/wiki/Hurricane_Celia" },
      { label: "Cyril Matthew Kuehne, Hurricane Junction: A History of Port Aransas (St. Mary's University, 1973)" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "Houses a 1940s Farley boat wrecked by Celia, plus oral histories from survivors." },
      { place: "Tarpon Inn", detail: "Damaged by Celia, closed 5 years, rebuilt. The 7,000+ tarpon scales survived. FDR's scale is still there." },
      { place: "Farley Boat Works", detail: "Flying debris during Celia ruined a boat on cement blocks. The 1919 hurricane had already driven the Farleys inland." },
    ],
  },

  "tarpon-era": {
    lede: "There was a time when the town wasn't called Port Aransas. It was called Tarpon, Texas — named after the fish that made it famous. From the 1880s through the 1960s, the Atlantic tarpon shaped everything about this place: its economy, its infrastructure, its culture, and its identity. Guides built their lives around the Silver King. The world's wealthiest sportsmen built the most expensive fishing club anyone had ever seen on a barrier island across the channel. Tackle manufacturers sent their equipment here to be tested. And then, within a single generation, the tarpon all but disappeared. This is the story of the rise, the fall, and the slow return of the fish that defined Port Aransas.",

    sections: [
      {
        heading: "How It Started",
        body: [
          "Historian Dr. John Guthrie Ford believes the tarpon fishery was discovered soon after the Aransas Pass jetty project began in 1880. Workers building the jetties saw massive schools of tarpon in the pass and started hiring Mustang Island boatmen to take them fishing. The first tarpon caught on rod and reel anywhere in the world was landed in Florida in 1885. Within a decade, Port Aransas had reoriented its entire economy around the fish.",
          "Before 1876, the Mercer Logs — the primary historical record of early island life — contain no mention of tarpon or rod-and-reel fishing. The pre-tarpon island economy ran on cattle roundups, ship piloting, commercial netting, and harvesting roseate spoonbills for the plumage trade. Tarpon changed everything.",
        ],
      },
      {
        heading: "The Name Changes",
        body: [
          "The town's names tell its own story. In 1888, the first post office was established under the name Ropesville. On July 17, 1896, postmaster Emma A. Roberts changed the name to Tarpon — a declaration that the fish was now the town's identity. The population was about 250. By 1910, the name changed again to Port Aransas, an aspirational choice reflecting ambitions to become a major seaport. But the tarpon era was far from over.",
        ],
      },
      {
        heading: "A Typical Fishing Day",
        body: [
          "In the 1920s through the 1940s, a tarpon fishing day started early. Anglers were called at 5:00 AM. Breakfast at the Tarpon Inn, which packed lunches and served dinner on return. On the fishing grounds by 6:00 AM. Guides rowed clients through the pass to the open Gulf and trolled along the surf line where immense schools of tarpon swam in deep guts between the sandbars.",
          "The tackle was simple by modern standards: a 5-and-a-half-foot rod, number 9 linen line, and live mullet cast in front of approaching schools. A drying spool for the linen line was standard equipment. Multiple boats competed simultaneously for the same schools. An eight-hour fishing day was the norm. The fish were photographed rather than eaten — tarpon are not good table fare.",
        ],
      },
      {
        heading: "Ed Cotter and the First Motorized Sport Fishing Boat",
        body: [
          "Ed Cotter was the first boatman to operate a power fishing boat in Port Aransas — and possibly in all of American sport fishing. Around 1900, Colonel Ned Green of New York purchased a powerboat and paid Cotter to travel to Chicago to learn to operate its Packard engine, which ran on naphtha. By about 1904, Cotter was using the powerboat to tow fishing skiffs — believed to be the first time a motorized boat was used for sport fishing in the United States.",
          "Cotter also owned the Tarpon Inn. His name lives on in Cotter Avenue, one of Port Aransas's main streets.",
        ],
        pullQuote: {
          text: "Ed Cotter is believed to have operated the first motorized sport fishing boat in the United States — paid for by a New York colonel, powered by a Packard engine that ran on naphtha.",
        },
      },
      {
        heading: "The Most Expensive Club the World Had Ever Seen",
        body: [
          "In 1899, Edward Howland Robinson Green — son of Hetty Green, the woman Wall Street called \"the Witch of Wall Street\" — founded the Tarpon Club of Texas on St. Joseph Island, adjacent to Aransas Pass. It was, by every account, the most expensive and exclusive sporting club the world had ever seen.",
          "The two-story cypress and pine clubhouse exceeded 12,000 square feet. White exterior, green trimmings, red-shingled roof. It was lit by 126 incandescent lamps powered by an electrical plant — visible for miles at sea on a barrier island in 1899. The first floor held private offices, billiard rooms, a kitchen, dining rooms, a dance hall, and a veranda. The second floor had 18 sleeping rooms, servant quarters, and a parlor.",
          "The members called themselves the \"First Four Hundred Sportsmen of America.\" Their combined wealth ran into the hundreds of millions. They came for tarpon fishing and duck hunting — killing so many waterfowl that sharks gathered in the nearby waters. The club drew intense press coverage from 1898 to 1902, then closed in 1904. Green left Texas in 1910.",
        ],
      },
      {
        heading: "The Records",
        body: [
          "The 1909 season produced 297 tarpon caught on light tackle. Only 12 exceeded six feet. One was a world record at six feet, six inches. One angler caught seven tarpon in a single day.",
          "On July 13, 1931, Dr. Stirling E. Russ caught a seven-foot, 168-pound tarpon that is still mounted at the Tarpon Inn. On May 8, 1937, President Roosevelt caught his famous five-foot, 77-pound silver king at 3:27 PM. The Texas state record for tarpon stands at 229 pounds and 90 inches — caught in 2017, decades after the fishery's peak.",
          "Atlantic tarpon can exceed six feet in length, weigh over 200 pounds, and jump up to 10 feet out of the water. They are called the Silver King because of the way sunlight reflects off their large, silvery scales — each up to three inches in diameter — as they leap from the surface.",
        ],
        fact: [
          { label: "1909 season", value: "297 tarpon on light tackle" },
          { label: "Biggest at Tarpon Inn", value: "7 ft, 168 lbs (1931)" },
          { label: "FDR's catch", value: "5 ft, 77 lbs (1937)" },
          { label: "TX state record", value: "229 lbs, 90 in (2017)" },
          { label: "Max size", value: "6+ ft, 200+ lbs, 10-ft jumps" },
        ],
      },
      {
        heading: "The Hooper Trophy",
        body: [
          "Colonel Hooper, president of the Aransas Pass Tarpon Club (headquartered in the Tarpon Inn), donated one of the most coveted trophies in sport fishing. The Hooper Trophy featured a solid silver base topped with a bronze leaping tarpon. The rules were designed to match the difficulty of winning the America's Cup: to win, an angler had to land two tarpon over six feet in the same year, using a five-and-a-half-foot rod and number 9 linen line.",
        ],
      },
      {
        heading: "What Killed the Fishery",
        body: [
          "The tarpon fishery peaked in the 1920s through the 1940s and collapsed in the 1950s, largely complete by the early 1960s. The causes were multiple and compounding.",
          "First, overfishing. Mature tarpon were routinely killed in tournaments. They were sometimes dynamited or netted, and the carcasses used for fertilizer. Killing ten in a day was common. There was no catch-and-release ethic.",
          "Second, the loss of juvenile nursery habitat. Records show a lack of small fish after 1960 while large fish remained — a clear sign of recruitment failure, meaning new fish were not being born or surviving to adulthood.",
          "Third, the Texas drought of 1949 to 1957, which brought 30 to 50 percent less rain to the region. The drought led to dam construction: 69 dams were built between 1957 and 1970, including the Longhorn Dam on the Colorado River. The dams reduced freshwater inflow and nutrients to the coastal estuaries, increased salinity, and disrupted the food chain that juvenile tarpon depended on.",
          "Fourth, pesticides, which Texas Parks and Wildlife identified as a contributing factor to the decline.",
        ],
        pullQuote: {
          text: "69 dams built between 1957 and 1970. The dams didn't just hold back water. They held back the nutrients, the freshwater inflow, and the food chain that juvenile tarpon needed to survive.",
        },
      },
      {
        heading: "The Silver King Today",
        body: [
          "Tarpon are still caught off Port Aransas from June through September, in the 40-to-150-pound range. They are strictly catch-and-release in Texas. The consistent bite has returned, though nowhere near historical levels. Scientists at the Harte Research Institute are actively studying the local population.",
          "The Deep Sea Roundup — Texas's oldest fishing tournament, running since 1932 — evolved from the original Tarpon Rodeo when the tarpon declined. The 88th edition was held July 11-14, 2024, with about 600 entries. The Boatmen Association that organized the first rodeo is now Port Aransas Boatmen Incorporated, a 501(c)(6) nonprofit with over 160 members.",
          "The tarpon scale tradition continues at the Tarpon Inn, where over 7,000 signed scales line the lobby walls — the oldest dating to 1892. The most famous belongs to FDR. He never slept at the Inn. But his signature is still there, along with those of Hedy Lamarr, Edward Teller, Duncan Hines, and thousands of anglers whose names are remembered only by the scales they signed.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas South Jetty — History Corner", url: "https://www.portasouthjetty.com/articles/port-aransas-history-corner-3/" },
      { label: "Port Aransas Museum — Tarpon Era Exhibit", url: "https://portaransasmuseum.org/exhibits/tarpon-era/" },
      { label: "The Bend Magazine — Port Aransas' Historic Tarpon Industry", url: "https://www.thebendmag.com/port-aransas-historic-tarpon-industry/" },
      { label: "Nueces Press — The Tarpon Club of Texas", url: "https://www.nuecespress.com/the-tarpon-club-of-texas/" },
      { label: "UT Marine Science Institute — The Silver King", url: "https://utmsi.utexas.edu/science-and-the-sea/print-article/the-silver-king/" },
      { label: "R.K. Sawyer & Jim Moloney, The Tarpon Club of Texas and the Genius of E.H.R. Green (2023)" },
      { label: "Barney Farley, Fishing Yesterday's Gulf Coast (Texas A&M University Press, 2008)" },
    ],

    visitToday: [
      { place: "Tarpon Inn", detail: "7,000+ signed tarpon scales on the lobby walls. FDR's scale is displayed in a frame. The oldest dates to 1892." },
      { place: "Port Aransas Museum — Tarpon Era Exhibit", detail: "Fishing rods, reels, Rodeo trophies, linen line-drying spool, and the mounted tarpon from the first Deep Sea Roundup (1932)." },
      { place: "Deep Sea Roundup", detail: "Texas's oldest fishing tournament, held every July. 88th edition in 2024." },
    ],
  },

  "lydia-ann-lighthouse": {
    lede: "On Christmas Day, 1862, Confederate General John B. Magruder ordered two kegs of gunpowder detonated inside the Lydia Ann lighthouse. The explosion destroyed the upper twenty feet of brickwork and most of the circular staircase. It would be the last principal light on the Texas coast restored after the Civil War. But the lighthouse survived — as it would survive everything the next century and a half would throw at it: hurricanes, neglect, deactivation, and finally, a quiet rescue by a grocery store billionaire who relit it in 1988. Today the Lydia Ann is the only operating lighthouse in Texas with a live-in caretaker. And nobody can agree on who Lydia Ann actually was.",

    sections: [
      {
        heading: "Bricks Lost at Sea",
        body: [
          "On March 3, 1851, Congress authorized $12,500 for the construction of a lighthouse at Aransas Pass. A brick tower design was selected. The federal government purchased 25 acres on Harbor Island for $31.25, and Texas ceded jurisdiction in June 1855.",
          "In late December 1855, the schooner carrying the bricks for the tower foundered on the sandbar at the Aransas Pass entrance during high seas. The crew was rescued, but the ship and its cargo were a total loss. New bricks had to be ordered. They arrived in 1856, followed by the lantern room and a Fourth Order Fresnel lens manufactured in France.",
          "By early 1857, the 55-foot octagonal tower and keeper's dwelling were completed. The tower was painted brown. When the light was first illuminated, it became the second oldest lighthouse on the Texas coast and the oldest surviving structure in the Aransas Pass area.",
        ],
        fact: [
          { label: "Authorized", value: "March 3, 1851" },
          { label: "Completed", value: "Early 1857" },
          { label: "Height", value: "55 feet, octagonal brick" },
          { label: "Original lens", value: "Fourth Order Fresnel" },
          { label: "Cost authorized", value: "$12,500" },
          { label: "Land cost", value: "$31.25 for 25 acres" },
        ],
      },
      {
        heading: "Christmas Day, 1862",
        body: [
          "During the Civil War, Confederate forces controlled the Texas coast. General Magruder, fearing the lighthouse would aid Union naval operations, ordered its destruction on December 25, 1862. Two kegs of powder were carried into the tower and detonated.",
          "The blast damaged the upper twenty feet of brickwork and destroyed most of the circular staircase. But the lower portion of the tower held. It was badly damaged, not demolished. Repairs began in 1867, and the lighthouse was the last principal light along the Texas coast to return to service that spring.",
        ],
      },
      {
        heading: "The Keepers",
        body: [
          "The lighthouse's longest-serving keeper was Parry W. Humphreys, who tended the light for over 16 years from 1869 to 1886. His wife Maria served as first assistant, followed by Jane W. Humphreys for nearly a decade. The keeper position was often a family affair.",
          "Frank Stephenson served as head keeper from 1897 to 1917. He had a daughter named Lydia Ann — which brings us to the most persistent mystery of the lighthouse.",
        ],
      },
      {
        heading: "Who Was Lydia Ann?",
        body: [
          "The historical marker at the lighthouse credits \"the daughter of the first keeper\" for the name. But that's inaccurate. Keeper Frank Stephenson, whose daughter was named Lydia Ann, was the ninth keeper — not the first.",
          "Local historians believe the channel was more likely named after Lydia Ann Dana Hastings Hull Wells, wife of Texas Revolution veteran James B. Wells. The name may have been applied to the channel first, with the lighthouse taking its name from the waterway it served. The truth is: no one has definitively settled the question. The lighthouse has been guiding ships for 169 years, and nobody can agree on whose name it carries.",
        ],
        pullQuote: {
          text: "The lighthouse has been guiding ships for 169 years, and nobody can agree on whose name it carries.",
        },
      },
      {
        heading: "The Lens",
        body: [
          "The Fourth Order Fresnel lens that served in the lighthouse from 1878 to 1952 was manufactured in the 1860s by the French firm of Augustin Henry Lapaute. Lapaute's ancestors were clockmakers for Louis XVI and Louis XVII. After meeting Augustin-Jean Fresnel — the physicist who invented the revolutionary lens design before his death in 1827 — Lapaute applied his knowledge of clockwork mechanisms to create a new lens rotation system.",
          "The lens stands two feet, four inches tall. It was decommissioned by the Coast Guard in 1954 and eventually given to the City of Port Aransas, which turned it over to the Port Aransas Museum after its 2008 opening. In November 2022, Jean-Pierre Jacks — Lapaute's great-great-great-grandson — visited the museum from France and identified a previously overlooked maker's engraving on the lens's metal base. A 160-year-old connection, rediscovered in a small-town museum on a Texas barrier island.",
        ],
      },
      {
        heading: "Deactivation and Rescue",
        body: [
          "In 1952, a new light was established at the Port Aransas Coast Guard Station, and the Lydia Ann was deactivated after nearly a century of service. The tower was sold to private hands in 1955 for $25,151.",
          "In 1973, Charles Butt — president and CEO of H-E-B, the Texas grocery chain — purchased the lighthouse property. Butt oversaw a careful restoration and hired a live-in caretaker, Rick Reichenbach, who was later profiled by Texas Monthly. On July 3, 1988, the light was reactivated as a private aid to navigation. An automated light was installed.",
          "The Lydia Ann had been listed on the National Register of Historic Places on August 3, 1977. Today it remains privately owned. The grounds and tower are closed to the public, but the lighthouse is visible from the water — charter boats and kayak tours offer viewing from the Lydia Ann Channel.",
        ],
      },
    ],

    sources: [
      { label: "Lighthousefriends.com — Aransas Pass (Lydia Ann) Lighthouse", url: "https://www.lighthousefriends.com/light.asp?ID=158" },
      { label: "Port Aransas South Jetty — Lighthouse Has Stood 160+ Years", url: "https://www.portasouthjetty.com/articles/lighthouse-has-stood-160-years/" },
      { label: "Port Aransas South Jetty — More Learned on Lighthouse Lens", url: "https://www.portasouthjetty.com/articles/more-learned-on-lighthouse-lens/" },
      { label: "HMDB — Lydia Ann Lighthouse Historical Marker", url: "https://www.hmdb.org/m.asp?m=182890" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "The original Fourth Order Fresnel lens is on display — with the maker's engraving identified by Lapaute's great-great-great-grandson in 2022." },
      { place: "Lydia Ann Channel", detail: "The lighthouse is visible from the water. Charter boats and kayak tours from Lighthouse Trails near Highway 361 offer viewing." },
    ],
  },

  "karankawa-legacy": {
    lede: "Long before the tarpon anglers, before the Farleys, before the lighthouse, before the town had a name, the Karankawa people lived on these barrier islands. Not for centuries — for millennia. Radiocarbon dating places Karankawa groups on the Texas Gulf Coast as early as 5,000 BCE. They were nomads who moved between the islands in summer and the mainland in winter, traveling in bands of fifty, converging into groups of five hundred when food was plentiful. They tattooed their entire bodies. They crafted pottery lined with natural tar. They used longbows nearly as tall as themselves. And in 1858, after decades of colonial violence justified by propaganda, they were declared extinct. That declaration was a lie. The Karankawa survived. And in 2020, the Handbook of Texas finally admitted it.",

    sections: [
      {
        heading: "The First Islanders",
        body: [
          "The Karankawa inhabited the barrier islands and mainland coast between Galveston Bay and Corpus Christi Bay. Archaeological evidence — primarily shell middens, mounds of discarded shells from harvested oysters and clams — documents their long-term presence across the entire Texas Gulf Coast.",
          "They followed a seasonal migration pattern that perfectly matched the resources of the coast. Summer meant fishing camps on the barrier islands. Winter meant hunting grounds on the mainland. Small bands of about fifty kinsmen, led by a chief, traveled independently most of the year, then converged into larger groups of five hundred or more in winter when food sources concentrated.",
          "Their material culture was sophisticated. They crafted baskets and pottery lined with asphaltum — natural tar that washed up on Gulf beaches — creating waterproof vessels. Their longbows were described by Europeans as nearly as tall as the archers themselves. Their entire bodies were covered in tattoos that conveyed social status, marital availability, and served as a kind of passport through their territory.",
        ],
        fact: [
          { label: "Earliest evidence", value: "~5,000 BCE" },
          { label: "Territory", value: "Galveston Bay to Corpus Christi Bay" },
          { label: "Band size", value: "~50, converging to 500+ in winter" },
          { label: "Average height", value: "5'8\" (taller than most Europeans)" },
          { label: "Declared extinct", value: "1858 (falsely)" },
          { label: "Handbook corrected", value: "November 2020" },
        ],
      },
      {
        heading: "The Myth That Justified Genocide",
        body: [
          "The Karankawa practiced a ceremonial form of cannibalism — consuming small portions of defeated enemies to symbolically absorb their power. This practice ended by the late 1600s. No firsthand account of any form of cannibalism exists after that date.",
          "But the myth was too useful to die. Failed Spanish conquistadors and missionaries created propaganda to justify their own failures. When Anglo-American colonists arrived under Stephen F. Austin's land grants in the 1820s, they weaponized the myth further. Austin declared the Karankawa \"universal enemies to man\" and called openly for their \"extermination.\" He assigned a captain to expel them from his land grant, leading to multiple attacks including the Skull Creek massacre.",
          "Over 30,000 settlers arrived in and near Karankawa territory between the 1820s and 1830s. By the time of Texas independence in 1836, the Karankawa were fighting for survival. In 1858, following defeat by a force led by Juan Nepomuceno Cortina, they were declared extinct. SMU historian Tim Seiter has since led modern research debunking the cannibalism myth alongside Karankawa descendants.",
        ],
        pullQuote: {
          text: "Stephen F. Austin declared the Karankawa 'universal enemies to man' and called for their extermination. The cannibalism myth justified the genocide. The myth was a lie. The extinction was also a lie.",
        },
      },
      {
        heading: "Survival in the Margins",
        body: [
          "The surviving Karankawa did not vanish. After the last nine warriors made a final stand near the Mexican town of Mier, the women and children dispersed to ranches and cities on both sides of the Texas-Mexico border. During the mid-1840s, most surviving Karankawa moved south into Tamaulipas, Mexico. They retained their culture and passed it down through generations — invisibly, in a world that had declared them gone.",
        ],
      },
      {
        heading: "The Return",
        body: [
          "The revival traces to September 2009, when the Brownsville Herald profiled Enrique Gonzalez Jr., who claimed to be a direct descendant with Karankawa grandparents on both sides. Around 2015, individuals across the Gulf Coast began connecting via social media and formed the Karankawa Kadla — meaning \"mixed people\" — as a tribal organization. Two clans emerged: one centered in Corpus Christi, one in Galveston. They now have a tribal council.",
          "In November 2020, the Handbook of Texas changed its first sentence from \"The now-extinct Karankawa Indians\" to \"The Karankawa Indians are an American Indian cultural group whose traditional homelands are located along Texas' Gulf Coast.\" A single sentence — 162 years overdue.",
          "The Karankawa Kadla are not yet recognized by the state or federal government. Texas's recognition process remains tangled in bureaucracy. But the Indigenous Peoples of the Coastal Bend nonprofit has organized to fight industrial expansion near sacred sites, and the tribe's visibility grows with each year.",
        ],
      },
      {
        heading: "Donnel Point, 2025",
        body: [
          "In 2025, an Ingleside on the Bay resident named Patrick Nye spotted a dense shell deposit in an eroded bluff while boating near Donnel Point, along the La Quinta Channel on Corpus Christi Bay. Local archaeologists confirmed it as an archaic shell midden matching historical accounts of Karankawa tribal camps dating back approximately 2,300 years. Historically, four separate shell middens had been identified at Donnel Point in the 1930s.",
          "The site is owned by the Port of Corpus Christi. An unused permit authorizes construction of an oil terminal on the property. Earthjustice lawyers representing the Karankawa and the Carrizo/Comecrudo Tribe of Texas have asked the U.S. Army Corps of Engineers to revoke the permit. Donnel Point is among the last undisturbed tracts of land on nearly seventy miles of shoreline.",
          "The fight is ongoing. A people declared extinct in 1858 are now in federal court defending a 2,300-year-old sacred site from an oil terminal. That is the Karankawa story — not history in the past tense, but a living struggle over who gets to define what matters.",
        ],
      },
    ],

    sources: [
      { label: "Texas State Historical Association — Handbook of Texas: Karankawa", url: "https://www.tshaonline.org/handbook/entries/karankawa-indians" },
      { label: "Texas Highways — Karankawa Descendants Are Reclaiming Their Heritage", url: "https://texashighways.com/culture/people/karankawa-descendants-are-reclaiming-their-heritage-after-being-written-off-extinct/" },
      { label: "SMU News — Tim Seiter Karankawa Research" },
      { label: "PAPHA — Karankawa Resurgence Lecture (2025)", url: "https://portaransasmuseum.org/henry-gonzales-alejandro-oyoque-speak-about-karankawa-resurgence/" },
      { label: "Earthjustice — Donnel Point Press Release (2025)" },
      { label: "Robert A. Ricklis, The Karankawa Indians of Texas (Texas Archaeology and Ethnohistory Series)" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "The \"Historic Families and Characters\" exhibit (2025) features Karankawa history. PAPHA hosted the Karankawa Resurgence lecture in February 2025." },
      { place: "The Barrier Islands", detail: "Mustang Island itself was a Karankawa summer camp for thousands of years. Shell middens are found across the Texas coast." },
    ],
  },

  "port-aransas-museum": {
    lede: "The Port Aransas Museum holds nearly 40,000 historical photographs. It has film footage from the 1920s and 1930s. It has oral history recordings with islanders who survived Hurricane Celia. It has a Fourth Order Fresnel lens manufactured in 1860s Paris. It has a 60-foot genealogy scroll tracing 20 local families from a single 1854 marriage. And the building itself — a 1910 Sears, Roebuck catalog kit house, shipped to the island on a barge, that once served as the Coast Guard station — is an artifact in its own right. Almost none of this is accessible online. The museum's digital presence consists of a basic WordPress site with no searchable archive, no published oral histories, no virtual exhibits. It is one of the most significant gaps in Texas coastal heritage — and one of the greatest opportunities.",

    sections: [
      {
        heading: "A Sears Kit House on a Barge",
        body: [
          "The museum building was ordered from a Sears, Roebuck catalog — a prefabricated home with all components shipped pre-cut and numbered for assembly. It was built by Robert A. Mercer, son of Robert Ainsworth Mercer, the man who established the first permanent settlement on Mustang Island in 1855. The kit house was brought to Port Aransas on a barge in 1910.",
          "It survived the devastating 1919 hurricane. When that storm destroyed the original Life Saving Station, this kit house served as the temporary Coast Guard station until a new facility opened in 1925. After that, it passed into private ownership. Municipal Court Judge Duncan Neblett and former Mayor Georgia Neblett lived there for twenty years. It became known as the Neblett house.",
          "In 2006, an out-of-town developer purchased the property with plans to demolish the house and build townhouses. In 2007, it was listed on Preservation Texas's Most Endangered Places. PAPHA acquired the house — the original owners donated it to be moved — and spent $45,311 to relocate it to the Community Center property. It opened as the Port Aransas Museum in December 2008.",
        ],
      },
      {
        heading: "38,000 Photos and Counting",
        body: [
          "The museum's photo archive has grown from an initial collection of 8,000 digitized images to nearly 40,000. The person responsible for this is Mark Creighton, a Cornell graduate who arrived in Port Aransas from the New Jersey shore in 1982. Creighton is a founding and lifetime member of PAPHA, the museum archivist, and the primary force behind digitizing the historical photo collection.",
          "Every historical photograph added to the archive passes through Creighton's hands. The subjects span the late 1800s through the present: fishing, storms, daily life, buildings, schools, the jetties, boats, the lighthouse, families. The Brundrett family holdings alone include photographs from the late 1800s.",
          "The collection grows through ongoing donations. In one remarkable discovery, Port Aransas resident Cathy Fulton found 12 photographs dated 1929 to 1931 in a drawer of an abandoned trailer near Beach Access Road 1. The envelope was labeled \"Port Aransas school children.\" Creighton noted the children may have been from \"rag town\" — a tent community from the late 1920s and 1930s.",
        ],
        pullQuote: {
          text: "Nearly 40,000 historical photographs. Film footage from the 1920s. Oral histories with hurricane survivors. Almost none of it is accessible online.",
        },
      },
      {
        heading: "The Fresnel Lens and the Clockmaker's Heir",
        body: [
          "The museum's centerpiece is a Fourth Order Fresnel lens that served in the Lydia Ann Lighthouse from 1878 to 1952. It was manufactured in the 1860s by Augustin Henry Lapaute, whose family were clockmakers for French royalty. Lapaute met physicist Augustin-Jean Fresnel and applied his clockwork knowledge to create a revolutionary lens rotation system.",
          "The lens stands two feet, four inches tall. It was decommissioned in 1954 and given to the City of Port Aransas, which transferred it to the museum after opening. In November 2022, a visitor named Jean-Pierre Jacks — Lapaute's great-great-great-grandson — arrived from France and identified a previously overlooked maker's engraving on the metal base. Five generations and 160 years, connected by a lens in a small museum on a barrier island.",
        ],
      },
      {
        heading: "The Collections",
        body: [
          "Beyond the photographs and the Fresnel lens, the museum holds a bronze jetty train bell from the Aransas Harbor Terminal Railway — the railroad chartered in 1892 to haul granite blocks to the jetty construction site. The bell has lost its clapper but visitors are encouraged to interact with it.",
          "There is a genealogy scroll approximately sixty feet long, tracing about twenty local families stemming from a single 1854 marriage between Franz Joseph Frandolig and Hannah Anna Ellen Schwander. The Moores, the Mathews, the Bujans — all connected.",
          "The Tarpon Era exhibit, opened in February 2020, holds fishing rods and reels, Rodeo trophies, a linen line-drying spool, tarpon fish prints by Dinah Bowman (whose gyotaku work is in the Smithsonian permanent collection), and a mounted tarpon from the first Deep Sea Roundup in 1932 — believed caught by Totsy Millican, though entered under her husband North's name.",
          "And there are the oral histories: video interviews with long-time islanders, an ongoing project capturing personal narratives about hurricanes, fishing, and local characters. The 2025 \"Historic Families and Characters\" exhibit features direct input from families including the Brundrett, Milligan, Farley, Belcher, Teller, Baker, and Parker families — and, for the first time, Port Aransas's Black residents.",
        ],
      },
      {
        heading: "The Digital Gap",
        body: [
          "PAPHA's website is a basic WordPress site with pages for exhibits, events, and membership. There is no searchable photo database. No oral histories are published digitally — no podcast, no YouTube channel, no audio archive. The 1920s film footage is not available online in any form. The McKee Collection of 400-plus antique fishing rods and reels has a single webpage with no catalog and no images.",
          "This matters because the collection is genuinely extraordinary. If the archive were digitized and made accessible, it would be one of the most comprehensive coastal heritage collections available online in Texas. The oral histories alone — recordings from survivors of Celia, from families who have been on the island for a century — represent irreplaceable primary sources.",
          "The gap is not a criticism. PAPHA is a small nonprofit with $464,000 in annual revenue and a handful of staff. Digitization at this scale requires resources they don't yet have. But the opportunity is clear: a world-class physical archive with essentially zero digital reach.",
        ],
      },
      {
        heading: "PAPHA — The Organization Behind It All",
        body: [
          "The Port Aransas Preservation and Historical Association was founded in November 2002. Two of its key founders were Dr. John Guthrie Ford — a Trinity University psychology professor who transcribed the Mercer Logs, wrote the South Jetty's \"History Corner\" column, and created multiple museum exhibits before his death in 2018 — and Mark Creighton, who became the museum archivist.",
          "PAPHA manages the museum, Farley Boat Works, the Chapel on the Dunes tours, the Mercer Market gift shop, and The Preserve (the 6,000-square-foot maritime museum under construction). Its total assets are just over $2 million. It operates on about $410,000 in annual expenses. Rick Pratt served as founding museum director from 2009 to 2018; Cliff Strain, a 40-year Port Aransas resident and former Flour Bluff ISD teacher, is the second and current director.",
        ],
      },
    ],

    sources: [
      { label: "Preservation Texas — Mercer House", url: "https://www.preservationtexas.org/mep/mercer-house" },
      { label: "PAPHA Official Site", url: "https://portaransasmuseum.org/" },
      { label: "Port Aransas South Jetty — Historic Photos Found in Abandoned Trailer", url: "https://www.portasouthjetty.com/articles/historic-photos-found-in-an-abandoned-trailer/" },
      { label: "Port Aransas South Jetty — More Learned on Lighthouse Lens", url: "https://www.portasouthjetty.com/articles/more-learned-on-lighthouse-lens/" },
      { label: "Port Aransas South Jetty — Historic Families Exhibit", url: "https://www.portasouthjetty.com/articles/historic-families-museum-exhibit-to-open-thursday/" },
      { label: "ProPublica Nonprofit Explorer — PAPHA Financials", url: "https://projects.propublica.org/nonprofits/organizations/710926680" },
      { label: "J. Guthrie Ford & Mark Creighton, Images of America: Port Aransas (Arcadia Publishing, 2011)" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "408 N. Alister Street. Free admission. Thu-Sat 1-5 PM. Docent-led tours. The Fresnel lens, train bell, and Tarpon Era exhibit are all here." },
      { place: "Chapel on the Dunes", detail: "Free PAPHA-led tours on the 1st and 3rd Saturday of each month, 9:15 AM. Near 11th Street and Avenue B." },
      { place: "Farley Boat Works", detail: "716 W. Avenue C. The working boat shop and soon-to-open Preserve maritime museum are both PAPHA properties." },
    ],
  },

  "storms-of-port-aransas": {
    lede: "Port Aransas has been destroyed and rebuilt so many times that the cycle has become part of the town's identity. The 1875 hurricane wiped out the Mercer Docks and killed 150 people across Texas. The 1916 storm left the island flooded and infested with rattlesnakes. The 1919 hurricane — the worst in Port Aransas history — brought a storm surge of up to 15 feet, ruptured oil tanks that coated victims in crude, and killed as many as 1,000 people in the region. The town was depopulated and had to be resettled from scratch. The population didn't recover to its pre-1919 level until the 1960s. Then came Celia in 1970. Then Harvey in 2017. Port Aransas has experienced 43 hurricanes since 1930. The name \"Hurricane Junction\" is not a nickname. It is the historical record.",

    sections: [
      {
        heading: "1875 — The First Recorded Devastation",
        body: [
          "The Hurricane of 1875 carried winds of 115 mph and destroyed the Mercer Docks — the major maritime infrastructure connecting Mustang Island to the outside world. Regular steamship service between the island and New Orleans, which had operated since the 1850s, ended permanently. Across Texas, 150 people were killed. Port Aransas's connection to the mainland was severed, and rebuilding the island's role as a port would take decades.",
        ],
      },
      {
        heading: "1916 — Rattlesnakes and Ruins",
        body: [
          "The August 18, 1916 hurricane destroyed Port Aransas \"except for a few buildings.\" The island was flooded and, in the aftermath, infested with rattlesnakes driven from their burrows by the water. Corpus Christi sustained $1.5 million in damage and 20 deaths.",
          "The storm also destroyed the original Life Saving Station. A 1910 Sears kit house — the building that is now the Port Aransas Museum — served as the replacement station until 1925.",
        ],
      },
      {
        heading: "1919 — The Town That Disappeared",
        body: [
          "The 1919 hurricane is the worst natural disaster in Port Aransas history. Part of the Florida Keys Hurricane, it made Texas landfall at Baffin Bay on September 14 with winds of at least 110 mph and a storm surge variously reported at 11 to 15 feet.",
          "The results were total. As one survivor put it: \"The whole town was gone. Every single house and store, hotel and inn.\" Only a school building survived — near the present-day Dairy Queen on the 300 block of West Cotter Avenue. The wind lasted 18 continuous hours.",
          "Oil tanks ruptured during the storm. Victims swept into the bay were coated in heavy crude oil, making identification impossible. A communal shelter housing over 100 people collapsed after filling with water. Survivors fled to Cedar Hill, near present-day Beach Street.",
          "Rescue was delayed three days because Corpus Christi authorities believed there were no survivors. The death toll in Texas was at least 284, but NWS estimates that 600 to 1,000 may have died — many victims in Nueces Bay, coated in crude, were never identified.",
          "Most families relocated after the storm. Port Aransas was essentially depopulated and had to be resettled. The population had been about 250 before the storm. By 1925, it was 50.",
        ],
        pullQuote: {
          text: "The whole town was gone. Every single house and store, hotel and inn.",
          attribution: "1919 hurricane survivor",
        },
      },
      {
        heading: "1961 — Carla Cleaned House",
        body: [
          "Hurricane Carla's impact on Port Aransas was significant in a way that doesn't show up in damage statistics. The storm destroyed most of the town's \"illegal joints\" — the bars, gambling houses, and unlicensed establishments that had given Port Aransas a reputation as a lawless party destination. They were never rebuilt. Carla effectively ended that era and pushed the town toward the family-friendly fishing village identity it carries today.",
        ],
      },
      {
        heading: "1970 — Celia and the Microbursts",
        body: [
          "Hurricane Celia made landfall on August 3, 1970, with sustained winds between 125 and 140 mph and gusts estimated at 180 mph. The eye passed directly over Port Aransas. What made Celia unique were the microbursts — concentrated pockets of high-energy wind that struck in rapid succession over about 15 minutes, producing damage patterns that looked more like tornadoes than a hurricane.",
          "Seventy-five percent of Port Aransas homes and businesses were damaged. The Tarpon Inn closed for five years. The fishing fleet was scattered — 331 boats lost across the Coastal Bend. The Marlin Queen, a 65-foot party boat, was impaled on pilings. Total damage was $930 million in 1970 dollars.",
          "The recovery took two years. Pearl Beer bottled drinking water in beer bottles. Residents cooked freezer food communally before it spoiled. The community barbecue tradition that started after Celia continues after every storm.",
        ],
      },
      {
        heading: "2017 — Harvey",
        body: [
          "Hurricane Harvey made landfall near Port Aransas and Rockport on the night of August 25, 2017 as a Category 4 hurricane with 130 mph winds. Mayor Charles Bujan had ordered an evacuation the previous day for the town's approximately 4,000 residents.",
          "The damage was the most comprehensive in the town's modern history: 100% of businesses damaged, 85% of homes damaged. City infrastructure sustained $50 to $70 million in damage. The city lost $300 million in property-tax value and laid off 10% of its workforce. The Tarpon Inn was flooded with an 8-foot storm surge but the lobby walls held and the 7,000-plus tarpon scales survived. The Inn reopened after eight months.",
          "But Harvey's deepest impact was demographic. The storm destroyed the town's affordable housing stock — the older, cheaper houses where the fishing guides, restaurant workers, and service employees lived. What got rebuilt was more expensive. Workers were forced to commute from Corpus Christi and Rockport. An 188-unit affordable housing complex opened in spring 2022, but the fundamental dynamic remains: each rebuilding cycle makes Port Aransas wealthier, less diverse, and less accessible to the people who make it work.",
        ],
        pullQuote: {
          text: "The hurricane wiped out a lot of the workforce housing, and it didn't come back.",
          attribution: "David Parsons, Port Aransas City Manager",
        },
      },
      {
        heading: "The Pattern",
        body: [
          "Port Aransas has experienced 43 hurricanes since 1930. The destructive sequence — 1875, 1916, 1919, 1961, 1970, 2017 — averages roughly one catastrophic storm every 25 years. Each time, the community rebuilds. Each time, some people don't come back. Each time, the town that emerges is a little different from the one that was destroyed.",
          "The dark truth about resilience is that it comes with a cost. Every rebuilding cycle concentrates wealth. The people who can afford to rebuild do. The people who can't, leave. Port Aransas after Harvey is not the same town as Port Aransas before Harvey, just as it wasn't the same after Celia, or after 1919. The island endures. But the question of who gets to live on it keeps changing.",
        ],
      },
    ],

    sources: [
      { label: "NWS Corpus Christi — Hurricane Celia", url: "https://www.weather.gov/crp/hurricanecelia" },
      { label: "NWS Corpus Christi — Hurricane of 1919", url: "https://www.weather.gov/crp/hurricane1919" },
      { label: "NWS Corpus Christi — Hurricane Harvey", url: "https://www.weather.gov/crp/hurricane_harvey" },
      { label: "Port Aransas South Jetty — 1919 Hurricane", url: "https://www.portasouthjetty.com/articles/1919-hurricane-smashed-port-a/" },
      { label: "Houston Public Media — Harvey Port Aransas", url: "https://www.houstonpublicmedia.org/articles/news/2018/08/20/300865/" },
      { label: "Cyril Matthew Kuehne, Hurricane Junction: A History of Port Aransas (St. Mary's University, 1973)" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "Hurricane exhibits documenting 1916, 1919, Celia, and Harvey. Oral histories from survivors. A 1940s Farley boat wrecked by Celia." },
      { place: "Tarpon Inn", detail: "Built in 1925 with pine poles sunk in 16-20 feet of concrete. Has survived Celia and Harvey. The scales survived everything." },
      { place: "300 Block W. Cotter Avenue", detail: "Near the site of the only building that survived the 1919 hurricane — the school building." },
    ],
  },

  "chapel-on-the-dunes": {
    lede: "In 1937, a woman named Aline B. Carter — Wellesley graduate, harp student at the Boston Conservatory, astronomy instructor, poet, and the future Poet Laureate of Texas — built a small chapel on top of a sand dune overlooking the Gulf of Mexico. She called it the Chapel of Eternal Light, because the small windows were placed to frame the morning Gulf light from one side and the sunset bay light from the other. She held Sunday school for the island's children and served ice cream and cake. The chapel still stands. The Carter family still owns it. PAPHA gives tours twice a month. It is the oldest functional consecrated church on Mustang Island.",

    sections: [
      {
        heading: "The White Angel",
        body: [
          "Aline B. Carter was not a typical island resident. She attended Wellesley College, received musical instruction in harp at the Boston Conservatory, and trained at the Eric Pape School of Art in Boston. She was an astronomy instructor, a poet, and a visual artist. She was resident of the historic Maverick Carter House in San Antonio.",
          "She authored two poetry collections: Halo of Love and Doubt Not The Dream. From 1947 to 1949, she served as the Texas Poet Laureate. On Mustang Island, she was known as the \"White Angel\" for the flowing white organdy dresses she wore while doing community service.",
        ],
      },
      {
        heading: "A Chapel Built for Light",
        body: [
          "Carter commissioned Ethel Wilson Harris to design and build the chapel. Harris was a noted San Antonio artisan associated with the Mission San Jose Pottery and the Works Progress Administration's Arts and Crafts Division. The altar and tile work were based on Carter's own drawings.",
          "The chapel sits atop a sand dune near the intersection of 11th Street and Avenue B, oriented so that its small windows capture the changing light throughout the day. Carter used it for meditation and inspiration. She held Sunday school for island children, serving ice cream and cake — making what may have been the most popular religious education program in the history of Mustang Island.",
        ],
        pullQuote: {
          text: "She called it the Chapel of Eternal Light, because the windows frame the morning Gulf light from one side and the sunset bay light from the other.",
        },
      },
      {
        heading: "The Murals and the Legacy",
        body: [
          "In 1972 — the year Aline Carter died — artist John Patrick Cobb painted Biblical murals on the chapel's whitewashed interior. The Old Testament is depicted on the north wall, the New Testament on the south.",
          "The Carter family retains ownership. Frank Carter, one of Aline's three sons, managed the chapel until his death at age 99 in 2018. The chapel is available for weddings and private ceremonies. PAPHA offers free guided tours on the first and third Saturday of each month, starting at 9:15 AM and lasting 30 to 40 minutes.",
          "There is no other building quite like it on the Texas coast — a sand dune chapel built by a poet laureate, designed by a WPA artisan, painted with murals in the year its founder died, and maintained by the same family for nearly ninety years.",
        ],
      },
    ],

    sources: [
      { label: "Chapel on the Dunes — Official Site", url: "https://chapelonthedunes.org/" },
      { label: "Texas Highways — Chapel on the Dunes Endures", url: "https://texashighways.com/culture/chapel-on-the-dunes-endures-port-aransas/" },
      { label: "Atlas Obscura — Chapel on the Dunes", url: "https://www.atlasobscura.com/places/chapel-on-the-dunes" },
      { label: "PAPHA — Chapel Tours", url: "https://portaransasmuseum.org/chapel-on-the-dunes-tours/" },
    ],

    visitToday: [
      { place: "Chapel on the Dunes", detail: "Near 11th Street and Avenue B. Free PAPHA tours on the 1st and 3rd Saturday of each month, 9:15 AM. 30-40 minutes." },
    ],
  },

  "wwii-coastal-defenses": {
    lede: "One month after Pearl Harbor, in January 1942, a German U-boat was spotted just miles from the entrance to Aransas Pass. The pass guarded an oil depot and served as the transit route for Port of Corpus Christi vessels — Port Aransas was the nation's 12th largest oil shipping port. The U.S. Army's response was swift: field artillery from the 2nd Infantry Division, followed by Battery E of the 50th Coast Artillery Regiment, equipped with two French-designed 155mm guns mounted on reinforced concrete emplacements atop the sand dunes. A camp was built for 360 men. The guns could reach targets 11 miles out to sea. For two and a half years, they watched the Gulf of Mexico. They never fired a shot.",

    sections: [
      {
        heading: "The Threat",
        body: [
          "The Southern Defense Command, created in March 1941 under Lieutenant General Walter Krueger, was responsible for the entire Southern U.S. coastline from North Carolina to Brownsville. After Pearl Harbor, the fear of German naval operations in the Gulf of Mexico was not hypothetical — the U-boat sighting near Aransas Pass in January 1942 was real. The oil depot inside the pass and the commercial shipping traffic through the channel made Port Aransas a logical target.",
        ],
      },
      {
        heading: "The Response",
        body: [
          "In January 1942, the SDC dispatched a temporary field artillery battery of the 2nd Infantry Division to Mustang Island. They set up 105mm Howitzers as an immediate defensive measure. By April 1942, Battery E of the 50th Coast Artillery Regiment arrived with heavier equipment: two French-designed 155mm GPF (Grande Puissance Filloux) guns.",
          "The guns were mounted on Panama mounts — a type of gun emplacement developed by the U.S. Army in Panama during the 1920s. The troops built reinforced concrete emplacements on top of the sand dunes, along with timber magazines for ammunition storage, a commander's station, and searchlights. The camp accommodated 360 men. The 155mm guns could fire six-inch shells at targets up to 11 miles away.",
        ],
        fact: [
          { label: "Duration", value: "January 1942 — July 1944" },
          { label: "Personnel", value: "360 men" },
          { label: "Primary weapons", value: "Two 155mm GPF guns" },
          { label: "Range", value: "11 miles" },
          { label: "Shots fired at enemy", value: "Zero" },
        ],
      },
      {
        heading: "Two and a Half Years of Watching",
        body: [
          "Coastal defense operations at Port Aransas lasted from January 1942 to July 1944, when enemy naval threats in the Gulf were assessed as having ceased. During the entire deployment, no weapons were discharged at any enemy. No actual engagements with enemy craft occurred. The guns watched the water, and the water stayed empty.",
          "The military presence had another effect: the population of Port Aransas reportedly doubled during the war years as hundreds of servicemen lived on the island. The town had been small — perhaps 500 people before the war — and the sudden influx of young military personnel changed the social fabric temporarily.",
        ],
      },
      {
        heading: "An Older Military History",
        body: [
          "Mustang Island's military history didn't start with World War II. During the Mexican-American War of 1846 to 1848, a small fort was built on the island to guard the entrance to Aransas Bay and remained in use through the Civil War.",
          "In April 1863, Confederate forces established Fort Semmes on the northern end of Mustang Island — named after Confederate Navy Captain Raphael Semmes. On November 17, 1863, Union forces under Brigadier General Thomas E.G. Ransom attacked Fort Semmes. The Confederate garrison of fewer than 100 men under Major George O. Dunaway was bombarded by the USS Monongahela from offshore. The Confederates surrendered. Union troops occupied the island until July 1864.",
          "And of course, on Christmas Day 1862, Confederate General Magruder ordered the Lydia Ann lighthouse destroyed — an act of military demolition that the lighthouse survived, and that is remembered far better than the fort that stood just up the island.",
        ],
      },
      {
        heading: "What Remains",
        body: [
          "A Texas Historical Commission marker — \"World War II Coastal Defenses at the Aransas Pass\" (Atlas #5507015267) — documents the wartime installation. Gun mount remnants are still visible in the dunes. Local preservation groups have worked to create a memorial at the site.",
          "The WWII guns that never fired are a quiet story — no combat, no heroics, no casualties. But they represent something important about Port Aransas: even the military history of this island is defined by the tension between preparation and the Gulf's indifference. The guns waited. The threat never came. And then the men went home.",
        ],
      },
    ],

    sources: [
      { label: "Texas Historical Commission Atlas — WWII Coastal Defenses (#5507015267)" },
      { label: "TSHA Handbook — Port Aransas", url: "https://www.tshaonline.org/handbook/entries/port-aransas-tx" },
      { label: "Port Aransas South Jetty — Historical Articles" },
    ],

    visitToday: [
      { place: "WWII Gun Emplacement Remnants", detail: "Concrete remains of the Panama mount emplacements are still visible in the sand dunes near Aransas Pass." },
      { place: "THC Historical Marker", detail: "\"World War II Coastal Defenses at the Aransas Pass\" marker documents the 1942-1944 installation." },
    ],
  },

  "deep-sea-roundup": {
    lede: "In 1932, 25 charter boat and commercial fishermen calling themselves the Boatmen Association staged a three-day Texas Tarpon Rodeo in Port Aransas. North Millican caught the first winning tarpon — though locals still whisper that his wife Totsy actually landed the fish. The mounted tarpon from that day is still on display in the Port Aransas Museum, entered under North's name. Two years later, Dorothy Fair became the first woman to officially win the tournament. That rodeo evolved into the Deep Sea Roundup — Texas's oldest fishing tournament, now in its ninth decade, and the event that defines summer in Port Aransas.",

    sections: [
      {
        heading: "From Tarpon Rodeo to Deep Sea Roundup",
        body: [
          "The original Tarpon Rodeo was organized by Barney Farley Sr. in 1932, at a time when Port Aransas's identity as a tarpon fishing destination was at its peak. The 25 founding members of the Boatmen Association had a specific mission: protect the local fishing waters and create an organized event that would draw national attention to Port Aransas.",
          "The tournament was built around tarpon — the Silver King that had defined the town's economy since the 1880s. But as the tarpon fishery declined through the 1950s and 1960s, the tournament adapted. By 1947, it was called the \"Tarpon Rodeo and Deep Sea Roundup.\" By 1965, as tarpon catches became rare, it was renamed simply the Deep Sea Roundup, expanding to include all offshore species.",
        ],
      },
      {
        heading: "Totsy's Fish",
        body: [
          "The story of the first tournament's winning catch is one of Port Aransas's best-loved pieces of local lore. The tarpon was officially entered under North Millican's name. But the widely held local belief is that his wife Totsy actually caught the fish. The mounted tarpon from the 1932 rodeo — possibly the first tournament-winning fish in Texas coastal history — is displayed at the Port Aransas Museum.",
          "Whether Totsy caught the fish or not, what is documented is that Dorothy Fair became the first woman champion in 1934 — just two years into the tournament's existence. Women have been a significant part of Port Aransas fishing culture from the beginning.",
        ],
        pullQuote: {
          text: "The first winning tarpon was entered under North Millican's name. Locals still say his wife Totsy actually caught the fish. The mounted tarpon is in the museum. Under North's name.",
        },
      },
      {
        heading: "The Boatmen",
        body: [
          "The Port Aransas Boatmen Association, founded in 1932 with 25 members, has grown into Port Aransas Boatmen Incorporated — a 501(c)(6) nonprofit with over 160 members. The original mission of protecting fishing waters and sponsoring the tournament remains the core purpose.",
          "The organization hosts the Deep Sea Roundup every July. The 88th edition was held July 11 through 14, 2024, drawing approximately 600 entries. The tournament has only paused twice: during World War II and in 2020 for COVID-19.",
        ],
        fact: [
          { label: "First held", value: "1932 (as Texas Tarpon Rodeo)" },
          { label: "Current name since", value: "1965" },
          { label: "88th edition", value: "July 11-14, 2024" },
          { label: "Entries (2024)", value: "~600" },
          { label: "Pauses", value: "WWII + COVID-19 only" },
          { label: "Organizer", value: "Port Aransas Boatmen Inc." },
        ],
      },
      {
        heading: "Nine Decades on the Gulf",
        body: [
          "The Deep Sea Roundup is the oldest fishing tournament on the Texas coast. That longevity matters because the tournament's history mirrors the ecological and economic history of Port Aransas itself. It started as a tarpon event when tarpon were abundant. It adapted when tarpon declined. It survived wars and pandemics. It continues as a broad offshore fishing competition in an era when catch-and-release tarpon fishing has slowly returned.",
          "Every July, the tournament brings hundreds of anglers, families, and spectators to Port Aransas. It remains the defining summer event — a direct descendant of the 25 boatmen who decided, in 1932, that what their town needed was a fishing tournament.",
        ],
      },
    ],

    sources: [
      { label: "Deep Sea Roundup — About", url: "https://deepsearoundup.org/about/" },
      { label: "Port Aransas Boatmen", url: "https://paboatmen.org/" },
      { label: "Port Aransas South Jetty — Blow-by-Blow Tarpon Fishing", url: "https://www.portasouthjetty.com/articles/blow-by-blow-tarpon-fishing/" },
      { label: "Port Aransas Museum — Tarpon Era Exhibit", url: "https://portaransasmuseum.org/exhibits/tarpon-era/" },
    ],

    visitToday: [
      { place: "Deep Sea Roundup", detail: "Held every July at Roberts Point Park. Texas's oldest fishing tournament. ~600 entries in 2024." },
      { place: "Port Aransas Museum", detail: "The mounted tarpon from the first 1932 Rodeo is on display — entered under North Millican's name." },
      { place: "Roberts Point Park", detail: "301 J.C. Barr Blvd. Home to the Deep Sea Roundup, the Wooden Boat Festival, and the municipal marina." },
    ],
  },

  "farley-boats-craft": {
    lede: "Fred Farley never drew a blueprint. For sixty years, three generations of his family built sport fishing boats the same way: designs sketched directly on the wood flooring with colored carpenter's crayon, hull shapes demonstrated through hand-carved half-models, and every measurement carried in the builder's eye. The Farley method produced boats that outperformed anything on the Gulf Coast — vessels so precisely tuned to the conditions at Aransas Pass that a president chose one over his own yacht. But the method was inseparable from the men who practiced it. When fiberglass arrived in the 1960s, the Farleys didn't adapt. They couldn't. The craft died with the generation that knew it.",

    sections: [
      {
        heading: "Designs on the Floor",
        body: [
          "Walk into Farley Boat Works in 1940 and you'd see it immediately: the shop floor was the drafting table. Fred and his sons sketched hull lines directly onto the wood flooring using colored carpenter's crayon — full-scale outlines that showed the exact shape of the boat before a single plank was cut. When a prospective buyer came in, the Farleys walked them across plywood sheets laid on the floor with the boat's lines drawn out beneath their feet.",
          "For custom modifications, they carved half-models — small wooden boat halves, maybe a foot long, shaped by hand to show exactly how the finished hull would look from every angle. A buyer could hold the half-model, turn it in the light, and see their boat before it existed. No technical drawings. No naval architecture. Just wood, crayon, and a craftsman's eye that had been trained on Gulf Coast water since 1910.",
        ],
        fact: [
          { label: "Design method", value: "Carpenter's crayon on shop floor" },
          { label: "Custom demos", value: "Hand-carved pine half-models" },
          { label: "Formal blueprints", value: "Zero — ever" },
          { label: "Signature size", value: "18-footer for two people" },
        ],
      },
      {
        heading: "The V-Bottom Hull",
        body: [
          "Every design decision in a Farley boat traced back to one place: the mouth of Aransas Pass. The water there is choppy, current-driven, and unpredictable. Tarpon run through it. Guides needed a boat that could handle the chop, hold position in the current, and give an angler enough room to fight a fish that could weigh over a hundred pounds.",
          "The Farley answer was a V-bottom hull with a hard chine — angular where the hull sides met the bottom, not rounded. The chine didn't touch water until well aft of the bow, which meant the boat cut through chop instead of slapping against it. High bows combated the seas. Low sides with rounded tumblehomes made it easier to lean over the gunwale and land a fighting tarpon. Open cockpits with stern-facing fighting chairs. Front windshields with opening hatches for ventilation.",
          "The result was a boat so precisely matched to its environment that guides who fished other waters often found Farley hulls too specialized. But on the waters they were designed for, nothing else came close.",
        ],
        pullQuote: {
          text: "The chine doesn't touch water until well aft of the bow. That's why they cut through the chop instead of slapping against it.",
        },
      },
      {
        heading: "Cypress, Then Mahogany",
        body: [
          "Before World War II, the Farleys built with 5/8-inch-thick top-grade cypress planks. Cypress was the ideal boatbuilding wood for the Gulf Coast: lightweight, naturally resistant to rot, and strong enough to absorb the shock of rough water. The Farleys could get it locally and cheaply.",
          "The war changed that. Cypress became scarce as supply chains shifted to military production. After 1945, the Farleys switched to Honduran and Philippine mahogany — heavier, darker, but equally durable. The engines were never marine motors. They were converted automobile engines: Chrysler flatheads, Fords, Chevrolets. Some customers supplied their own. The combination of mahogany hull and automotive power was distinctly Farley — practical, unglamorous, and fast.",
        ],
      },
      {
        heading: "Beyond Tarpon Boats",
        body: [
          "The Farleys built everything from 16-foot skiffs to 28-foot offshore cruisers. In the 1920s, they built cabin-equipped boats for duck hunting guides. In the 1950s, as tarpon populations declined, they pivoted to offshore cruisers for the emerging deep-sea sportfishing market.",
          "The most dramatic commission came around 1928, when Gail Borden Munsill of the Borden dairy empire hired the Farleys to build a speedboat. It was capable of 60 miles per hour — extraordinary for a wooden hull in that era. The Munsill speedboat proved that Farley craftsmanship extended far beyond fishing. But tarpon boats remained the core. That's what the Gulf demanded, and that's what the Farleys knew best.",
        ],
        fact: [
          { label: "Range", value: "16 to 28 feet" },
          { label: "Pre-WWII wood", value: "Top-grade cypress" },
          { label: "Post-WWII wood", value: "Honduran & Philippine mahogany" },
          { label: "Engines", value: "Converted auto engines" },
        ],
      },
      {
        heading: "The Apprentice Problem",
        body: [
          "The Farley method had a fatal flaw: it couldn't be taught from a book. Every technique — reading the water, shaping the half-model, marking the floor, selecting the right plank for the right position on the hull — was transmitted by watching, doing, and correcting. Father to son. Uncle to nephew. Master to apprentice.",
          "Fred taught Jim and Fred Jr. Jim built the Tina. Don captained boats for FDR's visit. But the next generation came of age in the 1960s, when fiberglass boats were already cheaper, faster to produce, and easier to maintain. There was no economic reason to learn the old way. The market that had sustained the craft — wealthy tarpon anglers who would wait months for a custom wooden hull — was shrinking every year.",
        ],
      },
      {
        heading: "Fiberglass Trees",
        body: [
          "The Farleys closed sometime between 1973 and 1975. Mass-produced fiberglass hulls could be stamped out in days. A Farley boat took months. The economics were impossible.",
          "The family's position was simple and final. They were wooden boat builders. They had always been wooden boat builders. The apocryphal family quote survives: if God wanted fiberglass boats, He would have made fiberglass trees. They never switched materials. They never compromised the method. They just stopped.",
          "What was lost wasn't just a business. It was a way of reading water and translating it into wood — a craft practiced by one family, in one town, for sixty years. No manual survived because none had ever been written.",
        ],
        pullQuote: {
          text: "If God wanted fiberglass boats, He would have made fiberglass trees.",
          attribution: "The Farley family",
        },
      },
      {
        heading: "What Survives",
        body: [
          "Today at Farley Boat Works, volunteers build Port A Skiffs — flat-bottomed plywood fishing boats designed by Doyle Marek, not the V-bottom tarpon boats the Farleys made. The method is different. The materials are different. The boats serve a different purpose.",
          "But the half-models are still there. The original tools hang on the walls. The Tina — the only complete original Farley hull known to survive — sits on display after a fifty-year journey through five owners and three Texas cities. And every October at the Wooden Boat Festival, families compete to build a boat in three days, working with hand tools and plywood, keeping alive the idea that boats should be built by people who can feel the wood.",
        ],
      },
    ],

    sources: [
      { label: "PAPHA — History of Farley Boat Works", url: "https://portaransasmuseum.org/history-of-farley-boat-works/" },
      { label: "Farley Boats — Wikipedia", url: "https://en.wikipedia.org/wiki/Farley_Boats" },
      { label: "Texas Highways — Farley Boat Works Maritime Museum Expansion", url: "https://texashighways.com/travel-news/farley-boat-works-a-historic-link-to-port-aransas-tarpon-fishing-heyday-is-expanding-into-a-maritime-museum/" },
      { label: "Authentic Texas — The Fine Art of Wooden Craft", url: "https://issuu.com/authentictexas/docs/at-spring-2020-online/s/10450461" },
      { label: "Port Aransas South Jetty — Most Historical Boat", url: "https://www.portasouthjetty.com/articles/most-historical-boat-farley-boat-works/" },
    ],

    visitToday: [
      { place: "Farley Boat Works", detail: "716 W. Avenue C. Open Tue-Fri 9AM-4PM, Sat 10AM-2PM. See the original tools, half-models, and the Tina on display." },
      { place: "Wooden Boat Festival", detail: "Annual three-day event at Roberts Point Park every October. Five families compete to build a boat in three days." },
      { place: "Port Aransas Museum", detail: "A 1940s Farley boat wrecked by Hurricane Celia is on display, along with tarpon-era fishing equipment." },
    ],
  },

  "port-aransas-museum-collection": {
    lede: "The Port Aransas Museum sits inside a house that was ordered from a Sears, Roebuck catalog in 1910 and shipped to the island on a barge. Inside that house: a Third Order Fresnel lens made in 1860s Paris, nearly 40,000 historical photographs, 1920s silent film footage of island life, oral histories recorded on cassette tape, a 60-foot genealogy scroll tracing twenty local families to a single 1854 marriage, whale bones, a jetty train bell, and the mounted tarpon from the first Deep Sea Roundup in 1932. Most of this collection has never been digitized. Almost none of it is accessible online. This is what the island's institutional memory looks like — and why it matters that someone is keeping it.",

    sections: [
      {
        heading: "The House Itself",
        body: [
          "The building was built from a Sears, Roebuck and Company mail-order kit by Robert A. Mercer, son of Robert Ainsworth Mercer — the original 1855 settler of Mustang Island. It arrived on a barge and was assembled on the island in 1910. The Craftsman-style house later became known as the Neblett house, after Municipal Court Judge Duncan Neblett and former Mayor Georgia Neblett, who lived there for twenty years.",
          "The house survived the 1919 hurricane and served as a temporary Coast Guard station after the existing station was destroyed. It survived Hurricane Celia in 1970. In 2006, an out-of-town developer bought the property with plans to demolish it and build townhouses. The house was listed on Preservation Texas's Most Endangered Places list in 2007. PAPHA acquired it, spent over $45,000 to relocate it to the Community Center property, and opened the museum in December 2008. Preservation Texas updated its status to a single word: Saved.",
        ],
        fact: [
          { label: "Built", value: "1910 (Sears kit house)" },
          { label: "Original builder", value: "Robert A. Mercer" },
          { label: "Museum opened", value: "December 2008" },
          { label: "Address", value: "408 N. Alister Street" },
          { label: "Admission", value: "Free" },
        ],
      },
      {
        heading: "The Fresnel Lens",
        body: [
          "The centerpiece of the museum's collection is a Fourth Order Fresnel lens, originally installed in the Lydia Ann Lighthouse from 1878 to 1952. It was made in the 1860s by Augustin Henry Lapaute, a French lens maker whose ancestors had been clockmakers for Louis XVI and Louis XVII. The lens stands two feet four inches tall, a precisely engineered arrangement of glass prisms designed to bend lamplight into a beam visible for miles at sea.",
          "The Coast Guard decommissioned the lens in 1954 and the city eventually turned it over to the museum after its 2008 opening. In November 2022, Jean-Pierre Jacks — Lapaute's great-great-great-grandson — visited Port Aransas and identified a previously overlooked maker's engraving on the metal base. A lens made in Paris more than 160 years ago, identified by the craftsman's own descendant, displayed in a Sears kit house on a barrier island in Texas.",
        ],
        pullQuote: {
          text: "In November 2022, the lens maker's great-great-great-grandson visited Port Aransas and identified his ancestor's engraving on the metal base.",
        },
      },
      {
        heading: "38,000 Photos and Counting",
        body: [
          "The museum's photo archive has grown from an initial collection of around 8,000 images to nearly 40,000 photographs and documents spanning the late 1800s through the present. The subjects cover everything: fishing, storms, daily life, buildings, people, school children, the jetties, boats, the lighthouse, community events, families, the ferry, surfing history.",
          "The archive exists because of one person: Mark Creighton. A Cornell graduate who arrived in Port Aransas from the New Jersey shore in 1982, Creighton has been the primary archivist processing every historical photo added to the digital collection. He co-authored Images of America: Port Aransas with founding PAPHA member Dr. John Guthrie Ford. The vast majority of the photos in that book come from his archive.",
          "In one notable discovery, a Port Aransas resident named Cathy Fulton found twelve photographs dated 1929-1931 in a drawer of an abandoned trailer near Beach Access Road 1. The envelope was labeled \"Port Aransas school children.\" Creighton noted the children may have been from \"rag town,\" a tent community from the late 1920s and 1930s. Twelve photos, hidden for nearly a century, found by chance and brought to the one person on the island who would know what they meant.",
        ],
        fact: [
          { label: "Photos", value: "~40,000" },
          { label: "Primary archivist", value: "Mark Creighton" },
          { label: "Time span", value: "Late 1800s to present" },
          { label: "Online access", value: "Almost none" },
        ],
      },
      {
        heading: "Film, Tape, and Oral History",
        body: [
          "Beyond photographs, the museum holds rare 1920s and 1930s film footage of Port Aransas — silent film showing island life a century ago. The footage is available for viewing at the museum and copies can be purchased, but none of it appears to be accessible online in any form.",
          "The museum's ongoing Oral Histories Project records video interviews with important islanders — accounts of hurricanes, fishing, local characters, and daily life that exist nowhere else. These recordings sit on cassette tapes and digital video files inside the museum. No podcast. No YouTube channel. No audio archive.",
        ],
      },
      {
        heading: "The Genealogy Scroll",
        body: [
          "One of the museum's most extraordinary objects is a paper scroll approximately sixty feet long, tracing about twenty local families stemming from one 1854 marriage between Franz Joseph Frandolig and Hannah Anna Ellen Schwander. The families include the Moores, the Mathews, the Bujans, and roughly seventeen others. It's a single document that maps the genetic history of an entire island community back to a single union before the Civil War.",
          "The scroll is not digitized. It is not viewable online. It exists as a physical artifact inside a two-room museum in a house that was shipped to the island on a barge.",
        ],
      },
      {
        heading: "The Exhibits",
        body: [
          "The museum's permanent collection includes a 1940s Farley boat damaged by Hurricane Celia, gyotaku fish prints by Dinah Bowman (whose work is in the Smithsonian's permanent collection), whale bones, and the bronze bell from the Aransas Harbor Terminal Railway — the jetty train that hauled granite blocks 3.5 miles from Central Texas to the jetty construction site from 1892 until the railway closed in 1947.",
          "Rotating exhibits bring the collection to life. The Tarpon Era exhibit, opened in 2020, chronicles the 1880s through the late 1950s with rods, reels, trophies, and the mounted tarpon from the first Deep Sea Roundup — believed caught by Totsy Millican but entered under her husband North's name. The 2025 exhibit, Historic Families and Characters, includes Port Aransas's Black residents for the first time.",
        ],
        pullQuote: {
          text: "The 2025 exhibit includes Port Aransas's Black residents for the first time.",
        },
      },
      {
        heading: "The Digital Gap",
        body: [
          "The museum's physical collection is extraordinary. Its digital presence is not. Almost none of the 40,000 photos are accessible online. No oral histories are published digitally. The 1920s film footage isn't available in any online form. There's no searchable collection database, no virtual exhibits, no digital storytelling.",
          "This isn't a criticism — it's a reality of a small nonprofit running on $464,000 a year with a staff of three. PAPHA has grown from a small preservation society founded in 2002 to an organization managing multiple properties with over two million dollars in assets. The digital frontier is the obvious next step. Until then, the only way to see what the island has saved is to walk through the door.",
        ],
      },
    ],

    sources: [
      { label: "PAPHA — Port Aransas Museum", url: "https://portaransasmuseum.org/" },
      { label: "Images of America: Port Aransas — Arcadia Publishing", url: "https://www.arcadiapublishing.com/products/9780738579580" },
      { label: "Port Aransas South Jetty — Museum Coverage" },
      { label: "Preservation Texas — Most Endangered Places (2007)" },
      { label: "PAPHA Annual Report / Tax Filings (FY 2024)" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "408 N. Alister Street. Free admission. Thu-Sat 1-5 PM. Docent-led tours. The Fresnel lens, train bell, and Tarpon Era exhibit are all here." },
      { place: "Farley Boat Works", detail: "716 W. Avenue C. The working boat shop is a PAPHA property — see original Farley tools and the Tina." },
      { place: "Chapel on the Dunes", detail: "Free PAPHA-led tours on the 1st and 3rd Saturday of each month, 9:15 AM." },
    ],
  },

  "mercer-logs": {
    lede: "On March 1, 1866, Robert Ainsworth Mercer opened a large bound ledger book on Mustang Island and began to write. The Civil War had just ended. Federal troops had spent four years blockading Aransas Pass, burning buildings, and confiscating cattle. The Mercers had abandoned their homes and fled inland. Now they were back, and Robert began recording everything: the weather, the ships, the storms, the births, the funerals, the feuds, the rescues, and the slow return of life to a barrier island that had been occupied and emptied. He wrote in the third person, in ship's log format, always concerned with the weather. His sons John and Edward continued after him. Six bound ledger books survive, spanning 1866 to 1881. They are among the most complete maritime records on the Texas coast.",

    sections: [
      {
        heading: "The First Settler's Son",
        body: [
          "Robert Ainsworth Mercer was the son of the original 1855 settler of Mustang Island. His father had claimed land on the barrier island before the Civil War, when Aransas Pass was the primary commercial channel connecting the Texas interior to Gulf shipping routes. The Mercers were not wealthy planters or speculators. They were working people who lived by the water and understood that the channel was the island's reason for existing.",
          "It was Robert A. Mercer who later built the Sears kit house that would become the Port Aransas Museum — ordered from the catalog in 1910 and shipped to the island on a barge. But the logs predate that house by half a century.",
        ],
      },
      {
        heading: "What the Logs Contain",
        body: [
          "The six ledger books read like the operating system of a barrier island. Robert Mercer recorded the coming and going of every ship through Aransas Pass — names, tonnage, cargo, destinations. He documented the weather obsessively, noting wind direction, temperature, and sea conditions. He recorded shipwrecks and rescues. He noted births, deaths, marriages, and funerals.",
          "The logs also contain something rarer: the texture of daily life on a remote island in the 1860s and 1870s. Family feuds. Parties. The education of children. Place names that no longer exist. Boat names that appear nowhere else in the historical record. The Mercer Logs are not just shipping records — they are the closest thing that exists to a real-time diary of post-Civil War life on the Texas barrier islands.",
        ],
        fact: [
          { label: "First entry", value: "March 1, 1866" },
          { label: "Span", value: "1866–1881" },
          { label: "Format", value: "Ship's log, third person" },
          { label: "Volumes", value: "6 bound ledger books" },
          { label: "Authors", value: "Robert, John, and Edward Mercer" },
        ],
        pullQuote: {
          text: "He wrote in the third person, in ship's log format, always concerned with the weather.",
        },
      },
      {
        heading: "After the Blockade",
        body: [
          "The timing of the first entry is significant. Federal troops had blockaded Aransas Pass from 1862 to 1866, cutting off the commercial shipping that was the island's economic lifeline. They set fire to buildings and appropriated cattle. The Mercer family — like most island residents — abandoned their homes and relocated inland for the duration of the war.",
          "When Robert began writing on March 1, 1866, he was documenting a community rebuilding from nothing. The first entries record which ships returned, which families came back, and what condition the island was in. The logs are, in their earliest pages, a record of recolonization — the same families returning to the same barrier island and starting over.",
        ],
      },
      {
        heading: "Three Generations of Record-Keepers",
        body: [
          "Robert Mercer kept the logs through his death in 1875. His sons John and Edward continued the practice, maintaining the same ship's log format their father had established. There is evidence that wives occasionally contributed entries as well, though the primary record-keepers were the Mercer men.",
          "The handwriting changes. The concerns shift — later entries reflect a more settled community, less focused on survival and more on commerce and civic life. But the format holds. The weather always comes first. The ships always get named. The dead always get recorded.",
        ],
      },
      {
        heading: "Preservation and Transcription",
        body: [
          "Five of the six logs were microfilmed by La Retama Library in Corpus Christi in 1976 — a fortunate act of preservation for documents that had survived over a century of Gulf Coast hurricanes. A sixth log was discovered that same year by a Mercer descendant in Rockport. It awaits transcription.",
          "The most significant transcription work was done by Dr. John Guthrie Ford, a founding member of PAPHA and retired Trinity University psychology professor. Ford transcribed the first five logs into searchable Microsoft Word documents, transforming handwritten 19th-century cursive into text that historians and researchers could actually work with. PAPHA published selections in hardback, available at the museum gift shop.",
          "Ford died in 2018. PAPHA now awards the Dr. John Guthrie Ford History Award for historical scholarship — a fitting legacy for a man who spent years translating another man's handwriting into something the future could read.",
        ],
        pullQuote: {
          text: "Dr. Ford spent years translating 19th-century handwriting into something the future could read. PAPHA now awards a history prize in his name.",
        },
      },
    ],

    sources: [
      { label: "PAPHA — Port Aransas Museum", url: "https://portaransasmuseum.org/" },
      { label: "Port Aransas Museum Research Files — Mercer Logs Section" },
      { label: "La Retama Library (Corpus Christi) — 1976 Microfilm" },
      { label: "Images of America: Port Aransas — Ford and Creighton (Arcadia Publishing, 2011)" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "408 N. Alister Street. Free admission. Thu-Sat 1-5 PM. Published selections of the Mercer Logs available at the gift shop." },
      { place: "The Mercer House", detail: "The Sears kit house that is now the museum was built by Robert A. Mercer's son — the same family that kept the logs." },
    ],
  },

  "red-tide-utmsi": {
    lede: "In 1935, millions of dead fish washed up along the Texas coast near Port Aransas. A University of Texas zoologist named Elmer Lund traveled to the island to investigate. He built a one-room shack on an old Army Corps of Engineers dock, spent the summer collecting samples, and left with more questions than answers. He went back to Austin convinced that the university needed a permanent marine research station on the coast. Six years later, the Institute of Marine Science opened in Port Aransas — the first permanent marine research station in the state of Texas. The organism that caused the fish kill would not be formally identified for another decade. But the questions it raised built a university.",

    sections: [
      {
        heading: "Three Failed Starts",
        body: [
          "The idea for a Texas marine laboratory goes back to 1892, when the UT Board of Regents reported to the governor about the need for a coastal research station. In May 1900, the regents allocated $300 for a small facility in Galveston. The catastrophic 1900 Galveston hurricane destroyed it. A second attempt was wiped out by a 1915 tropical storm. The coast kept saying no.",
          "It took a disaster of a different kind — not a hurricane, but a biological event nobody could explain — to finally make the case that Texas needed eyes on its own water.",
        ],
      },
      {
        heading: "The 1935 Fish Kill",
        body: [
          "The dead fish were primarily menhaden and mullet — millions of them, washed up along miles of Texas coastline. We now know the cause was a red tide: an algal bloom caused by dinoflagellates that deplete oxygen and produce natural toxins. The specific organism, Karenia brevis, would not be formally identified until 1946-47, from a Florida bloom. Records of similar fish kills on the Gulf Coast date back to at least 1530.",
          "Dr. Elmer Julius Lund was a UT zoologist and biophysicist who had earned his PhD from Johns Hopkins in 1914 and joined UT's faculty in 1926. When he arrived in Port Aransas in 1935, he and colleague Dr. A.H. Wiebe constructed a rough-lumber, one-room laboratory on an old Army Corps of Engineers dock. Lund spent the summer studying the bloom, but his resources were completely inadequate for the scope of the event. He returned to Austin frustrated — and determined.",
        ],
        fact: [
          { label: "Event", value: "Massive fish kill, 1935" },
          { label: "Cause", value: "Red tide (Karenia brevis)" },
          { label: "Investigator", value: "Dr. Elmer J. Lund" },
          { label: "First lab", value: "One-room shack on a dock" },
        ],
      },
      {
        heading: "Ten Acres from the Mayor",
        body: [
          "In 1940, Port Aransas mayor Boone Walker donated ten acres of his own property to the university for a biological laboratory. It was the kind of gesture that defined small-town Texas: a mayor giving away his land because he believed the science mattered and the island was the right place for it.",
          "With Walker's donation and Board of Regents approval, the Institute of Marine Science was formally established in 1941, with Elmer Lund as its first director. UT purchased twelve acres and relocated an 1890s Army Corps of Engineers building onto the property. That building still stands today — known as Dormitory B, it is reportedly the oldest building on Mustang Island.",
        ],
        pullQuote: {
          text: "The mayor donated ten acres of his own land. A zoologist built a shack on a dock. That's how Texas got its first permanent marine research station.",
        },
      },
      {
        heading: "Building a Station",
        body: [
          "By 1946, UTMSI had become the state's first permanent marine research station. Two permanent frame buildings and a 200-foot pier into Aransas Pass were constructed. Lund established the Publications of the Institute of Marine Science — later renamed Contributions in Marine Science, still published annually. The institute's first scientific publication was a comprehensive study of the marine fishes of Texas by Dr. Gordon Gunter.",
          "Lund served as director until 1949. He also personally purchased and donated twelve additional acres to expand the facility. He didn't just found the institute — he funded its growth out of his own pocket.",
        ],
      },
      {
        heading: "Growth on the Gulf",
        body: [
          "The decades after Lund built a campus. In 1961, Dr. Howard T. Odum spearheaded construction of the institute's first proper laboratory complex, boat docks, and outdoor seawater ponds. In 1965, Dr. Donald Wohlschlag secured 49 acres of beachfront property, cementing the institute's long-term future. By 1970, additional laboratories, housing, and a boat basin had been built under Dr. Carl Oppenheimer.",
          "In 1982, researcher Tony Amos founded the Amos Rehabilitation Keep — known locally as the ARK — for sea turtle and marine bird rehabilitation. The ARK became one of the most visible connections between the institute and the community, a place where islanders could bring injured wildlife and watch the recovery.",
        ],
        fact: [
          { label: "Founded", value: "1941" },
          { label: "First director", value: "Dr. Elmer J. Lund" },
          { label: "Campus", value: "72 acres on the ship channel" },
          { label: "Faculty", value: "~16 members" },
          { label: "Graduate students", value: "~41" },
        ],
      },
      {
        heading: "Harvey and After",
        body: [
          "On August 25, 2017, Hurricane Harvey made landfall with Category 4 winds directly over UTMSI. The damage totaled approximately $45 million. NOAA awarded $11.7 million for recovery. The campus was rebuilt, and the Patton Center for Marine Science Education — renovated with support from NOAA and philanthropists Bobby and Sherri Patton — is now free and open to the public.",
          "Today the institute sits on 72 acres at the mouth of Aransas Pass. Its research focuses on fish ecology, biogeochemistry, oil spill impacts, microplastics, mariculture, and — circling back to where it all started — harmful algal blooms. The red tides that built the university are still the red tides that keep its scientists up at night.",
        ],
        pullQuote: {
          text: "The red tides that built the university are still the red tides that keep its scientists up at night.",
        },
      },
    ],

    sources: [
      { label: "UTMSI — Official History", url: "https://utmsi.utexas.edu/about/history" },
      { label: "PAPHA Winter History Lecture Series — UTMSI Presentation (2024)" },
      { label: "Port Aransas Museum Research Files — Timeline" },
      { label: "Texas State Historical Association — Marine Science Institute" },
    ],

    visitToday: [
      { place: "Patton Center for Marine Science Education", detail: "Free and open to the public, Tue-Sat. Aquaria, exhibits, and educational programs on the UTMSI campus." },
      { place: "UTMSI Campus", detail: "750 Channel View Dr. The oldest building on Mustang Island — an 1890s Army Corps building — is still in use as student housing." },
      { place: "The ARK", detail: "Sea turtle and marine bird rehabilitation center on campus, founded 1982." },
    ],
  },

  "port-aransas-ferry": {
    lede: "Port Aransas is one of the few communities on the Texas coast that you still have to take a boat to reach. The ferry across Aransas Pass has operated in some form since the 1920s — from a one-car side-wheeler named the Mitzi to a state-run fleet of eight vessels that moves millions of vehicles a year, twenty-four hours a day, free of charge. There has never been a bridge. The ferry is the reason Port Aransas still feels like an island. That's not nostalgia. That's infrastructure.",

    sections: [
      {
        heading: "Before the Ferry",
        body: [
          "Before any organized ferry service, people crossed the Aransas Pass channel by private skiffs, rowboats, and sailboats. The Port Aransas Skiff — the same flat-bottomed plank boat that families used for fishing, duck hunting, and crabbing — doubled as basic transportation across the bays and channels. If you wanted to get to Port Aransas, you found someone with a boat.",
          "By 1911, a railroad — the Aransas Harbor Terminal Railway — had been built to service Port Aransas via Harbor Island. Before the causeway road was built, a driver would buy a ticket, load their vehicle onto a flatbed rail car, and ride the rails across. When trains weren't running, drivers could use wooden planks laid inside the rails to drive their cars manually along the tracks.",
        ],
      },
      {
        heading: "The Munsill Ferry",
        body: [
          "In 1926, Sam Robertson started the first regular ferry service — a one-hour ride across the channel, four times daily in each direction. But it was Gail Borden Munsill, heir to the Borden dairy fortune, who transformed the crossing.",
          "In 1928, Munsill purchased the Harbor Island Terminal Railroad improvements and launched ferry service using the side-wheel ferry Mitzi, which carried six automobiles. He converted the railroad trestle into a one-way toll road made of wooden planks. At the opening, over 100 cars headed to Harbor Island. Demand outgrew the Mitzi quickly, so Munsill commissioned a larger ferry — the Rufus R, christened in Galveston with a bottle of Gulf water from Port Aransas. It cost $30,000 and held 18 cars. It burned to the waterline shortly after arriving in October 1931.",
        ],
        fact: [
          { label: "First regular service", value: "1926" },
          { label: "Munsill era", value: "1928-1934" },
          { label: "First ferry", value: "Mitzi (6 cars)" },
          { label: "Toll", value: "$1 each direction" },
        ],
        pullQuote: {
          text: "The Rufus R cost $30,000 and held 18 cars. It burned to the waterline shortly after arriving.",
        },
      },
      {
        heading: "County Takes Over",
        body: [
          "Munsill died in 1934. The operation passed through several hands before Nueces County purchased it for $250,000 in 1951. The county judge told the new superintendent, Melvin Littleton, directly: either he made money, or he was out of a job.",
          "Littleton served from 1951 to 1982 and transformed the operation. Unable to raise the $1 toll rate, he focused on increasing off-season traffic. Ferry personnel built the Ancel Brundrett Pier, Horace Caldwell Pier, Roberts Point Park pier, and boat launching ramps during off-seasons. Staff created roadside signs promoting Port Aransas along Midwest highway routes. By 1960, Littleton had cut the roundtrip fare in half and relocated ferry landings to shorten the crossing, enabling more trips per vessel.",
        ],
      },
      {
        heading: "The State Steps In",
        body: [
          "On January 1, 1968, the Texas Highway Department — now TxDOT — assumed operation of the ferry system. Tolls were eliminated. The ferry became free.",
          "Before the transfer, Littleton made sure the ferry account surplus funded new vessels. The state began with six. Today the fleet numbers eight — five holding 28 vehicles each and three holding 20 — all named after former TxDOT executive directors. The current ramp system has been in place since 1986, and a new ferry headquarters building was completed in 2015.",
        ],
        fact: [
          { label: "TxDOT takeover", value: "January 1, 1968" },
          { label: "Current fleet", value: "8 vessels" },
          { label: "Capacity", value: "20-28 vehicles each" },
          { label: "Cost", value: "Free" },
          { label: "Schedule", value: "24/7, 365 days" },
        ],
      },
      {
        heading: "Twenty-Four Hours a Day",
        body: [
          "The Port Aransas ferry operates twenty-four hours a day, 365 days a year, weather permitting. Between two and six ferries run at any given time depending on traffic and season. The crossing takes roughly ten minutes across a quarter-mile of the Corpus Christi Ship Channel on State Highway 361.",
          "The numbers are staggering: approximately 2.4 to 3 million vehicles and up to 6 million passengers per year. During Spring Break 2023, 121,201 vehicles and 227,568 passengers crossed in eighteen days. The operation burns roughly 15,000 gallons of diesel per week and employs 136 TxDOT staff, plus contracted flaggers and security guards. It is one of only two state-operated ferry systems in Texas — the other runs between Galveston and Bolivar Peninsula.",
        ],
      },
      {
        heading: "Why No Bridge",
        body: [
          "The Corpus Christi Ship Channel at Aransas Pass handles a constant flow of large freighters, tankers, and offshore rigs. Any fixed crossing would need to be tall enough for commercial shipping — a massive engineering project with a price tag to match. The topic has been studied and debated for decades. A bridge or tunnel has been proposed multiple times.",
          "Many Port Aransas residents actively oppose a fixed crossing. The ferry acts as a natural throttle on traffic and development. It forces visitors to slow down, to wait, to feel the transition from mainland to island. Removing it would make Port Aransas just another beach town accessible by highway. The ferry is inconvenient by design — and that inconvenience is, for many locals, the point.",
        ],
        pullQuote: {
          text: "The ferry is inconvenient by design — and that inconvenience is, for many locals, the point.",
        },
      },
    ],

    sources: [
      { label: "Port Aransas Museum Research Files — Timeline" },
      { label: "TxDOT — Port Aransas Ferry Operations", url: "https://www.txdot.gov/about/districts/corpus-christi/port-aransas-ferry.html" },
      { label: "Port Aransas South Jetty — Ferry Coverage" },
      { label: "Texas State Historical Association — Port Aransas" },
    ],

    visitToday: [
      { place: "The Ferry", detail: "Free, 24/7. Board from Port Street stacking lanes in Aransas Pass. Crossing takes ~10 minutes. Watch for dolphins in the channel." },
      { place: "Roberts Point Park", detail: "301 J.C. Barr Blvd. Watch the ferries cross from the park's waterfront, with the ship channel and dolphins in view." },
    ],
  },

  "cinnamon-shore-tension": {
    lede: "In 2007, a developer named Jeff Lamkin opened Cinnamon Shore on Mustang Island — a master-planned beach community modeled after the New Urbanist developments along Florida's Highway 30A. Walkable streets, Gulf Coast architecture, front porches designed to encourage neighborly conversation. The first phase covered 63 acres and 225 homes with a median price of a million dollars. A second phase, announced in 2017, was a $1.3 billion expansion across 300 acres. To some, Cinnamon Shore brought world-class design and investment to a coast that needed it. To others, it represented exactly the kind of development that would price the locals out of their own island. Both sides were right.",

    sections: [
      {
        heading: "The Vision",
        body: [
          "Lamkin's stated model was the communities along Florida's 30A corridor — Seaside, WaterColor, Rosemary Beach, Alys Beach — but adapted for the Texas coast. The design philosophy was New Urbanist: walkable grid streets instead of cul-de-sacs, mixed housing types instead of uniform subdivisions, a town center with local retailers instead of chain stores. Principal architect Jim Kissling has completed nearly 40 projects at Cinnamon Shore since 2009.",
          "Cinnamon Shore North took 17 years to build out. As the community filled, Lamkin announced Cinnamon Shore South in June 2017 — 550 homes over 147 acres, with a projected 15-to-20-year buildout. Groundbreaking was October 2018. A third subdivision of 250 homes on the bayside is in conceptual design. When complete, Cinnamon Shore will be one of the largest planned communities on the Texas coast.",
        ],
        fact: [
          { label: "Developer", value: "Jeff Lamkin / Sea Oats Group" },
          { label: "Phase I", value: "63 acres, ~225 homes" },
          { label: "Phase II", value: "300 acres, $1.3B" },
          { label: "Median price", value: "~$1 million" },
          { label: "Style", value: "New Urbanist" },
        ],
      },
      {
        heading: "The Community Response",
        body: [
          "The defining confrontation between Cinnamon Shore and Port Aransas came over Beach Access Road 1B. The city proposed a new beach access road for emergency vehicle access on the southern end of town. Cinnamon Shore property owners opposed the original route adjacent to their subdivision, citing decreased property values and safety concerns.",
          "The debate intensified when Cinnamon Shore sent an email urging property owners to register to vote in Port Aransas and support candidates favoring their development plans. Nueces County tax records showed that only 2 of 526 Cinnamon Shore owners had homestead exemptions — meaning only two were full-time residents. The rest were vacation homeowners and investors being asked to vote on issues affecting a community they didn't live in year-round.",
        ],
        pullQuote: {
          text: "Only 2 of 526 Cinnamon Shore owners had homestead exemptions. The rest were vacation homeowners being asked to vote on issues affecting a town they didn't live in.",
        },
      },
      {
        heading: "What Harvey Changed",
        body: [
          "Hurricane Harvey made landfall near Port Aransas on August 25, 2017, with Category 4 winds. An estimated 70% of buildings were damaged. 100% of Port Aransas businesses sustained damage. Total losses reached roughly $1 billion. The building department issued 5,539 permits in the ten months after Harvey — more than three times the normal rate.",
          "Cinnamon Shore's newer, code-compliant construction sustained minimal damage by comparison. Management brought in 120 generators to prevent mold. This became a marketing point: the resilience of new construction versus the vulnerability of the older housing stock that gave Port Aransas its character.",
          "The rebuilding period accelerated the transformation. Older, affordable housing — clapboard cottages, modest rentals — was destroyed and replaced by higher-end construction. Harvey didn't create the development pressure. It removed the buildings that had been standing in its way.",
        ],
      },
      {
        heading: "The Affordability Question",
        body: [
          "The tension isn't abstract. Port Aransas is a town where restaurant workers, fishing guides, and shop employees need to live close to their jobs. As property values rise and short-term vacation rentals replace long-term housing, the people who make the island function get pushed further from it.",
          "Housing has been identified as the number one issue facing the community. Condos damaged by Harvey have been particularly slow to come back. Eight years after the storm, Port Aransas is still rebuilding — but what's being rebuilt doesn't always look like what was there before.",
        ],
      },
      {
        heading: "The Question That Stays",
        body: [
          "Every coastal community faces some version of this. Growth brings investment, tax revenue, and attention. It also brings traffic, higher prices, and a slow erosion of the qualities that attracted people in the first place. Port Aransas is not Seaside. It's a fishing town with a working ship channel, a ferry that throttles traffic, and a museum in a Sears kit house. The question is whether it can absorb a billion dollars in master-planned development and still be the place that locals recognize.",
          "There is no villain in this story. Lamkin built something architecturally ambitious on a coast that was mostly strip motels and bait shops. The community that pushed back was protecting something real — an island identity built over a century of storms, recoveries, and the stubborn refusal to become somewhere else. Both positions are defensible. The tension between them is the story.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas South Jetty — Cinnamon Shore Coverage" },
      { label: "Texas Architect Magazine — Cinnamon Shore (2020)", url: "https://magazine.texasarchitects.org/2020/05/06/architect-designed-luxury-developments-in-port-aransas-weather-the-storm/" },
      { label: "Houston Public Media — Harvey and Port Aransas (2018)", url: "https://www.houstonpublicmedia.org/articles/news/2018/08/20/300865/harvey-damaged-100-percent-of-port-aransas-businesses-but-the-island-town-is-working-its-way-back/" },
      { label: "Sea Oats Group — Cinnamon Shore South Announcement (2017)" },
    ],

    visitToday: [
      { place: "Cinnamon Shore", detail: "Drive through on SH 361 south of Port Aransas. The New Urbanist architecture and town center are visible from the road." },
      { place: "Old Town Port Aransas", detail: "Walk the blocks between Station Street and the harbor. The contrast between original island architecture and new construction tells the story." },
    ],
  },

  "tarpon-inn": {
    lede: "The Tarpon Inn was never meant to be a hotel. In 1886, when contractors began the first serious attempt to jetty the shifting sandbars of Aransas Pass, they needed somewhere to house the workers. They used what they had: surplus lumber from a Civil War Army barracks, nailed together fast on a piece of Mustang Island dry enough to stand on. When the jetty work slowed and the workers left, the building stayed. Someone put cots and a sign on it and called it a hotel. Over the next hundred and forty years, that hotel became the single most important building in American tarpon fishing — a place where presidents signed scales, where the first sport-fishing club on the Gulf held its meetings, and where a hurricane in 2017 ripped the roof off but somehow left the scales on the wall.",

    sections: [
      {
        heading: "Barracks Wood and a Sign",
        body: [
          "The timing of the Tarpon Inn's founding is not a coincidence. The first federal jetty project at Aransas Pass had begun in 1880, and by the mid-1880s work was accelerating. Men needed a place to sleep. The building that went up in 1886 was simple — long, low, wooden, built from whatever could be shipped in cheaply. It sat near the mouth of the pass with nothing much around it.",
          "When the first jetty attempt stalled in 1889, the workers cleared out. The barracks building was repurposed. It began taking in the men who were starting to arrive on Mustang Island for a different reason entirely: fishing.",
        ],
        fact: [
          { label: "Year built", value: "1886" },
          { label: "Original purpose", value: "Barracks for jetty workers" },
          { label: "Material", value: "Surplus Civil War Army lumber" },
          { label: "Now on wall", value: "7,000+ signed tarpon scales" },
        ],
      },
      {
        heading: "The Silver King's Clubhouse",
        body: [
          "By the 1890s, Port Aransas — still called Tarpon at the time — was becoming the premier tarpon fishing destination in the United States. The Tarpon Inn sat at the center of it. Guests breakfasted there before heading out with their guides, and the Inn packed their lunches. They came back at sunset to clean up and eat dinner in the dining room, the day's scales already being signed and tacked to the wall.",
          "The tradition of mounting signed scales began informally and never stopped. Anglers who had landed a tarpon would write their name and the date on a scale the size of a silver dollar and give it to the Inn. By the mid-twentieth century, the walls were covered. Today there are more than seven thousand of them — a shingled mural of every angler who mattered on the Texas coast, the oldest dating back to the 1880s.",
        ],
        pullQuote: {
          text: "Seven thousand signed scales on the walls — a shingled mural of every angler who mattered on the Texas coast.",
        },
      },
      {
        heading: "Ed Cotter and the First Powerboat",
        body: [
          "The Tarpon Inn's most consequential owner was Ed Cotter, a boatman whose name still hangs on a street running through town. Around 1900, Colonel Ned Green of New York — a wealthy New York sportsman — bought a powerboat and paid Cotter to travel to Chicago to learn how to operate its Packard engine, which burned naphtha. By about 1904, Cotter had begun using the motorboat to tow his skiffs out to the fishing grounds. It is believed to be the first use of a motorized vessel for sport fishing anywhere in the United States.",
          "Cotter bought the Tarpon Inn and ran it for years. The building became not just a hotel but the headquarters of a fishing economy — the place where guides were hired, where the Tarpon Club held its meetings, where the Hooper Trophy was awarded.",
        ],
      },
      {
        heading: "The Scales That Matter",
        body: [
          "Two scales on the lobby wall are more valuable than the rest combined. One is from President Franklin D. Roosevelt's five-foot, seventy-seven-pound tarpon, caught at 3:27 PM on May 8, 1937, off the Potomac with Barney Farley aboard. FDR signed it.",
          "The other is from a tarpon landed by Dr. Stirling E. Russ on July 13, 1931 — seven feet long and one hundred sixty-eight pounds. The fish itself, not just the scale, is mounted on the wall of the Inn. It was the kind of catch that made the Port Aransas legend.",
          "Aimee Semple McPherson — the Los Angeles evangelist and radio personality of the 1920s and 1930s — has a signed scale on the wall too. So do dozens of oilmen, governors, Texas Rangers, and the wives of all of them.",
        ],
      },
      {
        heading: "What Harvey Took and Didn't",
        body: [
          "On August 25, 2017, Hurricane Harvey made landfall near Port Aransas as a Category 4 storm. Roughly seventy percent of the town's buildings were damaged. One hundred percent of businesses sustained damage. The Tarpon Inn, at the center of it all, lost portions of its roof and sections of its upper structure.",
          "The scales survived. Staff had taken precautions, and the lobby walls held. The Inn closed, then reopened after roughly eight months of restoration. Today it still operates — rooms upstairs, the scales downstairs, and the Silver King Bar at the back. It is not the oldest hotel in Texas, but it is almost certainly the most photographed interior on the Gulf Coast.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas Museum Research Files — The Tarpon Era" },
      { label: "Tarpon Inn — History", url: "https://www.thetarponinn.com/about-us" },
      { label: "Wikipedia — Tarpon Inn", url: "https://en.wikipedia.org/wiki/Tarpon_Inn" },
      { label: "Texas State Historical Association — Port Aransas", url: "https://www.tshaonline.org/handbook/entries/port-aransas-tx" },
      { label: "Port Aransas Museum Research Files — Port Aransas Timeline" },
    ],

    visitToday: [
      { place: "The Tarpon Inn Lobby", detail: "200 E. Cotter Ave. Walk in and look at the walls. The scales are free to see — you don't have to be a guest. The FDR scale is in a glass case." },
      { place: "Silver King Bar", detail: "Inside the Inn. Mounted tarpon on the wall, original woodwork, Gulf view from the upstairs porch." },
      { place: "Cotter Avenue", detail: "The street in front of the Inn. Named for Ed Cotter, the Inn's most important owner and the man who invented motorboat sport fishing in America." },
    ],
  },

  "port-aransas-jetties": {
    lede: "Aransas Pass was, for most of recorded history, impossible. The gap between Mustang Island and San José Island was a shallow, shifting mess of sandbars that silted up after every storm and rearranged itself with the tides. Shallow-draft ships could sometimes squeeze through. Deep-draft ships could not. The tarpon that made this coast famous and the ship channel that would eventually make it rich both depended on one thing: someone figuring out how to hold the pass open. It took thirty-nine years, three separate attempts, and an enormous amount of Hill Country granite to finally do it.",

    sections: [
      {
        heading: "Phase One: The Brush Mattress (1880–1885)",
        body: [
          "In 1879, Congress passed a resolution authorizing the deepening of Aransas Pass. In May of 1880, Samuel M. Mansfield began the work. The design that emerged — driven by available budget and limited engineering precedent on this coast — was a five-thousand-five-hundred-foot jetty built from a brush mattress foundation topped with stone.",
          "The logic was that the brush would settle into the sand and provide a stable base. It did not. The mattress decayed, the stone slumped, and by 1885 the project was clearly failing. In 1889, the federal government gave up and abandoned it.",
        ],
      },
      {
        heading: "Phase Two: The Bankrupt Company (1890–1897)",
        body: [
          "When the federal government left, local entrepreneurs formed the Aransas Pass Harbor Company to pick up the work. They raised private capital and began building a wooden-cased jetty system, again topped with rock. The wooden casings failed in the surf, and the company switched mid-project to an all-rock design. That was more expensive. The company ran through its money and declared bankruptcy in 1897.",
          "After two attempts and seventeen years, Aransas Pass was still not reliably open to deep-water shipping. Federal and private dollars had both tried and both failed.",
        ],
      },
      {
        heading: "Phase Three: The Army Corps and the Granite (1899–1919)",
        body: [
          "In 1899, Congress authorized the Army Corps of Engineers to return and finish the job. This time the design was right and the execution was relentless. The north jetty came first, built out from San José Island. The south jetty followed, extending from Mustang Island.",
          "The stone was the right stone. Enormous granite blocks — many weighing several tons — were quarried from the Llano Uplift in Central Texas and railed down to the coast. A Rockport-based contracting firm, D.M. Picton, handled much of the jetty work. Workers came from all over, including European immigrants: one named Matteo Bujan arrived from Croatia and stayed in Port Aransas, his descendants still in town.",
          "In 1907 the north jetty was nearing completion and the south was authorized. In 1911 the work was considered substantially complete. In 1919, after another eight years of extension and reinforcement, both jetties were fully finished.",
        ],
        pullQuote: {
          text: "Enormous granite blocks, many weighing several tons, quarried from the Llano Uplift and railed down to the coast.",
        },
      },
      {
        heading: "The Railway That Hauled the Rock",
        body: [
          "None of it would have been possible without a single-purpose railroad. The Aransas Harbor Terminal Railway was chartered on June 13, 1892, specifically to haul granite from mainland quarries to the pass. Railroad flatcars brought the stone to the shore of Redfish Bay. From there, the Terminal Railway's trestle carried the rock three and a half miles over open water, where it was transferred to barges, towed out into the Gulf, and dumped into position.",
          "The railway operated for over fifty years. It closed in 1947. Almost nothing of it remains visible today — a few pilings, some rotted trestle wood in low tide. But the bronze bell from its steam engine sits in the Port Aransas Museum. Visitors are encouraged to touch it.",
        ],
        fact: [
          { label: "Railway chartered", value: "June 13, 1892" },
          { label: "Trestle length", value: "3.5 miles over Redfish Bay" },
          { label: "Closed", value: "1947" },
          { label: "Granite source", value: "Llano Uplift, Central Texas" },
          { label: "Lead contractor", value: "D.M. Picton firm of Rockport" },
        ],
      },
      {
        heading: "What the Jetties Built",
        body: [
          "A reliable deep-water channel at Aransas Pass changed everything. Within a decade of the jetties' completion, Port Aransas had become a serious sport fishing destination — the Tarpon Era was already underway but now had the infrastructure to support it. By the 1940s, Port Aransas was the twelfth-largest oil shipping port in the United States. Harbor Island, just inside the pass, was lined with refineries and tanker berths.",
          "Modern tourism depends on the jetties too. The south jetty walk is the single most photographed feature on the island. Surfers ride the breaks that form against the rock. Fishermen work the channel. Dolphins chase shrimp boats into the pass. None of that happens without thirty-nine years of failed attempts followed by twenty years of granite.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas Museum Research Files — Port Aransas Timeline" },
      { label: "Port Aransas South Jetty — Building the Jetties", url: "https://www.portasouthjetty.com/articles/building-the-jetties/" },
      { label: "Texas State Historical Association — Aransas Harbor Terminal Railway", url: "https://www.tshaonline.org/handbook/entries/aransas-harbor-terminal-railway" },
      { label: "PortAransas.com — The Port Aransas Jetties", url: "https://portaransas.com/the-port-aransas-jetties/" },
      { label: "Port Aransas Preservation and Historical Association — Taming the Channel Exhibit", url: "https://portaransasmuseum.org/exhibits/taming-the-channel-the-pass-must-be-caught/" },
    ],

    visitToday: [
      { place: "South Jetty Walk", detail: "Accessible from the end of Cotter Avenue. Walk out on the granite blocks — many of them more than a century old. Dolphins, shrimp boats, and the ship channel are all right there." },
      { place: "Port Aransas Museum — Jetty Train Bell", detail: "101 E. Brundrett Ave. The bronze bell from the Aransas Harbor Terminal Railway's steam engine. You're encouraged to touch it." },
      { place: "Horace Caldwell Pier", detail: "Just north of the south jetty. Best angle to watch the pass, the jetty tip, and the ships moving through." },
    ],
  },

  "ropesville-to-port-aransas": {
    lede: "Most towns pick a name and keep it. Port Aransas picked three. In 1888 the first post office on Mustang Island opened under the name Ropesville. Eight years later it was renamed Tarpon. Fifteen years after that, Port Aransas. Three names in twenty-three years — each one an argument about what the place was becoming, and a clue about what the people living there wanted it to be.",

    sections: [
      {
        heading: "Ropesville (1888)",
        body: [
          "On July 12, 1888, the United States Postal Service authorized a post office at Ropesville, Texas. The postmaster of record was William R. Roberts. The name's origin is a small mystery: no surviving document explains it. It may have been named for a local figure, or for a rope-related industry (possibly the maritime lines used in pass work), or for a person whose connection to the island has been lost. Historians have looked and haven't found it.",
          "What is known is what Ropesville was: a scatter of houses, a handful of fishing families, and the first federal recognition that anyone lived out here at all. The first federal jetty attempt had started eight years earlier. The island was beginning to register with the outside world.",
        ],
        fact: [
          { label: "Ropesville post office established", value: "July 12, 1888" },
          { label: "First postmaster", value: "William R. Roberts" },
          { label: "Origin of name", value: "Unknown" },
        ],
      },
      {
        heading: "Tarpon (1896)",
        body: [
          "On July 17, 1896, the postmaster — now Emma A. Roberts — changed the town's name to Tarpon. The reason was no mystery at all. Sport fishing for Megalops atlanticus had become the defining economic activity of the island. Anglers from New York, Chicago, and London were booking passage to the Texas coast specifically to chase the Silver King. The Tarpon Inn was already ten years old. The Tarpon Club would follow.",
          "Renaming the town after the fish was both a marketing decision and an honest description. What was Ropesville, really? Nobody could quite remember. What was Tarpon? That, everyone could agree on.",
        ],
      },
      {
        heading: "Port Aransas (1910–1911)",
        body: [
          "The third name was the longest fight. On December 23, 1910, a name change to Port Aransas was recorded. The official change took effect on April 1, 1911. Seven months later, on November 25, 1911, the city was incorporated.",
          "Why change it again? The answer is in the new name itself. Tarpon was a fish. A port was an ambition. By the early 1910s, the jetties were nearly complete, the deep-water channel was becoming reliable, and the people living on the island could see a different future — one that involved commercial shipping, real infrastructure, and a town that could hold its own against Corpus Christi across the bay. Aransas Pass was the defining geographic feature. Port Aransas declared what the town intended to be.",
        ],
        pullQuote: {
          text: "Tarpon was a fish. A port was an ambition. The name change declared what the town intended to be.",
        },
      },
      {
        heading: "What Three Names Reveal",
        body: [
          "Each name marked a distinct phase of self-understanding. Ropesville was a frontier placeholder — a post office box with a name nobody could explain. Tarpon was the fishing economy speaking: this is what we do, this is what we're known for. Port Aransas was the industrial and maritime ambition: this is what we are building toward.",
          "The pattern doesn't stop in 1911. The fight over Cinnamon Shore, the tension between working-town and resort-town, the arguments about short-term rentals and development — these are all continuations of the same question that produced three post office names in twenty-three years. What is this place? What do we want it to be?",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas Museum Research Files — Port Aransas Timeline" },
      { label: "Texas State Historical Association — Port Aransas", url: "https://www.tshaonline.org/handbook/entries/port-aransas-tx" },
      { label: "United States Postal Service historical records — post office establishment dates" },
      { label: "Port Aransas Preservation and Historical Association", url: "https://portaransasmuseum.org" },
    ],

    visitToday: [
      { place: "Port Aransas Museum", detail: "101 E. Brundrett Ave. The timeline exhibit traces all three names and the context behind each change." },
      { place: "Downtown Port Aransas", detail: "Walk the blocks around Station Street and Tarpon Street. Tarpon Street still carries the old name — a reminder of what the town was called in 1896." },
    ],
  },

  "pat-magees-surf-shop": {
    lede: "Pat Magee was still in high school when he went into business. In the summer of 1967, a junior at Port Aransas High School, he partnered with a buddy named Mike Lee to rent surfboards and rubber floats out of a small building at the dune line along the island beach. Two years later, when he graduated, he bought out Island Surf Shop at the corner of Beach and Station Street, put his own name on the door, and kept it there for the next thirty-six years. At its peak, Pat Magee's had nearly a dozen stores across Texas — Port Aransas, San Marcos, Austin, San Antonio, Dallas, Padre Island, College Station. The t-shirts are in closets all over the state. The boards and the posters and the magazines are behind glass at a museum in Corpus Christi that Pat himself co-founded after he closed the shop. The retail is gone. Almost everything it built is still here.",

    sections: [
      {
        heading: "The Shack at the Dune Line",
        body: [
          "The first iteration of what would become Pat Magee's was not a shop. It was a rental operation on the sand — surfboards, rubber surf rafts (the direct predecessor to the Boogie Board), and a sideline in huarache sandals that Pat brought back from trips to San Blas on Mexico's Pacific coast. The sandals sold alongside the boards because the kids renting the boards needed something to wear back to the car. It was the sort of small, adjacent-inventory decision that would define the shop's merchandising logic for the next four decades.",
          "Mike Lee was his partner at the dune line. Lee was one of several young Port Aransans who had put up rental stands in the mid-to-late 1960s; the island's surf economy at that point was still improvised and seasonal. What Pat and Mike had, by 1967, was a small wooden building at the dune line, a rental inventory, and summer weekends on the Gulf.",
          "That's a very short apprenticeship for retail. Pat turned it into a career.",
        ],
      },
      {
        heading: "Beach and Station (1969)",
        body: [
          "When Pat graduated from high school in 1969, he bought out a local shop called Island Surf Shop at the intersection of Beach and Station Street. He renamed it Pat Magee's Surf Shop. That corner would be the center of his business for the next thirty-six years.",
          "The timing mattered. Port Aransas surf culture in 1969 was just crossing the line from novelty to industry. Board shapers up and down the Coastal Bend were producing serious work. A surf shop at Beach and Station wasn't just a retail operation — it was the physical anchor of the scene. Locals knew where to find boards. Out-of-town surfers driving down 361 knew where to stop. The shop became a gathering point as much as a storefront.",
        ],
        fact: [
          { label: "Beach-rental shack", value: "1967 (partnership with Mike Lee)" },
          { label: "Pat Magee's Surf Shop opens", value: "1969 (acquired Island Surf Shop)" },
          { label: "Location", value: "Beach and Station Street, Port Aransas" },
          { label: "Pat's high school class", value: "1969" },
        ],
      },
      {
        heading: "Champion Circuit",
        body: [
          "Pat wasn't just running a shop. He was a two-time Texas Gulf Coast Surfing Champion. He surfed on the Dewey Weber Surf Team — Weber being one of the most prestigious surfboard manufacturers in Southern California, with a team roster that read like a who's-who of mid-century American surfing. Pat's membership on that team put a Texas Gulf surfer on equal footing with the California circuit during a period when most of the American surf industry treated anything east of San Diego as regional at best.",
          "He competed in the United States Surfing Championships at Huntington Beach, California — the highest level of amateur surfing in the country at the time. Coastal Bend surfers consistently punched above their weight at those events. The Gulf, with its smaller and less predictable waves, turned out to be an unusual training ground: surfers who grew up reading subtle, shifting swells were often faster and more adaptive than competitors raised on cleaner breaks.",
        ],
      },
      {
        heading: "The Endless Summer Orbit",
        body: [
          "In 1969, Pat traveled to San Blas, Mexico — the same stretch of coast the huaraches came from — and met Robert August. August was, and remains, one of the most recognizable names in American surfing. He was the co-star of Bruce Brown's 1966 documentary The Endless Summer, the film that did more than any other single work to introduce surf culture to mainstream America. August had been a competitive surfer, a shaper, and a traveler; he also had a working surf team.",
          "Pat and Robert surfed together in Mexico and later in Costa Rica. The San Blas meeting started what would become a decades-long working relationship. August brought his surf team — itself a rotating roster of national figures — to Port Aransas for annual promotional events at Pat Magee's. Drawings were held during those events for surfboards and for surf trips to Mexico and Costa Rica. For a teenager in Port Aransas or Corpus Christi, a drawing at Pat Magee's was a non-trivial shot at a life-changing trip.",
        ],
        pullQuote: {
          text: "August brought his surf team — itself a rotating roster of national figures — to Port Aransas for annual promotional events at Pat Magee's.",
        },
      },
      {
        heading: "The Dozen Pat Magee's",
        body: [
          "The Port Aransas shop grew, and Pat expanded. At the peak of the business, there were close to a dozen Pat Magee's locations — Port Aransas, San Marcos, Austin, San Antonio, Dallas, Padre Island, College Station. The model wasn't pure surf retail. Texas is a big, mostly landlocked state, and Pat figured out early that the ocean-adjacent lifestyle had a market well inland. The shops carried swimwear, sportswear, sandals, and — most famously — t-shirts.",
          "The t-shirts were the thing. For a generation of Texans who grew up in the 1970s and 1980s, a Pat Magee's tee in a college dorm room in San Marcos or Austin was shorthand for the coast. The shop stocked exclusive deals with Hang Ten and O.P. — two of the major beachwear brands of the era — and the California-connection gave Pat's inventory legitimacy that a pure regional shop couldn't match. Dewey Weber boards in the front, Hang Ten in the back, Pat Magee's logo on the chest.",
          "The promotional footprint matched the retail one. Pat Magee's sponsored concerts by the Beach Boys and by Jimmy Buffett — both fits for the island-wear market. In 1999, the Art Museum of South Texas hosted a Surfin' Art Exhibit featuring surf-culture painters Rick Rietveld, Drew Brophy, and Peter Schroff, with an opening-night concert by The Ventures. Pat was instrumental in the exhibit. For a Corpus Christi institution in 1999, getting The Ventures to headline a surf-art opening was not ordinary programming.",
        ],
      },
      {
        heading: "The Downturns That Closed the Others",
        body: [
          "The Texas oil bust of the mid-1980s took Texas retail with it. Then the real estate slumps of the 1990s and 2000s did their own damage. A dozen stores is a large footprint even in a strong economy; in a soft one, the carrying costs across multiple lease locations, staff, and inventory became untenable. Pat gradually contracted the chain — closing the inland locations, consolidating toward the coast. By the early 2000s, the Port Aransas shop was again the center of the business, and a handful of other locations continued as brand extensions rather than full-scale retail.",
          "Thirty-six years is a long time in surf retail. Most shops don't last a decade. Pat's kept the doors open through three Texas economic cycles, multiple shifts in teenage taste, the transition from surf films to surf video, and the arrival of the internet as a competitor to the physical store. That it closed when it did is less a story of failure than of timing. Pat and Mary Lynn Magee — Pat's wife and business partner through the entire run — decided in 2005 to retire. The Port Aransas shop closed that year.",
        ],
      },
      {
        heading: "The Museum That Preserved It",
        body: [
          "Retirement was not the end of Pat's involvement in Texas surf history. In 2005 — the same year the Port A shop closed — Pat and Corpus Christi restaurateur Brad Lomax co-founded the Texas Surf Museum in downtown Corpus Christi. Lomax owns Water Street Seafood Company; he is also one of the most significant private surfboard collectors in the Coastal Bend. Pat's personal collection, combined with Lomax's, represents the most complete physical record of Texas Gulf surf culture that exists anywhere.",
          "The Texas Surf Museum, at 309 N. Water Street in downtown Corpus Christi, is free to visit. It runs a permanent exhibit — Pat Magee Surf Shop, The Collection: A \"For See and Sale\" Exhibit — that draws directly from the shop's archives: records, posters, artwork, books, and a rotating display of vintage boards. The museum is small. You can see everything in an hour. What you are actually seeing is a compressed version of a four-decade business: the cultural ephemera of a Texas surf economy that mostly no longer operates at the scale it once did.",
          "Pat and Mary Lynn retired to Goliad, an inland Texas town far enough from the Gulf that it requires a drive. He keeps another residence in Punta Mita, on the Mexican Pacific — not far, in spirit, from the San Blas where the whole thing started with huarache sandals and a meeting with Robert August.",
        ],
      },
      {
        heading: "What It Left Behind",
        body: [
          "Pat Magee's is not operating in Port Aransas today. The corner at Beach and Station, where the shop anchored the surf economy for thirty-six years, is part of the island's built history now rather than its active commerce. A licensed version of the brand continues in San Antonio under different ownership. The original shop, the one Pat and Mary Lynn ran, closed in 2005 and has stayed closed.",
          "What's left is larger than a storefront. The Texas Surf Museum has the boards. The Port Aransas Museum has a surf exhibit curated in part from the Magee and Lomax collections. A generation of Texans still has the t-shirts. Every Port A surfer who paddled out in the 1970s, 80s, or 90s bought, rented, or browsed at a Pat Magee's at some point. The shop was the connective tissue of a regional scene that outsiders often assumed didn't exist. Pat's role was to keep that scene visible, supplied, and legible — first to itself, and then, through the museum, to everyone who came after.",
          "Thirty-six years behind the counter at Beach and Station, and a museum where it all now lives. It is a long ride by any measure.",
        ],
        pullQuote: {
          text: "The shop was the connective tissue of a regional scene that outsiders often assumed didn't exist.",
        },
      },
    ],

    sources: [
      {
        label: "The Bend Magazine — \"A Life Well Surfed: Pat Magee\"",
        url: "https://www.thebendmag.com/a-life-well-surfed-pat-magee/",
      },
      {
        label: "Pat Magee's Surf Shop — official history",
        url: "https://www.patmageessurfshop.com/",
      },
      {
        label: "Texas Surf Museum — Pat Magee Surf Shop, The Collection exhibit",
        url: "https://texassurfmuseum.org/tsm_events/pat-magee-surf-shop-the-collection-a-for-see-and-sale-exhibit/",
      },
      {
        label: "Port Aransas Visitors Guide — Texas Surf Museum",
        url: "https://visitorsguide.portasouthjetty.com/articles/texas-surf-museum-is-worth-the-visit-to-corpus-christi/",
      },
      {
        label: "Port Aransas South Jetty — Sept 1, 2005 (retirement coverage, via Portal to Texas History)",
        url: "https://texashistory.unt.edu/ark:/67531/metapth556280/m1/11/",
      },
    ],

    visitToday: [
      {
        place: "Texas Surf Museum",
        detail: "309 N. Water St., Corpus Christi. Free admission. Tue–Sat 11 AM–7 PM, Sun 11 AM–5 PM, closed Mondays. Phone (361) 882-2364. The \"Pat Magee Surf Shop, The Collection\" exhibit draws directly from the shop's archives.",
      },
      {
        place: "Port Aransas Museum — Surfing Exhibit",
        detail: "101 E. Brundrett Ave. Roughly 20 boards plus memorabilia from the 1960s onward — Dan Parker's curation, Pat Magee and Brad Lomax collections.",
      },
      {
        place: "Beach and Station Street",
        detail: "The corner where Pat Magee's operated for thirty-six years. The shop is gone but the intersection still anchors the downtown grid.",
      },
      {
        place: "Horace Caldwell Pier",
        detail: "The primary surf break in Port Aransas. Still active. Boards go out on swells; spectators watch from the pier.",
      },
    ],
  },

  "surfing-port-aransas": {
    lede: "Surf culture arrived in Port Aransas the way most good things did — quietly, in the early 1960s, brought by a handful of young men who had seen what was happening in California and decided the Texas Gulf was worth trying. The Gulf doesn't make big waves often. But it makes them consistently enough that by 1970, thousands of people had caught the bug. The Coastal Bend would go on to produce national champions who beat surfers from Hawaii and the East Coast. The boards from those years are now behind glass at the Port Aransas Museum — classic longboards shaped by hand in shops that once operated within a few blocks of the water.",

    sections: [
      {
        heading: "The First Shops",
        body: [
          "The early Port Aransas surf scene had two anchors. The Surf Shack operated at the intersection of Beach and Station streets through the 1960s, renting boards to anyone who wanted to try. And East of Hawaii Surfboards, one of the most important Texas shapers of the era, had offices in both Port Aransas and Austin — an unusual two-city model that reflected where Texas surf culture actually lived, split between the coast and the interior college towns sending students to the beach.",
          "There had been surfers on the Texas coast before the 1960s. But the 1960s were when it stopped being a novelty and became an industry. Board rentals, lessons, shops, competitions — the whole ecosystem took shape in a decade.",
        ],
      },
      {
        heading: "Pat Magee and the Island-Wear Empire",
        body: [
          "Pat Magee is one of the most important names in Port Aransas surf history. He ran a surf shop on the island and built it into a chain of island-wear boutiques that spread across Texas. His personal collection of boards and surf memorabilia formed the core of what is now exhibited at the Port Aransas Museum and the Texas Surf Museum in Corpus Christi.",
          "The other key collector is Brad Lomax, owner of Water Street Seafood Company in Corpus Christi. His private board collection, combined with Magee's, represents the most complete physical record of Coastal Bend surf history anywhere.",
        ],
      },
      {
        heading: "National Champions from a Small Coast",
        body: [
          "The Texas Gulf has a reputation among outsiders as a surfing backwater. The reputation is wrong. Coastal Bend surfers won national amateur championships in the 1960s and 1970s, beating competitors from California, Hawaii, and the East Coast — the three regions that dominated American surfing in that era. The Texas Gulf Surfing Association tracked the competition circuit; its best amateurs consistently outperformed expectations.",
          "The Gulf's inconsistency is part of what made the surfers good. You can't wait for a perfect wave in Port Aransas — you have to read what's coming and commit. Surfers who could work small, fast, shifting waves turned out to be formidable when conditions elsewhere were cleaner.",
        ],
        pullQuote: {
          text: "You can't wait for a perfect wave in Port Aransas — you have to read what's coming and commit.",
        },
      },
      {
        heading: "Breaks and Boards",
        body: [
          "The main Port Aransas breaks form around the jetties and Horace Caldwell Pier. The granite from the 1899–1919 jetty project, dumped into position to tame the pass, ended up creating exactly the kind of structure that generates rideable waves. The engineers building the jetties were not thinking about surfing. They built it anyway.",
          "Board shapers up and down the Coastal Bend — Port Aransas, Corpus Christi, Galveston, South Padre — produced work that reflected the local conditions. Longer boards for the softer Gulf waves, subtle rocker profiles, finish work adapted to a coast where salt and heat eat equipment fast.",
        ],
      },
      {
        heading: "The Museum Preserves It",
        body: [
          "The Port Aransas Museum runs a permanent surfing history exhibit: roughly twenty boards from Port Aransas, Corpus Christi, Galveston, and South Padre Island shapers, plus memorabilia, artwork, photographs, and oral history from the early era. Dan Parker, longtime surfer and former curator of the Texas Surf Museum in Corpus Christi, has been central to organizing the exhibit. Parker and co-author Michelle Christenson published Surfing Corpus Christi and Port Aransas through Arcadia Publishing — the definitive written history of Texas Gulf surf culture.",
          "You can still surf Port A today. You can still buy a board in town. But the scene that started at the Surf Shack in the early 1960s is now also a historical record, carefully kept by the people who lived it.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas Museum Research Files — Port Aransas Museum and PAPHA" },
      { label: "Port Aransas Museum — Surfing History Exhibit", url: "https://portaransasmuseum.org" },
      { label: "Surfing Corpus Christi and Port Aransas — Dan Parker and Michelle Christenson (Arcadia Publishing)", url: "https://portaransasmuseum.org/product/surfing-corpus-christi-and-port-aransas/" },
      { label: "The Bend Magazine — The History of Surfing in the Coastal Bend", url: "https://www.thebendmag.com/the-birth-of-surfing-in-the-coastal-bend/" },
      { label: "Port Aransas Visitors Guide — Museum recalls surf exploits", url: "https://visitorsguide.portasouthjetty.com/articles/museum-recalls-surf-exploits/" },
    ],

    visitToday: [
      { place: "Port Aransas Museum — Surfing Exhibit", detail: "101 E. Brundrett Ave. Roughly 20 boards plus memorabilia from the 1960s onward. Dan Parker's curation, Pat Magee and Brad Lomax collections." },
      { place: "Horace Caldwell Pier", detail: "The primary surf break in town. Boards go out on swells; spectators watch from the pier." },
      { place: "South Jetty", detail: "Secondary break. Waves form against the granite on incoming swells. Walk the jetty to watch from above." },
    ],
  },

  "texas-sandfest": {
    lede: "Sometime in the spring of 1997, two Port Aransas women set folding chairs and a card table on the beach so they could watch their children build sandcastles. Elleece Calvert was a local mother. Sharon Schafer directed the Art Center for the Islands, Port Aransas's small nonprofit arts organization. The specific day is lost to the public record. The children's names, the mile marker, the first-year attendance — none of it survived the way it should have. What survived was a phrase, repeated in every official account since: they set folding chairs and a card table on the beach so they could watch. Twenty-nine years later, that card table is the origin story of Texas Sandfest — a three-day festival that draws thirty thousand people a day, flies master sculptors in from Canada, the Netherlands, France, and Italy, and writes checks every year to the Port Aransas school district, the volunteer fire department, the food pantry, the Art Center, and two dozen other local organizations. Most of the people who attend have no idea it started with two moms and a card table.",

    sections: [
      {
        heading: "Why It Had to Be This Beach",
        body: [
          "Sandfest could not have started just anywhere. Mustang Island sand is, for reasons of geology, uncommonly good at what sand sculptors ask of it. It has a high clay content. Tamped wet and layered into flat disks — what sculptors call pancakes — it can be stacked into towering spikes that carry weight without crumbling. Into those spikes, an experienced sculptor can carve at almost any angle. Beaches with softer, more uniform grain sizes do not do this.",
          "Mark Landrum, the Port Aransas resident who has taught sandcastle-building on the island for years and serves on the Sandfest board, put the claim plainly in a Texas Highways profile: the Texas shore, he said, stacks better than anywhere in the world. He attributes it to the clay. The festival has built its international reputation on that technical fact. South Padre Island's Sandcastle Days, the other major Texas competition, runs on its own local substrate. Virginia Beach and Siesta Key have theirs. Port Aransas competes on Mustang Island's.",
          "Often described — by organizers and regional press alike — as the largest native-sand sculpture competition in the United States, Sandfest carries a qualifier worth noting. Native-sand means sculptors compete with the sand where they stand. No trucks, no engineered competition sand, no sculpting compounds hauled in from elsewhere. What the beach gives you is what you work with. It is, in a strict technical sense, the purest form of the art.",
        ],
        pullQuote: {
          text: "Our sand here along the Texas shore is better than anywhere in the world for stacking sand. We can stack it taller than anybody.",
          attribution: "Mark Landrum, Texas Highways",
        },
        fact: [
          { label: "Founded", value: "1997" },
          { label: "Founders", value: "Elleece Calvert & Sharon Schafer" },
          { label: "Ranking", value: "Largest native-sand competition in U.S." },
          { label: "Location", value: "Mile markers 9–13, Mustang Island" },
          { label: "Format", value: "3 days, Friday–Sunday in April" },
        ],
      },
      {
        heading: "The Umbrella, Then the Spin-Off",
        body: [
          "The first few Sandfests were small. Calvert and Schafer handled the organizing under the banner of the Art Center for the Islands — Schafer's institution. It was clear almost immediately that a full-scale festival would need a formal nonprofit home. A Corpus Christi–based sand sculptor named Dee McElroy, who had competed at festivals elsewhere and knew the organizational landscape, pointed out the obvious: someone needed to set it up as a 501(c)(3).",
          "The solution, for nearly a decade, was the Port Aransas Community Theatre. PACT had the nonprofit status and the organizational machinery to host a growing festival, and in exchange, Sandfest proceeds funded PACT operations. From the late 1990s through September 2006, the festival ran under the theater's umbrella. Then, in the fall of 2006, the Sandfest board asked PACT to release it. It became an independent 501(c)(3) in its own right. At the first officer meeting of the new nonprofit, Elleece Calvert was elected treasurer.",
          "Schafer stepped back to focus on the Art Center. Calvert stayed on as event director for another four years — introducing the $2 spectator admission fee in 2010, and the first mesh fencing separating spectators from the masters' sculpting area the same year. These were the structural changes that took Sandfest from a community event to a professionally run competition.",
          "The presidency of the new board rotated. Port Aransas attorney Arnold Govella served four one-year terms between 2001 and 2014. Betty Crawford presided in 2011 — the first year the festival legally served alcohol, after a unanimous 7–0 vote by the city council the previous December. Shawn Etheridge held multiple terms through 2015 and was quoted as president again in 2019. Ruth Maspero ran the board through the pandemic cancellation and the October 2021 recovery edition. Scot Deason served from 2023 through 2025. Tim Parke, a local business owner who runs Lone Star Taste, takes over this year.",
        ],
        fact: [
          { label: "Under PACT umbrella", value: "1997–2006" },
          { label: "Independent 501(c)(3)", value: "September 2006" },
          { label: "First treasurer", value: "Elleece Calvert" },
          { label: "2026 board president", value: "Tim Parke (Lone Star Taste)" },
        ],
      },
      {
        heading: "The Sculptors Arrived",
        body: [
          "In 1997, the festival was moms, kids, and whoever walked up. Within a decade, it had become a destination on the international sand-sculpting circuit. Masters now fly in annually from Prince Edward Island, Vancouver, Ontario, Tacoma, Cleveland, France, the Netherlands, Italy, and Quebec. Competition is divided into Masters Solo, Masters Duo, Semi-Pro, Advanced Amateur, and a set of open categories that includes Family, Team, Youth, and Guppy. A master solo sculptor gets approximately thirty-six hours of work time, spread across five days of the competition week. A Guppy gets less.",
          "The modern dynasty is Abe Waterman of Prince Edward Island. Waterman has won Masters Solo in 2022, 2023, and 2024 — three consecutive years — in addition to multiple Duo wins going back to 2015. Sue McGrew of Tacoma, paired with Benoit Dutherage of France, has dominated the Duo category in recent years. Marie-Line Gagne of Canada won the 2025 Masters Solo with a piece titled \"On the Edge,\" and also took Sculptors' Choice.",
          "The single most widely covered sculpture in festival history is from 2019. Damon Langlois of British Columbia carved a facepalming Abraham Lincoln, modeled after the Lincoln Memorial but seated atop a crumbling foundation. He titled it \"Liberty Crumbling.\" It won Masters Solo, then went viral — picked up by Colossal, Bored Panda, TwistedSifter, and the San Antonio Current, and shared widely on social media. It was the moment Sandfest stopped being a regional fishing-town festival and became an internationally recognized art event.",
          "But the international names are not the full story. Amateur, Semi-Pro, Youth, Family, and Guppy competitions run alongside the masters throughout the weekend. Most of the people sculpting on Sandfest weekend are not professionals. They are children with buckets, families with shovels, and weekend artists who drove in from San Antonio. The distinction between the professionals and the amateurs is technical; the spectacle is shared.",
        ],
        pullQuote: {
          text: "The artists are special… it's ephemeral. It's only here for a minute.",
          attribution: "Erin Richmond, 2023 visitor, Port Aransas South Jetty",
        },
      },
      {
        heading: "The Year It Saved the Town",
        body: [
          "Hurricane Harvey made landfall late on August 25, 2017, with the eye passing less than a mile from downtown Port Aransas. An estimated seventy percent of the island's buildings were damaged or destroyed. One hundred percent of Port Aransas businesses sustained damage. Total losses approached one billion dollars. The Tarpon Inn lost its first-floor lobby to an eight-foot storm surge. The Farley Boat Works was flooded. For the remainder of 2017, Port Aransas was, in the practical sense, closed.",
          "Sandfest had already happened that year, in April, four months before the storm. The question by winter was whether the 2018 edition — the festival's twenty-second — could go on at all. The beach was functional. Much of the town was not. The sculpting community watched the calendar and waited for a signal.",
          "It came. Between April 27 and 29, 2018, Sandfest opened on the beach between mile markers 9 and 13. Eighteen masters competed. Attendance reached thirty thousand over three days. Delayne Corbett of Vancouver won Masters Solo with a piece titled \"Seraphim,\" also taking People's Choice. Abe Waterman and Morgan Rudluff won Masters Duo with \"Ball and Chain.\" Lisa Shelton was the festival's Executive Director. Mark Landrum did a national radio interview with WBUR the Friday morning the festival opened, framing it for a post-Harvey audience.",
          "By the end of the weekend, Sandfest had raised a then-record $310,000 for local nonprofits. The festival was described in its own messaging, and by every outlet that covered it, as the first major local event since the hurricane. It was more than a competition. For three days, it gave Port Aransas back the thing it had lost along with the buildings — the feeling of a town functioning in public.",
        ],
        pullQuote: {
          text: "The talent was great, and it was hard to pick favorites and winners.",
          attribution: "Lisa Shelton, 2018 Sandfest Executive Director",
        },
        fact: [
          { label: "Dates", value: "April 27–29, 2018" },
          { label: "Attendance", value: "30,000+" },
          { label: "Masters competing", value: "18" },
          { label: "Beach location", value: "Mile markers 9–13" },
          { label: "Donations raised", value: "$310,000 (record)" },
        ],
      },
      {
        heading: "The Money Goes Home",
        body: [
          "Sandfest is not a festival that breaks even and donates the surplus. It is, by structure, a fundraiser. The admission fees, sponsorship packages, beer garden sales, and gallery spaces are all engineered to produce net proceeds that go back to the community. Since 2012, the festival has distributed more than $1.5 million to Port Aransas nonprofits.",
          "The 2025 edition alone distributed $464,169 across twenty-one local organizations. The single largest line item — $274,419 — went to Port Aransas High School scholarships. That scholarship line has grown by a hundred and nineteen percent in three years, from $125,000 in 2022 to its 2025 total. Other 2025 recipients included the Port Aransas Volunteer Fire Department, Helping Hands Food Pantry, Moore-McDonald VFW Post 8967, the Port Aransas Art Center, the Port Aransas Community Theatre, Port Aransas EMS, the Port Aransas Police Foundation, Trinity by the Sea, Friends of the ARK, Animal Friends of Port Aransas, Keep Port Aransas Beautiful, the Port Aransas Garden Club, Friends of the Library, Bikers Against Child Abuse, the Port Aransas Youth Development Foundation, the Port Aransas Preservation and Historical Association, the PAISD Nurses Fund, and a line dedicated to PAISD teachers' continuing education.",
          "One of those recipients is the Port Aransas Art Center. Which is to say: the institution Sharon Schafer directed in 1997, when she set a card table on the beach with Elleece Calvert, still receives a grant every year from the festival that started there. The money moves in a circle. The festival its founders created, decades later, pays back to the institution that housed them at the beginning. It is one of the cleaner examples of civic return in Texas coastal life.",
        ],
        pullQuote: {
          text: "The Art Center — where Sharon Schafer directed in 1997 — still receives a grant every year from the festival it seeded.",
        },
        fact: [
          { label: "Cumulative since 2012", value: "$1.5M+" },
          { label: "2025 distribution", value: "$464,169" },
          { label: "2025 recipients", value: "21 organizations" },
          { label: "PAISD scholarships 2025", value: "$274,419" },
          { label: "Scholarship growth 2022→2025", value: "+119%" },
        ],
      },
      {
        heading: "The Logo Mountain",
        body: [
          "Every Sandfest centerpiece is a fifteen-foot-tall sculpture that carries the year's sponsor logos. Sculptors and volunteers have rebuilt it on the beach every year since the festival's earliest days — including 2015, when a hard rain destroyed the previous version before opening, and 2018, after Hurricane Harvey nearly took the festival down with it. The logo mountain is the closest thing Sandfest has to a permanent fixture, except that it isn't permanent. It is rebuilt, every year, by hand, from sand.",
          "This year, the mountain carries a name that did not come from a sponsor sheet: Lisa Shelton.",
          "Shelton was Sandfest's Executive Director in 2018 and 2019, the Harvey-recovery years. Most of Port Aransas knew her as \"Wiggly,\" a nickname that referred to a shock of curly blonde hair and a personality of equivalent volume. She also served, at various points, on the Port Aransas ISD Board of Trustees (including a term as president), the Port Aransas Tourism Bureau, the Community Theatre board, the Planning and Zoning Commission, and the Port Aransas Education Foundation. She suffered a stroke on October 22, 2024, and died of complications on September 6, 2025. She was sixty-one.",
          "The 2026 logo mountain is the first since her passing. Her name is on it.",
        ],
        pullQuote: {
          text: "Wiggly was a force — a force of passion, enthusiasm, hard work, determination and love.",
          attribution: "Mary Henkel Judson, Port Aransas South Jetty",
        },
      },
      {
        heading: "Weather and Will",
        body: [
          "A festival built of sand on a Gulf-coast beach survives because its volunteers refuse to cancel. The 2015 edition was the extreme case. A hard rain on April 22 destroyed the centerpiece sculpture before opening day. Flooding closed roads from Avenue G to Beach Access Road 1A. High winds knocked down tents. Then, at around six in the morning on Sunday, April 26, approximately thirty amateur sculptures were vandalized by a group of teenagers on golf carts and motorized bicycles. The Sandfest logo on the centerpiece was defaced. A section of the chain-link fence around the masters' sculpting area was torn down. No arrests were ever reported.",
          "The festival finished the weekend on schedule and set attendance records. Shawn Etheridge, then board president, told the South Jetty afterward that it was incredible — as big as any Sandfest he had experienced. The centerpiece was rebuilt. The amateur sculpting community moved on.",
          "There have been other curve balls. The 2020 edition was postponed from April to October, then cancelled entirely in July as the COVID-19 pandemic made a three-day, thirty-thousand-attendee festival impossible. The 2021 edition moved to October 15–17 — the only fall Sandfest in the festival's history. In 2023, extra-high tides from a Gulf low-pressure system forced at least one master sculptor to completely restart his work mid-competition. And in 2025, with the City of Port Aransas under municipal water restrictions, Sandfest pumped water from a private pond and trucked it in by tanker to the beach. Sculpting takes water. The festival found a way.",
          "What does it take to hold a festival made of sand for twenty-nine years on a Gulf-coast beach? Everything, every year, and whatever the weather and the tides are willing to leave you.",
        ],
        pullQuote: {
          text: "Mother Nature threw us a couple of curve balls.",
          attribution: "Scot Deason, Sandfest Board President 2023–2025",
        },
      },
      {
        heading: "This Weekend",
        body: [
          "The twenty-ninth annual Texas Sandfest runs Friday, April 17 through Sunday, April 19, 2026. Tim Parke, who owns Lone Star Taste in Port Aransas, takes over the board presidency for his first year at the helm. The Josh Abbott Band, from Lubbock, closes out the festival Sunday. Masters, Duo, Semi-Pro, Advanced Amateur, Family, Team, Youth, and Guppy categories will sculpt across the three days in the sand between mile markers 9 and 13. Admission is thirty dollars for an adult weekend wristband, five for youth ages six to twelve. The thirtieth annual is next year.",
          "Somewhere on the sand this weekend, a child will build her first sandcastle. She will not remember the card table. She will not remember that two Port Aransas women set folding chairs on the beach in 1997 so their own children could do the same thing. But the card table is the reason she is there. Nearly half a million dollars will move through this weekend — into scholarships that will eventually send her cousin to college, into a volunteer fire department that will respond when her grandmother's house floods, into the food pantry that feeds the waiter who serves her family at dinner on Sunday night. The festival that started as two moms watching their children build castles on the sand has become one of the largest civic engines in a town that needs every one it can get.",
          "Calvert and Schafer's card table is, in the strict literal sense, gone. But you can see it every year, right there at the base of every sculpture, on every stretch of beach between mile markers 9 and 13, and in every grant check the festival writes in May. Some things you build outlast the thing you built them on.",
        ],
        fact: [
          { label: "Dates", value: "April 17–19, 2026" },
          { label: "Edition", value: "29th annual" },
          { label: "Board President", value: "Tim Parke (Lone Star Taste)" },
          { label: "Sunday closing music", value: "Josh Abbott Band" },
          { label: "Adult weekend wristband", value: "$30" },
          { label: "Youth (ages 6–12)", value: "$5" },
          { label: "Beach location", value: "Mile markers 9–13" },
        ],
      },
    ],

    sources: [
      { label: "Texas Sandfest official — History", url: "https://www.texassandfest.org/history" },
      { label: "Texas Sandfest official — 2025 Winners", url: "https://www.texassandfest.org/winners" },
      { label: "Port Aransas Tourism Bureau — History of Texas SandFest", url: "https://www.portaransas.org/texas-sandfest/about/history/" },
      { label: "Port Aransas Tourism Bureau — Texas SandFest 2026", url: "https://www.portaransas.org/texas-sandfest/" },
      { label: "Port Aransas South Jetty — \"Shelton was sparkling community leader\" (Sept 10, 2025)", url: "https://www.portasouthjetty.com/articles/shelton-was-sparkling-community-leader/" },
      { label: "Port Aransas South Jetty — \"SandFest gives back to area organizations\" (2025)", url: "https://www.portasouthjetty.com/articles/sandfest-gives-back-to-area-organizations/" },
      { label: "Port Aransas South Jetty — \"SandFest was super\" (2025 coverage)", url: "https://www.portasouthjetty.com/articles/sandfest-was-super/" },
      { label: "Port Aransas South Jetty — \"Record set in SandFest donations\" (2019)", url: "https://www.portasouthjetty.com/articles/record-set-in-sandfest-donations/" },
      { label: "Port Aransas South Jetty — \"SandFest superb\" (2018 post-Harvey)", url: "https://www.portasouthjetty.com/articles/sandfest-superb/" },
      { label: "Port Aransas South Jetty — \"SandFest survives\" (2015 vandalism year)", url: "https://www.portasouthjetty.com/articles/sandfest-survives/" },
      { label: "Port Aransas South Jetty — \"Neither wind nor Gulf tides stop SandFest\" (2023)", url: "https://www.portasouthjetty.com/articles/neither-wind-nor-gulf-tides-stop-sandfest/" },
      { label: "Port Aransas South Jetty — \"SandFest 2022 'best ever'\"", url: "https://www.portasouthjetty.com/articles/sandfest-2022-best-ever/" },
      { label: "Port Aransas South Jetty — \"City gives OK to SandFest to sell alcohol at 2011 event\"", url: "https://www.portasouthjetty.com/articles/city-gives-ok-to-sandfest-to-sell-alcohol-at-2011-event/" },
      { label: "Port Aransas South Jetty — \"Winners of the 12th annual Texas SandFest\" (2008)", url: "https://www.portasouthjetty.com/articles/winners-of-the-12th-annual-texas-sandfest/" },
      { label: "Texas Standard — Former Accountant Prospers as the Sandcastle Guy", url: "https://www.texasstandard.org/stories/former-accountant-prospers-as-the-sandcastle-guy/" },
      { label: "WBUR Here & Now — \"Texas 'Sandcastle Guy' on Hurricane Harvey Recovery\" (April 27, 2018)", url: "https://www.wbur.org/hereandnow/2018/04/27/texas-sandfest-hurricane-harvey-recovery" },
      { label: "Colossal — \"An Award-Winning Sand Sculpture by Damon Langlois Captures a Crumbling Abraham Lincoln\"", url: "https://www.thisiscolossal.com/2019/05/lincoln-sculpture-by-damon-langlois/" },
      { label: "KIII 3News — Texas Sandfest 2026 returns to Port Aransas", url: "https://www.kiiitv.com/article/news/local/texas-sandfest-2026-returns-to-port-aransas/503-e0229988-d7bb-484c-be1a-ccf041c38d95" },
      { label: "KRIS-TV — \"The Queen of Port Aransas\" (November 2024)", url: "https://www.kristv.com/news/local-news/in-your-neighborhood/nueces-county/port-aransas/the-queen-of-port-aransas-port-a-community-rallies-to-support-beloved-local" },
      { label: "Austin Chronicle — Day Trips: SandFest, Port Aransas (2025)", url: "https://www.austinchronicle.com/columns/2025-04-25/day-trips-sandfest-port-aransas/" },
    ],

    visitToday: [
      { place: "Texas Sandfest 2026", detail: "Friday April 17 through Sunday April 19, 2026. Mile markers 9–13 on the Mustang Island beach. $30 adult weekend wristband, $5 youth 6–12. Josh Abbott Band closes out the festival Sunday." },
      { place: "Port Aransas Art Center", detail: "Corner of Alister and Avenue G. The institution Sharon Schafer directed in 1997 — and which still receives a Sandfest grant every year from the festival she helped start. Open galleries, classes, and community programs." },
      { place: "The Logo Mountain", detail: "The 15-foot-tall centerpiece sculpture is raised fresh on the beach each year, carrying the season's sponsor logos. This year, it also carries Lisa \"Wiggly\" Shelton's name." },
    ],
  },

  "red-snapper-fleet": {
    lede: "The first commercial red snapper landed in Port Aransas didn't come off a Port Aransas boat. It came down a narrow-gauge rail line that reached the island in 1888, from schooners working out of Pensacola, Florida — at the time the undisputed capital of Gulf red snapper. At its peak the Pensacola fleet ran nearly fifty sailing smacks. Port Aransas had fifty residents. The island's commercial red snapper story is not about dominance. It is about a town that landed fish when the trains showed up, kept landing fish after the schooners gave way to diesel boats, and then — slowly, over decades of federal quotas, blockades, and lawsuits — learned to sell the fishing trip instead of the fish.",

    sections: [
      {
        heading: "The Pensacola Problem",
        body: [
          "Any honest history of Gulf red snapper begins in Pensacola. Commercial snapper fishing in the Gulf dates to the 1840s, and for roughly ninety years the center of the industry sat on the Florida panhandle. The vessels were sailing \"smacks\" — schooners with live wells large enough to hold five or six thousand pounds of fish. The name came from the sound of water slapping inside the wells against the hull. At the industry's height, forty-eight smacks sailed from Pensacola.",
          "The Western Gulf came to the snapper story later. According to NOAA's baseline history of the Gulf red snapper fishery, peak landings-per-trip from U.S. coastal trips ran from about 1900 to 1915; trips to the Campeche Bank off the Yucatán peaked between 1910 and 1930. The commercial fishery did not expand to the outer continental shelf waters off Louisiana and Texas until after 1935 — when new rock ridges and snapper banks were charted, and when diesel engines made longer trips economical.",
          "So when Port Aransas enters the story, it enters in the second and third acts. The island was a landing port. It was a shipping point. Eventually, after the Second World War, it was a fleet home. But the canonical image of the red snapper industry — weathered smacks at anchor in a working harbor, hold stuffed with two-foot fish — belongs to another town, on another Gulf coast.",
        ],
      },
      {
        heading: "A Narrow-Gauge Fishery",
        body: [
          "What made commercial fish landings viable anywhere on the Gulf coast was not seamanship. It was infrastructure. When ice became commercially available and trains could haul it — and haul fish out — longer voyages became profitable, and small ports could suddenly participate in a regional market. Port Aransas got both at once. The Corpus Christi, San Diego and Rio Grande Narrow Gauge Railroad reached the island in 1888. The post office opened the same year, under the name Ropesville.",
          "Before the rail there was Robert Ainsworth Mercer, who had landed on the island in 1855 and set up El Mar Rancho, the Mercer docks, and the first general store. The Mercer docks were the island's Gulf-to-mainland shipping hub for decades. After the rail reached the island, the town renamed itself Tarpon — in 1896, after the sport fish — then renamed itself again in 1911, finally settling on Port Aransas.",
          "The earliest commercial export from the island was not snapper. It was not shrimp, either. It was live sea turtles, weighing up to five hundred pounds each, shipped by rail to markets across the South. That trade ran through the turn of the century and then collapsed, and it has been largely forgotten in the local memory. A different trade — the one that endured — grew up in its place.",
          "The Aransas Harbor Terminal Railway, chartered on June 13, 1892, was a ten-mile line from Aransas Harbor across Harbor Island to Mustang Island. It was built primarily for jetty construction, oil, and cotton, not for fish. But the docks and rails and storage it created were the structural bones of a commercial port, and what the commercial snapper fishery needed most was a structural bone yard to land on.",
        ],
        fact: [
          { label: "Mercer lands on the island", value: "1855" },
          { label: "Rail reaches the island", value: "1888" },
          { label: "Town renamed Tarpon", value: "1896" },
          { label: "Town renamed Port Aransas", value: "1911" },
          { label: "Population, 1925", value: "50" },
          { label: "Population, 1931", value: "300" },
        ],
      },
      {
        heading: "The Industrial Decade",
        body: [
          "The snapper fleet that mattered to Port Aransas was the one that showed up after the Second World War. The war had drafted mariners, rationed fuel and steel, and paused civilian boat-building. It also left behind cheap surplus diesel engines, and it was the diesel conversions of older hulls — and the new-build diesel boats that followed — that actually put Port Aransas on the commercial red snapper map. Gulf-wide, commercial landings climbed through the 1950s and 1960s, and by 1971 the U.S. Gulf red snapper fishery hit its all-time peak landings.",
          "The Port Aransas waterfront that sat under this peak was a working industrial port, not a tourist harbor. By the 1940s, Port Aransas was the nation's twelfth-largest oil shipping port. Shrimp boats, snapper boats, and oil infrastructure shared the channel. The shrimp fleet was by far the larger of the two fishing fleets — Gulf-wide shrimping effort rose from roughly 100,000 days fished per year in 1960 to about 200,000 days by 1978 — and the visual signature of the harbor was shrimp booms and nets, not hook-and-line snapper boats.",
          "The civic institutions that anchored the fleet in this era are the ones you can still recognize. Farley Boat Works, founded in 1915 by Fred Farley, was primarily a tarpon-boat builder but was the most important boatyard on the island. The Silver King Cafe opened on the present-day Fisherman's Wharf site in January of 1929 and was renamed Matthew's Place in 1933, paired with a fishing guide service and tackle shop. The Deep Sea Roundup — first held in 1932, and run every year since except for the Second World War and the 2020 pandemic — was organized by twenty-five captains who called themselves the Boatmen Association. In 1950, the Port Aransas–Harbor Island ferry service opened, and the number of visitors a commercial-fishing family could feed rose with it.",
          "It is a small and somewhat haunting coincidence that the all-time peak of U.S. Gulf red snapper landings — 1971 — is also the year the Port Aransas South Jetty was founded. The paper's first issues appeared in the same season as the fishery's last undisturbed year. Everything after 1971 is a different story.",
        ],
        pullQuote: {
          text: "The all-time peak of U.S. Gulf red snapper landings — 1971 — is the same year the Port Aransas South Jetty was founded.",
        },
      },
      {
        heading: "Flags in the Channel",
        body: [
          "The first sign that the fishery was in trouble was not on the snapper boats. It was on the shrimp boats. By the late 1980s, federal assessments pointed to the loss of juvenile red snapper — age zero and age one fish, the ones that would have grown into the spawning population — as the primary driver of the stock's collapse. The cause was shrimp trawl bycatch. Historically, shrimpers pulled up about ten pounds of assorted fish for every pound of shrimp they kept. Most of the assorted fish were young snapper. No amount of commercial snapper restraint was going to rebuild a population being killed as a byproduct before it ever reached a hook.",
          "The federal response was Turtle Excluder Devices — hard grates installed in shrimp nets that allowed large bycatch, including turtles, to escape — and a set of related bycatch-reduction rules for the shrimp fleet. Shrimpers resisted. On July 22, 1989, fifty or sixty Gulf shrimp boats anchored in the main commercial channel at Port Aransas, some flying skull-and-crossbones flags, as part of a Gulf-wide blockade coordinated by the 2,000-member Concerned Shrimpers of America. Several hundred boats blocked channels along the Texas and Louisiana coast. In Port Aransas, two men in a pleasure craft threw a foreign object through the window of a forty-one-foot Coast Guard cutter.",
          "The blockade was real, and local, and it lasted days. It is one of the most dramatic civic episodes the harbor has seen in the last forty years, and it has almost entirely disappeared from the travel-facing version of the island's story. The uncomfortable subtext was this: the regulatory pressure that would soon fall hardest on the commercial snapper fleet was, in the first instance, driven by the environmental damage of a different fleet sharing the same water.",
        ],
      },
      {
        heading: "Fifty-One / Forty-Nine",
        body: [
          "In 1977, a decade before the TED blockade, federal regulators had already declared Gulf red snapper overfished. In 1984, the Gulf of Mexico Fishery Management Council — based in Tampa, Florida and established under the 1976 Magnuson-Stevens Fishery Conservation and Management Act — set its first minimum size limit: twelve inches. The first formal stock assessment, in 1988, confirmed what commercial captains already knew from their trip totals: the population was overfished and was still undergoing overfishing. By 1990, spawning potential for Gulf red snapper had dropped to two percent of its unfished historical level.",
          "The Council's answer, in 1990, was Reef Fish Amendment 1. It set the first annual commercial quota — 3.1 million pounds — and it drew the most consequential line in Gulf fisheries management since the creation of Magnuson-Stevens itself. Based on landings data from 1979 to 1987, the Amendment allocated fifty-one percent of the Gulf red snapper catch to the commercial sector and forty-nine percent to the recreational sector. The 51/49 split would become the most-fought-over number in Gulf fisheries politics for the next thirty years. It has been upheld by federal courts, challenged repeatedly in Council meetings, survived multiple amendments, and still governs, in its basic form, who can catch how much.",
        ],
        fact: [
          { label: "First overfished declaration", value: "1977" },
          { label: "First federal size limit", value: "1984 (12 in.)" },
          { label: "First commercial quota", value: "1990 (3.1M lbs)" },
          { label: "Commercial / recreational split", value: "51% / 49%" },
          { label: "Spawning potential, 1990", value: "2% of unfished level" },
        ],
      },
      {
        heading: "A Stroke of the Pen",
        body: [
          "Through the 1990s the regime tightened. The Sustainable Fisheries Act of 1996 amended Magnuson-Stevens to require separate, enforceable quotas for commercial and recreational fishing, along with hard rebuilding deadlines. In 1998, the federal minimum size rose from fourteen inches to fifteen. Season closures — first short, then long — phased in through the decade. Annual stock assessments were conducted in almost every year from the late 1980s forward.",
          "Captain Kelly Owens bought Deep Sea Headquarters at 440 W. Cotter Road in Port Aransas in 1996, and his account of the period, as told to the South Jetty, is the plainest local record of what changed. When he took the business over, the red snapper season was open year-round. Within two or three years, it was closed for two months. Then four. Then six. The winter snapper fishery that had been part of the island's trade for a half-century — the reason a working boat could keep running crew through the cold months — was erased by a small number of rulemakings in Washington.",
          "\"This was a good winter fishery,\" Owens told the paper. \"With a stroke of the pen they took that away.\"",
        ],
        pullQuote: {
          text: "\"This was a good winter fishery. With a stroke of the pen they took that away.\"",
          attribution: "Capt. Kelly Owens, Deep Sea Headquarters, on the closure of the year-round red snapper season",
        },
      },
      {
        heading: "Two Thousand Seven",
        body: [
          "In 2007, NOAA Fisheries implemented Reef Fish Amendment 26 — the Gulf Individual Fishing Quota program. It was the first catch-share regime in the Gulf of Mexico. Commercial fishermen received IFQ shares based on their documented historical catch. Each share entitled the holder to an annual pound allocation that could be fished, leased, or sold. During the program's first five years, shares could only be transferred between holders of a valid commercial reef fish permit; after 2012, any U.S. citizen or permanent resident could hold them.",
          "The program arrived simultaneously with a large quota cut. The combined commercial and recreational quota was reduced from 9.12 million pounds in 2006 to 5.0 million pounds in 2008 — a 45 percent cut in two years. The recreational bag limit dropped from five fish to two. The federal season compressed to a three-month window in 2008 and, in subsequent years, to a few weekends.",
          "What the IFQ was meant to do was rebuild the population. By most measures, it did. Red snapper abundance recovered faster than even optimistic projections. What the IFQ also did — and what academic analysis confirmed by the program's fifth year — was consolidate the commercial fishery in ways that changed its character. By 2014, twenty-nine percent of Gulf red snapper quota was held by shareholders who did not hold a commercial reef fish permit. Thirty-nine percent of actual red snapper landings came from vessels whose operators had leased quota rather than owning it. The IFQ had, in effect, created a tier of absentee owners — quota landlords — collecting rent from working captains.",
        ],
      },
      {
        heading: "Texas Gets Its Six Percent",
        body: [
          "The commercial-versus-recreational allocation argument, meanwhile, metastasized into a set of federal lawsuits and a set of federal amendments. In 2015, the Gulf Council passed Amendment 40 — \"sector separation\" — by a ten-to-seven vote, splitting the recreational allocation into federal for-hire (charter) and private-angling components. Four of the five Gulf states opposed the amendment. The Coastal Conservation Association, a Texas-born organization with its roots in Houston, sued to stop it. The suit failed in federal district court in Louisiana, and the Fifth Circuit affirmed.",
          "Part of the Fifth Circuit's reasoning was simple numerical honesty. The recreational sector, the court noted, had exceeded its quota in every year from 1991 through 2005, from 2007 through 2009, and from 2011 through 2013. A management system that lets one side overrun its allocation year after year while the other side stays within it is unstable by design. Amendment 40 was an attempt to stabilize it.",
          "In December 2018, Congress passed the Modern Fish Act. The Gulf Council followed with Amendment 50, delegating state management of private recreational red snapper to each of the five Gulf states. The allocation split now runs Florida 44.822 percent, Alabama 26.298 percent, Louisiana 19.120 percent, Texas 6.211 percent, Mississippi 3.550 percent. Texas's share is small by federal share-of-shelf-water logic, but the state compensates by keeping its own state waters — which reach only nine nautical miles offshore — open year-round at four fish per day, fifteen-inch minimum. Texas Parks and Wildlife requests a federal closure off the Texas coast once the state quota is landed, which happens now every summer.",
          "For Port Aransas specifically, Amendment 40 was, on net, a help. Most of the island's modern captains run for-hire charters rather than private boats, and the sector-separation split generally protected their season length. But the arithmetic created intense anti-federal sentiment among the private Texas anglers who trailer boats to the island every summer. It is a social fault line the harbor lives with to this day, and one no local captain will volunteer an opinion on in front of strangers.",
        ],
      },
      {
        heading: "What the Fleet Looks Like Now",
        body: [
          "Three operators anchor the modern Port Aransas deep-sea fleet. Fisherman's Wharf, descended from the 1929 Silver King Cafe and Matthew's Place, runs headboats and offshore trips on the Wharf Cat and Scat Cat. Deep Sea Headquarters, on West Cotter Road, operates a five-vessel fleet under Captain Kelly Owens: the Gulf Eagle (custom-built, the largest), the Kingfisher (a forty-person party boat), the Pelican (a seventy-foot private charter), the Scarlet Lady (a catamaran running dolphin tours), and the Red Dragon (a pirate cruise). Dolphin Docks operates the Dolphin and Dolphin Express headboats alongside La Pesca, Capt. Paul, and Flipper, offering shared four-, five-, eight-, and twelve-hour charters and long-range \"safari\" trips of thirty to sixty hours.",
          "The captains who work these docks are the named inheritors of the post-1971 adaptation. Kelly Owens runs Deep Sea HQ. Keith Schoolcraft runs the Gulf Eagle headboat. Nate Forbes runs Iced Down, a thirty-eight-foot Bertram. Marvin Horner has run the New Pelican headboat out of Port A for more than thirty-three years. Asked by the South Jetty about current conditions, Horner's answer was the opposite of what the decade's headlines would predict: \"There's more snapper here now. More snapper out there than I've ever seen in my life.\"",
          "Since 1992, proceeds from the Deep Sea Roundup — founded by the Boatmen Association ninety-four years ago — have funded a scholarship program that has awarded more than $200,000 to over 150 local students. The tournament that was a civic ritual older than most of the federal regulations now governing the fishery has quietly turned into the island's longest-running community investment.",
          "The commercial tension is not fully gone. Texas Parks and Wildlife's patrol vessel, the Captain Murchison, has recovered more than 60,000 feet of illegal long lines off the South Texas coast since the mid-2000s. Illegal long-lining is precisely the kind of activity that the IFQ system was meant to make unnecessary — a sign that regulated scarcity, even in recovery, still produces black-market pressure.",
          "And the fleet has had to absorb the other great modern disruption. On August 25, 2017, Hurricane Harvey made landfall near Port Aransas as a Category 4 storm with 130-mile-per-hour winds, generating roughly $1 billion in damage and affecting 100 percent of the island's businesses and 85 percent of its homes. Woody's Sports Center owner and former mayor Glenn Martin took out $300,000 in personal loans to keep his tackle and charter-accessory business open. The 2017 and most of the 2018 charter seasons were carried on debt and grit.",
        ],
        pullQuote: {
          text: "\"There's more snapper here now. More snapper out there than I've ever seen in my life.\"",
          attribution: "Capt. Marvin Horner, New Pelican headboat, 33+ years running Port A headboats",
        },
      },
      {
        heading: "Adaptation",
        body: [
          "The island was never the Gulf's red snapper capital. Pensacola was. At its peak, the Pensacola smack fleet was bigger than Port Aransas's entire population. What Port Aransas had instead was structure — a rail connection, a harbor, a population of working captains — and a willingness to adjust when the water changed. The sea turtle trade collapsed. The schooners gave way to diesel. The winter snapper season was closed. The quotas split and re-split. The shrimpers blockaded the channel. The charter fleet rose alongside the commercial fleet and, eventually, surpassed it. A hurricane took the island apart and the charter captains rebuilt it on borrowed money.",
          "What is left of the commercial red snapper fleet in Port Aransas today is not a dock full of working boats. It is a quota file in a federal database, a set of leased allocations, and a handful of captains who still remember buying their business when the season was open year-round. What is not left is more interesting than what is. Farley Boat Works no longer builds boats commercially. The Aransas Harbor Terminal Railway ran its last train in 1947. The five-hundred-pound sea turtles have been gone for a century. The schooners never came at all.",
          "What is left, and what the island has quietly turned into its defining economic identity, is the fishing trip itself — the Gulf Eagle pulling out of its slip at dawn, the Deep Sea Roundup's ninety-fourth annual weigh-in on the courthouse lawn every July, a scholarship fund built on entry fees, and a charter captain who can stand on his dock and say, truthfully, that there is more snapper in the Gulf today than there has been in his lifetime.",
          "A working port adapts. The fish stopped being what the port sold. The access to the fish became what the port sold instead. That, more than any single amendment or any single boat, is how Port Aransas got from the narrow-gauge 1880s to the charter fleet of the 2020s. It is a long ride by any measure.",
        ],
      },
    ],

    sources: [
      { label: "NOAA Fisheries — History of Management of Gulf of America Red Snapper", url: "https://www.fisheries.noaa.gov/southeast/sustainable-fisheries/history-management-gulf-america-red-snapper" },
      { label: "NOAA Fisheries — Baseline of the Gulf of Mexico Red Snapper Fishery 1874–1986", url: "https://www.fisheries.noaa.gov/inport/item/56147" },
      { label: "NOAA Fisheries — Gulf of Mexico Reef Fish Historical Amendments and Rulemaking (1983–2017)", url: "https://www.fisheries.noaa.gov/action/gulf-mexico-reef-fish-historical-amendments-and-rulemaking-1983-2017" },
      { label: "Gulf of Mexico Fishery Management Council — Reef Fish Amendment 26 (IFQ)", url: "https://gulfcouncil.org/amendments/reef-fish-amendment-26/" },
      { label: "Solís, del Corral, Perruso & Agar — \"The Gulf of Mexico Red Snapper IFQ Program: The First Five Years,\" Marine Resource Economics 29(2), 2014", url: "https://www.journals.uchicago.edu/doi/10.1086/676825" },
      { label: "Coastal Conservation Association v. U.S. Department of Commerce (5th Cir., on Amendment 40)", url: "https://caselaw.findlaw.com/us-5th-circuit/1765986.html" },
      { label: "NOAA Fisheries — Amendment 50A–F State Management Program", url: "https://www.fisheries.noaa.gov/action/amendment-50a-f-state-management-program-recreational-red-snapper" },
      { label: "Texas Parks & Wildlife — Red Snapper regulations", url: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/red-snapper" },
      { label: "Texas State Historical Association — Port Aransas, TX", url: "https://www.tshaonline.org/handbook/entries/port-aransas-tx" },
      { label: "Texas State Historical Association — Aransas Harbor Terminal Railway", url: "https://www.tshaonline.org/handbook/entries/aransas-harbor-terminal-railway" },
      { label: "Port Aransas Preservation & Historical Association — History of the Island", url: "https://portaransasmuseum.org/history-of-the-island/" },
      { label: "Port Aransas South Jetty — \"The rap on snapper caps\"", url: "https://www.portasouthjetty.com/articles/the-rap-on-snapper-caps/" },
      { label: "Port Aransas Deep Sea Roundup (official site)", url: "https://roundup.portasouthjetty.com/" },
      { label: "UPI Archives — \"Shrimpboats blockade pass to protest turtle devices\" (July 22, 1989)", url: "https://www.upi.com/Archives/1989/07/22/Shrimpboats-blockade-pass-to-protest-turtle-devices/4735617083200/" },
      { label: "Hart, Primrose, Nance & Williams — \"Changes in Shrimping Effort in the Gulf of Mexico and the Impacts to Red Snapper\" (PMC)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7240115/" },
      { label: "Florida Public Archaeology Network — \"Talking Smack: The Sailing Vessels of Pensacola's Red Snapper Fishing Industry\"", url: "https://www.fpan.us/presentations/talking-smack-the-sailing-vessels-of-pensacolas-red-snapper-fishing-industry/" },
      { label: "Deep Sea Headquarters — fleet page", url: "https://deepseaheadquarters.com/our-fleet/" },
      { label: "Fisherman's Wharf Port Aransas", url: "https://www.fishermanswharfporta.com/" },
      { label: "Dolphin Docks Deep Sea Fishing", url: "https://dolphindocks.com/" },
      { label: "Houston Public Media — \"Harvey damaged 100 percent of Port Aransas businesses, but the island town is working its way back\"", url: "https://www.houstonpublicmedia.org/articles/news/2018/08/20/300865/harvey-damaged-100-percent-of-port-aransas-businesses-but-the-island-town-is-working-its-way-back/" },
    ],

    visitToday: [
      { place: "Deep Sea Roundup weigh-in", detail: "Held annually the second week of July at the Port Aransas Civic Center and harbor. The ninety-fourth edition of the tournament that the Boatmen Association started in 1932. Scholarship proceeds have topped $200,000 since 1992." },
      { place: "Fisherman's Wharf", detail: "Current working dock at the site of the 1929 Silver King Cafe and 1933 Matthew's Place. Headboats, offshore snapper trips, and the Wharf Cat / Scat Cat run from here." },
      { place: "Deep Sea Headquarters", detail: "440 W. Cotter Road. Captain Kelly Owens's five-vessel fleet — Gulf Eagle, Kingfisher, Pelican, Scarlet Lady, Red Dragon — works the post-IFQ federal season April through October." },
      { place: "Port Aransas Museum", detail: "The PAPHA collection holds the primary visual record of the island's commercial fleet era — photographs, gear, oral histories. The commercial side is less celebrated than the tarpon side, but the archive is there.", slug: "port-aransas-museum" },
    ],
  },

  "charles-bujan": {
    lede:
      "In April 2026, eight and a half years after Hurricane Harvey, a small crowd gathered in downtown Port Aransas to cut a ribbon on the new Charles R. Bujan Public Safety Building. Fourteen thousand square feet, hurricane-resistant construction, $12 million, built to house everything that runs the city's emergency response — the police department, the dispatch center, the Emergency Operations Center where the next mandatory evacuation will be called. The man whose name was now on the front of it had died of pancreatic cancer four years earlier. To understand what he did to deserve that name on that building, you have to start with a ferry crossing in 1944.",

    sections: [
      {
        heading: "The Ribbon",
        body: [
          "City Manager Dave Parsons — one of the four officials who rode out Harvey at the UT Marine Science Institute building five blocks away — spoke at the ribbon-cutting. He had been there with Charles Bujan for the worst week of the storm and every week of the recovery. By April 2026 he was the institutional memory of an eight-and-a-half-year fight that the building itself was the answer to.",
          "FEMA had funded $7.7 million of the $12 million. Bujan had spent the last four years of his life arguing for that money — testifying to Texas state lawmakers, calling FEMA out on local TV, telling reporters at press conferences in Port Aransas City Hall that the agency \"may have very well set you up to fail.\" He had not lived to see the building open. The town opened it for him.",
          "To understand the man who got an island a hurricane-resistant building with his name on the front of it, you have to start with the ferry he was born on.",
        ],
        pullQuote: {
          text: "He poured his heart into the recovery. He wore the recovery on his sleeve. He cared. He was a mayor for the little man, little person.",
          attribution: "City Manager David Parsons, ribbon-cutting, April 2026",
        },
      },
      {
        heading: "The Boy Born on the Ferry",
        body: [
          "On August 9, 1944, Viola Bujan went into labor on the ferry between Port Aransas and Corpus Christi. She was halfway across the Lydia Ann Channel — between the island where her family had lived for 130 years and the mainland hospital she was trying to reach — when her son Charles Robert Bujan was born. He told the story his whole life. He said he was born \"between Port Aransas and Corpus Christi.\"",
          "The Bujan family had been on Mustang Island for 130 years when Charles Robert was born. His great-great-grandfather Franz Josef Frandolig emigrated from Hungary in 1815 and settled in what would become Rockport, then moved across the channel to the fishing village locals called Tarpon — today Port Aransas — in the late 1800s. His grandfather Matteo Bujan came from Croatia. By the time Charles arrived in 1944, his family had been Mustang Islanders longer than Texas had been a state.",
          "His father — Charles Clifford \"Charlie\" Bujan — was a school janitor and a pilot boat captain, a man who knew every channel into Aransas Pass from the wheelhouse perspective. In 1945 he founded Beacon RV Park. Viola raised Charles and his older sister Charlotte in a town then small enough that a school-aged boy knew every store, every charter captain, every house. Charles drove a maroon '57 Chevy in high school. He played quarterback at Aransas Pass High School — the island didn't have its own high school then. He answered to \"Charlie\" most of his life.",
        ],
        fact: [
          { label: "Born", value: "August 9, 1944 (on the Port A–Corpus Christi ferry)" },
          { label: "Family on Mustang Island since", value: "Late 1800s (Frandolig line, Hungarian via Rockport 1815)" },
          { label: "Parents", value: "Charles Clifford \"Charlie\" Bujan (1906–1970) + Viola Mildred Bujan" },
          { label: "Grandfather", value: "Matteo Bujan (Croatia)" },
        ],
      },
      {
        heading: "Going Away, Coming Home",
        body: [
          "He went to Wichita first — parts expeditor at the Cessna and Lear aircraft plants where the post-war American middle class was being assembled. Then the Air Force: four-plus years in communications, stationed in Idaho, Turkey, West Germany, and Sicily. Honorably discharged as sergeant. He came back to Texas, earned a bachelor's in economics at what was then Corpus Christi State University (today Texas A&M–Corpus Christi).",
          "And then he left. Around 1975, Charles Bujan moved to Atlantic City, New Jersey, to work for Prudential Insurance Company in personnel. He stayed twenty-five years. He rose to associate manager. He organized youth sports on weekends. He became — by all accounts — a New Jerseyan. The island stayed where it was, but Charles spent half his adult life in a different state, explaining benefits packages and running youth basketball clinics.",
          "Then he came home. The exact reasons are family history, not public record, but the timing is documented. He ran for Port Aransas City Council in 2006 and lost to Bubba Jensen. He filed again the next year and won. He told the South Jetty later, when they asked why he'd gone into politics: \"I wanted to be a part of that growth.\"",
          "He won re-election in 2009, 2011, and 2014. Four straight two-year terms on council. By the time the council seat ran its course, Charles Bujan was 71 years old, had been home almost a decade, and was about to be elected mayor.",
        ],
      },
      {
        heading: "Mayor at 71",
        body: [
          "In May 2016, Charles Bujan was elected mayor of Port Aransas. He had fifteen months as a relatively unknown small-town mayor before Hurricane Harvey would define everything else.",
          "Friday, August 23, 2017, he was watching weather. A tropical disturbance had spun up in the Bay of Campeche, and the early models had it threading up the Texas coast. Bujan would tell KUT later that he had a premonition about its track from the first model run.",
          "By Wednesday morning, August 24, the storm had a name. Most of the Coastal Bend was issuing voluntary evacuations. Houston was issuing warnings about flooding, not landfall. Most of the Texas coast was treating Harvey as a wind event. Bujan met with city officials around 10:30 a.m. He told them: we're evacuating. Mandatory. Tonight.",
          "The order called for all residents — about 4,000 people — to leave Port Aransas by 9 p.m. that night. Twelve hours of warning. Most of those residents had lived through hurricanes before, including Carla in 1961 and Celia in 1970. A lot of them, in any small town, would have decided to ride this one out. Bujan made the call that took the choice away from them. It was not a popular decision. It was also not an obvious one. Port Aransas's mandatory evacuation, ordered with twelve hours of lead time on the personal authority of a fifteen-month-old mayor, was an outlier on the Texas coast.",
        ],
        pullQuote: {
          text: "As I watched it develop over time, I realized that there was no place it could come except right here in Port Aransas.",
          attribution: "Charles Bujan, KUT, Aug. 20, 2018",
        },
      },
      {
        heading: "The Most Difficult Call",
        body: [
          "Hurricane Harvey made landfall as a Category 4 storm at approximately 10:00 p.m. on August 25, 2017. The eye crossed San Jose Island, then again at Rockport-Fulton. The eyewall — the most violent ring around the eye — passed directly over Port Aransas. Sustained winds reached 130 mph. Aransas County Airport, just across the bay, recorded a gust of 145 mph. The storm surge in Port Aransas reached 5.53 feet on the gauge.",
          "When morning came, four city and county officials emerged from the brick UT Marine Science Institute building, where they had ridden out the storm together: City Manager Dave Parsons, Building Official Abel Carrillo, Emergency Operations Coordinator Rick Adams, EMS Director Tim McIntosh. Adams later said his emotional state during the night went \"from confident … to fearful.\" Parsons texted the South Jetty editor at 2:53 a.m. Sunday: \"Town very smashed up. Not sure if this text will make it out??? Little to zero cell coverage.\"",
          "Charles Bujan was not among them. He had stayed in Corpus Christi, knowing he could not be of help to anyone if the only road home was buried under debris. State Highway 361 was buried. He waited.",
        ],
        pullQuote: {
          text: "I'm glad I did, otherwise we would've had a lot of body bags after the hurricane. Because we only had 12 hours to get everybody off here before this thing was a major storm. So that to me was the most difficult call of my life. I'll never forget it.",
          attribution: "Charles Bujan on the evacuation order, KUT, Aug. 20, 2018",
        },
        fact: [
          { label: "Landfall", value: "Aug. 25, 2017 · ~10:00 p.m. CDT" },
          { label: "Category", value: "4 (sustained 130 mph)" },
          { label: "Peak gust at Aransas County Airport", value: "145 mph" },
          { label: "Storm surge in Port Aransas", value: "5.53 ft (gauge)" },
          { label: "Port Aransas businesses damaged", value: "100%" },
          { label: "Port Aransas homes damaged", value: "85%" },
          { label: "City infrastructure damage", value: "$50–$70 million" },
          { label: "Property tax base lost", value: "~$300 million" },
          { label: "Deaths within Port Aransas city limits", value: "0" },
        ],
      },
      {
        heading: "\"We Are Encouraging Residents Not To Come Back\"",
        body: [
          "By Saturday morning, August 26, the road cleared enough for the assessment to begin. Bujan made it back. KIII-TV asked for a statement. He gave them three words: \"It's a mess.\"",
          "Sunday, August 27, he gave a longer one: \"We are encouraging residents not to come back.\" The trailer park, he said, was a \"100 percent loss.\" The Port Aransas he was looking at had taken damage to 100 percent of its businesses, 85 percent of its homes, and somewhere between $50 million and $70 million in city infrastructure. Total estimated damage approached $1 billion. Property tax base lost: $300 million.",
          "Zero deaths within the city limits. None. Bujan's mandatory evacuation — the call most other Coastal Bend mayors did not make — had emptied the island.",
          "When the South Jetty asked him about the residents who had defied his order and stayed anyway, his answer was characteristic.",
        ],
        pullQuote: {
          text: "I would say that was a major miracle… They lucked out, to be honest with you.",
          attribution: "Charles Bujan on the residents who didn't evacuate, South Jetty",
        },
      },
      {
        heading: "Nine Years Against the Federal Clock",
        body: [
          "The water came back first. Then sewer. Then power. By late September, a month after landfall, the basics had returned. Bujan told Texas Public Radio that the recovery would take \"Years. … A lot of help from the government; state and federal.\"",
          "He was right about the years. He was wrong about the help.",
          "By December 2017 he was in front of a Texas House Appropriations Subcommittee saying FEMA \"may have very well set you up to fail.\" By January 2018, at a press conference at Port Aransas City Hall, he was sharper: \"They have been a tremendous failure,\" he said, referring to the FEMA-to-General-Land-Office mobile-home program for displaced residents. \"They rank high on promises and way low on promises kept.\" He pointed at the funding split. \"Just recently our federal government released $54 million in grants. $47 million went to Houston. What does that leave for the rest of the coast?\"",
          "He refused to raise taxes. The property tax base was down $300 million; the obvious move would have been to make up the gap on the residents who remained. Bujan would not. He laid off 10 percent of city staff to save approximately $700,000. He froze new hires. He went after grants instead. By 2020 he was personally tracking 55 grant and funding projects worth more than $50 million, and the city had clung to its AA+ bond rating with $26 million in reserves — partly because it had spent years saying no to expenses while it waited for federal money that arrived in trickles.",
          "He also picked the fight nobody else wanted. The Port of Corpus Christi was preparing to build a Very Large Crude Carrier export terminal on Harbor Island, inside Port Aransas city limits, and the Port took the position that the city had no authority to permit or regulate the project. Bujan disagreed. The fight ran for years. It went to court. In 2021 the Port Aransas City Council voted 7–0 to approve a settlement: an interlocal agreement, oversight on city ordinance, $1 million for the Port Aransas Fire Department, and what amounted to a permanent seat at the table for any future Harbor Island development. The largest port in Texas had been forced to sit down with a small barrier-island town and treat it as a co-equal regulator.",
        ],
        pullQuote: {
          text: "FEMA is slow. That's the problem. … It's really frustrating. It's slow as molasses running uphill.",
          attribution: "Charles Bujan, three years after Harvey, South Jetty",
        },
      },
      {
        heading: "No Normal Year",
        body: [
          "He kept saying he wanted a normal year.",
          "In 2019 he had cardiac bypass surgery. In 2020 he was treated for colon cancer. He won re-election that May for a third term. By August 2020 — three years after Harvey — he was telling the South Jetty he felt \"way behind the eight ball\" on infrastructure recovery, \"primarily because we have to deal with FEMA.\" Then he caught the deadpan: \"I'm just glad we don't have another Harvey to get through. So far.\"",
          "In early 2021 he told the South Jetty: \"I'd like to have just a normal year. No crises. Seems like I've had crises ever since 2017.\"",
          "He did not get one. On October 21, 2021, he announced publicly that he had Stage 4 pancreatic cancer.",
          "He stayed in office. He kept signing things. He kept showing up to council meetings while he could. He kept fighting FEMA.",
          "On the morning of February 9, 2022 — a Wednesday — Charles Robert Bujan died at home in Port Aransas, in hospice care. He was 77. The next day, Governor Greg Abbott ordered the Port Aransas city flags to half-staff. A memorial service was held at the Port Aransas Civic Center on March 5. Mayor Pro Tem Joan Holt served the rest of his term until Wendy Moore won the May 7 special election with 901 votes.",
          "Pastor William Campbell, who had known him for years, summed up the Charles Bujan that the town remembered: \"Charles would do anything for the people of Port Aransas. … He always remained positive.\"",
        ],
        pullQuote: {
          text: "We love the sea — that's why we live here. … But none of us who have lived through this will ever look at the Gulf of Mexico the same way again. And I'm a fisherman.",
          attribution: "Charles Bujan, KUT, Aug. 20, 2018",
        },
      },
      {
        heading: "What He Left",
        body: [
          "Eight and a half years after Harvey, the boy who was born on the ferry came home to a 14,000-square-foot building with his name on the front. He had run for office at 62. Won the mayor's job at 71. Ordered an evacuation that saved everyone in town. Fought the federal government for half a decade. Picked a winning fight with the largest port in Texas. Refused to raise taxes once. Lost three pieces of his health to crises he did not get to choose.",
          "The Bujan family established the Mayor Bujan Community Scholarship Fund through American Bank in his memory. The Charles R. Bujan Public Safety Building stands downtown, ready for the next call. The ferry he was born on still runs.",
          "So does the town.",
        ],
      },
    ],

    sources: [
      { label: "Port Aransas South Jetty — \"Barefoot boy to three-term mayor\" (definitive bio)", url: "https://www.portasouthjetty.com/articles/barefoot-boy-to-three-term-mayor/" },
      { label: "Port Aransas South Jetty — \"The surreality of Harvey\"", url: "https://www.portasouthjetty.com/articles/the-surreality-of-harvey/" },
      { label: "Port Aransas South Jetty — \"Harvey: Hell & high water\"", url: "https://www.portasouthjetty.com/articles/harvey-hell-high-water/" },
      { label: "Port Aransas South Jetty — \"Leaving Harvey behind\" (one-year)", url: "https://www.portasouthjetty.com/articles/leaving-harvey-behind/" },
      { label: "Port Aransas South Jetty — \"Three years later\"", url: "https://www.portasouthjetty.com/articles/three-years-later/" },
      { label: "Port Aransas South Jetty — \"Airing the issues\" (fiscal stewardship)", url: "https://www.portasouthjetty.com/articles/airing-the-issues/" },
      { label: "Port Aransas South Jetty — \"The path forward\" (early 2021)", url: "https://www.portasouthjetty.com/articles/the-path-forward/" },
      { label: "Port Aransas South Jetty — \"Governor offers condolences after Port Aransas mayor's death\"", url: "https://www.portasouthjetty.com/articles/governor-offers-condolences-after-port-aransas-mayors-death/" },
      { label: "KUT (Austin NPR) / Texas Standard — \"Harvey damaged 100 percent of Port Aransas businesses\" (Aug. 20, 2018)", url: "https://www.kut.org/texas/2018-08-20/harvey-damaged-100-percent-of-port-aransas-businesses-but-the-island-town-is-working-its-way-back" },
      { label: "Texas Standard — \"We're Resilient People, Port Aransas Mayor Says City Is Recovering\" (Jan. 5, 2018)", url: "https://www.texasstandard.org/stories/were-resilient-people-port-aransas-mayor-says-city-is-recovering-despite-receiving-little-help/" },
      { label: "Texas Public Radio — \"Rebuilding After Harvey\" (Sept. 25, 2017)", url: "https://www.tpr.org/news/2017-09-25/rebuilding-after-harvey-the-road-to-recovery-for-port-aransas" },
      { label: "Texas Tribune — \"Texans left in limbo as Gov. Abbott, FEMA use Harvey to reinvent disaster response\" (Feb. 27, 2018)", url: "https://www.texastribune.org/2018/02/27/texans-left-limbo-gov-abbott-fema-use-harvey-reinvent-disaster-respons/" },
      { label: "CBS News — \"We are encouraging residents not to come back\" (Aug. 27, 2017)", url: "https://www.cbsnews.com/news/we-are-encouraging-residents-not-to-come-back-says-port-aransas-mayor/" },
      { label: "KRIS-TV — \"Port Aransas mayor Bujan dies at 77\"", url: "https://www.kristv.com/news/local-news/port-aransas-mayor-bujan-dies-at-77" },
      { label: "KRIS-TV — \"Ribbon cutting for new public safety building ends 8-and-a-half-year wait\"", url: "https://www.kristv.com/news/local-news/in-your-neighborhood/nueces-county/port-aransas/ribbon-cutting-for-new-public-safety-building-ends-8-and-a-half-year-wait-in-port-aransas" },
      { label: "KZTV — Ribbon cutting (with David Parsons quote)", url: "https://www.kztv10.com/news/local-news/ribbon-cutting-for-new-public-safety-building-ends-8-and-a-half-year-wait-in-port-aransas" },
      { label: "Marine Log — \"Port of Corpus Christi and City of Port Aransas settle Harbor Island spat\"", url: "https://www.marinelog.com/news/port-of-corpus-christi-and-city-of-port-aransas-settle-harbor-island-spat/" },
      { label: "NWS Corpus Christi — Major Hurricane Harvey, Aug. 25–29, 2017", url: "https://www.weather.gov/crp/hurricane_harvey" },
      { label: "FEMA — Texas Hurricane Harvey (DR-4332-TX)", url: "https://www.fema.gov/disaster/4332" },
      { label: "Charlie Marshall Funeral Homes — Charles Bujan obituary", url: "https://www.charliemarshallfuneralhomes.com/obituaries/Charles-Bujan" },
    ],

    visitToday: [
      { place: "Charles R. Bujan Public Safety Building", detail: "14,000 sq ft, ribbon-cut April 2026, downtown Port Aransas. Houses the police department, city jail, county constables, county courthouse, emergency dispatch, and Emergency Operations Center. The building Bujan spent the last four years of his life fighting FEMA to fund." },
      { place: "Port Aransas Civic Center", detail: "Site of his March 5, 2022 memorial service. Public-facing civic hub he used as the staging ground for press conferences during the Harvey recovery years." },
      { place: "Port Aransas Ferry — Lydia Ann Channel", detail: "He was born on a crossing of this stretch of water in 1944. The ferry still runs. So does the town.", slug: undefined },
      { place: "Port Aransas Museum", detail: "Holds the long-form record of every storm Port A has survived — Carla, Celia, Harvey, the recoveries that followed each. Bujan's leadership through Harvey is part of the institutional memory now.", slug: "port-aransas-museum" },
    ],
  },
};
