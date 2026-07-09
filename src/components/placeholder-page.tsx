import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} showMeta={false} />
      <EmptyState
        icon={Icon}
        title={`${title} coming soon`}
        description="This module is part of your MediMind workspace. Content and workflows will appear here."
      />
    </div>
  );
}
