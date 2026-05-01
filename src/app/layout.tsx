import type { Metadata, Viewport } from "next";
import "./globals.css";
import GullyPalette from "@/components/GullyPalette";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import EmergencyBanner from "@/components/EmergencyBanner";
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
  // Fetch active alert at the layout level so we can set a CSS
  // variable that pushes the fixed Navigation down by the banner's
  // approximate height. ~76px covers the warning/critical heights;
  // mobile may add a line for long messages — overestimate slightly
  // to avoid the nav cutting into the banner text.
  const activeAlert = await getActiveAlert().catch(() => null);
  const bannerHeight = activeAlert ? "76px" : "0px";

  return (
    <html lang="en">
      <head>
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body
        className="font-sans antialiased"
        style={
          {
            "--pal-banner-h": bannerHeight,
            // Push normal-flow page content down by the banner height
            // so hero pills + section eyebrows don't collide with the
            // shifted-down fixed Navigation. Banner + Nav are both
            // fixed (out of flow) — this padding only affects {children}.
            paddingTop: "var(--pal-banner-h)",
          } as React.CSSProperties
        }
      >
        {/* Site-wide emergency banner. Renders nothing when no
            active alert (dormant baseline). Fixed at top-0 z-[55],
            above Navigation (z-50). When active, layout sets
            --pal-banner-h CSS var which Navigation reads to shift
            its fixed top down. */}
        <EmergencyBanner />
        {children}
        <GullyPalette />
        <VisitorHeartbeat />
        <AnalyticsWrapper />
        <SpeedInsights />
      </body>
    </html>
  );
}
