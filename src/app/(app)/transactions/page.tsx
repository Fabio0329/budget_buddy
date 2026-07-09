import { RoutePlaceholder } from "@/components/route-placeholder";

export default function TransactionsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Transactions"
      title="Transaction workflows plug into this route next."
      description="Phase 1 keeps the route and shell stable. Search, filters, sorting, and transaction forms are implemented in the dedicated transactions phase."
      bullets={[
        "Filter bar with URL-backed state",
        "Sortable transaction list",
        "Create, edit, and delete screens",
      ]}
    />
  );
}
