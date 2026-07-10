import Link from "next/link";

export function BrandMark() {
  return (
    <Link className="inline-flex items-center gap-3" href="/">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-bold tracking-[0.2em] text-canvas">
        BB
      </span>
      <span className="flex flex-col">
        <span className="hidden sm:block section-title text-2xl leading-none text-ink">
          Budget Buddy
        </span>
        <span className="hidden sm:block eyebrow mt-1 text-[10px] font-semibold text-muted">
          Personal finance dashboard
        </span>
      </span>
    </Link>
  );
}
