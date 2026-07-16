import { PageHeader } from "@/shared/components/page-header";
import { CsvImportWizard } from "@/features/transactions/components/csv-import-wizard.client";
import { getAccountManagerItems } from "@/features/accounts/account.queries";
import { getCategoryManagerItems } from "@/features/categories/category.queries";
import { getTransactionManagerItems } from "@/features/transactions/transaction.queries";
import { requireCurrentUser } from "@/server/auth/session";

export default async function TransactionImportPage() {
  const user = await requireCurrentUser();
  const [accounts, categories, transactions] = await Promise.all([
    getAccountManagerItems(user.id),
    getCategoryManagerItems(user.id),
    getTransactionManagerItems(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Import"
        title="Map and import a transaction CSV"
        description="Upload and review a CSV, map it to your persisted accounts and categories, then import server-validated rows with duplicate protection."
      />
      <CsvImportWizard
        accounts={accounts}
        categories={categories}
        existingTransactions={transactions}
      />
    </div>
  );
}
