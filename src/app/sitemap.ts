import { MetadataRoute } from "next";
import { getAllBusinessSlugs } from "@/data/businesses";
import { stories } from "@/data/stories";
import { dispatches } from "@/data/dispatches";
import { guides } from "@/data/guides";
import { events } from "@/data/events";

const BASE_URL = "https://theportalocal.com";

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

  const eventEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/events/tournament-season`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    ...events
      .filter((e) => e.published)
      .map((e) => ({
        url: `${BASE_URL}/events/${e.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      })),
  ];

  const dispatchEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/dispatch`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...dispatches
      .filter((d) => d.published)
      .map((d) => ({
        url: `${BASE_URL}/dispatch/${d.slug}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : new Date(d.date),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];

  const CONTENT_PAGES = [
    "gully", "guides", "live", "live-music", "essentials", "events",
    "fishing-report", "where-to-stay", "photos", "archives", "map", "my-trip",
  ];

  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const contentEntries: MetadataRoute.Sitemap = CONTENT_PAGES.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...portalEntries,
    ...storyEntries,
    ...dispatchEntries,
    ...eventEntries,
    ...contentEntries,
    ...guideEntries,
    ...categoryEntries,
    ...businessEntries,
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
