import { AccountsManager } from "@/components/accounts-manager";
import { PageHeader } from "@/components/page-header";
import { mockAccountManagerItems } from "@/lib/mock-data";

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
