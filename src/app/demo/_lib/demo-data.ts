import {
  formatCurrencyFromCents,
  monthLabelFromKey,
} from "@/shared/utils/formatters";
import type {
  AccountManagerVM,
  BudgetProgressVM,
  CategoryManagerVM,
  CategorySpendVM,
  DailySpendVM,
  DashboardMonthVM,
  IncomeExpenseBarVM,
  TransactionManagerVM,
} from "@/shared/types/view-models";
import type { BudgetOverviewItem } from "@/app/budgets/_lib/budget.types";

export type DemoSnapshot = {
  accounts: AccountManagerVM[];
  budgetsByMonth: Record<string, BudgetOverviewItem[]>;
  categories: CategoryManagerVM[];
  dashboardsByMonth: Record<string, DashboardMonthVM>;
  monthOptions: Array<{ label: string; value: string }>;
  transactions: TransactionManagerVM[];
};

type DemoAccount = {
  currentBalanceCents: number;
  id: string;
  institution: string;
  name: string;
  note: string;
  startingBalanceCents: number;
  type: string;
};

type DemoCategory = {
  color: string;
  icon: string;
  id: string;
  name: string;
  note: string;
  type: "expense" | "income";
};

type DemoTransaction = {
  accountId: string;
  amountCents: number;
  categoryId: string | null;
  date: string;
  description: string;
  id: string;
  merchant: string;
  notes: string;
  type: "expense" | "income" | "transfer";
};

type DemoBudget = {
  categoryId: string;
  id: string;
  limitAmountCents: number;
  month: string;
  note: string;
};

const accounts: DemoAccount[] = [
  {
    currentBalanceCents: 624850,
    id: "account-checking",
    institution: "Cedar National Bank",
    name: "Everyday Checking",
    note: "Primary account for income, bills, and everyday spending.",
    startingBalanceCents: 310000,
    type: "checking",
  },
  {
    currentBalanceCents: 1284000,
    id: "account-savings",
    institution: "Cedar National Bank",
    name: "Emergency Savings",
    note: "Emergency fund with a little over four months of core expenses.",
    startingBalanceCents: 1000000,
    type: "savings",
  },
  {
    currentBalanceCents: -186420,
    id: "account-credit",
    institution: "Summit Card Services",
    name: "Travel Rewards Card",
    note: "Statement balance is due next week and should be reviewed.",
    startingBalanceCents: 0,
    type: "credit_card",
  },
];

const categories: DemoCategory[] = [
  {
    color: "var(--primary)",
    icon: "SA",
    id: "category-salary",
    name: "Salary",
    note: "Primary full-time income.",
    type: "income",
  },
  {
    color: "var(--positive)",
    icon: "FL",
    id: "category-freelance",
    name: "Freelance",
    note: "Occasional design and development projects.",
    type: "income",
  },
  {
    color: "var(--ink)",
    icon: "HO",
    id: "category-housing",
    name: "Housing",
    note: "Rent and housing-related costs.",
    type: "expense",
  },
  {
    color: "var(--accent)",
    icon: "GR",
    id: "category-groceries",
    name: "Groceries",
    note: "Food and household essentials.",
    type: "expense",
  },
  {
    color: "var(--muted)",
    icon: "TR",
    id: "category-transport",
    name: "Transportation",
    note: "Transit, rides, fuel, and parking.",
    type: "expense",
  },
  {
    color: "var(--negative)",
    icon: "DI",
    id: "category-dining",
    name: "Dining",
    note: "Restaurants, coffee, and takeout.",
    type: "expense",
  },
  {
    color: "var(--primary-hover)",
    icon: "UT",
    id: "category-utilities",
    name: "Utilities",
    note: "Internet, power, and mobile service.",
    type: "expense",
  },
  {
    color: "var(--accent-hover)",
    icon: "EN",
    id: "category-entertainment",
    name: "Entertainment",
    note: "Streaming, events, and hobbies.",
    type: "expense",
  },
  {
    color: "var(--warning)",
    icon: "HC",
    id: "category-healthcare",
    name: "Healthcare",
    note: "Prescriptions and medical expenses.",
    type: "expense",
  },
];

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function shiftedMonth(now: Date, offset: number) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1),
  );
}

