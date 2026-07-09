import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "success" | "accent" | "warning" | "danger";
  className?: string;
}) {
  const iconTone = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <div
      className={cn(
        "flex min-h-[108px] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconTone)}>
          <Icon className="h-[20px] w-[20px]" strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="text-[28px] font-bold leading-none tracking-tight tabular-nums">{value}</div>
        {hint && <div className="mt-1.5 text-[12px] text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}
