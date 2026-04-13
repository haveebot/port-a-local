import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Trip — Saved Spots | Port A Local",
  description:
    "Your saved Port Aransas spots. Bookmark businesses and heritage stories as you browse — no account needed. Plan your trip in one place.",
};

export default function MyTripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
