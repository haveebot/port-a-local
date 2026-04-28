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
    // Icon stack ordered from most-preferred to least, with proper
    // sizes/purposes so Android Chrome + iOS Safari + the install
    // card each pick the right one. Solid navy bg on every PNG —
    // transparent backgrounds were rendering as blank PWA tiles.
    icons: [
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
