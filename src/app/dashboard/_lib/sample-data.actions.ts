"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { reportServerError } from "@/server/observability/logger";

export type SampleDataState = { message?: string };

export async function canLoadSampleData(userId: string) {
  const [accounts, categories, transactions, budgets] = await Promise.all([
    db.account.count({ where: { userId } }),
    db.category.count({ where: { userId } }),
    db.transaction.count({ where: { userId } }),
    db.budget.count({ where: { userId } }),
  ]);
  return accounts + categories + transactions + budgets === 0;
}

function currentMonthDate(day: number) {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      Math.min(day, now.getUTCDate()),
    ),
  );
}

export async function loadSampleData(
  previousState: SampleDataState,
): Promise<SampleDataState> {
  void previousState;
  const user = await requireCurrentUser();

  try {
    await db.$transaction(async (tx) => {
      const [accounts, categories, transactions, budgets] = await Promise.all([
        tx.account.count({ where: { userId: user.id } }),
        tx.category.count({ where: { userId: user.id } }),
        tx.transaction.count({ where: { userId: user.id } }),
        tx.budget.count({ where: { userId: user.id } }),
      ]);

      if (accounts + categories + transactions + budgets > 0) {
        throw new Error("SAMPLE_DATA_REQUIRES_EMPTY_WORKSPACE");
      }

      const checking = await tx.account.create({
        data: {
          currentBalanceCents: 346655,
          institution: "Maple Community Bank",
          name: "Everyday Chequing",
          startingBalanceCents: 0,
          type: "CHECKING",
          userId: user.id,
        },
      });
      const creditCard = await tx.account.create({
        data: {
          currentBalanceCents: -6840,
          institution: "Northern Card Co.",
          name: "Rewards Credit Card",
          startingBalanceCents: 0,
          type: "CREDIT_CARD",
          userId: user.id,
        },
      });
      const categoryData = [
        {
          color: "#67C56E",
          icon: "wallet",
          name: "Salary",
          type: "INCOME" as const,
        },
        {
          color: "#1F2B3D",
          icon: "home",
          name: "Housing",
          type: "EXPENSE" as const,
        },
        {
          color: "#F5C24B",
          icon: "basket",
          name: "Groceries",
          type: "EXPENSE" as const,
        },
        {
          color: "#667085",
          icon: "car",
          name: "Transport",
          type: "EXPENSE" as const,
        },
        {
          color: "#EF4444",
          icon: "utensils",
          name: "Dining",
          type: "EXPENSE" as const,
        },
      ];
      const createdCategories = await Promise.all(
        categoryData.map((category) =>
          tx.category.create({ data: { ...category, userId: user.id } }),
        ),
      );
      const [salary, housing, groceries, transport, dining] = createdCategories;

      await tx.transaction.createMany({
        data: [
          {
            accountId: checking.id,
            amountCents: 520000,
            categoryId: salary.id,
            date: currentMonthDate(1),
            description: "Monthly pay",
            merchant: "Acme Studio",
            type: "INCOME",
            userId: user.id,
          },
          {
            accountId: checking.id,
            amountCents: -145000,
            categoryId: housing.id,
            date: currentMonthDate(2),
            description: "Monthly rent",
            merchant: "Harbour Property Management",
            type: "EXPENSE",
            userId: user.id,
          },
          {
            accountId: checking.id,
            amountCents: -18745,
            categoryId: groceries.id,
            date: currentMonthDate(5),
            description: "Weekly groceries",
            merchant: "Maple Market",
            type: "EXPENSE",
            userId: user.id,
          },
          {
            accountId: checking.id,
            amountCents: -9600,
            categoryId: transport.id,
            date: currentMonthDate(8),
            description: "Transit pass",
            merchant: "City Transit",
            type: "EXPENSE",
            userId: user.id,
          },
          {
            accountId: creditCard.id,
            amountCents: -6840,
            categoryId: dining.id,
            date: currentMonthDate(12),
            description: "Dinner with friends",
            merchant: "Juniper Kitchen",
            type: "EXPENSE",
            userId: user.id,
          },
        ],
      });

      const now = new Date();
      await tx.budget.createMany({
        data: [
          {
            categoryId: housing.id,
            limitAmountCents: 160000,
            month: now.getUTCMonth() + 1,
            userId: user.id,
            year: now.getUTCFullYear(),
          },
          {
            categoryId: groceries.id,
            limitAmountCents: 60000,
            month: now.getUTCMonth() + 1,
            userId: user.id,
            year: now.getUTCFullYear(),
          },
          {
            categoryId: transport.id,
            limitAmountCents: 25000,
            month: now.getUTCMonth() + 1,
            userId: user.id,
            year: now.getUTCFullYear(),
          },
          {
            categoryId: dining.id,
            limitAmountCents: 30000,
            month: now.getUTCMonth() + 1,
            userId: user.id,
            year: now.getUTCFullYear(),
          },
        ],
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SAMPLE_DATA_REQUIRES_EMPTY_WORKSPACE"
    ) {
      return {
        message: "Sample data can only be added to an empty workspace.",
      };
    }
    reportServerError("onboarding.sample_data.failed", error);
    return {
      message: "We could not add the sample data right now. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
