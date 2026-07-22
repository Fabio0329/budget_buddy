"use client";

export function DashboardMonthSwitcher({
  activeMonth,
  months,
}: Readonly<{
  activeMonth: string;
  months: Array<{ label: string; value: string }>;
}>) {
  return (
    <form className="w-fit self-end">
      <label className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted">
        <span className="font-semibold text-ink">Month</span>
        <select
          className="bg-transparent font-semibold text-ink outline-none"
          defaultValue={activeMonth}
          name="month"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
