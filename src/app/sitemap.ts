import { MetadataRoute } from "next";
import { getAllBusinessSlugs } from "@/data/businesses";

const BASE_URL = "https://port-a-local.vercel.app";

const CATEGORY_SLUGS = ["eat", "drink", "stay", "do", "fish", "shop"];

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const businessEntries: MetadataRoute.Sitemap = getAllBusinessSlugs().map(
    ({ category, slug }) => ({
      url: `${BASE_URL}/${category}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...categoryEntries,
    ...businessEntries,
  ];
}
