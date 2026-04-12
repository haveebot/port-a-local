import { MetadataRoute } from "next";
import { getAllBusinessSlugs } from "@/data/businesses";
import { stories } from "@/data/stories";

const BASE_URL = "https://portaransaslocal.com";

const CATEGORY_SLUGS = ["eat", "drink", "stay", "do", "fish", "shop"];

const PORTAL_SLUGS = ["services", "rent", "beach", "maintenance"];

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const portalEntries: MetadataRoute.Sitemap = PORTAL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const businessEntries: MetadataRoute.Sitemap = getAllBusinessSlugs().map(
    ({ category, slug }) => ({
      url: `${BASE_URL}/${category}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const storyEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/history`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...stories
      .filter((s) => s.published)
      .map((story) => ({
        url: `${BASE_URL}/history/${story.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...portalEntries,
    ...storyEntries,
    ...categoryEntries,
    ...businessEntries,
  ];
}
