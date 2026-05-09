import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  note?: string;
}

export function MetricCard({ title, value, note }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  );
}
