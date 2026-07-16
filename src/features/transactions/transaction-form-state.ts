import type { TransactionFormValues } from "@/shared/types/view-models";

export type TransactionFormState = {
  entityId?: string;
  errors?: Partial<Record<keyof TransactionFormValues, string>>;
  message?: string;
  status?: "error" | "success";
};

export type TransactionImportInput = {
  accountId: string;
  amountCents: number;
  categoryId: string | null;
  date: string;
  description: string;
  merchant: string;
  notes: string;
  type: TransactionFormValues["type"];
};

export type TransactionImportState = {
  importedCount?: number;
  message: string;
  skippedCount?: number;
  status: "error" | "success";
};

export const initialTransactionFormState: TransactionFormState = {};
