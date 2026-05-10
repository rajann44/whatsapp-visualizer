import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How WhatsApp Visualizer handles data in a local-first workflow.",
  alternates: {
    canonical: "/privacy"
  }
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="container flex-1 py-10">
        <article className="mx-auto max-w-3xl space-y-5 text-sm text-muted-foreground">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
          <p>WhatsApp Visualizer processes your uploaded chat export locally in your browser session. We do not upload chat content to our servers.</p>
          <p>We store only interface preferences such as filters and active section in local browser storage so your workspace feels consistent on refresh.</p>
          <p>You can clear session data anytime from the insights workspace. When you close the tab, in-memory parsed chat data is removed.</p>
          <p>For support or privacy concerns, contact <a className="text-foreground underline" href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>.</p>
          <p>Last updated: May 2026.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
