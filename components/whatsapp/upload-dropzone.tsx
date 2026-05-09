"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onValidationError?: (message: string) => void;
  className?: string;
}

export function UploadDropzone({ isLoading, onFileSelect, onValidationError, className }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
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
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
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
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        "apple-shell flex min-h-[18rem] cursor-pointer flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-border/90 p-8 text-center transition-all duration-300",
        dragging ? "scale-[1.01] border-accent bg-muted/80" : "hover:border-accent/60 hover:bg-muted/40",
        isLoading && "pointer-events-none opacity-65",
        className
      )}
      aria-label="Upload WhatsApp export ZIP"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="rounded-full bg-accent/10 p-4 text-accent">
        <UploadCloud className="h-8 w-8" />
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight md:text-2xl">Drop your WhatsApp ZIP here</p>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Or click to browse. Supports multiple `.txt` files in one archive.
        </p>
      </div>
      <Button variant="secondary" size="sm" disabled={isLoading}>
        {isLoading ? "Parsing..." : "Choose ZIP file"}
      </Button>
    </div>
  );
}
