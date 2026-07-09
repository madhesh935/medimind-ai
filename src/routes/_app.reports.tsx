import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Download, FileText, Printer, Sheet, Calendar as CalendarIcon, Activity, Share2,
  Flame, HeartPulse, Brain, AlertTriangle, Users, ShieldAlert, HardDrive, ServerCog, CheckCircle2, Gauge,
  Mail, Link as LinkIcon, Check, Copy, Sparkles,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart } from "recharts";
import { toast } from "sonner";
import { useRole } from "@/lib/role-store";
import { chartColors } from "@/lib/chart-colors";
import {
  getDashboard, getMedicines, getMedicationLogsRange, getAIPrediction, getStoredUser,
  getPatientsList, getDoctorsList, getAdminUsers, getAdminDevices,
  type Medicine, type PatientSummary, type DoctorSummary,
} from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/reports")({ component: Reports });

function Reports() {
  const role = useRole();
  if (role === "doctor") return <DoctorReports />;
  if (role === "admin") return <AdminReports />;
  return <PatientReports />;
}

function exportToCsv(filename: string, rows: any[]) {
  if (!rows || !rows.length) {
    toast.error("No data to export");
    return;
  }
  const headers = Object.keys(rows[0]).join(",");
  const csvContent = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported ${filename}.csv`);
}

function exportToExcel(filename: string, rows: any[]) {
  if (!rows || !rows.length) {
    toast.error("No data to export");
    return;
  }
  const keys = Object.keys(rows[0]);
  
  // Create a clean XML Spreadsheet 2003 template
  let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
  xml += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
  xml += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
  xml += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
  xml += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
  xml += '<Worksheet ss:Name="Report"><Table>';
  
  // Headers Row
  xml += '<Row ss:Height="22">';
  keys.forEach(k => {
    xml += `<Cell><Data ss:Type="String">${k}</Data></Cell>`;
  });
  xml += '</Row>';
  
  // Data Rows
  rows.forEach(r => {
    xml += '<Row>';
    keys.forEach(k => {
      const val = r[k] ?? "";
      const type = typeof val === 'number' ? 'Number' : 'String';
      xml += `<Cell><Data ss:Type="${type}">${val}</Data></Cell>`;
    });
    xml += '</Row>';
  });
  
  xml += '</Table></Worksheet></Workbook>';
  
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported ${filename}.xls`);
}

