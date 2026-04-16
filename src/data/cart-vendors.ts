/**
 * Cart vendor directory — the blast list.
 * When a customer books a cart through PAL, all vendors with an email address
 * receive the lead simultaneously. First to reply/claim wins.
 *
 * Selected by Winston 2026-04-15 from a master list of 26 PA cart companies.
 * Vendors without email addresses are listed but inactive — add their email
 * to activate them in the blast.
 *
 * By claiming a lead, vendors agree to:
 * - Have a clean, well-maintained cart ready for customer pickup on the start date
 * - Provide the customer a minimum $20 discount off their standard rental rate
 * - Adhere to their standard rental practices (rental agreements, ID verification,
 *   deposit handling, customer service, emergency maintenance for the rental duration)
 */

export interface CartVendor {
  slug: string;
  name: string;
  phone: string;
  email: string; // empty = not yet collected, excluded from blast
  address: string;
  cartSizes: string[]; // "4", "6", "8"
  active: boolean; // false = excluded from blast even if email exists
}

export const cartVendors: CartVendor[] = [
  {
    slug: "coastal-eds",
    name: "Coastal Ed's Coastal Carts",
    phone: "(361) 749-7001",
    email: "", // NEED
    address: "600 Cut Off Rd, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "port-a-beach-buggies",
    name: "Port A Beach Buggies",
    phone: "(361) 749-2066",
    email: "", // NEED
    address: "307 W Ave G, Port Aransas, TX",
    cartSizes: ["2", "4", "6", "8"],
    active: true,
  },
  {
    slug: "jackfish",
    name: "Jackfish Cart Rentals",
    phone: "(361) 459-2900",
    email: "insideout361@gmail.com",
    address: "3411 S 11th St, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "texas-red",
    name: "Texas Red Golf Carts",
    phone: "(361) 749-5400",
    email: "", // NEED
    address: "311 Sea Isle Dr, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
  },
  {
    slug: "first-stop",
    name: "First Stop Cart Rentals & Repair",
    phone: "(210) 338-9918",
    email: "", // NEED
    address: "718 S Station St, Port Aransas, TX",
    cartSizes: ["4"],
    active: true,
  },
  {
    slug: "tarpon-carts",
    name: "Tarpon Carts & Rentals",
    phone: "(361) 749-2569",
    email: "", // NEED
    address: "614 N Alister St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "brons-beach-carts",
    name: "Bron's Beach Carts & Backyard",
    phone: "(361) 290-7143",
    email: "", // NEED
    address: "314 E Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "paradise-cart",
    name: "Paradise Cart Rental",
    phone: "(361) 749-3003",
    email: "paradisecartrental@gmail.com",
    address: "428 S Alister St, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "kacies-beach-carts",
    name: "Kacie's Beach Carts",
    phone: "(361) 777-6622",
    email: "", // NEED
    address: "445 W Cotter Ave Ste D, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "island-outfitters",
    name: "Island Outfitters",
    phone: "(361) 336-3866",
    email: "", // NEED
    address: "525 Cut Off Rd, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
  },
  {
    slug: "joy-cart-rentals",
    name: "Joy Cart Rentals",
    phone: "(361) 749-2278",
    email: "info@joycartrentals.com",
    address: "307 Sea Isle Dr, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "gulf-carts",
    name: "Gulf Carts",
    phone: "(361) 677-3099",
    email: "", // NEED
    address: "606 Cut Off Rd Ste B, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "island-surf-rentals",
    name: "Island Surf Rentals",
    phone: "(361) 749-0822",
    email: "islandsurfrentals@yahoo.com",
    address: "130 E Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "ocean-carts",
    name: "Ocean Carts",
    phone: "(361) 339-1036",
    email: "info@oceancarts.com",
    address: "3417 S 11th St, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
  },
  {
    slug: "marlins-beach-carts",
    name: "Marlins Beach Carts",
    phone: "(361) 300-2355",
    email: "marlinsbeachcarts@gmail.com",
    address: "521 W Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "ash-cart-rental",
    name: "Ash Cart Rental",
    phone: "(361) 244-1020",
    email: "", // NEED
    address: "2700 S 11th St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "port-a-carts",
    name: "Port A Carts",
    phone: "(361) 300-4045",
    email: "", // NEED
    address: "210 N Alister St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "sage-beach-carts",
    name: "Sage Beach Carts / Top Deck",
    phone: "(361) 217-0703",
    email: "", // NEED
    address: "5009 TX-361, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "island-carts",
    name: "Island Carts",
    phone: "(361) 777-5661",
    email: "islandcarts2@gmail.com",
    address: "422 W Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
  },
  {
    slug: "pa-golf-cart-rental",
    name: "Port Aransas Golf Cart Rental",
    phone: "(361) 749-0070",
    email: "", // NEED
    address: "2131 State Hwy 361, Port Aransas, TX",
    cartSizes: [],
    active: true,
  },
];

/** Vendors with email addresses — ready for the blast. */
export function getBlastableVendors() {
  return cartVendors.filter((v) => v.active && v.email.trim().length > 0);
}

/** All vendors (for admin reference). */
export function getAllVendors() {
  return cartVendors;
}

/** Count of vendors that will receive each blast. */
export function getBlastCount() {
  return getBlastableVendors().length;
}
