import Link from "next/link";

import { SUPPORT_MAILTO } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-5">
      <div className="container space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>Local-first analytics. Your chat data stays on this device.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
            <a href={SUPPORT_MAILTO} className="hover:text-foreground">Feedback</a>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/90">
          This is a personal project and is not affiliated with, endorsed by, or associated with WhatsApp or Meta in any way.
        </p>
      </div>
    </footer>
  );
}
