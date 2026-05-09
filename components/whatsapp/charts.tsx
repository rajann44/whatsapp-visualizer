"use client";

import { ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clamp } from "@/lib/utils";

interface ActivityChartProps {
  data: Array<{ date: string; count: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity over time</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 6, right: 6, top: 10 }}>
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={28} />
            <YAxis tick={{ fontSize: 12 }} width={36} />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))"
              }}
            />
            <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" fill="url(#activityFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ParticipantChartProps {
  data: Array<{ participant: string; messages: number }>;
}

export function ParticipantChart({ data }: ParticipantChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant comparison</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 10, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="participant" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={34} />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))"
              }}
            />
            <Bar dataKey="messages" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`${entry.participant}-${index}`} fill={`hsl(var(--accent) / ${clamp(0.45 + index * 0.08, 0.45, 0.95)})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface HeatmapProps {
  data: Array<{ weekday: number; hour: number; count: number }>;
}

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ data }: HeatmapProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  const grid = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const point = data.find((item) => item.weekday === day && item.hour === hour);
      return point?.count ?? 0;
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekday and hour heatmap</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[700px] space-y-1">
          {grid.map((hours, dayIndex) => (
            <div key={weekdayNames[dayIndex]} className="flex items-center gap-1">
              <div className="w-10 text-xs text-muted-foreground">{weekdayNames[dayIndex]}</div>
              <div className="flex gap-1">
                {hours.map((count, hourIndex) => {
                  const alpha = count === 0 ? 0.1 : clamp(count / max, 0.2, 1);
                  return (
                    <div
                      key={`${dayIndex}-${hourIndex}`}
                      className="h-4 w-4 rounded-[4px]"
                      title={`${weekdayNames[dayIndex]} ${hourIndex}:00 - ${count} messages`}
                      style={{ backgroundColor: `hsl(var(--accent) / ${alpha})` }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