// ─────────────────────────── Share Dialog ────────────────────────────
function ShareReportDialog({
  isOpen,
  onClose,
  defaultEmail = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const shareUrl = `${window.location.origin}/shared-report/${Math.random().toString(36).substring(2, 10)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success(`Report securely shared with ${email}`);
      setSending(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-white bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Share2 className="w-5 h-5 text-primary" /> Share Report
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-xs">
            Send this health analytics summary securely over email or copy the direct portal link.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSend} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Recipient Email</Label>
            <div className="relative group">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-border/50 bg-white/80 pl-10 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>
          
          <Button type="submit" disabled={sending} className="w-full h-11 rounded-xl bg-gradient-primary text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300">
            {sending ? "Sending security link..." : "Email Secure Link"}
          </Button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 font-bold text-muted-foreground">Or</span></div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700 font-display">Secure Access Link</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="h-11 rounded-xl border-border/50 bg-slate-50/50 px-3 text-xs font-semibold text-slate-500 flex-1"
            />
            <Button type="button" onClick={handleCopy} className="h-11 rounded-xl px-4 border border-border/60 hover:bg-slate-50 transition-all" variant="outline">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReportHeader({ 
  title, 
  description, 
  shareLabel, 
  onExport,
  onShare
}: { 
  title: string; 
  description: string; 
  shareLabel: string; 
  onExport?: (type: "csv" | "excel") => void;
  onShare?: () => void;
}) {
  return (
    <>
      {/* Dynamic print stylesheet injected for reports route */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide sidebar, navigation, floating widgets and page controls */
          [data-sidebar="sidebar"],
          header,
          .print\\:hidden,
          button,
          .floating-chat,
          .floating-chat-trigger,
          #floating-chat-trigger,
          #floating-chat-window {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent print:text-black print:bg-none">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-border/60 hover:bg-slate-50 transition-colors">
            <FileText className="mr-1.5 h-4 w-4 text-destructive" /> PDF
          </Button>
          <Button onClick={() => onExport ? onExport("excel") : toast.info("Excel export not configured")} variant="outline" className="rounded-xl border-border/60 hover:bg-slate-50 transition-colors">
            <Sheet className="mr-1.5 h-4 w-4 text-success" /> Excel
          </Button>
          <Button onClick={() => onExport ? onExport("csv") : toast.info("CSV export not configured")} variant="outline" className="rounded-xl border-border/60 hover:bg-slate-50 transition-colors">
            <Download className="mr-1.5 h-4 w-4 text-muted-foreground" /> CSV
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-border/60 hover:bg-slate-50 transition-colors">
            <Printer className="mr-1.5 h-4 w-4 text-muted-foreground" /> Print
          </Button>
          <Button onClick={() => onShare ? onShare() : toast.success(shareLabel)} className="rounded-xl bg-gradient-primary shadow-sm hover:shadow transition-all duration-300">
            <Share2 className="mr-1.5 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
    </>
  );
}

/* =========================== PATIENT =========================== */
interface LogRow { scheduled_time: string; status: string; delay_minutes: number; medicine_id: number }

function PatientReports() {
  const user = getStoredUser();
  const [dash, setDash] = useState<{ weekly_adherence: number; monthly_adherence: number } | null>(null);
  const [prediction, setPrediction] = useState<{ current_risk: string; confidence_score: number; summary?: string } | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [daysRange, setDaysRange] = useState(30);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    getDashboard("patient").then((d) => setDash(d as typeof dash)).catch(() => setDash(null));
    getMedicines().then(setMedicines).catch(() => setMedicines([]));
    if (user) getAIPrediction(user.id).then((r) => setPrediction(r.prediction)).catch(() => setPrediction(null));
  }, []);

  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - (daysRange - 1) * 24 * 3600 * 1000);
    getMedicationLogsRange(start.toISOString(), end.toISOString()).then((d) => setLogs(d as LogRow[])).catch(() => setLogs([]));
  }, [daysRange]);

  const medicineById = new Map(medicines.map((m) => [m.id, m]));
  const hasLogs = logs.length > 0;

  const adherenceTrend = (() => {
    const byDay = new Map<string, { total: number; taken: number }>();
    logs.forEach((l) => {
      const key = new Date(l.scheduled_time).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const entry = byDay.get(key) ?? { total: 0, taken: 0 };
      entry.total += 1;
      if (l.status === "taken") entry.taken += 1;
      byDay.set(key, entry);
    });
    return Array.from(byDay.entries()).map(([day, v]) => ({ day, score: Math.round((v.taken / v.total) * 100) }));
  })();

  const medicineWise = (() => {
    const byMed = new Map<number, { total: number; taken: number }>();
    logs.forEach((l) => {
      const entry = byMed.get(l.medicine_id) ?? { total: 0, taken: 0 };
      entry.total += 1;
      if (l.status === "taken") entry.taken += 1;
      byMed.set(l.medicine_id, entry);
    });
    return Array.from(byMed.entries()).map(([id, v]) => ({
      name: medicineById.get(id)?.medicine_name ?? `Medicine #${id}`,
      adherence: Math.round((v.taken / v.total) * 100),
    }));
  })();

  const heatmapData = (() => {
    const days: { day: number; status: string }[] = [];
    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const dayLogs = logs.filter((l) => new Date(l.scheduled_time).toDateString() === d.toDateString());
      let status = "none";
      if (dayLogs.length > 0) {
        if (dayLogs.some((l) => l.status === "missed")) status = "missed";
        else if (dayLogs.some((l) => l.status === "late" || l.delay_minutes > 0)) status = "delayed";
        else if (dayLogs.every((l) => l.status === "taken")) status = "taken";
      }
      days.push({ day: daysRange - i, status });
    }
    return days;
  })();

  const avgDelay = (() => {
    const delayed = logs.filter((l) => l.delay_minutes > 0);
    if (delayed.length === 0) return 0;
    return Math.round(delayed.reduce((s, l) => s + l.delay_minutes, 0) / delayed.length);
  })();
  const mostMissed = medicineWise.length ? [...medicineWise].sort((a, b) => a.adherence - b.adherence)[0] : null;
  const mostConsistent = medicineWise.length ? [...medicineWise].sort((a, b) => b.adherence - a.adherence)[0] : null;

  const currentStreak = (() => {
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const dayLogs = logs.filter((l) => new Date(l.scheduled_time).toDateString() === d.toDateString());
      if (dayLogs.length === 0) break;
      if (dayLogs.every((l) => l.status === "taken")) streak += 1;
      else break;
    }
    return streak;
  })();

  const handleExport = (type: "csv" | "excel") => {
    const data = logs.map(l => ({
      Date: new Date(l.scheduled_time).toLocaleDateString(),
      Time: new Date(l.scheduled_time).toLocaleTimeString(),
      Medicine: medicineById.get(l.medicine_id)?.medicine_name ?? `ID: ${l.medicine_id}`,
      Status: l.status,
      DelayMinutes: l.delay_minutes
    }));
    if (type === "csv") {
      exportToCsv("patient_adherence_report", data);
    } else {
      exportToExcel("patient_adherence_report", data);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <ReportHeader
        title="Health Analytics & Reports"
        description="Comprehensive overview of your adherence, risks, and health trends."
        shareLabel="Share this report with your doctor"
        onExport={handleExport}
        onShare={() => setIsShareOpen(true)}
      />

      <ShareReportDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        defaultEmail="doctor@medimind.ai"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Weekly Adherence" value={dash ? `${dash.weekly_adherence}%` : "—"} icon={Activity} tone="primary" />
        <StatCard label="Monthly Adherence" value={dash ? `${dash.monthly_adherence}%` : "—"} icon={CalendarIcon} tone="primary" />
        <StatCard label="Current Risk" value={prediction?.current_risk ?? "—"} icon={AlertTriangle} tone={prediction?.current_risk === "High" ? "danger" : prediction?.current_risk === "Medium" ? "warning" : "success"} />
        <StatCard label="Current Streak" value={`${currentStreak} Days`} icon={Flame} hint="Consecutive full-adherence days" tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Adherence Trend</CardTitle>
                <CardDescription>Daily medication compliance over the last {daysRange} days</CardDescription>
              </div>
              <div className="print:hidden">
                <select 
                  value={daysRange} 
                  onChange={(e) => setDaysRange(Number(e.target.value))}
                  className="h-9 rounded-xl border border-border/60 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={14}>Last 14 Days</option>
                  <option value={30}>Last 30 Days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {hasLogs ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={adherenceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} dy={10} interval={Math.max(0, Math.floor(adherenceTrend.length / 8))} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="score" stroke={chartColors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorAdherence)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">No medication logs yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medicine-wise Adherence</CardTitle>
            </CardHeader>
            <CardContent>
              {medicineWise.length ? (
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={medicineWise} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={90} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                      <Bar dataKey="adherence" radius={[0, 4, 4, 0]} barSize={20}>
                        {medicineWise.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.adherence > 90 ? chartColors.success : entry.adherence > 70 ? chartColors.warning : chartColors.destructive} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid h-[120px] place-items-center text-sm text-muted-foreground">No data yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Medication Calendar Heatmap</CardTitle>
                <CardDescription>Daily status for the past {daysRange} days</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-muted-foreground">{d}</div>
                ))}
                {heatmapData.map((d, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium border ${
                      d.status === 'taken' ? 'bg-success/15 border-success/30 text-success' :
                      d.status === 'delayed' ? 'bg-warning/15 border-warning/30 text-warning' :
                      d.status === 'missed' ? 'bg-destructive/15 border-destructive/30 text-destructive' :
                      'bg-muted/40 border-border/50 text-muted-foreground'
                    }`}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 text-[10px] font-semibold text-muted-foreground px-1">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success"></div> Taken</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning"></div> Delayed</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive"></div> Missed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-sm text-muted-foreground">Average Delay</span>
                <span className="text-sm font-bold">{avgDelay} mins</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-sm text-muted-foreground">Most Missed</span>
                <span className="text-sm font-bold text-destructive">{mostMissed?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-sm text-muted-foreground">Most Consistent</span>
                <span className="text-sm font-bold text-success">{mostConsistent?.name ?? "—"}</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold text-accent uppercase">AI Recommendation</span>
                </div>
                <p className="text-xs text-foreground/80 bg-card p-3 rounded-lg border border-border/60 shadow-sm">
                  {prediction?.summary ?? "Recalculate your risk from this page's AI Assistant to generate a personalized recommendation."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================== DOCTOR =========================== */
function DoctorReports() {
  const [dash, setDash] = useState<{ total_patients: number; high_risk_patients: number; upcoming_appointments: number } | null>(null);
  const [roster, setRoster] = useState<PatientSummary[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    getDashboard("doctor").then((d) => setDash(d as typeof dash)).catch(() => setDash(null));
    getPatientsList().then(setRoster).catch(() => setRoster([]));
  }, []);

  useEffect(() => {
    if (roster.length === 0) return;
    const highRisk = roster.filter((p) => p.risk === "High").slice(0, 3);
    Promise.all(highRisk.map((p) => getAIPrediction(p.user_id).then((r) => r.details.find((d) => !d.applied)?.text).catch(() => undefined)))
      .then((texts) => setInsight(texts.filter(Boolean).join(" ") || null));
  }, [roster]);

  const highRisk = roster.filter((p) => p.risk === "High");
  const avgAdherence = roster.length ? Math.round(roster.reduce((s, p) => s + p.adherence, 0) / roster.length) : 0;
  const missedToday = roster.filter((p) => p.status === "Missed").length;
  const riskCounts = {
    High: roster.filter((p) => p.risk === "High").length,
    Medium: roster.filter((p) => p.risk === "Medium").length,
    Low: roster.filter((p) => p.risk === "Low").length,
  };

  const handleExport = (type: "csv" | "excel") => {
    const data = roster.map(p => ({
      PatientName: p.name,
      Risk: p.risk,
      Adherence: `${p.adherence}%`,
      Status: p.status,
      Medications: p.medications.join("; ")
    }));
    if (type === "csv") {
      exportToCsv("clinic_roster_report", data);
    } else {
      exportToExcel("clinic_roster_report", data);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <ReportHeader
        title="Clinic Analytics & Reports"
        description="Aggregate adherence, risk and outcomes across your patient panel."
        shareLabel="Report shared with hospital admin"
        onExport={handleExport}
        onShare={() => setIsShareOpen(true)}
      />

      <ShareReportDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        defaultEmail="admin@hospital.org"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={dash?.total_patients ?? roster.length} icon={Users} tone="primary" />
        <StatCard label="High Risk" value={highRisk.length} icon={ShieldAlert} hint="Needs review" tone="danger" />
        <StatCard label="Avg Adherence" value={`${avgAdherence}%`} icon={Activity} tone="success" />
        <StatCard label="Missed Today" value={missedToday} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adherence by Patient</CardTitle>
              <CardDescription>Live adherence across your assigned panel</CardDescription>
            </CardHeader>
            <CardContent>
              {roster.length ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roster.slice(0, 10).map((p) => ({ name: p.name.split(" ")[0], adherence: p.adherence }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                      <Bar dataKey="adherence" fill={chartColors.accent} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">No patients assigned yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top At-Risk Patients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {highRisk.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No high-risk patients right now.</p>}
              {highRisk.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.medications.join(", ") || "—"}</div>
                  </div>
                  <Badge className="rounded-full bg-destructive/15 text-destructive">{p.adherence}% adherence</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col">
            <CardHeader className="pb-2"><CardTitle>Risk Distribution</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart innerRadius="30%" outerRadius="90%" data={[
                  { name: "High", value: riskCounts.High, fill: chartColors.destructive },
                  { name: "Medium", value: riskCounts.Medium, fill: chartColors.warning },
                  { name: "Low", value: riskCounts.Low, fill: chartColors.success },
                ]}>
                  <RadialBar dataKey="value" background cornerRadius={8} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="mt-2 w-full flex justify-around text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />High</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />Medium</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Low</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                Clinical Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground/80 bg-card p-3 rounded-lg border border-border/60 shadow-sm">
                {insight ?? "No AI risk explanations generated yet — recalculate risk for a high-risk patient from Prescriptions to populate this."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================== ADMIN =========================== */
function AdminReports() {
  const [dash, setDash] = useState<{ total_users: number; connected_devices: number; system_status: string } | null>(null);
  const [users, setUsers] = useState<{ role: string }[]>([]);
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [devices, setDevices] = useState<{ wifi_status: string }[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    getDashboard("admin").then((d) => setDash(d as typeof dash)).catch(() => setDash(null));
    getAdminUsers().then(setUsers).catch(() => setUsers([]));
    getDoctorsList().then(setDoctors).catch(() => setDoctors([]));
    getAdminDevices().then(setDevices).catch(() => setDevices([]));
  }, []);

  const topDoctors = [...doctors].sort((a, b) => b.patients_count - a.patients_count).slice(0, 5);
  const roleBreakdown = [
    { name: "Doctors", value: users.filter((u) => u.role === "doctor").length },
    { name: "Patients", value: users.filter((u) => u.role === "patient").length },
    { name: "Admins", value: users.filter((u) => u.role === "admin").length },
  ];
  const offlineDevices = devices.filter((d) => d.wifi_status !== "connected").length;

  const handleExport = (type: "csv" | "excel") => {
    const doctorData = doctors.map(d => ({
      DoctorName: d.name,
      Specialization: d.specialization ?? "General",
      Patients: d.patients_count,
    }));
    if (type === "csv") {
      exportToCsv("platform_doctors_report", doctorData);
    } else {
      exportToExcel("platform_doctors_report", doctorData);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <ReportHeader
        title="Platform Analytics & Reports"
        description="Hospital-wide usage, adherence and system health overview."
        shareLabel="Report shared with hospital board"
        onExport={handleExport}
        onShare={() => setIsShareOpen(true)}
      />

      <ShareReportDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        defaultEmail="board@hospital.org"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={dash?.total_users.toLocaleString() ?? "—"} icon={Users} tone="primary" />
        <StatCard label="Devices Connected" value={dash?.connected_devices.toLocaleString() ?? "—"} icon={HardDrive} hint={`${offlineDevices} offline`} tone="warning" />
        <StatCard label="System Status" value={dash?.system_status ?? "—"} icon={ServerCog} tone="success" />
        <StatCard label="Total Doctors" value={doctors.length} icon={Gauge} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform User Breakdown</CardTitle>
              <CardDescription>Registered users by role</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={roleBreakdown}>
                      <defs>
                        <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.5} /><stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                      <Area type="monotone" dataKey="value" stroke={chartColors.primary} strokeWidth={2} fill="url(#a1)" dot={{ r: 3, strokeWidth: 1, fill: "#fff" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">Loading…</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Doctors by Patient Load</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topDoctors.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No doctors yet.</p>}
              {topDoctors.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white text-xs font-bold">{d.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{d.name}</div><div className="text-xs text-muted-foreground truncate">{d.specialization ?? "General"}</div></div>
                  <Badge variant="outline" className="rounded-full">{d.patients_count} patients</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col">
            <CardHeader className="pb-2"><CardTitle>Device Status</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="divide-y divide-border/60">
                <div className="flex items-center justify-between py-3 first:pt-1">
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-success" /><span className="text-sm font-semibold text-foreground/80">Connected</span></div>
                  <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs font-semibold border-success/30 bg-success/5 text-success">{devices.length - offlineDevices}</Badge>
                </div>
                <div className="flex items-center justify-between py-3 last:pb-1">
                  <div className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-warning" /><span className="text-sm font-semibold text-foreground/80">Offline</span></div>
                  <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs font-semibold border-warning/30 bg-warning/5 text-warning">{offlineDevices}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-accent" />
                Platform Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground/80 bg-card p-3 rounded-lg border border-border/60 shadow-sm">
                {offlineDevices > 0
                  ? `${offlineDevices} of ${devices.length} smart bottles are currently offline — check the Devices page to follow up with affected patients.`
                  : "All registered smart bottles are online."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
