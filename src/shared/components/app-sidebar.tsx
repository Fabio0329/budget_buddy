import { BrandMark } from "@/shared/components/brand-mark";
import { NavLink } from "@/shared/components/nav-link";
import { SignoutForm } from "@/features/auth/components/signout-form";
import type { AppUserVM, NavItem } from "@/shared/types/view-models";

export function AppSidebar({
  navigation,
  user,
}: Readonly<{
  navigation: NavItem[];
  user: AppUserVM;
}>) {
  return (
    <aside className="surface-panel sticky top-6 hidden h-[calc(100vh-3rem)] w-[280px] shrink-0 rounded-[32px] p-5 lg:flex lg:flex-col">
      <BrandMark />
      <div className="mt-8 rounded-[28px] border border-line bg-white/55 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-positive">
          <span className="status-dot bg-positive" />
          Mock session active
        </div>
        <div className="mt-4">
          <SignoutForm />
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            activePathExclusions={item.activePathExclusions}
            activePathPrefixes={item.activePathPrefixes}
            href={item.href}
            matchMode={item.matchMode}
          >
            <span className="text-sm font-semibold">{item.label}</span>
            <span className="mt-1 block text-xs text-muted">
              {item.description}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
