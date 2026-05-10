import Link from "next/link";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

interface LandingSection {
  heading: string;
  body: ReactNode;
}

interface LandingPageTemplateProps {
  title: string;
  description: string;
  sections: LandingSection[];
  relatedGuides?: Array<{
    title: string;
    href: string;
  }>;
}

export function LandingPageTemplate({ title, description, sections, relatedGuides = [] }: LandingPageTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="container flex-1 py-10">
        <article className="mx-auto max-w-3xl space-y-8 text-sm text-muted-foreground">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </header>
          {sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.heading}</h2>
              <div className="space-y-2">{section.body}</div>
            </section>
          ))}
          {relatedGuides.length > 0 && (
            <section className="space-y-3 rounded-xl border border-border/60 bg-card/70 p-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Related guides</h2>
              <ul className="space-y-2">
                {relatedGuides.map((guide) => (
                  <li key={guide.href}>
                    <Link href={guide.href} className="underline underline-offset-2 hover:text-foreground">
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
