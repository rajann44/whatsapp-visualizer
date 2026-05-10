import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "WhatsApp Word and Link Analysis Guide";
const path = "/guides/whatsapp-word-and-link-analysis";
const description =
  "Analyze word usage and shared links in WhatsApp chats to understand communication topics and information flow.";

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

export default function WhatsAppWordAndLinkAnalysisPage() {
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
        description="Use content-focused metrics to evaluate recurring terms, link sharing behavior, and topic intensity over time."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) What content metrics reveal",
            body: (
              <>
                <p>Word frequency and link counts reveal what topics dominate and how often external references are shared.</p>
                <p>These are useful for understanding conversation intent beyond raw message volume.</p>
              </>
            )
          },
          {
            heading: "2) Compare terms by time period",
            body: (
              <>
                <p>Filter by date range to detect shifts in language before and after events, launches, or milestones.</p>
                <p>Look for recurring term clusters rather than isolated one-off words.</p>
              </>
            )
          },
          {
            heading: "3) Evaluate link-sharing patterns",
            body: (
              <>
                <p>Link density can indicate research-heavy discussions, planning periods, or decision-making phases.</p>
                <p>Analyze link spikes alongside response-time and activity charts for context.</p>
              </>
            )
          },
          {
            heading: "4) Avoid overinterpreting single words",
            body: (
              <>
                <p>Single high-frequency words may not carry clear meaning without phrase or timeframe context.</p>
                <p>Pair content metrics with participant and timeline views for more reliable interpretation.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Upload and inspect content charts from <Link href="/" className="underline">the homepage</Link>.
                </p>
                <p>
                  Then compare with <Link href="/guides/whatsapp-date-range-comparison" className="underline">date range analysis</Link> to track topic change over time.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
