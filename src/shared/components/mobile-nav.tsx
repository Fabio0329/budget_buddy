"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/shared/components/brand-mark";
import { NavLink } from "@/shared/components/nav-link";
import { SignoutForm } from "@/shared/components/auth/signout-form";
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

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              activePathExclusions={item.activePathExclusions}
              activePathPrefixes={item.activePathPrefixes}
              href={item.href}
              matchMode={item.matchMode}
            >
              <span className="text-sm font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div
            aria-label={`Signed in as ${user.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-strong"
            title={user.email}
          >
            {user.initials}
          </div>
          <SignoutForm compact />
        </div>

        <button
          aria-controls="mobile-navigation-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:border-line-strong hover:bg-surface lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="relative h-3.5 w-[18px]">
            <span
              className={cx(
                "absolute left-0 top-0 h-0.5 w-[18px] rounded-full bg-current transition-transform duration-200",
                isOpen && "translate-y-[6px] rotate-45",
              )}
            />
            <span
              className={cx(
                "absolute left-0 top-[6px] h-0.5 w-[18px] rounded-full bg-current transition-opacity duration-200",
                isOpen && "opacity-0",
              )}
            />
            <span
              className={cx(
                "absolute bottom-0 left-0 h-0.5 w-[18px] rounded-full bg-current transition-transform duration-200",
                isOpen && "-translate-y-[6px] -rotate-45",
              )}
            />
          </span>
        </button>
      </div>
      <div
        aria-hidden={!isOpen}
        id="mobile-navigation-menu"
        className={cx(
          "absolute -inset-x-4 top-[calc(100%+0.75rem)] z-30 overflow-hidden border-y border-line bg-surface shadow-sm transition-[grid-template-rows,opacity] duration-600 ease-out sm:-inset-x-6 lg:hidden",
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
