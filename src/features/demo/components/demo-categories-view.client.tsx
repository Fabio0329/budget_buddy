"use client";

import { CategoriesManager } from "@/features/categories/components/categories-manager.client";
import { PageHeader } from "@/shared/components/page-header";
import type { CategoryManagerVM } from "@/shared/types/view-models";

interface DemoCategoriesViewProps {
  readonly categories: CategoryManagerVM[];
  readonly onMutation: (action: string) => void;
}

export function DemoCategoriesView({
  categories,
  onMutation,
}: DemoCategoriesViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        description="See how income and spending categories drive transaction organization, monthly averages, and budget reporting."
        eyebrow="Categories"
        title="A flexible category system"
      />
      <CategoriesManager
        initialCategories={categories}
        readOnlyMode={{ onRestrictedAction: onMutation }}
      />
    </div>
  );
}
