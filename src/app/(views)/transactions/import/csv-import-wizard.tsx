"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { mockAccountManagerItems, mockCategoryManagerItems } from "@/lib/mock-data";
import { parseCsvText } from "@/lib/simple-csv";
import { useTransactionStore } from "@/lib/transaction-store";
import type {
  CsvColumnMapping,
  CsvImportPreviewRow,
  TransactionManagerVM,
} from "@/lib/view-models";

type ParsedCsv = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

type ImportStage = "upload" | "mapping" | "preview";

type ResolvedImportRow = CsvImportPreviewRow & {
  accountId: string | null;
  accountName: string;
  amountCents: number | null;
  categoryId: string | null;
  categoryName: string;
  date: string | null;
  merchant: string;
  notes: string;
  rawCategoryValue: string;
};

const initialMapping: CsvColumnMapping = {
  amount: null,
  date: null,
  description: null,
  merchant: null,
  type: null,
  category: null,
  account: null,
  notes: null,
};

function suggestMapping(headers: string[]): CsvColumnMapping {
  const lowerHeaders = headers.map((header) => header.toLowerCase());

  function findHeader(keywords: string[]) {
    const index = lowerHeaders.findIndex((header) =>
      keywords.some((keyword) => header.includes(keyword)),
    );
    return index >= 0 ? headers[index] : null;
  }

  return {
    amount: findHeader(["amount", "value"]),
    date: findHeader(["date", "posted"]),
    description: findHeader(["description", "details", "memo"]),
    merchant: findHeader(["merchant", "payee", "name"]),
    type: findHeader(["type"]),
    category: findHeader(["category"]),
    account: findHeader(["account"]),
    notes: findHeader(["notes", "memo"]),
  };
}

function parseMoneyToCents(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const isNegative =
    normalized.startsWith("-") ||
    (normalized.startsWith("(") && normalized.endsWith(")"));
  const numeric = Number(
    normalized.replace(/[,$()\s]/g, "").replace(/^\+/, ""),
  );

  if (Number.isNaN(numeric)) {
    return null;
  }

  const cents = Math.round(Math.abs(numeric) * 100);
  return isNegative ? -cents : cents;
}

function parseDateValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const iso = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : iso;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function inferTypeFromAmount(
  mappedType: string,
  amountCents: number | null,
): TransactionManagerVM["type"] | null {
  const normalizedType = mappedType.trim().toLowerCase();

  if (normalizedType === "expense" || normalizedType === "income") {
    return normalizedType;
  }

  if (normalizedType === "transfer") {
    return "transfer";
  }

  if (amountCents === null) {
    return null;
  }

  return amountCents < 0 ? "expense" : "income";
}

function normalizeDuplicateKey(
  date: string | null,
  amountCents: number | null,
  merchant: string,
  accountId: string | null,
) {
  if (!date || amountCents === null || !merchant || !accountId) {
    return null;
  }

  return [
    date,
    String(Math.abs(amountCents)),
    merchant.trim().toLowerCase(),
    accountId,
  ].join("|");
}

