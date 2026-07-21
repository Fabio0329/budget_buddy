import { DashboardMonthSwitcher } from "@/features/dashboard/components/dashboard-month-switcher.client";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardMonthData } from "@/features/dashboard/dashboard.queries";
import { canLoadSampleData } from "@/features/onboarding/sample-data.actions";
import { SampleDataCard } from "@/features/onboarding/components/sample-data-card.client";
import { requireCurrentUser } from "@/server/auth/session";

type DashboardPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const [{ dashboard, months }, showSampleData] = await Promise.all([
    getDashboardMonthData(user.id, params.month),
    canLoadSampleData(user.id),
  ]);

  return (
    <div className="space-y-8">
      {showSampleData ? <SampleDataCard /> : null}
      <DashboardOverview
        dashboard={dashboard}
        description="This persisted overview consolidates cash flow, category spending, budget pressure, account balances, and recent activity for the selected month."
        monthControl={
          <DashboardMonthSwitcher activeMonth={dashboard.id} months={months} />
        }
      />
    </div>
  );
}
