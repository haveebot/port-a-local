import type { Metadata } from "next";

/**
 * Bron's Beach Rentals — clean layout, no PAL chrome.
 *
 * Served at bronsbeach.com via middleware host-routing rewrite.
 * No Navigation, no Footer, no PAL header — just Bron's brand surface.
 * The root layout still wraps html/body globally; this layout just
 * suppresses any per-section PAL chrome and lays out the Bron's
 * surface cleanly.
 *
 * Design language: warm sand + ocean blue + a single coral accent.
 * Casual, friendly, island-vibes — matches Bron's site voice
 * ("the friendliest golf cart rental in town"). NOT PAL editorial.
 */

export const metadata: Metadata = {
  title: "Bron's Beach Rentals",
  description:
    "Beach rentals in Port Aransas — chairs, umbrellas, cabanas, coolers. Setup and pickup handled. Reserve in 30 seconds.",
};

export default function BronsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5efe2] text-[#1a3a52]">
      {children}
    </div>
  );
}
