import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beach Rentals in Port Aransas, TX — Port A Local",
  description:
    "Book a beach cabana or chair & umbrella setup in Port Aransas, Texas. We deliver directly to your spot on the sand. Reserve through Port A Local.",
};

export default function BeachLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
