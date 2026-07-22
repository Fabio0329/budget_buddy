"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import { saveTransaction } from "@/features/transactions/transaction.actions";
import { initialTransactionFormState } from "@/features/transactions/transaction-form-state";
import { formatDateForInput } from "@/shared/utils/formatters";
import type {
  AccountManagerVM,
  CategoryManagerVM,
  TransactionFormValues,
  TransactionManagerVM,
} from "@/shared/types/view-models";

type TransactionFormProps = {
  accounts: AccountManagerVM[];
  categories: CategoryManagerVM[];
  initialTransaction?: TransactionManagerVM;
  mode: "create" | "edit";
};

function createInitialValues(
  accounts: AccountManagerVM[],
  categories: CategoryManagerVM[],
): TransactionFormValues {
  const firstExpenseCategory =
    categories.find((category) => category.type === "expense") ?? categories[0];

  return {
    type: "expense",
    accountId: accounts[0]?.id ?? "",
    categoryId: firstExpenseCategory?.id ?? "",
    amount: "",
    merchant: "",
    description: "",
    date: formatDateForInput(new Date().toISOString()),
    notes: "",
  };
}

function toFormValues(
  transaction: TransactionManagerVM,
): TransactionFormValues {
  return {
    type: transaction.type,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId ?? "",
    amount: (Math.abs(transaction.amountCents) / 100).toFixed(2),
    merchant: transaction.merchant,
    description: transaction.description,
    date: formatDateForInput(transaction.date),
    notes: transaction.notes,
  };
}

export function TransactionForm({
  accounts,
  categories,
  initialTransaction,
  mode,
}: Readonly<TransactionFormProps>) {
  const router = useRouter();
  const [values, setValues] = useState<TransactionFormValues>(() =>
    initialTransaction
      ? toFormValues(initialTransaction)
      : createInitialValues(accounts, categories),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [formState, formAction, isSaving] = useActionState(
    submitTransaction,
    initialTransactionFormState,
  );
  const errors = showFeedback ? formState.errors : undefined;

  async function submitTransaction(
    previousState: typeof initialTransactionFormState,
    formData: FormData,
  ) {
    const result = await saveTransaction(previousState, formData);
    setShowFeedback(true);

    if (result.status === "success") {
      router.push("/transactions");
    }

    return result;
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        title="Add an account before entering transactions"
        description="Transactions depend on at least one account. Create an account first, then return here."
      />
    );
  }

  const availableCategories =
    values.type === "transfer"
      ? []
      : categories.filter((category) => category.type === values.type);

  function updateValue<Key extends keyof TransactionFormValues>(
    key: Key,
    value: TransactionFormValues[Key],
  ) {
    setShowFeedback(false);
    setValues((current) => {
      const nextValues = {
        ...current,
        [key]: value,
      };

      if (key === "type") {
        if (value === "transfer") {
          nextValues.categoryId = "";
        } else {
          const nextCategory = categories.find(
            (category) => category.type === value,
          );
          nextValues.categoryId = nextCategory?.id ?? "";
        }
      }

      return nextValues;
    });
  }

  return (
    <SectionCard className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-primary-strong">
            {mode === "edit" ? "Edit transaction" : "New transaction"}
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            {mode === "edit"
              ? "Update transaction details"
              : "Record new activity"}
          </h2>
        </div>
        <Link
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface"
          href="/transactions"
        >
          Back to list
        </Link>
      </div>

      <form action={formAction} className="mt-6">
        <input name="id" type="hidden" value={initialTransaction?.id ?? ""} />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Type</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              name="type"
              onChange={(event) =>
                updateValue(
                  "type",
                  event.target.value as TransactionFormValues["type"],
                )
              }
              value={values.type}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            {errors?.type ? (
              <p className="text-sm text-negative">{errors.type}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Account</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              name="accountId"
              onChange={(event) => updateValue("accountId", event.target.value)}
              value={values.accountId}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {errors?.accountId ? (
              <p className="text-sm text-negative">{errors.accountId}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Category</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
              disabled={values.type === "transfer"}
              name="categoryId"
              onChange={(event) =>
                updateValue("categoryId", event.target.value)
              }
              value={values.categoryId}
            >
              {values.type === "transfer" ? (
                <option value="">Transfers do not use categories</option>
              ) : (
                availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
            {errors?.categoryId ? (
              <p className="text-sm text-negative">{errors.categoryId}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Amount</span>
            <input
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              inputMode="decimal"
              name="amount"
              onChange={(event) => updateValue("amount", event.target.value)}
              placeholder="0.00"
              value={values.amount}
            />
            {errors?.amount ? (
              <p className="text-sm text-negative">{errors.amount}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Merchant</span>
            <input
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              maxLength={160}
              name="merchant"
              onChange={(event) => updateValue("merchant", event.target.value)}
              placeholder="Park View Apartments"
              value={values.merchant}
            />
            {errors?.merchant ? (
              <p className="text-sm text-negative">{errors.merchant}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Description</span>
            <input
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              maxLength={240}
              name="description"
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              placeholder="Monthly rent"
              value={values.description}
            />
            {errors?.description ? (
              <p className="text-sm text-negative">{errors.description}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Date</span>
            <input
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              name="date"
              onChange={(event) => updateValue("date", event.target.value)}
              type="date"
              value={values.date}
            />
            {errors?.date ? (
              <p className="text-sm text-negative">{errors.date}</p>
            ) : null}
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-ink">Notes</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface"
              maxLength={2000}
              name="notes"
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Optional notes for this transaction"
              value={values.notes}
            />
            {errors?.notes ? (
              <p className="text-sm text-negative">{errors.notes}</p>
            ) : null}
          </label>
        </div>

        {showFeedback && formState.status === "error" && formState.message ? (
          <p className="mt-4 rounded-xl border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
            {formState.message}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? "Saving…"
              : mode === "edit"
                ? "Save transaction"
                : "Create transaction"}
          </button>
          <Link
            className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface"
            href="/transactions"
          >
            Cancel
          </Link>
        </div>
      </form>
    </SectionCard>
  );
}
