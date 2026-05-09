import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faq = [
  {
    q: "Does my chat data leave my device?",
    a: "No. ZIP parsing and analytics run locally in your browser. Nothing is uploaded to a server by this app."
  },
  {
    q: "What export formats are supported?",
    a: "The parser handles common WhatsApp export variations: multiline entries, system lines, omitted media markers, links, calls, and mixed timestamp formats."
  },
  {
    q: "Can I analyze multiple chat files at once?",
    a: "Yes. A single ZIP can include one or more .txt files and results are aggregated into one unified dashboard."
  }
];

export function HelpFaq() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help and FAQ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {faq.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-border/55 bg-card/70 px-4 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium">{item.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
