import type { Metadata, Viewport } from "next";
import "./globals.css";
import GullyPalette from "@/components/GullyPalette";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import EmergencyBanner from "@/components/EmergencyBanner";
import PalBannerHeightSync from "@/components/PalBannerHeightSync";
import VisitorHeartbeat from "@/components/VisitorHeartbeat";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getActiveAlert } from "@/data/alerts-store";

export const metadata: Metadata = {
  metadataBase: new URL("https://theportalocal.com"),
  title: {
    default: "Port A Local — Your Local Guide to Port Aransas, TX",
    template: "%s | Port A Local",
  },
  description:
    "Discover vetted restaurants, lodging, activities, shops, services, and island heritage in Port Aransas, Texas. Every listing approved by locals. No paid placements.",
  applicationName: "Port A Local",
  keywords: [
    "Port Aransas",
    "Port A",
    "Mustang Island",
    "Texas coast",
    "local guide",
    "Port Aransas heritage",
    "Port Aransas restaurants",
    "Port Aransas rentals",
  ],
  authors: [{ name: "Port A Local" }],
  creator: "Port A Local",
  publisher: "Port A Local",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Port A Local — Your Local Guide to Port Aransas, TX",
    description:
      "The local guide. Heritage. Dispatch. Find what is on the island.",
    url: "https://theportalocal.com",
    siteName: "Port A Local",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Port A Local — Your Local Guide to Port Aransas, TX",
    description:
      "The local guide. Heritage. Dispatch. Find what is on the island.",
  },
  // NOTE: do NOT set alternates.canonical at the root layout — that
  // would cascade a homepage-canonical to every page on the site,
  // which is what just blew up FB OG previews for every Dispatch +
  // Heritage piece (FB followed the canonical to homepage and used
  // that page's OG instead of the actual page's). Per-page metadata
  // should set its own canonical when explicit canonicalization is
  // needed; otherwise the request URL is used (which is correct for
  // dispatch/heritage/event/business detail pages).
  category: "travel",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch active alert at the layout level so the body can opt-in
  // to a CSS class that drives the responsive banner-height var.
  // The banner wraps to multiple lines on mobile (where messages
  // run 2-3 lines tall) so we set --pal-banner-h via media query
  // in globals.css instead of a fixed inline px value.
  const activeAlert = await getActiveAlert().catch(() => null);

  return (
    <html lang="en">
      <head>
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body
        className={`font-sans antialiased ${activeAlert ? "pal-has-banner" : ""}`}
      >
        {/* Site-wide emergency banner. Renders nothing when no
            active alert (dormant baseline). Fixed at top-0 z-[55],
            above Navigation (z-50). When active, body has the
            .pal-has-banner class which sets a CSS-only fallback
            for --pal-banner-h; PalBannerHeightSync (client) then
            measures and writes the EXACT pixel height post-hydration
            so the nav offset matches the banner perfectly. */}
        <EmergencyBanner />
        {activeAlert && <PalBannerHeightSync />}
        {children}
        <GullyPalette />
        <VisitorHeartbeat />
        <AnalyticsWrapper />
        <SpeedInsights />
      </body>
    </html>
  );
}
