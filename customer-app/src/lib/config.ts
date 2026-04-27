// Single source of truth for the website / API base.
// Override via Settings (later) or env var at build time.
const PROD_BASE = "https://port-a-local.vercel.app";

let override: string | null = null;

export function setBaseUrl(url: string | null) {
  override = url;
}

export function getBaseUrl(): string {
  return override ?? PROD_BASE;
}

export function webUrl(path: string): string {
  const base = getBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function apiUrl(path: string): string {
  const base = getBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
