import { PageHeader } from "@/shared/components/page-header";
import { TransactionsManager } from "@/features/transactions/components/transactions-manager.client";
import { getAccountManagerItems } from "@/features/accounts/account.queries";
import { getCategoryManagerItems } from "@/features/categories/category.queries";
import { getTransactionManagerItems } from "@/features/transactions/transaction.queries";
import { requireCurrentUser } from "@/server/auth/session";
import type { TransactionFilterState } from "@/shared/types/view-models";

type TransactionsPageProps = {
  searchParams: Promise<Partial<Record<keyof TransactionFilterState | "q", string>>>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const [accounts, categories, transactions] = await Promise.all([
    getAccountManagerItems(user.id),
    getCategoryManagerItems(user.id),
    getTransactionManagerItems(user.id),
  ]);
  const initialFilters: TransactionFilterState = {
    query: params.q ?? "",
    accountId: params.accountId ?? null,
    categoryId: params.categoryId ?? null,
    type:
      params.type === "income" ||
      params.type === "expense" ||
      params.type === "transfer"
        ? params.type
        : "all",
    dateFrom: params.dateFrom ?? null,
    dateTo: params.dateTo ?? null,
    amountMin: params.amountMin ?? null,
    amountMax: params.amountMax ?? null,
    sort:
      params.sort === "date-asc" ||
      params.sort === "amount-desc" ||
      params.sort === "amount-asc"
        ? params.sort
        : "date-desc",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Search, filter, and edit activity"
        description="Search and filter persisted activity, then create, edit, or remove user-scoped transactions with synchronized account balances."
      />
      <TransactionsManager
        accounts={accounts}
        categories={categories}
        initialFilters={initialFilters}
        initialTransactions={transactions}
      />
    </div>
  );
}
