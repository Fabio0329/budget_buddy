"use client";

import Link from "next/link";
import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import { dashboardMonthOptions } from "@/mocks/finance";
import { useBudgetStore } from "@/features/budgets/budget.store";
import { useTransactionStore } from "@/features/transactions/transaction.store";
import {
  formatCurrencyFromCents,
  monthLabelFromKey,
  monthStartAndEnd,
} from "@/shared/utils/formatters";
import type { BudgetManagerVM, TransactionManagerVM } from "@/shared/types/view-models";

type DerivedBudget = BudgetManagerVM & {
  spentAmountCents: number;
  spentDisplay: string;
  remainingAmountCents: number;
  remainingDisplay: string;
  progressPercent: number;
  status: "under" | "near" | "over";
};

function deriveSpentForBudget(
  transactions: TransactionManagerVM[],
  budget: BudgetManagerVM,
) {
  const { start, end } = monthStartAndEnd(budget.month);

  return transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.categoryId === budget.categoryId &&
        transaction.date >= start &&
        transaction.date <= end,
    )
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);
}

function deriveBudgetRow(
  budget: BudgetManagerVM,
  transactions: TransactionManagerVM[],
): DerivedBudget {
  const spentAmountCents = deriveSpentForBudget(transactions, budget);
  const remainingAmountCents = budget.limitAmountCents - spentAmountCents;
  const progressPercent = Math.round(
    (spentAmountCents / Math.max(budget.limitAmountCents, 1)) * 100,
  );
  const status =
    progressPercent >= 100 ? "over" : progressPercent >= 80 ? "near" : "under";

  return {
    ...budget,
    progressPercent,
    remainingAmountCents,
    remainingDisplay: formatCurrencyFromCents(remainingAmountCents),
    spentAmountCents,
    spentDisplay: formatCurrencyFromCents(spentAmountCents),
    status,
  };
}

export function BudgetsManager({
  initialMonth,
}: Readonly<{
  initialMonth: string;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { budgets, deleteBudget } = useBudgetStore();
  const { transactions } = useTransactionStore();

  const selectedMonth =
    dashboardMonthOptions.find((option) => option.value === initialMonth)?.value ??
    dashboardMonthOptions[0].value;

  const derivedBudgets = budgets
    .filter((budget) => budget.month === selectedMonth)
    .map((budget) => deriveBudgetRow(budget, transactions))
    .sort((left, right) => left.categoryName.localeCompare(right.categoryName));

  const totalLimit = derivedBudgets.reduce(
    (sum, budget) => sum + budget.limitAmountCents,
    0,
  );
  const totalSpent = derivedBudgets.reduce(
    (sum, budget) => sum + budget.spentAmountCents,
    0,
  );
  const nearOrOverCount = derivedBudgets.filter(
    (budget) => budget.status !== "under",
  ).length;

  function replaceMonth(month: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("month", month);

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`);
    });
  }

  return (
    <div className="space-y-6">
      <section className="card-grid">
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Budgets this month</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {derivedBudgets.length}
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
            <p className="eyebrow text-[11px] font-semibold text-accent">
              Monthly budget review
            </p>
            <h2 className="section-title mt-2 text-3xl text-ink">
              {monthLabelFromKey(selectedMonth)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-3 rounded-full border border-line bg-white/70 px-4 py-2 text-sm text-muted">
              <span className="font-semibold text-ink">Month</span>
              <select
                className="bg-transparent font-semibold text-ink outline-none"
                onChange={(event) => replaceMonth(event.target.value)}
                value={selectedMonth}
              >
                {dashboardMonthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            <Link
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
              href={`/budgets/new?month=${selectedMonth}`}
            >
              Add budget
            </Link>
          </div>
        </div>
      </SectionCard>

      {derivedBudgets.length > 0 ? (
        <SectionCard className="p-6">
          <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[11px] font-semibold text-accent">
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
            {derivedBudgets.map((budget) => (
              <div
                key={budget.id}
                className="rounded-[24px] border border-line bg-white/70 p-5"
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
                      <p className="mt-1 text-sm text-muted">{budget.note}</p>
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
                    style={{ width: `${Math.min(budget.progressPercent, 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    {budget.progressPercent}% used
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
                      href={`/budgets/${budget.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
                      onClick={() => deleteBudget(budget.id)}
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