function isoDateForMonth(now: Date, offset: number, requestedDay: number) {
  const month = shiftedMonth(now, offset);
  const lastDay = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const day =
    offset === 0
      ? Math.min(requestedDay, Math.max(now.getUTCDate(), 1))
      : Math.min(requestedDay, lastDay);

  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day))
    .toISOString()
    .slice(0, 10);
}

function buildTransactions(now: Date): DemoTransaction[] {
  const monthTemplates = [
    {
      offset: -2,
      freelance: 0,
      groceries: [17632, 19486, 15824],
      dining: [6280, 7425],
      utilities: 21840,
      healthcare: 0,
      uncategorized: 3499,
    },
    {
      offset: -1,
      freelance: 95000,
      groceries: [18452, 16730, 20116],
      dining: [7650, 9850],
      utilities: 22165,
      healthcare: 4825,
      uncategorized: 0,
    },
    {
      offset: 0,
      freelance: 62500,
      groceries: [19244, 16815, 20650],
      dining: [8420, 12640],
      utilities: 22630,
      healthcare: 7240,
      uncategorized: 4599,
    },
  ] as const;
  const result: DemoTransaction[] = [];

  function add(
    offset: number,
    slug: string,
    day: number,
    accountId: string,
    categoryId: string | null,
    type: DemoTransaction["type"],
    amountCents: number,
    merchant: string,
    description: string,
    notes = "",
  ) {
    result.push({
      accountId,
      amountCents,
      categoryId,
      date: isoDateForMonth(now, offset, day),
      description,
      id: `transaction-${offset}-${slug}`,
      merchant,
      notes,
      type,
    });
  }

  for (const template of monthTemplates) {
    const { offset } = template;
    add(
      offset,
      "salary",
      1,
      "account-checking",
      "category-salary",
      "income",
      585000,
      "Northstar Product Co.",
      "Monthly salary",
    );
    if (template.freelance) {
      add(
        offset,
        "freelance",
        18,
        "account-checking",
        "category-freelance",
        "income",
        template.freelance,
        "Brightline Studio",
        "Freelance project payment",
      );
    }
    add(
      offset,
      "rent",
      2,
      "account-checking",
      "category-housing",
      "expense",
      -165000,
      "Parkview Apartments",
      "Monthly rent",
    );
    template.groceries.forEach((amount, index) =>
      add(
        offset,
        `groceries-${index}`,
        5 + index * 8,
        index === 2 ? "account-credit" : "account-checking",
        "category-groceries",
        "expense",
        -amount,
        index === 1 ? "Fresh Basket" : "Union Market",
        "Weekly groceries",
      ),
    );
    add(
      offset,
      "transit",
      7,
      "account-checking",
      "category-transport",
      "expense",
      -13200,
      "Metro Transit",
      "Monthly transit pass",
    );
    add(
      offset,
      "utilities",
      9,
      "account-checking",
      "category-utilities",
      "expense",
      -template.utilities,
      "City Utilities",
      "Power and internet",
    );
    add(
      offset,
      "dining-1",
      11,
      "account-credit",
      "category-dining",
      "expense",
      -template.dining[0],
      "Juniper Kitchen",
      "Dinner with friends",
    );
    add(
      offset,
      "streaming",
      13,
      "account-credit",
      "category-entertainment",
      "expense",
      -1899,
      "Streambox",
      "Monthly streaming plan",
    );
    add(
      offset,
      "dining-2",
      20,
      "account-credit",
      "category-dining",
      "expense",
      -template.dining[1],
      "Common Ground Cafe",
      "Weekend brunch",
    );
    add(
      offset,
      "savings",
      21,
      "account-checking",
      null,
      "transfer",
      -45000,
      "Cedar National Bank",
      "Transfer to emergency savings",
      "Internal transfer",
    );
    if (template.healthcare) {
      add(
        offset,
        "healthcare",
        23,
        "account-credit",
        "category-healthcare",
        "expense",
        -template.healthcare,
        "Neighborhood Pharmacy",
        "Prescription refill",
      );
    }
    if (template.uncategorized) {
      add(
        offset,
        "uncategorized",
        24,
        "account-credit",
        null,
        "expense",
        -template.uncategorized,
        "Online Purchase",
        "Needs review",
      );
    }
  }

  return result.sort((left, right) => right.date.localeCompare(left.date));
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function buildTransactionViewModels(
  transactions: DemoTransaction[],
): TransactionManagerVM[] {
  const accountNames = new Map(
    accounts.map((account) => [account.id, account.name]),
  );
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return transactions.map((transaction) => ({
    accountId: transaction.accountId,
    accountName: accountNames.get(transaction.accountId) ?? "Unknown account",
    amountCents: transaction.amountCents,
    amountDisplay: formatCurrencyFromCents(transaction.amountCents),
    categoryId: transaction.categoryId,
    categoryName: transaction.categoryId
      ? (categoryNames.get(transaction.categoryId) ?? "Uncategorized")
      : transaction.type === "transfer"
        ? "Transfer"
        : "Uncategorized",
    date: transaction.date,
    dateDisplay: formatDate(transaction.date),
    description: transaction.description,
    id: transaction.id,
    merchant: transaction.merchant,
    notes: transaction.notes,
    type: transaction.type,
  }));
}

function buildAccountViewModels(
  transactions: DemoTransaction[],
): AccountManagerVM[] {
  return accounts.map((account) => ({
    currentBalanceCents: account.currentBalanceCents,
    currentBalanceDisplay: formatCurrencyFromCents(account.currentBalanceCents),
    id: account.id,
    institution: account.institution,
    lastUpdatedLabel: "Updated today",
    linkedTransactionCount: transactions.filter(
      (transaction) => transaction.accountId === account.id,
    ).length,
    name: account.name,
    note: account.note,
    startingBalanceCents: account.startingBalanceCents,
    startingBalanceDisplay: formatCurrencyFromCents(
      account.startingBalanceCents,
    ),
    status: account.currentBalanceCents < 0 ? "warning" : "healthy",
    type: account.type,
  }));
}

function buildCategoryViewModels(
  transactions: DemoTransaction[],
  budgets: DemoBudget[],
): CategoryManagerVM[] {
  return categories.map((category) => {
    const linkedTransactions = transactions.filter(
      (transaction) => transaction.categoryId === category.id,
    );
    const activeMonths = new Set(
      linkedTransactions.map((transaction) => transaction.date.slice(0, 7)),
    );
    const totalCents = linkedTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amountCents),
      0,
    );
    const monthlyAverageCents = activeMonths.size
      ? Math.round(totalCents / activeMonths.size)
      : 0;

    return {
      color: category.color,
      iconToken: category.icon,
      id: category.id,
      linkedBudgetCount: budgets.filter(
        (budget) => budget.categoryId === category.id,
      ).length,
      linkedTransactionCount: linkedTransactions.length,
      monthlyAverageCents,
      monthlyAverageDisplay: formatCurrencyFromCents(monthlyAverageCents),
      name: category.name,
      note: category.note,
      type: category.type,
    };
  });
}

