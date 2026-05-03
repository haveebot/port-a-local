#!/usr/bin/env node
/* eslint-disable */

// Guard against the OG-staleness class of bug. Every opengraph-image.tsx in
// src/app/ MUST export `dynamic = "force-dynamic"`. Without it, Next.js
// statically optimizes the PNG at build time and FB/Twitter snapshot the
// stale PNG into permanent link cards on shared posts.
//
// Wired into `pnpm build` so a missing export fails the deploy. Run with
// --fix to insert the export into any file that's missing it.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FIX = process.argv.includes("--fix");
const FLAG = 'export const dynamic = "force-dynamic";';

const repoRoot = path.resolve(__dirname, "..");
process.chdir(repoRoot);

const files = execSync(
  'find src/app -name "opengraph-image.tsx"',
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)
  .sort();

const missing = [];
const patched = [];

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  if (content.includes('dynamic = "force-dynamic"')) continue;

  if (!FIX) {
    missing.push(f);
    continue;
  }

  // Insert after the standard contentType export line. Two patterns are
  // used in the codebase: `ogContentType` (most files) and `"image/png"`
  // (the root opengraph-image.tsx).
  const updated = content.replace(
    /(export const contentType = (?:ogContentType|"image\/png");)/,
    `$1\n${FLAG}`,
  );

  if (updated === content) {
    console.error(`!! could not patch (no contentType anchor found): ${f}`);
    process.exitCode = 1;
    continue;
  }

  fs.writeFileSync(f, updated);
  patched.push(f);
}

if (FIX) {
  if (patched.length === 0) {
    console.log(`✓ All ${files.length} opengraph-image.tsx files already have force-dynamic.`);
  } else {
    console.log(`Patched ${patched.length} file(s):`);
    for (const f of patched) console.log(`  ${f}`);
  }
  process.exit(process.exitCode ?? 0);
}

if (missing.length) {
  console.error("!! opengraph-image.tsx files missing `export const dynamic = \"force-dynamic\";`:");
  for (const m of missing) console.error(`   ${m}`);
  console.error("");
  console.error("Why this matters: without force-dynamic, Next.js statically optimizes");
  console.error("the OG PNG at build time. FB/Twitter snapshot the stale PNG into");
  console.error("permanent link cards on shared posts. Operators discover the bug");
  console.error("post-by-post forever.");
  console.error("");
  console.error("Run: node scripts/check-og-dynamic.js --fix");
  process.exit(1);
}

console.log(`✓ All ${files.length} opengraph-image.tsx files have force-dynamic.`);
