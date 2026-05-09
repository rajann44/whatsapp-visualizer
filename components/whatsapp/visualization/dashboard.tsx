"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ReferenceDot } from "recharts";

import {
  AppleHeatmap,
  AppleTooltip,
  ChartCard,
  ComparisonBarChart,
  MetricSummaryCard,
  TimelineChart,
  useReducedMotion
} from "@/components/whatsapp/visualization/chart-system";
import { InsightCallout } from "@/components/whatsapp/visualization/insight-callout";
import { MetricCard } from "@/components/whatsapp/visualization/metric-card";
import { SectionHeader } from "@/components/whatsapp/visualization/section-header";
import { type AnalyticsResult } from "@/lib/whatsapp/analytics";
import { clamp } from "@/lib/utils";
import { type ChatMessage } from "@/lib/whatsapp/types";
import { buildVisualizationViewModel } from "@/lib/whatsapp/visualization";

interface VisualizationDashboardProps {
  analytics: AnalyticsResult;
  filteredMessages: ChatMessage[];
  activeSection?: "overview" | "activity" | "people" | "content" | "patterns";
}

export function VisualizationDashboard({ analytics, filteredMessages, activeSection = "overview" }: VisualizationDashboardProps) {
  const reducedMotion = useReducedMotion();
  const view = buildVisualizationViewModel(analytics, filteredMessages);
  const dailyAverage = view.dailyTrend.length
    ? Math.round(view.dailyTrend.reduce((sum, entry) => sum + entry.count, 0) / view.dailyTrend.length)
    : 0;
  const monthlyDirection = view.monthlyTrend.length > 1
    ? view.monthlyTrend.at(-1)!.count - view.monthlyTrend[view.monthlyTrend.length - 2].count
    : 0;
  const peakHour = [...view.hourOfDay].sort((a, b) => b.count - a.count)[0];
  const topParticipant = view.participantMessages[0];
  const attachmentTop = view.attachmentComposition[0];
  const annotationCandidates = useMemo(() => {
    if (view.dailyTrend.length === 0) {
      return [] as Array<{ key: string; label: string; date: string; count: number }>;
    }
    const peak = [...view.dailyTrend].sort((a, b) => b.count - a.count)[0];
    const dip = [...view.dailyTrend].sort((a, b) => a.count - b.count)[0];
    const latest = view.dailyTrend.at(-1);
    return [
      peak ? { key: "peak", label: "Peak", date: peak.date, count: peak.count } : null,
      dip ? { key: "dip", label: "Dip", date: dip.date, count: dip.count } : null,
      latest ? { key: "latest", label: "Latest", date: latest.date, count: latest.count } : null
    ].filter((item): item is { key: string; label: string; date: string; count: number } => Boolean(item));
  }, [view.dailyTrend]);
  const [focusedPointKey, setFocusedPointKey] = useState<string>("latest");
  const focusedPoint = annotationCandidates.find((item) => item.key === focusedPointKey) ?? annotationCandidates[0];
  const monthlyLast = view.monthlyTrend.at(-1);

  return (
    <div className="space-y-12">
      <section className={`${activeSection === "overview" ? "space-y-4" : "hidden"}`}>
        <SectionHeader eyebrow="Overview" title="Top-level metrics" description="A fast snapshot of message volume, participation, and responsiveness." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {view.overview.map((metric) => (
            <MetricSummaryCard key={metric.label} label={metric.label} value={metric.value} context={metric.insight} trend={metric.trend} />
          ))}
        </div>
      </section>

      <section className={`${activeSection === "activity" ? "space-y-4" : "hidden"}`}>
        <SectionHeader eyebrow="Activity" title="How conversation evolves" description="Daily and monthly direction with time-of-day concentration." />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Daily activity"
            subtitle="Message count by day"
            footer={`Average ${dailyAverage} messages/day in current filter.`}
            ariaLabel="Daily activity line chart"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={view.dailyTrend} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={26} />
                  <YAxis tick={{ fontSize: 12 }} width={34} />
                  <Tooltip content={<AppleTooltip />} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2.2} dot={false} isAnimationActive={!reducedMotion} />
                  {focusedPoint && (
                    <ReferenceDot
                      x={focusedPoint.date}
                      y={focusedPoint.count}
                      r={4}
                      fill="hsl(var(--accent))"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                      label={{ value: `${focusedPoint.label} ${focusedPoint.count}`, position: "top", fontSize: 11 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Daily trend key points">
              {annotationCandidates.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFocusedPointKey(item.key)}
                  aria-label={`Focus ${item.label.toLowerCase()} point with ${item.count} messages`}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    focusedPointKey === item.key
                      ? "bg-accent text-accent-foreground"
                      : "border border-border/70 bg-muted/35 text-muted-foreground hover:bg-muted/55"
                  }`}
                >
                  {item.label}: {item.count}
                </button>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Monthly trend"
            subtitle="Message count by month"
            footer={
              view.monthlyTrend.length > 1
                ? `${monthlyDirection >= 0 ? "Up" : "Down"} ${Math.abs(monthlyDirection)} messages from last month.`
                : "Need more than one month to compare trend."
            }
            ariaLabel="Monthly message trend"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={view.monthlyTrend} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={34} />
                  <Tooltip content={<AppleTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.18)" strokeWidth={2} isAnimationActive={!reducedMotion} />
                  {monthlyLast && (
                    <ReferenceDot
                      x={monthlyLast.month}
                      y={monthlyLast.count}
                      r={3}
                      fill="hsl(var(--accent))"
                      label={{ value: `Now ${monthlyLast.count}`, position: "right", fontSize: 11 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Hour-of-day pattern"
            subtitle="When most messages are sent"
            footer={peakHour ? `Peak hour is ${peakHour.hour} with ${peakHour.count} messages.` : ""}
            ariaLabel="Hour of day activity bar chart"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.hourOfDay} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} minTickGap={18} />
                  <YAxis hide />
                  <Tooltip content={<AppleTooltip />} />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]} fill="hsl(var(--accent) / 0.85)" isAnimationActive={!reducedMotion} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Weekday vs hour heatmap" subtitle="Peak concentration across the week" ariaLabel="Weekday versus hour heatmap">
            <AppleHeatmap data={view.weekdayHour} ariaLabel="Weekday hour activity heatmap" />
          </ChartCard>
        </div>
      </section>

      <section className={`${activeSection === "people" ? "space-y-4" : "hidden"}`}>
        <SectionHeader eyebrow="People" title="Who drives the conversation" description="Message contribution, initiative, response speed, and balance." />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Who texts more"
            subtitle="Message count by participant"
            footer={topParticipant ? `${topParticipant.participant} currently leads this filtered view.` : ""}
            ariaLabel="Participant message contribution comparison"
          >
            <ComparisonBarChart data={view.participantMessages.map((entry) => ({ label: entry.participant, value: entry.messages }))} valueLabel="messages" />
          </ChartCard>
          <ChartCard title="Conversation starters" subtitle="Starts after inactivity gaps" ariaLabel="Conversation starter comparison">
            <ComparisonBarChart data={view.conversationStarters.map((entry) => ({ label: entry.participant, value: entry.count }))} valueLabel="starts" />
          </ChartCard>
          <ChartCard title="Reply-time comparison" subtitle="Median response estimate" ariaLabel="Reply time comparison chart">
            <ComparisonBarChart data={view.replyTimes.map((entry) => ({ label: entry.participant, value: entry.minutes }))} valueLabel="min" />
          </ChartCard>
          <ChartCard title="Message-length comparison" subtitle="Average characters per message" ariaLabel="Message length participant comparison">
            <ComparisonBarChart data={view.messageLengths.map((entry) => ({ label: entry.participant, value: entry.chars }))} valueLabel="chars" />
          </ChartCard>
        </div>
        <ChartCard title="Reciprocity balance" subtitle="Share of message volume" ariaLabel="Reciprocity percentage bars">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view.reciprocity} margin={{ left: 10, right: 10, top: 20, bottom: 10 }}>
                <XAxis dataKey="participant" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip content={<AppleTooltip formatter={(value) => `${value}%`} />} />
                <Bar dataKey="share" radius={[999, 999, 999, 999]} isAnimationActive={!reducedMotion}>
                  {view.reciprocity.map((entry, index) => (
                    <Cell key={entry.participant} fill={`hsl(var(--accent) / ${clamp(0.35 + index * 0.18, 0.35, 0.95)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className={`${activeSection === "content" ? "space-y-4" : "hidden"}`}>
        <SectionHeader eyebrow="Content" title="What gets shared" description="Language, links, and media composition across the conversation." />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Emoji usage" subtitle="Most used emojis" ariaLabel="Emoji usage tiles">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {view.emojiUsage.length === 0 && <p className="text-sm text-muted-foreground">No emoji-heavy messages in this view.</p>}
              {view.emojiUsage.map((entry) => (
                <div key={entry.emoji} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2 text-sm">
                  <span className="mr-2 text-lg">{entry.emoji}</span>
                  <span className="tabular-nums text-muted-foreground">{entry.count}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Top words" subtitle="Frequent text tokens" ariaLabel="Top word chips">
            <div className="flex flex-wrap gap-2">
              {view.topWords.map((entry) => (
                <span key={entry.word} className="rounded-full border border-border/70 bg-muted/35 px-3 py-1 text-xs">
                  {entry.word} <span className="tabular-nums text-muted-foreground">{entry.count}</span>
                </span>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Link domains" subtitle="Most shared websites" ariaLabel="Top link domains list">
            <div className="space-y-2">
              {view.topDomains.slice(0, 8).map((entry) => (
                <div key={entry.domain} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 px-3 py-2 text-sm">
                  <span>{entry.domain}</span>
                  <span className="tabular-nums text-muted-foreground">{entry.count}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Attachment composition"
            subtitle="Media and non-text events"
            footer={attachmentTop ? `Most common type: ${attachmentTop.label}.` : ""}
            ariaLabel="Attachment composition comparison"
          >
            <ComparisonBarChart data={view.attachmentComposition.map((entry) => ({ label: entry.label, value: entry.count }))} valueLabel="items" />
          </ChartCard>
        </div>
      </section>

      <section className={`${activeSection === "patterns" ? "space-y-4" : "hidden"}`}>
        <SectionHeader eyebrow="Patterns" title="Behavioral signatures" description="Streaks, bursts, and momentum indicators to explain relationship cadence." />
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Current streak" value={`${view.streaks.current} days`} note="Consecutive active days up to latest message" />
          <MetricCard title="Longest streak" value={`${view.streaks.longest} days`} note="Best sustained period in this filter" />
          <MetricCard
            title="Engagement temperature"
            value={`${view.engagementDelta >= 0 ? "+" : ""}${view.engagementDelta}%`}
            note="Recent two weeks vs previous two weeks"
          />
        </div>
        <ChartCard title="Burst behavior" subtitle="Highest-volume days" ariaLabel="Burst behavior timeline">
          <TimelineChart data={view.burstDays.map((entry) => ({ label: entry.date, value: entry.count }))} yLabel="Burst day messages" />
        </ChartCard>
        <InsightCallout items={analytics.notablePatterns} />
      </section>
    </div>
  );
}
