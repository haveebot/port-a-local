import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Photos — Port Aransas Through Your Eyes | Port A Local",
  description:
    "Share your Port Aransas photos. Community-submitted gallery of sunsets, beaches, fishing, wildlife, and island life. No account needed.",
};

export default function PhotosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
