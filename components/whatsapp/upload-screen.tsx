"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, BarChart3, Clock3, Download, Eye, ShieldCheck, SlidersHorizontal, Sparkles, Users2 } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

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
      <section className="apple-shell section-reveal relative overflow-hidden rounded-[2rem] border border-border/60 px-6 py-5 text-center shadow-soft md:px-12 md:py-6" style={{ animationDelay: "30ms" }}>
        <div className="hero-ambient-orb hero-ambient-orb-a" aria-hidden="true" />
        <div className="hero-ambient-orb hero-ambient-orb-b" aria-hidden="true" />
        <div className="hero-ambient-grid" aria-hidden="true" />
        <div className="relative z-10">
          <Badge variant="success" className="mx-auto mb-3 w-fit gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.12em]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private on-device analysis
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
            Upload a WhatsApp export ZIP.
            <br className="hidden md:block" />
            Get clear conversation insights.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            See message trends, reply speed, participant contribution, and content patterns. Filter by person and date, then export your summary.
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
            <CardHeader className="space-y-1 pb-1">
              <CardTitle className="text-base">Get started</CardTitle>
              <p className="text-sm text-muted-foreground">Upload in 3 steps.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Export and upload</p>
                  <a
                    href="https://faq.whatsapp.com/1180414079177245/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                  >
                    WhatsApp guide
                  </a>
                </div>
                <ol className="mt-2 space-y-1.5">
                  <li className="how-step flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 text-sm text-foreground" style={{ "--step-delay": "0ms" } as CSSProperties}>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-background text-[11px] font-semibold">1</span>
                    Open chat menu
                  </li>
                  <li className="how-step flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 text-sm text-foreground" style={{ "--step-delay": "90ms" } as CSSProperties}>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-background text-[11px] font-semibold">2</span>
                    Tap <span className="font-medium">Export chat</span>
                  </li>
                  <li className="how-step flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 text-sm text-foreground" style={{ "--step-delay": "180ms" } as CSSProperties}>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-background text-[11px] font-semibold">3</span>
                    Upload ZIP here
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Try the app before uploading</p>
                <p className="mt-1 text-sm text-muted-foreground">Open sample data to preview charts and filters.</p>
                <Button variant="secondary" className="mt-2 w-full" onClick={loadSampleWorkspace} disabled={progress.state === "loading"}>
                  Explore sample workspace
                </Button>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Need a step-by-step guide?</p>
                <p className="mt-1 text-sm text-muted-foreground">Read the full walkthrough for analysis.</p>
                <Link href="/guides" className="mt-2 inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline">
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">What you will see after upload</h2>
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">No account required</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><BarChart3 className="h-4 w-4 text-accent" />Activity trends</div>
            <div className="mb-2 grid h-11 grid-cols-6 items-end gap-1 rounded-lg border border-border/60 bg-background/60 px-2 py-1">
              <span className="h-2 rounded bg-accent/40" /><span className="h-4 rounded bg-accent/45" /><span className="h-6 rounded bg-accent/55" /><span className="h-3 rounded bg-accent/45" /><span className="h-7 rounded bg-accent/60" /><span className="h-5 rounded bg-accent/50" />
            </div>
            <p className="text-xs text-muted-foreground">Peak hours and active days</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><Clock3 className="h-4 w-4 text-accent" />Response behavior</div>
            <div className="mb-2 h-11 rounded-lg border border-border/60 bg-background/60 px-2 py-2">
              <div className="h-1.5 w-[26%] rounded-full bg-accent/60" />
              <div className="mt-1.5 h-1.5 w-[52%] rounded-full bg-accent/45" />
              <div className="mt-1.5 h-1.5 w-[74%] rounded-full bg-accent/35" />
            </div>
            <p className="text-xs text-muted-foreground">Who replies faster</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><Users2 className="h-4 w-4 text-accent" />Participant balance</div>
            <div className="mb-2 flex h-11 items-center gap-1 rounded-lg border border-border/60 bg-background/60 p-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent/80" /><span className="h-2.5 w-2.5 rounded-full bg-accent/55" /><span className="h-2.5 w-2.5 rounded-full bg-accent/35" />
              <div className="ml-1 h-2 flex-1 rounded-full bg-accent/20"><div className="h-2 w-[58%] rounded-full bg-accent/60" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Contribution share split</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><Sparkles className="h-4 w-4 text-accent" />Advanced insights</div>
            <div className="mb-2 h-11 rounded-lg border border-border/60 bg-background/60 px-2 py-2">
              <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent/70" /><span className="h-1.5 w-20 rounded-full bg-accent/55" /></div>
              <div className="mt-2 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent/55" /><span className="h-1.5 w-24 rounded-full bg-accent/40" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Pattern shift highlights</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><SlidersHorizontal className="h-4 w-4 text-accent" />Deep filtering</div>
            <div className="mb-2 flex h-11 items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2 py-2">
              <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] text-foreground">Person</span>
              <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] text-foreground">Date</span>
              <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] text-foreground">Type</span>
            </div>
            <p className="text-xs text-muted-foreground">Focus on one slice</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><Download className="h-4 w-4 text-accent" />Export summaries</div>
            <div className="mb-2 flex h-11 items-center justify-between rounded-lg border border-border/60 bg-background/60 px-2 py-2">
              <span className="text-[10px] text-muted-foreground">insights-summary.pdf</span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-foreground">Export</span>
            </div>
            <p className="text-xs text-muted-foreground">Shareable output files</p>
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
