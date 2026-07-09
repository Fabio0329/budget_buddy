import { RoutePlaceholder } from "@/components/route-placeholder";

export default function BudgetsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Budgets"
      title="Budget tracking UI is framed."
      description="The shared route shell is ready for monthly budget rows, progress meters, and category-based limit editing in a later phase."
      bullets={[
        "Month-scoped budget summaries",
        "Under, near, and over-budget states",
        "Create and edit budget flows",
      ]}
    />
  );
}
