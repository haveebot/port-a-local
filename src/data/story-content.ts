/**
 * Story content for Island Stories heritage pages.
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
};
