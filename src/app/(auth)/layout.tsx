import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <div className="mb-10">
        <BrandMark />
      </div>
      <div className="grid flex-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-5">
          <p className="eyebrow text-xs font-semibold text-accent">
            Phase 1 foundation
          </p>
          <h1 className="section-title text-4xl leading-tight text-ink sm:text-5xl">
            Auth routes are wired and ready for form logic in the next phase.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            This commit establishes the route groups, visual system, and shared
            card layout so login and signup can be implemented without changing
            the surrounding shell.
          </p>
        </section>
        {children}
      </div>
    </main>
  );
}
