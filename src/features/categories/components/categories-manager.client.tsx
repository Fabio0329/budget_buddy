"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import {
  deleteCategory as deleteCategoryAction,
  saveCategory,
} from "@/features/categories/category.actions";
import { initialCategoryFormState } from "@/features/categories/category-form-state";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import { formatCurrencyFromCents } from "@/shared/utils/formatters";
import type { ReadOnlyInteractionMode } from "@/shared/types/interaction-mode";
import type { CategoryManagerVM } from "@/shared/types/view-models";

const colorChoices = [
  { label: "Green", value: "#67C56E" },
  { label: "Navy", value: "#1F2B3D" },
  { label: "Gold", value: "#F5C24B" },
  { label: "Red", value: "#EF4444" },
  { label: "Slate", value: "#667085" },
];

type CategoryDraft = {
  color: string;
  iconToken: string;
  name: string;
  type: "income" | "expense";
};

export interface CategoriesManagerProps {
  readonly initialCategories: CategoryManagerVM[];
  readonly readOnlyMode?: ReadOnlyInteractionMode;
}

const emptyDraft: CategoryDraft = {
  color: colorChoices[0].value,
  iconToken: "OT",
  name: "",
  type: "expense",
};

function createDraft(category: CategoryManagerVM): CategoryDraft {
  return {
    color: category.color,
    iconToken: category.iconToken,
    name: category.name,
    type: category.type,
  };
}

