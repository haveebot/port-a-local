import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gully — Just Gully It | Port A Local",
  description:
    "Search everything in Port Aransas. 140+ businesses, 23 heritage stories, menus, happy hours, events, and dispatch coverage. Just Gully It.",
};

export default function GullyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
