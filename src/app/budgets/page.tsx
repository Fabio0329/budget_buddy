import { PageHeader } from "@/shared/components/page-header";
import { BudgetsManager } from "@/app/budgets/_components/budgets-manager.client";
import {
  getBudgetMonthOptions,
  getBudgetOverviewItems,
} from "@/app/budgets/_lib/budget.queries";
import { parseBudgetMonth } from "@/app/budgets/_lib/budget.validation";
import { requireCurrentUser } from "@/server/auth/session";

type BudgetsPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const now = new Date();
  const fallbackMonth = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  const requestedMonth = params.month ?? fallbackMonth;
  const parsedMonth = parseBudgetMonth(requestedMonth);
  const selectedMonth = parsedMonth ? requestedMonth : fallbackMonth;
  const selected = parsedMonth ?? parseBudgetMonth(fallbackMonth)!;
  const [budgets, monthOptions] = await Promise.all([
    getBudgetOverviewItems(user.id, selected.year, selected.month),
    getBudgetMonthOptions(user.id, selectedMonth),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Compare planned versus actual spending"
        description="Manage persisted monthly limits and compare them with user-scoped expense activity calculated directly from your transactions."
      />
      <BudgetsManager
        initialBudgets={budgets}
        monthOptions={monthOptions}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
