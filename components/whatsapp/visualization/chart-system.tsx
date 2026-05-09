"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Expand, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { clamp } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  footer?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  expandable?: boolean;
}

export function ChartTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[1.02rem] font-semibold tracking-tight">{children}</h3>;
}

export function ChartSubtitle({ children }: { children: ReactNode }) {
  return <p className="text-[0.84rem] text-muted-foreground">{children}</p>;
}

export function ChartCard({ title, subtitle, footer, children, className, ariaLabel, expandable = true }: ChartCardProps) {
  const [isExpanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  return (
    <>
      <Card className={`motion-fast subtle-enter hover:-translate-y-[1px] ${className ?? ""}`} aria-label={ariaLabel}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <ChartTitle>{title}</ChartTitle>
              {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
            </div>
            {expandable && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="motion-fast rounded-full border border-border/70 bg-card/70 p-1.5 text-muted-foreground hover:text-foreground"
                aria-label={`Expand ${title} chart`}
              >
                <Expand className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {children}
          {footer && <p className="mt-3 text-xs text-muted-foreground">{footer}</p>}
        </CardContent>
      </Card>

      {isExpanded && (
        <div className="fixed inset-0 z-50 p-4 md:p-8">
          <button
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
            aria-label="Close expanded chart"
          />
          <div className="apple-shell subtle-enter relative mx-auto flex h-full w-full max-w-6xl flex-col rounded-2xl border border-border/70 shadow-soft md:h-auto md:max-h-[92vh]">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div>
                <ChartTitle>{title}</ChartTitle>
                {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="motion-fast rounded-full border border-border/70 bg-card/70 p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Close expanded chart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-5 py-4 [&_.h-72]:h-[min(62vh,760px)] [&_.h-64]:h-[min(58vh,700px)] [&_.h-40]:h-[min(52vh,620px)]">
              {children}
              {footer && <p className="mt-3 text-xs text-muted-foreground">{footer}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

interface AppleTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  formatter?: (value: number | string, name?: string) => string;
}

export function AppleTooltip({ active, payload, label, formatter }: AppleTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 px-3 py-2 text-xs shadow-[0_14px_36px_-22px_hsl(220_35%_20%/0.45)] backdrop-blur">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{entry.name ?? "Value"}</span>
            <span className="font-medium tabular-nums">
              {formatter ? formatter(entry.value ?? 0, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartEmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">{message}</p>;
}

interface SparklineProps {
  data: Array<{ x: string; y: number }>;
}

export function Sparkline({ data }: SparklineProps) {
  const reducedMotion = useReducedMotion();
  if (data.length < 2) {
    return <ChartEmptyState message="Not enough trend data" />;
  }

  return (
    <div className="h-12" aria-label="Sparkline trend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="y" stroke="hsl(var(--accent))" strokeWidth={1.8} fill="hsl(var(--accent) / 0.14)" isAnimationActive={!reducedMotion} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MetricSummaryCardProps {
  label: string;
  value: string;
  context?: string;
  trend?: Array<{ x: string; y: number }>;
  className?: string;
}

export function MetricSummaryCard({ label, value, context, trend, className }: MetricSummaryCardProps) {
  return (
    <Card className={`motion-fast subtle-enter hover:-translate-y-[1px] ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-[2.2rem] font-semibold tabular-nums leading-none tracking-tight">{value}</p>
        {context && <p className="mt-1 text-sm text-muted-foreground">{context}</p>}
        {trend && <div className="mt-3"><Sparkline data={trend} /></div>}
      </CardContent>
    </Card>
  );
}

interface AppleHeatmapProps {
  data: Array<{ weekday: number; hour: number; count: number }>;
  ariaLabel: string;
}

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AppleHeatmap({ data, ariaLabel }: AppleHeatmapProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div aria-label={ariaLabel} role="img" className="space-y-1.5">
      <div className="grid grid-cols-[2rem_1fr] gap-2">
        <div />
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(24,minmax(0,1fr))" }}>
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={`hour-label-${hour}`} className="text-center text-[10px] text-muted-foreground">
              {hour % 6 === 0 ? hour : ""}
            </div>
          ))}
        </div>
      </div>

      {weekdayNames.map((day, dayIndex) => (
        <div key={day} className="grid grid-cols-[2rem_1fr] items-center gap-2">
          <div className="text-xs text-muted-foreground">{day}</div>
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(24,minmax(0,1fr))" }}>
              {Array.from({ length: 24 }, (_, hourIndex) => {
                const point = data.find((item) => item.weekday === dayIndex && item.hour === hourIndex);
                const count = point?.count ?? 0;
                const alpha = count === 0 ? 0.08 : clamp(count / max, 0.18, 0.9);
                return (
                  <div
                    key={`${dayIndex}-${hourIndex}`}
                    className="motion-fast aspect-square w-full rounded-[4px] border border-border/25 hover:scale-105 motion-reduce:hover:scale-100"
                    style={{ backgroundColor: `hsl(var(--accent) / ${alpha})` }}
                    title={`${day} ${hourIndex}:00 - ${count}`}
                  />
                );
            })}
          </div>
        </div>
      ))}

      <div className="pt-1 text-[11px] text-muted-foreground">Hour of day (0-23), darker cells indicate higher activity.</div>
    </div>
  );
}

interface ComparisonBarChartProps {
  data: Array<{ label: string; value: number }>;
  valueLabel: string;
  highlight?: string;
}

export function ComparisonBarChart({ data, valueLabel, highlight }: ComparisonBarChartProps) {
  const reducedMotion = useReducedMotion();
  const rows = useMemo(() => data.slice(0, 8).sort((a, b) => b.value - a.value), [data]);

  if (rows.length === 0) {
    return <ChartEmptyState message="No comparison data available" />;
  }

  return (
    <div className="h-72" aria-label={`${valueLabel} comparison`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 20, right: 10, top: 6, bottom: 6 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={92} />
          <Tooltip content={<AppleTooltip formatter={(value) => `${value} ${valueLabel}`} />} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
          <Bar dataKey="value" radius={999} maxBarSize={22} isAnimationActive={!reducedMotion}>
            {rows.map((entry, index) => {
              const isHighlight = highlight ? entry.label === highlight : index === 0;
              return <Cell key={entry.label} fill={isHighlight ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.36)"} />;
            })}
            <LabelList dataKey="value" position="right" className="fill-muted-foreground text-xs tabular-nums" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TimelineChartProps {
  data: Array<{ label: string; value: number }>;
  yLabel?: string;
}

export function TimelineChart({ data, yLabel }: TimelineChartProps) {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) {
    return <ChartEmptyState message="No timeline data available" />;
  }
  return (
    <div className="h-64" aria-label={yLabel ?? "Timeline chart"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 8 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={16} />
          <YAxis tick={{ fontSize: 11 }} width={30} />
          <Tooltip content={<AppleTooltip />} />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} fill="hsl(var(--accent) / 0.12)" isAnimationActive={!reducedMotion} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
