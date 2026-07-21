"use client";

import { TransactionsManager } from "@/features/transactions/components/transactions-manager.client";
import { PageHeader } from "@/shared/components/page-header";
import type {
  AccountManagerVM,
  CategoryManagerVM,
  TransactionFilterState,
  TransactionManagerVM,
} from "@/shared/types/view-models";

const initialFilters: TransactionFilterState = {
  accountId: null,
  amountMax: null,
  amountMin: null,
  categoryId: null,
  dateFrom: null,
  dateTo: null,
  query: "",
  sort: "date-desc",
  type: "all",
};

interface DemoTransactionsViewProps {
  readonly accounts: AccountManagerVM[];
  readonly categories: CategoryManagerVM[];
  readonly onMutation: (action: string) => void;
  readonly transactions: TransactionManagerVM[];
}

export function DemoTransactionsView({
  accounts,
  categories,
  onMutation,
  transactions,
}: DemoTransactionsViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Search and refine three months of fictional activity across accounts, categories, dates, and amounts."
        eyebrow="Transactions"
        title="Review every money movement"
      />
      <TransactionsManager
        accounts={accounts}
        categories={categories}
        initialFilters={initialFilters}
        initialTransactions={transactions}
        readOnlyMode={{ onRestrictedAction: onMutation }}
      />
    </div>
  );
}
