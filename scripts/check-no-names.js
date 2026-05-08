#!/usr/bin/env node
/* eslint-disable */

// Guard against the individual-names-on-customer-surfaces class of bug.
// PAL voice is entity-only on every surface a customer or vendor sees.
// The four FORBIDDEN operator names (Winston, Nick, Collie, Havee) must
// never appear in rendered customer-facing copy.
//
// Origin: 2026-05-06. Collie spotted "Collie - Port A Local calendar..."
// rendering on /live-music. Hotfix PRs #10 + #11 swept four violations.
// Memory rule locked at `feedback_pal_no_names_on_website.md`. This
// guard makes future violations fail the build instead of slipping to
// prod silently.
//
// Wired into `pnpm build` so a leak fails the deploy.
//
// Allowed override (RARE — explicit operator authorization required):
//
//   <p>...somehow this needs Winston by name...</p>  // pal-name-allowed: <reason>
//
// Third-party business owners in their own business descriptions (Bron
// Doyle on Bron's Backyard, Billy Gaskins on Woody's, Chef Matt Axtell
// on Crabcakes & Caviar) are NOT scoped by this rule.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FORBIDDEN = ["Winston", "Nick", "Collie", "Havee"];
const FORBIDDEN_RE = new RegExp(`\\b(${FORBIDDEN.join("|")})\\b`, "i");

// Field names whose string values get rendered to customers. Used in
// data files to scope detection to prose strings, not identifier fields
// like `name:` or `slug:` (which are internal addressing tokens).
const RENDER_BOUND_FIELDS = [
  "description",
  "tagline",
  "subtitle",
  "subhead",
  "headline",
  "title",
  "body",
  "text",
  "caption",
  "tooltip",
  "placeholder",
  "sourcedFrom",
  "message",
  "subject",
  "announcement",
  "eyebrow",
  "summary",
  "alt",
  "blurb",
  "hostBlurb",
  "hostStory",
  "lead",
  "intro",
  "byline",
  "dek",
  "excerpt",
  "pullQuote",
  "explanation",
  "detail",
  "details",
  "copy",
  "prose",
  "answer",
  "question",
  "content",
  "note",
  "notes",
];

// How many lines back to look for a render-bound field declaration.
// Some data files use multi-line string arrays / templates where the
// field name lives 10-20 lines above the matched line.
const RENDER_BOUND_LOOKBACK = 30;

const repoRoot = path.resolve(__dirname, "..");
process.chdir(repoRoot);

const TARGETS = [
  { glob: "src/app/**/page.tsx", scope: "page", strictMode: "all-non-comment" },
  { glob: "src/app/**/opengraph-image.tsx", scope: "og", strictMode: "all-non-comment" },
  { glob: "src/data/**/*.ts", scope: "data", strictMode: "render-bound-fields" },
];

// Exclude paths whose audience is operator-tier or whose role is pure
// identity/server logic (not customer-rendered).
const EXCLUDE_PATTERNS = [
  /^src\/app\/wheelhouse\//,
  /^src\/app\/api\//,
  // Operator identity registries — names are stored as routing tokens,
  // never rendered to customers.
  /^src\/data\/insiders\.ts$/,
  /^src\/data\/super-admins\.ts$/,
  // Wheelhouse seed data — populates the operator-tier console.
  /^src\/data\/wheelhouse-seed\.ts$/,
];

