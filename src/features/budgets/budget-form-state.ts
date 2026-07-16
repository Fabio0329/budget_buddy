import type { BudgetFormValues } from "@/shared/types/view-models";

export type BudgetFormState = {
  entityId?: string;
  errors?: Partial<Record<keyof BudgetFormValues, string>>;
  message?: string;
  month?: string;
  status?: "error" | "success";
};

export const initialBudgetFormState: BudgetFormState = {};
