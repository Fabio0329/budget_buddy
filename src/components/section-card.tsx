import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function SectionCard({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={cx(
        "surface-panel rounded-[32px] border border-line bg-white/55",
        className,
      )}
    >
      {children}
    </section>
  );
}
