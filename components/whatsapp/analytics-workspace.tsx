"use client";

import { parseISO } from "date-fns";
import { AlertCircle, Download, Filter, GaugeCircle, Radar, UsersRound, BookText, WandSparkles, ChartLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";

import { FiltersBar, type DashboardFilters } from "@/components/whatsapp/filters-bar";
import { AdvancedInsights } from "@/components/whatsapp/advanced-insights";
import { UploadDropzone } from "@/components/whatsapp/upload-dropzone";
import { VisualizationDashboard } from "@/components/whatsapp/visualization/dashboard";
import { EmptyVisualizationState } from "@/components/whatsapp/visualization/empty-visualization-state";
import { WorkspaceSheet } from "@/components/whatsapp/workspace-sheet";
import { useWorkspace } from "@/components/whatsapp/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAnalytics, filterMessages } from "@/lib/whatsapp/analytics";
import { buildCsvExport, buildJsonExport } from "@/lib/whatsapp/export";
import { parseWhatsAppZip } from "@/lib/whatsapp/parser";
import { SUPPORT_MAILTO } from "@/lib/site-config";
import { toUserFriendlyUploadError } from "@/lib/whatsapp/upload-errors";
import { type UploadProgress } from "@/lib/whatsapp/types";
import { downloadTextFile } from "@/lib/utils";
import { computeAdvancedInsights } from "@/lib/whatsapp/advanced";

const initialFilters: DashboardFilters = {
  participant: "all",
  messageType: "all"
};
const workspacePrefsKey = "wv-workspace-preferences";
const allowedSections = ["overview", "activity", "people", "content", "patterns", "advanced"] as const;

function readWorkspacePreferences(): {
  activeSection: (typeof allowedSections)[number];
  filters: DashboardFilters;
} {
  const defaults = {
    activeSection: "overview" as const,
    filters: initialFilters
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(workspacePrefsKey);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as {
      activeSection?: string;
      filters?: DashboardFilters;
    };

    const activeSection = parsed.activeSection && allowedSections.includes(parsed.activeSection as (typeof allowedSections)[number])
      ? (parsed.activeSection as (typeof allowedSections)[number])
      : defaults.activeSection;

    const filters = parsed.filters
      ? {
          participant: parsed.filters.participant ?? "all",
          messageType: parsed.filters.messageType ?? "all",
          dateFrom: parsed.filters.dateFrom,
          dateTo: parsed.filters.dateTo
        }
      : defaults.filters;

    return { activeSection, filters };
  } catch {
    window.localStorage.removeItem(workspacePrefsKey);
    return defaults;
  }
}

interface AnalyticsWorkspaceProps {
  showUploader?: boolean;
}

export function AnalyticsWorkspace({ showUploader = true }: AnalyticsWorkspaceProps) {
  const { result, setResult } = useWorkspace();
  const initialPrefs = readWorkspacePreferences();
  const [progress, setProgress] = useState<UploadProgress>({ state: "idle" });
  const [filters, setFilters] = useState<DashboardFilters>(initialPrefs.filters);
  const [activeSection, setActiveSection] = useState<"overview" | "activity" | "people" | "content" | "patterns" | "advanced">(initialPrefs.activeSection);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isExportSheetOpen, setExportSheetOpen] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({ activeSection, filters });
    window.localStorage.setItem(workspacePrefsKey, payload);
  }, [activeSection, filters]);

  const navItems: Array<{ id: typeof activeSection; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Overview", icon: GaugeCircle },
    { id: "activity", label: "Activity", icon: ChartLine },
    { id: "people", label: "People", icon: UsersRound },
    { id: "content", label: "Content", icon: BookText },
    { id: "patterns", label: "Patterns", icon: Radar },
    { id: "advanced", label: "Advanced", icon: WandSparkles }
  ];

  const filteredMessages = useMemo(() => {
    if (!result) {
      return [];
    }

    return filterMessages(result.allMessages, {
      participant: filters.participant,
      messageType: filters.messageType,
      dateFrom: filters.dateFrom ? parseISO(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? parseISO(filters.dateTo) : undefined
    });
  }, [result, filters]);

  const analytics = useMemo(() => {
    if (!result) {
      return null;
    }
    return computeAnalytics(filteredMessages, result.participants);
  }, [result, filteredMessages]);

  const advancedInsights = useMemo(() => {
    if (!analytics || filteredMessages.length === 0) {
      return null;
    }
    return computeAdvancedInsights(filteredMessages, analytics);
  }, [analytics, filteredMessages]);

  async function handleUpload(file: File): Promise<void> {
    setProgress({ state: "loading", message: "Reading archive and preparing your workspace..." });
    try {
      const parsed = await parseWhatsAppZip(file);
      setResult(parsed);
      setProgress({ state: "parsed", message: `Ready: ${parsed.parseStats.totalMessages} messages across ${parsed.parseStats.parsedFiles} files.` });
    } catch (error) {
      const reason = toUserFriendlyUploadError(error);
      setProgress({ state: "error", message: reason });
      setResult(null);
    }
  }

  function exportAsJson(): void {
    if (!result || !analytics) {
      return;
    }
    const json = buildJsonExport({
      generatedAt: new Date().toISOString(),
      parseStats: result.parseStats,
      filters: {
        participant: filters.participant,
        messageType: filters.messageType,
        from: filters.dateFrom,
        to: filters.dateTo
      },
      analytics
    });
    downloadTextFile("whatsapp-summary.json", json);
  }

  function exportAsCsv(): void {
    if (!analytics) {
      return;
    }
    const csv = buildCsvExport(analytics);
    downloadTextFile("whatsapp-summary.csv", csv);
  }

  return (
    <div className="space-y-6">
      <div className="apple-shell section-reveal flex items-center justify-between rounded-[1.2rem] border border-border/55 px-4 py-3 text-xs text-muted-foreground" style={{ animationDelay: "20ms" }}>
        <span className="font-medium uppercase tracking-[0.08em]">Private mode: data stays on this device.</span>
        {result && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setFilterSheetOpen(true)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setExportSheetOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </div>

      {showUploader && (
        <UploadDropzone
          isLoading={progress.state === "loading"}
          onFileSelect={handleUpload}
          onValidationError={(message) => setProgress({ state: "error", message })}
        />
      )}

      {progress.state === "loading" && (
        <Card>
          <CardContent className="py-5 text-sm text-muted-foreground">{progress.message}</CardContent>
        </Card>
      )}

      {progress.state === "error" && (
        <Card className="border-warning/70">
          <CardContent className="flex items-center gap-2 py-5 text-sm">
            <AlertCircle className="h-4 w-4 text-warning" />
            {progress.message ?? "Failed to parse archive."}
          </CardContent>
        </Card>
      )}

      {result && analytics && (
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="apple-shell subtle-enter h-fit rounded-2xl border border-border/55 p-3 xl:sticky xl:top-20">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`motion-fast flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="my-3 border-t border-border/60" />

            <section className="space-y-3 px-1 text-xs">
              <p className="font-semibold uppercase tracking-[0.08em] text-muted-foreground">Workspace summary</p>
              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="font-medium tabular-nums text-foreground">{analytics.totalMessages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium tabular-nums text-foreground">{analytics.participants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Filter</span>
                  <span className="font-medium text-foreground">{filters.participant === "all" ? "All" : filters.participant}</span>
                </div>
              </div>
            </section>

            <section className="mt-4 space-y-2 px-1 text-xs">
              <p className="font-semibold uppercase tracking-[0.08em] text-muted-foreground">Quick help</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="rounded-lg border border-border/60 bg-muted/25 px-2.5 py-2">Everything runs locally in this browser session.</li>
                <li className="rounded-lg border border-border/60 bg-muted/25 px-2.5 py-2">Use filters to narrow context before reading trends.</li>
                <li className="rounded-lg border border-border/60 bg-muted/25 px-2.5 py-2">Export captures the currently filtered view.</li>
              </ul>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 w-full justify-center"
                onClick={() => {
                  setResult(null);
                  setFilters(initialFilters);
                  setActiveSection("overview");
                  window.localStorage.removeItem(workspacePrefsKey);
                }}
              >
                Delete session data
              </Button>
            </section>
          </aside>

          <div className="space-y-5">
            <div className="subtle-enter apple-shell flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/55 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="rounded-full px-3 py-1 text-xs">
                  {progress.message || "Workspace ready"}
                </Badge>
                {result.sessionMode === "sample" && (
                  <Badge className="rounded-full px-3 py-1 text-xs">Sample data</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <p>Use sidebar to focus one analytical story at a time.</p>
                <a href={SUPPORT_MAILTO} className="underline hover:text-foreground">Send feedback</a>
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <EmptyVisualizationState />
            ) : (
              <div className="space-y-10">
                {activeSection !== "advanced" ? (
                  <div key={activeSection} className="section-reveal">
                    <VisualizationDashboard analytics={analytics} filteredMessages={filteredMessages} activeSection={activeSection} />
                  </div>
                ) : advancedInsights ? (
                  <div className="section-reveal">
                    <AdvancedInsights summary={advancedInsights} />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced insights unavailable</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Add more messages in the current filter range to unlock deeper behavioral views.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {result.parseWarnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Import notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                    {result.parseWarnings.slice(0, 100).map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <WorkspaceSheet
        open={isFilterSheetOpen}
        title="Filters"
        description="Adjust scope while preserving your current context."
        onClose={() => setFilterSheetOpen(false)}
      >
        {result ? <FiltersBar participants={result.participants} filters={filters} onChange={setFilters} /> : null}
      </WorkspaceSheet>

      <WorkspaceSheet
        open={isExportSheetOpen}
        title="Export"
        description="Export a deterministic summary from the current filtered view."
        onClose={() => setExportSheetOpen(false)}
      >
        <div className="space-y-2">
          <Button variant="secondary" className="w-full justify-start" onClick={exportAsJson}>
            <Download className="h-4 w-4" />
            Export summary JSON
          </Button>
          <Button variant="secondary" className="w-full justify-start" onClick={exportAsCsv}>
            <Download className="h-4 w-4" />
            Export summary CSV
          </Button>
        </div>
      </WorkspaceSheet>
    </div>
  );
}
