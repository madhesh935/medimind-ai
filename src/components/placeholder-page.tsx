import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Card className="glass grid min-h-[360px] place-items-center rounded-2xl border-border/60 p-10 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-ai shadow-glow">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="font-display text-xl font-semibold">{title}</div>
          <div className="mx-auto max-w-md text-sm text-muted-foreground">
            This module is part of your MediMind workspace. Content and workflows for
            <span className="mx-1 font-semibold text-foreground">{title}</span>
            will appear here.
          </div>
        </div>
      </Card>
    </div>
  );
}
