import { ChartNoAxesCombined } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyVisualizationState() {
  return (
    <Card className="subtle-enter">
      <CardHeader>
        <CardTitle>No visualization data available</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
        <ChartNoAxesCombined className="h-4 w-4" />
        Adjust filters to reveal more messages and chart patterns.
      </CardContent>
    </Card>
  );
}
