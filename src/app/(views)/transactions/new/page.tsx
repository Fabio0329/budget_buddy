import { PageHeader } from "@/shared/components/page-header";
import { TransactionForm } from "@/features/transactions/components/transaction-form.client";
import { getAccountManagerItems } from "@/features/accounts/account.queries";
import { getCategoryManagerItems } from "@/features/categories/category.queries";
import { requireCurrentUser } from "@/server/auth/session";

export default async function NewTransactionPage() {
  const user = await requireCurrentUser();
  const [accounts, categories] = await Promise.all([
    getAccountManagerItems(user.id),
    getCategoryManagerItems(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Create a transaction"
        description="Add income, expense, or transfer activity with account/category validation before it lands in the review list."
      />
      <TransactionForm
        accounts={accounts}
        categories={categories}
        mode="create"
      />
    </div>
  );
}
