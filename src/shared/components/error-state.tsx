"use client";

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
}: Readonly<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <div className="surface-panel w-full rounded-xl px-8 py-10 text-center">
        <p className="eyebrow text-xs font-semibold text-negative">Error</p>
        <h1 className="section-title mt-3 text-4xl text-ink">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{description}</p>
        <button
          className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </main>
  );
}
