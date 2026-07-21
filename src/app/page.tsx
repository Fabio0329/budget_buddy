import Link from "next/link";
import { BrandMark } from "@/shared/components/brand-mark";
import { SectionCard } from "@/shared/components/section-card";

const demoSnapshot = {
  expenses: "$5,965",
  income: "$8,420",
  name: "Sample monthly plan",
  netCashFlow: "+$2,455",
  remainingBudget: "$1,135",
};

const highlights = [
  "Monthly spending pulse",
  "Category-aware budget tracking",
  "Review-ready transaction workflows",
];

const featureColumns = [
  {
    title: "Clarity first",
    body: "See income, spending, and budget pressure in one deliberately paced dashboard instead of hunting across tabs.",
  },
  {
    title: "Built for review",
    body: "Every route is organized around monthly check-ins: accounts, categories, transactions, budgets, and imports.",
  },
  {
    title: "Portfolio-grade flow",
    body: "This frontend is being built in reviewable phases, with protected routing and typed UI contracts from the start.",
  },
];

export default function MarketingHomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <header className="mb-12 flex items-center justify-between">
        <BrandMark />
        <nav className="flex items-center gap-3 text-sm text-muted">
          <Link
            className="rounded-full border border-line bg-white/50 px-4 py-2 transition hover:border-line-strong hover:bg-white"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="rounded-full bg-ink px-4 py-2 text-canvas transition hover:opacity-90"
            href="/signup"
          >
            Start budgeting
          </Link>
        </nav>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="animate-rise-in space-y-6">
          <p className="eyebrow text-xs font-semibold text-accent">
            Personal finance, without spreadsheet drag
          </p>
          <div className="space-y-4">
            <h1 className="section-title max-w-3xl text-5xl leading-none text-ink sm:text-6xl">
              Budget Buddy turns monthly money movement into a daily signal.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              Track accounts, categorize spending, and stay ahead of budgets in
              one calm dashboard built for deliberate financial reviews.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
              href="/demo"
            >
              Explore demo
            </Link>
            <Link
              className="rounded-full border border-line bg-white/50 px-5 py-3 text-sm font-semibold transition hover:border-line-strong hover:bg-white"
              href="/signup"
            >
              Create your account
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-line bg-white/50 px-3 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <SectionCard className="animate-rise-in overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <p className="eyebrow text-[11px] font-semibold text-muted">
                Snapshot
              </p>
              <h2 className="section-title mt-1 text-3xl text-ink">
                {demoSnapshot.name}
              </h2>
            </div>
            <div className="rounded-full bg-positive-soft px-3 py-1 text-xs font-semibold text-positive">
              Current month
            </div>
          </div>
          <div className="card-grid px-6 py-6">
            <div className="rounded-3xl bg-white/70 p-4">
              <p className="text-sm text-muted">Income</p>
              <p className="mt-2 text-2xl font-semibold text-positive">
                {demoSnapshot.income}
              </p>
            </div>
            <div className="rounded-3xl bg-white/70 p-4">
              <p className="text-sm text-muted">Expenses</p>
              <p className="mt-2 text-2xl font-semibold text-negative">
                {demoSnapshot.expenses}
              </p>
            </div>
            <div className="rounded-3xl bg-white/70 p-4">
              <p className="text-sm text-muted">Net cash flow</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {demoSnapshot.netCashFlow}
              </p>
            </div>
            <div className="rounded-3xl bg-white/70 p-4">
              <p className="text-sm text-muted">Remaining budget</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {demoSnapshot.remainingBudget}
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {featureColumns.map((feature) => (
          <SectionCard key={feature.title} className="p-6">
            <p className="section-title text-2xl text-ink">{feature.title}</p>
            <p className="mt-3 text-sm leading-7 text-muted">{feature.body}</p>
          </SectionCard>
        ))}
      </section>

      <section className="mt-16">
        <SectionCard className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow text-xs font-semibold text-accent">
              Current phase
            </p>
            <h2 className="section-title text-4xl text-ink">
              The MVP backend is fully connected.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Authentication, accounts, categories, transactions, imports,
              budgets, and monthly dashboard aggregations now run on persisted,
              user-scoped data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
              href="/demo"
            >
              Explore the populated demo
            </Link>
            <Link
              className="rounded-full border border-line bg-white/60 px-5 py-3 text-sm font-semibold transition hover:border-line-strong hover:bg-white"
              href="/login"
            >
              Go to login
            </Link>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
