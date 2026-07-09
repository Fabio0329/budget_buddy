export type NavItem = {
  href: string;
  label: string;
  description: string;
  matchMode?: "exact" | "prefix";
};

export type AppUserVM = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

export type DashboardOverviewVM = {
  monthLabel: string;
  monthlyIncomeDisplay: string;
  monthlyExpenseDisplay: string;
  netCashFlowDisplay: string;
  remainingBudgetDisplay: string;
  largestExpenseCategory: string;
};

export type AccountSummaryVM = {
  id: string;
  name: string;
  type: string;
  currentBalanceDisplay: string;
  status: "healthy" | "warning";
};

export type CategoryListVM = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
};

export type TransactionListVM = {
  id: string;
  dateDisplay: string;
  merchant: string;
  description: string;
  amountDisplay: string;
  type: "income" | "expense" | "transfer";
  categoryName: string;
  accountName: string;
};

export type TransactionFilterState = {
  query: string;
  accountId: string | null;
  categoryId: string | null;
  type: "income" | "expense" | "transfer" | "all";
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: string | null;
  amountMax: string | null;
  sort: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
};

export type TransactionFormValues = {
  type: "income" | "expense" | "transfer";
  accountId: string;
  categoryId: string;
  amount: string;
  merchant: string;
  description: string;
  date: string;
  notes: string;
};

export type BudgetProgressVM = {
  id: string;
  categoryName: string;
  limitDisplay: string;
  spentDisplay: string;
  remainingDisplay: string;
  progressPercent: number;
  status: "under" | "near" | "over";
};

export type CsvColumnMapping = {
  amount: string | null;
  date: string | null;
  description: string | null;
  merchant: string | null;
  type: string | null;
  category: string | null;
  account: string | null;
  notes: string | null;
};

export type CsvImportPreviewRow = {
  id: string;
  dateDisplay: string;
  description: string;
  amountDisplay: string;
  type: "income" | "expense" | "transfer";
  status: "valid" | "review" | "invalid";
  message: string;
};
