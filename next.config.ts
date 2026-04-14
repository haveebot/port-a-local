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
    ];
  },
};

export default nextConfig;
