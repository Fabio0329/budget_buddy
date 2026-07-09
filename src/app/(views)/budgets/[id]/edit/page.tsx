import { PageHeader } from "@/components/page-header";
import { BudgetForm } from "@/components/budget-form";

type EditBudgetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Edit a budget"
        description="Update a category limit and keep the monthly comparison view aligned with current spending."
      />
      <BudgetForm budgetId={id} mode="edit" />
    </div>
  );
}