function buildCategorySpend(
  selectedTransactions: TransactionManagerVM[],
  categoryById: Map<string, DemoCategory>,
): CategorySpendVM[] {
  const spending = new Map<
    string,
    { color: string; label: string; value: number }
  >();

  selectedTransactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const category = transaction.categoryId
        ? categoryById.get(transaction.categoryId)
        : null;
      const id = category?.id ?? "uncategorized";
      const current = spending.get(id);
      spending.set(id, {
        color: category?.color ?? "var(--muted)",
        label: category?.name ?? "Uncategorized",
        value: (current?.value ?? 0) + Math.abs(transaction.amountCents),
      });
    });

  const sorted = [...spending.entries()].sort(
    ([, left], [, right]) => right.value - left.value,
  );
  const total = sorted.reduce((sum, [, item]) => sum + item.value, 0);
  const result = sorted.map(([id, item]) => ({
    color: item.color,
    id,
    label: item.label,
    sharePercent: total ? Math.round((item.value / total) * 100) : 0,
    valueDisplay: formatCurrencyFromCents(item.value),
  }));
  if (result.length) {
    result[0].sharePercent +=
      100 - result.reduce((sum, item) => sum + item.sharePercent, 0);
  }
  return result;
}

function buildDailySpending(
  selectedTransactions: TransactionManagerVM[],
): DailySpendVM[] {
  const totals = new Map<number, number>();
  selectedTransactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const day = Number(transaction.date.slice(-2));
      totals.set(
        day,
        (totals.get(day) ?? 0) + Math.abs(transaction.amountCents),
      );
    });

  return [...totals.entries()]
    .sort(([left], [right]) => left - right)
    .map(([day, amountCents]) => ({
      amount: amountCents / 100,
      id: `day-${day}`,
      label: String(day),
      valueDisplay: formatCurrencyFromCents(amountCents),
    }));
}

