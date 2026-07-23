import { PageHeader } from "@/shared/components/page-header";
import { AccountsManager } from "@/app/accounts/_components/accounts-manager.client";
import { getAccountManagerItems } from "@/app/accounts/_lib/account.queries";
import { requireCurrentUser } from "@/server/auth/session";

export default async function AccountsPage() {
  const user = await requireCurrentUser();
  const accounts = await getAccountManagerItems(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="Manage where money lives"
        description="Create and manage persisted accounts, review balance visibility, and keep transaction history protected with user-scoped deletion constraints."
      />
      <AccountsManager initialAccounts={accounts} />
    </div>
  );
}
