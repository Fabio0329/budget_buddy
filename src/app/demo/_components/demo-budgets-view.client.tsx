"use client";

import { BudgetsManager } from "@/app/budgets/_components/budgets-manager.client";
import type { DemoSnapshot } from "@/app/demo/_lib/demo-data";
import { PageHeader } from "@/shared/components/page-header";

interface DemoBudgetsViewProps {
  readonly budgetsByMonth: DemoSnapshot["budgetsByMonth"];
  readonly monthOptions: DemoSnapshot["monthOptions"];
  readonly onMutation: (action: string) => void;
}

export function DemoBudgetsView({
  budgetsByMonth,
  monthOptions,
  onMutation,
}: DemoBudgetsViewProps) {
  const selectedMonth = monthOptions[0].value;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Compare category-level plans with actual spending and quickly spot areas approaching or exceeding their limits."
        eyebrow="Budgets"
        title="Planned versus actual spending"
      />
      <BudgetsManager
        initialBudgets={budgetsByMonth[selectedMonth]}
        monthOptions={monthOptions}
        readOnlyBudgetsByMonth={budgetsByMonth}
        readOnlyMode={{ onRestrictedAction: onMutation }}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
