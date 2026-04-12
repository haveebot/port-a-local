import type { Metadata } from "next";
import "./globals.css";
import GullyPalette from "@/components/GullyPalette";

export const metadata: Metadata = {
  title: "Port A Local — Your Local Guide to Port Aransas, TX",
  description:
    "Discover vetted restaurants, lodging, activities, shops & services in Port Aransas, Texas. Every listing approved by locals. No paid placements.",
  openGraph: {
    title: "Port A Local — Your Local Guide to Port Aransas, TX",
    description:
      "Discover vetted restaurants, lodging, activities, shops & services in Port Aransas, Texas.",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <GullyPalette />
      </body>
    </html>
  );
}
