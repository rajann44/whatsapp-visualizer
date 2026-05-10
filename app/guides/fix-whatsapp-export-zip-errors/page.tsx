import type { Metadata } from "next";
import Link from "next/link";

import { LandingPageTemplate } from "@/components/seo/landing-page-template";
import { getRelatedGuides } from "@/lib/seo/guides";
import { buildGuideArticleSchema, buildGuideBreadcrumbSchema } from "@/lib/seo/guide-schemas";
import { SITE_URL } from "@/lib/site-config";

const title = "Fix WhatsApp Export ZIP Upload Errors";
const path = "/guides/fix-whatsapp-export-zip-errors";
const description =
  "Troubleshoot common WhatsApp export ZIP upload issues including invalid files, parse failures, and unsupported archive structures.";

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

export default function FixWhatsAppExportZipErrorsPage() {
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
        description="Use this checklist to quickly resolve upload problems and ensure your WhatsApp export archive can be parsed correctly."
        relatedGuides={getRelatedGuides(path)}
        sections={[
          {
            heading: "1) Confirm file type and source",
            body: (
              <>
                <p>Upload the ZIP produced directly by WhatsApp export. Renamed files or re-zipped folders can break expected structure.</p>
                <p>Ensure the file extension is `.zip` and not a cloud placeholder file.</p>
              </>
            )
          },
          {
            heading: "2) Re-export if structure is invalid",
            body: (
              <>
                <p>If parsing fails repeatedly, generate a fresh export from WhatsApp and avoid manual edits inside the archive.</p>
                <p>Use export without media if large size creates browser or device memory pressure.</p>
              </>
            )
          },
          {
            heading: "3) Check language and encoding consistency",
            body: (
              <>
                <p>Some edge-case locale or encoding combinations can reduce parse success when text is transformed by external tools.</p>
                <p>A clean, untouched WhatsApp export usually resolves this.</p>
              </>
            )
          },
          {
            heading: "4) Retry in a fresh browser session",
            body: (
              <>
                <p>Reload the page and upload again to clear transient in-memory state. If needed, try another modern browser.</p>
                <p>For very large files, close heavy tabs before re-uploading.</p>
              </>
            )
          },
          {
            heading: "Related pages",
            body: (
              <>
                <p>
                  Return to <Link href="/" className="underline">the upload page</Link> and retry with a fresh export ZIP.
                </p>
                <p>
                  Use <Link href="/guides/whatsapp-export-without-media" className="underline">export without media</Link> to reduce file size and improve upload reliability.
                </p>
              </>
            )
          }
        ]}
      />
    </>
  );
}
