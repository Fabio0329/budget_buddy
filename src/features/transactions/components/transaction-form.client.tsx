"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import { formatCurrencyFromCents, formatDateForInput } from "@/shared/utils/formatters";
import { useTransactionStore } from "@/features/transactions/transaction.store";
import type {
  AccountManagerVM,
  CategoryManagerVM,
  TransactionFormValues,
  TransactionManagerVM,
} from "@/shared/types/view-models";

type TransactionFormProps = {
  accounts: AccountManagerVM[];
  categories: CategoryManagerVM[];
  mode: "create" | "edit";
  transactionId?: string;
};

type FormErrors = Partial<Record<keyof TransactionFormValues, string>> & {
  form?: string;
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

function toFormValues(transaction: TransactionManagerVM): TransactionFormValues {
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

function isCategoryCompatible(
  type: TransactionFormValues["type"],
  category: CategoryManagerVM | undefined,
) {
  if (type === "transfer") {
    return true;
  }

  return category?.type === type;
}

export function TransactionForm({
  accounts,
  categories,
  mode,
  transactionId,
}: Readonly<TransactionFormProps>) {
  const router = useRouter();
  const { transactions, createTransaction, updateTransaction } =
    useTransactionStore();
  const existingTransaction =
    mode === "edit"
      ? transactions.find((transaction) => transaction.id === transactionId)
      : undefined;

  const [values, setValues] = useState<TransactionFormValues>(() =>
    existingTransaction
      ? toFormValues(existingTransaction)
      : createInitialValues(accounts, categories),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  if (accounts.length === 0) {
    return (
      <EmptyState
        title="Add an account before entering transactions"
        description="Transactions depend on at least one account. Create an account first, then return here."
      />
    );
  }

  if (mode === "edit" && !existingTransaction) {
    return (
      <EmptyState
        title="Transaction not found"
        description="This transaction could not be loaded from the mock store. Return to the transaction list and choose another item."
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
    setValues((current) => {
      const nextValues = {
        ...current,
        [key]: value,
      };

      if (key === "type") {
        if (value === "transfer") {
          nextValues.categoryId = "";
        } else {
          const nextCategory = categories.find((category) => category.type === value);
          nextValues.categoryId = nextCategory?.id ?? "";
        }
      }

      return nextValues;
    });
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const amountNumber = Number(values.amount);
    const category = categories.find(
      (candidate) => candidate.id === values.categoryId,
    );

    if (!values.accountId) {
      nextErrors.accountId = "Select an account.";
    }

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    }

    if (!values.date) {
      nextErrors.date = "Date is required.";
    }

    if (values.type !== "transfer" && !values.categoryId) {
      nextErrors.categoryId = "Select a category.";
    }

    if (
      values.type !== "transfer" &&
      values.categoryId &&
      !isCategoryCompatible(values.type, category)
    ) {
      nextErrors.categoryId = "Category must match the transaction type.";
    }

    if (
      values.type === "expense" &&
      values.merchant.trim().length === 0 &&
      values.description.trim().length === 0
    ) {
      nextErrors.merchant =
        "Add a merchant or description for expense transactions.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveTransaction() {
    if (!validate()) {
      return;
    }

    const account = accounts.find((candidate) => candidate.id === values.accountId);
    const category = categories.find(
      (candidate) => candidate.id === values.categoryId,
    );

    if (!account) {
      setErrors({ form: "Selected account is unavailable." });
      return;
    }

    const amountCents = Math.round(Number(values.amount) * 100);
    const signedAmountCents =
      values.type === "expense" ? -amountCents : amountCents;

    const nextTransaction: TransactionManagerVM = {
      id:
        mode === "edit" && existingTransaction
          ? existingTransaction.id
          : `txn-${Math.random().toString(36).slice(2, 10)}`,
      accountId: account.id,
      accountName: account.name,
      amountCents: signedAmountCents,
      amountDisplay: formatCurrencyFromCents(signedAmountCents),
      categoryId: values.type === "transfer" ? null : category?.id ?? null,
      categoryName:
        values.type === "transfer"
          ? "Transfer"
          : category?.name ?? "Uncategorized",
      date: values.date,
      dateDisplay: new Date(values.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      description: values.description.trim(),
      merchant: values.merchant.trim(),
      notes: values.notes.trim(),
      type: values.type,
    };

    if (mode === "edit" && existingTransaction) {
      updateTransaction(nextTransaction);
    } else {
      createTransaction(nextTransaction);
    }

    router.push("/transactions");
  }

  return (
    <SectionCard className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-accent">
            {mode === "edit" ? "Edit transaction" : "New transaction"}
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            {mode === "edit" ? "Update transaction details" : "Record new activity"}
          </h2>
        </div>
        <Link
          className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
          href="/transactions"
        >
          Back to list
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Type</span>
          <select
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
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
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Account</span>
          <select
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("accountId", event.target.value)}
            value={values.accountId}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.accountId ? (
            <p className="text-sm text-negative">{errors.accountId}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Category</span>
          <select
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={values.type === "transfer"}
            onChange={(event) => updateValue("categoryId", event.target.value)}
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
          {errors.categoryId ? (
            <p className="text-sm text-negative">{errors.categoryId}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Amount</span>
          <input
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            inputMode="decimal"
            onChange={(event) => updateValue("amount", event.target.value)}
            placeholder="0.00"
            value={values.amount}
          />
          {errors.amount ? (
            <p className="text-sm text-negative">{errors.amount}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Merchant</span>
          <input
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("merchant", event.target.value)}
            placeholder="Park View Apartments"
            value={values.merchant}
          />
          {errors.merchant ? (
            <p className="text-sm text-negative">{errors.merchant}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Description</span>
          <input
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("description", event.target.value)}
            placeholder="Monthly rent"
            value={values.description}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Date</span>
          <input
            className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("date", event.target.value)}
            type="date"
            value={values.date}
          />
          {errors.date ? <p className="text-sm text-negative">{errors.date}</p> : null}
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-ink">Notes</span>
          <textarea
            className="min-h-28 w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder="Optional notes for this transaction"
            value={values.notes}
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
          onClick={saveTransaction}
          type="button"
        >
          {mode === "edit" ? "Save transaction" : "Create transaction"}
        </button>
        <Link
          className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
          href="/transactions"
        >
          Cancel
        </Link>
      </div>
    </SectionCard>
  );
}
