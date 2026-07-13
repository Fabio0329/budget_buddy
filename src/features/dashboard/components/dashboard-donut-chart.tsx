import { SectionCard } from "@/shared/components/section-card";
import type { CategorySpendVM } from "@/shared/types/view-models";

function buildConicGradient(segments: CategorySpendVM[]) {
  let cursor = 0;

  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += segment.sharePercent;
    return `${segment.color} ${start}% ${cursor}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export function DashboardDonutChart({
  segments,
}: Readonly<{
  segments: CategorySpendVM[];
}>) {
  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-accent">
            Spending by category
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            Where the month went
          </h2>
        </div>
        <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
          Top categories
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="mx-auto flex w-full max-w-[220px] items-center justify-center">
          <div
            className="relative h-52 w-52 rounded-full"
            style={{ background: buildConicGradient(segments) }}
          >
            <div className="absolute inset-[22%] flex items-center justify-center rounded-full border border-line bg-white/88 text-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Largest
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {segments[0]?.label}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {segments[0]?.valueDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="rounded-[22px] border border-line bg-white/70 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {segment.label}
                    </p>
                    <p className="text-xs text-muted">
                      {segment.sharePercent}% of expenses
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-ink">
                  {segment.valueDisplay}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
