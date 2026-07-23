"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/shared/auth/auth.actions";
import { AuthCard } from "@/shared/components/auth/auth-card";
import { AuthFormField } from "@/shared/components/auth/auth-form-field";
import { SubmitButton } from "@/shared/components/auth/submit-button.client";
import { authActionInitialState } from "@/shared/auth/auth-form-state";

export function LoginForm({
  redirectTo,
}: Readonly<{
  redirectTo: string;
}>) {
  const [state, action] = useActionState(login, authActionInitialState);

  return (
    <AuthCard
      description="Enter the email and password for your Budget Buddy account. Your session stays signed in securely for up to two weeks."
      eyebrow="Log In"
      footer={
        <p className="text-sm text-muted">
          Need an account?{" "}
          <Link className="font-semibold text-primary-strong" href="/signup">
            Create one here
          </Link>
          .
        </p>
      }
      title="Get back to your budget review."
    >
      <form action={action} className="space-y-5">
        <input name="redirectTo" type="hidden" value={redirectTo} />
        <AuthFormField
          autoComplete="email"
          defaultValue={state.values?.email}
          error={state.errors?.email}
          label="Email"
          name="email"
          placeholder="you@example.com"
          type="email"
        />
        <AuthFormField
          autoComplete="current-password"
          error={state.errors?.password}
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          type="password"
        />
        {state.message ? (
          <p className="rounded-xl border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
            {state.message}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Your password is verified securely.
          </p>
          <SubmitButton label="Log in" pendingLabel="Signing in..." />
        </div>
      </form>
    </AuthCard>
  );
}
