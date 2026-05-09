"use client";

import { format } from "date-fns";
import { ArrowDown, ArrowRight, ArrowUp, Flame, Snowflake } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ScatterChart, Scatter, ZAxis } from "recharts";

import { AppleHeatmap, AppleTooltip, ChartCard, TimelineChart, useReducedMotion } from "@/components/whatsapp/visualization/chart-system";
import { SectionHeader } from "@/components/whatsapp/visualization/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AdvancedInsightSummary } from "@/lib/whatsapp/advanced/types";

interface AdvancedInsightsProps {
  summary: AdvancedInsightSummary;
}

function directionIcon(direction: "up" | "down" | "flat") {
  if (direction === "up") {
    return <ArrowUp className="h-3.5 w-3.5" />;
  }
  if (direction === "down") {
    return <ArrowDown className="h-3.5 w-3.5" />;
  }
  return <ArrowRight className="h-3.5 w-3.5" />;
}

export function AdvancedInsights({ summary }: AdvancedInsightsProps) {
  const reducedMotion = useReducedMotion();
  const sessionStartHeatmap = (() => {
    const map = new Map<string, number>();
    summary.sessions.records.forEach((session) => {
      const weekday = Number(format(session.start, "i")) % 7;
      const hour = Number(format(session.start, "H"));
      const key = `${weekday}-${hour}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].map(([key, count]) => {
      const [weekday, hour] = key.split("-").map((value) => Number(value));
      return { weekday, hour, count };
    });
  })();
  const topSessionStartHours = [...sessionStartHeatmap]
    .reduce((acc, entry) => {
      const current = acc.get(entry.hour) ?? 0;
      acc.set(entry.hour, current + entry.count);
      return acc;
    }, new Map<number, number>());
  const topHours = [...topSessionStartHours.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }));

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Advanced"
        title="Behavioral insights"
        description="Deterministic communication pattern analysis across drift, reciprocity, sessions, and momentum."
      />

      {summary.dataWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data quality notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {summary.dataWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Drift classification
              <Badge variant={summary.drift.overall === "warming" ? "success" : summary.drift.overall === "cooling" ? "warning" : "default"}>
                {summary.drift.overall}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {summary.drift.metrics.map((metric) => (
              <div key={metric.key} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2 text-sm">
                <p className="text-muted-foreground">{metric.label}</p>
                <p className="mt-1 flex items-center gap-1 font-medium tabular-nums">
                  {directionIcon(metric.direction)}
                  {metric.deltaPercent > 0 ? "+" : ""}
                  {metric.deltaPercent}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deterministic observations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {summary.deterministicInsights.map((statement) => (
                <li key={statement} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                  {statement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Conversation energy index"
          subtitle="Rolling monthly momentum"
          footer="Higher index means denser sessions, faster replies, and better continuity."
          ariaLabel="Conversation energy line chart"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.energy.series} margin={{ left: 8, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={30} />
                <Tooltip content={<AppleTooltip />} />
                <Line type="monotone" dataKey="index" stroke="hsl(var(--accent))" strokeWidth={2.3} dot={false} isAnimationActive={!reducedMotion} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {summary.energy.highMomentum.length > 0 && (
              <Badge variant="success" className="gap-1">
                <Flame className="h-3 w-3" />
                High momentum: {summary.energy.highMomentum.map((entry) => entry.bucket).join(", ")}
              </Badge>
            )}
            {summary.energy.slowFade.length > 0 && (
              <Badge variant="warning" className="gap-1">
                <Snowflake className="h-3 w-3" />
                Slow fade: {summary.energy.slowFade.map((entry) => entry.bucket).join(", ")}
              </Badge>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Session map" subtitle="Detected sessions by duration and intensity" ariaLabel="Session duration timeline">
          <TimelineChart
            data={summary.sessions.records.slice(-20).map((session) => ({
              label: format(session.start, "MM-dd HH:mm"),
              value: session.durationMinutes
            }))}
            yLabel="Session duration"
          />
        </ChartCard>

        <ChartCard title="Curiosity vs responsiveness" subtitle="Participant matrix" ariaLabel="Curiosity responsiveness scatter chart">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="x" name="questions" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="y" name="responses" tick={{ fontSize: 12 }} />
                <ZAxis type="number" dataKey="z" range={[70, 240]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<AppleTooltip />} />
                <Scatter
                  data={summary.curiosity.asksVsAnswers.map((entry) => ({ name: entry.participant, x: entry.asked, y: entry.answered, z: entry.asked + 3 }))}
                  fill="hsl(var(--accent))"
                  isAnimationActive={!reducedMotion}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Reciprocity and balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summary.reciprocity.mode === "one_to_one" && summary.reciprocity.oneToOne ? (
              <>
                <p>
                  Reciprocity score: <span className="font-medium tabular-nums">{summary.reciprocity.oneToOne.reciprocityScore}</span>
                </p>
                <p>
                  Balance label: <span className="font-medium">{summary.reciprocity.oneToOne.balanceLabel}</span>
                </p>
                <div className="space-y-1 text-muted-foreground">
                  {summary.reciprocity.oneToOne.messageShare.map((entry) => (
                    <div key={entry.participant} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                      <span>{entry.participant} message share</span>
                      <span className="tabular-nums">{entry.share}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-2 text-muted-foreground">
                <p>Participation concentration: {summary.reciprocity.group?.participationConcentration}%</p>
                <p>Top-speaker dominance: {summary.reciprocity.group?.topSpeakerDominance}%</p>
                <p>Initiator diversity: {summary.reciprocity.group?.initiatorDiversity}%</p>
                <p>Silent-member ratio: {summary.reciprocity.group?.silentMemberRatio}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <ChartCard
          title="Session start map"
          subtitle="Session start concentration by weekday and hour"
          ariaLabel="Session start heatmap"
          footer={topHours.length > 0 ? `Most common start hours: ${topHours.map((item) => `${item.hour}:00`).join(", ")}.` : ""}
          className="h-full"
        >
          <AppleHeatmap data={sessionStartHeatmap} ariaLabel="Session start heatmap" />
        </ChartCard>

        <ChartCard title="Reconnection moments" subtitle="Silence breaks and resulting energy" ariaLabel="Reconnection event timeline" className="h-full">
          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
            {summary.reconnection.moments.length === 0 && <p className="text-sm text-muted-foreground">No long-silence reconnections in this range.</p>}
            {summary.reconnection.moments.slice(-8).map((moment) => (
              <div key={`${moment.at.toISOString()}-${moment.breaker}`} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>{format(moment.at, "dd MMM yyyy, HH:mm")}</span>
                  <span className="tabular-nums">{moment.silenceHours}h silence</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Broken by {moment.breaker}. Session energy {moment.sessionEnergy} ({moment.strongerThanAverage ? "above" : "below"} average)
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <Card aria-label="Topic drift explorer">
        <CardHeader>
          <CardTitle>Topic drift explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="mb-1 text-muted-foreground">Emerging topics</p>
            <div className="flex flex-wrap gap-2">
              {summary.topicDrift.emergingTopics.map((topic) => (
                <Badge key={topic} variant="accent">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-muted-foreground">Stable topics</p>
            <div className="flex flex-wrap gap-2">
              {summary.topicDrift.stableTopics.map((topic) => (
                <Badge key={topic}>{topic}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-muted-foreground">Recurring phrases</p>
            <div className="grid gap-2 md:grid-cols-2">
              {summary.topicDrift.recurringPhrases.slice(0, 8).map((phrase) => (
                <div key={phrase.phrase} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                  {phrase.phrase} <span className="tabular-nums text-muted-foreground">({phrase.count})</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
