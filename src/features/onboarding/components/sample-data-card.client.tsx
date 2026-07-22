"use client";

import { useActionState } from "react";
import { loadSampleData } from "@/features/onboarding/sample-data.actions";

export function SampleDataCard() {
  const [state, action, pending] = useActionState(loadSampleData, {});

  return (
    <section className="surface-panel rounded-xl border border-line bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-strong">
        Explore the app
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-ink">
        Start with a fictional budget
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Add clearly fictional Canadian accounts, categories, transactions, and
        monthly budgets so you can review the complete workflow. Nothing is
        imported or shared.
      </p>
      <form action={action} className="mt-5 flex flex-wrap items-center gap-4">
        <button
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Adding sample data..." : "Add fictional sample data"}
        </button>
        {state.message ? (
          <p className="text-sm text-negative">{state.message}</p>
        ) : null}
      </form>
    </section>
  );
}
