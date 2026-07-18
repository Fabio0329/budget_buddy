import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { DashboardBudgetList } from "@/features/dashboard/components/dashboard-budget-list";
import { DashboardDonutChart } from "@/features/dashboard/components/dashboard-donut-chart";
import { DashboardLineChart } from "@/features/dashboard/components/dashboard-line-chart";
import { DashboardMonthSwitcher } from "@/features/dashboard/components/dashboard-month-switcher.client";
import { DashboardSpendComparison } from "@/features/dashboard/components/dashboard-spend-comparison";
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card";
import { DashboardTransactionsList } from "@/features/dashboard/components/dashboard-transactions-list";
import { getDashboardMonthData } from "@/features/dashboard/dashboard.queries";
import { SampleDataCard } from "@/features/onboarding/components/sample-data-card.client";
import { canLoadSampleData } from "@/features/onboarding/sample-data.actions";
import { requireCurrentUser } from "@/server/auth/session";
import type { ReactNode } from "react";

type DashboardCard = {
  label: string;
  value: string;
  tone: string;
  detail: string;
  accent?: ReactNode;
};

type DashboardPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const [{ dashboard, months }, showSampleData] = await Promise.all([
    getDashboardMonthData(user.id, params.month),
    canLoadSampleData(user.id),
  ]);
  const cards: DashboardCard[] = [
    {
      label: "Income",
      value: dashboard.summary.monthlyIncomeDisplay,
      tone: "text-positive",
      detail: "Total inflow captured for the selected month.",
      accent: (
        <span className="rounded-full bg-positive-soft px-3 py-1 text-xs font-semibold text-positive">
          Inflow
        </span>
      ),
    },
    {
      label: "Expenses",
      value: dashboard.summary.monthlyExpenseDisplay,
      tone: "text-negative",
      detail: "Outflow tracked across categorized expenses.",
      accent: (
        <span className="rounded-full bg-negative-soft px-3 py-1 text-xs font-semibold text-negative">
          Outflow
        </span>
      ),
    },
    {
      label: "Net cash flow",
      value: dashboard.summary.netCashFlowDisplay,
      tone: "text-ink",
      detail: "Monthly balance after income and expense movement.",
    },
    {
      label: "Account balances",
      value: dashboard.summary.totalAccountBalanceDisplay,
      tone: "text-ink",
      detail: "Combined balance across visible accounts.",
    },
    {
      label: "Largest expense",
      value: dashboard.summary.largestExpenseCategory,
      tone: "text-ink",
      detail: "Primary spending category for this month.",
    },
    {
      label: "Remaining budget",
      value: dashboard.summary.remainingBudgetDisplay,
      tone: "text-ink",
      detail: "Planned spend still available before category caps.",
    },
  ] as const;

  return (
    <div className="space-y-8">
      {showSampleData ? <SampleDataCard /> : null}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Dashboard"
          title={dashboard.summary.monthLabel}
          description="This persisted overview consolidates cash flow, category spending, budget pressure, account balances, and recent activity for the selected month."
        />
        <DashboardMonthSwitcher
          activeMonth={dashboard.id}
          months={months}
        />
      </div>

      <section className="card-grid">
        {cards.map((card) => (
          <DashboardStatCard
            key={card.label}
            accent={card.accent}
            detail={card.detail}
            label={card.label}
            tone={card.tone}
            value={card.value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {dashboard.categorySpend.length > 0 ? (
          <DashboardDonutChart segments={dashboard.categorySpend} />
        ) : (
          <EmptyState
            title="No expense categories this month"
            description="Expense category shares will appear after transactions are recorded for this period."
          />
        )}
        <DashboardSpendComparison bars={dashboard.incomeVsExpense} />
      </section>

      <section>
        {dashboard.dailySpending.length > 0 ? (
          <DashboardLineChart points={dashboard.dailySpending} />
        ) : (
          <EmptyState
            title="No daily spend trend yet"
            description="There are no expense points to plot for this month."
          />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {dashboard.recentTransactions.length > 0 ? (
          <DashboardTransactionsList transactions={dashboard.recentTransactions} />
        ) : (
          <EmptyState
            title="No recent transactions"
            description="Once transaction activity exists, the latest entries will appear here."
          />
        )}
        {dashboard.budgets.length > 0 ? (
          <DashboardBudgetList budgets={dashboard.budgets} />
        ) : (
          <EmptyState
            title="No budgets configured"
            description="Budget progress will appear here after monthly limits are added."
          />
        )}
      </section>
    </div>
  );
}
