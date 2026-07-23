"use server";

import { redirect } from "next/navigation";
import type { AuthActionState } from "@/shared/auth/auth-form-state";
import {
  createSession,
  deleteSession,
  normalizeRedirectTarget,
} from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  AuthRateLimitExceededError,
  enforceLoginRateLimit,
  enforceSignupRateLimit,
} from "@/server/auth/rate-limit";
import { db } from "@/server/db/client";
import { reportServerError } from "@/server/observability/logger";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string) {
  return emailPattern.test(email);
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  return null;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function login(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = normalizeRedirectTarget(formData.get("redirectTo"));

  const errors: NonNullable<AuthActionState["errors"]> = {};

  try {
    await enforceLoginRateLimit(email);
  } catch (error) {
    if (error instanceof AuthRateLimitExceededError) {
      return { message: "Too many login attempts. Try again in a few minutes.", values: { email } };
    }
    reportServerError("auth.login.rate_limit_failed", error);
    return { message: "We could not log you in right now. Please try again.", values: { email } };
  }

  if (!validateEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: "Fix the highlighted fields and try again.",
      values: { email },
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    const passwordMatches = await verifyPassword(password, user?.passwordHash);

    if (!user || !passwordMatches) {
      return {
        message: "Email or password is incorrect.",
        values: { email },
      };
    }

    await createSession(user.id);
  } catch (error) {
    reportServerError("auth.login.failed", error);
    return {
      message: "We could not log you in right now. Please try again.",
      values: { email },
    };
  }

  redirect(redirectTo);
}

export async function signup(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = normalizeRedirectTarget(formData.get("redirectTo"));

  const errors: NonNullable<AuthActionState["errors"]> = {};

  try {
    await enforceSignupRateLimit(email);
  } catch (error) {
    if (error instanceof AuthRateLimitExceededError) {
      return { message: "Too many signup attempts. Try again later.", values: { email, name } };
    }
    reportServerError("auth.signup.rate_limit_failed", error);
    return { message: "We could not create your account right now. Please try again.", values: { email, name } };
  }

  if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  if (!validateEmail(email) || email.length > 320) {
    errors.email = "Enter a valid email address.";
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: "Complete the missing fields to create your account.",
      values: { email, name },
    };
  }

  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
      select: { id: true },
    });

    await createSession(user.id);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        errors: { email: "An account with this email already exists." },
        message: "Log in instead, or use another email address.",
        values: { email, name },
      };
    }

    reportServerError("auth.signup.failed", error);
    return {
      message: "We could not create your account right now. Please try again.",
      values: { email, name },
    };
  }

  redirect(redirectTo);
}

export async function logout() {
  try {
    await deleteSession();
  } catch (error) {
    reportServerError("auth.logout.failed", error);
  }

  redirect("/login");
}
