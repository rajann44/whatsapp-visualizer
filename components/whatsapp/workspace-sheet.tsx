"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface WorkspaceSheetProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function WorkspaceSheet({ open, title, description, onClose, children }: WorkspaceSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-background/55 backdrop-blur-sm motion-fast" aria-label="Close panel" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:grid md:place-items-center">
        <aside
          className="apple-shell subtle-enter w-full rounded-t-[1.6rem] border border-border/60 px-5 pb-5 pt-3 shadow-soft md:max-h-[82vh] md:w-[min(680px,92vw)] md:rounded-[1.6rem] md:px-6 md:pb-6 md:pt-5"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border/80 md:hidden" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[62vh] overflow-y-auto pb-1 md:max-h-[64vh]">{children}</div>
        </aside>
      </div>
    </div>
  );
}
