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
  value: React.ReactNode;
  hint?: string;
  tone?: "primary" | "success" | "accent" | "warning" | "danger";
  className?: string;
}) {
  const toneMap = {
    primary: "from-primary/15 to-primary/0 text-primary",
    success: "from-success/15 to-success/0 text-success",
    accent: "from-accent/15 to-accent/0 text-accent",
    warning: "from-warning/30 to-warning/5 text-warning border-l-4 border-l-warning",
    danger: "from-destructive/30 to-destructive/5 text-destructive border-l-4 border-l-destructive",
  }[tone];

  const borderClass = tone === "danger" 
    ? "border-l-4 border-l-destructive" 
    : tone === "warning" 
    ? "border-l-4 border-l-warning" 
    : "";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        borderClass,
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", toneMap)} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-background/90 backdrop-blur shadow-sm",
              tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : toneMap.split(" ").pop(),
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-display text-3xl font-bold">{value}</div>
        {hint && <div className="mt-1 text-xs font-medium text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}
