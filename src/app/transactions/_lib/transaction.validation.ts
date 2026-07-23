import type { TransactionType } from "@/server/generated/prisma/enums";
import type {
  TransactionFormValues,
} from "@/shared/types/view-models";

const transactionTypes: Record<string, TransactionType> = {
  expense: "EXPENSE",
  income: "INCOME",
  transfer: "TRANSFER",
};

type TransactionInput = Record<keyof TransactionFormValues, string>;

function parseAmount(value: string) {
  const normalized = value.trim().replace(/[$\s]/g, "");
  const currencyPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;

  if (!currencyPattern.test(normalized)) {
    return { error: "Enter a valid positive amount with up to two decimals." };
  }

  const cents = Math.round(Number(normalized.replaceAll(",", "")) * 100);

  if (!Number.isSafeInteger(cents) || cents < 1 || cents > 2_147_483_647) {
    return { error: "Enter an amount between $0.01 and $21,474,836.47." };
  }

  return { cents };
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

export function validateTransactionInput(input: TransactionInput) {
  const type = transactionTypes[input.type];
  const accountId = input.accountId.trim();
  const categoryId = input.categoryId.trim();
  const amount = parseAmount(input.amount);
  const merchant = input.merchant.trim();
  const description = input.description.trim();
  const date = parseDate(input.date.trim());
  const notes = input.notes.trim();
  const errors: Partial<Record<keyof TransactionFormValues, string>> = {};

  if (!type) errors.type = "Choose a valid transaction type.";
  if (!accountId) errors.accountId = "Select an account.";
  if (amount.error) errors.amount = amount.error;
  if (!date) errors.date = "Enter a valid transaction date.";
  if (type !== "TRANSFER" && !categoryId) {
    errors.categoryId = "Select a category.";
  }
  if (type === "EXPENSE" && !merchant && !description) {
    errors.merchant = "Add a merchant or description for expense transactions.";
  }
  if (merchant.length > 160) errors.merchant = "Use 160 characters or fewer.";
  if (description.length > 240) {
    errors.description = "Use 240 characters or fewer.";
  }
  if (notes.length > 2_000) errors.notes = "Use 2,000 characters or fewer.";

  if (Object.keys(errors).length > 0 || !type || !date || !amount.cents) {
    return { errors };
  }

  const amountCents = type === "EXPENSE" ? -amount.cents : amount.cents;

  return {
    data: {
      accountId,
      amountCents,
      categoryId: type === "TRANSFER" ? null : categoryId,
      date,
      description,
      merchant,
      notes: notes || null,
      type,
    },
  };
}

export function validateTransactionForm(formData: FormData) {
  return validateTransactionInput({
    accountId: String(formData.get("accountId") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    date: String(formData.get("date") ?? ""),
    description: String(formData.get("description") ?? ""),
    merchant: String(formData.get("merchant") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    type: String(formData.get("type") ?? ""),
  });
}
