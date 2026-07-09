import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Pill, Activity, XCircle, ShieldCheck, Package, Sparkles, FileText,
  Bot, AlertTriangle, HeartPulse, Users, Stethoscope, HardDrive,
  ChevronLeft, ChevronRight, X, UserPlus, ScrollText, CheckCircle2, Gauge,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart,
} from "recharts";
import {
  activity as mockActivity, todaysSchedule as mockTodaysSchedule,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-store";
import { toast } from "sonner";
import {
  getDashboard, getMedicines, getMedicationLogsRange, getAIPrediction, getStoredUser,
  getPatientsList, getDoctorsList, getAdminUsers, getAuditLogs,
  type Medicine, type PatientSummary, type DoctorSummary, type AdminUser, type AuditLogEntry,
} from "@/lib/api";
import { chartColors } from "@/lib/chart-colors";
import { severityBadgeClass } from "@/lib/status-colors";
import { useMedicationCalendar, type CalendarLog } from "@/hooks/use-medication-calendar";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const role = useRole();
  if (role === "doctor") return <DoctorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <PatientDashboard />;
}

/* =========================== PATIENT =========================== */

// ─── Instant mock seeds so the UI renders populated on frame 1 ───────────────
const SEED_STATS = { weekly_adherence: 94, monthly_adherence: 91, risk_score: "Low" };
const SEED_MEDS: Medicine[] = [
  { id: 1, patient_id: 1, medicine_name: "Metformin", dosage: "500mg", frequency: "Twice daily", schedule: ["8:00 AM", "8:00 PM"], instructions: "With meals", remaining_pills: 24, status: "active", auto_refill: true },
  { id: 2, patient_id: 1, medicine_name: "Lisinopril", dosage: "10mg", frequency: "Once daily", schedule: ["9:00 AM"], instructions: "Any time", remaining_pills: 18, status: "active", auto_refill: false },
  { id: 3, patient_id: 1, medicine_name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", schedule: ["10:00 PM"], instructions: "With or without food", remaining_pills: 12, status: "active", auto_refill: false },
  { id: 4, patient_id: 1, medicine_name: "Aspirin", dosage: "81mg", frequency: "Once daily", schedule: ["9:00 AM"], instructions: "With food", remaining_pills: 30, status: "active", auto_refill: true },
];
const SEED_PREDICTION = { current_risk: "Low", future_risk_7d: "Low", future_risk_30d: "Moderate", next_miss_probability: 18, expected_adherence: 92, confidence_score: 96, summary: "You may miss evening doses on weekends. Set a bedtime reminder to stay on track." };

function generateSeedLogs(): CalendarLog[] {
  const logs: CalendarLog[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    [1, 2, 3].forEach((medId, j) => {
      const scheduled = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8 + j * 2, 0);
      logs.push({
        id: i * 10 + j,
        medicine_id: medId,
        scheduled_time: scheduled.toISOString(),
        status: Math.random() > 0.12 ? "taken" : "missed",
        delay_minutes: 0,
      } as unknown as CalendarLog);
    });
  }
  return logs;
}
const SEED_LOGS = generateSeedLogs();

function PatientDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Pre-seeded with instant mock data — replaced by live data once fetched
  const [stats, setStats] = useState<{ weekly_adherence: number; monthly_adherence: number; risk_score: string }>(SEED_STATS);
  const [medicines, setMedicines] = useState<Medicine[]>(SEED_MEDS);
  const [monthLogs, setMonthLogs] = useState<CalendarLog[]>(SEED_LOGS);
  const [weekLogs, setWeekLogs] = useState<{ scheduled_time: string; status: string }[]>(SEED_LOGS.slice(-21));
  const [prediction, setPrediction] = useState<{ current_risk: string; future_risk_7d: string; future_risk_30d: string; next_miss_probability: number; expected_adherence: number; confidence_score: number; summary?: string }>(SEED_PREDICTION);

  const user = getStoredUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Single effect — all fetches run in parallel via Promise.all
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    const weekStart = new Date(end.getTime() - 6 * 24 * 3600 * 1000);

    Promise.all([
      getDashboard("patient").catch(() => null),
      getMedicines().catch(() => null),
      user ? getAIPrediction(user.id).catch(() => null) : Promise.resolve(null),
      getMedicationLogsRange(start.toISOString(), end.toISOString()).catch(() => null),
      getMedicationLogsRange(weekStart.toISOString(), end.toISOString()).catch(() => null),
    ]).then(([dash, meds, pred, mLogs, wLogs]) => {
      if (dash) setStats(dash as typeof stats);
      if (meds && meds.length > 0) setMedicines(meds);
      if (pred?.prediction) setPrediction(pred.prediction);
      if (mLogs && (mLogs as CalendarLog[]).length > 0) setMonthLogs(mLogs as CalendarLog[]);
      if (wLogs && (wLogs as { scheduled_time: string; status: string }[]).length > 0) setWeekLogs(wLogs as { scheduled_time: string; status: string }[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch month logs when user navigates the calendar
  useEffect(() => {
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 1).toISOString();
    getMedicationLogsRange(start, end)
      .then((d) => { if (d && (d as CalendarLog[]).length > 0) setMonthLogs(d as CalendarLog[]); })
      .catch(() => {});
  }, [year, month]);

  const days = useMedicationCalendar(monthLogs, year, month);
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const medicineById = new Map(medicines.map((m) => [m.id, m]));

  const weeklyChartData = (() => {
    if (weekLogs.length === 0) return null;
    const byDay = new Map<string, { total: number; taken: number }>();
    weekLogs.forEach((l) => {
      const key = new Date(l.scheduled_time).toLocaleDateString("en-US", { weekday: "short" });
      const entry = byDay.get(key) ?? { total: 0, taken: 0 };
      entry.total += 1;
      if (l.status === "taken") entry.taken += 1;
      byDay.set(key, entry);
    });
    return Array.from(byDay.entries()).map(([day, v]) => ({ day, adherence: Math.round((v.taken / v.total) * 100), target: 95 }));
  })();

  const totalPills = medicines.reduce((s, m) => s + m.remaining_pills, 0);
  const selectedDayLogs = selectedDate
    ? monthLogs.filter((l) => {
        const d = new Date(l.scheduled_time);
        return d.toDateString() === selectedDate.toDateString();
      })
    : [];
  const selectedDayAdherence = selectedDayLogs.length
    ? Math.round((selectedDayLogs.filter((l) => l.status === "taken").length / selectedDayLogs.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-primary">
              <Sparkles className="mr-1 h-3 w-3" /> Personalized for you
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-bold mt-2">Good morning, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats ? `Your weekly adherence is ${stats.weekly_adherence}%.` : "Loading your health summary…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success("Medication intake logged successfully!")} className="h-10 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Pill className="h-4 w-4" />Take medicine</Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs">
            <Link to="/ai-assistant"><Bot className="h-4 w-4" />Open AI Assistant</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs">
            <Link to="/reports"><FileText className="h-4 w-4" />View report</Link>
          </Button>
          <Button onClick={() => toast.error("SOS Alert Dispatched to Emergency Contacts!")} variant="destructive" className="h-10 rounded-xl font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs">
            <AlertTriangle className="h-4 w-4" />Emergency SOS
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Activity} label="Weekly adherence" value={stats ? `${stats.weekly_adherence}%` : "—"} hint="Last 7 days" tone="primary" />
        <StatCard icon={Pill} label="Monthly adherence" value={stats ? `${stats.monthly_adherence}%` : "—"} hint="Last 30 days" tone="accent" />
        <StatCard icon={XCircle} label="Missed today" value={monthLogs.filter((l) => l.status === "missed" && new Date(l.scheduled_time).toDateString() === new Date().toDateString()).length} hint="Today" tone="danger" />
        <StatCard
          icon={ShieldCheck}
          label="Risk"
          value={
            <div className="space-y-2 mt-1">
              <div className="flex items-baseline gap-1.5">
                <span>{prediction?.current_risk ?? stats?.risk_score ?? "—"}</span>
                {prediction && <span className="text-xs font-sans font-medium text-muted-foreground">({prediction.next_miss_probability}%)</span>}
              </div>
              {prediction && (
                <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${prediction.next_miss_probability}%` }} />
                </div>
              )}
            </div>
          }
          hint="AI predicted"
          tone="success"
        />
        <StatCard icon={Package} label="Inventory" value={totalPills} hint="Pills remaining" tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Weekly adherence</CardTitle>
            <Badge variant="outline" className="rounded-full text-xs">Last 7 days</Badge>
          </CardHeader>
          <CardContent>
            {weeklyChartData ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weeklyChartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,.1)" }} formatter={(value) => [`${value}%`, "Adherence"]} />
                  <Area type="monotone" dataKey="adherence" stroke={chartColors.primary} strokeWidth={3} fill="url(#g1)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">No medication logs yet this week.</div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground flex-1 flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Pills remaining</div>
                <div className="mt-1 font-display text-2xl font-bold">{totalPills} pills</div>
              </div>
              <div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold">{medicines.length}</span>
                  <span className="text-sm opacity-80">active medications</span>
                </div>
              </div>
            </div>
            <Button asChild className="w-full rounded-xl bg-gradient-primary h-11"><Link to="/refill"><Pill className="mr-2 h-4 w-4" /> Manage refills</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Today's schedule</CardTitle></CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <ol className="relative space-y-3 border-l-2 border-border/70 pl-5">
                {mockTodaysSchedule.map((s, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[26px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-background ${s.status === "taken" ? "bg-success" : "bg-primary animate-pulse"}`} />
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                      <div>
                        <div className="text-sm font-semibold">{s.name} <span className="text-xs text-muted-foreground">· {s.dosage}</span></div>
                        <div className="text-xs text-muted-foreground">{s.time}</div>
                      </div>
                      <Badge className={`rounded-full ${s.status === "taken" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{s.status === "taken" ? "Taken" : "Upcoming"}</Badge>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="relative space-y-3 border-l-2 border-border/70 pl-5">
                {monthLogs
                  .filter((l) => new Date(l.scheduled_time).toDateString() === new Date().toDateString())
                  .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
                  .map((s, i) => {
                    const med = medicineById.get((s as unknown as { medicine_id: number }).medicine_id);
                    const taken = s.status === "taken";
                    return (
                      <li key={i} className="relative">
                        <span className={`absolute -left-[26px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-background ${taken ? "bg-success" : "bg-primary animate-pulse"}`} />
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                          <div>
                            <div className="text-sm font-semibold">{med?.medicine_name ?? "Medication"} <span className="text-xs text-muted-foreground">· {med?.dosage ?? ""}</span></div>
                            <div className="text-xs text-muted-foreground">{new Date(s.scheduled_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                          </div>
                          <Badge className={`rounded-full ${taken ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{taken ? "Taken" : s.status === "missed" ? "Missed" : "Upcoming"}</Badge>
                        </div>
                      </li>
                    );
                  })}
                {monthLogs.filter((l) => new Date(l.scheduled_time).toDateString() === new Date().toDateString()).length === 0 && (
                  <p className="text-sm text-muted-foreground">No doses scheduled for today.</p>
                )}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Medication Calendar</CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">Track daily medication adherence</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs font-bold text-foreground select-none min-w-[70px] text-center">{currentDate.toLocaleString("default", { month: "short", year: "numeric" })}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between relative min-h-[340px]">
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] font-bold text-muted-foreground uppercase">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (<div key={idx} className="h-6 flex items-center justify-center">{day}</div>))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {days.map((item, idx) => {
                  const isToday = item.date.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(item.date)}
                      className={cn(
                        "group relative h-8 w-8 mx-auto flex flex-col items-center justify-between rounded-lg transition-all p-1",
                        isToday ? "bg-primary text-white font-bold" : "hover:bg-muted text-foreground/80",
                        !item.isCurrentMonth && "opacity-35",
                      )}
                    >
                      <span className="text-[10px]">{item.date.getDate()}</span>
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125",
                        item.status === "green" ? "bg-success" : item.status === "yellow" ? "bg-warning" : item.status === "red" ? "bg-destructive" : "bg-muted-foreground/30",
                      )} />
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="absolute inset-x-3 top-0 bottom-3 bg-background/95 backdrop-blur-md border border-border/80 rounded-2xl p-4 z-20 flex flex-col justify-between shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="text-xs font-bold text-foreground">Doses for {selectedDate.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md text-muted-foreground" onClick={() => setSelectedDate(null)}><X className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="space-y-2 py-3 text-xs flex-1 overflow-y-auto">
                  {selectedDayLogs.length === 0 && <p className="text-muted-foreground">No doses logged for this day.</p>}
                  {selectedDayLogs.map((l, i) => {
                    const med = medicineById.get((l as unknown as { medicine_id: number }).medicine_id);
                    return (
                      <div key={i} className="flex justify-between items-center bg-muted/40 p-2 rounded-lg">
                        <div>
                          <div className="font-semibold text-foreground">{med?.medicine_name ?? "Medication"}</div>
                          <div className={`text-[9px] ${l.status === "taken" ? "text-muted-foreground" : "text-destructive"}`}>
                            {l.status === "taken" ? "✔ Taken" : l.status === "missed" ? "❌ Missed" : l.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-2 flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground font-medium">Day adherence</span>
                  <span className="font-bold text-warning text-sm">{selectedDayAdherence}%</span>
                </div>
              </div>
            )}

            <div className="border-t pt-3 mt-3">
              <Button asChild variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-border/60 hover:bg-muted/40 shadow-xs">
                <Link to="/medication-calendar">View Full Calendar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Active medications</CardTitle></CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medications on file — add one from the Medication page.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={medicines.map((m) => ({ name: m.medicine_name, remaining: m.remaining_pills }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="remaining" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI risk outlook</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {prediction ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-ai text-white"><Gauge className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-semibold">7-day outlook: {prediction.future_risk_7d}</div>
                    <div className="text-xs text-muted-foreground">30-day outlook: {prediction.future_risk_30d} · {prediction.confidence_score}% confidence</div>
                  </div>
                </div>
                {prediction.summary && (
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-ai text-white"><Sparkles className="h-4 w-4" /></div>
                    <div className="text-xs text-muted-foreground">{prediction.summary}</div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Risk prediction will appear here once available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 border-none">
              {(medicines.length > 0
                ? monthLogs.slice(-6).reverse().map((l) => {
                    const med = medicineById.get((l as unknown as { medicine_id: number }).medicine_id);
                    return {
                      type: med?.medicine_name ?? "Medication",
                      detail: l.status === "taken" ? "Taken on schedule" : l.status === "missed" ? "Missed dose" : l.status,
                      time: new Date(l.scheduled_time).toLocaleString(),
                      tone: l.status === "taken" ? "success" : l.status === "missed" ? "danger" : "primary",
                    };
                  })
                : mockActivity.slice(0, 6)
              ).map((a, i) => (
                <li key={i} className="relative rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className={`inline-block h-2 w-2 rounded-full mb-1.5 ${a.tone === "success" ? "bg-success" : a.tone === "danger" ? "bg-destructive" : a.tone === "accent" ? "bg-accent" : "bg-primary"}`} />
                  <div className="text-sm font-semibold">{a.type}</div>
                  <div className="text-xs text-muted-foreground">{a.detail}</div>
                  <div className="text-[11px] text-muted-foreground/80">{a.time}</div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* =========================== DOCTOR =========================== */

// Instant seeds for doctor dashboard
const SEED_DOCTOR_DASH = { total_patients: 8, high_risk_patients: 2, upcoming_appointments: 5, recent_reports: 3 };
const SEED_ROSTER: PatientSummary[] = [
  { id: 1, user_id: 10, name: "Emma Wilson", email: "emma@medimind.ai", dob: "1966-03-14", gender: "Female", doctor_id: 2, risk: "High", adherence: 68, status: "Missed", last_dose: "6h ago", medications: ["Metformin", "Insulin"] },
  { id: 2, user_id: 11, name: "James Carter", email: "james@medimind.ai", dob: "1953-07-22", gender: "Male", doctor_id: 2, risk: "Medium", adherence: 82, status: "On track", last_dose: "1h ago", medications: ["Lisinopril", "Aspirin"] },
  { id: 3, user_id: 12, name: "Priya Menon", email: "priya.m@medimind.ai", dob: "1960-11-05", gender: "Female", doctor_id: 2, risk: "Low", adherence: 96, status: "On track", last_dose: "3h ago", medications: ["Atorvastatin"] },
  { id: 4, user_id: 13, name: "Robert Kim", email: "robert@medimind.ai", dob: "1955-01-30", gender: "Male", doctor_id: 2, risk: "High", adherence: 61, status: "Delayed", last_dose: "8h ago", medications: ["Tiotropium"] },
  { id: 5, user_id: 14, name: "Sofia Alvarez", email: "sofia@medimind.ai", dob: "1969-08-19", gender: "Female", doctor_id: 3, risk: "Medium", adherence: 79, status: "On track", last_dose: "2h ago", medications: ["Metformin"] },
  { id: 6, user_id: 15, name: "David Chen", email: "david@medimind.ai", dob: "1950-05-11", gender: "Male", doctor_id: 2, risk: "Low", adherence: 94, status: "On track", last_dose: "1h ago", medications: ["Warfarin", "Statin"] },
  { id: 7, user_id: 16, name: "Aisha Rahman", email: "aisha@medimind.ai", dob: "1977-12-02", gender: "Female", doctor_id: 3, risk: "Low", adherence: 91, status: "On track", last_dose: "4h ago", medications: ["Albuterol"] },
  { id: 8, user_id: 17, name: "Michael O'Connor", email: "michael@medimind.ai", dob: "1958-09-27", gender: "Male", doctor_id: 2, risk: "Medium", adherence: 76, status: "On track", last_dose: "2h ago", medications: ["Amlodipine"] },
];
const SEED_SUGGESTIONS = [
  { patientName: "Emma Wilson", text: "Consider adjusting Metformin dosage — missed 3 evening doses this week." },
  { patientName: "Robert Kim", text: "High-risk: schedule a follow-up call within 48 hours." },
];

function DoctorDashboard() {
  const [dash, setDash] = useState<{ total_patients: number; high_risk_patients: number; upcoming_appointments: number; recent_reports: number }>(SEED_DOCTOR_DASH);
  const [roster, setRoster] = useState<PatientSummary[]>(SEED_ROSTER);
  const [suggestions, setSuggestions] = useState<{ patientName: string; text: string }[]>(SEED_SUGGESTIONS);
  const user = getStoredUser();

  useEffect(() => {
    Promise.all([
      getDashboard("doctor").catch(() => null),
      getPatientsList().catch(() => null),
    ]).then(([d, pts]) => {
      if (d) setDash(d as typeof dash);
      if (pts && (pts as PatientSummary[]).length > 0) setRoster(pts as PatientSummary[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (roster.length === 0) return;
    Promise.all(
      roster.slice(0, 4).map((p) =>
        getAIPrediction(p.user_id)
          .then((r) => r.details.filter((d) => !d.applied).slice(0, 1).map((d) => ({ patientName: p.name, text: d.text })))
          .catch(() => [])
      )
    ).then((lists) => { const flat = lists.flat(); if (flat.length > 0) setSuggestions(flat); });
  }, [roster]);

  const missedToday = roster.filter((p) => p.status === "Missed").length;
  const avgAdherence = roster.length ? Math.round(roster.reduce((s, p) => s + p.adherence, 0) / roster.length) : 0;
  const riskCounts = {
    High: roster.filter((p) => p.risk === "High").length,
    Medium: roster.filter((p) => p.risk === "Medium").length,
    Low: roster.filter((p) => p.risk === "Low").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Stethoscope className="mr-1 h-3 w-3" /> Clinical dashboard
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-bold mt-2">Welcome, {user?.name ?? "Doctor"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dash ? `${dash.high_risk_patients} high-risk patients · ${dash.upcoming_appointments} upcoming appointments.` : "Loading your clinical overview…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-10 rounded-xl bg-purple-600 text-white hover:bg-purple-600/90 font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Link to="/patients"><Users className="h-4 w-4" />View patients</Link></Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Link to="/ai-assistant"><Bot className="h-4 w-4" />Open AI Assistant</Link></Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Link to="/reports"><FileText className="h-4 w-4" />Generate report</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Users} label="Total patients" value={dash?.total_patients ?? "—"} tone="primary" />
        <StatCard icon={AlertTriangle} label="High risk" value={dash?.high_risk_patients ?? "—"} tone="danger" hint="Needs review" />
        <StatCard icon={Activity} label="Avg adherence" value={`${avgAdherence}%`} tone="success" />
        <StatCard icon={XCircle} label="Missed today" value={missedToday} tone="warning" hint="Across panel" />
        <StatCard icon={FileText} label="Reports this week" value={dash?.recent_reports ?? "—"} tone="accent" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Patient roster</CardTitle>
          <Badge className="rounded-full bg-destructive/15 text-destructive">{riskCounts.High} high risk</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {roster.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No patients assigned yet.</p>
          ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border/60"><th className="p-3 text-left">Patient</th><th className="p-3 text-left">Medication</th><th className="p-3 text-left">Risk</th><th className="p-3 text-left">Adherence</th><th className="p-3 text-left">Status</th></tr>
            </thead>
            <tbody>
              {roster.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.medications.join(", ") || "—"}</td>
                  <td className="p-3"><Badge className={`rounded-full ${p.risk === "High" ? "bg-destructive/15 text-destructive" : p.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{p.risk}</Badge></td>
                  <td className="p-3"><div className="flex items-center gap-2"><Progress value={p.adherence} className="h-1.5 w-20" /><span className="text-xs font-semibold">{p.adherence}%</span></div></td>
                  <td className="p-3"><Badge variant="outline" className="rounded-full">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle>Adherence by patient</CardTitle></CardHeader>
          <CardContent>
            {roster.length === 0 ? (
              <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roster.slice(0, 8).map((p) => ({ name: p.name.split(" ")[0], adherence: p.adherence }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="adherence" fill={chartColors.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle>Risk distribution</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart innerRadius="30%" outerRadius="90%" data={[
                { name: "High", value: riskCounts.High, fill: chartColors.destructive },
                { name: "Medium", value: riskCounts.Medium, fill: chartColors.warning },
                { name: "Low", value: riskCounts.Low, fill: chartColors.success },
              ]}>
                <RadialBar dataKey="value" background cornerRadius={8} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 w-full flex justify-around text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />High ({riskCounts.High})</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />Medium ({riskCounts.Medium})</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Low ({riskCounts.Low})</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>AI intervention suggestions</CardTitle>
          <Badge className="rounded-full bg-gradient-ai text-white border-0"><Sparkles className="mr-1 h-3 w-3" />AI</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {suggestions === null && <p className="text-sm text-muted-foreground sm:col-span-2 py-4 text-center">Loading AI suggestions…</p>}
          {suggestions?.length === 0 && <p className="text-sm text-muted-foreground sm:col-span-2 py-4 text-center">No pending suggestions — recalculate risk from Reports to generate more.</p>}
          {suggestions?.map((s, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="text-sm font-semibold">{s.patientName}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.text}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================== ADMIN =========================== */

// Instant seeds for admin dashboard
const SEED_ADMIN_DASH = { total_users: 12840, active_doctors: 342, active_patients: 11290, connected_devices: 7912, system_status: "Healthy" };
const SEED_ADMIN_USERS: AdminUser[] = [
  { id: 1, name: "John Anderson", email: "john@medimind.ai", role: "patient", is_active: true, created_at: "2024-01-10T10:00:00Z", patients_count: 0 },
  { id: 2, name: "Dr. Priya Patel", email: "priya.patel@medimind.ai", role: "doctor", is_active: true, created_at: "2024-01-05T09:00:00Z", patients_count: 138 },
  { id: 3, name: "System Admin", email: "admin@medimind.ai", role: "admin", is_active: true, created_at: "2024-01-01T08:00:00Z", patients_count: 0 },
  { id: 4, name: "Emma Wilson", email: "emma@medimind.ai", role: "patient", is_active: true, created_at: "2024-02-12T11:00:00Z", patients_count: 0 },
  { id: 5, name: "Dr. Marcus Lee", email: "marcus.lee@medimind.ai", role: "doctor", is_active: true, created_at: "2024-01-08T09:30:00Z", patients_count: 92 },
];
const SEED_ADMIN_DOCTORS: DoctorSummary[] = [
  { id: 1, user_id: 2, name: "Dr. Priya Patel", email: "priya.patel@medimind.ai", hospital: "MediMind Central", specialization: "Internal Medicine", status: "active", patients_count: 138 },
  { id: 2, user_id: 5, name: "Dr. Marcus Lee", email: "marcus.lee@medimind.ai", hospital: "MediMind Central", specialization: "Cardiology", status: "active", patients_count: 92 },
  { id: 3, user_id: 6, name: "Dr. Elena Rossi", email: "elena.rossi@medimind.ai", hospital: "MediMind Central", specialization: "Endocrinology", status: "active", patients_count: 104 },
  { id: 4, user_id: 7, name: "Dr. Samuel Okafor", email: "samuel.okafor@medimind.ai", hospital: "MediMind Central", specialization: "Pulmonology", status: "on_leave", patients_count: 71 },
  { id: 5, user_id: 8, name: "Dr. Hannah Weiss", email: "hannah.weiss@medimind.ai", hospital: "MediMind Central", specialization: "Geriatrics", status: "active", patients_count: 118 },
];

function AdminDashboard() {
  const [dash, setDash] = useState<{ total_users: number; active_doctors: number; active_patients: number; connected_devices: number; system_status: string }>(SEED_ADMIN_DASH);
  const [users, setUsers] = useState<AdminUser[]>(SEED_ADMIN_USERS);
  const [doctors, setDoctors] = useState<DoctorSummary[]>(SEED_ADMIN_DOCTORS);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    Promise.all([
      getDashboard("admin").catch(() => null),
      getAdminUsers().catch(() => null),
      getDoctorsList().catch(() => null),
      getAuditLogs().catch(() => null),
    ]).then(([d, u, doc, l]) => {
      if (d) setDash(d as typeof dash);
      if (u && (u as AdminUser[]).length > 0) setUsers(u as AdminUser[]);
      if (doc && (doc as DoctorSummary[]).length > 0) setDoctors(doc as DoctorSummary[]);
      if (l && (l as AuditLogEntry[]).length > 0) setLogs(l as AuditLogEntry[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleBreakdown = [
    { name: "Doctors", value: users.filter((u) => u.role === "doctor").length },
    { name: "Patients", value: users.filter((u) => u.role === "patient").length },
    { name: "Admins", value: users.filter((u) => u.role === "admin").length },
  ];
  const topDoctors = [...doctors].sort((a, b) => b.patients_count - a.patients_count).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400">
              <HardDrive className="mr-1 h-3 w-3" /> Platform control
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-bold mt-2">Hospital admin console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dash ? `${dash.total_users.toLocaleString()} users · ${dash.connected_devices.toLocaleString()} devices connected · Status: ${dash.system_status}.` : "Loading platform overview…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-10 rounded-xl bg-rose-600 text-white hover:bg-rose-600/90 font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Link to="/users"><UserPlus className="h-4 w-4" />Manage users</Link></Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Link to="/devices"><HardDrive className="h-4 w-4" />Devices</Link></Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted font-semibold px-4 transition-all inline-flex items-center justify-center gap-2 shadow-xs"><Link to="/audit-logs"><ScrollText className="h-4 w-4" />Audit logs</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={dash?.total_users.toLocaleString() ?? "—"} tone="primary" />
        <StatCard icon={Stethoscope} label="Active doctors" value={dash?.active_doctors ?? "—"} tone="accent" />
        <StatCard icon={HeartPulse} label="Active patients" value={dash?.active_patients.toLocaleString() ?? "—"} tone="success" />
        <StatCard icon={HardDrive} label="Devices connected" value={dash?.connected_devices.toLocaleString() ?? "—"} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle>User breakdown</CardTitle></CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">Loading users…</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={roleBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="value" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle>System status</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center gap-3">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${dash?.system_status === "Healthy" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="font-display text-2xl font-bold">{dash?.system_status ?? "—"}</div>
            <div className="text-xs text-muted-foreground text-center">
              {dash ? `${dash.connected_devices} of ${dash.active_patients} patient devices connected` : "Loading…"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent audit logs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {logs.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No audit log entries yet.</p>}
            {logs.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${severityBadgeClass(l.severity)}`}><ScrollText className="h-4 w-4" /></div>
                <div className="flex-1"><div className="font-semibold">{l.actor_name}</div><div className="text-xs text-muted-foreground">{l.action}{l.target ? ` · ${l.target}` : ""}</div></div>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top doctors</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topDoctors.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No doctors yet.</p>}
            {topDoctors.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white text-xs font-bold">{d.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{d.name}</div><div className="text-xs text-muted-foreground truncate">{d.specialization ?? "General"} · {d.patients_count} patients</div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
