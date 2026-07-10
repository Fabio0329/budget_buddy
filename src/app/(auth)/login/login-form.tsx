"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { AuthFormField } from "@/components/auth-form-field";
import { SubmitButton } from "@/components/submit-button";
import { authActionInitialState } from "@/lib/auth-form-state";

export function LoginForm({
  redirectTo,
}: Readonly<{
  redirectTo: string;
}>) {
  const [state, action] = useActionState(login, authActionInitialState);

  return (
    <AuthCard
      description="Use any valid email and a password with at least eight characters, one letter, and one number. This phase uses a cookie-backed mock session."
      eyebrow="Log In"
      footer={
        <p className="text-sm text-muted">
          Need an account?{" "}
          <Link className="font-semibold text-accent" href="/signup">
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
          <p className="rounded-[20px] border border-negative/20 bg-negative-soft px-4 py-3 text-sm text-negative">
            {state.message}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">Mock auth only for this phase.</p>
          <SubmitButton label="Log in" pendingLabel="Signing in..." />
        </div>
      </form>
    </AuthCard>
  );
}
