import { PageHeader } from "@/shared/components/page-header";
import { CategoriesManager } from "@/app/categories/_components/categories-manager.client";
import { getCategoryManagerItems } from "@/app/categories/_lib/category.queries";
import { requireCurrentUser } from "@/server/auth/session";

export default async function CategoriesPage() {
  const user = await requireCurrentUser();
  const categories = await getCategoryManagerItems(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categories"
        title="Shape the category system"
        description="Persist income and expense categories for transaction entry, budgets, and reporting, with safeguards for every linked record."
      />
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
