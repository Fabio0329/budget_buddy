import { PageHeader } from "@/components/page-header";
import { TransactionsManager } from "./transactions-manager";
import {
  mockAccountManagerItems,
  mockCategoryManagerItems,
} from "@/lib/mock-data";
import type { TransactionFilterState } from "@/lib/view-models";

type TransactionsPageProps = {
  searchParams: Promise<Partial<Record<keyof TransactionFilterState | "q", string>>>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
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
        description="This phase adds the working transaction list, URL-backed filters, sorting, and dedicated create/edit pages using the mock account and category structures from earlier phases."
      />
      <TransactionsManager
        accounts={mockAccountManagerItems}
        categories={mockCategoryManagerItems}
        initialFilters={initialFilters}
      />
    </div>
  );
}
