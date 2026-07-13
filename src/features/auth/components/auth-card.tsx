import type { ReactNode } from "react";

export function AuthCard({
  children,
  footer,
  title,
  description,
  eyebrow,
}: Readonly<{
  children: ReactNode;
  footer?: ReactNode;
  title: string;
  description: string;
  eyebrow: string;
}>) {
  return (
    <section className="surface-panel rounded-[32px] px-6 py-7 sm:px-8 sm:py-8">
      <div className="space-y-3">
        <p className="eyebrow text-xs font-semibold text-accent">{eyebrow}</p>
        <h2 className="section-title text-3xl leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-muted sm:text-base">
          {description}
        </p>
      </div>
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  );
}
