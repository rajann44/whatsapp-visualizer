import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "WhatsApp Response Time Analysis Guide";
const path = "/guides/whatsapp-response-time-analysis";
const description =
  "Learn how to measure WhatsApp response time trends, median reply speed, and communication rhythm with practical interpretation tips.";

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

export default function WhatsAppResponseTimeAnalysisPage() {
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
        description="Use this playbook to evaluate reply latency patterns and understand whether communication is getting faster, slower, or more uneven over time."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) What response time means",
            body: (
              <>
                <p>Response time is the delay between a message from one participant and the next reply from another participant.</p>
                <p>It helps you understand conversation rhythm, engagement consistency, and latency shifts between phases of a relationship or project.</p>
              </>
            )
          },
          {
            heading: "2) Use median over average",
            body: (
              <>
                <p>Prefer median response time because averages can be distorted by a few very long gaps such as sleep or travel.</p>
                <p>Compare median values by month or quarter to identify meaningful trend direction.</p>
              </>
            )
          },
          {
            heading: "3) Segment by weekday and time window",
            body: (
              <>
                <p>Response behavior often changes across weekdays, weekends, and late-night hours. Segment before drawing conclusions.</p>
                <p>Use date and day filters in WhatsApp Visualizer to evaluate each segment separately.</p>
              </>
            )
          },
          {
            heading: "4) Read direction, not one-off spikes",
            body: (
              <>
                <p>Single events can create spikes. Focus on sustained shifts over multiple windows rather than one isolated week.</p>
                <p>Pair response-time trends with message volume to avoid misreading quiet periods as low engagement.</p>
              </>
            )
          },
          {
            heading: "5) Keep interpretation contextual",
            body: (
              <>
                <p>Reply delay is a statistical signal, not a complete explanation. Context like schedules, timezone, and work periods matters.</p>
                <p>Use response metrics as directional guidance alongside broader activity and participation indicators.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Start from <Link href="/" className="underline">the analyzer homepage</Link> to upload your ZIP and open insights.
                </p>
                <p>
                  Continue with <Link href="/guides/whatsapp-chat-analysis-guide" className="underline">the full WhatsApp chat analysis guide</Link> for an end-to-end workflow.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
