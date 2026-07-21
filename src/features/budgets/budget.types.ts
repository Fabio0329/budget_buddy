import type { BudgetManagerVM } from "@/shared/types/view-models";

export type BudgetCategoryOption = {
  color: string;
  id: string;
  name: string;
};

export type BudgetMonthOption = {
  label: string;
  value: string;
};

export type BudgetOverviewItem = BudgetManagerVM & {
  progressPercent: number;
  remainingAmountCents: number;
  remainingDisplay: string;
  spentAmountCents: number;
  spentDisplay: string;
  status: "near" | "over" | "under";
};
