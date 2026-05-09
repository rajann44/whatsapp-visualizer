"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SparklineCardProps {
  label: string;
  value: string;
  insight?: string;
  trend?: Array<{ x: string; y: number }>;
}

export function SparklineCard({ label, value, insight, trend }: SparklineCardProps) {
  return (
    <Card className="transition hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        {insight && <p className="mt-1 text-sm text-muted-foreground">{insight}</p>}
        {trend && trend.length > 1 && (
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <Area type="monotone" dataKey="y" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.18)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
