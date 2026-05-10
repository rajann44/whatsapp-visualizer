import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/insights",
    "/privacy",
    "/terms",
    "/changelog",
    "/guides",
    "/guides/whatsapp-chat-analysis-guide",
    "/guides/whatsapp-response-time-analysis",
    "/guides/whatsapp-group-chat-analytics",
    "/guides/whatsapp-chat-activity-heatmap",
    "/guides/whatsapp-export-without-media",
    "/guides/whatsapp-word-and-link-analysis",
    "/guides/whatsapp-participant-share-analysis",
    "/guides/whatsapp-date-range-comparison",
    "/guides/fix-whatsapp-export-zip-errors"
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/guides/") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/guides/") ? 0.8 : 0.7
  }));
}
