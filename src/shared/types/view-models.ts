export type NavItem = {
  href: string;
  label: string;
  description: string;
  matchMode?: "exact" | "prefix";
  activePathPrefixes?: string[];
  activePathExclusions?: string[];
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
  totalAccountBalanceDisplay: string;
  largestExpenseCategory: string;
};

export type CategorySpendVM = {
  id: string;
  label: string;
  valueDisplay: string;
  sharePercent: number;
  color: string;
};

export type IncomeExpenseBarVM = {
  id: string;
  label: string;
  income: number;
  incomeDisplay: string;
  expense: number;
  expenseDisplay: string;
};

export type DailySpendVM = {
  id: string;
  label: string;
  amount: number;
  valueDisplay: string;
};

export type UpcomingRecurringVM = {
  id: string;
  label: string;
  nextDateDisplay: string;
  frequencyLabel: string;
  amountDisplay: string;
};

export type GoalProgressVM = {
  id: string;
  name: string;
  currentAmountDisplay: string;
  targetAmountDisplay: string;
  remainingAmountDisplay: string;
  progressPercent: number;
  targetDateDisplay: string;
};

export type DashboardMonthVM = {
  id: string;
  label: string;
  summary: DashboardOverviewVM;
  categorySpend: CategorySpendVM[];
  incomeVsExpense: IncomeExpenseBarVM[];
  dailySpending: DailySpendVM[];
  recentTransactions: TransactionListVM[];
  budgets: BudgetProgressVM[];
  upcomingRecurring: UpcomingRecurringVM[];
  goal: GoalProgressVM;
};

export type AccountSummaryVM = {
  id: string;
  name: string;
  type: string;
  currentBalanceDisplay: string;
  status: "healthy" | "warning";
};

export type AccountManagerVM = {
  id: string;
  name: string;
  institution: string;
  type: string;
  startingBalanceCents: number;
  startingBalanceDisplay: string;
  currentBalanceCents: number;
  currentBalanceDisplay: string;
  linkedTransactionCount: number;
  lastUpdatedLabel: string;
  note: string;
  status: "healthy" | "warning";
};

export type CategoryListVM = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
};

export type CategoryManagerVM = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  iconToken: string;
  linkedBudgetCount: number;
  linkedTransactionCount: number;
  monthlyAverageCents: number;
  monthlyAverageDisplay: string;
  note: string;
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

export type TransactionManagerVM = TransactionListVM & {
  date: string;
  amountCents: number;
  accountId: string;
  categoryId: string | null;
  notes: string;
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

export type BudgetManagerVM = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  month: string;
  monthLabel: string;
  limitAmountCents: number;
  limitDisplay: string;
  note: string;
};

export type BudgetFormValues = {
  categoryId: string;
  month: string;
  limitAmount: string;
  note: string;
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
