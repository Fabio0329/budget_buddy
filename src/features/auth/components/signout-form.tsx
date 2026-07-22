import { logout } from "@/features/auth/auth.actions";

export function SignoutForm({
  compact = false,
}: Readonly<{
  compact?: boolean;
}>) {
  return (
    <form action={logout}>
      <button
        className={
          compact
            ? "rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface"
            : "w-full rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface"
        }
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
