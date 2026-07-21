"use client";

import { useState } from "react";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import type { DemoSnapshot } from "@/features/demo/demo-data";

interface DemoDashboardViewProps {
  readonly snapshot: DemoSnapshot;
}

export function DemoDashboardView({ snapshot }: DemoDashboardViewProps) {
  const [month, setMonth] = useState(snapshot.monthOptions[0].value);
  const dashboard = snapshot.dashboardsByMonth[month];

  return (
    <DashboardOverview
      budgetPeriodLabel={dashboard.summary.monthLabel}
      dashboard={dashboard}
      description="A unified view of cash flow, category spending, budget pressure, account balances, and recent activity."
      monthControl={
        <label className="flex w-fit items-center gap-3 rounded-full border border-line bg-white/70 px-4 py-2 text-sm text-muted">
          <span className="font-semibold text-ink">Month</span>
          <select
            className="bg-transparent font-semibold text-ink outline-none"
            onChange={(event) => setMonth(event.target.value)}
            value={month}
          >
            {snapshot.monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      }
    />
  );
}
