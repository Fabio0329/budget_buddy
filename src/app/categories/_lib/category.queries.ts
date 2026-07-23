import "server-only";

import { db } from "@/server/db/client";
import { formatCurrencyFromCents } from "@/shared/utils/formatters";
import type { CategoryManagerVM } from "@/shared/types/view-models";

export async function getCategoryManagerItems(
  userId: string,
): Promise<CategoryManagerVM[]> {
  const categories = await db.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      _count: { select: { budgets: true, transactions: true } },
      color: true,
      icon: true,
      id: true,
      name: true,
      note: true,
      transactions: { select: { amountCents: true, date: true } },
      type: true,
    },
    where: { userId },
  });

  return categories.map((category) => {
    const activeMonths = new Set(
      category.transactions.map((transaction) =>
        transaction.date.toISOString().slice(0, 7),
      ),
    );
    const totalCents = category.transactions.reduce(
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
      linkedBudgetCount: category._count.budgets,
      linkedTransactionCount: category._count.transactions,
      monthlyAverageCents,
      monthlyAverageDisplay: formatCurrencyFromCents(monthlyAverageCents),
      name: category.name,
      note: category.note ?? "Ready for transaction and budget activity.",
      type: category.type.toLowerCase() as "expense" | "income",
    };
  });
}
