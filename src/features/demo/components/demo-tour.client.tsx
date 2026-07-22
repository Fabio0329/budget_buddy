"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoAccountsView } from "@/features/demo/components/demo-accounts-view.client";
import { DemoBanner } from "@/features/demo/components/demo-banner";
import { DemoBudgetsView } from "@/features/demo/components/demo-budgets-view.client";
import { DemoCategoriesView } from "@/features/demo/components/demo-categories-view.client";
import { DemoDashboardView } from "@/features/demo/components/demo-dashboard-view.client";
import { DemoMutationNotice } from "@/features/demo/components/demo-mutation-notice.client";
import { DemoTransactionsView } from "@/features/demo/components/demo-transactions-view.client";
import type { DemoSnapshot } from "@/features/demo/demo-data";
import { BrandMark } from "@/shared/components/brand-mark";

type DemoView =
  "dashboard" | "accounts" | "categories" | "transactions" | "budgets";

interface DemoNavigationItem {
  readonly description: string;
  readonly id: DemoView;
  readonly label: string;
}

interface DemoTourProps {
  readonly snapshot: DemoSnapshot;
}

const navigation: DemoNavigationItem[] = [
  {
    description: "Monthly pulse and budget health",
    id: "dashboard",
    label: "Dashboard",
  },
  {
    description: "Balances and account setup",
    id: "accounts",
    label: "Accounts",
  },
  {
    description: "Income and expense structure",
    id: "categories",
    label: "Categories",
  },
  {
    description: "Search, filter, and review activity",
    id: "transactions",
    label: "Transactions",
  },
  {
    description: "Monthly limits by category",
    id: "budgets",
    label: "Budgets",
  },
];

export function DemoTour({ snapshot }: DemoTourProps) {
  const [activeView, setActiveView] = useState<DemoView>("dashboard");
  const [mutationAction, setMutationAction] = useState<string | null>(null);

  function selectView(view: DemoView) {
    setActiveView(view);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <BrandMark />
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-strong">
              Demo
            </span>
          </div>
          <nav
            aria-label="Demo sections"
            className="flex gap-1 overflow-x-auto pb-1 lg:pb-0"
          >
            {navigation.map((item) => (
              <button
                aria-current={activeView === item.id ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${activeView === item.id ? "bg-primary text-ink" : "text-muted hover:bg-primary-light hover:text-ink"}`}
                key={item.id}
                onClick={() => selectView(item.id)}
                title={item.description}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <Link
            className="hidden shrink-0 text-sm font-semibold text-primary-strong hover:underline lg:block"
            href="/signup"
          >
            Create account
          </Link>
        </div>
      </header>
      <main className="surface-panel mx-3 my-3 min-h-[calc(100vh-7rem)] rounded-xl px-4 py-5 sm:mx-5 sm:my-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1440px]">
          <DemoBanner />
          {activeView === "dashboard" ? (
            <DemoDashboardView snapshot={snapshot} />
          ) : null}
          {activeView === "accounts" ? (
            <DemoAccountsView
              accounts={snapshot.accounts}
              onMutation={setMutationAction}
            />
          ) : null}
          {activeView === "categories" ? (
            <DemoCategoriesView
              categories={snapshot.categories}
              onMutation={setMutationAction}
            />
          ) : null}
          {activeView === "transactions" ? (
            <DemoTransactionsView
              accounts={snapshot.accounts}
              categories={snapshot.categories}
              onMutation={setMutationAction}
              transactions={snapshot.transactions}
            />
          ) : null}
          {activeView === "budgets" ? (
            <DemoBudgetsView
              budgetsByMonth={snapshot.budgetsByMonth}
              monthOptions={snapshot.monthOptions}
              onMutation={setMutationAction}
            />
          ) : null}
        </div>
      </main>
      <DemoMutationNotice
        action={mutationAction}
        onClose={() => setMutationAction(null)}
      />
    </div>
  );
}
