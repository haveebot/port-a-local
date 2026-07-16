import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(www\\.)?portaransaslocal\\.com",
          },
        ],
        destination: "https://theportalocal.com/:path*",
        permanent: true,
      },

      // bronsbeach.com → the Bron's team dashboard. The root lands on /brons
      // (which middleware gates to /brons/login until they authenticate).
      {
        source: "/",
        has: [{ type: "host", value: "(www\\.)?bronsbeach\\.com" }],
        destination: "/brons",
        permanent: false,
      },

      // Cart-rental shops removed 2026-04-30 — bookable only via /rent
      // (PAL marketplace). Catches direct slug links + any /[category]/[slug]
      // bookmarks tourists or partners may have stashed.
      {
        source: "/do/port-a-beach-buggies",
        destination: "/rent",
        permanent: true,
      },
      {
        source: "/do/island-surf-rentals",
        destination: "/rent",
        permanent: true,
      },
      {
        source: "/do/island-outfitters",
        destination: "/rent",
        permanent: true,
      },
      {
        source: "/services/joy-cart-rentals",
        destination: "/rent",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
