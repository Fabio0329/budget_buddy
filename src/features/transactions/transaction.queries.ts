import "server-only";

import { db } from "@/server/db/client";
import { formatCurrencyFromCents } from "@/shared/utils/formatters";
import type { TransactionManagerVM } from "@/shared/types/view-models";

function toTransactionManagerItem(transaction: {
  account: { name: string };
  accountId: string;
  amountCents: number;
  category: { name: string } | null;
  categoryId: string | null;
  date: Date;
  description: string;
  id: string;
  merchant: string;
  notes: string | null;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
}): TransactionManagerVM {
  const date = transaction.date.toISOString().slice(0, 10);

  return {
    accountId: transaction.accountId,
    accountName: transaction.account.name,
    amountCents: transaction.amountCents,
    amountDisplay: formatCurrencyFromCents(transaction.amountCents),
    categoryId: transaction.categoryId,
    categoryName: transaction.category?.name ?? "Transfer",
    date,
    dateDisplay: transaction.date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    description: transaction.description,
    id: transaction.id,
    merchant: transaction.merchant,
    notes: transaction.notes ?? "",
    type: transaction.type.toLowerCase() as TransactionManagerVM["type"],
  };
}

const transactionManagerSelect = {
  account: { select: { name: true } },
  accountId: true,
  amountCents: true,
  category: { select: { name: true } },
  categoryId: true,
  date: true,
  description: true,
  id: true,
  merchant: true,
  notes: true,
  type: true,
} as const;

export async function getTransactionManagerItems(
  userId: string,
): Promise<TransactionManagerVM[]> {
  const transactions = await db.transaction.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: transactionManagerSelect,
    where: { userId },
  });

  return transactions.map(toTransactionManagerItem);
}

export async function getTransactionManagerItem(
  userId: string,
  id: string,
): Promise<TransactionManagerVM | null> {
  const transaction = await db.transaction.findFirst({
    select: transactionManagerSelect,
    where: { id, userId },
  });

  return transaction ? toTransactionManagerItem(transaction) : null;
}
