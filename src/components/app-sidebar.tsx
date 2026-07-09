import { BrandMark } from "@/components/brand-mark";
import { NavLink } from "@/components/nav-link";
import { SignoutForm } from "@/components/signout-form";
import type { AppUserVM, NavItem } from "@/lib/view-models";

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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent">
            {user.initials}
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
          <NavLink key={item.href} href={item.href} matchMode={item.matchMode}>
            <span className="text-sm font-semibold">{item.label}</span>
            <span className="mt-1 block text-xs text-muted">
              {item.description}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="rounded-[28px] border border-line bg-[linear-gradient(135deg,var(--color-accent-soft),rgba(15,139,141,0.08))] p-4">
        <p className="eyebrow text-[11px] font-semibold text-accent">
          Foundation phase
        </p>
        <p className="mt-2 text-sm leading-6 text-surface-ink">
          This shell is intentionally stable so later feature commits can focus
          on behavior rather than layout rewrites.
        </p>
      </div>
    </aside>
  );
}
