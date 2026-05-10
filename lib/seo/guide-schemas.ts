import { SITE_URL } from "@/lib/site-config";

interface GuideSchemaOptions {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}

export function buildGuideArticleSchema({ title, description, path, datePublished, dateModified }: GuideSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: `${SITE_URL}${path}`,
    author: {
      "@type": "Organization",
      name: "WhatsApp Visualizer"
    },
    publisher: {
      "@type": "Organization",
      name: "WhatsApp Visualizer"
    },
    datePublished,
    dateModified
  };
}

export function buildGuideBreadcrumbSchema(title: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/guides`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}${path}`
      }
    ]
  };
}
