"use client";

import Link from "next/link";
import {
  startTransition,
  useDeferredValue,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deleteTransaction } from "@/features/transactions/transaction.actions";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import { formatCurrencyFromCents } from "@/shared/utils/formatters";
import type { ReadOnlyInteractionMode } from "@/shared/types/interaction-mode";
import type {
  AccountManagerVM,
  CategoryManagerVM,
  TransactionFilterState,
  TransactionManagerVM,
} from "@/shared/types/view-models";

export interface TransactionsManagerProps {
  readonly accounts: AccountManagerVM[];
  readonly categories: CategoryManagerVM[];
  readonly initialFilters: TransactionFilterState;
  readonly initialTransactions: TransactionManagerVM[];
  readonly readOnlyMode?: ReadOnlyInteractionMode;
}

function parseAmount(value: string | null) {
  if (!value) {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : Math.round(number * 100);
}

export function TransactionsManager({
  accounts,
  categories,
  initialFilters,
  initialTransactions,
  readOnlyMode,
}: TransactionsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const transactions = initialTransactions;
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const filters = readOnlyMode ? localFilters : initialFilters;
  const deferredQuery = useDeferredValue(filters.query);
  const hasAccounts = accounts.length > 0;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function removeTransaction(id: string) {
    if (readOnlyMode) {
      readOnlyMode.onRestrictedAction("Deleting a transaction");
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteTransaction(id);
      setError(result.status === "error" ? (result.message ?? null) : null);
      setNotice(result.status === "success" ? (result.message ?? null) : null);
    });
  }

  function replaceSearchParam(name: string, value: string | null) {
    if (readOnlyMode) {
      const key = name === "q" ? "query" : name;
      const fallback =
        key === "query"
          ? ""
          : key === "type"
            ? "all"
            : key === "sort"
              ? "date-desc"
              : null;
      setLocalFilters((current) => ({
        ...current,
        [key]: value || fallback,
      }));
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      nextParams.delete(name);
    } else {
      nextParams.set(name, value);
    }

    startTransition(() => {
      router.replace(
        nextParams.toString() ? `${pathname}?${nextParams}` : pathname,
      );
    });
  }

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesQuery =
        deferredQuery.trim().length === 0 ||
        transaction.merchant
          .toLowerCase()
          .includes(deferredQuery.toLowerCase()) ||
        transaction.description
          .toLowerCase()
          .includes(deferredQuery.toLowerCase());

      const matchesType =
        filters.type === "all" || transaction.type === filters.type;

      const matchesAccount =
        !filters.accountId || transaction.accountId === filters.accountId;

      const matchesCategory =
        !filters.categoryId || transaction.categoryId === filters.categoryId;

      const matchesDateFrom =
        !filters.dateFrom || transaction.date >= filters.dateFrom;

      const matchesDateTo =
        !filters.dateTo || transaction.date <= filters.dateTo;

      const minAmountCents = parseAmount(filters.amountMin);
      const maxAmountCents = parseAmount(filters.amountMax);
      const absoluteAmount = Math.abs(transaction.amountCents);

      const matchesMin =
        minAmountCents === null || absoluteAmount >= minAmountCents;
      const matchesMax =
        maxAmountCents === null || absoluteAmount <= maxAmountCents;

      return (
        matchesQuery &&
        matchesType &&
        matchesAccount &&
        matchesCategory &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesMin &&
        matchesMax
      );
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case "date-asc":
          return left.date.localeCompare(right.date);
        case "amount-desc":
          return Math.abs(right.amountCents) - Math.abs(left.amountCents);
        case "amount-asc":
          return Math.abs(left.amountCents) - Math.abs(right.amountCents);
        case "date-desc":
        default:
          return right.date.localeCompare(left.date);
      }
    });

  const expenseTotal = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);
  const incomeTotal = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);

  return (
    <div className="space-y-6">
      <section className="card-grid">
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Visible transactions</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {filteredTransactions.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Filtered by your current search, type, and date selections.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Visible expenses</p>
          <p className="mt-4 text-3xl font-semibold text-negative">
            {formatCurrencyFromCents(expenseTotal)}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Expense totals update immediately with filters and edits.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Visible income</p>
          <p className="mt-4 text-3xl font-semibold text-positive">
            {formatCurrencyFromCents(incomeTotal)}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Income stays separate from expense activity for review clarity.
          </p>
        </SectionCard>
      </section>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-[11px] font-semibold text-accent">
              Filters
            </p>
            <h2 className="section-title mt-2 text-3xl text-ink">
              Search and refine activity
            </h2>
          </div>
          {readOnlyMode ? (
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
              onClick={() =>
                readOnlyMode.onRestrictedAction("Adding a transaction")
              }
              type="button"
            >
              Add transaction
            </button>
          ) : (
            <Link
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                hasAccounts
                  ? "bg-ink text-canvas hover:opacity-90"
                  : "cursor-not-allowed border border-line bg-white/70 text-muted"
              }`}
              href={hasAccounts ? "/transactions/new" : "/accounts"}
            >
              {hasAccounts ? "Add transaction" : "Add account first"}
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Search</span>
            <input
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              onChange={(event) =>
                replaceSearchParam("q", event.target.value || null)
              }
              placeholder="Merchant or description"
              value={filters.query}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Type</span>
            <select
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              onChange={(event) =>
                replaceSearchParam("type", event.target.value)
              }
              value={filters.type}
            >
              <option value="all">All types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Account</span>
            <select
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              onChange={(event) =>
                replaceSearchParam("accountId", event.target.value || null)
              }
              value={filters.accountId ?? ""}
            >
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Category</span>
            <select
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              onChange={(event) =>
                replaceSearchParam("categoryId", event.target.value || null)
              }
              value={filters.categoryId ?? ""}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Date from</span>
            <input
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              onChange={(event) =>
                replaceSearchParam("dateFrom", event.target.value || null)
              }
              type="date"
              value={filters.dateFrom ?? ""}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Date to</span>
            <input
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              onChange={(event) =>
                replaceSearchParam("dateTo", event.target.value || null)
              }
              type="date"
              value={filters.dateTo ?? ""}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Min amount</span>
            <input
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              inputMode="decimal"
              onChange={(event) =>
                replaceSearchParam("amountMin", event.target.value || null)
              }
              placeholder="0.00"
              value={filters.amountMin ?? ""}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Max amount</span>
            <input
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
              inputMode="decimal"
              onChange={(event) =>
                replaceSearchParam("amountMax", event.target.value || null)
              }
              placeholder="0.00"
              value={filters.amountMax ?? ""}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-ink">Sort</span>
            <select
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm text-ink outline-none transition focus:border-accent"
              onChange={(event) =>
                replaceSearchParam("sort", event.target.value)
              }
              value={filters.sort}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Largest amount</option>
              <option value="amount-asc">Smallest amount</option>
            </select>
          </label>
          <button
            className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
            onClick={() =>
              readOnlyMode
                ? setLocalFilters(initialFilters)
                : router.replace(pathname)
            }
            type="button"
          >
            Clear filters
          </button>
        </div>
      </SectionCard>

      {error ? (
        <p className="rounded-[20px] border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-[20px] border border-positive/20 bg-positive-soft px-4 py-3 text-sm text-positive">
          {notice}
        </p>
      ) : null}

      {filteredTransactions.length > 0 ? (
        <SectionCard className="overflow-hidden p-0">
          <div className="hidden grid-cols-[96px_1.1fr_0.8fr_0.8fr_130px_140px] gap-4 border-b border-line bg-white/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted lg:grid">
            <span>Date</span>
            <span>Merchant / description</span>
            <span>Account</span>
            <span>Category</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-line">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid gap-4 bg-white/50 px-6 py-5 lg:grid-cols-[96px_1.1fr_0.8fr_0.8fr_130px_140px] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {transaction.dateDisplay}
                  </p>
                  <p className="mt-1 text-xs text-muted lg:hidden">
                    {transaction.accountName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {transaction.merchant || "No merchant"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {transaction.description || "No description"}
                  </p>
                  {transaction.notes ? (
                    <p className="mt-2 text-xs text-muted">
                      {transaction.notes}
                    </p>
                  ) : null}
                </div>
                <p className="hidden text-sm text-muted lg:block">
                  {transaction.accountName}
                </p>
                <p className="hidden text-sm text-muted lg:block">
                  {transaction.categoryName}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      transaction.type === "expense"
                        ? "bg-negative-soft text-negative"
                        : transaction.type === "income"
                          ? "bg-positive-soft text-positive"
                          : "bg-accent-soft text-accent"
                    }`}
                  >
                    {transaction.type}
                  </span>
                  <span className="text-xs text-muted lg:hidden">
                    {transaction.categoryName}
                  </span>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      transaction.type === "expense"
                        ? "text-negative"
                        : transaction.type === "income"
                          ? "text-positive"
                          : "text-ink"
                    }`}
                  >
                    {transaction.amountDisplay}
                  </p>
                  <div className="mt-3 flex justify-end gap-2">
                    {readOnlyMode ? (
                      <button
                        className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-line-strong"
                        onClick={() =>
                          readOnlyMode.onRestrictedAction(
                            "Editing a transaction",
                          )
                        }
                        type="button"
                      >
                        Edit
                      </button>
                    ) : (
                      <Link
                        className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-line-strong"
                        href={`/transactions/${transaction.id}/edit`}
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-line-strong disabled:cursor-wait disabled:opacity-55"
                      disabled={isDeleting}
                      onClick={() => removeTransaction(transaction.id)}
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
          title="No transactions match these filters"
          description="Adjust the filters or add a new transaction to populate the list."
        />
      )}
    </div>
  );
}
