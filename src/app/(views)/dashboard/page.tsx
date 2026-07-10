import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DashboardBudgetList } from "./_components/dashboard-budget-list";
import { DashboardDonutChart } from "./_components/dashboard-donut-chart";
import { DashboardGoalCard } from "./_components/dashboard-goal-card";
import { DashboardLineChart } from "./_components/dashboard-line-chart";
import { DashboardMonthSwitcher } from "./_components/dashboard-month-switcher";
import { DashboardRecurringList } from "./_components/dashboard-recurring-list";
import { DashboardSpendComparison } from "./_components/dashboard-spend-comparison";
import { DashboardStatCard } from "./_components/dashboard-stat-card";
import { DashboardTransactionsList } from "./_components/dashboard-transactions-list";
import {
  dashboardMonthOptions,
  getDashboardMonthData,
} from "@/lib/mock-data";
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
  const dashboard = getDashboardMonthData(params.month);
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
      detail: "Outflow tracked across categories and recurring costs.",
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Dashboard"
          title={dashboard.summary.monthLabel}
          description="This overview consolidates cash flow, budget pressure, recurring items, and recent activity into one monthly review surface."
        />
        <DashboardMonthSwitcher
          activeMonth={dashboard.id}
          months={dashboardMonthOptions}
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

      {dashboard.categorySpend.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DashboardDonutChart segments={dashboard.categorySpend} />
          <DashboardSpendComparison bars={dashboard.incomeVsExpense} />
        </section>
      ) : (
        <EmptyState
          title="No dashboard data for this month"
          description="Use the month picker to review a populated period. This zero-state is intentional so empty data can be reviewed before backend integration."
        />
      )}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {dashboard.dailySpending.length > 0 ? (
          <DashboardLineChart points={dashboard.dailySpending} />
        ) : (
          <EmptyState
            title="No daily spend trend yet"
            description="There are no expense points to plot for this month."
          />
        )}
        <DashboardGoalCard goal={dashboard.goal} />
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
        <div className="space-y-6">
          {dashboard.budgets.length > 0 ? (
            <DashboardBudgetList budgets={dashboard.budgets} />
          ) : (
            <EmptyState
              title="No budgets configured"
              description="Budget progress will appear here after monthly limits are added."
            />
          )}
          {dashboard.upcomingRecurring.length > 0 ? (
            <DashboardRecurringList items={dashboard.upcomingRecurring} />
          ) : (
            <EmptyState
              title="No recurring items"
              description="Upcoming recurring bills or income will appear here once they are configured."
            />
          )}
        </div>
      </section>
    </div>
  );
}
