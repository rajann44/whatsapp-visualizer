import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "WhatsApp Participant Share Analysis Guide";
const path = "/guides/whatsapp-participant-share-analysis";
const description =
  "Understand how to interpret participant message share, dominance patterns, and balance in one-to-one or group chats.";

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

export default function WhatsAppParticipantShareAnalysisPage() {
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
        description="Use participant share metrics to identify communication balance, leadership patterns, and contribution skew in chats."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Read participant share correctly",
            body: (
              <>
                <p>Participant share represents each person&apos;s proportion of total messages in the selected range.</p>
                <p>High share may mean leadership, coordination, or imbalance depending on context.</p>
              </>
            )
          },
          {
            heading: "2) Evaluate trend over time",
            body: (
              <>
                <p>Single-period share can mislead. Compare multiple windows to detect stable patterns or temporary spikes.</p>
                <p>Sustained concentration can indicate structural communication imbalance.</p>
              </>
            )
          },
          {
            heading: "3) Cross-check with response behavior",
            body: (
              <>
                <p>High message share combined with slow responses from others may signal one-way updates rather than dialogue.</p>
                <p>Balanced share with healthy response loops usually indicates stronger reciprocal communication.</p>
              </>
            )
          },
          {
            heading: "4) Segment by topic or period",
            body: (
              <>
                <p>Use date filters to isolate events, projects, or specific phases. Share patterns can vary strongly by context.</p>
                <p>Actionable decisions come from scoped analysis, not only full-history totals.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Start at <Link href="/" className="underline">WhatsApp Visualizer</Link> and inspect participant charts.
                </p>
                <p>
                  Combine with <Link href="/guides/whatsapp-group-chat-analytics" className="underline">group chat analytics</Link> for multi-person context.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
