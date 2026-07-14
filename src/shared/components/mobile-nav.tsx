"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/shared/components/brand-mark";
import { NavLink } from "@/shared/components/nav-link";
import { SignoutForm } from "@/features/auth/components/signout-form";
import { cx } from "@/shared/utils/utils";
import type { AppUserVM, NavItem } from "@/shared/types/view-models";

export function MobileNav({
  navigation,
  user,
}: Readonly<{
  navigation: NavItem[];
  user: AppUserVM;
}>) {
  const pathname = usePathname();

  return <MobileNavMenu key={pathname} navigation={navigation} user={user} />;
}

function MobileNavMenu({
  navigation,
  user,
}: Readonly<{
  navigation: NavItem[];
  user: AppUserVM;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-4">
        <BrandMark />
        <button
          aria-expanded={isOpen}
          className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>
      <div
        aria-hidden={!isOpen}
        className={cx(
          "absolute inset-x-0 top-full z-30 mt-5 overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_18px_40px_rgba(15,23,32,0.14)] transition-[grid-template-rows,opacity] duration-600 ease-out",
          isOpen
            ? "grid grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cx(
              "space-y-3 p-4 transition-transform duration-600 ease-out",
              isOpen ? "translate-y-0" : "-translate-y-3",
            )}
          >
            <div className="border-b border-line pb-3">
              <p className="text-sm font-medium text-ink">{user.name}</p>
              <p className="mt-1 text-sm text-muted">{user.email}</p>
            </div>
            <nav className="grid gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  activePathExclusions={item.activePathExclusions}
                  activePathPrefixes={item.activePathPrefixes}
                  href={item.href}
                  matchMode={item.matchMode}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <SignoutForm compact />
          </div>
        </div>
      </div>
    </div>
  );
}
