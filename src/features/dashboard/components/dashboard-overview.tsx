import type { ReactNode } from "react";
import { DashboardBudgetList } from "@/features/dashboard/components/dashboard-budget-list";
import { DashboardDonutChart } from "@/features/dashboard/components/dashboard-donut-chart";
import { DashboardLineChart } from "@/features/dashboard/components/dashboard-line-chart";
import { DashboardSpendComparison } from "@/features/dashboard/components/dashboard-spend-comparison";
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card";
import { DashboardTransactionsList } from "@/features/dashboard/components/dashboard-transactions-list";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import type { DashboardMonthVM } from "@/shared/types/view-models";

type DashboardCard = {
  accent?: ReactNode;
  detail: string;
  label: string;
  tone: string;
  value: string;
};

export interface DashboardOverviewProps {
  readonly budgetPeriodLabel?: string;
  readonly dashboard: DashboardMonthVM;
  readonly description: string;
  readonly monthControl: ReactNode;
}

export function DashboardOverview({
  budgetPeriodLabel,
  dashboard,
  description,
  monthControl,
}: DashboardOverviewProps) {
  const cards: DashboardCard[] = [
    {
      accent: (
        <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-strong">
          Inflow
        </span>
      ),
      detail: "Total inflow captured for the selected month.",
      label: "Income",
      tone: "text-primary-strong",
      value: dashboard.summary.monthlyIncomeDisplay,
    },
    {
      accent: (
        <span className="rounded-full bg-negative-soft px-3 py-1 text-xs font-semibold text-negative">
          Outflow
        </span>
      ),
      detail: "Outflow tracked across categorized expenses.",
      label: "Expenses",
      tone: "text-negative",
      value: dashboard.summary.monthlyExpenseDisplay,
    },
    {
      detail: "Monthly balance after income and expense movement.",
      label: "Net cash flow",
      tone: "text-ink",
      value: dashboard.summary.netCashFlowDisplay,
    },
    {
      detail: "Combined balance across visible accounts.",
      label: "Account balances",
      tone: "text-ink",
      value: dashboard.summary.totalAccountBalanceDisplay,
    },
    {
      detail: "Primary spending category for this month.",
      label: "Largest expense",
      tone: "text-ink",
      value: dashboard.summary.largestExpenseCategory,
    },
    {
      accent: (
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink">
          Plan
        </span>
      ),
      detail: "Planned spend still available before category caps.",
      label: "Remaining budget",
      tone: "text-ink",
      value: dashboard.summary.remainingBudgetDisplay,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          description={description}
          eyebrow="Dashboard"
          title={dashboard.summary.monthLabel}
        />
        {monthControl}
      </div>

      <section className="card-grid">
        {cards.map((card) => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {dashboard.categorySpend.length > 0 ? (
          <DashboardDonutChart segments={dashboard.categorySpend} />
        ) : (
          <EmptyState
            description="Expense category shares will appear after transactions are recorded for this period."
            title="No expense categories this month"
          />
        )}
        <DashboardSpendComparison bars={dashboard.incomeVsExpense} />
      </section>

      <section>
        {dashboard.dailySpending.length > 0 ? (
          <DashboardLineChart points={dashboard.dailySpending} />
        ) : (
          <EmptyState
            description="There are no expense points to plot for this month."
            title="No daily spend trend yet"
          />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {dashboard.recentTransactions.length > 0 ? (
          <DashboardTransactionsList
            transactions={dashboard.recentTransactions}
          />
        ) : (
          <EmptyState
            description="Once transaction activity exists, the latest entries will appear here."
            title="No recent transactions"
          />
        )}
        {dashboard.budgets.length > 0 ? (
          <DashboardBudgetList
            budgets={dashboard.budgets}
            periodLabel={budgetPeriodLabel}
          />
        ) : (
          <EmptyState
            description="Budget progress will appear here after monthly limits are added."
            title="No budgets configured"
          />
        )}
      </section>
    </div>
  );
}
