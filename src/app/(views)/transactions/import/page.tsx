import { PageHeader } from "@/components/page-header";
import { CsvImportWizard } from "./csv-import-wizard";

export default function TransactionImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Import"
        title="Map and import a transaction CSV"
        description="This phase adds a reviewable import wizard with header detection, column mapping, row validation, duplicate protection, and direct transaction creation for valid rows."
      />
      <CsvImportWizard />
    </div>
  );
}
