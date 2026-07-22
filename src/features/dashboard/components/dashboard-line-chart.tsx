import { SectionCard } from "@/shared/components/section-card";
import type { DailySpendVM } from "@/shared/types/view-models";

function buildPath(points: DailySpendVM[], width: number, height: number) {
  if (points.length === 0) {
    return "";
  }

  const max = Math.max(...points.map((point) => point.amount));
  const min = Math.min(...points.map((point) => point.amount));
  const range = Math.max(max - min, 1);

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.amount - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function DashboardLineChart({
  points,
}: Readonly<{
  points: DailySpendVM[];
}>) {
  const width = 480;
  const height = 180;
  const path = buildPath(points, width, height);
  const gradientId = "daily-spend-gradient";
  const maxPoint = points.reduce((current, point) =>
    point.amount > current.amount ? point : current,
  );

  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[11px] font-semibold text-primary-strong">
            Daily spending
          </p>
          <h2 className="section-title mt-2 text-3xl text-ink">
            Expense tempo
          </h2>
        </div>
        <div className="text-right text-xs text-muted">
          <p>Highest day</p>
          <p className="mt-1 font-semibold text-ink">
            {maxPoint.label}: {maxPoint.valueDisplay}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface px-4 py-5">
        <svg
          aria-label="Daily spending line chart"
          className="h-[220px] w-full"
          viewBox={`0 0 ${width} ${height + 26}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="color-mix(in srgb, var(--primary) 28%, transparent)"
              />
              <stop
                offset="100%"
                stopColor="color-mix(in srgb, var(--primary) 2%, transparent)"
              />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((step) => {
            const y = (height / 3) * step;
            return (
              <line
                key={step}
                stroke="var(--line)"
                strokeDasharray="4 6"
                x1="0"
                x2={width}
                y1={y}
                y2={y}
              />
            );
          })}
          {path ? (
            <>
              <path
                d={`${path} L ${width} ${height} L 0 ${height} Z`}
                fill={`url(#${gradientId})`}
                transform="translate(0 0)"
              />
              <path
                d={path}
                fill="none"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
              {points.map((point, index) => {
                const max = Math.max(...points.map((entry) => entry.amount));
                const min = Math.min(...points.map((entry) => entry.amount));
                const range = Math.max(max - min, 1);
                const x = (index / Math.max(points.length - 1, 1)) * width;
                const y = height - ((point.amount - min) / range) * height;

                return (
                  <circle
                    key={point.id}
                    cx={x}
                    cy={y}
                    fill="var(--surface)"
                    r="5"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                  />
                );
              })}
            </>
          ) : null}
        </svg>

        <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted sm:grid-cols-8">
          {points.map((point) => (
            <span key={point.id}>{point.label}</span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
