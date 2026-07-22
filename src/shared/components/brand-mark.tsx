import Image from "next/image";
import Link from "next/link";

export function BrandMark() {
  return (
    <Link aria-label="Budget Buddy home" className="inline-flex" href="/">
      <Image
        alt="Budget Buddy"
        className="h-auto w-[132px] sm:w-[158px]"
        height={470}
        loading="eager"
        sizes="(max-width: 639px) 132px, 158px"
        src="/budget-buddy-logo.png"
        width={1053}
      />
    </Link>
  );
}
