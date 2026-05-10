import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "WhatsApp Group Chat Analytics Guide";
const path = "/guides/whatsapp-group-chat-analytics";
const description =
  "Understand WhatsApp group chat patterns including participation balance, activity spikes, and engagement concentration.";

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

export default function WhatsAppGroupChatAnalyticsPage() {
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
        description="Learn how to evaluate group dynamics in WhatsApp using participant balance, posting concentration, and time-based activity analysis."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Start with participation distribution",
            body: (
              <>
                <p>Check how message share is distributed across participants. A highly concentrated distribution can indicate a few dominant voices.</p>
                <p>Look for balanced contribution if your goal is broad group engagement.</p>
              </>
            )
          },
          {
            heading: "2) Identify activity peaks and triggers",
            body: (
              <>
                <p>Use day and hour trends to find when group activity spikes. Peaks often align with announcements, events, or deadlines.</p>
                <p>These windows are useful for scheduling updates when attention is highest.</p>
              </>
            )
          },
          {
            heading: "3) Compare participant consistency",
            body: (
              <>
                <p>Some members post in bursts, others steadily. Consistency reveals who sustains momentum vs. who joins only during key moments.</p>
                <p>Measure over longer windows to avoid overfitting short-term behavior.</p>
              </>
            )
          },
          {
            heading: "4) Analyze response and follow-up patterns",
            body: (
              <>
                <p>Fast responses and dense back-and-forth indicate active discussion loops. Long response gaps may signal low message salience.</p>
                <p>Pair response metrics with participation data to understand if the whole group is engaged or only a subset.</p>
              </>
            )
          },
          {
            heading: "5) Use filters for actionable slices",
            body: (
              <>
                <p>Filter by date ranges, participants, and content type to isolate campaign windows, project phases, or event-specific discussions.</p>
                <p>Actionable insights come from focused slices, not only aggregate totals.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Open <Link href="/" className="underline">WhatsApp Visualizer</Link> to upload and inspect group-level charts.
                </p>
                <p>
                  Read <Link href="/guides/whatsapp-response-time-analysis" className="underline">response time analysis</Link> to complement group participation with timing insights.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
