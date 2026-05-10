"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, BarChart3, Clock3, Download, Eye, ShieldCheck, SlidersHorizontal, Sparkles, Users2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { UploadDropzone } from "@/components/whatsapp/upload-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSampleParseResult } from "@/lib/whatsapp/sample-data";
import { toUserFriendlyUploadError } from "@/lib/whatsapp/upload-errors";
import { parseWhatsAppZip } from "@/lib/whatsapp/parser";
import { type UploadProgress } from "@/lib/whatsapp/types";
import { useWorkspace } from "@/components/whatsapp/workspace-provider";

export function UploadScreen() {
  const router = useRouter();
  const { setResult } = useWorkspace();
  const [progress, setProgress] = useState<UploadProgress>({ state: "idle" });
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const timerRef = useRef<number | null>(null);
  const loadingSteps = ["Unpacking ZIP", "Parsing messages", "Building insights workspace"];
  const activeStepIndex = loadingPercent < 34 ? 0 : loadingPercent < 68 ? 1 : 2;
  const isDropzoneBusy = progress.state === "loading" || progress.state === "parsed" || isNavigating;
  const dropzoneLoadingMessage = progress.state === "parsed" ? "Opening insights workspace..." : progress.message;
  const dropzoneLoadingPercent = progress.state === "parsed" ? 100 : loadingPercent;
  const dropzoneStepIndex = progress.state === "parsed" ? loadingSteps.length - 1 : activeStepIndex;

  function clearTimer(): void {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  useEffect(() => {
    return () => clearTimer();
  }, []);

  function beginInsightsTransition(): void {
    setIsNavigating(true);
    const viewTransition = (document as Document & { startViewTransition?: (callback: () => void) => unknown }).startViewTransition?.(() => {
      router.push("/insights");
    });

    if (viewTransition) {
      return;
    }

    window.setTimeout(() => {
      router.push("/insights");
    }, 720);
  }

  async function handleUpload(file: File): Promise<void> {
    clearTimer();
    setLoadingPercent(0);
    setProgress({ state: "loading", message: "Preparing your workspace..." });
    const startedAt = Date.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min((elapsed / 5000) * 100, 98);
      setLoadingPercent(next);
    }, 60);

    try {
      const parsed = await parseWhatsAppZip(file);
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(5000 - elapsed, 0);
      if (remaining > 0) {
        await delay(remaining);
      }
      clearTimer();
      setLoadingPercent(100);
      setResult(parsed);
      setProgress({ state: "parsed", message: `Ready. Parsed ${parsed.parseStats.totalMessages} messages.` });
      await delay(220);
      beginInsightsTransition();
    } catch (error) {
      clearTimer();
      const reason = toUserFriendlyUploadError(error);
      setProgress({ state: "error", message: reason });
      setLoadingPercent(0);
    }
  }

  async function loadSampleWorkspace(): Promise<void> {
    clearTimer();
    setLoadingPercent(0);
    setProgress({ state: "loading", message: "Loading sample workspace..." });
    const startedAt = Date.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min((elapsed / 1200) * 100, 92);
      setLoadingPercent(next);
    }, 60);

    await delay(1150);
    clearTimer();
    setLoadingPercent(100);
    setResult(buildSampleParseResult());
    setProgress({ state: "parsed", message: "Sample insights loaded." });
    await delay(200);
    beginInsightsTransition();
  }

  return (
    <div className="space-y-6">
      <section className="apple-shell section-reveal relative overflow-hidden rounded-[2rem] border border-border/60 px-6 py-10 text-center shadow-soft md:px-12 md:py-16" style={{ animationDelay: "30ms" }}>
        <div className="hero-ambient-orb hero-ambient-orb-a" aria-hidden="true" />
        <div className="hero-ambient-orb hero-ambient-orb-b" aria-hidden="true" />
        <div className="hero-ambient-grid" aria-hidden="true" />
        <div className="relative z-10">
          <Badge variant="success" className="mx-auto mb-5 w-fit gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.12em]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private on-device analysis
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Bring in your chat.
            <br className="hidden md:block" />
            Explore with clarity.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Purpose-built environment to visualize activity trends, response behavior, participant balance, and exportable summaries from your chat history.
          </p>
        </div>
      </section>

      <section className="section-reveal grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]" style={{ animationDelay: "95ms" }}>
        <div className="space-y-4">
          <UploadDropzone
            isLoading={isDropzoneBusy}
            onFileSelect={handleUpload}
            onValidationError={(message) => setProgress({ state: "error", message })}
            className="h-full"
            loadingMessage={dropzoneLoadingMessage}
            loadingPercent={dropzoneLoadingPercent}
            loadingSteps={loadingSteps}
            activeStepIndex={dropzoneStepIndex}
          />

          {progress.state === "error" && (
            <Card className="subtle-enter border-warning/70">
              <CardContent className="flex items-center gap-2 py-5 text-sm">
                <AlertCircle className="h-4 w-4 text-warning" />
                {progress.message ?? "Failed to parse archive."}
              </CardContent>
            </Card>
          )}
        </div>

        <aside>
          <Card className="h-full rounded-[1.4rem] border-border/60 bg-card/70">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-base">Quick start</CardTitle>
              <p className="text-sm text-muted-foreground">Everything you need before upload and analysis.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">How to export on WhatsApp</p>
                  <a
                    href="https://faq.whatsapp.com/1180414079177245/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                  >
                    Official guide
                  </a>
                </div>
                <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2">1. Open a chat, then tap the header menu.</li>
                  <li className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2">2. Choose <span className="font-medium text-foreground">Export chat</span>.</li>
                  <li className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2">3. Save the ZIP and drop it here.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Try the app before uploading</p>
                <p className="mt-1 text-sm text-muted-foreground">Load an anonymized sample chat to explore charts, filters, and exports.</p>
                <Button variant="secondary" className="mt-3 w-full" onClick={loadSampleWorkspace} disabled={progress.state === "loading"}>
                  Explore sample workspace
                </Button>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Need a step-by-step guide?</p>
                <p className="mt-1 text-sm text-muted-foreground">Read the walkthrough for export, upload, and interpreting charts accurately.</p>
                <Link href="/guides" className="mt-3 inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline">
                  Browse all analysis guides
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="section-reveal apple-shell rounded-[1.4rem] border border-border/60 bg-card/70 p-4 md:p-5" style={{ animationDelay: "115ms" }}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">What you can do</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Feature overview before upload</h2>
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">No account required</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <BarChart3 className="h-4 w-4 text-accent" />
              Activity trends
            </div>
            <p className="text-sm text-muted-foreground">See daily and hourly message intensity, quiet periods, and momentum over time.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="h-4 w-4 text-accent" />
              Response behavior
            </div>
            <p className="text-sm text-muted-foreground">Measure reply delays, back-and-forth rhythm, and responsiveness between participants.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Users2 className="h-4 w-4 text-accent" />
              Participant balance
            </div>
            <p className="text-sm text-muted-foreground">Compare contribution share, initiator patterns, and conversation ownership.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Advanced insights
            </div>
            <p className="text-sm text-muted-foreground">Review deterministic higher-level signals and notable conversational shifts.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              Deep filtering
            </div>
            <p className="text-sm text-muted-foreground">Slice by participant, date range, weekday, and content type for focused analysis.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Download className="h-4 w-4 text-accent" />
              Export summaries
            </div>
            <p className="text-sm text-muted-foreground">Generate sharable outputs and keep a portable snapshot of your selected insights.</p>
          </div>
        </div>
      </section>

      <section className="section-reveal apple-shell rounded-[1.4rem] border border-border/60 bg-card/70 p-4 md:p-5" style={{ animationDelay: "130ms" }}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Trust and transparency</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Built with privacy-first principles</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Data minimization by default
            </div>
            <p className="text-sm text-muted-foreground">No account required and chat processing stays on-device during analysis.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Eye className="h-4 w-4 text-accent" />
              Transparent analytics
            </div>
            <p className="text-sm text-muted-foreground">Deterministic metrics with visible formulas and explainable chart outputs.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              User control and rights
            </div>
            <p className="text-sm text-muted-foreground">Adjust filters, export summaries, and delete session data at any time.</p>
          </div>
        </div>
      </section>

      {isNavigating && (
        <div className="route-transition-overlay fixed inset-0 z-[90] pointer-events-none">
          <div className="route-transition-glow route-transition-glow-a" />
          <div className="route-transition-glow route-transition-glow-b" />
          <div className="route-transition-center apple-shell mx-auto mt-[32vh] w-[min(560px,88vw)] rounded-2xl border border-border/65 px-5 py-4 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Opening workspace</p>
            <p className="mt-1 text-sm text-foreground">Preparing your insights canvas...</p>
          </div>
        </div>
      )}
    </div>
  );
}
