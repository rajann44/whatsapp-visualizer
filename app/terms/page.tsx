import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for WhatsApp Visualizer.",
  alternates: {
    canonical: "/terms"
  }
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="container flex-1 py-10">
        <article className="mx-auto max-w-3xl space-y-5 text-sm text-muted-foreground">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Use</h1>
          <p>WhatsApp Visualizer is provided as-is for personal analytics and exploration. You are responsible for ensuring you have rights to analyze any exported data you upload.</p>
          <p>The app provides deterministic statistical summaries and does not provide medical, legal, or relationship advice.</p>
          <p>We may update features and documentation over time. Continued use means you accept the latest terms.</p>
          <p>If you do not agree with these terms, do not use the application.</p>
          <p>Last updated: May 2026.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
