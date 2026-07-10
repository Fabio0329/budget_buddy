import { PageHeader } from "@/components/page-header";
import { BudgetForm } from "../_components/budget-form";

type NewBudgetPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function NewBudgetPage({
  searchParams,
}: NewBudgetPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Create a budget"
        description="Set a monthly spending limit for an expense category and compare it against actual transaction activity."
      />
      <BudgetForm initialMonth={params.month} mode="create" />
    </div>
  );
}
