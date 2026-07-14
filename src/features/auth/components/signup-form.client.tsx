"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/features/auth/auth.actions";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { SubmitButton } from "@/features/auth/components/submit-button.client";
import { authActionInitialState } from "@/features/auth/auth-form-state";

export function SignupForm({
  redirectTo,
}: Readonly<{
  redirectTo: string;
}>) {
  const [state, action] = useActionState(signup, authActionInitialState);

  return (
    <AuthCard
      description="Create your profile and enter your private Budget Buddy workspace. Passwords are salted and securely hashed before storage."
      eyebrow="Sign Up"
      footer={
        <p className="text-sm text-muted">
          Already set up?{" "}
          <Link className="font-semibold text-accent" href="/login">
            Log in instead
          </Link>
          .
        </p>
      }
      title="Create a Budget Buddy workspace."
    >
      <form action={action} className="space-y-5">
        <input name="redirectTo" type="hidden" value={redirectTo} />
        <AuthFormField
          autoComplete="name"
          defaultValue={state.values?.name}
          error={state.errors?.name}
          label="Name"
          name="name"
          placeholder="Alex Morgan"
        />
        <AuthFormField
          autoComplete="email"
          defaultValue={state.values?.email}
          error={state.errors?.email}
          label="Email"
          name="email"
          placeholder="alex@example.com"
          type="email"
        />
        <AuthFormField
          autoComplete="new-password"
          error={state.errors?.password}
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          type="password"
        />
        {state.message ? (
          <p className="rounded-[20px] border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
            {state.message}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">Your financial data stays scoped to your account.</p>
          <SubmitButton label="Create account" pendingLabel="Creating..." />
        </div>
      </form>
    </AuthCard>
  );
}
