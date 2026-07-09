import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Pill, Activity, Flame, XCircle, ShieldCheck, Package, Sparkles, PhoneCall, FileText, Clock,
  Bot, AlertTriangle, HeartPulse, Users, Stethoscope, HardDrive, Zap, Battery, MapPin,
  MessageCircle, Phone, TrendingUp, ServerCog, UserPlus, ScrollText, Wifi,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart,
} from "recharts";
import {
  activity, dashboardStats, monthlyAdherence, reminderPie, riskPrediction, weeklyAdherence,
  todaysSchedule, patients, notifications, sensorReadings, platformStats, platformUsage,
  doctors, auditLogs,
} from "@/lib/mock-data";
import { useRole, roleMeta } from "@/lib/role-store";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const role = useRole();
  if (role === "caregiver") return <CaregiverDashboard />;
  if (role === "doctor") return <DoctorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <PatientDashboard />;
}

/* =========================== PATIENT =========================== */
function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-lg">
        <div className="absolute inset-0 bg-gradient-primary opacity-95" />
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative grid gap-6 p-6 text-white sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge className="mb-3 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
              <Sparkles className="mr-1 h-3 w-3" /> Personalized for you
            </Badge>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Good morning, John 👋</h1>
            <p className="mt-2 max-w-xl text-white/80">You're doing great this week. Adherence is up 6% — keep the streak alive.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button className="rounded-xl bg-white text-primary hover:bg-white/90"><Pill className="mr-2 h-4 w-4" />Take medicine</Button>
              <Button asChild className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Link to="/ai-assistant"><Bot className="mr-2 h-4 w-4" />Open AI Assistant</Link>
              </Button>
              <Button asChild className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Link to="/reports"><FileText className="mr-2 h-4 w-4" />View report</Link>
              </Button>
              <Button className="rounded-xl border border-white/25 bg-red-400/20 text-white backdrop-blur hover:bg-red-400/30">
                <AlertTriangle className="mr-2 h-4 w-4" />Emergency SOS
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "Adherence", v: `${dashboardStats.adherence}%`, sub: "Today" },
              { k: "Next dose", v: dashboardStats.nextMedicine.name, sub: dashboardStats.nextMedicine.time },
              { k: "Risk score", v: dashboardStats.riskScore, sub: "Predicted 7d" },
              { k: "Pills left", v: dashboardStats.remainingPills, sub: "Metformin" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="text-[10px] uppercase tracking-widest text-white/70">{s.k}</div>
                <div className="mt-1 font-display text-2xl font-bold">{s.v}</div>
                <div className="text-xs text-white/70">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Activity} label="Adherence" value={`${dashboardStats.adherence}%`} hint="+6% vs last week" tone="primary" />
        <StatCard icon={Pill} label="Today's doses" value={`${dashboardStats.todaysDoses}/5`} hint="1 pending" tone="accent" />
        <StatCard icon={Flame} label="Weekly streak" value={dashboardStats.weeklyStreak} hint="Personal best" tone="warning" />
        <StatCard icon={XCircle} label="Missed doses" value={dashboardStats.missedDoses} hint="This week" tone="danger" />
        <StatCard icon={ShieldCheck} label="Risk" value={dashboardStats.riskScore} hint="AI predicted" tone="success" />
        <StatCard icon={Package} label="Inventory" value={dashboardStats.remainingPills} hint="Pills remaining" tone="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Weekly adherence</CardTitle>
            <Badge variant="outline" className="rounded-full text-xs">Last 7 days</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyAdherence}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220 90% 55%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(220 90% 55%)" stopOpacity={0} />
                </linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[70, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,.1)" }} />
                <Area type="monotone" dataKey="adherence" stroke="hsl(220 90% 55%)" strokeWidth={3} fill="url(#g1)" />
                <Line type="monotone" dataKey="target" stroke="hsl(280 75% 55%)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Next medication</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-gradient-primary p-5 text-primary-foreground">
              <div className="text-xs uppercase tracking-widest opacity-80">Coming up</div>
              <div className="mt-1 font-display text-2xl font-bold">Metformin 500mg</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold">08:42</span>
                <span className="text-sm opacity-80">until dose</span>
              </div>
              <Progress value={62} className="mt-4 bg-white/20" />
            </div>
            <Button className="w-full rounded-xl bg-gradient-primary"><Pill className="mr-2 h-4 w-4" /> Mark as taken</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Today's schedule</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-3 border-l-2 border-border/70 pl-5">
              {todaysSchedule.map((s, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[26px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-background ${s.status === "taken" ? "bg-success" : "bg-primary animate-pulse"}`} />
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div>
                      <div className="text-sm font-semibold">{s.name} <span className="text-xs text-muted-foreground">· {s.dosage}</span></div>
                      <div className="text-xs text-muted-foreground">{s.time}</div>
                    </div>
                    <Badge className={`rounded-full ${s.status === "taken" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>
                      {s.status === "taken" ? "Taken" : "Upcoming"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Reminder channels</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={reminderPie} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {reminderPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {reminderPie.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-muted-foreground">{r.name}</span>
                  <span className="ml-auto font-semibold">{r.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Monthly adherence</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyAdherence}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="taken" stackId="a" fill="hsl(220 90% 55%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="missed" stackId="a" fill="hsl(0 70% 60% / .5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">AI health tips</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { t: "Hydrate 15min before Metformin", w: "Improves absorption" },
              { t: "Try 10min walk after dinner", w: "Better glucose control" },
              { t: "Refill Atorvastatin in 5 days", w: "Auto-order available" },
            ].map((tip) => (
              <div key={tip.t} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-ai text-white"><Sparkles className="h-4 w-4" /></div>
                <div><div className="text-sm font-semibold">{tip.t}</div><div className="text-xs text-muted-foreground">{tip.w}</div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Risk prediction (14 days)</CardTitle>
            <Badge className="rounded-full bg-success/15 text-success">Low risk</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={riskPrediction}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Line type="monotone" dataKey="risk" stroke="hsl(220 90% 55%)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="hsl(280 75% 55%)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border/70 pl-5">
              {activity.slice(0, 5).map((a, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[26px] top-1 flex h-3 w-3 rounded-full ring-4 ring-background ${a.tone === "success" ? "bg-success" : a.tone === "danger" ? "bg-destructive" : a.tone === "accent" ? "bg-accent" : "bg-primary"}`} />
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

/* =========================== CAREGIVER =========================== */
function CaregiverDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-95" />
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-6 p-6 text-white sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge className="mb-3 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
              <HeartPulse className="mr-1 h-3 w-3" /> Monitoring
            </Badge>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Good morning, Sarah 💚</h1>
            <p className="mt-2 max-w-xl text-white/85">You're caring for <b>John Anderson</b>. He's on track today — 2 doses taken.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button className="rounded-xl bg-white text-emerald-700 hover:bg-white/90"><Phone className="mr-2 h-4 w-4" />Call patient</Button>
              <Button className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"><MessageCircle className="mr-2 h-4 w-4" />Message</Button>
              <Button className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"><Stethoscope className="mr-2 h-4 w-4" />Notify doctor</Button>
              <Button className="rounded-xl border border-white/25 bg-red-400/20 text-white backdrop-blur hover:bg-red-400/30"><AlertTriangle className="mr-2 h-4 w-4" />Emergency</Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="text-[10px] uppercase tracking-widest text-white/70">Patient</div>
            <div className="mt-1 font-display text-2xl font-bold">John Anderson</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-white/70 text-xs">Adherence</div><div className="font-bold">94%</div></div>
              <div><div className="text-white/70 text-xs">Last dose</div><div className="font-bold">8:02 AM</div></div>
              <div><div className="text-white/70 text-xs">Risk</div><div className="font-bold">Low</div></div>
              <div><div className="text-white/70 text-xs">Pills left</div><div className="font-bold">18</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Pill} label="Taken today" value="2/5" tone="primary" hint="On track" />
        <StatCard icon={ShieldCheck} label="Risk level" value="Low" tone="success" hint="Stable 7 days" />
        <StatCard icon={Battery} label="Bottle battery" value={`${sensorReadings.battery}%`} tone="warning" hint="~4 days left" />
        <StatCard icon={Package} label="Pills left" value={sensorReadings.pillCount} tone="accent" hint="Metformin" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Weekly adherence — John</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyAdherence}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(160 70% 45%)" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(160 70% 45%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Area type="monotone" dataKey="adherence" stroke="hsl(160 70% 45%)" strokeWidth={3} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Location & device</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400"><MapPin className="h-4 w-4" /><span className="font-semibold">Home · Kitchen</span></div>
              <div className="mt-1 text-xs text-muted-foreground">Detected 3 min ago via Smart Bottle</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" /><span className="font-semibold">Bottle #A2 — Online</span></div>
              <div className="mt-1 text-xs text-muted-foreground">Battery 82% · Signal excellent</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Emergency contacts</div>
              <div className="mt-1 text-sm">Dr. Priya Patel · +1 415 555 0198</div>
              <div className="text-sm">EMS · 911</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Upcoming medicines</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {todaysSchedule.filter((s) => s.status === "upcoming").map((s) => (
              <div key={s.name + s.time} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                <div><div className="text-sm font-semibold">{s.name} · {s.dosage}</div><div className="text-xs text-muted-foreground">{s.time}</div></div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Latest alerts & notifications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {notifications.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${n.type === "danger" ? "bg-destructive/15 text-destructive" : n.type === "warning" ? "bg-warning/15 text-warning" : n.type === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1"><div className="text-sm font-semibold">{n.title}</div><div className="text-xs text-muted-foreground">{n.body}</div></div>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">AI recommendations</CardTitle>
          <Badge className="rounded-full bg-gradient-ai text-white border-0"><Sparkles className="mr-1 h-3 w-3" />Powered by MediMind AI</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            "Schedule a check-in call this evening — John typically forgets Atorvastatin at night.",
            "Consider enabling voice reminders in Spanish for his caregiver.",
            "Refill Atorvastatin now to avoid a 2-day gap next week.",
          ].map((r) => (
            <div key={r} className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-ai text-white"><Sparkles className="h-4 w-4" /></div>
              {r}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================== DOCTOR =========================== */
function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-fuchsia-700 opacity-95" />
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-6 p-6 text-white sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge className="mb-3 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
              <Stethoscope className="mr-1 h-3 w-3" /> Clinical dashboard
            </Badge>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Welcome, Dr. Patel</h1>
            <p className="mt-2 max-w-xl text-white/85">4 critical alerts today · 12 patients need review · 6 appointments scheduled.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-white text-purple-700 hover:bg-white/90"><Link to="/patients"><Users className="mr-2 h-4 w-4" />View patients</Link></Button>
              <Button asChild className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"><Link to="/ai-assistant"><Bot className="mr-2 h-4 w-4" />Open AI Assistant</Link></Button>
              <Button asChild className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"><Link to="/reports"><FileText className="mr-2 h-4 w-4" />Generate report</Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "Patients", v: "138" },
              { k: "High risk", v: "12" },
              { k: "Avg adherence", v: "87%" },
              { k: "Appointments", v: "6" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="text-[10px] uppercase tracking-widest text-white/70">{s.k}</div>
                <div className="mt-1 font-display text-3xl font-bold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Total patients" value="138" tone="primary" hint="+4 this month" />
        <StatCard icon={AlertTriangle} label="High risk" value="12" tone="danger" hint="Needs review" />
        <StatCard icon={Activity} label="Avg adherence" value="87%" tone="success" hint="+2% w/w" />
        <StatCard icon={XCircle} label="Missed meds" value="34" tone="warning" hint="Today" />
        <StatCard icon={Clock} label="Appointments" value="6" tone="accent" hint="Today" />
        <StatCard icon={Sparkles} label="Critical alerts" value="4" tone="danger" hint="Live" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Patient roster</CardTitle>
          <div className="flex gap-2"><Badge variant="outline" className="rounded-full">All</Badge><Badge className="rounded-full bg-destructive/15 text-destructive">High risk</Badge></div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border/60"><th className="p-3 text-left">Patient</th><th className="p-3 text-left">Disease</th><th className="p-3 text-left">Medication</th><th className="p-3 text-left">Risk</th><th className="p-3 text-left">Adherence</th><th className="p-3 text-left">Last dose</th><th className="p-3 text-left">Status</th></tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.name} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-semibold">{p.name} <span className="text-xs text-muted-foreground">· {p.age}</span></td>
                  <td className="p-3 text-muted-foreground">{p.disease}</td>
                  <td className="p-3 text-muted-foreground">{p.medication}</td>
                  <td className="p-3"><Badge className={`rounded-full ${p.risk === "High" ? "bg-destructive/15 text-destructive" : p.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{p.risk}</Badge></td>
                  <td className="p-3"><div className="flex items-center gap-2"><Progress value={p.adherence} className="h-1.5 w-20" /><span className="text-xs font-semibold">{p.adherence}%</span></div></td>
                  <td className="p-3 text-muted-foreground">{p.lastDose}</td>
                  <td className="p-3"><Badge variant="outline" className="rounded-full">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Weekly compliance trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyAdherence.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="taken" fill="hsl(280 75% 55%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="missed" fill="hsl(0 70% 60% / .5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Risk distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart innerRadius="30%" outerRadius="90%" data={[
                { name: "High", value: 12, fill: "hsl(0 70% 60%)" },
                { name: "Medium", value: 38, fill: "hsl(38 90% 55%)" },
                { name: "Low", value: 88, fill: "hsl(160 70% 45%)" },
              ]}>
                <RadialBar dataKey="value" background cornerRadius={8} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">AI intervention suggestions</CardTitle>
          <Badge className="rounded-full bg-gradient-ai text-white border-0"><Sparkles className="mr-1 h-3 w-3" />AI</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { p: "Emma Wilson", s: "Consider switching to XR formulation — 4 missed evening doses this week." },
            { p: "Robert Kim", s: "Schedule pulmonary review — adherence dropped 18% after last visit." },
            { p: "Sofia Alvarez", s: "Enroll in caregiver program — social support correlated with +12% adherence." },
            { p: "James Carter", s: "Reduce Amlodipine dose — BP readings trending below 110 systolic." },
          ].map((s) => (
            <div key={s.p} className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="text-sm font-semibold">{s.p}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.s}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================== ADMIN =========================== */
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 to-orange-600 opacity-95" />
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-6 p-6 text-white sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge className="mb-3 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
              <ServerCog className="mr-1 h-3 w-3" /> Platform control
            </Badge>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Hospital admin console</h1>
            <p className="mt-2 max-w-xl text-white/85">12,840 users active · 8,420 devices connected · System uptime 99.4%.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-white text-rose-700 hover:bg-white/90"><Link to="/users"><UserPlus className="mr-2 h-4 w-4" />Manage users</Link></Button>
              <Button asChild className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"><Link to="/devices"><HardDrive className="mr-2 h-4 w-4" />Devices</Link></Button>
              <Button asChild className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"><Link to="/audit-logs"><ScrollText className="mr-2 h-4 w-4" />Audit logs</Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-white/70">System health</div><div className="mt-1 font-display text-3xl font-bold">99.4%</div><div className="text-xs text-white/70">All systems normal</div></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-white/70">Daily events</div><div className="mt-1 font-display text-3xl font-bold">48.2k</div><div className="text-xs text-white/70">+8% today</div></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-white/70">Devices online</div><div className="mt-1 font-display text-3xl font-bold">{platformStats.activeDevices.toLocaleString()}</div></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-white/70">Offline</div><div className="mt-1 font-display text-3xl font-bold">{platformStats.offlineDevices}</div></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={platformStats.totalUsers.toLocaleString()} tone="primary" hint="+312 this week" />
        <StatCard icon={Stethoscope} label="Doctors" value={platformStats.doctors} tone="accent" hint="Across 8 hospitals" />
        <StatCard icon={HeartPulse} label="Patients" value={platformStats.patients.toLocaleString()} tone="success" />
        <StatCard icon={HardDrive} label="Devices" value={platformStats.bottlesConnected.toLocaleString()} tone="warning" hint={`${platformStats.offlineDevices} offline`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Platform usage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={platformUsage}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(0 80% 60%)" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(0 80% 60%)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(30 90% 55%)" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(30 90% 55%)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Area type="monotone" dataKey="events" stroke="hsl(30 90% 55%)" strokeWidth={2} fill="url(#a2)" />
                <Area type="monotone" dataKey="users" stroke="hsl(0 80% 60%)" strokeWidth={2} fill="url(#a1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">System health</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { l: "API latency", v: "84 ms", tone: "success" },
              { l: "Device sync", v: "99.8%", tone: "success" },
              { l: "AI response", v: "1.2 s", tone: "success" },
              { l: "Notification delivery", v: "98.4%", tone: "success" },
              { l: "Storage", v: "62% used", tone: "warning" },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                <span>{r.l}</span>
                <Badge className={`rounded-full ${r.tone === "success" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{r.v}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Recent audit logs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {auditLogs.slice(0, 6).map((l, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${l.severity === "danger" ? "bg-destructive/15 text-destructive" : l.severity === "warning" ? "bg-warning/15 text-warning" : l.severity === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}><ScrollText className="h-4 w-4" /></div>
                <div className="flex-1"><div className="font-semibold">{l.actor}</div><div className="text-xs text-muted-foreground">{l.action} · {l.target}</div></div>
                <span className="text-xs text-muted-foreground">{l.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Top doctors</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {doctors.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white text-xs font-bold">{d.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{d.name}</div><div className="text-xs text-muted-foreground truncate">{d.specialty} · {d.patients} patients</div></div>
                <Badge variant="outline" className="rounded-full">★ {d.rating}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
