import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "WhatsApp Date Range Comparison Guide";
const path = "/guides/whatsapp-date-range-comparison";
const description =
  "Compare WhatsApp analytics across two periods to identify trend shifts in activity, response behavior, and participation.";

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

export default function WhatsAppDateRangeComparisonPage() {
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
        description="Use controlled date windows to compare communication behavior before and after key milestones, decisions, or events."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Define two comparable windows",
            body: (
              <>
                <p>Choose windows of similar length for fair comparison, such as 30 days before vs 30 days after an event.</p>
                <p>Aligned time ranges reduce noise and improve interpretability.</p>
              </>
            )
          },
          {
            heading: "2) Compare activity and response first",
            body: (
              <>
                <p>Start with message volume and response-time shifts to detect core behavior changes quickly.</p>
                <p>Then examine participant and content changes for root-cause context.</p>
              </>
            )
          },
          {
            heading: "3) Look for sustained direction",
            body: (
              <>
                <p>Short spikes can be event-specific. Reliable conclusions come from persistent directional shifts across metrics.</p>
                <p>Use multiple adjacent windows if your chat is highly seasonal or cyclical.</p>
              </>
            )
          },
          {
            heading: "4) Record interpretation notes",
            body: (
              <>
                <p>Document what changed, by how much, and what likely contextual factors explain the shift.</p>
                <p>This helps avoid subjective hindsight when revisiting data later.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Upload your export at <Link href="/" className="underline">the analyzer home</Link> and apply date filters.
                </p>
                <p>
                  Follow with <Link href="/guides/whatsapp-response-time-analysis" className="underline">response-time analysis</Link> for deeper timing diagnostics.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
