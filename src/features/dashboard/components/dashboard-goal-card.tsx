import { SectionCard } from "@/shared/components/section-card";
import type { GoalProgressVM } from "@/shared/types/view-models";

export function DashboardGoalCard({
  goal,
}: Readonly<{
  goal: GoalProgressVM;
}>) {
  return (
    <SectionCard className="p-6">
      <p className="eyebrow text-[11px] font-semibold text-accent">
        Goal focus
      </p>
      <h2 className="section-title mt-2 text-3xl text-ink">{goal.name}</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        {goal.currentAmountDisplay} saved of {goal.targetAmountDisplay} by{" "}
        {goal.targetDateDisplay}.
      </p>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-canvas-strong">
        <div
          className="h-full rounded-full bg-positive"
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{goal.progressPercent}% complete</span>
        <span>{goal.remainingAmountDisplay} to go</span>
      </div>
    </SectionCard>
  );
}
