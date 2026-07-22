"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/shared/utils/utils";

export function NavLink({
  children,
  href,
  onClick,
  matchMode = "exact",
  activePathExclusions,
  activePathPrefixes,
}: Readonly<{
  children: React.ReactNode;
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
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
    !isExcluded &&
    (isExplicitActive === null ? isMatchedByMode : isExplicitActive);

  return (
    <Link
      className={cx(
        "rounded-xl border px-4 py-3 transition",
        isActive
          ? "border-line-strong bg-primary-light text-ink shadow-sm"
          : "border-transparent bg-transparent text-ink hover:border-line hover:bg-surface",
      )}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