function buildBudgets(
  month: string,
  budgetData: DemoBudget[],
  transactions: TransactionManagerVM[],
  categoryById: Map<string, DemoCategory>,
): BudgetOverviewItem[] {
  return budgetData
    .filter((budget) => budget.month === month)
    .map((budget) => {
      const category = categoryById.get(budget.categoryId)!;
      const spentAmountCents = transactions
        .filter(
          (transaction) =>
            transaction.date.startsWith(month) &&
            transaction.categoryId === budget.categoryId &&
            transaction.type === "expense",
        )
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amountCents),
          0,
        );
      const remainingAmountCents = budget.limitAmountCents - spentAmountCents;
      const progressPercent = Math.round(
        (spentAmountCents / Math.max(budget.limitAmountCents, 1)) * 100,
      );
      const status =
        progressPercent >= 100
          ? "over"
          : progressPercent >= 80
            ? "near"
            : "under";

      return {
        categoryColor: category.color,
        categoryId: category.id,
        categoryName: category.name,
        id: budget.id,
        limitAmountCents: budget.limitAmountCents,
        limitDisplay: formatCurrencyFromCents(budget.limitAmountCents),
        month,
        monthLabel: monthLabelFromKey(month),
        note: budget.note,
        progressPercent,
        remainingAmountCents,
        remainingDisplay: formatCurrencyFromCents(remainingAmountCents),
        spentAmountCents,
        spentDisplay: formatCurrencyFromCents(spentAmountCents),
        status,
      } satisfies BudgetOverviewItem;
    })
    .sort((left, right) => left.categoryName.localeCompare(right.categoryName));
}

function toBudgetProgress(budget: BudgetOverviewItem): BudgetProgressVM {
  return {
    categoryName: budget.categoryName,
    id: budget.id,
    limitDisplay: budget.limitDisplay,
    progressPercent: budget.progressPercent,
    remainingDisplay: budget.remainingDisplay,
    spentDisplay: budget.spentDisplay,
    status: budget.status,
  };
}

