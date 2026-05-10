import type { ReactNode } from "react";

interface LandingSection {
  heading: string;
  body: ReactNode;
}

interface LandingPageTemplateProps {
  title: string;
  description: string;
  sections: LandingSection[];
}

export function LandingPageTemplate({ title, description, sections }: LandingPageTemplateProps) {
  return (
    <main className="container py-10">
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
      </article>
    </main>
  );
}
