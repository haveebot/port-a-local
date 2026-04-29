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
  /**
   * Set to false when Twilio returns error 30006 ("landline / unreachable
   * carrier") for the phone — landlines can't receive SMS at the carrier
   * level. The bulk-invite + lead-blast SMS paths skip vendors with
   * smsCapable === false. Undefined treated as "try SMS." A future
   * `phoneMobile` alt field could carry an owner cell when scraped.
   */
  smsCapable?: boolean;
  /** Optional alternate mobile number — used by SMS paths when present. */
  phoneMobile?: string;
}

export const cartVendors: CartVendor[] = [
  {
    slug: "coastal-eds",
    name: "Coastal Ed's Coastal Carts",
    phone: "(361) 749-7001",
    email: "contact@coastaleds.com", // HIGH (own site Contact page); BOUNCED 2026-04-28 "inbox full" — soft bounce, retry auto, fall back to phone 361-749-7001 if persists. Footer typo `contact@coastleds.com` may be siphoning their legit traffic.
    address: "600 Cut Off Rd, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    smsCapable: false, // 30006 landline confirmed 2026-04-29 bulk invite
  },
  {
    slug: "port-a-beach-buggies",
    name: "Port A Beach Buggies",
    phone: "(361) 749-2066",
    email: "insideout361@gmail.com", // HIGH (formerly "Inside Out" — Scott Tanzer, same owner / same inbox as Jackfish below)
    address: "307 W Ave G, Port Aransas, TX",
    cartSizes: ["2", "4", "6", "8"],
    active: true,
    smsCapable: false, // 30006 landline confirmed 2026-04-29 bulk invite
  },
  {
    slug: "jackfish",
    name: "Jackfish Cart Rentals",
    phone: "(361) 459-2900",
    phoneMobile: "(361) 339-1089", // Mac Owens — alt phone published as primary on portaransasgolfcarts.com (Twilio Lookup: fixedVoip / Charter Fiberlink — may accept SMS, will retry-and-confirm)
    email: "insideout361@gmail.com",
    address: "3411 S 11th St, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    smsCapable: true, // 459-2900 was landline; phoneMobile 339-1089 is fixedVoip — optimistic, will downgrade if 30006 returns
  },
  {
    slug: "texas-red",
    name: "Texas Red Golf Carts",
    phone: "(361) 749-5400",
    email: "", // NEED — MEDIUM-confidence guess: red@texasredgolfcarts.com (verify before adding)
    address: "311 Sea Isle Dr, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
  },
  {
    slug: "first-stop",
    name: "First Stop Cart Rentals & Repair",
    phone: "(210) 338-9918",
    email: "", // NEED — site 1ststopcarts.com unreachable; phone-only outreach
    address: "718 S Station St, Port Aransas, TX",
    cartSizes: ["4"],
    active: true,
  },
  {
    slug: "tarpon-carts",
    name: "Tarpon Carts & Rentals",
    phone: "(361) 749-2569",
    phoneMobile: "(361) 988-8161", // Sandcastle satellite contact — Twilio Lookup confirms MOBILE (Worldcall). Lee R. Hoskins Jr. is managing partner.
    email: "TarponCartsandRentals@gmail.com", // HIGH (own site Reservations section)
    address: "614 N Alister St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    smsCapable: true, // main 749-2569 is landline; phoneMobile 988-8161 is mobile (Worldcall)
  },
  {
    slug: "brons-beach-carts",
    name: "Bron's Beach Carts & Backyard",
    phone: "(361) 290-7143",
    email: "", // NEED — MEDIUM-confidence guess: sales@bronsbeachcarts.com (verify before adding)
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
    email: "", // NEED — site has contact form only; IG @kaciesbeachcarts as fallback
    address: "445 W Cotter Ave Ste D, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "island-outfitters",
    name: "Island Outfitters",
    phone: "(361) 336-3866",
    email: "info@islandoutfittersTX.com", // HIGH (own site homepage)
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
    email: "gulfcartsllc@gmail.com", // HIGH (own site Reservations page)
    address: "606 Cut Off Rd Ste B, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "island-surf-rentals",
    name: "Island Surf Rentals",
    phone: "(361) 749-0822",
    phoneMobile: "(210) 315-5718", // Dale Christianson's Tradewinds Vacation Rentals contact — Twilio Lookup confirms MOBILE (AT&T Wireless). 210 = San Antonio area code.
    email: "islandsurfrentals@yahoo.com",
    address: "130 E Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    smsCapable: true, // main 749-0822 is landline; phoneMobile 210-315-5718 is mobile (AT&T)
  },
  {
    slug: "ocean-carts",
    name: "Ocean Carts",
    phone: "(361) 339-1036",
    phoneMobile: "(361) 217-8490", // BBB profile alt — Twilio Lookup confirms MOBILE (AT&T Wireless). General partner Damian Allan; business mid-ownership-change per BBB.
    email: "info@oceancarts.com",
    address: "3417 S 11th St, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
    smsCapable: true, // main 339-1036 is landline; phoneMobile 361-217-8490 is mobile (AT&T)
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
    email: "", // NEED — MEDIUM-confidence guess: ashcartrental@gmail.com (verify before adding)
    address: "2700 S 11th St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "port-a-carts",
    name: "Port A Carts",
    phone: "(361) 300-4045",
    email: "", // NEED — MEDIUM-confidence guess: Portacarts@gmail.com (verify before adding)
    address: "210 N Alister St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
  },
  {
    slug: "sage-beach-carts",
    name: "Sage Beach Carts",
    phone: "(361) 217-0703",
    email: "customerservice@sagebeachcarts.com", // HIGH — Wagner-owned; Top Deck (a separate Tanzer/Inside-Out brand reaching insideout361@gmail.com via Port A Beach Buggies above) was previously listed here in error
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
    email: "", // NEED — no website / FB / IG surfaced; phone-only outreach
    address: "2131 State Hwy 361, Port Aransas, TX",
    cartSizes: [],
    active: true,
    smsCapable: false, // 30006 landline confirmed 2026-04-29 bulk invite
  },
];

/**
 * Effective phone for SMS — prefers phoneMobile if set, falls back to phone.
 * Used by SMS opt-in invite + lead-blast paths so a vendor with both a
 * landline (phone) and a mobile (phoneMobile) gets the mobile.
 */
export function smsPhoneFor(v: CartVendor): string {
  if (v.phoneMobile && v.phoneMobile.trim().length > 0) return v.phoneMobile;
  return v.phone;
}

/**
 * Vendors that can actually receive SMS — active, with a phone, and not
 * marked smsCapable: false (Twilio landline error 30006 confirmed). The
 * bulk-invite + lead-blast SMS paths use this list.
 */
export function getSmsCapableVendors(): CartVendor[] {
  return cartVendors.filter(
    (v) =>
      v.active &&
      smsPhoneFor(v).trim().length > 0 &&
      v.smsCapable !== false,
  );
}

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
