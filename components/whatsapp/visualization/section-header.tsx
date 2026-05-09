interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <header className="mb-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {description && <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>}
    </header>
  );
}
