import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import GullyPalette from "@/components/GullyPalette";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import EmergencyBanner from "@/components/EmergencyBanner";
import PalBannerHeightSync from "@/components/PalBannerHeightSync";
import VisitorHeartbeat from "@/components/VisitorHeartbeat";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";
import AttributionCapture from "@/components/AttributionCapture";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getActiveAlert } from "@/data/alerts-store";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://theportalocal.com"),
  title: {
    default: "Port A Local — Your Local Guide to Port Aransas, TX",
    // Template is "%s" (no suffix) because every page already manually
    // appends "| Port A Local" in its own title string. Adding it here
    // too would double-suffix everywhere ("...| Port A Local | Port A Local").
    template: "%s",
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
  // ROOT openGraph — only GLOBAL fields. Do NOT set title/description/url
  // here: Next.js treats fields nested inside openGraph as authoritative
  // and overrides per-page metadata that doesn't ALSO nest its own
  // openGraph block. Setting title/description/url at root caused every
  // page on the site to scrape with homepage OG values (FB preview cards
  // showed correct OG image but homepage title + description + URL).
  // Per-page title + description auto-derive into og:title + og:description
  // when this block has only the global keys. og:url uses the request URL.
  openGraph: {
    siteName: "Port A Local",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
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
        {/* Meta Pixel base script — fires PageView automatically on every
            page; helper functions in src/lib/metaPixel.ts fire specific
            events from page-level client components. Only renders when
            NEXT_PUBLIC_META_PIXEL_ID is set (production + preview); local
            dev without the env var stays clean. */}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
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
        <AttributionCapture />
        <VisitorHeartbeat />
        <AnalyticsWrapper />
        <SpeedInsights />
      </body>
    </html>
  );
}
