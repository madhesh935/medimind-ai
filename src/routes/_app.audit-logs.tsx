import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, Download, ScrollText, RefreshCcw,
  ShieldAlert, Info, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getAuditLogs, type AuditLogEntry, MOCK_AUDIT_LOGS } from "@/lib/api";
import { severityBadgeClass, type Severity } from "@/lib/status-colors";

export const Route = createFileRoute("/_app/audit-logs")({ component: AuditLogsPage });

const SEV_META: Record<Severity, { label: string; icon: typeof Info }> = {
  info: { label: "Info", icon: Info },
  success: { label: "Success", icon: CheckCircle2 },
  warning: { label: "Warning", icon: AlertTriangle },
  danger: { label: "Critical", icon: ShieldAlert },
};

function toCsv(rows: AuditLogEntry[]): string {
  const header = "Actor,Role,Action,Target,Severity,Time\n";
  const body = rows.map((l) => `"${l.actor_name}","${l.role}","${l.action}","${l.target ?? ""}","${l.severity}","${new Date(l.created_at).toLocaleString()}"`).join("\n");
  return header + body;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [loaded, setLoaded] = useState(true);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState<"All" | Severity>("All");

  const load = () => getAuditLogs().then(setLogs).catch(() => setLogs([])).finally(() => setLoaded(true));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = l.actor_name.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || (l.target ?? "").toLowerCase().includes(q);
    const matchSev = sevFilter === "All" || l.severity === sevFilter;
    return matchSearch && matchSev;
  }), [logs, search, sevFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all platform actions, alerts and system events.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { load(); toast.success("Logs refreshed."); }} variant="outline" className="rounded-xl gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <Button onClick={() => downloadCsv(toCsv(filtered), "audit-logs.csv")} className="rounded-xl gap-2 bg-slate-700 hover:bg-slate-800 text-white shadow-md">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["info", "success", "warning", "danger"] as Severity[]).map((sev) => {
          const meta = SEV_META[sev];
          const count = logs.filter((l) => l.severity === sev).length;
          return (
            <div key={sev} className="rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSevFilter(sev)}>
              <div className={`p-2.5 rounded-xl ${severityBadgeClass(sev)}`}><meta.icon className="w-5 h-5" /></div>
              <div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action or target..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border/60 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/20 bg-background" />
        </div>
        {(["All", "info", "success", "warning", "danger"] as const).map((f) => (
          <button key={f} onClick={() => setSevFilter(f)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${sevFilter === f ? "bg-slate-700 text-white border-slate-700" : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"}`}>
            {f === "All" ? "All" : SEV_META[f].label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="divide-y divide-border/30">
          {loaded && filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No audit log entries yet.</div>
          )}
          {filtered.map((log) => {
            const meta = SEV_META[log.severity];
            return (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
                <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${severityBadgeClass(log.severity)}`}>
                  <meta.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-semibold text-sm">{log.actor_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({log.role})</span>
                      {log.ip_address && <span className="text-xs text-muted-foreground ml-2">· IP: {log.ip_address}</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-[9px] border font-semibold ${severityBadgeClass(log.severity)}`}>{meta.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-foreground">{log.action}</div>
                  {log.target && (
                    <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                      <ScrollText className="w-3 h-3" /> Target: {log.target}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-border/40 text-xs text-muted-foreground">
          Showing {filtered.length} of {logs.length} log entries
        </div>
      </div>
    </div>
  );
}
