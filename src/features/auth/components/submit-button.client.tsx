"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  label,
  pendingLabel,
}: Readonly<{
  label: string;
  pendingLabel: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
