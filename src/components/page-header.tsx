import { Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  showMeta?: boolean;
  exportLabel?: string;
};

function formatNow() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `Today • ${time}`;
}

export function PageHeader({
  title,
  subtitle,
  action,
  showMeta = true,
  exportLabel = "Export",
}: PageHeaderProps) {
  return (
    <div className="mb-2 border-b border-border/60 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-tight text-foreground">{title}</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
          {showMeta && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground shadow-card">
              <Clock className="h-[18px] w-[18px] text-primary/70" strokeWidth={2} />
              <span>Last updated</span>
              <span className="font-medium text-foreground">{formatNow()}</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          {action ?? (
            <Button variant="outline" className="h-10 rounded-xl px-4 text-[14px] font-medium shadow-none">
              <Download className="mr-2 h-[18px] w-[18px]" strokeWidth={2} />
              {exportLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
