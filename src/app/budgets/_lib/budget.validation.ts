import type { BudgetFormValues } from "@/shared/types/view-models";

function parseLimitAmount(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(/[$\s]/g, "");
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

export function parseBudgetMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12
    ? { month, year }
    : null;
}

export function validateBudgetForm(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const monthKey = String(formData.get("month") ?? "").trim();
  const parsedMonth = parseBudgetMonth(monthKey);
  const limitAmount = parseLimitAmount(formData.get("limitAmount"));
  const note = String(formData.get("note") ?? "").trim();
  const errors: Partial<Record<keyof BudgetFormValues, string>> = {};

  if (!categoryId) errors.categoryId = "Select an expense category.";
  if (!parsedMonth) errors.month = "Select a valid budget month.";
  if (limitAmount.error) errors.limitAmount = limitAmount.error;
  if (note.length > 2_000) errors.note = "Use 2,000 characters or fewer.";

  if (
    Object.keys(errors).length > 0 ||
    !parsedMonth ||
    !limitAmount.cents
  ) {
    return { errors };
  }

  return {
    data: {
      categoryId,
      limitAmountCents: limitAmount.cents,
      month: parsedMonth.month,
      note: note || null,
      year: parsedMonth.year,
    },
    monthKey,
  };
}
