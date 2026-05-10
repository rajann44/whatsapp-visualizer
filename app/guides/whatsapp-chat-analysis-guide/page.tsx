import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "How to Analyze WhatsApp Chat Exports",
  description:
    "A practical guide to exporting WhatsApp chats and understanding activity, response, and participation insights using WhatsApp Visualizer.",
  alternates: {
    canonical: "/guides/whatsapp-chat-analysis-guide"
  },
  openGraph: {
    title: "How to Analyze WhatsApp Chat Exports",
    description:
      "Export your WhatsApp chat, upload the ZIP, and read deterministic conversation analytics with confidence.",
    url: `${SITE_URL}/guides/whatsapp-chat-analysis-guide`
  }
};

export default function WhatsAppChatAnalysisGuidePage() {
  const title = "How to Analyze WhatsApp Chat Exports";
  const path = "/guides/whatsapp-chat-analysis-guide";
  const description =
    "A practical guide to exporting WhatsApp chats and understanding activity, response, and participation insights using WhatsApp Visualizer.";
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
        description="Use this workflow to export your chat history correctly and interpret metrics like message volume, response rhythm, and participation balance."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Export your chat from WhatsApp",
            body: (
              <>
                <p>Open the chat, go to the chat menu, and choose Export chat. Save the generated ZIP file to your device.</p>
                <p>
                  For official instructions, use WhatsApp&apos;s guide: <a className="underline" href="https://faq.whatsapp.com/1180414079177245/" target="_blank" rel="noreferrer">How to export your chat history</a>.
                </p>
              </>
            )
          },
          {
            heading: "2) Upload and review overview metrics",
            body: (
              <>
                <p>Upload the ZIP on the homepage. The overview section gives a quick read on total messages, active periods, and headline trends.</p>
                <p>Start with broad patterns before drilling into advanced sections.</p>
              </>
            )
          },
          {
            heading: "3) Understand key chart groups",
            body: (
              <>
                <p>Activity charts show daily and monthly direction. People charts explain participation and response behavior. Content charts summarize links, words, and media composition.</p>
                <p>Use filters to scope findings by participant, date window, or message type.</p>
              </>
            )
          },
          {
            heading: "4) Interpret results responsibly",
            body: (
              <>
                <p>These are deterministic statistical indicators, not emotional or clinical diagnostics. Use them to discover communication patterns, not to draw absolute conclusions.</p>
                <p>Cross-check any major insight with timeframe and context before acting on it.</p>
              </>
            )
          },
          {
            heading: "5) Privacy model",
            body: (
              <>
                <p>WhatsApp Visualizer is local-first. Uploaded data is processed in your browser session and can be cleared at any time from the workspace.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  <Link href="/" className="underline">Open the analyzer</Link> to upload a ZIP and start analysis.
                </p>
                <p>
                  Read our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/terms" className="underline">Terms of Use</Link> for data handling and usage boundaries.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
