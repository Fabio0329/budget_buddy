"use client";

import Link from "next/link";
import { startTransition, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deleteBudget } from "@/app/budgets/_lib/budget.actions";
import type { ReadOnlyInteractionMode } from "@/shared/types/interaction-mode";
import type {
  BudgetMonthOption,
  BudgetOverviewItem,
} from "@/app/budgets/_lib/budget.types";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatCurrencyFromCents,
  monthLabelFromKey,
} from "@/shared/utils/formatters";

export interface BudgetsManagerProps {
  readonly initialBudgets: BudgetOverviewItem[];
  readonly monthOptions: BudgetMonthOption[];
  readonly readOnlyBudgetsByMonth?: Record<string, BudgetOverviewItem[]>;
  readonly readOnlyMode?: ReadOnlyInteractionMode;
  readonly selectedMonth: string;
}

export function BudgetsManager({
  initialBudgets,
  monthOptions,
  readOnlyBudgetsByMonth,
  readOnlyMode,
  selectedMonth,
}: BudgetsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localMonth, setLocalMonth] = useState(selectedMonth);
  const activeMonth = readOnlyMode ? localMonth : selectedMonth;
  const budgets = readOnlyMode
    ? (readOnlyBudgetsByMonth?.[activeMonth] ?? [])
    : initialBudgets;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const totalLimit = budgets.reduce(
    (sum, budget) => sum + budget.limitAmountCents,
    0,
  );
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spentAmountCents,
    0,
  );
  const nearOrOverCount = budgets.filter(
    (budget) => budget.status !== "under",
  ).length;

  function replaceMonth(month: string) {
    if (readOnlyMode) {
      setLocalMonth(month);
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("month", month);

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`);
    });
  }

  function removeBudget(id: string) {
    if (readOnlyMode) {
      readOnlyMode.onRestrictedAction("Deleting a budget");
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteBudget(id);
      setError(result.status === "error" ? (result.message ?? null) : null);
      setNotice(result.status === "success" ? (result.message ?? null) : null);
    });
  }

  return (
    <div className="space-y-6">
      <section className="card-grid">
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Budgets this month</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {budgets.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            One budget per expense category and month.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Total planned</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {formatCurrencyFromCents(totalLimit)}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Combined monthly limit across configured categories.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Near or over limit</p>
          <p className="mt-4 text-3xl font-semibold text-warning">
            {nearOrOverCount}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Categories currently at 80% usage or beyond.
          </p>
        </SectionCard>
      </section>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-[11px] font-semibold text-primary-strong">
              Monthly budget review
            </p>
            <h2 className="section-title mt-2 text-3xl text-ink">
              {monthLabelFromKey(activeMonth)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted">
              <span className="font-semibold text-ink">Month</span>
              <select
                className="bg-transparent font-semibold text-ink outline-none"
                onChange={(event) => replaceMonth(event.target.value)}
                value={activeMonth}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            {readOnlyMode ? (
              <button
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
                onClick={() =>
                  readOnlyMode.onRestrictedAction("Adding a budget")
                }
                type="button"
              >
                Add budget
              </button>
            ) : (
              <Link
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
                href={`/budgets/new?month=${selectedMonth}`}
              >
                Add budget
              </Link>
            )}
          </div>
        </div>
      </SectionCard>

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

      {budgets.length > 0 ? (
        <SectionCard className="p-6">
          <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[11px] font-semibold text-primary-strong">
                Budget rows
              </p>
              <h2 className="section-title mt-2 text-3xl text-ink">
                Spending against limits
              </h2>
            </div>
            <div className="text-sm text-muted">
              {formatCurrencyFromCents(totalSpent)} spent of{" "}
              {formatCurrencyFromCents(totalLimit)}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {budgets.map((budget) => (
              <div
                className="rounded-xl border border-line bg-surface p-5"
                key={budget.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: budget.categoryColor }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {budget.categoryName}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {budget.note || "No note added."}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      budget.status === "under"
                        ? "bg-positive-soft text-positive"
                        : budget.status === "near"
                          ? "bg-warning-soft text-warning"
                          : "bg-negative-soft text-negative"
                    }`}
                  >
                    {budget.status === "under"
                      ? "Under budget"
                      : budget.status === "near"
                        ? "Near limit"
                        : "Over budget"}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">
                      Limit
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {budget.limitDisplay}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">
                      Spent
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {budget.spentDisplay}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">
                      Remaining
                    </p>
                    <p
                      className={`mt-1 text-lg font-semibold ${
                        budget.remainingAmountCents >= 0
                          ? "text-ink"
                          : "text-negative"
                      }`}
                    >
                      {budget.remainingDisplay}
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-canvas-strong">
                  <div
                    className={`h-full rounded-full ${
                      budget.status === "under"
                        ? "bg-positive"
                        : budget.status === "near"
                          ? "bg-warning"
                          : "bg-negative"
                    }`}
                    style={{
                      width: `${Math.min(budget.progressPercent, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    {budget.progressPercent}% used
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {readOnlyMode ? (
                      <button
                        className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
                        onClick={() =>
                          readOnlyMode.onRestrictedAction("Editing a budget")
                        }
                        type="button"
                      >
                        Edit
                      </button>
                    ) : (
                      <Link
                        className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
                        href={`/budgets/${budget.id}/edit`}
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong disabled:cursor-wait disabled:opacity-55"
                      disabled={isDeleting}
                      onClick={() => removeBudget(budget.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <EmptyState
          title="No budgets for this month"
          description="Add your first monthly category budget to start comparing planned versus actual expense activity."
        />
      )}
    </div>
  );
}
