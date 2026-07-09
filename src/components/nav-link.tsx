"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

export function NavLink({
  children,
  href,
  matchMode = "exact",
  activePathExclusions,
  activePathPrefixes,
}: Readonly<{
  children: React.ReactNode;
  href: string;
  matchMode?: "exact" | "prefix";
  activePathPrefixes?: string[];
  activePathExclusions?: string[];
}>) {
  const pathname = usePathname();
  const isExplicitActive =
    activePathPrefixes && activePathPrefixes.length > 0
      ? activePathPrefixes.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        )
      : null;
  const isExcluded =
    activePathExclusions?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? false;
  const isMatchedByMode =
    matchMode === "prefix"
      ? pathname === href || pathname.startsWith(`${href}/`)
      : pathname === href;
  const isActive =
    !isExcluded && (isExplicitActive === null ? isMatchedByMode : isExplicitActive);

  return (
    <Link
      className={cx(
        "rounded-[24px] border px-4 py-3 transition",
        isActive
          ? "border-line-strong bg-ink text-canvas shadow-[0_12px_30px_rgba(19,34,43,0.14)]"
          : "border-transparent bg-transparent text-ink hover:border-line hover:bg-white/60",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
