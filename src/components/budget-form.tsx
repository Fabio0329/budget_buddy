"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { dashboardMonthOptions, mockCategoryManagerItems } from "@/lib/mock-data";
import { useBudgetStore } from "@/lib/budget-store";
import { formatCurrencyFromCents, monthLabelFromKey } from "@/lib/formatters";
import type { BudgetFormValues, BudgetManagerVM } from "@/lib/view-models";

type BudgetFormProps = {
  mode: "create" | "edit";
  budgetId?: string;
  initialMonth?: string;
};

type FormErrors = Partial<Record<keyof BudgetFormValues, string>> & {
  form?: string;
};

function createInitialValues(month: string): BudgetFormValues {
  const firstExpenseCategory = mockCategoryManagerItems.find(
    (category) => category.type === "expense",
  );

  return {
    categoryId: firstExpenseCategory?.id ?? "",
    month: month,
    limitAmount: "",
    note: "",
  };
}

function toFormValues(budget: BudgetManagerVM): BudgetFormValues {
  return {
    categoryId: budget.categoryId,
    month: budget.month,
    limitAmount: (budget.limitAmountCents / 100).toFixed(2),
    note: budget.note,
  };
}

function findCategory(categoryId: string) {
  return mockCategoryManagerItems.find((category) => category.id === categoryId);
}

export function BudgetForm({
  mode,
  budgetId,
  initialMonth = dashboardMonthOptions[0]?.value ?? "2026-07",
}: Readonly<BudgetFormProps>) {
  const router = useRouter();
  const { budgets, createBudget, updateBudget } = useBudgetStore();
  const existingBudget =
    mode === "edit"
      ? budgets.find((budget) => budget.id === budgetId)
      : undefined;
  const [values, setValues] = useState<BudgetFormValues>(() =>
    existingBudget ? toFormValues(existingBudget) : createInitialValues(initialMonth),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const expenseCategories = mockCategoryManagerItems.filter(
    (category) => category.type === "expense",
  );

  if (expenseCategories.length === 0) {
    return (
      <EmptyState
        title="Add expense categories before budgets"
        description="Budgets only apply to expense categories. Create those categories first, then return here."
      />
    );
  }

  if (mode === "edit" && !existingBudget) {
    return (
      <EmptyState
        title="Budget not found"
        description="This budget could not be loaded from the mock store. Return to the budgets list and choose another item."
      />
    );
  }

  function updateValue<Key extends keyof BudgetFormValues>(
    key: Key,
    value: BudgetFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const limitAmountNumber = Number(values.limitAmount);

    if (!values.categoryId) {
      nextErrors.categoryId = "Select an expense category.";
    }

    if (!values.month) {
      nextErrors.month = "Select a month.";
    }

    if (Number.isNaN(limitAmountNumber) || limitAmountNumber <= 0) {
      nextErrors.limitAmount = "Limit must be greater than zero.";
    }

    const duplicateBudget = budgets.find(
      (budget) =>
        budget.categoryId === values.categoryId &&
        budget.month === values.month &&
        budget.id !== existingBudget?.id,
    );

    if (duplicateBudget) {
      nextErrors.form =
        "A budget already exists for this category and month. Edit the existing budget instead.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveBudget() {
    if (!validate()) {
      return;
    }

    const category = findCategory(values.categoryId);
    if (!category) {
      setErrors({ form: "Selected category is unavailable." });
      return;
    }

    const limitAmountCents = Math.round(Number(values.limitAmount) * 100);
    const nextBudget: BudgetManagerVM = {
      id:
        mode === "edit" && existingBudget
          ? existingBudget.id
          : `budget-${Math.random().toString(36).slice(2, 10)}`,
      categoryColor: category.color,
      categoryId: category.id,
      categoryName: category.name,
      limitAmountCents,
      limitDisplay: formatCurrencyFromCents(limitAmountCents),
      month: values.month,
      monthLabel: monthLabelFromKey(values.month),
      note: values.note.trim(),
    };

    if (mode === "edit" && existingBudget) {
      updateBudget(nextBudget);
    } else {
      createBudget(nextBudget);
    }

    router.push(`/budgets?month=${values.month}`);
  }

  return (
    <SectionCard className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-accent">
            {mode === "edit" ? "Edit budget" : "New budget"}
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            {mode === "edit" ? "Adjust a category limit" : "Create a monthly budget"}
          </h2>
        </div>
        <Link
          className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
          href="/budgets"
        >
          Back to budgets
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Category</span>
          <select
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("categoryId", event.target.value)}
            value={values.categoryId}
          >
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <p className="text-sm text-negative">{errors.categoryId}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Month</span>
          <select
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("month", event.target.value)}
            value={values.month}
          >
            {dashboardMonthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {errors.month ? <p className="text-sm text-negative">{errors.month}</p> : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Limit amount</span>
          <input
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            inputMode="decimal"
            onChange={(event) => updateValue("limitAmount", event.target.value)}
            placeholder="0.00"
            value={values.limitAmount}
          />
          {errors.limitAmount ? (
            <p className="text-sm text-negative">{errors.limitAmount}</p>
          ) : null}
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-ink">Note</span>
          <textarea
            className="min-h-28 w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("note", event.target.value)}
            placeholder="Optional reminder about what this budget should cover"
            value={values.note}
          />
        </label>
      </div>

      {errors.form ? (
        <p className="mt-4 rounded-[20px] border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
          {errors.form}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
          onClick={saveBudget}
          type="button"
        >
          {mode === "edit" ? "Save budget" : "Create budget"}
        </button>
        <Link
          className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
          href="/budgets"
        >
          Cancel
        </Link>
      </div>
    </SectionCard>
  );
}
