"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { saveBudget } from "@/features/budgets/budget.actions";
import { initialBudgetFormState } from "@/features/budgets/budget-form-state";
import type {
  BudgetCategoryOption,
  BudgetMonthOption,
} from "@/features/budgets/budget.types";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import type {
  BudgetFormValues,
  BudgetManagerVM,
} from "@/shared/types/view-models";

type BudgetFormProps = {
  categories: BudgetCategoryOption[];
  initialBudget?: BudgetManagerVM;
  initialMonth?: string;
  mode: "create" | "edit";
  monthOptions: BudgetMonthOption[];
};

function createInitialValues(
  categories: BudgetCategoryOption[],
  month: string,
): BudgetFormValues {
  return {
    categoryId: categories[0]?.id ?? "",
    limitAmount: "",
    month,
    note: "",
  };
}

function toFormValues(budget: BudgetManagerVM): BudgetFormValues {
  return {
    categoryId: budget.categoryId,
    limitAmount: (budget.limitAmountCents / 100).toFixed(2),
    month: budget.month,
    note: budget.note,
  };
}

export function BudgetForm({
  categories,
  initialBudget,
  initialMonth,
  mode,
  monthOptions,
}: Readonly<BudgetFormProps>) {
  const router = useRouter();
  const [values, setValues] = useState<BudgetFormValues>(() =>
    initialBudget
      ? toFormValues(initialBudget)
      : createInitialValues(
          categories,
          initialMonth ?? monthOptions[0]?.value ?? "",
        ),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [formState, formAction, isSaving] = useActionState(
    submitBudget,
    initialBudgetFormState,
  );
  const errors = showFeedback ? formState.errors : undefined;

  async function submitBudget(
    previousState: typeof initialBudgetFormState,
    formData: FormData,
  ) {
    const result = await saveBudget(previousState, formData);
    setShowFeedback(true);

    if (result.status === "success") {
      router.push(`/budgets?month=${result.month ?? values.month}`);
    }

    return result;
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title="Add expense categories before budgets"
        description="Budgets only apply to expense categories. Create one first, then return here."
      />
    );
  }

  function updateValue<Key extends keyof BudgetFormValues>(
    key: Key,
    value: BudgetFormValues[Key],
  ) {
    setShowFeedback(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <SectionCard className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-accent">
            {mode === "edit" ? "Edit budget" : "New budget"}
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            {mode === "edit"
              ? "Adjust a category limit"
              : "Create a monthly budget"}
          </h2>
        </div>
        <Link
          className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
          href={`/budgets?month=${values.month}`}
        >
          Back to budgets
        </Link>
      </div>

      <form action={formAction} className="mt-6">
        <input name="id" type="hidden" value={initialBudget?.id ?? ""} />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Category</span>
            <select
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              name="categoryId"
              onChange={(event) =>
                updateValue("categoryId", event.target.value)
              }
              value={values.categoryId}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors?.categoryId ? (
              <p className="text-sm text-negative">{errors.categoryId}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Month</span>
            <select
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              name="month"
              onChange={(event) => updateValue("month", event.target.value)}
              value={values.month}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            {errors?.month ? (
              <p className="text-sm text-negative">{errors.month}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Limit amount</span>
            <input
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              inputMode="decimal"
              name="limitAmount"
              onChange={(event) =>
                updateValue("limitAmount", event.target.value)
              }
              placeholder="0.00"
              value={values.limitAmount}
            />
            {errors?.limitAmount ? (
              <p className="text-sm text-negative">{errors.limitAmount}</p>
            ) : null}
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-ink">Note</span>
            <textarea
              className="min-h-28 w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              maxLength={2000}
              name="note"
              onChange={(event) => updateValue("note", event.target.value)}
              placeholder="Optional reminder about what this budget should cover"
              value={values.note}
            />
            {errors?.note ? (
              <p className="text-sm text-negative">{errors.note}</p>
            ) : null}
          </label>
        </div>

        {showFeedback && formState.status === "error" && formState.message ? (
          <p className="mt-4 rounded-[20px] border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
            {formState.message}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? "Saving…"
              : mode === "edit"
                ? "Save budget"
                : "Create budget"}
          </button>
          <Link
            className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
            href={`/budgets?month=${values.month}`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </SectionCard>
  );
}
