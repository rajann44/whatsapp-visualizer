import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "WhatsApp Export Without Media Guide";
const path = "/guides/whatsapp-export-without-media";
const description =
  "Export WhatsApp chats without media to reduce ZIP size, speed up parsing, and keep message analytics focused.";

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

export default function WhatsAppExportWithoutMediaPage() {
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
        description="Use this method to create smaller export files that are easier to upload and still useful for message-driven analytics."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Why export without media",
            body: (
              <>
                <p>Media files significantly increase ZIP size and can slow upload or parsing on lower-resource devices.</p>
                <p>If your goal is message activity and response analytics, text-only exports are often enough.</p>
              </>
            )
          },
          {
            heading: "2) How to export",
            body: (
              <>
                <p>In WhatsApp, open chat settings and choose Export chat, then select the option without media files.</p>
                <p>
                  Follow WhatsApp&apos;s official instructions here: <a className="underline" href="https://faq.whatsapp.com/1180414079177245/" target="_blank" rel="noreferrer">Export chat history</a>.
                </p>
              </>
            )
          },
          {
            heading: "3) What analytics still work",
            body: (
              <>
                <p>Message count trends, response timing, participant share, and text-pattern analysis remain available.</p>
                <p>Only media-specific counts and distributions become less representative in text-only exports.</p>
              </>
            )
          },
          {
            heading: "4) When to include media instead",
            body: (
              <>
                <p>Include media if you need deeper media composition analysis or want to audit file-sharing behavior.</p>
                <p>For regular communication pattern analysis, no-media exports are generally faster and cleaner.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Begin with <Link href="/" className="underline">the main analyzer</Link> and upload your exported ZIP.
                </p>
                <p>
                  Pair this with <Link href="/guides/fix-whatsapp-export-zip-errors" className="underline">upload error troubleshooting</Link> if parsing fails.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
