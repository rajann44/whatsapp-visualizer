"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { AnalyticsWorkspace } from "@/components/whatsapp/analytics-workspace";
import { useWorkspace } from "@/components/whatsapp/workspace-provider";

export default function InsightsPage() {
  const { result } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  return (
    <main>
      <AppHeader />
      <div className="container workspace-enter py-6 md:py-8">
        <AnalyticsWorkspace showUploader={false} />
      </div>
      <SiteFooter />
    </main>
  );
}
