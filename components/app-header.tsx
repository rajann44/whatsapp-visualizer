import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/86 backdrop-blur-xl">
      <div className="container flex h-12 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90" aria-label="Go to homepage">
          <BrandLogo className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight">WhatsApp Visualizer</span>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
