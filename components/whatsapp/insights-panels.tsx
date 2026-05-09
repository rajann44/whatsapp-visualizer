import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AnalyticsResult } from "@/lib/whatsapp/analytics";

interface InsightsPanelsProps {
  analytics: AnalyticsResult;
}

export function InsightsPanels({ analytics }: InsightsPanelsProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top domains</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {analytics.topDomains.length === 0 && <li className="text-muted-foreground">No links found in this view.</li>}
            {analytics.topDomains.map((domain) => (
              <li key={domain.domain} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                <span className="truncate">{domain.domain}</span>
                <span className="font-medium">{domain.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments and omitted media</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {analytics.attachmentCounts.length === 0 && <li className="text-muted-foreground">No attachment events in this view.</li>}
            {analytics.attachmentCounts.map((entry) => (
              <li key={entry.type} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                <span>{entry.type.replace(/_/g, " ")}</span>
                <span className="font-medium">{entry.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top words and phrases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">Words</p>
            <div className="flex flex-wrap gap-2">
              {analytics.topWords.length === 0 && <p className="text-sm text-muted-foreground">No text-heavy messages in this view.</p>}
              {analytics.topWords.map((word) => (
                <span key={word.word} className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
                  {word.word} ({word.count})
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">Phrases</p>
            <div className="flex flex-wrap gap-2">
              {analytics.topPhrases.length === 0 && <p className="text-sm text-muted-foreground">No repeated phrases yet.</p>}
              {analytics.topPhrases.map((phrase) => (
                <span key={phrase.phrase} className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
                  {phrase.phrase} ({phrase.count})
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notable patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {analytics.notablePatterns.length === 0 && <li className="text-muted-foreground">No notable patterns for this filter set.</li>}
            {analytics.notablePatterns.map((pattern) => (
              <li key={pattern} className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                {pattern}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
