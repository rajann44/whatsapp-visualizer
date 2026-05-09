"use client";

import { CheckCircle2, UploadCloud } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onValidationError?: (message: string) => void;
  className?: string;
  loadingMessage?: string;
  loadingPercent?: number;
  loadingSteps?: string[];
  activeStepIndex?: number;
}

export function UploadDropzone({
  isLoading,
  onFileSelect,
  onValidationError,
  className,
  loadingMessage,
  loadingPercent,
  loadingSteps,
  activeStepIndex
}: UploadDropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file?: File): void => {
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      onValidationError?.("Please choose a .zip export from WhatsApp. We cannot parse standalone .txt files on this screen.");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        "apple-shell flex h-[18rem] cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-[2rem] border border-dashed border-border/90 p-8 text-center transition-all duration-300",
        dragging ? "scale-[1.01] border-accent bg-muted/80" : "hover:border-accent/60 hover:bg-muted/40",
        isLoading && "pointer-events-none",
        className
      )}
      aria-label="Upload WhatsApp export ZIP"
    >
      {isLoading ? (
        <div className="w-full max-w-xl space-y-3 px-1" aria-live="polite">
          <div className="space-y-1 text-center">
            <p className="text-base font-medium text-foreground">{loadingMessage ?? "Preparing your workspace..."}</p>
            <p className="text-xs text-foreground/80">{Math.round(loadingPercent ?? 0)}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/90">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-100"
              style={{ width: `${Math.max(0, Math.min(loadingPercent ?? 0, 100))}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(loadingPercent ?? 0)}
              aria-label="Preparing insights workspace"
            />
          </div>
          {loadingSteps && loadingSteps.length > 0 && (
            <ul className="mx-auto max-w-sm space-y-1.5 text-left text-xs text-muted-foreground">
              {loadingSteps.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <CheckCircle2 className={`h-3.5 w-3.5 ${index <= (activeStepIndex ?? 0) ? "text-accent" : "text-muted-foreground/55"}`} />
                  <span className={index <= (activeStepIndex ?? 0) ? "text-foreground" : ""}>{step}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
      <div className="rounded-full bg-accent/10 p-4 text-accent">
        <UploadCloud className="h-8 w-8" />
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight md:text-2xl">Drop your WhatsApp ZIP here</p>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Or click to browse. Your file is processed locally and never leaves this device.
        </p>
      </div>
      <input
        id={inputId}
        type="file"
        accept=".zip,application/zip"
        disabled={isLoading}
        className="sr-only"
        onClick={(event) => {
          event.currentTarget.value = "";
        }}
        onChange={(event) => handleFile(event.target.files?.[0])}
        aria-label="Choose ZIP file"
      />
      <div className="inline-flex">
        <Button variant="secondary" size="sm" type="button" disabled={isLoading} asChild>
          <label htmlFor={inputId} className={isLoading ? "cursor-not-allowed" : "cursor-pointer"}>
          {isLoading ? "Parsing..." : "Choose ZIP file"}
          </label>
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