export function CsvImportWizard() {
  const { transactions, importTransactions } = useTransactionStore();
  const [stage, setStage] = useState<ImportStage>("upload");
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<CsvColumnMapping>(initialMapping);
  const [defaultAccountId, setDefaultAccountId] = useState(
    mockAccountManagerItems[0]?.id ?? "",
  );
  const [fallbackCategoryId, setFallbackCategoryId] = useState(
    mockCategoryManagerItems.find((category) => category.type === "expense")?.id ??
      "",
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const duplicateKeys = useMemo(
    () =>
      new Set(
        transactions
          .map((transaction) =>
            normalizeDuplicateKey(
              transaction.date,
              transaction.amountCents,
              transaction.merchant || transaction.description,
              transaction.accountId,
            ),
          )
          .filter(Boolean),
      ),
    [transactions],
  );

  const resolvedRows = useMemo(() => {
    if (!parsedCsv) {
      return [] as ResolvedImportRow[];
    }

    return parsedCsv.rows.map((row, index) => {
      const amountRaw = mapping.amount ? row[mapping.amount] ?? "" : "";
      const dateRaw = mapping.date ? row[mapping.date] ?? "" : "";
      const descriptionRaw = mapping.description
        ? row[mapping.description] ?? ""
        : "";
      const merchantRaw = mapping.merchant ? row[mapping.merchant] ?? "" : "";
      const typeRaw = mapping.type ? row[mapping.type] ?? "" : "";
      const accountRaw = mapping.account ? row[mapping.account] ?? "" : "";
      const categoryRaw = mapping.category ? row[mapping.category] ?? "" : "";
      const notesRaw = mapping.notes ? row[mapping.notes] ?? "" : "";

      const amountCents = parseMoneyToCents(amountRaw);
      const date = parseDateValue(dateRaw);
      const type = inferTypeFromAmount(typeRaw, amountCents);
      const account =
        mockAccountManagerItems.find(
          (candidate) =>
            candidate.name.toLowerCase() === accountRaw.trim().toLowerCase(),
        ) ??
        mockAccountManagerItems.find((candidate) => candidate.id === defaultAccountId) ??
        null;

      const matchingCategory = mockCategoryManagerItems.find(
        (candidate) =>
          candidate.name.toLowerCase() === categoryRaw.trim().toLowerCase(),
      );
      const fallbackCategory =
        mockCategoryManagerItems.find(
          (candidate) => candidate.id === fallbackCategoryId,
        ) ?? null;

      const chosenCategory =
        matchingCategory ??
        (categoryRaw.trim().length > 0 ? fallbackCategory : fallbackCategory);

      let status: ResolvedImportRow["status"] = "valid";
      let message = "Ready to import";

      if (amountCents === null) {
        status = "invalid";
        message = "Amount could not be parsed";
      } else if (!date) {
        status = "invalid";
        message = "Date could not be parsed";
      } else if (!type) {
        status = "invalid";
        message = "Transaction type is missing and could not be inferred";
      } else if (
        type === "expense" &&
        merchantRaw.trim().length === 0 &&
        descriptionRaw.trim().length === 0
      ) {
        status = "invalid";
        message = "Expense rows need a merchant or description";
      } else if (!account) {
        status = "invalid";
        message = "Account could not be resolved";
      } else if (
        type !== "transfer" &&
        !chosenCategory
      ) {
        status = "review";
        message = "Unknown category needs a fallback selection";
      } else {
        const duplicateKey = normalizeDuplicateKey(
          date,
          amountCents,
          merchantRaw || descriptionRaw,
          account.id,
        );

        if (duplicateKey && duplicateKeys.has(duplicateKey)) {
          status = "invalid";
          message = "Matches an existing transaction and will be skipped";
        } else if (
          type !== "transfer" &&
          chosenCategory &&
          chosenCategory.type !== type
        ) {
          status = "review";
          message = "Category type does not match the inferred transaction type";
        }
      }

      return {
        id: `import-row-${index + 1}`,
        accountId: account?.id ?? null,
        accountName: account?.name ?? "Unresolved account",
        amountCents,
        amountDisplay:
          amountCents === null ? "Invalid amount" : formatCurrencyFromCents(amountCents),
        categoryId:
          type === "transfer" ? null : chosenCategory?.id ?? null,
        categoryName:
          type === "transfer"
            ? "Transfer"
            : chosenCategory?.name ?? "Unknown category",
        date,
        dateDisplay: date ?? "Invalid date",
        description: descriptionRaw.trim(),
        merchant: merchantRaw.trim(),
        message,
        notes: notesRaw.trim(),
        rawCategoryValue: categoryRaw.trim(),
        status,
        type: type ?? "expense",
      };
    });
  }, [defaultAccountId, duplicateKeys, fallbackCategoryId, mapping, parsedCsv]);

  const summary = useMemo(() => {
    return resolvedRows.reduce(
      (current, row) => {
        current.total += 1;
        if (row.status === "valid") {
          current.valid += 1;
        } else if (row.status === "review") {
          current.review += 1;
        } else {
          current.invalid += 1;
        }
        return current;
      },
      { total: 0, valid: 0, review: 0, invalid: 0 },
    );
  }, [resolvedRows]);

  async function handleFile(file: File) {
    const text = await file.text();

    try {
      const parsed = parseCsvText(text);
      if (parsed.headers.length === 0) {
        setError("The CSV did not contain any headers.");
        return;
      }

      setParsedCsv(parsed);
      setMapping(suggestMapping(parsed.headers));
      setStage("mapping");
      setError(null);
      setNotice(null);
    } catch {
      setError("The CSV could not be parsed. Check the file format and try again.");
    }
  }

  function canPreview() {
    return Boolean(mapping.amount && mapping.date && (mapping.description || mapping.merchant));
  }

  function confirmImport() {
    const validRows = resolvedRows.filter((row) => row.status === "valid");

    if (validRows.length === 0) {
      setError("There are no valid rows to import.");
      return;
    }

    const nextTransactions: TransactionManagerVM[] = validRows.map((row, index) => ({
      id: `txn-import-${Date.now()}-${index}`,
      accountId: row.accountId!,
      accountName: row.accountName,
      amountCents: row.amountCents!,
      amountDisplay: formatCurrencyFromCents(row.amountCents!),
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      date: row.date!,
      dateDisplay: new Date(row.date!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      description: row.description,
      merchant: row.merchant,
      notes: row.notes,
      type: row.type,
    }));

    importTransactions(nextTransactions);
    setNotice(`Imported ${validRows.length} transaction${validRows.length === 1 ? "" : "s"}.`);
    setError(null);
    setStage("upload");
    setParsedCsv(null);
    setMapping(initialMapping);
  }

  if (mockAccountManagerItems.length === 0) {
    return (
      <EmptyState
        title="Add an account before importing"
        description="Imports need a target account. Create an account first, then return to map the CSV rows."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="card-grid">
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Import flow</p>
          <p className="mt-4 text-3xl font-semibold text-ink">3 steps</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Upload, map columns, then preview and confirm valid rows.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Existing duplicates checked</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {transactions.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Duplicate detection compares date, amount, merchant, and account.
          </p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm text-muted">Fallback account</p>
          <p className="mt-4 text-3xl font-semibold text-ink">
            {mockAccountManagerItems.find((account) => account.id === defaultAccountId)?.name}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Used when the CSV does not provide an account column.
          </p>
        </SectionCard>
      </section>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-[11px] font-semibold text-accent">
              Step 1
            </p>
            <h2 className="section-title mt-2 text-3xl text-ink">
              Upload a CSV
            </h2>
          </div>
          <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
            Current stage: {stage}
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">CSV file</span>
            <input
              accept=".csv,text/csv"
              className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-canvas"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFile(file);
                }
              }}
              type="file"
            />
          </label>
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">
                Default account
              </span>
              <select
                className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                onChange={(event) => setDefaultAccountId(event.target.value)}
                value={defaultAccountId}
              >
                {mockAccountManagerItems.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">
                Unknown category fallback
              </span>
              <select
                className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                onChange={(event) => setFallbackCategoryId(event.target.value)}
                value={fallbackCategoryId}
              >
                {mockCategoryManagerItems
                  .filter((category) => category.type === "expense")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        </div>
      </SectionCard>

      {parsedCsv ? (
        <SectionCard className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[11px] font-semibold text-accent">
                Step 2
              </p>
              <h2 className="section-title mt-2 text-3xl text-ink">
                Map columns
              </h2>
            </div>
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canPreview()}
              onClick={() => {
                if (canPreview()) {
                  setStage("preview");
                  setError(null);
                }
              }}
              type="button"
            >
              Preview import
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(mapping).map(([field, value]) => (
              <label className="space-y-2" key={field}>
                <span className="text-sm font-semibold capitalize text-ink">
                  {field}
                </span>
                <select
                  className="w-full rounded-[20px] border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
                  onChange={(event) =>
                    setMapping((current) => ({
                      ...current,
                      [field]: event.target.value || null,
                    }))
                  }
                  value={value ?? ""}
                >
                  <option value="">Not mapped</option>
                  {parsedCsv.headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <p className="mt-4 text-sm text-muted">
            Required mappings: amount, date, and either description or merchant.
            Type can be inferred from the amount sign if not mapped.
          </p>
        </SectionCard>
      ) : null}

      {stage === "preview" && parsedCsv ? (
        <SectionCard className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[11px] font-semibold text-accent">
                Step 3
              </p>
              <h2 className="section-title mt-2 text-3xl text-ink">
                Preview and confirm
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-positive-soft px-3 py-1 text-positive">
                {summary.valid} valid
              </span>
              <span className="rounded-full bg-warning-soft px-3 py-1 text-warning">
                {summary.review} review
              </span>
              <span className="rounded-full bg-negative-soft px-3 py-1 text-negative">
                {summary.invalid} invalid
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {resolvedRows.map((row) => (
              <div
                className="rounded-[22px] border border-line bg-white/70 p-4"
                key={row.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {row.merchant || row.description || "Unnamed row"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {row.dateDisplay} · {row.accountName} · {row.categoryName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        row.type === "expense"
                          ? "text-negative"
                          : row.type === "income"
                            ? "text-positive"
                            : "text-ink"
                      }`}
                    >
                      {row.amountDisplay}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "valid"
                          ? "bg-positive-soft text-positive"
                          : row.status === "review"
                            ? "bg-warning-soft text-warning"
                            : "bg-negative-soft text-negative"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{row.message}</p>
                {row.rawCategoryValue && row.categoryName !== "Transfer" ? (
                  <p className="mt-1 text-xs text-muted">
                    Source category: {row.rawCategoryValue}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={summary.valid === 0}
              onClick={confirmImport}
              type="button"
            >
              Import valid rows
            </button>
            <button
              className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
              onClick={() => setStage("mapping")}
              type="button"
            >
              Back to mapping
            </button>
          </div>
        </SectionCard>
      ) : null}

      {error ? (
        <p className="rounded-[20px] border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-[20px] border border-positive/20 bg-positive-soft px-4 py-3 text-sm text-positive">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
