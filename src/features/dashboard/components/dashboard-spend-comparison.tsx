import { SectionCard } from "@/shared/components/section-card";
import type { IncomeExpenseBarVM } from "@/shared/types/view-models";

export function DashboardSpendComparison({
  bars,
}: Readonly<{
  bars: IncomeExpenseBarVM[];
}>) {
  const maxValue = Math.max(
    ...bars.map((bar) => Math.max(bar.income, bar.expense)),
    1,
  );

  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-accent">
            Income vs expenses
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            Monthly comparison
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="status-dot bg-positive" />
            Income
          </span>
          <span className="flex items-center gap-2">
            <span className="status-dot bg-negative" />
            Expenses
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {bars.map((bar) => (
          <div key={bar.id}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">{bar.label}</span>
              <span className="text-muted">
                {bar.incomeDisplay} / {bar.expenseDisplay}
              </span>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs text-muted">Income</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-canvas-strong">
                  <div
                    className="h-full rounded-full bg-positive"
                    style={{ width: `${(bar.income / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs text-muted">Expense</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-canvas-strong">
                  <div
                    className="h-full rounded-full bg-negative"
                    style={{ width: `${(bar.expense / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
