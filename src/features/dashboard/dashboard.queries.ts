import "server-only";

import { getBudgetMonthOptions } from "@/features/budgets/budget.queries";
import { parseBudgetMonth } from "@/features/budgets/budget.validation";
import { db } from "@/server/db/client";
import {
  formatCurrencyFromCents,
  monthLabelFromKey,
} from "@/shared/utils/formatters";
import type {
  BudgetProgressVM,
  CategorySpendVM,
  DailySpendVM,
  DashboardMonthVM,
  IncomeExpenseBarVM,
  TransactionListVM,
} from "@/shared/types/view-models";

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function currentMonthKey() {
  const now = new Date();
  return monthKey(now.getUTCFullYear(), now.getUTCMonth() + 1);
}

function shiftedMonth(key: string, offset: number) {
  const parsed = parseBudgetMonth(key)!;
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1 + offset, 1));
  return monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

function monthBounds(key: string) {
  const parsed = parseBudgetMonth(key)!;
  return {
    start: new Date(Date.UTC(parsed.year, parsed.month - 1, 1)),
    end: new Date(Date.UTC(parsed.year, parsed.month, 1)),
  };
}

function formatSignedCurrency(cents: number) {
  const formatted = formatCurrencyFromCents(cents);
  return cents > 0 ? `+${formatted}` : formatted;
}

function buildCategorySpend(
  transactions: Array<{
    amountCents: number;
    category: { color: string; id: string; name: string } | null;
  }>,
): CategorySpendVM[] {
  const spending = new Map<
    string,
    { color: string; id: string; label: string; valueCents: number }
  >();

  for (const transaction of transactions) {
    const category = transaction.category ?? {
      color: "#93A7BC",
      id: "uncategorized",
      name: "Uncategorized",
    };
    const current = spending.get(category.id);
    spending.set(category.id, {
      color: category.color,
      id: category.id,
      label: category.name,
      valueCents:
        (current?.valueCents ?? 0) + Math.abs(transaction.amountCents),
    });
  }

  const sorted = [...spending.values()].sort(
    (left, right) => right.valueCents - left.valueCents,
  );
  const totalCents = sorted.reduce((sum, item) => sum + item.valueCents, 0);
  const segments = sorted.map((item) => ({
    color: item.color,
    id: item.id,
    label: item.label,
    sharePercent: totalCents
      ? Math.round((item.valueCents / totalCents) * 100)
      : 0,
    valueDisplay: formatCurrencyFromCents(item.valueCents),
  }));

  if (segments.length > 0) {
    const roundedTotal = segments.reduce(
      (sum, segment) => sum + segment.sharePercent,
      0,
    );
    segments[0].sharePercent += 100 - roundedTotal;
  }

  return segments;
}

function buildDailySpending(
  transactions: Array<{ amountCents: number; date: Date }>,
): DailySpendVM[] {
  const daily = new Map<number, number>();

  for (const transaction of transactions) {
    const day = transaction.date.getUTCDate();
    daily.set(day, (daily.get(day) ?? 0) + Math.abs(transaction.amountCents));
  }

  return [...daily.entries()]
    .sort(([left], [right]) => left - right)
    .map(([day, amountCents]) => ({
      amount: amountCents / 100,
      id: `day-${day}`,
      label: String(day),
      valueDisplay: formatCurrencyFromCents(amountCents),
    }));
}

function toRecentTransaction(transaction: {
  account: { name: string };
  amountCents: number;
  category: { name: string } | null;
  date: Date;
  description: string;
  id: string;
  merchant: string;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
}): TransactionListVM {
  return {
    accountName: transaction.account.name,
    amountDisplay: formatCurrencyFromCents(transaction.amountCents),
    categoryName: transaction.category?.name ?? "Transfer",
    dateDisplay: transaction.date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    description: transaction.description,
    id: transaction.id,
    merchant: transaction.merchant || "No merchant",
    type: transaction.type.toLowerCase() as TransactionListVM["type"],
  };
}

function buildComparisonBars(
  comparisonMonths: string[],
  transactions: Array<{
    amountCents: number;
    date: Date;
    type: "EXPENSE" | "INCOME" | "TRANSFER";
  }>,
): IncomeExpenseBarVM[] {
  const totals = new Map(
    comparisonMonths.map((key) => [key, { expenseCents: 0, incomeCents: 0 }]),
  );

  for (const transaction of transactions) {
    const key = monthKey(
      transaction.date.getUTCFullYear(),
      transaction.date.getUTCMonth() + 1,
    );
    const total = totals.get(key);
    if (!total) continue;

    if (transaction.type === "EXPENSE") {
      total.expenseCents += Math.abs(transaction.amountCents);
    } else if (transaction.type === "INCOME") {
      total.incomeCents += Math.abs(transaction.amountCents);
    }
  }

  return comparisonMonths.map((key) => {
    const total = totals.get(key)!;
    return {
      expense: total.expenseCents / 100,
      expenseDisplay: formatCurrencyFromCents(total.expenseCents),
      id: key,
      income: total.incomeCents / 100,
      incomeDisplay: formatCurrencyFromCents(total.incomeCents),
      label: new Date(`${key}-01T00:00:00.000Z`).toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
    };
  });
}

