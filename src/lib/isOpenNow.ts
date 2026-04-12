import type { Business } from "@/data/businesses";

export function isOpenNow(business: Business): boolean {
  if (!business.hoursOfOperation) return false;
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[now.getDay()];
  const todayHours = business.hoursOfOperation[todayName];
  if (!todayHours || todayHours === "Closed") return false;

  // Normalize en dashes and spacing around hyphens
  const clean = todayHours.replace(/\s*–\s*/g, "-").replace(/\s*-\s*/g, "-");
  const match = clean.match(/(\d+(?::\d+)?)\s*(AM|PM)?-(\d+(?::\d+)?)\s*(AM|PM)?/i);
  if (!match) return false;

  function toMinutes(time: string, meridiem: string): number {
    const [h, m = "0"] = time.split(":");
    let hours = parseInt(h);
    const mins = parseInt(m);
    meridiem = meridiem?.toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  const openMin = toMinutes(match[1], match[2] || match[4]);
  let closeMin = toMinutes(match[3], match[4] || match[2]);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Handle overnight hours (e.g. "11:00 AM – 2:00 AM" = open until 2am next day)
  if (closeMin <= openMin) {
    // Overnight: open if nowMin >= openMin OR nowMin < closeMin
    return nowMin >= openMin || nowMin < closeMin;
  }

  return nowMin >= openMin && nowMin < closeMin;
}
