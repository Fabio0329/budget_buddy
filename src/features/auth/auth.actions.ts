"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createMockSessionCookieValue,
  deriveDisplayNameFromEmail,
  normalizeRedirectTarget,
} from "@/server/auth/session";
import { MOCK_SESSION_COOKIE } from "@/server/auth/constants";
import type { AuthActionState } from "@/features/auth/auth-form-state";

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

async function setSessionCookie(name: string, email: string) {
  const store = await cookies();
  store.set(MOCK_SESSION_COOKIE, createMockSessionCookieValue({ name, email }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function login(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = normalizeRedirectTarget(formData.get("redirectTo"));

  const errors: NonNullable<AuthActionState["errors"]> = {};

  if (!validateEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: "Fix the highlighted fields and try again.",
      values: {
        email,
      },
    };
  }

  await setSessionCookie(deriveDisplayNameFromEmail(email), email);
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

  if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!validateEmail(email)) {
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
      values: {
        email,
        name,
      },
    };
  }

  await setSessionCookie(name, email);
  redirect(redirectTo);
}

export async function logout() {
  const store = await cookies();
  store.delete(MOCK_SESSION_COOKIE);
  redirect("/login");
}
