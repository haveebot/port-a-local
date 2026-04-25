import type { Metadata, Viewport } from "next";
import "./globals.css";
import GullyPalette from "@/components/GullyPalette";
import { WebsiteSchema, OrganizationSchema } from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  alternates: {
    canonical: "https://theportalocal.com",
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body className="font-sans antialiased">
        {children}
        <GullyPalette />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
