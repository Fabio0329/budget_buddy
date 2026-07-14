import type { ReactNode } from "react";
import { SectionCard } from "@/shared/components/section-card";

export function DashboardStatCard({
  label,
  value,
  tone,
  detail,
  accent,
}: Readonly<{
  label: string;
  value: string;
  tone: string;
  detail: string;
  accent?: ReactNode;
}>) {
  return (
    <SectionCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {accent}
      </div>
      <p className={`mt-5 text-3xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
    </SectionCard>
  );
}
