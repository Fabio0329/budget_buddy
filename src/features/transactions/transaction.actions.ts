"use server";

import { revalidatePath } from "next/cache";
import type {
  TransactionFormState,
  TransactionImportInput,
  TransactionImportState,
} from "@/features/transactions/transaction-form-state";
import {
  validateTransactionForm,
  validateTransactionInput,
} from "@/features/transactions/transaction.validation";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { reportServerError } from "@/server/observability/logger";

function refreshTransactionConsumers() {
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
}

function categoryTypeForTransaction(type: "EXPENSE" | "INCOME" | "TRANSFER") {
  if (type === "EXPENSE") return "EXPENSE";
  if (type === "INCOME") return "INCOME";
  return null;
}

export async function saveTransaction(
  _: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const result = validateTransactionForm(formData);

  if (!result.data) {
    return {
      errors: result.errors,
      message: "Fix the highlighted transaction fields and try again.",
      status: "error",
    };
  }

  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "").trim();

  try {
    const mutation = await db.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        select: { id: true },
        where: { id: result.data.accountId, userId: user.id },
      });

      if (!account) return { error: "Selected account is unavailable." };

      if (result.data.categoryId) {
        const category = await tx.category.findFirst({
          select: { type: true },
          where: { id: result.data.categoryId, userId: user.id },
        });
        const requiredType = categoryTypeForTransaction(result.data.type);

        if (!category) return { error: "Selected category is unavailable." };
        if (category.type !== requiredType) {
          return { error: "Category must match the transaction type." };
        }
      }

      if (id) {
        const existing = await tx.transaction.findFirst({
          select: { accountId: true, amountCents: true, id: true },
          where: { id, userId: user.id },
        });

        if (!existing) return { error: "That transaction no longer exists." };

        await tx.transaction.update({
          data: result.data,
          where: { id: existing.id },
        });

        if (existing.accountId === result.data.accountId) {
          await tx.account.updateMany({
            data: {
              currentBalanceCents: {
                increment: result.data.amountCents - existing.amountCents,
              },
            },
            where: { id: existing.accountId, userId: user.id },
          });
        } else {
          await tx.account.updateMany({
            data: { currentBalanceCents: { decrement: existing.amountCents } },
            where: { id: existing.accountId, userId: user.id },
          });
          await tx.account.updateMany({
            data: { currentBalanceCents: { increment: result.data.amountCents } },
            where: { id: result.data.accountId, userId: user.id },
          });
        }

        return { id: existing.id };
      }

      const transaction = await tx.transaction.create({
        data: { ...result.data, userId: user.id },
        select: { id: true },
      });
      await tx.account.updateMany({
        data: { currentBalanceCents: { increment: result.data.amountCents } },
        where: { id: result.data.accountId, userId: user.id },
      });

      return transaction;
    });

    if ("error" in mutation) {
      return { message: mutation.error, status: "error" };
    }

    refreshTransactionConsumers();
    return {
      entityId: mutation.id,
      message: id ? "Transaction updated." : "Transaction created.",
      status: "success",
    };
  } catch (error) {
    reportServerError("transaction.save.failed", error);
    return {
      message: "We could not save this transaction right now. Please try again.",
      status: "error",
    };
  }
}

export async function deleteTransaction(
  id: string,
): Promise<TransactionFormState> {
  const user = await requireCurrentUser();

  try {
    const deleted = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        select: { accountId: true, amountCents: true, id: true },
        where: { id, userId: user.id },
      });

      if (!transaction) return false;

      await tx.transaction.delete({ where: { id: transaction.id } });
      await tx.account.updateMany({
        data: { currentBalanceCents: { decrement: transaction.amountCents } },
        where: { id: transaction.accountId, userId: user.id },
      });
      return true;
    });

    if (!deleted) {
      return { message: "That transaction no longer exists.", status: "error" };
    }

    refreshTransactionConsumers();
    return { entityId: id, message: "Transaction removed.", status: "success" };
  } catch (error) {
    reportServerError("transaction.delete.failed", error);
    return {
      message: "We could not remove this transaction right now. Please try again.",
      status: "error",
    };
  }
}

