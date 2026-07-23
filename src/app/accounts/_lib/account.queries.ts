import "server-only";

import { db } from "@/server/db/client";
import { formatCurrencyFromCents } from "@/shared/utils/formatters";
import type { AccountManagerVM } from "@/shared/types/view-models";

function formatUpdatedAt(updatedAt: Date) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - updatedAt.getTime()) / 60_000),
  );

  if (elapsedMinutes < 1) return "just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return updatedAt.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: updatedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export async function getAccountManagerItems(
  userId: string,
): Promise<AccountManagerVM[]> {
  const accounts = await db.account.findMany({
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    select: {
      _count: { select: { transactions: true } },
      currentBalanceCents: true,
      id: true,
      institution: true,
      name: true,
      note: true,
      startingBalanceCents: true,
      type: true,
      updatedAt: true,
    },
    where: { userId },
  });

  return accounts.map((account) => ({
    currentBalanceCents: account.currentBalanceCents,
    currentBalanceDisplay: formatCurrencyFromCents(account.currentBalanceCents),
    id: account.id,
    institution: account.institution,
    lastUpdatedLabel: formatUpdatedAt(account.updatedAt),
    linkedTransactionCount: account._count.transactions,
    name: account.name,
    note:
      account.note ??
      (account.currentBalanceCents < 0
        ? "Balance is below zero and should be reviewed."
        : "Ready for transaction activity."),
    startingBalanceCents: account.startingBalanceCents,
    startingBalanceDisplay: formatCurrencyFromCents(account.startingBalanceCents),
    status: account.currentBalanceCents < 0 ? "warning" : "healthy",
    type: account.type.toLowerCase(),
  }));
}
