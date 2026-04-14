import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Port A Local",
    short_name: "PAL",
    description:
      "Your local guide to Port Aransas, TX. Heritage, dispatch, and everything on the island.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1120",
    theme_color: "#0b1120",
    orientation: "portrait",
    categories: ["travel", "lifestyle", "news"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logos/lighthouse-full.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
