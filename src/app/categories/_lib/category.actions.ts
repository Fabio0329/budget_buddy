"use server";

import { revalidatePath } from "next/cache";
import type { CategoryFormState } from "@/app/categories/_lib/category-form-state";
import { validateCategoryForm } from "@/app/categories/_lib/category.validation";
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

function refreshCategoryConsumers() {
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  revalidatePath("/transactions/new");
}

export async function saveCategory(
  _: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const result = validateCategoryForm(formData);

  if (!result.data) {
    return {
      errors: result.errors,
      message: "Fix the highlighted category fields and try again.",
      status: "error",
    };
  }

  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "").trim();

  try {
    if (id) {
      const existing = await db.category.findFirst({
        select: {
          _count: { select: { budgets: true, transactions: true } },
          type: true,
        },
        where: { id, userId: user.id },
      });

      if (!existing) {
        return { message: "That category no longer exists.", status: "error" };
      }

      if (
        existing.type !== result.data.type &&
        (existing._count.transactions > 0 || existing._count.budgets > 0)
      ) {
        return {
          errors: {
            type:
              "A linked category cannot change type. Remove its transactions and budgets first.",
          },
          message: "Keep the current category type or remove its linked records.",
          status: "error",
        };
      }

      await db.category.updateMany({
        data: result.data,
        where: { id, userId: user.id },
      });
      refreshCategoryConsumers();
      return { entityId: id, message: "Category updated.", status: "success" };
    }

    const category = await db.category.create({
      data: { ...result.data, userId: user.id },
      select: { id: true },
    });
    refreshCategoryConsumers();
    return {
      entityId: category.id,
      message: "Category created.",
      status: "success",
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        errors: { name: "You already have a category with this name." },
        message: "Use a different category name.",
        status: "error",
      };
    }

    reportServerError("category.save.failed", error);
    return {
      message: "We could not save this category right now. Please try again.",
      status: "error",
    };
  }
}

export async function deleteCategory(id: string): Promise<CategoryFormState> {
  const user = await requireCurrentUser();

  try {
    const category = await db.category.findFirst({
      select: { _count: { select: { budgets: true, transactions: true } } },
      where: { id, userId: user.id },
    });

    if (!category) {
      return { message: "That category no longer exists.", status: "error" };
    }

    if (category._count.transactions > 0 || category._count.budgets > 0) {
      return {
        message:
          "This category is linked to transactions or budgets. Remove those links before deleting it.",
        status: "error",
      };
    }

    await db.category.deleteMany({ where: { id, userId: user.id } });
    refreshCategoryConsumers();
    return { entityId: id, message: "Category removed.", status: "success" };
  } catch (error) {
    reportServerError("category.delete.failed", error);
    return {
      message: "We could not remove this category right now. Please try again.",
      status: "error",
    };
  }
}
