import { SectionCard } from "@/shared/components/section-card";
import type { TransactionListVM } from "@/shared/types/view-models";

export function DashboardTransactionsList({
  transactions,
}: Readonly<{
  transactions: TransactionListVM[];
}>) {
  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-accent">
            Recent transactions
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            Latest activity
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="grid gap-3 rounded-[22px] border border-line bg-white/70 p-4 sm:grid-cols-[90px_1fr_auto]"
          >
            <div>
              <p className="text-sm font-semibold text-ink">
                {transaction.dateDisplay}
              </p>
              <p className="mt-1 text-xs text-muted">{transaction.accountName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {transaction.merchant}
              </p>
              <p className="mt-1 text-sm text-muted">
                {transaction.description} · {transaction.categoryName}
              </p>
            </div>
            <p
              className={`text-sm font-semibold ${
                transaction.type === "expense" ? "text-negative" : "text-positive"
              }`}
            >
              {transaction.amountDisplay}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
