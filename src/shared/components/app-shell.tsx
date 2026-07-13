import type { ReactNode } from "react";
import { AppSidebar } from "@/shared/components/app-sidebar";
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
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-4 px-3 py-3 sm:px-5 sm:py-5 lg:gap-6 lg:px-6">
      <AppSidebar navigation={navigation} user={user} />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="lg:hidden surface-panel sticky top-3 z-20 rounded-[28px] px-4 py-4 sm:px-5">
          <MobileNav navigation={navigation} user={user} />
        </header>
        <main className="surface-panel min-h-[calc(100vh-1.5rem)] rounded-[32px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
