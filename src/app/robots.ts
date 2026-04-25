import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/wheelhouse"],
    },
    sitemap: "https://theportalocal.com/sitemap.xml",
  };
}
