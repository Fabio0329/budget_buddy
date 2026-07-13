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
      className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
