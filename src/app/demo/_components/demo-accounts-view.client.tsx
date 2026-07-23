"use client";

import { AccountsManager } from "@/app/accounts/_components/accounts-manager.client";
import { PageHeader } from "@/shared/components/page-header";
import type { AccountManagerVM } from "@/shared/types/view-models";

interface DemoAccountsViewProps {
  readonly accounts: AccountManagerVM[];
  readonly onMutation: (action: string) => void;
}

export function DemoAccountsView({
  accounts,
  onMutation,
}: DemoAccountsViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Review where Alex’s money lives, the role of each account, and the transaction activity linked to it."
        eyebrow="Accounts"
        title="A complete financial snapshot"
      />
      <AccountsManager
        initialAccounts={accounts}
        readOnlyMode={{ onRestrictedAction: onMutation }}
      />
    </div>
  );
}