function duplicateKey(transaction: {
  accountId: string;
  amountCents: number;
  date: Date;
  description: string;
  merchant: string;
}) {
  return [
    transaction.date.toISOString().slice(0, 10),
    Math.abs(transaction.amountCents),
    (transaction.merchant || transaction.description).trim().toLowerCase(),
    transaction.accountId,
  ].join("|");
}

export async function importTransactions(
  rows: TransactionImportInput[],
): Promise<TransactionImportState> {
  if (rows.length === 0 || rows.length > 500) {
    return {
      message: "Import between 1 and 500 valid transaction rows at a time.",
      status: "error",
    };
  }

  const validated = rows.map((row) =>
    validateTransactionInput({
      accountId: row.accountId,
      amount: (Math.abs(row.amountCents) / 100).toFixed(2),
      categoryId: row.categoryId ?? "",
      date: row.date,
      description: row.description,
      merchant: row.merchant,
      notes: row.notes,
      type: row.type,
    }),
  );

  if (validated.some((row) => !row.data)) {
    return {
      message: "One or more import rows failed server validation.",
      status: "error",
    };
  }

  const user = await requireCurrentUser();

  try {
    const importedCount = await db.$transaction(async (tx) => {
      const data = validated.map((row) => row.data!);
      const accountIds = [...new Set(data.map((row) => row.accountId))];
      const categoryIds = [
        ...new Set(data.flatMap((row) => (row.categoryId ? [row.categoryId] : []))),
      ];
      const [accounts, categories, existingTransactions] = await Promise.all([
        tx.account.findMany({
          select: { id: true },
          where: { id: { in: accountIds }, userId: user.id },
        }),
        tx.category.findMany({
          select: { id: true, type: true },
          where: { id: { in: categoryIds }, userId: user.id },
        }),
        tx.transaction.findMany({
          select: {
            accountId: true,
            amountCents: true,
            date: true,
            description: true,
            merchant: true,
          },
          where: { accountId: { in: accountIds }, userId: user.id },
        }),
      ]);
      const ownedAccounts = new Set(accounts.map((account) => account.id));
      const ownedCategories = new Map(
        categories.map((category) => [category.id, category.type]),
      );

      for (const row of data) {
        if (!ownedAccounts.has(row.accountId)) {
          throw new Error("Import references an unavailable account.");
        }
        if (
          row.categoryId &&
          ownedCategories.get(row.categoryId) !== categoryTypeForTransaction(row.type)
        ) {
          throw new Error("Import references an incompatible category.");
        }
      }

      const seen = new Set(existingTransactions.map(duplicateKey));
      const uniqueRows = data.filter((row) => {
        const key = duplicateKey({
          accountId: row.accountId,
          amountCents: row.amountCents,
          date: row.date,
          description: row.description,
          merchant: row.merchant,
        });
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (uniqueRows.length === 0) return 0;

      await tx.transaction.createMany({
        data: uniqueRows.map((row) => ({ ...row, userId: user.id })),
      });

      const balanceDeltas = uniqueRows.reduce((deltas, row) => {
        deltas.set(row.accountId, (deltas.get(row.accountId) ?? 0) + row.amountCents);
        return deltas;
      }, new Map<string, number>());

      for (const [accountId, delta] of balanceDeltas) {
        await tx.account.updateMany({
          data: { currentBalanceCents: { increment: delta } },
          where: { id: accountId, userId: user.id },
        });
      }

      return uniqueRows.length;
    });

    const skippedCount = rows.length - importedCount;
    refreshTransactionConsumers();
    return {
      importedCount,
      message:
        importedCount === 0
          ? "No transactions were imported because every row was a duplicate."
          : `Imported ${importedCount} transaction${importedCount === 1 ? "" : "s"}${
              skippedCount ? ` and skipped ${skippedCount} duplicate${skippedCount === 1 ? "" : "s"}` : ""
            }.`,
      skippedCount,
      status: "success",
    };
  } catch (error) {
    reportServerError("transaction.import.failed", error);
    return {
      message: "We could not import these transactions. Check their accounts and categories, then try again.",
      status: "error",
    };
  }
}
