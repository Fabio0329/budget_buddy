import { PageHeader } from "@/shared/components/page-header";
import { TransactionForm } from "@/features/transactions/components/transaction-form.client";
import {
  mockAccountManagerItems,
  mockCategoryManagerItems,
} from "@/mocks/finance";

export default function NewTransactionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Create a transaction"
        description="Add income, expense, or transfer activity with account/category validation before it lands in the review list."
      />
      <TransactionForm
        accounts={mockAccountManagerItems}
        categories={mockCategoryManagerItems}
        mode="create"
      />
    </div>
  );
}