export function CategoriesManager({
  initialCategories,
  readOnlyMode,
}: CategoriesManagerProps) {
  const categories = initialCategories;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFormFeedback, setShowFormFeedback] = useState(false);
  const [formState, formAction, isSaving] = useActionState(
    submitCategory,
    initialCategoryFormState,
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedCategory =
    mode === "edit"
      ? (categories.find((category) => category.id === selectedId) ?? null)
      : null;

  const grouped = useMemo(
    () => ({
      expense: categories.filter((category) => category.type === "expense"),
      income: categories.filter((category) => category.type === "income"),
    }),
    [categories],
  );
  const fieldErrors = showFormFeedback ? formState.errors : undefined;

  async function submitCategory(
    previousState: typeof initialCategoryFormState,
    formData: FormData,
  ) {
    if (readOnlyMode) {
      readOnlyMode.onRestrictedAction(
        mode === "edit" ? "Editing a category" : "Adding a category",
      );
      return previousState;
    }

    const result = await saveCategory(previousState, formData);
    setShowFormFeedback(true);
    setError(result.status === "error" ? (result.message ?? null) : null);
    setNotice(result.status === "success" ? (result.message ?? null) : null);

    if (result.status === "success" && result.entityId) {
      setMode("edit");
      setSelectedId(result.entityId);
    }

    return result;
  }

  function resetForCreate(type: "income" | "expense" = "expense") {
    if (readOnlyMode) {
      readOnlyMode.onRestrictedAction(`Adding an ${type} category`);
      return;
    }

    setMode("create");
    setSelectedId(null);
    setDraft({
      ...emptyDraft,
      type,
    });
    setShowFormFeedback(false);
    setError(null);
    setNotice(null);
  }

  function selectCategory(category: CategoryManagerVM) {
    if (readOnlyMode) {
      readOnlyMode.onRestrictedAction("Editing a category");
      return;
    }

    setMode("edit");
    setSelectedId(category.id);
    setDraft(createDraft(category));
    setShowFormFeedback(false);
    setError(null);
    setNotice(null);
  }

  function updateDraft<Key extends keyof CategoryDraft>(
    key: Key,
    value: CategoryDraft[Key],
  ) {
    setShowFormFeedback(false);
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function deleteCategory(category: CategoryManagerVM) {
    if (readOnlyMode) {
      readOnlyMode.onRestrictedAction("Deleting a category");
      return;
    }

    if (category.linkedTransactionCount > 0 || category.linkedBudgetCount > 0) {
      setError(
        "This category is still linked to transactions or budgets. Remove those links first or keep the category.",
      );
      setNotice(null);
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      setError(result.status === "error" ? (result.message ?? null) : null);
      setNotice(result.status === "success" ? (result.message ?? null) : null);

      if (result.status !== "success") return;

      const remaining = categories.filter((entry) => entry.id !== category.id);
      if (remaining.length === 0) {
        setMode("create");
        setSelectedId(null);
        setDraft(emptyDraft);
      } else if (selectedId === category.id) {
        setMode("edit");
        setSelectedId(remaining[0].id);
        setDraft(createDraft(remaining[0]));
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="card-grid">
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Expense categories</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {grouped.expense.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Core spending buckets used by budget and transaction workflows.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Income categories</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {grouped.income.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Separate income sources so inflow stays distinct from spend.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Linked transactions</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {categories.reduce(
              (sum, category) => sum + category.linkedTransactionCount,
              0,
            )}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Deleting a category remains blocked when transaction history depends
            on it.
          </p>
        </SectionCard>
      </section>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-[11px] font-semibold text-primary-strong">
              Category system
            </p>
            <h2 className="section-title mt-2 text-3xl text-ink">
              Income and expense groups stay separate
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface"
              onClick={() => resetForCreate("expense")}
              type="button"
            >
              Add expense category
            </button>
            <button
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
              onClick={() => resetForCreate("income")}
              type="button"
            >
              Add income category
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {(["expense", "income"] as const).map((type) => (
            <SectionCard key={type} className="p-6">
              <p className="eyebrow text-[11px] font-semibold text-primary-strong">
                {type === "expense"
                  ? "Expense categories"
                  : "Income categories"}
              </p>
              <h2 className="section-title mt-2 text-3xl text-ink">
                {type === "expense" ? "Spending buckets" : "Sources of income"}
              </h2>
              <div className="mt-6 space-y-3">
                {grouped[type].length > 0 ? (
                  grouped[type].map((category) => {
                    const isSelected =
                      mode === "edit" && selectedId === category.id;

                    return (
                      <div
                        key={category.id}
                        className={`rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-line-strong bg-surface shadow-sm"
                            : "border-line bg-surface"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-ink"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${category.color} 20%, var(--surface))`,
                              }}
                            >
                              {category.iconToken}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {category.name}
                              </p>
                              <p className="mt-1 text-sm text-muted">
                                {category.linkedTransactionCount} linked
                                transactions · {category.linkedBudgetCount}{" "}
                                budgets
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-muted">
                              Monthly average
                            </p>
                            <p className="mt-1 text-lg font-semibold text-ink">
                              {category.monthlyAverageDisplay}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-muted">
                              Type
                            </p>
                            <p className="mt-1 text-lg font-semibold text-ink">
                              {type === "expense" ? "Expense" : "Income"}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted">
                          {category.note}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
                            onClick={() => selectCategory(category)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={
                              (!readOnlyMode &&
                                (category.linkedTransactionCount > 0 ||
                                  category.linkedBudgetCount > 0)) ||
                              isDeleting
                            }
                            onClick={() => deleteCategory(category)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    title={`No ${type} categories yet`}
                    description={`Create your first ${type} category to organize future transactions and budgets.`}
                  />
                )}
              </div>
            </SectionCard>
          ))}
        </div>

        <SectionCard className="p-6">
          <p className="eyebrow text-[11px] font-semibold text-primary-strong">
            {mode === "edit" ? "Edit category" : "Create category"}
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            {mode === "edit"
              ? (selectedCategory?.name ?? "Category details")
              : "Add a category"}
          </h2>
          <form action={formAction} className="mt-6 grid gap-4">
            <input
              name="id"
              type="hidden"
              value={mode === "edit" ? (selectedCategory?.id ?? "") : ""}
            />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Name</span>
              <input
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
                maxLength={80}
                name="name"
                onChange={(event) => updateDraft("name", event.target.value)}
                placeholder="Groceries"
                value={draft.name}
              />
              {fieldErrors?.name ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Type</span>
              <select
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
                name="type"
                onChange={(event) =>
                  updateDraft(
                    "type",
                    event.target.value as CategoryDraft["type"],
                  )
                }
                value={draft.type}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              {fieldErrors?.type ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.type}
                </span>
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">
                Color accent
              </span>
              <select
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
                name="color"
                onChange={(event) => updateDraft("color", event.target.value)}
                value={draft.color}
              >
                {colorChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
              {fieldErrors?.color ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.color}
                </span>
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Icon token</span>
              <input
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm uppercase text-ink outline-none transition focus:border-primary focus:bg-surface"
                maxLength={2}
                name="iconToken"
                onChange={(event) =>
                  updateDraft("iconToken", event.target.value.toUpperCase())
                }
                placeholder="GR"
                value={draft.iconToken}
              />
              {fieldErrors?.iconToken ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.iconToken}
                </span>
              ) : null}
            </label>

            {error ? (
              <p className="rounded-xl border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
                {error}
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-xl border border-positive/20 bg-positive-soft px-4 py-3 text-sm text-positive">
                {notice}
              </p>
            ) : null}

            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">Preview</p>
              <div className="mt-4 flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-ink"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${draft.color} 20%, var(--surface))`,
                  }}
                >
                  {draft.iconToken || "OT"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {draft.name || "Category name"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {draft.type === "expense"
                      ? "Expense bucket"
                      : "Income source"}{" "}
                    · average {formatCurrencyFromCents(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Saving…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Create category"}
              </button>
              <button
                className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface"
                onClick={() => resetForCreate(draft.type)}
                type="button"
              >
                New category
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
