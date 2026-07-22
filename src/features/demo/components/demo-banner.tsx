import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary-light px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="status-dot shrink-0 bg-primary" />
        <p>
          <span className="font-semibold text-ink">
            Read-only product tour.
          </span>{" "}
          <span className="text-muted">
            Fictional data resets whenever this page reloads.
          </span>
        </p>
      </div>
      <Link
        className="shrink-0 font-semibold text-primary-strong hover:underline"
        href="/signup"
      >
        Create an account
      </Link>
    </div>
  );
}
