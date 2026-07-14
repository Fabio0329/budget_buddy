import { PageHeader } from "@/shared/components/page-header";
import { AccountsManager } from "@/features/accounts/components/accounts-manager.client";
import { mockAccountManagerItems } from "@/mocks/finance";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="Manage where money lives"
        description="Accounts anchor every transaction. This phase adds mock CRUD behavior, balance visibility, and deletion constraints so the next transaction phase can rely on a stable account surface."
      />
      <AccountsManager initialAccounts={mockAccountManagerItems} />
    </div>
  );
}
