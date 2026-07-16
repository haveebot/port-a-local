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

      // bronsbeach.com serves ONLY the Bron's dashboard. Every path except the
      // dashboard itself (/brons), its API (/api/brons), and assets (_next,
      // favicon) redirects to /brons — so the domain never exposes PAL's own
      // pages. Host-gated: this rule cannot affect theportalocal.com.
      {
        source: "/:path((?!brons|api|_next|favicon).*)",
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
