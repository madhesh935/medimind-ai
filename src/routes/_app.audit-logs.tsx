import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Search, Download } from "lucide-react";
import { auditLogs } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/audit-logs")({ component: AuditLogs });

const severityColor: Record<string, string> = {
  info: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

function AuditLogs() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Audit logs</h1>
          <p className="text-sm text-muted-foreground">Every change and event on the platform, in real time.</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary shadow-glow"><Download className="mr-2 h-4 w-4" />Export logs</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search logs…" className="h-9 rounded-xl pl-9" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...auditLogs, ...auditLogs].map((l, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${severityColor[l.severity]}`}><ScrollText className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{l.actor} <span className="font-normal text-muted-foreground">— {l.action}</span></div>
                <div className="text-xs text-muted-foreground truncate">Target: {l.target}</div>
              </div>
              <Badge className={`rounded-full ${severityColor[l.severity]}`}>{l.severity}</Badge>
              <span className="text-xs text-muted-foreground">{l.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
