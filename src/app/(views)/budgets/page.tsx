import { PageHeader } from "@/shared/components/page-header";
import { BudgetsManager } from "@/features/budgets/components/budgets-manager.client";

type BudgetsPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Compare planned versus actual spending"
        description="This phase adds month-scoped budget management, derived spending progress from transaction activity, and create/edit flows for category limits."
      />
      <BudgetsManager initialMonth={params.month ?? "2026-07"} />
    </div>
  );
}
