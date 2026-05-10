export interface GuideEntry {
  title: string;
  href: string;
  summary: string;
}

export const GUIDE_ENTRIES: GuideEntry[] = [
  {
    title: "How to Analyze WhatsApp Chat Exports",
    href: "/guides/whatsapp-chat-analysis-guide",
    summary: "Export a ZIP, upload correctly, and interpret key analytics responsibly."
  },
  {
    title: "WhatsApp Response Time Analysis Guide",
    href: "/guides/whatsapp-response-time-analysis",
    summary: "Measure reply latency trends and evaluate communication rhythm over time."
  },
  {
    title: "WhatsApp Group Chat Analytics Guide",
    href: "/guides/whatsapp-group-chat-analytics",
    summary: "Understand participation concentration, group momentum, and engagement patterns."
  },
  {
    title: "How to Read WhatsApp Chat Activity Heatmaps",
    href: "/guides/whatsapp-chat-activity-heatmap",
    summary: "Interpret day-hour activity density and identify high-response windows."
  },
  {
    title: "WhatsApp Export Without Media Guide",
    href: "/guides/whatsapp-export-without-media",
    summary: "Export lighter ZIP files and still preserve message analytics quality."
  },
  {
    title: "WhatsApp Word and Link Analysis Guide",
    href: "/guides/whatsapp-word-and-link-analysis",
    summary: "Use content metrics to understand language patterns, links, and topic signals."
  },
  {
    title: "WhatsApp Participant Share Analysis Guide",
    href: "/guides/whatsapp-participant-share-analysis",
    summary: "Compare contribution share, dominance patterns, and participant balance."
  },
  {
    title: "WhatsApp Date Range Comparison Guide",
    href: "/guides/whatsapp-date-range-comparison",
    summary: "Compare two time windows to identify communication changes and trend shifts."
  },
  {
    title: "Fix WhatsApp Export ZIP Upload Errors",
    href: "/guides/fix-whatsapp-export-zip-errors",
    summary: "Resolve common upload issues and parse failures before running analysis."
  }
];

export function getRelatedGuides(currentHref: string, limit = 5): GuideEntry[] {
  return GUIDE_ENTRIES.filter((guide) => guide.href !== currentHref).slice(0, limit);
}
