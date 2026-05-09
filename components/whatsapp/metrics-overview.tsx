import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { type AnalyticsResult } from "@/lib/whatsapp/analytics";

interface MetricsOverviewProps {
  analytics: AnalyticsResult;
}

const fmtDate = (value?: Date): string => (value ? format(value, "dd MMM yyyy") : "-");

export function MetricsOverview({ analytics }: MetricsOverviewProps) {
  const cards = [
    { label: "Total messages", value: formatNumber(analytics.totalMessages) },
    { label: "Participants", value: formatNumber(analytics.participants.length) },
    { label: "Current streak", value: `${analytics.streaks.currentDays} days` },
    { label: "Longest streak", value: `${analytics.streaks.longestDays} days` },
    { label: "First message", value: fmtDate(analytics.firstMessageAt) },
    { label: "Last message", value: fmtDate(analytics.lastMessageAt) },
    { label: "Median length", value: `${analytics.messageLength.p50} chars` },
    { label: "P90 length", value: `${analytics.messageLength.p90} chars` }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 45}ms` }}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[1.7rem] font-semibold tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
