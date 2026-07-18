"use server";

import { revalidatePath } from "next/cache";
import type { AccountFormState } from "@/features/accounts/account-form-state";
import { validateAccountForm } from "@/features/accounts/account.validation";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { reportServerError } from "@/server/observability/logger";

function refreshAccountConsumers() {
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/transactions/new");
}

export async function saveAccount(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const result = validateAccountForm(formData);

  if (!result.data) {
    return {
      errors: result.errors,
      message: "Fix the highlighted account fields and try again.",
      status: "error",
    };
  }

  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "").trim();

  try {
    if (id) {
      const updated = await db.account.updateMany({
        data: result.data,
        where: { id, userId: user.id },
      });

      if (updated.count === 0) {
        return { message: "That account no longer exists.", status: "error" };
      }

      refreshAccountConsumers();
      return { entityId: id, message: "Account updated.", status: "success" };
    }

    const account = await db.account.create({
      data: { ...result.data, userId: user.id },
      select: { id: true },
    });

    refreshAccountConsumers();
    return {
      entityId: account.id,
      message: "Account created.",
      status: "success",
    };
  } catch (error) {
    reportServerError("account.save.failed", error);
    return {
      message: "We could not save this account right now. Please try again.",
      status: "error",
    };
  }
}

export async function deleteAccount(id: string): Promise<AccountFormState> {
  const user = await requireCurrentUser();

  try {
    const account = await db.account.findFirst({
      select: { _count: { select: { transactions: true } } },
      where: { id, userId: user.id },
    });

    if (!account) {
      return { message: "That account no longer exists.", status: "error" };
    }

    if (account._count.transactions > 0) {
      return {
        message:
          "This account is linked to transactions. Reassign or remove them before deleting it.",
        status: "error",
      };
    }

    await db.account.deleteMany({ where: { id, userId: user.id } });
    refreshAccountConsumers();
    return { entityId: id, message: "Account removed.", status: "success" };
  } catch (error) {
    reportServerError("account.delete.failed", error);
    return {
      message: "We could not remove this account right now. Please try again.",
      status: "error",
    };
  }
}
