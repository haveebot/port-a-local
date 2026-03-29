export interface HoursOfOperation {
  [day: string]: string; // e.g. "Monday": "11AM-9PM" or "Closed"
}

export interface MenuItem {
  name: string;
  description?: string;
  price?: string;
}

export interface MenuSection {
  section: string;
  items: MenuItem[];
}

export interface CharterOption {
  name: string;
  duration: string;
  price: string;
  description?: string;
}

export interface RentalOption {
  name: string;
  duration: string;
  price: string;
  description?: string;
}

export interface ScheduleEntry {
  name: string;
  times: string[];
  price?: string;
  description?: string;
}

export interface Business {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  hours: string;
  hoursOfOperation?: HoursOfOperation;
  featured: boolean;
  tags: string[];
  menu?: MenuSection[];
  charters?: CharterOption[];
  rentals?: RentalOption[];
  schedule?: ScheduleEntry[];
  priceRange?: string;
  amenities?: string[];
  verifiedPartner?: boolean;
}

export const businesses: Business[] = [
  // EAT
  {
    slug: "venetian-hot-plate",
    name: "Venetian Hot Plate",
    category: "eat",
    tagline: "Authentic Italian from a Venice native — a Port A institution since 1995",
    description:
      "Linda and Maurice Halioua brought the flavors of Venice, Italy to Port Aransas in 1995 and haven't looked back. The Venetian Hot Plate serves fresh, gourmet Italian fare with a hand-selected wine list like no other on the island. From crostini di granchio topped with jumbo lump crab to beef tenderloin medallions in Gorgonzola sauce, every dish is crafted with care. Reservations are highly recommended — this intimate spot fills up fast.",
    address: "232 Beach Ave, Port Aransas, TX 78373",
    phone: "(361) 749-7617",
    website: "https://venetianhotplate.com",
    hours: "Tue-Sat 5PM-10PM, Closed Sun-Mon",
    hoursOfOperation: {
      Monday: "Closed",
      Tuesday: "5:00 PM – 9:00 PM",
      Wednesday: "5:00 PM – 9:00 PM",
      Thursday: "5:00 PM – 10:00 PM",
      Friday: "5:00 PM – 10:00 PM",
      Saturday: "5:00 PM – 10:00 PM",
      Sunday: "Closed",
    },
    featured: true,
    tags: ["italian", "fine dining", "wine", "seafood", "date night"],
    priceRange: "$$$",
    menu: [
      {
        section: "Appetizers",
        items: [
          {
            name: "Crostini di Granchio",
            description:
              "Grilled ciabatta bread topped with jumbo lump crab meat sautéed in brown butter with lemon and sage",
          },
          {
            name: "Grilled Calamari Steak",
            description: "Tender calamari steak grilled to perfection",
          },
          {
            name: "Gamberetti al Limone",
            description: "Six shrimp tossed in garlic lemon butter sauce",
          },
        ],
      },
      {
        section: "Entrées",
        items: [
          {
            name: "Beef Tenderloin Medallions",
            description:
              "Smothered in rich Gorgonzola sauce, served with potatoes and spinach",
          },
          {
            name: "Veal Scallopine",
            description: "Classic Italian preparation with a house twist",
          },
          {
            name: "Lasagna",
            description: "House-made layered pasta with meat sauce and cheese",
          },
        ],
      },
      {
        section: "Desserts",
        items: [
          { name: "Tiramisu", description: "Classic Italian coffee-flavored dessert" },
          {
            name: "Death by Chocolate",
            description: "Flourless chocolate cake for the serious chocoholic",
          },
        ],
      },
    ],
  },
  {
    slug: "port-a-beachlodge",
    name: "Port A Beachlodge",
    category: "eat",
    tagline: "Beachfront bar & grill 200 feet from the Gulf — pet-friendly & laid-back",
    description:
      "Perched right on the sand at Beach Marker #9, Port A Beachlodge is as close to the water as you can dine on the island. This laid-back, pet-friendly spot serves fresh peel-and-eat shrimp, oyster po'boys, burgers, and cold beer just 200 feet from the ocean. The vibe is flip-flops-and-sunscreen casual, and the views are million-dollar. Over 226 Yelp reviews and counting.",
    address: "2016 On The Beach Dr, Port Aransas, TX 78373",
    phone: "(361) 749-5714",
    website: "https://www.portabeachlodge.com",
    hours: "Sun-Thu 8AM-9PM, Fri-Sat 8AM-10PM",
    hoursOfOperation: {
      Monday: "8:00 AM – 12:00 AM",
      Tuesday: "8:00 AM – 12:00 AM",
      Wednesday: "8:00 AM – 12:00 AM",
      Thursday: "8:00 AM – 12:00 AM",
      Friday: "8:00 AM – 1:00 AM",
      Saturday: "8:00 AM – 1:00 AM",
      Sunday: "8:00 AM – 12:00 AM",
    },
    featured: true,
    tags: ["beachfront", "bar & grill", "pet-friendly", "casual", "seafood"],
    priceRange: "$$",
    menu: [
      {
        section: "Favorites",
        items: [
          {
            name: "Peel & Eat Shrimp",
            description: "Fresh Gulf shrimp served by the pound",
          },
          {
            name: "Oyster Po'Boy",
            description: "Fried Gulf oysters on a toasted hoagie",
          },
          {
            name: "Beach Burger",
            description: "Half-pound patty with your choice of toppings",
          },
        ],
      },
    ],
  },
  {
    slug: "crazy-cajun",
    name: "Crazy Cajun Seafood Restaurant",
    category: "eat",
    tagline: "Boiled seafood dumped right on the table — no plates needed since 1987",
    description:
      "The Crazy Cajun is a Port A legend, serving the island for over 37 years. They dump your boiled shrimp, crab, and crawfish straight onto the butcher-paper-covered table, seasoned with their own special Cajun spices. Order the signature Hungry Cajun — a combination of fresh shrimp, crab, smoked sausage, corn on the cob, and new potatoes. Crawfish when in season. It's messy, loud, and absolutely perfect. A must-do for first-timers and a weekly ritual for regulars.",
    address: "303 Beach Ave, Port Aransas, TX 78373",
    phone: "(361) 749-5069",
    website: "https://crazycajun.top",
    hours: "Tue-Fri 5PM-9PM, Sat 12PM-9PM, Sun 5PM-8:30PM, Closed Mon",
    hoursOfOperation: {
      Monday: "Closed",
      Tuesday: "5:00 PM – 9:00 PM",
      Wednesday: "5:00 PM – 9:00 PM",
      Thursday: "5:00 PM – 9:00 PM",
      Friday: "5:00 PM – 9:00 PM",
      Saturday: "12:00 PM – 9:00 PM",
      Sunday: "5:00 PM – 8:30 PM",
    },
    featured: false,
    tags: ["cajun", "boiled seafood", "casual", "iconic", "family-friendly"],
    priceRange: "$$",
    menu: [
      {
        section: "Signature Dishes",
        items: [
          {
            name: "The Hungry Cajun",
            description:
              "Fresh shrimp, crab, smoked sausage, corn on the cob & new potatoes — boiled and seasoned with Cajun spices",
          },
          {
            name: "Kiddie Cajun",
            description:
              "Mild spices — corn on the cob, new potatoes, and sausage made just for kids",
          },
          {
            name: "Baby Back Ribs",
            description:
              "Tender baby backs served with corn, potatoes & house barbecue sauce",
          },
        ],
      },
      {
        section: "By the Pound",
        items: [
          {
            name: "Shrimp",
            description: "Fresh Gulf shrimp, half or full pound",
            price: "Market price",
          },
          {
            name: "Snow Crab",
            description: "Half or full pound",
            price: "Market price",
          },
          {
            name: "Crawfish",
            description: "When in season, half or full pound",
            price: "Market price",
          },
          {
            name: "Smoked Sausage",
            description: "Half or full pound",
            price: "Market price",
          },
        ],
      },
      {
        section: "Cajun Classics",
        items: [
          {
            name: "Gumbo",
            description: "Roux-based recipe served over rice",
          },
          {
            name: "Jambalaya",
            description:
              "Chicken, ham & smoked sausage topped with creole sauce",
          },
          {
            name: "Red Beans & Rice",
            description:
              "Three kinds of beans with smoked sausage, celery, bell pepper & onion",
          },
          {
            name: "Shrimp Remoulade",
            description:
              "Jumbo shrimp boiled, peeled & served with handmade creamy remoulade sauce",
          },
        ],
      },
      {
        section: "Desserts",
        items: [
          { name: "Key Lime Pie" },
          { name: "French Silk Pie" },
          {
            name: "Cheesecake",
            description: "Plain, cherry, or blueberry",
          },
        ],
      },
    ],
  },

  {
    slug: "tortugas-saltwater-grill",
    name: "Tortuga's Saltwater Grill",
    category: "eat",
    tagline: "Premium Gulf Coast seafood & hand-cut steaks in an upscale island setting",
    description:
      "Tortuga's Saltwater Grill is Port Aransas's top-rated restaurant, serving premium Gulf Coast seafood and hand-cut steaks in a cozy, upscale setting. From creative sushi-inspired starters to Parmesan-crusted flounder and lobster bisque, every dish is crafted with care. They offer Sunday brunch with coffee and cocktails, an extensive lunch and dinner menu 7 days a week, and reservations via OpenTable. Rated 4.7 stars by nearly 1,000 OpenTable diners.",
    address: "429 N Alister St, Port Aransas, TX 78373",
    phone: "(361) 749-2739",
    website: "https://www.tortugassaltwatergrill.com",
    hours: "Mon-Thu 3PM-9PM, Fri-Sun 9AM-2PM & 3PM-9PM",
    hoursOfOperation: {
      Monday: "3:00 PM – 9:00 PM",
      Tuesday: "3:00 PM – 9:00 PM",
      Wednesday: "3:00 PM – 9:00 PM",
      Thursday: "3:00 PM – 9:00 PM",
      Friday: "9:00 AM – 2:00 PM, 3:00 PM – 9:00 PM",
      Saturday: "9:00 AM – 2:00 PM, 3:00 PM – 9:00 PM",
      Sunday: "9:00 AM – 2:00 PM, 3:00 PM – 9:00 PM",
    },
    featured: true,
    tags: ["seafood", "steaks", "fine dining", "brunch", "sushi"],
    priceRange: "$$$",
    menu: [
      {
        section: "Favorites",
        items: [
          {
            name: "Lobster Bisque",
            description: "Rich, creamy house-made lobster bisque",
          },
          {
            name: "Parmesan Crusted Flounder",
            description: "Gulf flounder with a crispy Parmesan crust",
          },
          {
            name: "Shrimp & Grits",
            description:
              "Cheddar grit cakes topped with Gulf shrimp sautéed with crispy bacon, corn & poblano peppers",
          },
          {
            name: "Big Cheesy Burger",
            description: "House favorite — a loaded gourmet burger",
          },
        ],
      },
    ],
  },
  {
    slug: "virginias-on-the-bay",
    name: "Virginia's On The Bay",
    category: "eat",
    tagline: "Waterfront seafood since 1996 — bring your catch, they'll cook it",
    description:
      "Virginia's on the Bay has been serving fresh seafood to Port A since 1996. This two-story waterfront eatery offers amazing views of the lighthouse, harbor, and the channel from the open-air deck. Bring in your own catch of the day and they'll prepare it grilled, blackened, or fried with family-style sides. Known for their crab cakes, fresh oysters on the half shell, seafood gumbo, and the legendary chocolate and coconut gooey Louie dessert. Pull up by boat and dock for dinner.",
    address: "815 Trout St, Port Aransas, TX 78373",
    phone: "(361) 749-4088",
    website: "https://virginiasonthebay.com",
    hours: "Sun-Thu 11AM-9PM, Fri-Sat 11AM-10PM",
    hoursOfOperation: {
      Monday: "11:00 AM – 9:00 PM",
      Tuesday: "11:00 AM – 9:00 PM",
      Wednesday: "11:00 AM – 9:00 PM",
      Thursday: "11:00 AM – 9:00 PM",
      Friday: "11:00 AM – 10:00 PM",
      Saturday: "11:00 AM – 10:00 PM",
      Sunday: "11:00 AM – 9:00 PM",
    },
    featured: true,
    tags: ["waterfront", "seafood", "family-friendly", "boat dock", "cook your catch"],
    priceRange: "$$",
    menu: [
      {
        section: "Highlights",
        items: [
          {
            name: "Crab Cakes",
            description: "House-made jumbo lump crab cakes",
          },
          {
            name: "Oysters on the Half Shell",
            description: "Fresh Gulf oysters served raw",
          },
          {
            name: "Cook Your Catch",
            description:
              "Bring your cleaned fish — grilled, blackened, or fried with family-style sides",
          },
          {
            name: "Chocolate Coconut Gooey Louie",
            description: "Signature dessert — a must-try",
          },
        ],
      },
    ],
  },
  {
    slug: "fins-grill-icehouse",
    name: "FINS Grill & Icehouse",
    category: "eat",
    tagline: "Waterfront seafood & grill — you hook 'em, we cook 'em!",
    description:
      "FINS Grill & Icehouse is a waterfront dining destination offering fresh Gulf seafood, creative cocktails, and island vibes right on the marina. Their motto says it all: 'You hook 'em, we cook 'em!' Bring in your fresh-caught, cleaned fish and FINS will prepare it grilled, fried, blackened, or garlic. A casual, come-as-you-are spot perfect for families, fishermen, and anyone craving Gulf-fresh seafood.",
    address: "440 W Cotter Ave, Port Aransas, TX 78373",
    phone: "(361) 749-8646",
    website: "https://www.finsgrillandicehouse.com",
    hours: "Mon-Thu 11AM-8PM, Fri-Sat 11AM-9PM, Sun 11AM-8PM",
    hoursOfOperation: {
      Monday: "11:00 AM – 8:00 PM",
      Tuesday: "11:00 AM – 8:00 PM",
      Wednesday: "11:00 AM – 8:00 PM",
      Thursday: "11:00 AM – 8:00 PM",
      Friday: "11:00 AM – 9:00 PM",
      Saturday: "11:00 AM – 9:00 PM",
      Sunday: "11:00 AM – 8:00 PM",
    },
    featured: false,
    tags: ["waterfront", "seafood", "grill", "casual", "cook your catch"],
    priceRange: "$$",
  },
  {
    slug: "la-playa-mexican-grille",
    name: "La Playa Mexican Grille",
    category: "eat",
    tagline: "Fresh Tex-Mex, 70+ tequilas & island-famous fish tacos since 2002",
    description:
      "La Playa Mexican Grille has been serving unforgettable food and good times since 2002. Featuring daily fresh fish specials, classic Tex-Mex favorites, and a collection of over 70 tequilas, this is the island's go-to for Mexican cuisine. Try the avocado crab nest, blackened tuna tacos, or the Island Pepper — a roasted poblano stuffed with white cheese, wrapped in fajita steak, topped with ranchero sauce and chili con queso. Ranked #9 of all restaurants in Port Aransas on TripAdvisor.",
    address: "222 Beach Ave, Port Aransas, TX 78373",
    phone: "(361) 749-0022",
    website: "https://laplayamexicangrille.com",
    hours: "Tue-Sat 5PM-10PM, Closed Sun-Mon",
    hoursOfOperation: {
      Monday: "Closed",
      Tuesday: "5:00 PM – 10:00 PM",
      Wednesday: "5:00 PM – 10:00 PM",
      Thursday: "5:00 PM – 10:00 PM",
      Friday: "5:00 PM – 10:00 PM",
      Saturday: "5:00 PM – 10:00 PM",
      Sunday: "Closed",
    },
    featured: false,
    tags: ["mexican", "tex-mex", "tequila", "fish tacos", "date night"],
    priceRange: "$$",
    menu: [
      {
        section: "Signature Dishes",
        items: [
          {
            name: "Avocado Crab Nest",
            description:
              "Half avocado stuffed with sautéed lump crab meat, topped with melted white cheese, cilantro ranch & pico de gallo",
          },
          {
            name: "Blackened Tuna Tacos",
            description: "Fresh tuna blackened and served in warm tortillas",
          },
          {
            name: "Island Pepper",
            description:
              "Roasted poblano stuffed with white cheese, wrapped in fajita steak, topped with ranchero sauce & queso",
          },
          {
            name: "Crabmeat Enchiladas",
            description:
              "Stuffed with sautéed lump crab & avocado, topped with creamy roasted poblano sauce",
          },
        ],
      },
    ],
  },
  {
    slug: "roosevelts-tarpon-inn",
    name: "Roosevelt's at The Tarpon Inn",
    category: "eat",
    tagline: "Fine dining in a historic 1886 courtyard — hand-cut steaks & Gulf seafood",
    description:
      "Tucked behind the historic Tarpon Inn (est. 1886), Roosevelt's serves fine dining in an intimate courtyard setting. The curated menu features hand-cut steaks with rich Bordelaise sauce, coconut-crusted jumbo shrimp, firecracker tenderloin, and citrus-grilled Mahi Mahi with lobster cream. The adjacent 1886 Bar offers craft cocktails in a cozy lounge. Wine Down Wednesdays feature half-price select bottles. Named after President FDR, who fished off Port Aransas in 1937. Reservations required.",
    address: "200 E Cotter Ave, Port Aransas, TX 78373",
    phone: "(361) 749-1540",
    website: "https://www.rooseveltsatthetarponinn.com",
    hours: "Mon, Thu-Sun 5PM-9PM, Closed Tue-Wed",
    hoursOfOperation: {
      Monday: "5:00 PM – 9:00 PM",
      Tuesday: "Closed",
      Wednesday: "Closed",
      Thursday: "5:00 PM – 9:00 PM",
      Friday: "5:00 PM – 9:00 PM",
      Saturday: "5:00 PM – 9:00 PM",
      Sunday: "5:00 PM – 9:00 PM",
    },
    featured: false,
    tags: ["fine dining", "steaks", "seafood", "historic", "wine", "date night"],
    priceRange: "$$$",
    menu: [
      {
        section: "Signature Dishes",
        items: [
          {
            name: "Firecracker Tenderloin",
            description:
              "Bacon-wrapped tenderloin medallions with serrano pepper & Swiss cheese in Bordelaise atop mushroom risotto",
          },
          {
            name: "Coconut Jumbo Shrimp",
            description:
              "Panko-coconut encrusted jumbo shrimp drizzled with raspberry chipotle over shallot fries",
          },
          {
            name: "Citrus Grilled Mahi Mahi",
            description:
              "Grilled Mahi Mahi with potatoes, finished with creamy lobster sauce",
          },
        ],
      },
    ],
  },
  {
    slug: "kodys-restaurant",
    name: "Kody's Restaurant & Bar",
    category: "eat",
    tagline: "Burgers, seafood & steaks with 18-hole mini golf — kitchen open 'til 1AM",
    description:
      "Kody's is a long-time local favorite known for Texas-style comfort food — burgers, seafood, tacos, sandwiches, and steaks. One of the few restaurants on the island with a late-night kitchen open until 1AM and a bar 'til 2AM. All-you-can-eat shrimp on Wednesdays, Prime Rib Thursdays, and lunch specials daily from 11AM to 4PM. Plus 18-hole miniature golf right on-site. Family-friendly with plenty of vegetarian options.",
    address: "2034 Hwy 361, Port Aransas, TX 78373",
    phone: "(361) 749-8226",
    website: "https://www.kodysrestaurant.com",
    hours: "Mon-Fri 11AM-2AM (kitchen 'til 1AM)",
    featured: false,
    tags: ["burgers", "seafood", "late night", "mini golf", "family-friendly"],
    priceRange: "$$",
  },
  {
    slug: "grumbles-seafood-co",
    name: "Grumbles Seafood Co.",
    category: "eat",
    tagline: "Fast-casual Gulf seafood — everything caught in the Gulf of Mexico",
    description:
      "Grumbles Seafood Co. is deeply rooted in Port Aransas with a mission to serve high-quality Gulf Coast seafood in a fun, family-friendly environment. Everything they cook comes from the Gulf of Mexico — they serve nothing else. It's a fast-casual spot where families and fishermen can come as they are, whether fresh from the beach or the boat. The island-fare menu focuses on fresh seafood, burgers, and salads.",
    address: "850 Tarpon St, Port Aransas, TX 78373",
    phone: "(361) 749-1990",
    website: "https://grumblesseafoodco.com",
    hours: "Daily 11AM-9PM",
    hoursOfOperation: {
      Monday: "11:00 AM – 9:00 PM",
      Tuesday: "11:00 AM – 9:00 PM",
      Wednesday: "11:00 AM – 9:00 PM",
      Thursday: "11:00 AM – 9:00 PM",
      Friday: "11:00 AM – 9:00 PM",
      Saturday: "11:00 AM – 9:00 PM",
      Sunday: "11:00 AM – 9:00 PM",
    },
    featured: false,
    tags: ["seafood", "fast-casual", "family-friendly", "Gulf fresh", "burgers"],
    priceRange: "$$",
  },
  {
    slug: "port-a-pizzeria",
    name: "Port A Pizzeria",
    category: "eat",
    tagline: "Hand-tossed pizza, calzones & an all-you-can-eat buffet for 30+ years",
    description:
      "For over 30 years, Port A Pizzeria has been a Port Aransas staple, serving hand-tossed and thin-crust pizzas, calzones, hot subs, wings, and homemade meatballs. Their all-you-can-eat dine-in buffet includes a salad bar, pastas, a variety of pizzas, dessert, and a beverage. A perfect casual stop on Avenue G for families and groups.",
    address: "407 E Ave G, Port Aransas, TX 78373",
    phone: "(361) 749-5226",
    website: "https://www.portapizzeria.com",
    hours: "Daily 11AM-10PM",
    hoursOfOperation: {
      Monday: "11:00 AM – 10:00 PM",
      Tuesday: "11:00 AM – 10:00 PM",
      Wednesday: "11:00 AM – 10:00 PM",
      Thursday: "11:00 AM – 10:00 PM",
      Friday: "11:00 AM – 10:00 PM",
      Saturday: "11:00 AM – 10:00 PM",
      Sunday: "11:00 AM – 10:00 PM",
    },
    featured: false,
    tags: ["pizza", "calzones", "buffet", "family-friendly", "casual"],
    priceRange: "$",
  },
  {
    slug: "lisabellas-bistro",
    name: "Lisabella's Bistro & Bar",
    category: "eat",
    tagline: "Upscale coastal seafood at Cinnamon Shore — chef-driven menu & craft cocktails",
    description:
      "Lisabella's Bistro & Bar at Cinnamon Shore serves upscale coastal cuisine with a chef-driven menu. Highlights include baked oysters Lisabella, the Del Mar Pasta with diver sea scallops, wild Gulf shrimp, and fresh fish in chardonnay lobster cream, and the house-specialty mermaid soup — a lobster coconut broth with shrimp, curry, and secret spices. Save room for the from-scratch Hallelujah Chocolate Cake, the family recipe everyone raves about. Reservations highly recommended.",
    address: "5009 Hwy 361, Port Aransas, TX 78373",
    phone: "(361) 749-4222",
    website: "https://lisabellas.com",
    hours: "Tue-Sat 5:30PM-9PM, Closed Sun-Mon",
    hoursOfOperation: {
      Monday: "Closed",
      Tuesday: "5:30 PM – 9:00 PM",
      Wednesday: "5:30 PM – 9:00 PM",
      Thursday: "5:30 PM – 9:00 PM",
      Friday: "5:30 PM – 9:00 PM",
      Saturday: "5:30 PM – 9:00 PM",
      Sunday: "Closed",
    },
    featured: false,
    tags: ["seafood", "upscale", "cocktails", "Cinnamon Shore", "date night"],
    priceRange: "$$$",
    menu: [
      {
        section: "Signature Dishes",
        items: [
          {
            name: "Del Mar Pasta",
            description:
              "Penne topped with diver sea scallops, wild Gulf shrimp & fresh Gulf fish in roasted poblano chardonnay lobster cream",
          },
          {
            name: "Mermaid Soup",
            description:
              "Lobster coconut broth with shrimp, curry & secret spices",
          },
          {
            name: "Baked Oysters Lisabella",
            description: "House specialty baked oysters",
          },
          {
            name: "Hallelujah Chocolate Cake",
            description: "Made-from-scratch family recipe chocolate cake",
          },
        ],
      },
    ],
  },
  {
    slug: "lelos-island-bar",
    name: "Lelo's Island Bar",
    category: "eat",
    tagline: "Signature tiki drinks, specialty burgers & island vibes — dog-friendly patio",
    description:
      "Lelo's Island Bar is a neighborhood staple for locals and visitors alike, serving signature tiki drinks and specialty burgers in a casual, laid-back setting. Indoor and outdoor seating with a dog-friendly patio. A perfect spot to grab a craft cocktail, a cold beer, and a burger after a day on the beach.",
    address: "212 Beach St, Port Aransas, TX 78373",
    phone: "(361) 416-1792",
    website: "https://www.lelosbar.com",
    hours: "Mon-Wed 11AM-10PM, Thu-Sat 11AM-11PM, Sun 11AM-10PM",
    hoursOfOperation: {
      Monday: "11:00 AM – 10:00 PM",
      Tuesday: "11:00 AM – 10:00 PM",
      Wednesday: "11:00 AM – 10:00 PM",
      Thursday: "11:00 AM – 11:00 PM",
      Friday: "11:00 AM – 11:00 PM",
      Saturday: "11:00 AM – 11:00 PM",
      Sunday: "11:00 AM – 10:00 PM",
    },
    featured: false,
    tags: ["bar", "burgers", "tiki drinks", "dog-friendly", "casual"],
    priceRange: "$$",
  },
  {
    slug: "bierhaus-port-aransas",
    name: "BierHaus Port Aransas",
    category: "eat",
    tagline: "Craft biers, bar swings, live music & a climate-controlled patio on Ave G",
    description:
      "BierHaus is one of Port A's staple bars, located on Avenue G in the former Shells Pasta building. With indoor and outdoor climate-controlled bars, daily drink specials, delicious food, and live music, it's the perfect hangout. Grab a seat on their signature bar swings, play bar games, or relax on the patio with a cold craft beer. Pet-friendly, wheelchair accessible, with WiFi and parking.",
    address: "522 E Ave G, Port Aransas, TX 78373",
    phone: "(361) 339-1041",
    hours: "Mon-Thu 11AM-12AM, Fri-Sat 11AM-1AM, Sun 11AM-12AM",
    hoursOfOperation: {
      Monday: "11:00 AM – 12:00 AM",
      Tuesday: "11:00 AM – 12:00 AM",
      Wednesday: "11:00 AM – 12:00 AM",
      Thursday: "11:00 AM – 12:00 AM",
      Friday: "11:00 AM – 1:00 AM",
      Saturday: "11:00 AM – 1:00 AM",
      Sunday: "11:00 AM – 12:00 AM",
    },
    featured: false,
    tags: ["bar", "craft beer", "live music", "pet-friendly", "bar swings"],
    priceRange: "$$",
  },

  // STAY
  {
    slug: "port-royal-ocean-resort",
    name: "Port Royal Ocean Resort & Conference Center",
    category: "stay",
    tagline: "25-acre beachfront resort with the largest lagoon pool in Texas",
    description:
      "Port Royal is the premier resort on the island — a 25-acre beachfront property with 210 condo suites ranging from one to three bedrooms. All suites feature full kitchens, in-room laundry, and large patios or balconies with Gulf or pool views. The resort boasts the largest lagoon pool in Texas, four outdoor pools, three hot tubs, a waterslide, swim-up bar, and poolside cabanas. Just a 100-yard boardwalk through the dunes to miles of beach. Currently undergoing renovations with a full reopening expected for Summer 2026.",
    address: "6317 State Hwy 361, Port Aransas, TX 78373",
    phone: "(361) 749-5011",
    website: "https://port-royal.com",
    hours: "24/7 front desk",
    featured: true,
    tags: ["beachfront", "resort", "family-friendly", "pools", "restaurant"],
    priceRange: "$$$$",
    amenities: [
      "4 outdoor swimming pools",
      "Largest lagoon pool in Texas",
      "3 hot tubs",
      "Waterslide",
      "Swim-up bar",
      "Poolside cabanas",
      "Olympic-length lap pool",
      "Water volleyball pool",
      "100-yard boardwalk to beach",
      "361 Mobile Kitchen Restaurant",
      "Cabana Bar (swim-up)",
      "Full kitchens in all suites",
      "In-room laundry",
      "Free WiFi",
      "Free parking",
      "Fitness center",
      "Conference center",
    ],
  },
  {
    slug: "cinnamon-shore",
    name: "Cinnamon Shore",
    category: "stay",
    tagline: "Luxury beachfront vacation rentals — homes, condos & cottages on the Gulf",
    description:
      "Cinnamon Shore is Port Aransas's premier beachfront vacation rental community, offering luxury homes, condos, cottages, and townhomes right on the Gulf. A family-owned company serving the island since its founding, Cinnamon Shore features golf cart boardwalks to the beach, community pools, parks, lakes, and on-site dining. Book direct for the best rates and skip the booking fees from the big travel sites. From cozy cottages to spacious multi-bedroom beachfront homes, there's something for every group size and budget.",
    address: "5009 Highway 361, Port Aransas, TX 78373",
    phone: "(361) 749-0422",
    website: "https://www.cinnamonshore.com",
    hours: "Daily 7AM-7PM",
    hoursOfOperation: {
      Monday: "7:00 AM – 7:00 PM",
      Tuesday: "7:00 AM – 7:00 PM",
      Wednesday: "7:00 AM – 7:00 PM",
      Thursday: "7:00 AM – 7:00 PM",
      Friday: "7:00 AM – 7:00 PM",
      Saturday: "7:00 AM – 7:00 PM",
      Sunday: "7:00 AM – 7:00 PM",
    },
    featured: false,
    tags: ["vacation rentals", "beachfront", "luxury", "family", "condos"],
    priceRange: "$$$–$$$$",
    amenities: [
      "Beachfront homes & condos",
      "Golf cart boardwalk to beach",
      "Community pools",
      "On-site dining",
      "Parks & lakes",
      "Free WiFi",
      "Free parking",
      "Washer/dryer in units",
      "Pet-friendly options available",
    ],
  },

  {
    slug: "tarpon-inn",
    name: "The Tarpon Inn",
    category: "stay",
    tagline: "Historic 1886 hotel on the National Register — 7,000 signed tarpon scales in the lobby",
    description:
      "Originally built in 1886 from surplus Civil War barracks material, The Tarpon Inn is one of the most historic hotels on the Texas coast and a National Register landmark celebrating 140 years. Each of the unique rooms is decorated in period antiques — no two are alike, and there are no televisions or telephones by design. The 200-foot-long porches with rocking chairs and old-fashioned ceiling fans invite you to slow down to island time. The main lobby is adorned with over 7,000 tarpon scales, each signed by the angler who landed the fish — including one signed by President Franklin D. Roosevelt in 1937. Home to Roosevelt's restaurant and the 1886 Bar.",
    address: "220 E Cotter Ave, Port Aransas, TX 78373",
    phone: "(361) 749-1540",
    website: "https://www.thetarponinn.com",
    hours: "24/7 front desk",
    featured: true,
    tags: ["historic", "boutique hotel", "National Register", "Roosevelt's", "1886 Bar"],
    priceRange: "$$$",
    amenities: [
      "National Register of Historic Places (since 1979)",
      "200-foot porches with rocking chairs",
      "Period antique furnishings",
      "Old-fashioned ceiling fans",
      "Private baths",
      "Lobby with 7,000+ signed tarpon scales",
      "Roosevelt's restaurant on-site",
      "1886 Bar & cocktail lounge",
      "Courtyard event space",
      "No TVs or phones — by design",
    ],
  },
  {
    slug: "amelias-landing",
    name: "Amelia's Landing Hotel",
    category: "stay",
    tagline: "Aviation-themed boutique hotel — breakfast delivered to your door every morning",
    description:
      "Amelia's Landing is an aviation-themed boutique hotel in the heart of Port Aransas with 23 unique rooms, each representing a different era of aviation history. They claim to be the only hotel in America that delivers breakfast to every guest's room each morning — a signature service since 2002. Amenities include a year-round outdoor pool, sun terrace, picnic area, BBQ facilities, and electric vehicle charging. A 15-minute walk to the beach with free parking and concierge service.",
    address: "105 N Alister St, Port Aransas, TX 78373",
    phone: "(361) 416-1777",
    website: "https://www.ameliaslanding.com",
    hours: "24/7 front desk",
    featured: false,
    tags: ["boutique hotel", "aviation-themed", "breakfast included", "pool", "downtown"],
    priceRange: "$$",
    amenities: [
      "Breakfast delivered to room daily",
      "23 uniquely themed rooms",
      "Year-round outdoor pool",
      "Sun terrace & picnic area",
      "BBQ facilities",
      "Free WiFi",
      "Free parking",
      "EV charging station",
      "Concierge service",
      "Refrigerator & microwave in rooms",
    ],
  },

  // DO
  {
    slug: "neptunes-charters",
    name: "Neptune's Charters",
    category: "do",
    tagline: "Dolphin watch tours, sunset cruises & shrimp trawls since 1985",
    description:
      "Port Aransas is home to a resident pod of bottlenose dolphins, and Neptune's Charters has been taking visitors to see them since 1985. Board The Mustang — a spacious 65-foot vessel holding up to 85 passengers — for a 1.5-hour dolphin watch nature tour through the ship channel and bay. Every trip includes a live shrimp trawl with a touch tank full of crabs, fish, and shrimp. BYOB-friendly. They also run sunset cruises and special events like the 4th of July fireworks cruise.",
    address: "136 W Cotter Ave, Port Aransas, TX 78373",
    phone: "(361) 749-6969",
    website: "https://neptunescharters.com",
    hours: "Daily 10AM-7PM",
    hoursOfOperation: {
      Monday: "10:00 AM – 7:00 PM",
      Tuesday: "10:00 AM – 7:00 PM",
      Wednesday: "10:00 AM – 7:00 PM",
      Thursday: "10:00 AM – 7:00 PM",
      Friday: "10:00 AM – 7:00 PM",
      Saturday: "10:00 AM – 7:00 PM",
      Sunday: "10:00 AM – 7:00 PM",
    },
    featured: true,
    tags: ["dolphins", "boat tour", "family-friendly", "wildlife", "sunset cruise"],
    schedule: [
      {
        name: "Dolphin Watch Nature Tour & Shrimp Trawl",
        times: ["2:00 PM"],
        price: "$38/adult, half-price for children 12 & under",
        description:
          "1.5-hour cruise aboard The Mustang — see dolphins, birds, and marine life with a live shrimp trawl and touch tank",
      },
      {
        name: "Sunset Dolphin Watch & Shrimp Trawl",
        times: ["5:00 PM (varies seasonally)"],
        price: "$38/adult, half-price for children 12 & under",
        description:
          "Evening cruise with dolphins and a Gulf sunset — includes shrimp trawl",
      },
    ],
  },
  {
    slug: "jetty-boat",
    name: "The Jetty Boat at Fisherman's Wharf",
    category: "do",
    tagline: "Your ride to the North Jetty & untouched beaches of San Jose Island",
    description:
      "The Jetty Boat is the only way to access the North Jetty and the deserted beaches of San Jose Island from Port Aransas. Running daily from Fisherman's Wharf, the boat ferries anglers, beachcombers, birders, and families to a private dock at the base of the jetty. San Jose Island is completely undeveloped — pack everything you need including water, food, and a trash bag. Pet-friendly. No reservations needed, just show up and buy a ticket at the marina building.",
    address: "900 Tarpon St, Port Aransas, TX 78373",
    phone: "(361) 749-5448",
    website: "https://www.fishermanswharfporta.com/boats/jetty-boat/",
    hours: "Daily 6AM-7PM",
    hoursOfOperation: {
      Monday: "6:00 AM – 7:00 PM",
      Tuesday: "6:00 AM – 7:00 PM",
      Wednesday: "6:00 AM – 7:00 PM",
      Thursday: "6:00 AM – 7:00 PM",
      Friday: "6:00 AM – 7:00 PM",
      Saturday: "6:00 AM – 7:00 PM",
      Sunday: "6:00 AM – 7:00 PM",
    },
    featured: true,
    tags: ["fishing", "jetty", "san jose island", "beachcombing", "birding"],
    schedule: [
      {
        name: "Summer Departures (Port Aransas → San Jose Island)",
        times: [
          "6:30 AM",
          "7:00 AM",
          "8:00 AM",
          "9:00 AM",
          "10:00 AM",
          "11:00 AM",
          "12:00 PM",
          "2:00 PM",
          "4:00 PM",
        ],
        price: "$15/adult, $8/child, $10/person for groups of 10+",
        description:
          "Round-trip boat ride to the North Jetty on San Jose Island. 10-trip discount card available for $120.",
      },
      {
        name: "Summer Returns (San Jose Island → Port Aransas)",
        times: [
          "10:10 AM",
          "12:10 PM",
          "2:10 PM",
          "4:10 PM",
          "6:00 PM",
        ],
        description: "Guaranteed return trips from the island",
      },
    ],
  },
  {
    slug: "port-a-beach-buggies",
    name: "Port A Beach Buggies",
    category: "do",
    tagline: "Rent a golf cart and cruise the island like a local",
    description:
      "The best way to get around Port Aransas is on a golf cart, and Port A Beach Buggies has a fleet of custom carts in all sizes — 4-passenger, 6-passenger, and 8-passenger rigs. Every cart comes with underseat beverage coolers, Bluetooth speakers, full-length tops, extra-long seat belts, and comfy padded seats. They deliver to your rental, hotel, or campsite. Stop by in person to check out the gift shop featuring beach décor and gifts just footsteps from the beach.",
    address: "Port Aransas, TX 78373",
    phone: "(361) 749-2066",
    website: "https://portabeachbuggies.com",
    hours: "Daily 8AM-6PM",
    featured: false,
    tags: ["golf cart", "rentals", "transportation", "island cruising"],
    rentals: [
      {
        name: "3-Hour Rental",
        duration: "3 hours",
        price: "$58 (cash price)",
      },
      {
        name: "4-Hour Rental",
        duration: "4 hours",
        price: "$75 (cash price)",
      },
      {
        name: "6-Hour Rental",
        duration: "6 hours",
        price: "$85 (cash price)",
      },
      {
        name: "24-Hour Overnight Rental",
        duration: "24 hours",
        price: "$119 (cash price)",
      },
      {
        name: "Shibumi Shade Shelter — 1 Day",
        duration: "1 day",
        price: "$25",
      },
      {
        name: "Shibumi Shade Shelter — 2 Days",
        duration: "2 days",
        price: "$45",
      },
      {
        name: "Shibumi Shade Shelter — 3+ Days",
        duration: "3+ days",
        price: "$55",
      },
    ],
  },

  {
    slug: "scarlet-lady-dolphin-cruises",
    name: "Scarlet Lady Dolphin Cruises",
    category: "do",
    tagline: "Catamaran dolphin tours, oyster farm trips & sunset cruises with a full bar",
    description:
      "The Scarlet Lady is a 50-foot catamaran-style vessel built in 2015, holding up to 48 passengers with plenty of room and shade. Cruise the Lydia Ann Channel in search of wild dolphins, sea birds, and the iconic Lydia Ann Lighthouse. The only dolphin tour in Port Aransas with a full bar on board. Beyond the daily dolphin adventure, they offer specialty cruises: Wine on the Water (third Thursday monthly), the Sip & Shuck Oyster Farm Tour (first Sunday monthly) to Texas Clear Water Oyster Gardens, industrial waterways tours, and holiday cruises. Departs from Captain Kelly's Deep Sea Headquarters.",
    address: "440 W Cotter Ave, Port Aransas, TX 78373",
    phone: "(361) 749-5597",
    website: "https://scarletladydolphincruise.com",
    hours: "Daily — call for cruise times",
    featured: false,
    tags: ["dolphins", "catamaran", "sunset cruise", "oyster tour", "full bar"],
    schedule: [
      {
        name: "Dolphin Adventure Tour",
        times: ["Two departures daily — call for times"],
        description:
          "1.5-hour cruise along the Lydia Ann Channel with full narration on Port Aransas history",
      },
      {
        name: "Wine on the Water",
        times: ["Third Thursday of every month"],
        description: "Wine and cheese sunset cruise",
      },
      {
        name: "Sip & Shuck Oyster Farm Tour",
        times: ["First Sunday of every month + bonus dates"],
        description:
          "Prosecco welcome, behind-the-scenes oyster farm visit, freshly shucked local oysters & wine pairing",
      },
      {
        name: "Industrial Waterways Tour",
        times: ["Call for schedule"],
        description:
          "2-hour tour cruising the deep-water channels alongside commercial ships, tugboats & port operations",
      },
    ],
  },
  {
    slug: "deep-sea-headquarters",
    name: "Deep Sea Headquarters",
    category: "do",
    tagline: "Full-service marina with fishing charters from 3 to 60 hours & a pirate ship",
    description:
      "Deep Sea Headquarters is a full-service marina offering high-quality deep sea fishing in Port Aransas with trips from 3 to 60 hours. Their fleet includes the custom-built Gulf Eagle (the largest, most comfortable vessel with heated/AC cabin), the Kingfisher party boat (up to 40 passengers), and the Pelican private charter (70-foot vessel with AC cabin). They also operate the Red Dragon Pirate Ship with cannon fire, dolphin watching, sword fighting, and treasure hunting. All trips include bait, rod, and tackle. Voted top Fishing Guide & Charter in the Coastal Bend.",
    address: "440 W Cotter Ave, Port Aransas, TX 78373",
    phone: "(361) 749-5597",
    website: "https://deepseaheadquarters.com",
    hours: "Daily 6AM-9PM",
    hoursOfOperation: {
      Monday: "6:00 AM – 9:00 PM",
      Tuesday: "6:00 AM – 9:00 PM",
      Wednesday: "6:00 AM – 9:00 PM",
      Thursday: "6:00 AM – 9:00 PM",
      Friday: "6:00 AM – 9:00 PM",
      Saturday: "6:00 AM – 9:00 PM",
      Sunday: "6:00 AM – 9:00 PM",
    },
    featured: true,
    tags: ["fishing", "deep sea", "charters", "pirate ship", "marina"],
    priceRange: "$$–$$$$",
    charters: [
      {
        name: "Bay Fishing Trip",
        duration: "3-4 hours",
        price: "Call for rates",
        description: "Family-friendly bay fishing in calm waters",
      },
      {
        name: "Half-Day Offshore",
        duration: "8 hours",
        price: "Call for rates",
        description: "Deep sea fishing targeting snapper, kingfish & more",
      },
      {
        name: "Full-Day Offshore",
        duration: "12 hours",
        price: "Call for rates",
        description: "Extended offshore trip for serious anglers",
      },
      {
        name: "56-Hour Tuna Safari",
        duration: "56 hours (2 nights)",
        price: "Call for rates",
        description:
          "Two nights offshore aboard the Wharf Cat or Scat Cat — targeting yellowfin tuna, dorado, wahoo & marlin",
      },
      {
        name: "Red Dragon Pirate Ship",
        duration: "1.5 hours",
        price: "Call for rates",
        description:
          "Family fun with cannon fire, dolphin watching, sword fighting & treasure hunting",
      },
    ],
  },
  {
    slug: "palmilla-beach-golf",
    name: "Palmilla Beach Golf Club",
    category: "do",
    tagline: "The only True-Links golf course in Texas — open to the public, no dress code",
    description:
      "Originally planned by Arnold Palmer, Palmilla Beach Golf Club features the only True-Links style course in Texas. The 9-hole course (par 32) plus 'The Loop' (par 9) offer a unique coastal golfing experience. Open to the public with no membership required and no dress code. Every booking includes a complimentary golf cart and 1 hour of driving range access before your tee time.",
    address: "258 Snapdragon, Port Aransas, TX 78373",
    phone: "(361) 749-4653",
    website: "https://www.palmillabeach.com/palmilla-beach-golf/",
    hours: "Mon-Sat 8AM-6PM",
    hoursOfOperation: {
      Monday: "8:00 AM – 6:00 PM",
      Tuesday: "8:00 AM – 6:00 PM",
      Wednesday: "8:00 AM – 6:00 PM",
      Thursday: "8:00 AM – 6:00 PM",
      Friday: "8:00 AM – 6:00 PM",
      Saturday: "8:00 AM – 6:00 PM",
      Sunday: "Closed",
    },
    featured: false,
    tags: ["golf", "links course", "Arnold Palmer", "public", "no dress code"],
    amenities: [
      "9-hole True-Links course (par 32)",
      "The Loop (par 9)",
      "Complimentary golf cart with booking",
      "Driving range — 1 hour free before tee time",
      "No membership required",
      "No dress code",
      "Open to the public",
    ],
  },
  {
    slug: "island-outfitters",
    name: "Island Outfitters",
    category: "do",
    tagline: "Premier golf cart rentals & beach gear — book online, delivered to your door",
    description:
      "Island Outfitters is Port Aransas's premier golf cart rental and beach gear provider. Skip the pickup line — book online and they'll deliver a six-passenger golf cart with unlimited fuel right to your accommodation. They also rent electric bikes, beach chairs, and Yeti coolers. All renters must be 21+ with a valid license, proof of insurance, and credit card. Golf carts cannot be driven on Highway 361.",
    address: "525 Cut Off Rd, Port Aransas, TX 78373",
    phone: "(361) 336-3866",
    website: "https://www.islandoutfitterstx.com",
    hours: "Daily 9AM-7PM",
    hoursOfOperation: {
      Monday: "9:00 AM – 7:00 PM",
      Tuesday: "9:00 AM – 7:00 PM",
      Wednesday: "9:00 AM – 7:00 PM",
      Thursday: "9:00 AM – 7:00 PM",
      Friday: "9:00 AM – 7:00 PM",
      Saturday: "9:00 AM – 7:00 PM",
      Sunday: "9:00 AM – 7:00 PM",
    },
    featured: false,
    tags: ["golf carts", "beach gear", "e-bikes", "rentals", "delivery"],
    rentals: [
      {
        name: "6-Passenger Golf Cart",
        duration: "Daily & multi-day",
        price: "Book online for rates",
        description: "2022 model with unlimited fuel, delivered to you",
      },
      {
        name: "Electric Bikes",
        duration: "Daily",
        price: "Book online for rates",
      },
      {
        name: "Beach Chairs & Yeti Coolers",
        duration: "Daily",
        price: "Book online for rates",
      },
    ],
  },

  // SHOP
  {
    slug: "island-surf-rentals",
    name: "Island Surf Rentals",
    category: "shop",
    tagline: "Golf carts, surfboards, kayaks & beach cruisers since 2009",
    description:
      "Since 2009, Island Surf Rentals has been South Texas' premier choice for golf carts and surf rentals. Their fleet of Yamaha golf carts — four and six passengers in custom color combos — each comes with a beach permit and city license plate. They also stock surfboards, stand-up paddleboards, boogie boards, skim boards, kayaks, and aluminum beach cruiser bikes. Pick up goodr sunglasses, Dirty Hooker fishing apparel, and Port Aransas custom-designed tees while you're there.",
    address: "130 E Ave G, Port Aransas, TX 78373",
    phone: "(361) 749-0822",
    website: "https://islandsurfrentals.com",
    hours: "Daily 9AM-5PM",
    hoursOfOperation: {
      Monday: "9:00 AM – 5:00 PM",
      Tuesday: "9:00 AM – 5:00 PM",
      Wednesday: "9:00 AM – 5:00 PM",
      Thursday: "9:00 AM – 5:00 PM",
      Friday: "9:00 AM – 5:00 PM",
      Saturday: "9:00 AM – 5:00 PM",
      Sunday: "9:00 AM – 5:00 PM",
    },
    featured: true,
    tags: ["surf", "golf carts", "rentals", "kayaks", "bikes", "beach gear"],
  },
  {
    slug: "fly-it-port-a",
    name: "Fly It! Port A",
    category: "shop",
    tagline: "The island's only kite shop — 30+ years of wind-powered fun on Ave G",
    description:
      "Fly It! Port A has been a fixture on Avenue G for over 30 years, offering kites of every shape, size, and complexity — from beginner-friendly designs to elaborate stunt kites. Beyond kites, discover wind spinners, flags, windsocks, wind chimes, beach canopies, disc golf supplies, yard art, and unique wind-related gifts. The Pyle family has owned the shop since 1991 and keeps it stocked with everything you need for a perfect beach day. Ranked #2 of all shopping in Port Aransas on TripAdvisor.",
    address: "405 W Ave G, Port Aransas, TX 78373",
    phone: "(361) 749-4190",
    website: "https://flyitporta.com",
    hours: "Daily 9AM-6PM",
    hoursOfOperation: {
      Monday: "9:00 AM – 6:00 PM",
      Tuesday: "9:00 AM – 6:00 PM",
      Wednesday: "9:00 AM – 6:00 PM",
      Thursday: "9:00 AM – 6:00 PM",
      Friday: "9:00 AM – 6:00 PM",
      Saturday: "9:00 AM – 6:00 PM",
      Sunday: "9:00 AM – 6:00 PM",
    },
    featured: false,
    tags: ["kites", "beach gear", "gifts", "wind toys", "family-friendly"],
  },

  {
    slug: "wintons-island-candy",
    name: "Winton's Island Candy",
    category: "shop",
    tagline: "Homemade fudge, caramels & saltwater taffy since 1995",
    description:
      "Since 1995, Winton's Island Candies has been the island's sweetest stop. This family-owned confectionary on Alister Street specializes in homemade caramels and fudge, with a variety of treats including saltwater taffy, candy corn, gummies, sours, licorice, and truffles. The aroma of freshly made fudge and pralines greets you at the door. A must-visit for anyone with a sweet tooth.",
    address: "601 S Alister St, Port Aransas, TX 78373",
    phone: "(361) 749-4772",
    website: "https://wintonscandies.com",
    hours: "Daily 9AM-9PM",
    hoursOfOperation: {
      Monday: "9:00 AM – 9:00 PM",
      Tuesday: "9:00 AM – 9:00 PM",
      Wednesday: "9:00 AM – 9:00 PM",
      Thursday: "9:00 AM – 9:00 PM",
      Friday: "9:00 AM – 9:00 PM",
      Saturday: "9:00 AM – 9:00 PM",
      Sunday: "9:00 AM – 9:00 PM",
    },
    featured: false,
    tags: ["candy", "fudge", "saltwater taffy", "gifts", "sweets"],
    priceRange: "$",
  },
  {
    slug: "destination-beach-surf",
    name: "Destination Beach & Surf",
    category: "shop",
    tagline: "Beach essentials, apparel & unique coastal gifts on Alister Street since 2000",
    description:
      "Located in the heart of downtown Port Aransas on Alister Street, Destination Beach & Surf is a treasure trove of apparel, beach essentials, and unique gifts designed to capture the spirit of coastal living. Open since 2000, this souvenir shop has everything from swimwear and sunscreen to Port Aransas-themed gifts and keepsakes.",
    address: "516 S Alister St, Port Aransas, TX 78373",
    phone: "(361) 749-2444",
    hours: "Daily 9AM-8PM",
    featured: false,
    tags: ["beach gear", "apparel", "gifts", "souvenirs", "coastal"],
    priceRange: "$–$$",
  },

  // SERVICES
  {
    slug: "the-cart-store",
    name: "The Cart Store",
    category: "services",
    tagline: "Factory-authorized Yamaha & ICON golf cart dealer — sales, service & rentals",
    description:
      "The Cart Store is the only Factory Authorized Yamaha, ICON, and EPIC dealership and service department serving Port Aransas and the Gulf Coast. Brand new 2026 lithium carts arriving daily. Whether you need a new cart for your beach property, a custom build, or a short-term rental, they've got you covered. Full service department handles maintenance, repairs, battery replacement, and customization. Financing available on new and used carts.",
    address: "219 N Alister St, Port Aransas, TX 78373",
    phone: "(361) 749-5560",
    website: "https://www.thecartstores.com",
    hours: "Wed-Sat 8AM-5PM",
    hoursOfOperation: {
      Monday: "Closed",
      Tuesday: "Closed",
      Wednesday: "8:00 AM – 5:00 PM",
      Thursday: "8:00 AM – 5:00 PM",
      Friday: "8:00 AM – 5:00 PM",
      Saturday: "8:00 AM – 5:00 PM",
      Sunday: "Closed",
    },
    featured: false,
    tags: ["golf carts", "Yamaha", "ICON", "sales", "service", "rentals"],
  },
  {
    slug: "port-plumbing-co",
    name: "Port Plumbing Co., Inc.",
    category: "services",
    tagline: "Family-owned island plumbing since 1950 — over 70 years on Mustang Island",
    description:
      "Port Plumbing is a family-owned and operated business that has been serving Port Aransas and Mustang Island since 1950. With over 70 years of experience, they handle everything from dripping sinks to large commercial projects — repairs, remodels, new installations, and gas lines. Licensed, bonded, and veteran-owned. Led by Mr. E. A. 'Scooter' Sain and Justin Sain, they understand salt-air corrosion and coastal building codes better than anyone on the island.",
    address: "202 W Oakes Ave, Unit B, Port Aransas, TX 78373",
    phone: "(361) 749-5252",
    website: "https://portplumbing.net",
    hours: "Mon-Fri 7AM-4PM",
    hoursOfOperation: {
      Monday: "7:00 AM – 4:00 PM",
      Tuesday: "7:00 AM – 4:00 PM",
      Wednesday: "7:00 AM – 4:00 PM",
      Thursday: "7:00 AM – 4:00 PM",
      Friday: "7:00 AM – 4:00 PM",
      Saturday: "Closed",
      Sunday: "Closed",
    },
    featured: false,
    tags: ["plumbing", "repairs", "remodels", "gas lines", "residential", "commercial"],
  },
  {
    slug: "joy-cart-rentals",
    name: "JOY Cart Rentals",
    category: "services",
    tagline: "Cruise Port A in comfort — free delivery, pickup & 24-hour maintenance",
    description:
      "JOY Cart Rentals offers four and six-seater golf carts equipped with extended roofs and windshields for comfortable island cruising. With free delivery and pickup, guaranteed 24-hour maintenance, and some of the most competitive rates in town, JOY makes it easy to explore Port Aransas's beaches, restaurants, and shops by cart. Formerly Silver Sands Golf Carts, JOY has deep roots on the island and partners with local vacation rental properties to provide seamless cart service for guests.",
    address: "307 Sea Isle Dr, Port Aransas, TX 78373",
    phone: "(361) 749-2278",
    website: "https://www.joycartrentals.com",
    hours: "Daily — call for current hours",
    featured: true,
    tags: ["golf carts", "rentals", "delivery", "island transportation"],
    verifiedPartner: true,
    rentals: [
      {
        name: "4-Seater Golf Cart",
        duration: "Daily & multi-day rates available",
        price: "Call for current rates",
        description: "Extended roof, windshield, comfortable seating",
      },
      {
        name: "6-Seater Golf Cart",
        duration: "Daily & multi-day rates available",
        price: "Call for current rates",
        description: "Extended roof, windshield, seats the whole family",
      },
    ],
    amenities: [
      "Free delivery & pickup",
      "24-hour maintenance guarantee",
      "Extended roofs & windshields",
      "4-seater and 6-seater options",
    ],
  },
];

export function getBusinessBySlug(slug: string): Business | undefined {
  return businesses.find((b) => b.slug === slug);
}

export function getBusinessesByCategory(category: string): Business[] {
  return businesses.filter((b) => b.category === category);
}

export function getFeaturedBusinesses(): Business[] {
  return businesses.filter((b) => b.featured);
}

export function getAllBusinessSlugs(): { category: string; slug: string }[] {
  return businesses.map((b) => ({ category: b.category, slug: b.slug }));
}
