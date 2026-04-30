import { gullyItems } from "../src/lib/gullySearch";

const signals = [
  "kid friendly",
  "pet friendly",
  "happy hour",
  "breakfast",
  "late night",
  "sunset",
  "outdoor seating",
  "live music",
  "coffee",
  "beer",
];

const businessOnly = gullyItems.filter((i) => i.type === "business");
console.log(`Total businesses indexed: ${businessOnly.length}\n`);
console.log("Synthetic-tag coverage:");
for (const sig of signals) {
  const matches = businessOnly.filter((b) => b.tags.includes(sig));
  console.log(`  ${sig}: ${matches.length}`);
  if (matches.length > 0 && matches.length <= 3) {
    matches.forEach((m) => console.log(`    - ${m.name}`));
  }
}
