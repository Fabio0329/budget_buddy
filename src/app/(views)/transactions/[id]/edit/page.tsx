import { PageHeader } from "@/shared/components/page-header";
import { TransactionForm } from "@/features/transactions/components/transaction-form.client";
import {
  mockAccountManagerItems,
  mockCategoryManagerItems,
} from "@/mocks/finance";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Edit transaction"
        description="Adjust transaction details, keep validation intact, and return directly to the filtered transaction review surface."
      />
      <TransactionForm
        accounts={mockAccountManagerItems}
        categories={mockCategoryManagerItems}
        mode="edit"
        transactionId={id}
      />
    </div>
  );
}
