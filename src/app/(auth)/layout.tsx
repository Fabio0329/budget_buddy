import type { ReactNode } from "react";
import { BrandMark } from "@/shared/components/brand-mark";

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
          <p className="eyebrow text-xs font-semibold text-primary-strong">
            Secure account access
          </p>
          <h1 className="section-title text-4xl leading-tight text-ink sm:text-5xl">
            Sign in and move directly into the protected dashboard shell.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            Create a persisted account, sign in with a securely hashed password,
            and use a revocable database-backed session.
          </p>
          <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface p-4">
              Use the email you registered with.
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              Password must contain letters and numbers.
            </div>
          </div>
        </section>
        {children}
      </div>
    </main>
  );
}
