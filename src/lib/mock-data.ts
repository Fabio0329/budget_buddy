import type {
  AccountSummaryVM,
  AppUserVM,
  BudgetProgressVM,
  CategoryListVM,
  CsvImportPreviewRow,
  DashboardOverviewVM,
  TransactionListVM,
} from "@/lib/view-models";

export const mockCurrentUser: AppUserVM = {
  id: "user-demo",
  name: "Fabio Rivera",
  email: "fabio@budgetbuddy.local",
  initials: "FR",
};

export const mockDashboardOverview: DashboardOverviewVM = {
  monthLabel: "July 2026",
  monthlyIncomeDisplay: "$8,420",
  monthlyExpenseDisplay: "$5,965",
  netCashFlowDisplay: "+$2,455",
  remainingBudgetDisplay: "$1,135",
  largestExpenseCategory: "Housing",
};

export const mockAccounts: AccountSummaryVM[] = [
  {
    id: "acct-checking",
    name: "Primary Checking",
    type: "checking",
    currentBalanceDisplay: "$6,480",
    status: "healthy",
  },
  {
    id: "acct-savings",
    name: "Emergency Savings",
    type: "savings",
    currentBalanceDisplay: "$12,900",
    status: "healthy",
  },
];

export const mockCategories: CategoryListVM[] = [
  {
    id: "cat-housing",
    name: "Housing",
    type: "expense",
    color: "#D96C5F",
    icon: "home",
  },
  {
    id: "cat-salary",
    name: "Salary",
    type: "income",
    color: "#0F8B8D",
    icon: "wallet",
  },
];

export const mockTransactions: TransactionListVM[] = [
  {
    id: "txn-rent",
    dateDisplay: "Jul 1",
    merchant: "Park View Apartments",
    description: "Monthly rent",
    amountDisplay: "-$2,250",
    type: "expense",
    categoryName: "Housing",
    accountName: "Primary Checking",
  },
  {
    id: "txn-payroll",
    dateDisplay: "Jul 5",
    merchant: "Northline Studio",
    description: "Payroll deposit",
    amountDisplay: "+$4,210",
    type: "income",
    categoryName: "Salary",
    accountName: "Primary Checking",
  },
];

export const mockBudgets: BudgetProgressVM[] = [
  {
    id: "budget-housing",
    categoryName: "Housing",
    limitDisplay: "$2,500",
    spentDisplay: "$2,250",
    remainingDisplay: "$250",
    progressPercent: 90,
    status: "near",
  },
  {
    id: "budget-groceries",
    categoryName: "Groceries",
    limitDisplay: "$700",
    spentDisplay: "$410",
    remainingDisplay: "$290",
    progressPercent: 58,
    status: "under",
  },
];

export const mockCsvPreviewRows: CsvImportPreviewRow[] = [
  {
    id: "csv-1",
    dateDisplay: "2026-07-03",
    description: "Morning Roast",
    amountDisplay: "-$8.90",
    type: "expense",
    status: "valid",
    message: "Ready to import",
  },
  {
    id: "csv-2",
    dateDisplay: "2026-07-04",
    description: "Transfer",
    amountDisplay: "+$500.00",
    type: "income",
    status: "review",
    message: "Category needs confirmation",
  },
];
