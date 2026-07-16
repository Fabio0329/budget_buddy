import { PageHeader } from "@/shared/components/page-header";
import { BudgetForm } from "@/features/budgets/components/budget-form.client";
import { notFound } from "next/navigation";
import {
  getBudgetCategoryOptions,
  getBudgetManagerItem,
  getBudgetMonthOptions,
} from "@/features/budgets/budget.queries";
import { requireCurrentUser } from "@/server/auth/session";

type EditBudgetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const [budget, categories, monthOptions] = await Promise.all([
    getBudgetManagerItem(user.id, id),
    getBudgetCategoryOptions(user.id),
    getBudgetMonthOptions(user.id),
  ]);

  if (!budget) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Edit a budget"
        description="Update a category limit and keep the monthly comparison view aligned with current spending."
      />
      <BudgetForm
        categories={categories}
        initialBudget={budget}
        mode="edit"
        monthOptions={monthOptions}
      />
    </div>
  );
}
