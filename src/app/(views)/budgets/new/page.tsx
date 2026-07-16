import { PageHeader } from "@/shared/components/page-header";
import { BudgetForm } from "@/features/budgets/components/budget-form.client";
import {
  getBudgetCategoryOptions,
  getBudgetMonthOptions,
} from "@/features/budgets/budget.queries";
import { parseBudgetMonth } from "@/features/budgets/budget.validation";
import { requireCurrentUser } from "@/server/auth/session";

type NewBudgetPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function NewBudgetPage({
  searchParams,
}: NewBudgetPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const now = new Date();
  const fallbackMonth = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  const initialMonth =
    params.month && parseBudgetMonth(params.month) ? params.month : fallbackMonth;
  const [categories, monthOptions] = await Promise.all([
    getBudgetCategoryOptions(user.id),
    getBudgetMonthOptions(user.id, initialMonth),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Create a budget"
        description="Set a monthly spending limit for an expense category and compare it against actual transaction activity."
      />
      <BudgetForm
        categories={categories}
        initialMonth={initialMonth}
        mode="create"
        monthOptions={monthOptions}
      />
    </div>
  );
}
