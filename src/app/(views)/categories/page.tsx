import { PageHeader } from "@/shared/components/page-header";
import { CategoriesManager } from "@/features/categories/components/categories-manager.client";
import { mockCategoryManagerItems } from "@/mocks/finance";

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
