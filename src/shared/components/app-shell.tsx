import type { ReactNode } from "react";
import { MobileNav } from "@/shared/components/mobile-nav";
import type { AppUserVM, NavItem } from "@/shared/types/view-models";

export function AppShell({
  children,
  navigation,
  user,
}: Readonly<{
  children: ReactNode;
  navigation: NavItem[];
  user: AppUserVM;
}>) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 w-full border-b border-line bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,32,0.08)] backdrop-blur-xl sm:px-6">
          <MobileNav navigation={navigation} user={user} />
        </header>
        <main className="surface-panel mx-3 mb-3 mt-3 min-h-[calc(100vh-5rem)] rounded-[28px] px-4 py-5 sm:mx-5 sm:mb-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
