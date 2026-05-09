"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SUPPORT_MAILTO } from "@/lib/site-config";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container flex min-h-[55vh] items-center justify-center py-10">
      <section className="apple-shell max-w-xl space-y-4 rounded-2xl border border-border/60 p-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">The workspace hit an unexpected issue. Your local files were not uploaded.</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" asChild>
            <Link href="/">Go to home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <a href={SUPPORT_MAILTO}>Report issue</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
