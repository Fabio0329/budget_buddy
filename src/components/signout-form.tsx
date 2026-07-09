import { logout } from "@/app/actions/auth";

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
            ? "rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
            : "w-full rounded-[22px] border border-line bg-white/70 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-white"
        }
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
