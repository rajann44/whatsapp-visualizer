import { ChartCard } from "@/components/whatsapp/visualization/chart-card";
import { clamp } from "@/lib/utils";

interface HeatmapCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ weekday: number; hour: number; count: number }>;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HeatmapCard({ title, subtitle, data }: HeatmapCardProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-1.5">
          {weekdays.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-2">
              <div className="w-10 text-xs text-muted-foreground">{day}</div>
              <div className="flex gap-1">
                {Array.from({ length: 24 }, (_, hourIndex) => {
                  const point = data.find((item) => item.weekday === dayIndex && item.hour === hourIndex);
                  const count = point?.count ?? 0;
                  const alpha = count === 0 ? 0.08 : clamp(count / max, 0.16, 1);
                  return (
                    <div
                      key={`${dayIndex}-${hourIndex}`}
                      className="h-4 w-4 rounded-[5px] transition-transform hover:scale-110"
                      title={`${day} ${hourIndex}:00 • ${count} messages`}
                      style={{ backgroundColor: `hsl(var(--accent) / ${alpha})` }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
