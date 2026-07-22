export function EmptyState({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
      <p className="section-title text-3xl text-ink">{title}</p>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted">
        {description}
      </p>
    </div>
  );
}
