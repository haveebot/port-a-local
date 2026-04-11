import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Golf Cart Rentals in Port Aransas, TX — Port A Local",
  description:
    "Reserve a golf cart in Port Aransas, Texas. 4, 6, and 8-passenger carts delivered to your location. Book through Port A Local — our local team handles everything.",
};

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
