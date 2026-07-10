import { PageHeader } from "@/components/page-header";
import { TransactionForm } from "../_components/transaction-form";
import {
  mockAccountManagerItems,
  mockCategoryManagerItems,
} from "@/lib/mock-data";

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
