import { CategoriesManager } from "@/components/categories-manager";
import { PageHeader } from "@/components/page-header";
import { mockCategoryManagerItems } from "@/lib/mock-data";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categories"
        title="Shape the category system"
        description="Categories stay split between income and expense so transaction entry, budgets, and reporting can all target the right bucket. This phase adds mock CRUD and linked-transaction safeguards."
      />
      <CategoriesManager initialCategories={mockCategoryManagerItems} />
    </div>
  );
}
