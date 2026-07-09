import { RoutePlaceholder } from "@/components/route-placeholder";

export default function CategoriesPage() {
  return (
    <RoutePlaceholder
      eyebrow="Categories"
      title="Category management is scaffolded."
      description="The page route and shared content frame are ready. Category visuals, forms, and user-defined groupings are phase 4 work."
      bullets={[
        "Income and expense groupings",
        "Color and icon treatment",
        "Fallback handling for linked transactions",
      ]}
    />
  );
}
