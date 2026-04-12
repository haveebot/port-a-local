import type { Business } from "@/data/businesses";
import type { Story } from "@/data/stories";

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
        url: "https://portaransaslocal.com",
        description:
          "Your local guide to Port Aransas, TX. Vetted restaurants, lodging, activities, shops, services, and heritage content.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://portaransaslocal.com/gully?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
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
    url: `https://portaransaslocal.com/${business.category}/${business.slug}`,
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
        url: `https://portaransaslocal.com/history/${story.slug}`,
        datePublished: story.date,
        author: {
          "@type": "Organization",
          name: "Port A Local",
          url: "https://portaransaslocal.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Port A Local",
          url: "https://portaransaslocal.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://portaransaslocal.com/history/${story.slug}`,
        },
        keywords: story.tags.join(", "),
        articleSection: "Port A Heritage",
        inLanguage: "en-US",
      }}
    />
  );
}