export async function getDashboardMonthData(
  userId: string,
  requestedMonth?: string,
): Promise<{
  dashboard: DashboardMonthVM;
  months: Array<{ label: string; value: string }>;
}> {
  const selectedMonth =
    requestedMonth && parseBudgetMonth(requestedMonth)
      ? requestedMonth
      : currentMonthKey();
  const comparisonMonths = [-2, -1, 0].map((offset) =>
    shiftedMonth(selectedMonth, offset),
  );
  const comparisonStart = monthBounds(comparisonMonths[0]).start;
  const selectedBounds = monthBounds(selectedMonth);
  const selected = parseBudgetMonth(selectedMonth)!;

  const [transactions, accountTotals, budgets, months] = await Promise.all([
    db.transaction.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        account: { select: { name: true } },
        amountCents: true,
        category: { select: { color: true, id: true, name: true } },
        date: true,
        description: true,
        id: true,
        merchant: true,
        type: true,
      },
      where: {
        date: { gte: comparisonStart, lt: selectedBounds.end },
        userId,
      },
    }),
    db.account.aggregate({
      _sum: { currentBalanceCents: true },
      where: { userId },
    }),
    db.budget.findMany({
      orderBy: { category: { name: "asc" } },
      select: {
        category: { select: { id: true, name: true } },
        categoryId: true,
        id: true,
        limitAmountCents: true,
      },
      where: { month: selected.month, userId, year: selected.year },
    }),
    getBudgetMonthOptions(userId, selectedMonth),
  ]);

  const selectedTransactions = transactions.filter(
    (transaction) =>
      transaction.date >= selectedBounds.start &&
      transaction.date < selectedBounds.end,
  );
  const expenseTransactions = selectedTransactions.filter(
    (transaction) => transaction.type === "EXPENSE",
  );
  const incomeCents = selectedTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);
  const expenseCents = expenseTransactions.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amountCents),
    0,
  );
  const categorySpend = buildCategorySpend(expenseTransactions);
  const spentByCategory = expenseTransactions.reduce((spending, transaction) => {
    if (transaction.category) {
      spending.set(
        transaction.category.id,
        (spending.get(transaction.category.id) ?? 0) +
          Math.abs(transaction.amountCents),
      );
    }
    return spending;
  }, new Map<string, number>());
  const budgetProgress: BudgetProgressVM[] = budgets.map((budget) => {
    const spentCents = spentByCategory.get(budget.categoryId) ?? 0;
    const remainingCents = budget.limitAmountCents - spentCents;
    const progressPercent = Math.round(
      (spentCents / Math.max(budget.limitAmountCents, 1)) * 100,
    );
    return {
      categoryName: budget.category.name,
      id: budget.id,
      limitDisplay: formatCurrencyFromCents(budget.limitAmountCents),
      progressPercent,
      remainingDisplay: formatCurrencyFromCents(remainingCents),
      spentDisplay: formatCurrencyFromCents(spentCents),
      status:
        progressPercent >= 100
          ? "over"
          : progressPercent >= 80
            ? "near"
            : "under",
    };
  });
  const remainingBudgetCents = budgets.reduce(
    (remaining, budget) =>
      remaining +
      budget.limitAmountCents -
      (spentByCategory.get(budget.categoryId) ?? 0),
    0,
  );

  return {
    dashboard: {
      budgets: budgetProgress,
      categorySpend,
      dailySpending: buildDailySpending(expenseTransactions),
      goal: null,
      id: selectedMonth,
      incomeVsExpense: buildComparisonBars(comparisonMonths, transactions),
      label: monthLabelFromKey(selectedMonth),
      recentTransactions: selectedTransactions.slice(0, 5).map(toRecentTransaction),
      summary: {
        largestExpenseCategory: categorySpend[0]?.label ?? "No expenses",
        monthLabel: monthLabelFromKey(selectedMonth),
        monthlyExpenseDisplay: formatCurrencyFromCents(expenseCents),
        monthlyIncomeDisplay: formatCurrencyFromCents(incomeCents),
        netCashFlowDisplay: formatSignedCurrency(incomeCents - expenseCents),
        remainingBudgetDisplay: formatCurrencyFromCents(remainingBudgetCents),
        totalAccountBalanceDisplay: formatCurrencyFromCents(
          accountTotals._sum.currentBalanceCents ?? 0,
        ),
      },
      upcomingRecurring: [],
    },
    months,
  };
}