export function createDemoSnapshot(now = new Date()): DemoSnapshot {
  const monthOptions = [-2, -1, 0]
    .map((offset) => {
      const value = monthKey(shiftedMonth(now, offset));
      return { label: monthLabelFromKey(value), value };
    })
    .reverse();
  const chronologicalMonths = [...monthOptions].reverse();
  const rawTransactions = buildTransactions(now);
  const transactionVMs = buildTransactionViewModels(rawTransactions);
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const budgetData: DemoBudget[] = chronologicalMonths.flatMap((month) => [
    {
      categoryId: "category-housing",
      id: `budget-${month.value}-housing`,
      limitAmountCents: 175000,
      month: month.value,
      note: "Keep housing below 30% of take-home pay.",
    },
    {
      categoryId: "category-groceries",
      id: `budget-${month.value}-groceries`,
      limitAmountCents: 65000,
      month: month.value,
      note: "Includes groceries and household staples.",
    },
    {
      categoryId: "category-transport",
      id: `budget-${month.value}-transport`,
      limitAmountCents: 25000,
      month: month.value,
      note: "Transit plus occasional rideshare.",
    },
    {
      categoryId: "category-dining",
      id: `budget-${month.value}-dining`,
      limitAmountCents: 18000,
      month: month.value,
      note: "A flexible social spending target.",
    },
    {
      categoryId: "category-utilities",
      id: `budget-${month.value}-utilities`,
      limitAmountCents: 30000,
      month: month.value,
      note: "Power, internet, and mobile service.",
    },
    {
      categoryId: "category-entertainment",
      id: `budget-${month.value}-entertainment`,
      limitAmountCents: 14000,
      month: month.value,
      note: "Subscriptions and weekend activities.",
    },
  ]);
  const budgetsByMonth = Object.fromEntries(
    monthOptions.map(({ value }) => [
      value,
      buildBudgets(value, budgetData, transactionVMs, categoryById),
    ]),
  );
  const totalAccountBalance = accounts.reduce(
    (sum, account) => sum + account.currentBalanceCents,
    0,
  );

  const comparisonBars: IncomeExpenseBarVM[] = chronologicalMonths.map(
    ({ label, value }) => {
      const monthly = transactionVMs.filter((transaction) =>
        transaction.date.startsWith(value),
      );
      const income = monthly
        .filter((transaction) => transaction.type === "income")
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amountCents),
          0,
        );
      const expense = monthly
        .filter((transaction) => transaction.type === "expense")
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amountCents),
          0,
        );
      return {
        expense: expense / 100,
        expenseDisplay: formatCurrencyFromCents(expense),
        id: value,
        income: income / 100,
        incomeDisplay: formatCurrencyFromCents(income),
        label: label.split(" ")[0],
      };
    },
  );

  const dashboardsByMonth = Object.fromEntries(
    monthOptions.map(({ label, value }) => {
      const selected = transactionVMs.filter((transaction) =>
        transaction.date.startsWith(value),
      );
      const incomeCents = selected
        .filter((transaction) => transaction.type === "income")
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amountCents),
          0,
        );
      const expenseCents = selected
        .filter((transaction) => transaction.type === "expense")
        .reduce(
          (sum, transaction) => sum + Math.abs(transaction.amountCents),
          0,
        );
      const categorySpend = buildCategorySpend(selected, categoryById);
      const budgets = budgetsByMonth[value];
      const remainingBudget = budgets.reduce(
        (sum, budget) => sum + budget.remainingAmountCents,
        0,
      );

      return [
        value,
        {
          budgets: budgets.map(toBudgetProgress),
          categorySpend,
          dailySpending: buildDailySpending(selected),
          goal: null,
          id: value,
          incomeVsExpense: comparisonBars,
          label,
          recentTransactions: selected.slice(0, 5),
          summary: {
            largestExpenseCategory: categorySpend[0]?.label ?? "No expenses",
            monthLabel: label,
            monthlyExpenseDisplay: formatCurrencyFromCents(expenseCents),
            monthlyIncomeDisplay: formatCurrencyFromCents(incomeCents),
            netCashFlowDisplay: `${incomeCents - expenseCents >= 0 ? "+" : ""}${formatCurrencyFromCents(incomeCents - expenseCents)}`,
            remainingBudgetDisplay: formatCurrencyFromCents(remainingBudget),
            totalAccountBalanceDisplay:
              formatCurrencyFromCents(totalAccountBalance),
          },
          upcomingRecurring: [],
        } satisfies DashboardMonthVM,
      ];
    }),
  );

  return {
    accounts: buildAccountViewModels(rawTransactions),
    budgetsByMonth,
    categories: buildCategoryViewModels(rawTransactions, budgetData),
    dashboardsByMonth,
    monthOptions,
    transactions: transactionVMs,
  };
}
