import { RoutePlaceholder } from "@/components/route-placeholder";

export default function AccountsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Accounts"
      title="Account management UI is staged."
      description="This route is part of the shell review. CRUD flows, balance presentation, and prerequisite gating arrive in the accounts phase."
      bullets={[
        "Account list and summary cards",
        "Create and edit pages",
        "Deletion constraints for linked transactions",
      ]}
    />
  );
}
