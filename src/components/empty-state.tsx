import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card px-10 py-20 text-center shadow-card", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5">
        <Icon className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
      </div>
      <h3 className="mt-6 text-[20px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} className="mt-8 h-11 rounded-xl px-6 text-[15px] font-medium shadow-none">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
