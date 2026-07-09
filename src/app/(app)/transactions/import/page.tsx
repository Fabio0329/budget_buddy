import { RoutePlaceholder } from "@/components/route-placeholder";

export default function TransactionImportPage() {
  return (
    <RoutePlaceholder
      eyebrow="Import"
      title="CSV import wizard comes later."
      description="This route is reserved for the multi-step upload, column mapping, preview, and confirmation flow."
      bullets={[
        "Upload and header detection",
        "Column mapping and validation preview",
        "Duplicate and invalid-row feedback",
      ]}
    />
  );
}
