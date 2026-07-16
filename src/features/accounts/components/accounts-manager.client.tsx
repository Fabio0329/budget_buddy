"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteAccount as deleteAccountAction,
  saveAccount,
} from "@/features/accounts/account.actions";
import { initialAccountFormState } from "@/features/accounts/account-form-state";
import { EmptyState } from "@/shared/components/empty-state";
import { SectionCard } from "@/shared/components/section-card";
import { formatCurrencyFromCents } from "@/shared/utils/formatters";
import type { AccountManagerVM } from "@/shared/types/view-models";

const accountTypes = [
  "checking",
  "savings",
  "credit_card",
  "cash",
  "investment",
  "other",
] as const;

type AccountType = (typeof accountTypes)[number];

type AccountDraft = {
  currentBalance: string;
  institution: string;
  name: string;
  startingBalance: string;
  type: AccountType;
};

const emptyDraft: AccountDraft = {
  currentBalance: "",
  institution: "",
  name: "",
  startingBalance: "",
  type: "checking",
};

function formatAccountType(type: string) {
  return type
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function createDraft(account: AccountManagerVM): AccountDraft {
  return {
    currentBalance: (account.currentBalanceCents / 100).toFixed(2),
    institution: account.institution,
    name: account.name,
    startingBalance: (account.startingBalanceCents / 100).toFixed(2),
    type: account.type as AccountType,
  };
}

export function AccountsManager({
  initialAccounts,
}: Readonly<{
  initialAccounts: AccountManagerVM[];
}>) {
  const accounts = initialAccounts;
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAccounts[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<AccountDraft>(
    initialAccounts[0] ? createDraft(initialAccounts[0]) : emptyDraft,
  );
  const [mode, setMode] = useState<"create" | "edit">(
    initialAccounts[0] ? "edit" : "create",
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFormFeedback, setShowFormFeedback] = useState(false);
  const [formState, formAction, isSaving] = useActionState(
    submitAccount,
    initialAccountFormState,
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedAccount =
    mode === "edit"
      ? accounts.find((account) => account.id === selectedId) ?? null
      : null;

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.currentBalanceCents,
    0,
  );
  const linkedTransactions = accounts.reduce(
    (sum, account) => sum + account.linkedTransactionCount,
    0,
  );
  const fieldErrors = showFormFeedback ? formState.errors : undefined;

  async function submitAccount(
    previousState: typeof initialAccountFormState,
    formData: FormData,
  ) {
    const result = await saveAccount(previousState, formData);
    setShowFormFeedback(true);
    setError(result.status === "error" ? (result.message ?? null) : null);
    setNotice(result.status === "success" ? (result.message ?? null) : null);

    if (result.status === "success" && result.entityId) {
      setMode("edit");
      setSelectedId(result.entityId);
    }

    return result;
  }

  function resetForCreate() {
    setMode("create");
    setSelectedId(null);
    setDraft(emptyDraft);
    setShowFormFeedback(false);
    setError(null);
    setNotice(null);
  }

  function selectAccount(account: AccountManagerVM) {
    setMode("edit");
    setSelectedId(account.id);
    setDraft(createDraft(account));
    setShowFormFeedback(false);
    setError(null);
    setNotice(null);
  }

  function updateDraft<Key extends keyof AccountDraft>(
    key: Key,
    value: AccountDraft[Key],
  ) {
    setShowFormFeedback(false);
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function deleteAccount(account: AccountManagerVM) {
    if (account.linkedTransactionCount > 0) {
      setError(
        "This account is linked to transactions. Reassign or remove those transactions before deleting it.",
      );
      setNotice(null);
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteAccountAction(account.id);
      setError(result.status === "error" ? (result.message ?? null) : null);
      setNotice(result.status === "success" ? (result.message ?? null) : null);

      if (result.status !== "success") return;

      const remaining = accounts.filter((entry) => entry.id !== account.id);
      if (remaining.length === 0) {
        setMode("create");
        setSelectedId(null);
        setDraft(emptyDraft);
      } else if (selectedId === account.id) {
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
          <p className="text-sm text-muted">Accounts configured</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {accounts.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Transactions unlock once at least one account exists.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Combined balance</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {formatCurrencyFromCents(totalBalance)}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Rollup across checking, savings, cash, and liabilities.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Linked transactions</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {linkedTransactions}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Delete stays blocked where transaction history still depends on the
            account.
          </p>
        </SectionCard>
      </section>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-[11px] font-semibold text-accent">
              Transaction readiness
            </p>
            <h2 className="section-title mt-2 text-3xl text-ink">
              {accounts.length > 0
                ? "Transactions are unlocked"
                : "Add an account before recording transactions"}
            </h2>
          </div>
          <button
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
            onClick={resetForCreate}
            type="button"
          >
            Add account
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-[11px] font-semibold text-accent">
                Account list
              </p>
              <h2 className="section-title mt-2 text-3xl text-ink">
                Connected balances
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {accounts.length > 0 ? (
              accounts.map((account) => {
                const isSelected =
                  mode === "edit" && selectedId === account.id;

                return (
                  <div
                    key={account.id}
                    className={`rounded-[24px] border p-4 transition ${
                      isSelected
                        ? "border-line-strong bg-white/90 shadow-[0_12px_30px_rgba(15,23,32,0.08)]"
                        : "border-line bg-white/65"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {account.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {account.institution} · {formatAccountType(account.type)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          account.status === "healthy"
                            ? "bg-positive-soft text-positive"
                            : "bg-warning-soft text-warning"
                        }`}
                      >
                        {account.status === "healthy" ? "Healthy" : "Review"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">
                          Current
                        </p>
                        <p className="mt-1 text-lg font-semibold text-ink">
                          {account.currentBalanceDisplay}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">
                          Starting
                        </p>
                        <p className="mt-1 text-lg font-semibold text-ink">
                          {account.startingBalanceDisplay}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">
                          Linked txns
                        </p>
                        <p className="mt-1 text-lg font-semibold text-ink">
                          {account.linkedTransactionCount}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted">
                      {account.note}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-muted">
                        Updated {account.lastUpdatedLabel}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
                          onClick={() => selectAccount(account)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={
                            account.linkedTransactionCount > 0 || isDeleting
                          }
                          onClick={() => deleteAccount(account)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No accounts yet"
                description="Create a checking, savings, cash, or liability account to unlock transaction entry in the next phase."
              />
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <p className="eyebrow text-[11px] font-semibold text-accent">
            {mode === "edit" ? "Edit account" : "Create account"}
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            {mode === "edit"
              ? selectedAccount?.name ?? "Account details"
              : "Add a new account"}
          </h2>
          <form action={formAction} className="mt-6 grid gap-4">
            <input
              name="id"
              type="hidden"
              value={mode === "edit" ? (selectedAccount?.id ?? "") : ""}
            />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">
                Account name
              </span>
              <input
                className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                maxLength={100}
                name="name"
                onChange={(event) => updateDraft("name", event.target.value)}
                placeholder="Primary Checking"
                value={draft.name}
              />
              {fieldErrors?.name ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">
                Institution or source
              </span>
              <input
                className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                maxLength={120}
                name="institution"
                onChange={(event) =>
                  updateDraft("institution", event.target.value)
                }
                placeholder="Northline Credit Union"
                value={draft.institution}
              />
              {fieldErrors?.institution ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.institution}
                </span>
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Type</span>
              <select
                className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                name="type"
                onChange={(event) =>
                  updateDraft("type", event.target.value as AccountType)
                }
                value={draft.type}
              >
                {accountTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatAccountType(type)}
                  </option>
                ))}
              </select>
              {fieldErrors?.type ? (
                <span className="block text-sm text-negative">
                  {fieldErrors.type}
                </span>
              ) : null}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">
                  Starting balance
                </span>
                <input
                  className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                  inputMode="decimal"
                  name="startingBalance"
                  onChange={(event) =>
                    updateDraft("startingBalance", event.target.value)
                  }
                  placeholder="0.00"
                  value={draft.startingBalance}
                />
                {fieldErrors?.startingBalance ? (
                  <span className="block text-sm text-negative">
                    {fieldErrors.startingBalance}
                  </span>
                ) : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">
                  Current balance
                </span>
                <input
                  className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                  inputMode="decimal"
                  name="currentBalance"
                  onChange={(event) =>
                    updateDraft("currentBalance", event.target.value)
                  }
                  placeholder="0.00"
                  value={draft.currentBalance}
                />
                {fieldErrors?.currentBalance ? (
                  <span className="block text-sm text-negative">
                    {fieldErrors.currentBalance}
                  </span>
                ) : null}
              </label>
            </div>

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

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Saving…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Create account"}
              </button>
              <button
                className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
                onClick={resetForCreate}
                type="button"
              >
                New account
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
