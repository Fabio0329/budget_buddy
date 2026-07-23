import { SectionCard } from "@/shared/components/section-card";
import type { UpcomingRecurringVM } from "@/shared/types/view-models";

export function DashboardRecurringList({
  items,
}: Readonly<{
  items: UpcomingRecurringVM[];
}>) {
  return (
    <SectionCard className="p-6">
      <p className="eyebrow text-[11px] font-semibold text-primary-strong">
        Upcoming recurring
      </p>
      <h2 className="section-title mt-2 text-3xl text-ink">
        Bills and repeats
      </h2>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-xs text-muted">
                {item.nextDateDisplay} · {item.frequencyLabel}
              </p>
            </div>
            <p className="text-sm font-semibold text-ink">
              {item.amountDisplay}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
