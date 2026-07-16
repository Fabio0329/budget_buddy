import "server-only";

import { db } from "@/server/db/client";
import {
  formatCurrencyFromCents,
  monthLabelFromKey,
} from "@/shared/utils/formatters";
import type { BudgetManagerVM } from "@/shared/types/view-models";

export type BudgetCategoryOption = {
  color: string;
  id: string;
  name: string;
};

export type BudgetMonthOption = {
  label: string;
  value: string;
};

export type BudgetOverviewItem = BudgetManagerVM & {
  progressPercent: number;
  remainingAmountCents: number;
  remainingDisplay: string;
  spentAmountCents: number;
  spentDisplay: string;
  status: "near" | "over" | "under";
};

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthBounds(year: number, month: number) {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}

function toBudgetManagerItem(budget: {
  category: { color: string; name: string };
  categoryId: string;
  id: string;
  limitAmountCents: number;
  month: number;
  note: string | null;
  year: number;
}): BudgetManagerVM {
  const month = monthKey(budget.year, budget.month);

  return {
    categoryColor: budget.category.color,
    categoryId: budget.categoryId,
    categoryName: budget.category.name,
    id: budget.id,
    limitAmountCents: budget.limitAmountCents,
    limitDisplay: formatCurrencyFromCents(budget.limitAmountCents),
    month,
    monthLabel: monthLabelFromKey(month),
    note: budget.note ?? "",
  };
}

export async function getBudgetOverviewItems(
  userId: string,
  year: number,
  month: number,
): Promise<BudgetOverviewItem[]> {
  const budgets = await db.budget.findMany({
    orderBy: { category: { name: "asc" } },
    select: {
      category: {
        select: {
          color: true,
          name: true,
          transactions: {
            select: { amountCents: true },
            where: {
              date: monthBounds(year, month),
              type: "EXPENSE",
              userId,
            },
          },
        },
      },
      categoryId: true,
      id: true,
      limitAmountCents: true,
      month: true,
      note: true,
      year: true,
    },
    where: { month, userId, year },
  });

  return budgets.map((budget) => {
    const base = toBudgetManagerItem(budget);
    const spentAmountCents = budget.category.transactions.reduce(
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
      ...base,
      progressPercent,
      remainingAmountCents,
      remainingDisplay: formatCurrencyFromCents(remainingAmountCents),
      spentAmountCents,
      spentDisplay: formatCurrencyFromCents(spentAmountCents),
      status,
    };
  });
}

export async function getBudgetManagerItem(
  userId: string,
  id: string,
): Promise<BudgetManagerVM | null> {
  const budget = await db.budget.findFirst({
    select: {
      category: { select: { color: true, name: true } },
      categoryId: true,
      id: true,
      limitAmountCents: true,
      month: true,
      note: true,
      year: true,
    },
    where: { id, userId },
  });

  return budget ? toBudgetManagerItem(budget) : null;
}

export async function getBudgetCategoryOptions(
  userId: string,
): Promise<BudgetCategoryOption[]> {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: { color: true, id: true, name: true },
    where: { type: "EXPENSE", userId },
  });
}

export async function getBudgetMonthOptions(
  userId: string,
  preferredMonth?: string,
): Promise<BudgetMonthOption[]> {
  const now = new Date();
  const keys = new Set<string>();

  for (let offset = -12; offset <= 12; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    keys.add(monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1));
  }

  const [budgets, transactionDates] = await Promise.all([
    db.budget.findMany({
      distinct: ["year", "month"],
      select: { month: true, year: true },
      where: { userId },
    }),
    db.transaction.findMany({
      distinct: ["date"],
      select: { date: true },
      where: { type: "EXPENSE", userId },
    }),
  ]);
  budgets.forEach((budget) => keys.add(monthKey(budget.year, budget.month)));
  transactionDates.forEach((transaction) => {
    keys.add(
      monthKey(
        transaction.date.getUTCFullYear(),
        transaction.date.getUTCMonth() + 1,
      ),
    );
  });
  if (preferredMonth) keys.add(preferredMonth);

  return [...keys]
    .sort((left, right) => right.localeCompare(left))
    .map((value) => ({ label: monthLabelFromKey(value), value }));
}
