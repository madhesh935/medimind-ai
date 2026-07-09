import { createFileRoute } from "@tanstack/react-router";
import { Pill, Activity, Flame, XCircle, ShieldCheck, Package, Sparkles, Phone, PhoneCall, FileText, Clock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  activity,
  currentUser,
  dashboardStats,
  monthlyAdherence,
  reminderPie,
  riskPrediction,
  weeklyAdherence,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
        <div className="absolute inset-0 bg-gradient-primary opacity-95" />
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative grid gap-6 text-white lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge className="mb-3 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
              <Sparkles className="mr-1 h-3 w-3" /> Personalized for you
            </Badge>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              Good morning, {currentUser.firstName} 👋
            </h1>
            <p className="mt-2 max-w-xl text-white/80">
              You're doing great this week. Adherence is up 6% — keep the streak alive.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button className="rounded-xl bg-white text-primary hover:bg-white/90">
                <Pill className="mr-2 h-4 w-4" /> Take medicine
              </Button>
              <Button className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Sparkles className="mr-2 h-4 w-4" /> Talk to AI
              </Button>
              <Button className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <FileText className="mr-2 h-4 w-4" /> View report
              </Button>
              <Button className="rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <PhoneCall className="mr-2 h-4 w-4" /> Call doctor
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Activity} label="Adherence" value={`${dashboardStats.adherence}%`} hint="+6% vs last week" tone="primary" />
        <StatCard icon={Pill} label="Today's doses" value={`${dashboardStats.todaysDoses}/5`} hint="1 pending" tone="accent" />
        <StatCard icon={Flame} label="Weekly streak" value={dashboardStats.weeklyStreak} hint="Personal best" tone="warning" />
        <StatCard icon={XCircle} label="Missed doses" value={dashboardStats.missedDoses} hint="This week" tone="danger" />
        <StatCard icon={ShieldCheck} label="Risk" value={dashboardStats.riskScore} hint="AI predicted" tone="success" />
        <StatCard icon={Package} label="Inventory" value={dashboardStats.remainingPills} hint="Pills remaining" tone="primary" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Weekly adherence</CardTitle>
            <Badge variant="outline" className="rounded-full text-xs">Last 7 days</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyAdherence}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220 90% 55%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(220 90% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
          <CardHeader>
            <CardTitle className="text-base font-semibold">Reminder channels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={reminderPie} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {reminderPie.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Risk prediction (14 days)</CardTitle>
            <Badge className="rounded-full bg-success/15 text-success">Low risk</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Next medication</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
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
            <Button className="w-full rounded-xl bg-gradient-primary">
              <Pill className="mr-2 h-4 w-4" /> Mark as taken
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly adherence</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border/70 pl-5">
              {activity.map((a, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-background ${
                      a.tone === "success"
                        ? "bg-success"
                        : a.tone === "danger"
                          ? "bg-destructive"
                          : a.tone === "accent"
                            ? "bg-accent"
                            : "bg-primary"
                    }`}
                  />
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
