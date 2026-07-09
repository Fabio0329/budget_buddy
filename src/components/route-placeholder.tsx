import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}>) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <SectionCard className="p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-[24px] border border-line bg-white/65 p-4 text-sm leading-6 text-muted"
            >
              {bullet}
            </div>
          ))}
        </div>
      </SectionCard>
      <EmptyState
        title="Behavior intentionally deferred"
        description="This placeholder confirms the route, spacing, and shared component system. The dedicated feature phase will replace it with real interactions."
      />
    </div>
  );
}
