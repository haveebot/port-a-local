import type { Business } from "@/data/businesses";
import type { Story } from "@/data/stories";
import type { Dispatch } from "@/data/dispatches";

const SITE = "https://theportalocal.com";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Port A Local",
        url: "https://theportalocal.com",
        description:
          "Your local guide to Port Aransas, TX. Vetted restaurants, lodging, activities, shops, services, and heritage content.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://theportalocal.com/gully?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Port A Local",
        alternateName: "PAL",
        url: "https://theportalocal.com",
        logo: "https://theportalocal.com/logos/lighthouse-full.svg",
        description:
          "Port Aransas's local directory and editorial platform. Heritage, dispatch, wayfinding. Not a tourism bureau.",
        foundingDate: "2026",
        email: "hello@theportalocal.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Port Aransas",
          addressRegion: "TX",
          postalCode: "78373",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 27.8339,
          longitude: -97.0611,
        },
      }}
    />
  );
}

export function LocalBusinessSchema({ business }: { business: Business }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.split(",")[0]?.trim(),
      addressLocality: "Port Aransas",
      addressRegion: "TX",
      postalCode: "78373",
      addressCountry: "US",
    },
    url: `https://theportalocal.com/${business.category}/${business.slug}`,
  };

  if (business.phone) {
    data.telephone = business.phone;
  }

  if (business.website) {
    data.sameAs = business.website;
  }

  if (business.priceRange) {
    data.priceRange = business.priceRange;
  }

  if (business.hoursOfOperation) {
    const dayMap: Record<string, string> = {
      Monday: "Mo",
      Tuesday: "Tu",
      Wednesday: "We",
      Thursday: "Th",
      Friday: "Fr",
      Saturday: "Sa",
      Sunday: "Su",
    };

    const specs = Object.entries(business.hoursOfOperation)
      .filter(([, hours]) => hours !== "Closed")
      .map(([day, hours]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayMap[day] || day,
        opens: hours.split("–")[0]?.trim() || hours.split("-")[0]?.trim(),
        closes: hours.split("–")[1]?.trim() || hours.split("-")[1]?.trim(),
      }));

    if (specs.length > 0) {
      data.openingHoursSpecification = specs;
    }
  }

  return <JsonLd data={data} />;
}

export function ArticleSchema({ story }: { story: Story }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: story.title,
        description: story.description,
        url: `https://theportalocal.com/history/${story.slug}`,
        datePublished: story.date,
        author: {
          "@type": "Organization",
          name: "Port A Local",
          url: "https://theportalocal.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Port A Local",
          url: "https://theportalocal.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://theportalocal.com/history/${story.slug}`,
        },
        keywords: story.tags.join(", "),
        articleSection: "Port A Heritage",
        inLanguage: "en-US",
      }}
    />
  );
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageSchema({ items }: { items: FAQItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  path?: string;
}

export function BreadcrumbListSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => {
          const entry: Record<string, unknown> = {
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
          };
          if (item.path) {
            entry.item = `${SITE}${item.path}`;
          }
          return entry;
        }),
      }}
    />
  );
}

export interface ItemListEntry {
  name: string;
  url: string;
  description?: string;
}

export function ItemListSchema({
  name,
  description,
  items,
}: {
  name: string;
  description?: string;
  items: ItemListEntry[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        ...(description ? { description } : {}),
        numberOfItems: items.length,
        itemListElement: items.map((entry, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: entry.name,
          url: entry.url,
          ...(entry.description ? { description: entry.description } : {}),
        })),
      }}
    />
  );
}

export function PlaceSchema({
  name,
  description,
  latitude,
  longitude,
  url,
  type = "Place",
}: {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  url?: string;
  type?: "Place" | "TouristAttraction" | "LandmarksOrHistoricalBuildings";
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Port Aransas",
      addressRegion: "TX",
      postalCode: "78373",
      addressCountry: "US",
    },
  };
  if (description) data.description = description;
  if (url) data.url = url;
  if (latitude !== undefined && longitude !== undefined) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }
  return <JsonLd data={data} />;
}

export function DispatchSchema({ dispatch }: { dispatch: Dispatch }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: dispatch.title,
        description: dispatch.description,
        url: `https://theportalocal.com/dispatch/${dispatch.slug}`,
        datePublished: dispatch.date,
        dateModified: dispatch.updatedAt || dispatch.date,
        author: {
          "@type": "Organization",
          name: "Port A Local",
          url: "https://theportalocal.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Port A Local",
          url: "https://theportalocal.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://theportalocal.com/dispatch/${dispatch.slug}`,
        },
        keywords: dispatch.tags.join(", "),
        articleSection: "Dispatch",
        inLanguage: "en-US",
      }}
    />
  );
}
