import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadScreen } from "@/components/whatsapp/upload-screen";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Private WhatsApp Chat Analyzer",
  description: "Upload your WhatsApp export ZIP and get deterministic, local-first analytics for activity, response patterns, and conversation insights.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "WhatsApp Visualizer - Private WhatsApp Chat Analyzer",
    description: "Deterministic WhatsApp analytics in your browser. No account required. Local-first processing.",
    url: SITE_URL
  }
};

export default function HomePage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WhatsApp Visualizer",
    applicationCategory: "AnalyticsApplication",
    operatingSystem: "Web",
    description: "Analyze WhatsApp exports locally with deterministic charts and explainable insights.",
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does WhatsApp Visualizer upload my chat data to the cloud?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. WhatsApp Visualizer processes uploaded chat exports locally in your browser session."
        }
      },
      {
        "@type": "Question",
        name: "Which file do I upload?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload the ZIP file exported from WhatsApp chat export."
        }
      },
      {
        "@type": "Question",
        name: "What analytics can I see?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can explore activity trends, participant balance, response behavior, content patterns, and advanced deterministic insights."
        }
      }
    ]
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AppHeader />

      <div className="container workspace-enter py-4">
        <UploadScreen />
      </div>
      <SiteFooter />
    </main>
  );
}
