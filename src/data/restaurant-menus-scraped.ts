/**
 * Scraped restaurant menus — pulled from public sources (restaurant
 * websites, Yelp, SinglePlatform, Tripadvisor) on 2026-05-02.
 *
 * Layered ON TOP of businesses.ts menus — the encyclopedia + detail
 * views prefer the scraped version when present (deeper, fresher).
 * Existing thin menus in businesses.ts remain the editorial-curated
 * "highlights" for /eat detail pages.
 *
 * Source notes per restaurant in the SOURCE_NOTES export — visible to
 * customers as a small footer ("Menu items + prices may have changed,
 * call to confirm") so we set expectations and reduce blowback.
 *
 * To add or update a restaurant menu: append to SCRAPED_MENUS keyed
 * on the businesses.ts slug. Slug must match exactly.
 */

import type { MenuSection } from "./businesses";

export interface ScrapedMenu {
  slug: string;
  menu: MenuSection[];
  /** Optional — surfaced as a small italic note on the detail page */
  note?: string;
  /** ISO date — when this snapshot was pulled */
  scrapedAt: string;
  /** Source URL — for editorial trace */
  source?: string;
}

export const SCRAPED: ScrapedMenu[] = [
  {
    slug: "venetian-hot-plate",
    scrapedAt: "2026-05-02",
    source: "Reconstructed from venetianhotplate.com gallery + dunesporta.com + OpenTable + Tripadvisor",
    note: "Restaurant publishes only image-based menus and prices fluctuate seasonally. Items shown are representative — confirm current offerings when booking.",
    menu: [
      {
        section: "Antipasti",
        items: [
          { name: "Garlic Bread", description: "Traditional garlic bread, with optional meat or seafood toppings" },
          { name: "Crostini di Granchio", description: "Grilled ciabatta topped with jumbo lump crab meat sauteed in brown butter with lemon and sage" },
          { name: "Misto Mare", description: "Sauteed shrimp, diver scallops, blue lip mussels, littleneck and chopped clams in garlic and white wine sauce with red pepper flakes" },
          { name: "Calamari alla Griglia", description: "Grilled calamari steak dressed in a tomato-rosemary vinaigrette" },
          { name: "Portobello con Salsiccia", description: "Grilled portobello mushrooms with fennel sausage and pomodoro" },
          { name: "Mussels", description: "Blue lip mussels in tomato cream sauce" },
        ],
      },
      {
        section: "Insalate",
        items: [
          { name: "Insalata Caprese", description: "Fresh mozzarella, tomato and basil" },
          { name: "Caesar Salad", description: "Classic Caesar" },
          { name: "Greek Salad", description: "Traditional Greek salad" },
          { name: "Domingo's Grilled Romaine", description: "Seasoned grilled romaine with balsamic reduction, olive oil, parmigiano and crispy prosciutto" },
        ],
      },
      {
        section: "Paste",
        items: [
          { name: "Lasagna della Mamma", description: "House lasagna" },
          { name: "Spaghetti Pescatore", description: "Spaghetti with seafood medley" },
          { name: "Linguine Golfo", description: "Linguine tossed with shrimp and diver scallops" },
          { name: "Linguine Pesto", description: "Linguine with fresh basil pesto, cherry tomatoes and grilled chicken breast" },
          { name: "Fettuccine Aurora", description: "Fettuccine with tenderloin tips in cream sauce with bacon" },
          { name: "Tortellini", description: "Cheese tortellini, house preparation" },
          { name: "Bolognese", description: "Penne or spaghetti with house-ground meat sauce" },
          { name: "Shrimp & Scallop Pasta", description: "Shrimp and scallops in pink sauce" },
        ],
      },
      {
        section: "Secondi",
        items: [
          { name: "Scaloppine ai Carciofi", description: "Veal scaloppine with artichokes" },
          { name: "Veal Piccata", description: "Veal in lemon-caper butter sauce" },
          { name: "Filetto di Manzo al Gorgonzola", description: "Beef tenderloin medallions with gorgonzola sauce" },
          { name: "Anatra", description: "Pan-seared duck with honey and Dijon mustard demi-glace" },
          { name: "Pollo Marsala", description: "Chicken with mushroom marsala butter sauce" },
          { name: "Gamberetti al Limone", description: "Six shrimp in garlic lemon butter sauce" },
          { name: "Rack of Lamb", description: "Lamb chops, chef's preparation" },
          { name: "Braciola di Maiale con Portobello", description: "Pork chop with portobello mushrooms" },
          { name: "Tortine di Granchio", description: "House crab cakes" },
          { name: "Vegetarian / Vegan", description: "Chef's choice, ask your server" },
        ],
      },
      {
        section: "Dolce",
        items: [
          { name: "Tiramisu" },
          { name: "Tahitian Vanilla Creme Brulee" },
          { name: "Flourless Chocolate Cake" },
          { name: "Tahitian Vanilla Bean Gelato" },
          { name: "Bread Pudding" },
        ],
      },
    ],
  },
  {
    slug: "tortugas-saltwater-grill",
    scrapedAt: "2026-05-02",
    source: "Reconstructed from dunesporta.com + Tripadvisor + Restaurantguru (live site 403'd)",
    note: "Live site blocked direct scrape; menu reconstructed from local food guides. Confirm current offerings + reserve via OpenTable.",
    menu: [
      {
        section: "Starters",
        items: [
          { name: "Crab Cakes", description: "Jumbo lump blue crab cakes" },
          { name: "Boudin Balls", description: "Cajun pork-and-rice sausage, breaded and fried" },
          { name: "Gulf Shrimp Cocktail", description: "Chilled Gulf shrimp with cocktail sauce" },
          { name: "Tuna Poke", description: "Sushi-grade tuna poke" },
          { name: "Poke Nachos", description: "Crispy wontons topped with poke" },
          { name: "Crab Dip", description: "Warm crab dip" },
          { name: "Lobster Bisque", description: "Classic creamy lobster bisque" },
          { name: "Truffle Fries", description: "Hand-cut fries tossed with truffle and parmesan" },
        ],
      },
      {
        section: "Salads & Bowls",
        items: [
          { name: "Wedge Salad", description: "Iceberg wedge with bacon, blue cheese and tomato" },
          { name: "House Salad", description: "Mixed greens with house dressing" },
          { name: "Blackened Shrimp Salad", description: "Greens topped with blackened Gulf shrimp" },
          { name: "Grilled Chicken Salad", description: "Greens with grilled airline chicken breast" },
          { name: "Poke Tuna Bowl", description: "Sushi-grade tuna over rice with island flavors" },
          { name: "Southwest Bowl", description: "Rice bowl with southwest-spiced protein" },
          { name: "The Islander", description: "Chopped spinach, cabbage, shredded carrot, red bell pepper with mango-pineapple salsa" },
        ],
      },
      {
        section: "Handhelds",
        items: [
          { name: "Shrimp Po'Boy", description: "Fried Gulf shrimp on a French roll" },
          { name: "Fish Po'Boy", description: "Fried catch of the day on a French roll" },
          { name: "Oyster Po'Boy", description: "Fried oysters on a French roll" },
          { name: "Shrimp & Oyster Combo Po'Boy", description: "Half shrimp, half oysters" },
          { name: "Cheeseburger", description: "House burger with cheese" },
          { name: "Speechless Burger", description: "Burger topped with peach marmalade, grilled onions, bacon and brie" },
          { name: "The Big Cheesy Burger", description: "Loaded multi-cheese burger" },
        ],
      },
      {
        section: "Seafood",
        items: [
          { name: "Shrimp & Grits", description: "Gulf shrimp sauteed with crispy bacon, poblano and sweet corn over cheddar grit cakes with a pan sauce" },
          { name: "Snapper Pontchartrain", description: "Snapper topped with creole sauce, crawfish, sausage; served with cheddar grit cake and asparagus" },
          { name: "Redfish Pontchartrain", description: "Redfish with Pontchartrain sauce" },
          { name: "Crab-Covered Redfish", description: "Redfish topped with jumbo lump crab" },
          { name: "Parmesan Crusted Flounder", description: "Pan-fried flounder with parmesan crust" },
          { name: "Stuffed Lemon Flounder", description: "Stuffed flounder served with asparagus" },
          { name: "Shrimp Scampi", description: "Shrimp in garlic-butter scampi sauce" },
          { name: "Shrimp & Scallops with Risotto", description: "Sauteed shrimp and scallops over creamy risotto" },
          { name: "Coconut Curry Shrimp", description: "Gulf shrimp in coconut-curry sauce" },
          { name: "Poached Halibut", description: "Halibut poached and finished with a light sauce" },
          { name: "Charbroiled Catch of the Day", description: "Daily Gulf catch, charbroiled" },
          { name: "Mussels", description: "Blue lip mussels in velvety garlic butter wine sauce" },
          { name: "Southern Fried Seafood Platter", description: "Fried fish, shrimp and oysters with sides" },
        ],
      },
      {
        section: "Land & Pastas",
        items: [
          { name: "8 oz Filet", description: "Center-cut beef tenderloin" },
          { name: "16 oz Ribeye", description: "Hand-cut bone-in ribeye" },
          { name: "Filet Oscar", description: "Filet topped with crab and bearnaise" },
          { name: "Ribeye & Shrimp", description: "Ribeye paired with grilled shrimp" },
          { name: "Surf & Turf", description: "Steak and seafood combination" },
          { name: "Airline Chicken Breast", description: "Pan-roasted airline chicken breast" },
          { name: "Pasta", description: "Chef's pasta of the evening" },
        ],
      },
      {
        section: "Brunch (weekends)",
        items: [
          { name: "French Toast", description: "Brioche French toast" },
          { name: "Biscuits & Gravy", description: "House biscuits with sausage gravy" },
          { name: "Breakfast BLT", description: "Bacon, lettuce, tomato with egg" },
          { name: "Steak & Hash", description: "Grilled steak with breakfast hash" },
        ],
      },
      {
        section: "Dessert",
        items: [
          { name: "Creme Brulee Cheesecake", description: "Cheesecake topped with caramelized sugar" },
          { name: "Creme Brulee", description: "Classic vanilla creme brulee" },
          { name: "Tortuga Cake", description: "House signature cake" },
          { name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center" },
          { name: "Key Lime Pie", description: "House key lime pie" },
        ],
      },
    ],
  },
  {
    slug: "virginias-on-the-bay",
    scrapedAt: "2026-05-02",
    source: "places.singleplatform.com (third-party menu mirror)",
    note: "Pricing may lag the live menu by a season. Confirm specials when calling.",
    menu: [
      {
        section: "Starters From The Sea",
        items: [
          { name: "Crab Cake", description: "Sauteed golden brown", price: "$11.99" },
          { name: "Fresh Oysters On The Half Shell", description: "Available seasonally", price: "Market" },
          { name: "Virginia's Crab Dip", description: "Snow crab blend served with crackers", price: "$7.99" },
          { name: "Calamari", description: "Tender planks, hand battered and golden fried", price: "$9.99" },
          { name: "Campechana Cocktail", description: "Spicy blend of shrimp, avocado & pico", price: "$11.99" },
        ],
      },
      {
        section: "Soup",
        items: [
          { name: "Seafood Gumbo", description: "Breaux Bridge style (dark roux)", price: "Cup $5.59 / Bowl $7.99" },
          { name: "Clam Chowder", description: "New England style, rich & creamy", price: "Cup $5.59 / Bowl $6.99" },
        ],
      },
      {
        section: "Salads",
        items: [
          { name: "Large Garden Salad", description: "Topped with boiled egg, tomato wedges, olives, and green onions", price: "$8.99" },
          { name: "Grilled Chicken Salad", price: "$12.99" },
          { name: "Cajun Popcorn Shrimp Salad", price: "$13.99" },
          { name: "Grilled Shrimp Salad", price: "$14.99" },
          { name: "Grilled Yellowfin Tuna Salad", price: "$21.99" },
        ],
      },
      {
        section: "Fried Seafood",
        items: [
          { name: "Shrimp Platter", description: "Six hand breaded gulf shrimp, served with fries", price: "$15.99" },
          { name: "Fish Platter", description: "Fillets fried golden brown, served with fries", price: "$15.99" },
          { name: "Oyster Platter", description: "Battered in corn meal, served with fries", price: "$15.99" },
          { name: "Sampler Platter", description: "Shrimp, fish & oyster, served with fries", price: "$19.99" },
          { name: "Fish & Shrimp Platter", description: "Served with fries", price: "$17.99" },
        ],
      },
      {
        section: "Sandwiches",
        items: [
          { name: "Fried Fish", description: "Open face with French fries", price: "$9.99" },
          { name: "Grilled Fish", description: "Open face with French fries", price: "$11.99" },
          { name: "Island Burger", description: "Open face with French fries", price: "$8.99" },
          { name: "Oyster Po' Boy", description: "Open face with French fries", price: "$11.99" },
          { name: "Grilled Chicken", description: "Open face with French fries", price: "$9.99" },
        ],
      },
      {
        section: "Desserts",
        items: [
          { name: "Key Lime Pie", price: "$5.99" },
          { name: "Dessert Of The Day", price: "$7.99" },
          { name: "Chocolate Cheesecake", price: "$6.99" },
          { name: "Big M's Homemade Bread Pudding", price: "$5.99" },
        ],
      },
    ],
  },
  {
    slug: "la-playa-mexican-grille",
    scrapedAt: "2026-05-02",
    source: "places.singleplatform.com (third-party menu mirror)",
    note: "Pricing may lag the live menu. Reservations recommended.",
    menu: [
      {
        section: "Bocados (Appetizers)",
        items: [
          { name: "Island Nachos", description: "Crispy chips with refried beans, taco meat, chili con queso, jalapenos, and sour cream", price: "$9.49" },
          { name: "Parilla Nachos", description: "Crispy chips with refried beans, chili con queso, grilled fajita beef, chicken or combo", price: "$11.49" },
          { name: "Avocado Crab Nest", description: "Half an avocado stuffed with sautéed lump crab meat, topped with melted white cheese", price: "$12.99" },
          { name: "Ceviche Tradicional", description: "Fresh white fish and shrimp 'cooked' in lime juice", price: "$9.99" },
          { name: "Ceviche Verde", description: "Fresh white fish and shrimp in a spicy green sauce", price: "$9.99" },
          { name: "Ceviche Campechana", description: "Fresh white fish and shrimp in spicy red sauce topped with crab meat and avocado", price: "$10.79" },
          { name: "Cortez Sampler", description: "Try all three ceviches", price: "$13.99" },
          { name: "Quesadillas", description: "Grilled fajita beef, chicken, or combo with melted white cheese", price: "$9.49" },
          { name: "Shrimp Quesadillas", description: "Melted white cheese with shrimp and avocados", price: "$12.49" },
          { name: "Chili Con Queso", description: "Creamy cheese dip made with a blend of white cheeses", price: "Cup $5.99 / Bowl $7.79" },
          { name: "Queso Ultimo", description: "Cheese dip served with taco meat and pico de gallo", price: "Cup $7.79 / Bowl $9.99" },
          { name: "Guacamole", description: "Made fresh at your table", price: "Reg $7.79 / Lg $11.99" },
        ],
      },
      {
        section: "Ensalada y Sopa",
        items: [
          { name: "Caesar", description: "Romaine lettuce tossed in lemon Caesar dressing topped with house-made chili flour tortilla croutons", price: "$8.49" },
          { name: "Tortilla Soup", description: "With chicken and cheese, topped with tortilla strips and fresh avocado", price: "Cup $4.79 / Bowl $5.79" },
        ],
      },
      {
        section: "Platos Tejanos (Tex-Mex Plates)",
        items: [
          { name: "Cheese Enchiladas", description: "Three, topped with tex-mex gravy. Served with Mexican rice and refried beans", price: "$8.99" },
          { name: "Chicken Enchiladas", description: "Three, topped with ranchero sauce", price: "$10.49" },
          { name: "Chicken Verde Enchiladas", description: "Three, topped with a zesty roasted tomatillo sauce", price: "$10.49" },
          { name: "Beef Enchiladas", description: "Three, topped with tex-mex gravy", price: "$10.79" },
          { name: "Crispy Tacos", description: "Three, beef or chicken, topped with lettuce, tomatoes, and cheese", price: "$10.79" },
          { name: "Soft Tacos", description: "Two, beef or chicken, in a large flour tortilla", price: "$10.79" },
          { name: "El Grande Burrito", description: "Frisbee-sized flour tortilla stuffed with beef or chicken and rice, refried beans, lettuce, tomatoes", price: "$10.49" },
        ],
      },
      {
        section: "Especiales de Mariscos (Seafood Specials)",
        items: [
          { name: "Crabmeat Enchiladas", description: "Three corn tortillas stuffed with sautéed lump crabmeat and avocados covered with a creamy roasted poblano sauce", price: "$21.79" },
          { name: "Crawfish Enchiladas", description: "Three corn tortillas stuffed with sautéed crawfish tails, diced bell peppers and smothered in our creamy chipotle sauce", price: "$18.49" },
          { name: "Enchiladas de Camarones", description: "Three corn tortillas stuffed with fresh shrimp and avocado with creamy roasted poblano sauce", price: "$19.49" },
          { name: "Tres Mariscos Enchiladas", description: "The ultimate enchilada experience: one each crabmeat, shrimp and crawfish enchilada", price: "$22.99" },
          { name: "Tacos Pescado", description: "Two grilled fish or shrimp tacos with purple cabbage and pico de gallo, topped with creamy cilantro dressing", price: "$18.79" },
          { name: "Blackened Tuna Tacos", description: "Two served with lettuce and tomato, topped with peppadew aioli", price: "$19.79" },
          { name: "Scallop Dinner", description: "Three U10 scallops grilled, served over peach chipotle sauce", price: "$20.99" },
        ],
      },
      {
        section: "Camarones (Shrimp Specialties)",
        items: [
          { name: "El Diablo", description: "Shrimp sautéed in a spicy red sauce with diced bell peppers", price: "$19.99" },
          { name: "Tequila Ajo", description: "Shrimp sautéed in garlic butter and finished with gold tequila", price: "$19.99" },
          { name: "Stuffed Shrimp", description: "Bacon-wrapped, stuffed with white cheese and a sliver of serrano pepper", price: "$19.99" },
        ],
      },
      {
        section: "Especiales de la Casa",
        items: [
          { name: "Enchilada Dinner", description: "Two cheese enchiladas, a crisp taco, and guacamole. Served with Mexican rice and refried beans", price: "$14.79" },
          { name: "Tres Amigos", description: "Three enchiladas, one each cheese, beef and chicken", price: "$14.49" },
          { name: "Spinach Enchiladas", description: "Three corn tortillas stuffed with fresh spinach sautéed with garlic and roasted almonds", price: "$15.79" },
          { name: "Island Pepper", description: "Roasted poblano pepper stuffed with white cheese, wrapped in a fajita steak, topped with ranchero sauce", price: "$16.49" },
        ],
      },
      {
        section: "De la Parilla (Grilled)",
        items: [
          { name: "Sizzling Fajitas (For One)", description: "Beef, Chicken, or Combo. Served with grilled onions and peppers, Mexican rice, beans, pico, and guacamole", price: "$16.79" },
          { name: "Sizzling Shrimp Fajitas (For One)", price: "$20.99" },
          { name: "Sizzling Veggie Fajitas (For One)", price: "$16.49" },
          { name: "Sizzling Fajitas (For Two)", description: "Beef, Chicken, or Combo", price: "$27.99" },
          { name: "Sizzling Shrimp Fajitas (For Two)", price: "$33.99" },
          { name: "Parilla Combo (For One)", description: "Beef, Chicken and Shrimp", price: "$20.99" },
          { name: "Parilla Combo (For Two)", description: "Beef, Chicken and Shrimp", price: "$34.99" },
        ],
      },
      {
        section: "Kid's Menu",
        items: [
          { name: "Kid's Plate (10 and under)", description: "Choice of crispy beef taco, cheese enchilada, cheese quesadillas, fajitas, grilled shrimp, or grilled fish", price: "$8.49" },
        ],
      },
    ],
  },
  {
    slug: "roosevelts-tarpon-inn",
    scrapedAt: "2026-05-02",
    source: "rooseveltsatthetarponinn.com",
    note: "Fine dining at the historic Tarpon Inn — reservations strongly recommended.",
    menu: [
      {
        section: "First Bites",
        items: [
          { name: "Roosevelt's Trio", description: "Crab cake / house remoulade / two coconut shrimp / raspberry chipotle marmalade / three oysters Rockefeller / onion frites", price: "$34" },
          { name: "Coconut Shrimp", description: "Four coconut shrimp / raspberry chipotle marmalade", price: "$26" },
          { name: "Jumbo Crab Cakes", description: "Two jumbo crab cakes / house remoulade / mixed greens", price: "$28" },
          { name: "Quail Tails", description: "Three bacon wrapped quail legs / jalapeno & pepper jack cheese / mushroom risotto / mango chutney", price: "$25" },
          { name: "Grilled Oyster Rockefeller", description: "Six Blackjack Point oysters / Rockefeller butter / onion frites", price: "$32" },
          { name: "Teriyaki Tuna Lettuce Wraps", description: "Carrot / cucumber / sesame seed / teriyaki glaze / wonton strips / pickled ginger", price: "$22" },
          { name: "Fire Cracker Tenderloin", description: "Four bacon wrapped tenderloin / jalapeno & pepper jack cheese / mushroom risotto / bordelaise sauce", price: "$38" },
          { name: "Raw Oysters", description: "Six or twelve Blackjack Point oysters / cocktail sauce / horseradish", price: "$18 / $32" },
          { name: "Fried Calamari", description: "Calamari / buttermilk marinade / house remoulade", price: "$26" },
          { name: "Roosevelt's Signature Bread", description: "Grilled herb focaccia / balsamic glaze / parmesan / butter", price: "$14" },
        ],
      },
      {
        section: "Garden Faire",
        items: [
          { name: "Warm Spinach Salad", description: "Sautéed spinach / butternut squash / blue cheese crumbles / roasted pecans / cherry tomato confit dressing", price: "$14" },
          { name: "Wedge Salad", description: "Baby iceberg / red onion / blue cheese / tomatoes / bacon / avocado", price: "$14" },
          { name: "Caesar Salad", description: "Romaine / parmesan / croutons / Caesar dressing", price: "$14" },
          { name: "Tarpon Salad", description: "Avocado / tomatoes / sliced mozzarella / balsamic glaze / olive oil", price: "$16" },
          { name: "Soup of the Day", description: "Chef's daily selection", price: "$10" },
        ],
      },
      {
        section: "Prime Cuts",
        items: [
          { name: "Grilled Ribeye", description: "14oz ribeye / buttermilk mashed potatoes / sautéed green beans / steak butter", price: "$58" },
          { name: "Pork Chop", description: "Thick cut 12oz pork chop / bacon jam / buttermilk mashed potatoes / sautéed green beans", price: "$44" },
          { name: "Top Chop", description: "Bacon / brisket-sirloin blend / Marsala sauce / buttermilk mashed potatoes / seasonal vegetables", price: "$34" },
          { name: "Chicken Marsala", description: "6oz chicken breast / Marsala sauce / mushrooms / mashed potatoes / green beans", price: "$28" },
          { name: "Petite Filet", description: "8oz beef tenderloin / mashed potatoes / sautéed green beans / steak butter", price: "$52" },
        ],
      },
      {
        section: "Fresh Catch",
        items: [
          { name: "Spicy Seafood Medley", description: "Calamari / clam / octopus / lobster / spinach / tomato / roasted chipotle cream sauce / fettuccine", price: "$52" },
          { name: "Pan Seared Red Snapper", description: "Herbed panko / mustard / ricotta ravioli / seared shrimp / saffron sauce", price: "$45" },
          { name: "Parmesan Crusted Flounder", description: "Panko & parmesan breading / fettuccine / Alfredo sauce", price: "$42" },
          { name: "Seared Ahi Tuna", description: "6oz ahi tuna / cilantro rice / seasonal vegetables / lemon dill beurre blanc", price: "$48" },
          { name: "Grilled Mahi Mahi", description: "6oz mahi mahi / cilantro rice / seasonal vegetables", price: "$46" },
        ],
      },
      {
        section: "House Specialties",
        items: [
          { name: "Vegetarian Grill", description: "Sautéed vegetables / olive oil / fresh herbs / fettuccine / balsamic glaze", price: "$28" },
          { name: "Salmon", description: "6oz salmon / beurre blanc / cilantro rice / seasonal vegetables", price: "$48" },
          { name: "Seafood Mac & Cheese", description: "Crab / shrimp / lobster / creamy gouda cheese sauce / cavatappi pasta", price: "$42" },
        ],
      },
      {
        section: "Sweets & Finishes",
        items: [
          { name: "Key Limon Pie", description: "Key lime custard / graham cracker crust / candied citrus zest", price: "$14" },
          { name: "Crème Brulé", description: "Vanilla custard brulé / fresh berries", price: "$14" },
          { name: "White Chocolate Bread Pudding", description: "Rum creme anglaise / sweet bread / white chocolate / salted caramel / chantilly cream / vanilla ice cream", price: "$14" },
          { name: "Brownie A La Mode", description: "Brownie / vanilla ice cream / strawberries", price: "$14" },
        ],
      },
    ],
  },
  {
    slug: "lisabellas-bistro",
    scrapedAt: "2026-05-02",
    source: "lisabellas.com",
    note: "Reservations strongly recommended.",
    menu: [
      {
        section: "Starters & Small Plates",
        items: [
          { name: "Texas Chevre", description: "Creamy goat cheese, fig, rosemary, honey, crostinis", price: "$18" },
          { name: "Garlic Bread", description: "Fresh baked with parmesan reggiano", price: "$7" },
          { name: "Crab Cakes", description: "Blue lump crab, mango coulis, lemon beurre blanc", price: "$28" },
          { name: "Pancetta Shrimp", description: "Pancetta wrapped, chipotle honey glaze", price: "$27" },
          { name: "Ceviche", description: "Chef's featured fresh catch, house made tostadas", price: "$24" },
          { name: "Tuna", description: "Gulf yellowfin tuna with avocado, jalapeño, crispy wonton, sesame seeds, pickled red onion, micro cilantro", price: "$26" },
        ],
      },
      {
        section: "Soup",
        items: [
          { name: "Mermaid Soup", description: "Lobster coconut broth, shrimp, curry spices & secrets", price: "Cup $12 / Bowl $20" },
          { name: "Soup du Jour", description: "Seasonal (ask server)" },
        ],
      },
      {
        section: "Salads",
        items: [
          { name: "Lisabella Salad", description: "Baby lettuces with pear, walnuts, gorgonzola, balsamic vinaigrette", price: "$16" },
          { name: "Caesar Salad", description: "Romaine with housemade croutons and parmesan reggiano", price: "$16" },
          { name: "Espinaca Salad", description: "Baby spinach with apple, red onion, dried cherries, candied walnuts, goat cheese dressing", price: "$16" },
        ],
      },
      {
        section: "Entrees",
        items: [
          { name: "Red Snapper Belle Meuniere", description: "Sautéed with wild mushroom white wine butter, mashed potatoes, asparagus", price: "$48" },
          { name: "Lobster Enchiladas", description: "Poblano pepper, mozzarella mango cream, coconut rice, sautéed spinach", price: "$40" },
          { name: "Wild Jumbo Gulf Shrimp", description: "Paneed with lemon garlic butter, linguini, sautéed spinach", price: "$38" },
          { name: "Filet of Beef Tenderloin", description: "6 oz. with chef's featured sauce, Yukon potatoes, asparagus", price: "$56" },
          { name: "Prime New York Strip", description: "Hand-cut 14 oz iron skillet grilled with fire roasted tomato, jalapeños, feta, fingerling potatoes", price: "$58" },
          { name: "Airline Chicken", description: "Pan roasted with sherry shallot butter, wild mushroom risotto", price: "$32" },
          { name: "Poblano Burger", description: "8 oz. chuck brisket with roasted poblano, black bean puree, caramelized onion, feta, fingerling potatoes", price: "$24" },
          { name: "Garden", description: "Asparagus, spinach, carrots, zucchini, Yukon potatoes", price: "$28" },
          { name: "Diver Sea Scallops", description: "Pan seared with tequila-orange reduction, jasmine rice, summer vegetables", price: "$45" },
        ],
      },
      {
        section: "Pasta",
        items: [
          { name: "Sunlight Pasta", description: "Linguini with pancetta, heirloom tomatoes, roasted garlic anchovy, basil, olive oil. +$12 jumbo Gulf shrimp / +$16 lump crab", price: "$28" },
        ],
      },
      {
        section: "Sweets",
        items: [
          { name: "Hallelujah Chocolate Cake", description: "Lisabella's family recipe" },
          { name: "Carrot Ginger Cake", description: "Lisabella's favorite" },
          { name: "Crème Brûlée", price: "$10" },
        ],
      },
    ],
  },
  {
    slug: "trout-street-bar-grill",
    scrapedAt: "2026-05-02",
    source: "tsbag.com + Tripadvisor + Wanderlog",
    note: "Online ordering available at tsbag.com. Prices reflect snapshot — confirm current.",
    menu: [
      {
        section: "Appetizers",
        items: [
          { name: "Crab Cakes", description: "Hand-formed lump crab cakes with chipotle cream" },
          { name: "Peel & Eat Gulf Shrimp", description: "Fresh gulf shrimp cooked in a spicy Texas-style boil, served with house cocktail sauce and horseradish", price: "$18.99" },
          { name: "Fresh Oysters on the Half Shell", description: "Oysters from selected Gulf beds (often San Antonio Bay or Copano Bay)" },
          { name: "Fried Cheese Sticks", description: "Hand-breaded mozzarella, fried crisp", price: "$7.99" },
          { name: "Harbor Fries", description: "Loaded waterfront-style fries", price: "$8.99" },
          { name: "Calamari", description: "Hand-breaded and fried" },
          { name: "Shrimp Cocktail", description: "Chilled Gulf shrimp with house cocktail sauce" },
        ],
      },
      {
        section: "Soups & Salads",
        items: [
          { name: "Cajun Gumbo", description: "Dark roux Cajun-style gumbo with shrimp, fish, and andouille" },
          { name: "Clam Chowder", description: "New England-style with potatoes and bacon" },
          { name: "Wedge Salad", description: "Iceberg wedge with bleu cheese, bacon, and tomato" },
          { name: "Belinda Salad", description: "House mixed greens; add grilled chicken" },
        ],
      },
      {
        section: "Sandwiches",
        items: [
          { name: "Po' Boy Fish Sandwich", description: "Oversized fried Gulf fish on a hoagie with lettuce, tomato, and remoulade" },
          { name: "Philly Cheesesteak", description: "Sliced beef, peppers, onions, and melted cheese on a hoagie" },
          { name: "Chicken Club Sandwich", description: "Grilled chicken breast with bacon, cheese, and spinach" },
          { name: "Trout Street Burger", description: "House burger; add cheese, bacon, or jalapeños" },
        ],
      },
      {
        section: "From the Sea",
        items: [
          { name: "Cajun Redfish", description: "Blackened redfish topped with Cajun gumbo — the signature dish" },
          { name: "Blackened Redfish", description: "Cast-iron blackened Gulf redfish with rice and a vegetable" },
          { name: "Gulf Coast Red Snapper", description: "Fresh-caught Gulf snapper, prepared grilled, blackened, or fried" },
          { name: "Mahi Mahi", description: "Meaty Gulf mahi with citrus butter" },
          { name: "Fresh Fish Vera Cruz", description: "Gulf fish topped with tomato, olive, and caper Vera Cruz sauce" },
          { name: "Pan Seared Scallops", description: "Diver scallops, seared and finished with butter" },
          { name: "Coconut Shrimp", description: "Coconut-breaded Gulf shrimp with sweet dipping sauce" },
          { name: "Fried Shrimp Platter", description: "Hand-breaded Gulf shrimp" },
          { name: "Boiled Shrimp Plate", description: "Spicy-boiled Gulf shrimp with side salad" },
          { name: "Shrimp Sampler", description: "Four preparations of Gulf shrimp on one plate" },
          { name: "Seafood Mac & Cheese", description: "Creamy mac with shrimp and crab" },
          { name: "Crab Crepes", description: "Lump crab folded in delicate crepes" },
          { name: "Fish Tacos", description: "Grilled Gulf fish, cabbage, salsa, and crema" },
          { name: "Shrimp Tacos", description: "Grilled Gulf shrimp tacos with crema" },
        ],
      },
      {
        section: "From the Grill",
        items: [
          { name: "USDA Choice Steak", description: "Hand-cut steak grilled to order with two sides" },
        ],
      },
      {
        section: "We Cook Your Catch",
        items: [
          { name: "Cook Your Catch", description: "Bring your cleaned fish — grilled, fried, blackened, or Vera Cruz — for a small fee" },
        ],
      },
      {
        section: "Sides",
        items: [
          { name: "Baked Potato", description: "Loaded on request" },
          { name: "Creamed Corn", description: "House-made sweet creamed corn" },
          { name: "Mac and Cheese", description: "Three-cheese baked mac" },
          { name: "Mashed Potatoes" },
          { name: "Rice & Gumbo" },
          { name: "Fries", description: "Crispy hand-cut" },
        ],
      },
    ],
  },
  {
    slug: "fins-grill-icehouse",
    scrapedAt: "2026-05-02",
    source: "finsgrillandicehouse.com + SinglePlatform",
    note: "Most prices not published — call to confirm.",
    menu: [
      {
        section: "Starters",
        items: [
          { name: "Chips and Dips", description: "FINS fresh tortilla chips with homemade white queso, salsa, and guacamole", price: "$13.49" },
          { name: "Coconut Rum Shrimp Platter", description: "Wild-caught Gulf shrimp hand-breaded with coconut rum batter, fried golden brown", price: "$21.99" },
          { name: "Homemade Crab Cakes", description: "Hand-formed lump crab cakes with remoulade" },
          { name: "FINS Famous Onion Rings", description: "Hand-cut thin and fried" },
          { name: "Mozzarella Sticks", description: "Breaded and fried, served with marinara" },
          { name: "Calamari", description: "Lightly breaded, fried crisp" },
          { name: "Shrimp Nachos", description: "Tortilla chips topped with grilled Gulf shrimp, cheese, and jalapeños" },
          { name: "Seafood Gumbo", description: "Homemade dark-roux gumbo with shrimp, fish, and sausage" },
          { name: "Clam Chowder", description: "Creamy New England-style chowder" },
        ],
      },
      {
        section: "Salads",
        items: [
          { name: "House Salad", description: "Mixed greens, diced tomatoes, red bell peppers, red onion, topped with shredded Monterrey Jack", price: "$7.99" },
        ],
      },
      {
        section: "Tacos",
        items: [
          { name: "Fish Tacos", description: "Crisp-fried or grilled Gulf fish, cabbage, salsa, and crema" },
          { name: "Shrimp Tacos", description: "Grilled Gulf shrimp tacos with crema" },
        ],
      },
      {
        section: "Burgers & Sandwiches",
        items: [
          { name: "Port A Burger", description: "Half-pound Angus burger dripping with thick white queso, piled high with fried pickles and jalapeños, chipotle mayo on a sourdough bun" },
          { name: "Cowboy Burger", description: "Loaded Angus burger with bacon, cheese, and onion rings" },
          { name: "FINS Burger", description: "The classic — half-pound Angus, dressed", price: "$9.99" },
          { name: "Bacon Cheddar Burger", description: "Half-pound Angus with applewood bacon and aged cheddar" },
          { name: "Mushroom Swiss Burger", description: "Half-pound Angus with sautéed mushrooms and Swiss" },
          { name: "Fish Po'Boy", description: "Fried Gulf fish on a hoagie with lettuce, tomato, and remoulade" },
          { name: "Fried Shrimp Po'Boy", description: "Breaded Gulf shrimp on a bun with onion rings on the side" },
          { name: "Grilled Chicken Sandwich", description: "Marinated grilled chicken breast on a bun" },
          { name: "Crab Cake Sliders", description: "Mini crab cakes on slider buns with remoulade" },
        ],
      },
      {
        section: "From the Sea",
        items: [
          { name: "Crab Stuffed Fish", description: "Gulf fish filet stuffed with lump crab" },
          { name: "Crispy Fish & Shrimp", description: "Combo plate of fried Gulf fish and shrimp" },
          { name: "Redfish Platter", description: "Grilled or blackened Gulf redfish with two sides" },
          { name: "Grilled Mahi", description: "Mahi-mahi filet, grilled with butter" },
          { name: "Blackened Gulf Fish", description: "Cast-iron blackened Gulf fish of the day" },
        ],
      },
      {
        section: "From the Grill",
        items: [
          { name: "Grilled Chicken Platter", description: "Chicken breast marinated overnight and grilled just right", price: "$12.49" },
          { name: "Chicken Fried Steak", description: "Hand-breaded steak with white gravy" },
        ],
      },
      {
        section: "Sides",
        items: [
          { name: "FINS Famous Onion Rings", description: "Hand-cut thin and fried" },
          { name: "Garlic Mashed Potatoes" },
          { name: "Fries" },
        ],
      },
    ],
  },
  {
    slug: "kcs-oyster-shack",
    scrapedAt: "2026-05-02",
    source: "Yelp + Google reviews + Facebook (no published menu)",
    note: "Tiny 14-seat shack with no published menu. They post a chalkboard 'Updated FOOD Menu' on Facebook each week. Nothing fried per house style — all fresh, boiled, raw, or grilled.",
    menu: [
      {
        section: "Menu",
        items: [
          { name: "Raw Oysters on the Half Shell", description: "Fresh Gulf oysters shucked to order" },
          { name: "Boiled Shrimp", description: "Cold Gulf shrimp, peel-and-eat, served on ice" },
          { name: "Grilled Oysters", description: "Char-grilled Gulf oysters with butter and seasoning" },
          { name: "Grilled Butterfly Shrimp", description: "Jumbo Gulf shrimp, butterflied and grilled" },
          { name: "Crab Claws", description: "Chilled crab claws with cocktail sauce" },
          { name: "Snow Crab Legs", description: "Steamed snow crab clusters with drawn butter" },
          { name: "Crawfish", description: "Boiled Cajun-spiced crawfish (seasonal)" },
          { name: "Lobster", description: "Steamed Maine lobster (seasonal/limited)" },
          { name: "Mussels", description: "Steamed mussels in white wine and garlic" },
          { name: "Surf and Turf", description: "Steak paired with chilled or grilled seafood" },
          { name: "Wood-Fired Pizza", description: "Daily-changing pizza from the small kitchen" },
        ],
      },
    ],
  },
  {
    slug: "castaways-bar-grill",
    scrapedAt: "2026-05-02",
    source: "castawaysporta.com + Yelp menu",
    note: "Full menu with current prices.",
    menu: [
      {
        section: "Appetizers",
        items: [
          { name: "Crab Cakes", description: "Seven mini crab cakes with remoulade", price: "$10.99" },
          { name: "Coconut Shrimp", description: "Four shrimp coconut-breaded, served with honey mustard", price: "$8.99" },
          { name: "Calamari", description: "Hand-breaded calamari, served with marinara", price: "$9.99" },
          { name: "Castaway's Sliders", description: "Four juicy mini cheeseburgers", price: "$8.99" },
          { name: "Peel & Eat Boiled Shrimp", description: "Spicy-boiled Gulf shrimp", price: "$12.99 / $8.99" },
          { name: "Hushpuppies", description: "Eight house-made hushpuppies", price: "$5.99" },
          { name: "Onion Rings", description: "Hand-battered Vidalia rings", price: "$5.99" },
          { name: "Sample Platter Deluxe", description: "Six crab cakes, calamari, four hushpuppies, four coconut shrimp", price: "$25.00" },
        ],
      },
      {
        section: "Soups & Salads",
        items: [
          { name: "Castaway's Gumbo", description: "Homemade dark-roux gumbo with shrimp, okra, sausage, and fish — runs out daily", price: "Cup $6 / Bowl $8" },
          { name: "All-You-Can-Eat Soup & Salad Bar", price: "$7.99" },
          { name: "Caesar Salad", description: "Fresh romaine with shaved Parmesan and Caesar dressing", price: "$8.99" },
          { name: "Grilled Chicken Caesar", price: "$11.99" },
          { name: "Grilled Tuna Salad", description: "Mixed greens, fresh vegetables, sliced grilled tuna", price: "$13.99" },
          { name: "Grilled Shrimp Salad", description: "Mixed greens with six jumbo grilled shrimp", price: "$15.99" },
        ],
      },
      {
        section: "Hot Off the Grill",
        items: [
          { name: "Grilled Fish", description: "Chef's choice Gulf filet over rice with vegetables", price: "$17.99" },
          { name: "Blackened Mahi Mahi", description: "Texas farm-raised redfish blackened to order", price: "$19.99" },
          { name: "Lemon Pepper Fish", description: "Gulf filet seasoned with lemon pepper, broiled in garlic butter", price: "$18.99" },
          { name: "Grilled Shrimp", description: "Six jumbo grilled shrimp with melted butter, over rice", price: "$18.99" },
          { name: "Baked Stuffed Flounder", description: "Stuffed flounder broiled in butter, topped with Caribbean sauce", price: "$18.99" },
          { name: "Grilled Tuna", description: "Sashimi-grade tuna grilled, served with rice and steamed broccoli", price: "$18.99" },
          { name: "Jay's Special", description: "Mahi blackened to perfection, topped with creamy Cajun crab sauce", price: "$22.99" },
          { name: "Castaway's Caribbean Fish", description: "Daily Gulf fish topped with creamy white wine, garlic, and tomato sauce", price: "$18.99" },
        ],
      },
      {
        section: "Steaks & Chicken",
        items: [
          { name: "Hand-Cut Angus Ribeye", description: "12-14 oz ribeye, baked potato, vegetables", price: "$20.99" },
          { name: "Blackened Ribeye", description: "12-14 oz ribeye blackened, baked potato, grilled vegetables", price: "$22.99" },
          { name: "Hand-Cut Sirloin", description: "12 oz sirloin, baked potato, vegetables", price: "$20.99" },
          { name: "Steak and Grilled Shrimp", description: "Premium steak with four jumbo grilled shrimp over rice", price: "$26.99" },
          { name: "Grilled Chicken Breast", description: "Chicken breast over rice with mixed vegetables", price: "$12.95" },
        ],
      },
      {
        section: "Pasta",
        items: [
          { name: "Chicken Alfredo", description: "Grilled chicken breast over fettuccine with homemade Alfredo", price: "$14.99" },
          { name: "Shrimp Alfredo", description: "Six sautéed Gulf shrimp in classic Alfredo over fettuccine", price: "$16.99" },
          { name: "Castaway's Shrimp Marinara", description: "Six sautéed Gulf shrimp over pasta with marinara", price: "$16.99" },
        ],
      },
      {
        section: "Po-Boys",
        items: [
          { name: "Big Fish Po-Boy", description: "One large Alaskan whitefish filet, fried, on a hoagie", price: "$9.99" },
          { name: "Fried Gulf Fish Sandwich", description: "Daily Gulf fish selection, fried, on a hoagie", price: "$11.99" },
          { name: "Soft Shell Crab Po-Boy", description: "One soft-shell crab on a hoagie", price: "$13.99" },
          { name: "Oyster Po-Boy", description: "Fried Gulf oysters on a hoagie", price: "$10.99" },
          { name: "Shrimp Po-Boy", description: "Fried Gulf shrimp on a hoagie", price: "$9.99" },
          { name: "Grilled Gulf Fish Po-Boy", description: "Daily grilled Gulf fish on a hoagie", price: "$12.99" },
          { name: "Blackened Mahi-Mahi Po-Boy", description: "Texas farm-raised redfish, blackened, on a hoagie", price: "$13.99" },
        ],
      },
      {
        section: "Burgers",
        items: [
          { name: "Hamburger", description: "Half-pound Angus on sourdough with lettuce, pickles, tomato", price: "$7.99" },
          { name: "Cheeseburger", description: "Half-pound Angus with American, Swiss, or cheddar", price: "$8.99" },
          { name: "Bacon Cheddar Burger", description: "Half-pound Angus with applewood bacon and cheddar", price: "$9.99" },
          { name: "Jalapeño & Cheeseburger", description: "Half-pound Angus with jalapeños and cheese", price: "$9.99" },
          { name: "Mushroom Onion Swiss Burger", description: "Half-pound Angus with sautéed mushrooms, onions, and Swiss", price: "$9.99" },
        ],
      },
      {
        section: "Fried Seafood",
        items: [
          { name: "Fried Shrimp", description: "Hand-breaded Gulf shrimp", price: "$15.99 / $17.99" },
          { name: "Fried Oysters", description: "Hand-breaded Gulf oysters", price: "$16.99 / $19.99" },
          { name: "White Fish", description: "Alaskan whitefish, fried", price: "$10.99 / $12.99" },
          { name: "Gulf Fish", description: "Daily Gulf fish, fried", price: "$16.99 / $19.99" },
          { name: "Soft Shell Crab Dinner", description: "Two soft-shell crabs, fried", price: "$24.99" },
          { name: "Stuffed Crab Shell Dinner", description: "Two stuffed crab shells, fried", price: "$13.99" },
        ],
      },
      {
        section: "Shrimp & Crab Boils",
        items: [
          { name: "Shrimp Boil", description: "Three-quarter pound boiled Gulf shrimp with sausage, potatoes, corn", price: "$17.99" },
          { name: "Snow Crab Dinner", description: "Two snow crab clusters with baked potato or fries", price: "$19.99" },
          { name: "Treasure Boil", description: "Snow crab legs, shrimp, sausage, potatoes, corn", price: "$21.99" },
        ],
      },
      {
        section: "Cows & Chickens",
        items: [
          { name: "Chicken Fried Steak", description: "Hand-breaded with white gravy and baked potato", price: "$13.99" },
          { name: "Chicken Fried Chicken", description: "Hand-breaded with white gravy and baked potato", price: "$12.99" },
          { name: "Chicken Strips", description: "Four strips with French fries", price: "$10.99" },
        ],
      },
      {
        section: "We Cook Your Catch",
        items: [
          { name: "Fried Filets", description: "Bring your cleaned fish — fried", price: "$9.99/lb" },
          { name: "Grilled Filets", description: "Chef's choice, lemon pepper, teriyaki, or honey mustard", price: "$10.99/lb" },
          { name: "Wild Game", description: "Venison, quail, dove, turkey, hog, duck, goose, rabbit, squirrel — call ahead" },
        ],
      },
      {
        section: "Kid's Menu",
        items: [
          { name: "Pirate's Treasure", description: "Choice of fried shrimp, fried fish, or popcorn shrimp — with fries or vegetables and drink", price: "$6.95" },
          { name: "Landlubbers", description: "Choice of chicken strips, corn dog, grilled cheese, or two mini burgers — with fries or vegetables and drink", price: "$6.95" },
        ],
      },
    ],
  },
];

// Index by slug for O(1) lookup
const SCRAPED_BY_SLUG = new Map<string, ScrapedMenu>(
  SCRAPED.map((s) => [s.slug, s]),
);

export function getScrapedMenu(slug: string): ScrapedMenu | undefined {
  return SCRAPED_BY_SLUG.get(slug);
}

/**
 * Pick the best available menu for a restaurant — prefers the scraped
 * version if it has more items than the businesses.ts curated highlights.
 * Returns null if no menu data exists.
 */
export function selectBestMenu(
  slug: string,
  curatedMenu: MenuSection[] | undefined,
): { menu: MenuSection[]; source: "scraped" | "curated"; note?: string } | null {
  const scraped = SCRAPED_BY_SLUG.get(slug);
  const curatedItemCount =
    curatedMenu?.reduce((sum, sec) => sum + sec.items.length, 0) ?? 0;
  const scrapedItemCount =
    scraped?.menu.reduce((sum, sec) => sum + sec.items.length, 0) ?? 0;

  if (scrapedItemCount > curatedItemCount) {
    return { menu: scraped!.menu, source: "scraped", note: scraped!.note };
  }
  if (curatedItemCount > 0 && curatedMenu) {
    return { menu: curatedMenu, source: "curated" };
  }
  if (scrapedItemCount > 0 && scraped) {
    return { menu: scraped.menu, source: "scraped", note: scraped.note };
  }
  return null;
}
