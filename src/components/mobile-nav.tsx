"use client";

import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { NavLink } from "@/components/nav-link";
import { SignoutForm } from "@/components/signout-form";
import type { AppUserVM, NavItem } from "@/lib/view-models";

export function MobileNav({
  navigation,
  user,
}: Readonly<{
  navigation: NavItem[];
  user: AppUserVM;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
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
      {isOpen ? (
        <div className="space-y-3 rounded-[28px] border border-line bg-white/70 p-4">
          <div className="border-b border-line pb-3">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
          </div>
          <nav className="grid gap-2">
            {navigation.map((item) => (
              <NavLink key={item.href} href={item.href} matchMode={item.matchMode}>
                <span className="text-sm font-semibold">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <SignoutForm compact />
        </div>
      ) : null}
    </div>
  );
}
