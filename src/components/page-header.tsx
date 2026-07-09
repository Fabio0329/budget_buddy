export function PageHeader({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <header className="space-y-3">
      <p className="eyebrow text-xs font-semibold text-accent">{eyebrow}</p>
      <h1 className="section-title text-4xl leading-tight text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}
