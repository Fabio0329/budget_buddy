import { PageHeader } from "@/shared/components/page-header";
import { TransactionForm } from "@/app/transactions/_components/transaction-form.client";
import { notFound } from "next/navigation";
import { getAccountManagerItems } from "@/app/accounts/_lib/account.queries";
import { getCategoryManagerItems } from "@/app/categories/_lib/category.queries";
import { getTransactionManagerItem } from "@/app/transactions/_lib/transaction.queries";
import { requireCurrentUser } from "@/server/auth/session";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const [accounts, categories, transaction] = await Promise.all([
    getAccountManagerItems(user.id),
    getCategoryManagerItems(user.id),
    getTransactionManagerItem(user.id, id),
  ]);

  if (!transaction) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Edit transaction"
        description="Adjust transaction details, keep validation intact, and return directly to the filtered transaction review surface."
      />
      <TransactionForm
        accounts={accounts}
        categories={categories}
        initialTransaction={transaction}
        mode="edit"
      />
    </div>
  );
}
