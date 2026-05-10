import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "How to Read WhatsApp Chat Activity Heatmaps";
const path = "/guides/whatsapp-chat-activity-heatmap";
const description =
  "A practical guide to interpreting WhatsApp activity heatmaps by hour and weekday to identify high-engagement communication windows.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: path
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}${path}`
  }
};

export default function WhatsAppChatActivityHeatmapPage() {
  const articleSchema = buildGuideArticleSchema({
    title,
    description,
    path,
    datePublished: "2026-05-11",
    dateModified: "2026-05-11"
  });
  const breadcrumbSchema = buildGuideBreadcrumbSchema(title, path);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <LandingPageTemplate
        title={title}
        description="Use activity heatmaps to find when conversations are most active and plan outreach, updates, or follow-ups at high-response times."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Understand heatmap intensity",
            body: (
              <>
                <p>Darker cells indicate higher message frequency in a specific day-hour slot. Lighter cells represent lower activity windows.</p>
                <p>This gives a fast visual map of communication density across the week.</p>
              </>
            )
          },
          {
            heading: "2) Separate routine from anomalies",
            body: (
              <>
                <p>Recurring dark patterns suggest routine behavior. Isolated spikes often correspond to exceptional events or deadlines.</p>
                <p>Make decisions from recurring zones rather than one-off anomalies.</p>
              </>
            )
          },
          {
            heading: "3) Identify high-response windows",
            body: (
              <>
                <p>Find overlapping high-activity slots where participants are frequently present. These windows are usually best for important messages.</p>
                <p>Cross-reference with response-time metrics to confirm that activity also translates into timely replies.</p>
              </>
            )
          },
          {
            heading: "4) Use filters for period-specific analysis",
            body: (
              <>
                <p>Apply date filters to compare pre-event vs post-event periods, project phases, or seasonal changes in chat behavior.</p>
                <p>Heatmaps become more actionable when scoped to a focused time range.</p>
              </>
            )
          },
          {
            heading: "5) Combine with participant and content views",
            body: (
              <>
                <p>Heatmaps show when activity happens. Participant and content charts explain who drives it and what type of messages dominate.</p>
                <p>Use all three views together for a complete interpretation.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Run analysis from <Link href="/" className="underline">the homepage uploader</Link> and inspect heatmap patterns directly.
                </p>
                <p>
                  Pair this guide with <Link href="/guides/whatsapp-group-chat-analytics" className="underline">group chat analytics</Link> for participant context.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
