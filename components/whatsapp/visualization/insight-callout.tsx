import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface InsightCalloutProps {
  items: string[];
}

export function InsightCallout({ items }: InsightCalloutProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-accent" />
          Notable insights
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.slice(0, 4).map((item) => (
            <li key={item} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
