"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/whatsapp/visualization/chart-card";

interface ParticipantComparisonCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ participant: string; value: number }>;
  valueLabel: string;
}

export function ParticipantComparisonCard({ title, subtitle, data, valueLabel }: ParticipantComparisonCardProps) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 8, top: 8, bottom: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="participant" tick={{ fontSize: 12 }} width={72} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.45)" }}
              contentStyle={{
                border: "1px solid hsl(var(--border))",
                borderRadius: 14,
                background: "hsl(var(--card))"
              }}
              formatter={(value: number) => [`${value.toLocaleString()} ${valueLabel}`, ""]}
            />
            <Bar dataKey="value" radius={999} fill="hsl(var(--accent))" maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
