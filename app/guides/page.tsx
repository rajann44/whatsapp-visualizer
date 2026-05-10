import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { GUIDE_ENTRIES } from "@/lib/seo/guides";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step guides for exporting WhatsApp chats and understanding analytics in WhatsApp Visualizer.",
  alternates: {
    canonical: "/guides"
  }
};

export default function GuidesIndexPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "WhatsApp Visualizer Guides",
    description: "Step-by-step guides for exporting WhatsApp chats and understanding analytics.",
    url: `${SITE_URL}/guides`
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <AppHeader />
      <main className="container flex-1 py-10">
        <article className="mx-auto max-w-3xl space-y-6 text-sm text-muted-foreground">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Guides</h1>
            <p className="text-base">Practical resources to help you export chats correctly and read analytics with confidence.</p>
          </header>

          {GUIDE_ENTRIES.map((guide) => (
            <section key={guide.href} className="rounded-xl border border-border/60 bg-card/70 p-4">
              <h2 className="text-lg font-semibold text-foreground">{guide.title}</h2>
              <p className="mt-2">{guide.summary}</p>
              <Link href={guide.href} className="mt-3 inline-flex font-medium text-accent underline-offset-2 hover:underline">
                Open guide
              </Link>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
