import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Version history and notable product updates.",
  alternates: {
    canonical: "/changelog"
  }
};

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="container flex-1 py-10">
        <article className="mx-auto max-w-3xl space-y-6 text-sm text-muted-foreground">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Changelog</h1>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">v1.0.0 - Public launch baseline</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Two-step flow: upload home and dedicated insights workspace.</li>
              <li>Apple HIG-inspired charting with responsive heatmap and reduced-motion support.</li>
              <li>Filter/export sheets, local privacy messaging, and deterministic advanced insights.</li>
              <li>Sample dataset mode for first-time exploration.</li>
              <li>User-facing privacy, terms, and go-live safety pages.</li>
            </ul>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
