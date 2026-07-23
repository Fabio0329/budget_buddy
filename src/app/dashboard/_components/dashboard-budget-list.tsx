import { SectionCard } from "@/shared/components/section-card";
import type { BudgetProgressVM } from "@/shared/types/view-models";

const statusToneMap: Record<BudgetProgressVM["status"], string> = {
  under: "bg-positive-soft text-positive",
  near: "bg-warning-soft text-warning",
  over: "bg-negative-soft text-negative",
};

const statusLabelMap: Record<BudgetProgressVM["status"], string> = {
  under: "Under budget",
  near: "Near limit",
  over: "Over budget",
};

export interface DashboardBudgetListProps {
  readonly budgets: BudgetProgressVM[];
  readonly periodLabel?: string;
}

export function DashboardBudgetList({
  budgets,
  periodLabel = "Current month",
}: DashboardBudgetListProps) {
  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-primary-strong">
            Budget progress
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            Category limits
          </h2>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {periodLabel}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {budget.categoryName}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {budget.spentDisplay} spent of {budget.limitDisplay}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusToneMap[budget.status]}`}
              >
                {statusLabelMap[budget.status]}
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-canvas-strong">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${Math.min(budget.progressPercent, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{budget.progressPercent}% used</span>
              <span>{budget.remainingDisplay} remaining</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
