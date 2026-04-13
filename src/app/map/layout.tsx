import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Island Map — Port Aransas Businesses | Port A Local",
  description:
    "Interactive map of 140+ locally vetted businesses in Port Aransas, TX. Filter by category — restaurants, bars, hotels, shops, charters, and more.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
