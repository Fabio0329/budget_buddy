import { DashboardMonthSwitcher } from "@/app/dashboard/_components/dashboard-month-switcher.client";
import { DashboardOverview } from "@/app/dashboard/_components/dashboard-overview";
import { getDashboardMonthData } from "@/app/dashboard/_lib/dashboard.queries";
import { canLoadSampleData } from "@/app/dashboard/_lib/sample-data.actions";
import { SampleDataCard } from "@/app/dashboard/_components/sample-data-card.client";
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
