import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { mockDashboardOverview } from "@/lib/mock-data";

const cards = [
  {
    label: "Income",
    value: mockDashboardOverview.monthlyIncomeDisplay,
    tone: "text-positive",
  },
  {
    label: "Expenses",
    value: mockDashboardOverview.monthlyExpenseDisplay,
    tone: "text-negative",
  },
  {
    label: "Net cash flow",
    value: mockDashboardOverview.netCashFlowDisplay,
    tone: "text-ink",
  },
  {
    label: "Remaining budget",
    value: mockDashboardOverview.remainingBudgetDisplay,
    tone: "text-ink",
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Foundation shell"
        description="Navigation, cards, spacing, and page framing are in place. Charts and detailed data views land in the dashboard phase."
      />
      <section className="card-grid">
        {cards.map((card) => (
          <SectionCard key={card.label} className="p-5">
            <p className="text-sm text-muted">{card.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${card.tone}`}>
              {card.value}
            </p>
          </SectionCard>
        ))}
      </section>
    </div>
  );
}
