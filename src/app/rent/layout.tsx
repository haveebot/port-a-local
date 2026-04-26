import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Golf Cart Rentals in Port Aransas, TX — Port A Local",
  description:
    "Reserve a golf cart for your Port Aransas trip through the local vendor marketplace. Pickup or delivery (vendor's call), 5-day minimum, minimum $20 off standard rates. Book in minutes.",
};

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
