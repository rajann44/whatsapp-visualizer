"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { type ParseResult } from "@/lib/whatsapp/types";

interface WorkspaceContextValue {
  result: ParseResult | null;
  setResult: (next: ParseResult | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<ParseResult | null>(null);
  const value = useMemo(() => ({ result, setResult }), [result]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
