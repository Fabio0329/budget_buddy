"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface DemoMutationNoticeProps {
  readonly action: string | null;
  readonly onClose: () => void;
}

export function DemoMutationNotice({
  action,
  onClose,
}: DemoMutationNoticeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (action && dialog && !dialog.open) dialog.showModal();
    if (!action && dialog?.open) dialog.close();
  }, [action]);

  return (
    <dialog
      aria-labelledby="demo-mutation-title"
      className="m-auto w-[min(92vw,520px)] rounded-xl border border-line bg-surface p-0 text-ink shadow-sm backdrop:bg-primary/35"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-strong">
          Tour mode
        </span>
        <h2 className="section-title mt-4 text-3xl" id="demo-mutation-title">
          Editing is available after signup
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {action ? `${action} isn’t available in this read-only tour. ` : ""}
          Create an account to try adding, editing, and deleting your own data.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            autoFocus
            className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold transition hover:border-line-strong"
            onClick={onClose}
            type="button"
          >
            Continue tour
          </button>
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
            href="/signup"
          >
            Create account
          </Link>
        </div>
      </div>
    </dialog>
  );
}
