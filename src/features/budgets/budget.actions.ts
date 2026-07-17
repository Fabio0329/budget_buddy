"use server";

import { revalidatePath } from "next/cache";
import type { BudgetFormState } from "@/features/budgets/budget-form-state";
import { validateBudgetForm } from "@/features/budgets/budget.validation";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { reportServerError } from "@/server/observability/logger";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function refreshBudgetConsumers() {
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  revalidatePath("/categories");
}

export async function saveBudget(
  _: BudgetFormState,
  formData: FormData,
): Promise<BudgetFormState> {
  const result = validateBudgetForm(formData);

  if (!result.data) {
    return {
      errors: result.errors,
      message: "Fix the highlighted budget fields and try again.",
      status: "error",
    };
  }

  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "").trim();

  try {
    const category = await db.category.findFirst({
      select: { id: true, type: true },
      where: { id: result.data.categoryId, userId: user.id },
    });

    if (!category) {
      return { message: "Selected category is unavailable.", status: "error" };
    }
    if (category.type !== "EXPENSE") {
      return {
        errors: { categoryId: "Budgets can only use expense categories." },
        message: "Choose an expense category.",
        status: "error",
      };
    }

    if (id) {
      const updated = await db.budget.updateMany({
        data: result.data,
        where: { id, userId: user.id },
      });

      if (updated.count === 0) {
        return { message: "That budget no longer exists.", status: "error" };
      }
    } else {
      const budget = await db.budget.create({
        data: { ...result.data, userId: user.id },
        select: { id: true },
      });
      refreshBudgetConsumers();
      return {
        entityId: budget.id,
        message: "Budget created.",
        month: result.monthKey,
        status: "success",
      };
    }

    refreshBudgetConsumers();
    return {
      entityId: id,
      message: "Budget updated.",
      month: result.monthKey,
      status: "success",
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        message:
          "A budget already exists for this category and month. Edit the existing budget instead.",
        status: "error",
      };
    }

    reportServerError("budget.save.failed", error);
    return {
      message: "We could not save this budget right now. Please try again.",
      status: "error",
    };
  }
}

export async function deleteBudget(id: string): Promise<BudgetFormState> {
  const user = await requireCurrentUser();

  try {
    const deleted = await db.budget.deleteMany({ where: { id, userId: user.id } });

    if (deleted.count === 0) {
      return { message: "That budget no longer exists.", status: "error" };
    }

    refreshBudgetConsumers();
    return { entityId: id, message: "Budget removed.", status: "success" };
  } catch (error) {
    reportServerError("budget.delete.failed", error);
    return {
      message: "We could not remove this budget right now. Please try again.",
      status: "error",
    };
  }
}
