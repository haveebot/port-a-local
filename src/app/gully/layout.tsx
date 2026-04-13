import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gully — Just Gully It | Port A Local",
  description:
    "Search everything in Port Aransas. 140+ businesses, 17 heritage stories, menus, happy hours, and more. Just Gully It.",
};

export default function GullyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