function listFiles(glob) {
  const dir = glob.split("/").slice(0, glob.includes("**/") ? -1 : -1).join("/")
    .replace("/**", "");
  const fileGlob = path.basename(glob);
  const cmd = `find ${dir} -type f -name "${fileGlob}"`;
  try {
    return execSync(cmd, { encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .filter((f) => !EXCLUDE_PATTERNS.some((re) => re.test(f)))
      .sort();
  } catch (e) {
    return [];
  }
}

/**
 * Walk a file's lines and flag forbidden-name matches that aren't inside
 * a comment. Tracks multi-line block comments (`/* ... *\/`) and JSX
 * comment blocks (`{/* ... *\/}`).
 */
function scanFile(filePath, scope, strictMode) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const findings = [];

  let inBlockComment = false;
  let inJsxComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Update block-comment state — handle a line that opens AND closes
    let cleaned = line;
    if (inBlockComment) {
      const closeIdx = cleaned.indexOf("*/");
      if (closeIdx === -1) {
        // Entire line is inside the comment
        continue;
      }
      cleaned = cleaned.slice(closeIdx + 2);
      inBlockComment = false;
    }
    if (inJsxComment) {
      const closeIdx = cleaned.indexOf("*/}");
      if (closeIdx === -1) {
        continue;
      }
      cleaned = cleaned.slice(closeIdx + 3);
      inJsxComment = false;
    }

    // Detect comment openers on this line
    // Strip line comments (// ...) and inline block comments first
    let scanText = cleaned;
    // Strip inline /* ... */ on the same line
    scanText = scanText.replace(/\/\*[\s\S]*?\*\//g, "");
    // Strip JSX inline {/* ... */}
    scanText = scanText.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
    // Strip line comments
    scanText = scanText.replace(/\/\/.*$/, "");

    // If a block-comment opener remains without close, mark for next line
    if (/\/\*/.test(scanText) && !/\*\//.test(scanText.split("/*").pop() || "")) {
      inBlockComment = true;
      // Truncate scanText at the opener so we don't match inside it
      scanText = scanText.split("/*")[0];
    }
    if (/\{\/\*/.test(scanText) && !/\*\/\}/.test(scanText)) {
      inJsxComment = true;
      scanText = scanText.split("{/*")[0];
    }

    // Skip lines that are pure-comment after our cleanup
    if (scanText.trim().length === 0) continue;

    // Allow opt-out via inline override comment on same line
    if (line.includes("// pal-name-allowed:")) continue;

    const match = FORBIDDEN_RE.exec(scanText);
    if (!match) continue;

    // Strict-mode filter for data files — only flag if the line is
    // inside a render-bound field's value. Walks backwards up to
    // RENDER_BOUND_LOOKBACK lines looking for the nearest `<word>:`
    // field declaration; if that word is render-bound, flag.
    if (strictMode === "render-bound-fields") {
      let inRenderField = false;
      const start = Math.max(0, i - RENDER_BOUND_LOOKBACK);
      for (let j = i; j >= start; j--) {
        // Match the FIRST top-level field declaration on a previous line
        const declMatch = lines[j].match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
        if (!declMatch) continue;
        const fieldName = declMatch[1];
        if (RENDER_BOUND_FIELDS.includes(fieldName)) {
          inRenderField = true;
        }
        break;
      }
      if (!inRenderField) continue;
    }

    findings.push({
      file: filePath,
      lineNo: i + 1,
      name: match[1],
      excerpt: trimmed.slice(0, 200),
      scope,
    });
  }

  return findings;
}

const violations = [];

for (const target of TARGETS) {
  const files = listFiles(target.glob);
  for (const f of files) {
    violations.push(...scanFile(f, target.scope, target.strictMode));
  }
}

if (violations.length === 0) {
  console.log(
    `✓ check-no-names: 0 customer-surface leaks across ${TARGETS.length} target globs (forbidden: ${FORBIDDEN.join(", ")})`,
  );
  process.exit(0);
}

console.error("");
console.error(`!! check-no-names: ${violations.length} customer-surface name leak(s) detected.`);
console.error("   PAL voice is entity-only — no individual operator names in rendered customer copy.");
console.error("   See memory: feedback_pal_no_names_on_website.md");
console.error("");

for (const v of violations) {
  console.error(`   ${v.file}:${v.lineNo}  [${v.scope}]  matched "${v.name}"`);
  console.error(`     ${v.excerpt}`);
  console.error("");
}

console.error("Substitutes when stripping names:");
console.error("  'Collie's designs'   -> 'the PAL design system'");
console.error("  'Winston's rule'     -> 'PAL editorial standard'");
console.error("  'Contact Winston'    -> 'Reply to any PAL message' / 'Email admin@theportalocal.com'");
console.error("  'Sourced by Collie'  -> 'Port A Local - week of [date]'");
console.error("");
console.error("If a name MUST appear (rare — explicit operator authorization):");
console.error("  add a same-line comment: // pal-name-allowed: <reason>");

process.exit(1);
