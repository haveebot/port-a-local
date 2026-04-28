/**
 * Inlined lighthouse silhouette for PWA install tiles + apple-touch-icon.
 *
 * Why inline + base64 instead of pulling /public/logos/lighthouse-full.svg
 * via fs.readFileSync: Satori (the SVG renderer behind `next/og`) can't
 * parse the rotate(-45) transforms on the rays in the full lighthouse
 * mark — the resulting PNG was a navy square with no lighthouse, which
 * is exactly the placeholder-tile bug Winston saw on Add to Home Screen.
 *
 * The simplified silhouette uses only paths, polygons, and rects — no
 * transforms — so Satori draws it cleanly. Sand-colored fill against
 * the navy background of every PWA tile / apple icon.
 */

const SAND_LIGHTHOUSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M47.74,121.7l1.32-13.84c.07-.72-.02-1.33.35-2.02l28.18-12.01,2.66,27.86h-32.52Z" fill="#f5f0e8"/><polygon points="76.4 81.09 50.56 92.1 51.81 78.93 75.21 68.94 76.4 81.09" fill="#f5f0e8"/><rect x="57" y="37" width="14" height="40" fill="#f5f0e8"/><path d="M 54 37 L 64 22 L 74 37 Z" fill="#f5f0e8"/></svg>`;

export const PWA_LIGHTHOUSE_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(
  SAND_LIGHTHOUSE_SVG,
).toString("base64")}`;

export const PWA_NAVY_BG = "#0b1120";
