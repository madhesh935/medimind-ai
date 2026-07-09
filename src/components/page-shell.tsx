import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent page rhythm — max width, generous vertical spacing */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] space-y-8", className)}>
      {children}
    </div>
  );
}

export function Section({ title, subtitle, children, className }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
